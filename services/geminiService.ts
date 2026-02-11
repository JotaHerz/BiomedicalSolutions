
import { GoogleGenAI } from "@google/genai";

const SYSTEM_INSTRUCTION = `
Eres un consultor experto senior en Ingeniería Clínica y Gestión de Equipos Biomédicos de la empresa "BioMedics Solutions".
Tu objetivo es ayudar a profesionales de la salud, ingenieros y administradores de hospitales con dudas sobre:
1. Mantenimiento preventivo y correctivo de equipos médicos.
2. Normativas internacionales (ISO 13485, IEC 60601) y locales sobre tecnología sanitaria.
3. Ciclo de vida del equipo médico (adquisición, instalación, uso, mantenimiento y disposición final).
4. Seguridad del paciente y gestión de riesgos tecnológicos.
5. Calibración y metrología biomédica.

REGLA CRÍTICA: La conversación debe comenzar siempre con un mensaje del usuario. 
Responde de manera profesional, técnica pero clara. Si te preguntan algo fuera del ámbito médico o de ingeniería clínica, redirige amablemente la conversación hacia los servicios de BioMedics Solutions.
`;

export class GeminiService {
  async sendMessage(message: string, history: { role: string; parts: { text: string }[] }[] = []) {
    try {
      // Validar que la API_KEY existe
      const apiKey = process.env.API_KEY;
      if (!apiKey) {
        throw new Error("API_KEY_MISSING");
      }

      const ai = new GoogleGenAI({ apiKey });
      
      // FILTRADO CRÍTICO: El historial enviado a Gemini DEBE empezar con 'user'.
      // Eliminamos cualquier mensaje inicial de 'model' (como el saludo de bienvenida).
      let cleanedHistory = [...history];
      while (cleanedHistory.length > 0 && cleanedHistory[0].role !== 'user') {
        cleanedHistory.shift();
      }

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [
          ...cleanedHistory,
          { role: 'user', parts: [{ text: message }] }
        ],
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          temperature: 0.7,
        },
      });

      return response.text || "No se pudo obtener una respuesta técnica en este momento.";
    } catch (error: any) {
      console.error("Error en BioMedics AI Service:", error);
      
      if (error.message === "API_KEY_MISSING") {
        return "Error: La clave de API no está configurada en Vercel. Por favor, añada API_KEY en las variables de entorno.";
      }
      
      return "Lo sentimos, hubo un problema al procesar su consulta técnica. Por favor, intente de nuevo en unos segundos.";
    }
  }
}

export const gemini = new GeminiService();
