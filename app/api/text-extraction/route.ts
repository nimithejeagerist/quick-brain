import { NextResponse } from "next/server";
import { ImageAnnotatorClient } from "@google-cloud/vision";

const credentials = {
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY,
    project_id: process.env.GOOGLE_PROJECT_ID
};

// Debug log to check our credentials
console.log('Credential check:', {
    hasClientEmail: !!credentials.client_email,
    hasPrivateKey: !!credentials.private_key,
    hasProjectId: !!credentials.project_id,
    // Log the first few characters of the private key to check format
    privateKeyStart: credentials.private_key?.substring(0, 50)
});

// Initialize the Cloud Vision client
const vision = new ImageAnnotatorClient({
    credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        project_id: process.env.GOOGLE_PROJECT_ID
    },
    apiEndpoint: 'vision.googleapis.com',
    fallback: 'rest',
    projectId: process.env.GOOGLE_PROJECT_ID
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

        // Validate file size (10MB limit)
        if (imageFile.size > 10 * 1024 * 1024) {
            return NextResponse.json({
                error: "File too large",
                details: "Image must be less than 10MB"
            }, { status: 400 });
        }

        // Convert File to Buffer
        const arrayBuffer = await imageFile.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Perform document text detection using Cloud Vision API
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
