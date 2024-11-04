import { openai } from '@ai-sdk/openai'
import { generateText, generateObject } from 'ai'
import { z } from 'zod'

interface SchemaDefinition {
  outputType: 'object' | 'array' | 'enum'
  properties?: Array<{
    name: string
    type: 'string' | 'number' | 'boolean' | 'string[]'
    description?: string
  }>
  enumValues?: string[]
}

interface GenerateRequest {
  prompt: string
  generateType: 'text' | 'object'
  temperature?: number
  maxTokens?: number
  schemaDefinition?: SchemaDefinition
}

export async function POST(req: Request) {
  try {
    const { 
      prompt, 
      generateType, 
      temperature = 0.7, 
      maxTokens = 1000, 
      schemaDefinition 
    } = await req.json() as GenerateRequest

    console.log('\n=== OpenAI API Request ===')
    console.log('Generate Type:', generateType)
    console.log('Prompt:', prompt)
    console.log('Temperature:', temperature)
    console.log('Max Tokens:', maxTokens)
    console.log('Schema Definition:', schemaDefinition)

    if (!prompt) {
      return new Response(
        JSON.stringify({ error: 'Prompt is required' }), 
        { status: 400 }
      )
    }

    const model = openai('gpt-4o-2024-08-06')

    if (generateType === 'text') {
      console.log('\nMaking generateText call')
      const response = await generateText({
        model,
        prompt,
        temperature,
        maxTokens,
      })

      return new Response(response.text)
    }

    if (!schemaDefinition) {
      return new Response(
        JSON.stringify({ error: 'Schema definition is required for object generation' }),
        { status: 400 }
      )
    }

    // Handle enum generation
    if (schemaDefinition.outputType === 'enum') {
      if (!schemaDefinition.enumValues?.length) {
        return new Response(
          JSON.stringify({ error: 'Enum values are required for enum generation' }),
          { status: 400 }
        )
      }

      console.log('\nMaking generateObject enum call')
      const response = await generateObject({
        model,
        messages: [{ role: 'user', content: prompt }],
        temperature,
        maxTokens,
        output: 'enum',
        enum: schemaDefinition.enumValues,
      })

      return new Response(
        JSON.stringify({ result: response.object }),
        { headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Create the object schema
    const objectSchema = z.object(
      Object.fromEntries(
        schemaDefinition.properties?.map(prop => [
          prop.name,
          prop.type === 'string' ? z.string() :
          prop.type === 'number' ? z.number() :
          prop.type === 'boolean' ? z.boolean() :
          prop.type === 'string[]' ? z.array(z.string()) :
          z.string()
        ]) ?? []
      )
    )

    // Handle array generation
    if (schemaDefinition.outputType === 'array') {
      console.log('\nMaking generateObject array call')
      const response = await generateObject({
        model,
        messages: [{ role: 'user', content: prompt }],
        temperature,
        maxTokens,
        output: 'array',
        schema: objectSchema,
      })

      return new Response(
        JSON.stringify({ result: response.object }),
        { headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Handle regular object generation
    console.log('\nMaking generateObject call')
    const response = await generateObject({
      model,
      messages: [{ role: 'user', content: prompt }],
      temperature,
      maxTokens,
      schema: objectSchema,
    })

    return new Response(
      JSON.stringify({ result: response.object }),
      { headers: { 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Generation error:', error)
    
    if (error instanceof z.ZodError) {
      return new Response(
        JSON.stringify({ 
          error: 'Schema validation failed', 
          details: error.errors 
        }),
        { status: 400 }
      )
    }

    return new Response(
      JSON.stringify({ 
        error: 'Failed to generate response',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500 }
    )
  }
} 
