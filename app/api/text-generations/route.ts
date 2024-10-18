import { NextResponse } from "next/server"; 
import OpenAI from "openai";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const systemPrompt = `
You are a flashcard creator. Create exactly 10 flashcards from the provided queries, you are free to make whatever you like.
Each flashcard should have a question on the front and an answer on the back.
The front should be one sentence long.
The back should have full answers but reduced to your discretion, something a person can memorize and read in under 30 seconds.
Return the result in a JSON format:
{
  "flashcards":[
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
    return Math.max(1, Math.floor(10 / chunkCount));
}

export async function POST(req: Request) {
    const data = await req.text();

    try {
        const chunks = splitTextIntoChunks(data, 8000);
        const flashcards: Array<{ front: string; back: string }> = [];
        const chunkCount = chunks.length;
        const size = flashcardSize(chunkCount);

        while (flashcards.length < 10) { 
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

                    if (flashcards.length >= 10) {
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