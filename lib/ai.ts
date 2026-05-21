import { GoogleGenerativeAI } from '@google/generative-ai'

export async function generateProductDescription(title: string, category: string) {
  const apiKey = (process.env.GOOGLE_GENERATIVE_AI_API_KEY || '').trim()
  
  // Debug log (can be removed after it works)
  console.log('--- AI GENERATION ATTEMPT ---')
  console.log('API Key Debug:', apiKey.substring(0, 4) + '...' + apiKey.substring(apiKey.length - 4))

  if (!apiKey) {
    throw new Error('API Key is missing in .env.local')
  }

  try {
    // Initialize AI inside the function to ensure the latest API key is used
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

    const prompt = `
      You are a world-class copywriter for a digital asset marketplace called Assetra.
      Your task is to write a highly persuasive and professional product description for a digital asset.
      
      Product Title: ${title}
      Category: ${category}
      
      Requirements:
      1. Start with a catchy and emotional hook.
      2. Write 2-3 paragraphs of persuasive description.
      3. Include a "Key Features" section with bullet points (use emojis).
      4. Include a "What's Included" section.
      5. Add a "Perfect For" section.
      6. Use a premium, modern, and professional tone.
      7. Language: English (Global Market).
      
      Format the output as a clean text.
    `

    const result = await model.generateContent(prompt)
    const response = await result.response
    return response.text()
  } catch (error) {
    console.error('AI Generation Error:', error)
    throw new Error('Failed to generate AI content')
  }
}

export async function suggestPrice(title: string, category: string) {
  const apiKey = (process.env.GOOGLE_GENERATIVE_AI_API_KEY || '').trim()
  if (!apiKey) throw new Error('API Key is missing')

  try {
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

    const prompt = `
      As a pricing strategist for a premium digital marketplace, suggest an optimal price for this product:
      Title: ${title}
      Category: ${category}

      Requirements:
      1. Provide a price range (e.g., $19 - $35).
      2. Suggest a single best launch price.
      3. Give a 1-sentence reasoning.
      4. Language: English.

      Output JSON format:
      {
        "range": "string",
        "suggested": number,
        "reasoning": "string"
      }
    `

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()
    
    // Simple JSON extraction
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }
    throw new Error('Invalid AI response format')
  } catch (error) {
    console.error('AI Pricing Error:', error)
    throw new Error('Failed to suggest price')
  }
}

export async function suggestSmartTags(title: string, description: string, category: string) {
  const apiKey = (process.env.GOOGLE_GENERATIVE_AI_API_KEY || '').trim()
  if (!apiKey) throw new Error('API Key is missing')

  try {
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

    const prompt = `
      You are an SEO expert for a digital product marketplace. Generate 8-10 highly relevant tags/keywords for this product to maximize discoverability.
      Title: ${title}
      Description: ${description.substring(0, 500)}
      Category: ${category}

      Requirements:
      1. Tags should be short (1-3 words).
      2. Relevant to the niche.
      3. Mix of broad and long-tail keywords.
      4. Return only a comma-separated list of tags.

      Example output: UI Kit, Dashboard, React Components, SaaS Design
    `

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()
    
    return text.split(',').map(tag => tag.trim()).filter(Boolean)
  } catch (error) {
    console.error('AI Tags Error:', error)
    throw new Error('Failed to suggest tags')
  }
}
