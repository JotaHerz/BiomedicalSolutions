
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
      // La instrucción exige usar exclusivamente process.env.API_KEY
      const apiKey = process.env.API_KEY;
      
      if (!apiKey) {
        console.error("API_KEY no detectada en process.env");
        return "Error de configuración: No se detectó la clave de API. Asegúrese de haber configurado 'API_KEY' en las variables de entorno de Vercel y haber redesplegado la aplicación.";
      }

      const ai = new GoogleGenAI({ apiKey });

      // Estructura de contenidos para la API
      // El historial DEBE comenzar con un mensaje del rol 'user'.
      // Si el historial proporcionado comienza con 'model', lo omitimos hasta encontrar el primer 'user'.
      let validHistory = [...history];
      while (validHistory.length > 0 && validHistory[0].role !== 'user') {
        validHistory.shift();
      }

      // La API requiere que los mensajes alternen entre user y model. 
      // Si hay dos mensajes del mismo rol seguidos, la API fallará con 400.
      const finalContents = [
        ...validHistory,
        { role: 'user' as const, parts: [{ text: message }] }
      ];

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: finalContents,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          temperature: 0.7,
        },
      });

      const textOutput = response.text;
      if (!textOutput) {
        throw new Error("Respuesta vacía de la IA");
      }

      return textOutput;
    } catch (error: any) {
      console.error("Error detallado de BioMedics AI:", error);
      
      // Manejo específico de errores comunes
      if (error.message?.includes("API_KEY_INVALID") || error.message?.includes("403")) {
        return "Error: La clave de API configurada no es válida o no tiene permisos. Verifique su clave en el dashboard de Google AI Studio.";
      }
      
      if (error.message?.includes("400")) {
        return "Error de protocolo: La secuencia de mensajes no es válida. Por favor, asegúrese de no enviar mensajes vacíos y reinicie el chat.";
      }

      return "Lo sentimos, el servicio de consultoría IA ha experimentado un error inesperado. Por favor, verifique su conexión a internet o la configuración de su clave de API en Vercel.";
    }
  }
}

export const gemini = new GeminiService();
