import { NextResponse } from "next/server";
import { ImageAnnotatorClient } from "@google-cloud/vision";

// Initialize the Cloud Vision client
const vision = new ImageAnnotatorClient({
    keyFilename: JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS || '{}'),
});

export async function POST(req: Request) {
    try {
        const formData = await req.formData();
        const imageFile = formData.get('image') as File;

        if (!imageFile) {
            return NextResponse.json({ 
                error: "No image file provided",
                details: "Please upload an image file"
            }, { status: 400 });
        }

        if (imageFile.size > 10 * 1024 * 1024) {
            return NextResponse.json({
                error: "File too large",
                details: "Image must be less than 10MB"
            }, { status: 400 });
        }

        const arrayBuffer = await imageFile.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const [result] = await vision.documentTextDetection(buffer);
        const fullTextAnnotation = result.fullTextAnnotation;

        if (!fullTextAnnotation) {
            return NextResponse.json({
                error: "No text detected",
                details: "Could not detect any text in the provided document"
            }, { status: 400 });
        }

        const extractedText = fullTextAnnotation.text;

        if (!extractedText || !extractedText.trim()) {
            return NextResponse.json({
                error: "No text extracted",
                details: "Could not extract any meaningful text from the provided document"
            }, { status: 400 });
        }

        return NextResponse.json({ text: extractedText });

    } catch (error) {
        console.error("Error in document text extraction:", error);
        return NextResponse.json({ 
            error: "Failed to extract text",
            details: error instanceof Error ? error.message : "Unknown error occurred",
            timestamp: new Date().toISOString()
        }, { status: 500 });
    }
}


