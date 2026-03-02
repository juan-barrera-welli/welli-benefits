import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI, Type } from "@google/genai";

// We do not initialize globally to avoid crash during build if env var is missing.

const findProvidersFunction = {
    name: "findProviders",
    description: "Busca aliados médicos (clínicas, doctores) basados en las preferencias del usuario. Llámala SOLAMENTE cuando tengas claro el procedimiento/especialidad, la ciudad y la zona/barrio. Retornará siempre una confirmación de éxito o fracaso.",
    parameters: {
        type: Type.OBJECT,
        properties: {
            procedure: {
                type: Type.STRING,
                description: "El procedimiento médico o especialidad (ej. Odontología, Pediatría, Limpieza dental).",
            },
            city: {
                type: Type.STRING,
                description: "La ciudad donde el usuario busca el servicio (ej. Bogotá, Medellín).",
            },
            zone: {
                type: Type.STRING,
                description: "La zona, barrio o sector específico de la ciudad (ej. Norte, Chapinero, Poblado).",
            },
        },
        required: ["procedure", "city", "zone"],
    },
};

const SYSTEM_INSTRUCTION = `
Eres Claud.ia ✨, la asistente virtual premium y experta en salud de Welli Benefits. 
Tu misión es ayudar a los usuarios a encontrar el aliado médico o clínica ideal para sus necesidades.

REGLAS ESTRICTAS:
1. Actúa siempre de manera profesional, empática, y concisa.
2. Para encontrar opciones, necesitas TRES datos: 
   - El procedimiento o especialidad.
   - La ciudad.
   - La zona o sector dentro de la ciudad.
3. PREGUNTA SOLO UN DATO A LA VEZ. No agobies al usuario. Si te dicen el procedimiento, pregunta la ciudad. Si te dicen la ciudad, pregunta la zona.
4. Una vez que tengas los tres datos, ESTÁS OBLIGADA a llamar a la herramienta/función "findProviders" pasándole esos tres datos. 
5. Si la función retorna "success", agradécele al usuario y dile que arriba de este mensaje puede ver las opciones.
6. NUNCA inventes nombres de clínicas ni direcciones. Tu única fuente de verdad es la función findProviders.
`;

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { messages } = body;

        if (!messages || !Array.isArray(messages)) {
            return NextResponse.json({ error: "Invalid messages format" }, { status: 400 });
        }

        if (!process.env.GEMINI_API_KEY) {
            return NextResponse.json({ error: "GEMINI_API_KEY is missing." }, { status: 500 });
        }

        // Format previous messages for AI Studio
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const formattedMessages = messages.map((msg: any) => {
            // Handle function call responses from previous turns if any
            if (msg.functionResponse) {
                return {
                    role: "user",
                    parts: [{
                        functionResponse: {
                            name: "findProviders",
                            response: { name: "findProviders", content: msg.functionResponse }
                        }
                    }]
                };
            }

            if (msg.functionCall) {
                return {
                    role: "model",
                    parts: [{
                        functionCall: {
                            name: "findProviders",
                            args: msg.functionCall
                        }
                    }]
                };
            }

            return {
                role: msg.sender === "user" ? "user" : "model",
                parts: [{ text: msg.text || "..." }],
            };
        });

        // Ensure we only pass text if it's a standard text request, else pass the parts 
        // to handle function responses seamlessly.
        const lastMessage = formattedMessages.pop();
        if (!lastMessage) {
            return NextResponse.json({ error: "Empty request" }, { status: 400 });
        }

        const requestParts = (lastMessage.parts[0] && "text" in lastMessage.parts[0])
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ? (lastMessage.parts[0] as any).text
            : lastMessage.parts;

        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        const properChat = ai.chats.create({
            model: "gemini-2.5-flash",
            config: {
                systemInstruction: SYSTEM_INSTRUCTION,
                tools: [{ functionDeclarations: [findProvidersFunction] }]
            },
            history: formattedMessages
        });

        const response = await properChat.sendMessage({ message: requestParts });

        const functionCall = response.functionCalls?.[0];

        if (functionCall && functionCall.name === "findProviders") {
            // The model wants to search for providers
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const args = functionCall.args as any;
            return NextResponse.json({
                type: "tool_call",
                functionCall: {
                    name: "findProviders",
                    args: {
                        procedure: args.procedure,
                        city: args.city,
                        zone: args.zone
                    }
                },
                text: "Buscando las mejores opciones para ti..."
            });
        }

        // Normal text response
        const textResponse = response.text || "Lo siento, tuve un problema al procesar tu mensaje.";

        return NextResponse.json({
            type: "text",
            text: textResponse,
        });

    } catch (error: unknown) {
        const err = error as Error;
        console.error("Error in AI Studio Chat API:", err);
        return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
    }
}
