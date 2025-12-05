import { createGateway, generateText } from 'ai'
import { NextResponse } from 'next/server'

const gateway = createGateway({
  apiKey: process.env.AI_GATEWAY_API_KEY ?? '',
})

export async function POST(request: Request) {
  try {
    const { transactionType } = await request.json()

    const { text } = await generateText({
      model: gateway('google/gemini-2.0-flash-lite'),
      prompt: `List 6 most commonly used reasons worldwide for inventory ${transactionType} transactions in business inventory management.

Transaction type: ${transactionType}
${transactionType === 'stock-in' ? '(receiving/adding inventory)' : ''}
${transactionType === 'stock-out' ? '(removing/selling inventory)' : ''}
${transactionType === 'adjustment' ? '(correcting inventory counts)' : ''}

Requirements:
- Professional business terminology
- Short phrases (2-4 words each)
- Most common reasons used globally
- Return only the reasons, one per line
- No numbering, bullets, or extra formatting`,
    })

    const suggestions = text
      .split('\n')
      .map((s) => s.trim())
      .filter((s) => s.length > 0)
      .slice(0, 6)

    return NextResponse.json({ suggestions })
  } catch (error) {
    console.error('AI Reason Error:', error)
    return NextResponse.json({ error: 'Failed to generate suggestions' }, { status: 500 })
  }
}
