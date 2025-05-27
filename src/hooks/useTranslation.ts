import { useState } from 'react'

interface TranslationResult {
  text: string
  to: string
}

export const useTranslation = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const translate = async (text: string, from: string, to: string): Promise<string> => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text, from, to }),
      })

      if (!response.ok) {
        throw new Error('翻訳に失敗しました')
      }

      const data: TranslationResult = await response.json()
      return data.text
    } catch (err) {
      setError(err instanceof Error ? err.message : '翻訳中にエラーが発生しました')
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  return {
    translate,
    isLoading,
    error,
  }
} 