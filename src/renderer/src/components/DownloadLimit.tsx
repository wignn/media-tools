"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useTheme } from "../contexts/theme-context"



function DownloadLimit() {
  const [inputValue, setInputValue] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)
  const { isDarkMode } = useTheme()

  useEffect(() => {
    window.api
      ?.getDownloadLimit()
      .then((storedLimit) => {
        if (storedLimit != null) {
          const num = Number(storedLimit)
          setInputValue(num.toString())
        }
      })
      .catch((error) => {
        console.error("Failed to get download limit:", error)
        alert("Error: Failed to load download limit.")
      })
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const parsed = parseInt(inputValue.trim(), 10)

    if (isNaN(parsed)) {
      alert("Limit harus berupa angka.")
      return
    }

    setIsLoading(true)
    try {
      await window.api?.setDownloadLimit(parsed.toString())
      setInputValue(parsed.toString())
      alert(`Download limit set to ${parsed} Kbps.`)
    } catch (error) {
      console.error("Failed to update download limit:", error)
      alert("Error: Failed to update download limit. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div>
      <div style={{ marginBottom: "1rem" }}>
        <h3
          style={{
            fontSize: "1.25rem",
            fontWeight: "600",
            color: isDarkMode ? "#ffffff" : "#1f2937",
          }}
        >
          Set Download Limit
        </h3>
        <p
          style={{
            fontSize: "0.875rem",
            color: isDarkMode ? "#9ca3af" : "#6b7280",
          }}
        >
          Configure the maximum download speed for your application.
        </p>
      </div>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
          <label
            htmlFor="limit"
            style={{
              fontSize: "0.875rem",
              fontWeight: "500",
              color: isDarkMode ? "#ffffff" : "#1f2937",
            }}
          >
            Download Limit (Kbps)
          </label>
          <input
            id="limit"
            type="text"
            inputMode="numeric"
            value={inputValue}
            disabled={isLoading}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="e.g., 1000"
            style={{
              borderRadius: "0.375rem",
              border: `1px solid ${isDarkMode ? "#4b5563" : "#d1d5db"}`,
              background: isDarkMode ? "#374151" : "#ffffff",
              padding: "0.5rem 0.75rem",
              fontSize: "0.875rem",
              color: isDarkMode ? "#ffffff" : "#1f2937",
              opacity: isLoading ? 0.5 : 1,
            }}
          />
        </div>
        <button
          type="submit"
          disabled={isLoading}
          style={{
            borderRadius: "0.375rem",
            background: isDarkMode ? "#6366f1" : "#4f46e5",
            padding: "0.5rem 1rem",
            fontSize: "0.875rem",
            fontWeight: "500",
            color: "#ffffff",
            opacity: isLoading ? 0.5 : 1,
            cursor: isLoading ? "not-allowed" : "pointer",
          }}
        >
          {isLoading ? "Updating..." : "Set Limit"}
        </button>
      </form>
      <p
        style={{
          marginTop: "1rem",
          fontSize: "0.75rem",
          color: isDarkMode ? "#9ca3af" : "#6b7280",
        }}
      >
        Changes will take effect immediately.
      </p>
    </div>
  )
}

export default DownloadLimit
