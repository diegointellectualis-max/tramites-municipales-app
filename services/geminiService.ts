import { GoogleGenAI } from "@google/genai";
import { Message } from "../types.ts";

// Clave API configurada explícitamente para despliegue directo en Vercel
const API_KEY = "AIzaSyACOTIFmKBdliG4zeCmml10iQznJONuxBI";
const ai = new GoogleGenAI({ apiKey: API_KEY });

const SYSTEM_INSTRUCTION = `
Eres el "Asistente Virtual de Trámites Municipales" de una alcaldía en Colombia. 
Tu objetivo es ayudar a los ciudadanos a entender qué trámites necesitan, cuáles son los requisitos generales según la ley colombiana (como el Decreto Ley 019 de 2012 - Ley Antitrámites) y cómo usar esta plataforma.

Información clave que conoces:
1. Áreas: Planeación, Gobierno, Hacienda, Salud, Tránsito, Inspección de Policía.
2. Trámites comunes: Impuesto Predial, Industria y Comercio, SISBÉN, Licencias de Construcción, Multas de Tránsito.
3. El usuario puede buscar su trámite usando un número de radicado como "RAD-2024-001".

Sé amable, profesional y usa un lenguaje claro. Si no sabes algo específico, sugiere al ciudadano acercarse a la oficina física o consultar el sitio web oficial de la alcaldía.
Responde siempre en español.
`;

export const chatWithGemini = async (history: Message[], userInput: string) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        { role: "user", parts: [{ text: SYSTEM_INSTRUCTION }] },
        ...history.map(m => ({
          role: m.role,
          parts: [{ text: m.text }]
        })),
        { role: "user", parts: [{ text: userInput }] }
      ],
      config: {
        temperature: 0.7,
        topP: 0.95,
        maxOutputTokens: 800,
      }
    });

    return response.text || "Lo siento, tuve un problema procesando tu solicitud. ¿Podrías intentar de nuevo?";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "En este momento no puedo responder. Por favor, intenta más tarde.";
  }
};