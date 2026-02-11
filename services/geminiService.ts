
import { GoogleGenAI } from "@google/genai";

const SYSTEM_INSTRUCTION = `
Eres un consultor experto senior en Ingeniería Clínica y Gestión de Equipos Biomédicos de la empresa "BioMedics Solutions".
Tu objetivo es ayudar a profesionales de la salud, ingenieros y administradores de hospitales con dudas sobre:
1. Mantenimiento preventivo y correctivo de equipos médicos.
2. Normativas internacionales (ISO 13485, IEC 60601) y locales sobre tecnología sanitaria.
3. Ciclo de vida del equipo médico (adquisición, instalación, uso, mantenimiento y disposición final).
4. Seguridad del paciente y gestión de riesgos tecnológicos.
5. Calibración y metrología biomédica.

Responde de manera profesional, técnica pero clara. Si te preguntan algo fuera del ámbito médico o de ingeniería clínica, redirige amablemente la conversación hacia los servicios de BioMedics Solutions.
`;

export class GeminiService {
  async sendMessage(message: string, history: { role: string; parts: { text: string }[] }[] = []) {
    try {
      // Inicialización estricta según las guías
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      // Aseguramos que el historial enviado a Gemini siempre comience con un mensaje del usuario
      const cleanedHistory = history.filter((msg, index) => {
        // El primer mensaje del historial DEBE ser 'user' para evitar errores 400
        if (index === 0 && msg.role !== 'user') return false;
        return true;
      });

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

      const text = response.text;
      if (!text) {
        throw new Error("Empty response from AI");
      }

      return text;
    } catch (error) {
      console.error("BioMedics AI Error:", error);
      // Mensaje de error más informativo para el usuario final
      return "Lo sentimos, el servicio de consultoría IA no pudo procesar tu solicitud. Por favor, asegúrate de que la API_KEY esté correctamente configurada en las variables de entorno de Vercel y que la conexión sea estable.";
    }
  }
}

export const gemini = new GeminiService();
