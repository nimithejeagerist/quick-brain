import { NextResponse } from "next/server"; 
import OpenAI from "openai";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const systemPrompt = `
You are an expert flashcard creator focused on deep learning and understanding. Your task is to create exactly 20 unique and insightful flashcards from the provided content.

Follow these strict guidelines:
1. Each flashcard must be unique - never repeat questions or similar concepts
2. Front side: Create clear, specific questions that test understanding rather than mere recall
3. Back side: Provide comprehensive but concise answers (readable in 30 seconds) that explain the core concept
4. Cover a mix of:
   - Key concepts and definitions
   - Cause and effect relationships
   - Compare and contrast questions
   - Real-world applications
   - Problem-solving scenarios
5. Ensure progressive difficulty, from foundational to more complex concepts
6. Use precise language and avoid vague terms

Return the result in this JSON format:
{
  "flashcards": [
    {
      "front": "Front of the card",
      "back": "Back of the card"
    }
  ]
}
`;

function splitTextIntoChunks(text: string, maxTokens: number): string[] {
    const chunks = [];
    let currentChunk = '';

    const sentences = text.split('. ');

    sentences.forEach(sentence => {
        if ((currentChunk + sentence).length < maxTokens) {
            currentChunk += sentence + '. ';
        } else {
            chunks.push(currentChunk);
            currentChunk = sentence + '. ';
        }
    });

    if (currentChunk.length > 0) {
        chunks.push(currentChunk);
    }

    return chunks;
}

function cleanResponse(response: string): string {
    response = response.trim();
    if (response.startsWith("```json")) {
        response = response.slice(7); // Remove the ```json part
    }
    if (response.endsWith("```")) {
        response = response.slice(0, -3); // Remove the ending ```
    }
    return response.trim();
}

function flashcardSize(chunkCount: number): number {
    return Math.max(1, Math.floor(20 / chunkCount));
}

export async function POST(req: Request) {
    const data = await req.text();

    try {
        const chunks = splitTextIntoChunks(data, 8000);
        const flashcards: Array<{ front: string; back: string }> = [];
        const chunkCount = chunks.length;
        const size = flashcardSize(chunkCount);

        while (flashcards.length < 20) { 
            for (const chunk of chunks) {
                const completion = await openai.chat.completions.create({
                    model: "gpt-3.5-turbo",
                    messages: [
                        { role: "system", content: systemPrompt },
                        { role: "user", content: chunk }
                    ],
                });

                let content = completion.choices[0].message.content;

                if (!content) {
                    continue; 
                }

                // Clean the response to remove any extraneous characters
                content = cleanResponse(content);

                try {
                    const result = JSON.parse(content);
                    for (let i = 0; i < size; i++) {
                        if (result.flashcards[i]) {
                            flashcards.push(result.flashcards[i]);
                        }
                    }

                    if (flashcards.length >= 20) {
                        break;
                    }
                } catch (err) {
                    console.error("Error parsing JSON:", err, "Content:", content);
                }
            }
        }

        if (flashcards.length === 0) {
            return NextResponse.json({ error: "Failed to generate flashcards (Flashcards length is zero)" }, { status: 500 });
        }

        // Return flashcards in the desired format
        return NextResponse.json({ flashcards: flashcards });
    } catch (error) {
        console.error("Error creating chat completion:", error);
        return NextResponse.json({ error: "Failed to generate flashcards" }, { status: 500 });
    }
}