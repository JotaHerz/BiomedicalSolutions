
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
      // Usamos directamente process.env.API_KEY como requiere la SDK
      // La instancia se crea en cada llamada para asegurar robustez en el despliegue
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [
          ...history,
          { role: 'user', parts: [{ text: message }] }
        ],
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          temperature: 0.7,
        },
      });

      return response.text || "No se pudo obtener una respuesta técnica en este momento.";
    } catch (error) {
      console.error("Error al conectar con la IA de BioMedics:", error);
      return "Lo sentimos, el servicio de consultoría IA no está configurado correctamente en el servidor. Por favor, contacte con el administrador técnico de BioMedics Solutions.";
    }
  }
}

export const gemini = new GeminiService();
