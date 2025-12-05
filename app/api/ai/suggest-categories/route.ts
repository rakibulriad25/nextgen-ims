import { createGateway, generateText } from 'ai'
import { NextResponse } from 'next/server'

const gateway = createGateway({
  apiKey: process.env.AI_GATEWAY_API_KEY ?? '',
})

export async function POST(request: Request) {
  try {
    const { existingCategories, inputText } = await request.json()

    const { text } = await generateText({
      model: gateway('google/gemini-2.0-flash-lite'),
      prompt: `Suggest 5 popular inventory category names for a business inventory management system.
${existingCategories?.length > 0 ? `Already existing categories: ${existingCategories.join(', ')}` : ''}
${inputText ? `User is typing: ${inputText}` : ''}

Requirements:
- Suggest common business inventory categories
- Do not repeat existing categories
- Categories should be single words or short phrases (2-3 words max)
- Return only category names, one per line
- No numbering, bullets, or extra formatting`,
    })

    const suggestions = text
      .split('\n')
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && !existingCategories?.includes(s))
      .slice(0, 5)

    return NextResponse.json({ suggestions })
  } catch (error) {
    console.error('AI Category Error:', error)
    return NextResponse.json({ error: 'Failed to generate suggestions' }, { status: 500 })
  }
}
