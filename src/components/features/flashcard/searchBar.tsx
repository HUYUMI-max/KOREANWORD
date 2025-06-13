"use client"

import { useState, useEffect } from "react"
import { Input } from "../../ui/input"

interface SearchBarProps {
  onSearch: (keyword: string) => void
}

export default function SearchBar({ onSearch }: SearchBarProps) {
  const [searchValue, setSearchValue] = useState("")

  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(searchValue)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchValue, onSearch])

  return (
    <div className="w-full max-w-md mx-auto my-4">
      <Input
        type="text"
        placeholder="🔍 単語を検索（例: 먹다）"
        className="w-full shadow-sm focus:ring-indigo-500"
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
      />
    </div>
  )
}