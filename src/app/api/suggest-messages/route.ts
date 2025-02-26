import { GoogleGenerativeAI } from "@google/generative-ai";
import { z } from "zod";

// Interface for response data
interface MessageResponse {
  success: boolean;
  messages?: string[];
  error?: string;
}

// Validate environment variables
const envSchema = z.object({
  GEMINI_API_KEY: z.string().min(1),
});

envSchema.parse(process.env);

// Cache model instance outside the function
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash",
  generationConfig: {
    temperature: 0.9,
    topP: 1,
  },
});

// Define prompts separately for maintainability
const PROMPT_TEMPLATE = `
Generate five unique, constructive feedback messages for anonymous submission.
Format requirements:
- One message per line
- Separate messages with "$" symbol
- Keep messages under 140 characters
- Make them realistic and varied
- Avoid any markdown formatting

Example format:
Message 1$Message 2$Message 3
`;

export async function POST() {
  try {
    const result = await model.generateContent(PROMPT_TEMPLATE);
    const text = result.response.text();
    
    if (!text) {
      throw new Error("No content generated");
    }

    // Process messages with validation and cleaning
    const messages = text
      .split("$")
      .map(msg => msg.trim())
      .filter(msg => msg.length > 0);

    if (messages.length === 0) {
      throw new Error("Invalid message format received");
    }

    const response: MessageResponse = {
      success: true,
      messages: messages.slice(0, 5), // Ensure max 5 messages
    };

    return Response.json(response, { status: 200 });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error 
      ? error.message 
      : "Failed to generate feedback messages";

    console.error("Feedback generation error:", error);
    
    const response: MessageResponse = {
      success: false,
      error: errorMessage,
    };

    return Response.json(response, { 
      status: 500,
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      }
    });
  }
}