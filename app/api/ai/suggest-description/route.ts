import { createGateway, generateText } from 'ai'
import { NextResponse } from 'next/server'

const gateway = createGateway({
  apiKey: process.env.AI_GATEWAY_API_KEY ?? '',
})

export async function POST(request: Request) {
  try {
    const { productName, categoryName } = await request.json()

    if (!productName) {
      return NextResponse.json({ error: 'Product name is required' }, { status: 400 })
    }

    const { text } = await generateText({
      model: gateway('google/gemini-2.0-flash-lite'),
      prompt: `Generate a concise, professional product description (3-4 sentences, max 200 characters).
Product Name: ${productName}
${categoryName ? `Category: ${categoryName}` : ''}

Requirements:
- Focus on key features and benefits
- Keep it professional and suitable for business inventory
- Do not include pricing or promotional language
- Return only the description text, no quotes or extra formatting`,
    })

    return NextResponse.json({ description: text.trim() })
  } catch (error) {
    console.error('AI Description Error:', error)
    return NextResponse.json({ error: 'Failed to generate description' }, { status: 500 })
  }
}
