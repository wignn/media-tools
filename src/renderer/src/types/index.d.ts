declare module 'ruhend-scraper' {
  export function ttdl(url: string): Promise<any>;
  export function igdl(url: string): Promise<any>;
  export function fbdl(url: string): Promise<any>;
  export function ytmp3(url: string, path: string): Promise<any>;
  export function ytmp4(url: string, path: string): Promise<any>;
  export function ytsearch(query: string): Promise<any>;
}
