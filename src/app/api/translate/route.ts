import { NextRequest, NextResponse } from 'next/server'

const TRANSLATOR_ENDPOINT = 'https://api.cognitive.microsofttranslator.com'
const TRANSLATOR_LOCATION = 'japaneast' // リージョンを指定

export async function POST(req: NextRequest) {
  try {
    const { text, from, to } = await req.json()

    if (!text || !from || !to) {
      return NextResponse.json(
        { error: 'テキスト、元の言語、翻訳先の言語を指定してください' },
        { status: 400 }
      )
    }

    const response = await fetch(
      `${TRANSLATOR_ENDPOINT}/translate?api-version=3.0&from=${from}&to=${to}`,
      {
        method: 'POST',
        headers: {
          'Ocp-Apim-Subscription-Key': process.env.MICROSOFT_TRANSLATOR_KEY!,
          'Ocp-Apim-Subscription-Region': TRANSLATOR_LOCATION,
          'Content-type': 'application/json',
        },
        body: JSON.stringify([{ text }]),
      }
    )

    if (!response.ok) {
      const errorText = await response.text();
      console.error('翻訳APIレスポンスエラー:', errorText);
      throw new Error('翻訳APIの呼び出しに失敗しました: ' + errorText);
    }

    const data = await response.json()
    return NextResponse.json(data[0].translations[0])
  } catch (error) {
    console.error('翻訳エラー:', error)
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    )
  }
} 