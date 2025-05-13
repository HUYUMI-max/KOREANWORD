"use client"

import { Input } from "../../ui/input"

interface SearchBarProps {
  onSearch: (keyword: string) => void
}

export default function SearchBar({ onSearch }: SearchBarProps) {
  return (
    <div className="w-full max-w-md mx-auto my-4">
      <Input
        type="text"
        placeholder="🔍 単語を検索（例: 먹다）"
        className="w-full shadow-sm focus:ring-indigo-500"
        onChange={(e) => onSearch(e.target.value)}
      />
    </div>
  )
}