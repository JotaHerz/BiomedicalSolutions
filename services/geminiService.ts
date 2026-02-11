
import { GoogleGenAI } from "@google/genai";

const SYSTEM_INSTRUCTION = `
Eres un consultor experto senior en Ingeniería Clínica y Gestión de Equipos Biomédicos de la empresa "BioMedics Solutions".
Tu objetivo es ayudar a profesionales de la salud, ingenieros y administradores de hospitales con dudas técnicas.
Debes basar tus respuestas en estándares de calidad hospitalaria, seguridad eléctrica médica e ingeniería clínica.
Si te preguntan algo fuera de este ámbito, redirige cortésmente la consulta a los servicios de BioMedics.
Responde de forma concisa y profesional.
`;

export class GeminiService {
  async sendMessage(message: string, history: { role: 'user' | 'model'; parts: { text: string }[] }[] = []) {
    try {
      // Requisito del sistema: Obtener la clave exclusivamente de process.env.API_KEY
      const apiKey = process.env.API_KEY;
      if (!apiKey) {
        throw new Error("API_KEY_MISSING");
      }

      const ai = new GoogleGenAI({ apiKey });

      // Estructura de contenidos: La API de Gemini requiere que la conversación empiece con un mensaje de 'user'
      // y que los roles se alternen estrictamente entre 'user' y 'model'.
      let validHistory = [...history];
      
      // Limpiamos el historial para asegurar que comience con 'user'
      while (validHistory.length > 0 && validHistory[0].role !== 'user') {
        validHistory.shift();
      }

      // El mensaje actual siempre es el nuevo turno del usuario
      const contents = [
        ...validHistory,
        { role: 'user' as const, parts: [{ text: message }] }
      ];

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          temperature: 0.7,
        },
      });

      const textOutput = response.text;
      if (!textOutput) {
        throw new Error("Empty response");
      }

      return textOutput;
    } catch (error: any) {
      console.error("BioMedics AI Error Details:", error);
      
      if (error.message === "API_KEY_MISSING") {
        return "Error de configuración: La clave de API no se detecta. Por favor, asegúrese de haber configurado 'API_KEY' en el panel de Vercel y haber redesplegado la aplicación.";
      }
      
      if (error.message?.includes("403") || error.message?.includes("API_KEY_INVALID")) {
        return "Error: La clave de API es inválida o no tiene permisos. Por favor, revise su configuración en Google AI Studio.";
      }

      return "Lo sentimos, el servicio de consultoría IA no está respondiendo correctamente. Por favor, verifique su conexión e intente de nuevo en unos momentos.";
    }
  }
}

export const gemini = new GeminiService();
