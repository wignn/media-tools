export type DownloadHandler = (item: QueueItem) => Promise<void>

export interface QueueItem {
  id: string
  url: string
  type: string
  downloadPath: string
  status: string
  percent: number
  isDownloading: boolean
  userRef?: string
  title?: string
  retries?: number
  limit?: number
  eta?: string
  speed?: string
}

export class QueueManager {
  private queue: QueueItem[] = []
  private isProcessing = false
  private onChange: (queue: QueueItem[]) => void = () => {}
  private activeItem: QueueItem | null = null
  private handler: DownloadHandler

  constructor(handler: DownloadHandler) {
    this.handler = handler
  }

  /**
   * Subscribes a callback function to listen for queue changes.
   * @param fn The callback function that receives the updated queue.
   */
  subscribe(fn: (queue: QueueItem[]) => void) {
    this.onChange = fn
    this.onChange([...this.queue])
  }

  /**
   * Adds a new item to the download queue.
   * Prevents adding duplicate URLs that are not in 'Error' or 'Selesai' status.
   * @param item The QueueItem to add.
   */
  add(item: QueueItem) {
    const exists = this.queue.find(
      (q) => q.url === item.url && q.status !== 'Error' && q.status !== 'Selesai'
    )
    if (exists) {
      console.warn('Item already in queue or completed:', item.url)
      return
    }

    this.queue.push({ ...item, status: 'Pending', percent: 0, isDownloading: false, retries: 0 })
    this.onChange([...this.queue])
    this.process()
  }

  /**
   * Internal method to process the next item in the queue.
   * Ensures only one item is processed at a time.
   */
  private async process() {
    if (this.isProcessing) return

    const next = this.queue.find((q) => q.status === 'Pending')
    if (!next) return

    this.activeItem = next
    this.update(next.id, { status: 'Downloading', isDownloading: true })
    this.isProcessing = true

    try {
      await this.handler(next)
      this.update(next.id, { status: 'Selesai', percent: 100, isDownloading: false })
    } catch (err: any) {
      const retries = next.retries ?? 0
      console.error('Download failed for item:', next.id, err)

      if (retries < 3) {
        this.update(next.id, {
          status: 'Pending',
          isDownloading: false,
          retries: retries + 1
        })
      } else {
        this.update(next.id, {
          status: `Error: ${err.message || err}`,
          isDownloading: false
        })
      }
    } finally {
      this.isProcessing = false
      this.activeItem = null
      setTimeout(() => this.process(), 500)
    }
  }

  /**
   * Updates an item in the queue by its ID.
   * @param id The ID of the item to update.
   * @param updates Partial updates to apply to the item.
   */
  update(id: string, updates: Partial<QueueItem>) {
    this.queue = this.queue.map((q) => {
      const updated = q.id === id ? { ...q, ...updates } : q
      if (this.activeItem && this.activeItem.id === id) {
        this.activeItem = updated
      }

      return updated
    })
    this.onChange([...this.queue])
  }

  /**
   * Returns the currently active download item.
   * @returns The active QueueItem or null if none is active.
   */
  getActiveItem() {
    console.log('Current active item:', this.activeItem)
    return this.activeItem
  }

  /**
   * Clears all completed or error items from the queue.
   */
  clearCompletedOrErrors() {
    this.queue = this.queue.filter(
      (item) => item.status !== 'Selesai' && !item.status.startsWith('Error')
    )
    this.onChange([...this.queue])
  }

  /**
   * Retries a specific item in the queue manually.
   * @param id The ID of the item to retry.
   */

  retry(id: string) {
    this.update(id, {
      status: 'Pending',
      percent: 0,
      isDownloading: false,
      retries: 0
    })
    this.process()
  }

  reset() {
    this.queue = []
    this.isProcessing = false
    this.activeItem = null
    this.onChange([...this.queue])
  }
}
