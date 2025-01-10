import { NextResponse } from "next/server"; 
import OpenAI from "openai";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const systemPrompt = `
You are an expert educator and flashcard creator specializing in optimizing learning through spaced repetition.

Your task is to create exactly 20 high-quality flashcards from the provided text that will maximize learning retention.

Guidelines for creating exceptional flashcards:
- Each flashcard should focus on one key concept, fact, or relationship
- Questions should promote active recall and critical thinking
- Answers should be clear, concise and comprehensive
- Use a mix of question types: definitions, comparisons, applications, and cause-effect relationships
- Ensure progressive difficulty from foundational to advanced concepts
- Avoid yes/no questions in favor of "how" and "why" questions
- Both front and back should be clear and concise, ideally one sentence
- Include real-world examples and applications where relevant

Return the flashcards in this JSON format:
{
  "flashcards": [
    {
      "front": "Question that promotes active recall",
      "back": "Clear, concise answer"
    }
  ]
}

Aim to create flashcards that will truly enhance understanding and long-term retention of the material.
`;

interface Flashcard {
    front: string;
    back: string;
}

interface FlashcardResponse {
    flashcards: Flashcard[];
}

export async function POST(req: Request) {
    try {
        const { textGenerated } = await req.json();

        if (!textGenerated || typeof textGenerated !== 'string') {
            return NextResponse.json({ 
                error: "Invalid or missing text input",
                details: "Please provide valid text content for flashcard generation"
            }, { status: 400 });
        }

        if (textGenerated.trim().length < 50) {
            return NextResponse.json({
                error: "Insufficient content",
                details: "Please provide more detailed text for meaningful flashcard generation"
            }, { status: 400 });
        }

        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: textGenerated }
            ],
            temperature: 0.7,
            max_tokens: 2000,
        });
        
        const content = completion.choices[0].message.content;

        if (!content) {
            throw new Error("No content generated from OpenAI");
        }

        try {
            const flashcards = JSON.parse(content) as FlashcardResponse;
            
            if (!flashcards || typeof flashcards !== 'object') {
                throw new Error("OpenAI response is not a valid JSON object");
            }

            if (!flashcards.flashcards || !Array.isArray(flashcards.flashcards)) {
                throw new Error("Invalid flashcard format returned");
            }

            console.log(`Received ${flashcards.flashcards.length} flashcards`);

            const validFlashcards = flashcards.flashcards.every((card: Flashcard) => 
                card && typeof card === 'object' &&
                'front' in card && 'back' in card &&
                typeof card.front === 'string' &&
                typeof card.back === 'string'
            );

            if (!validFlashcards) {
                throw new Error("Some flashcards are missing required fields or have invalid format");
            }

            return NextResponse.json(flashcards.flashcards);
        } catch (parseError) {
            console.error("JSON parsing error:", parseError);
            console.error("Raw content received:", content);
            return NextResponse.json({ 
                error: "Failed to parse generated flashcards",
                details: parseError instanceof Error ? parseError.message : "Unknown parsing error",
                rawContent: content.substring(0, 500)
            }, { status: 500 });
        }

    } catch (error) {
        console.error("Error in flashcard generation:", error);
        return NextResponse.json({ 
            error: "Failed to generate flashcards",
            details: error instanceof Error ? error.message : "Unknown error occurred",
            timestamp: new Date().toISOString()
        }, { status: 500 });
    }
}