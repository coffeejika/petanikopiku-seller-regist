
import { GoogleGenAI } from "@google/genai";

// Fungsi helper yang lebih aman untuk mendeteksi API Key
const getSafeApiKey = (): string => {
  try {
    // Mengecek apakah process.env ada dan memiliki API_KEY
    if (typeof process !== 'undefined' && process.env && process.env.API_KEY) {
      return process.env.API_KEY;
    }
    return "";
  } catch (e) {
    return "";
  }
};

export const getSellerAssistance = async (query: string, context: string) => {
  const apiKey = getSafeApiKey();
  
  if (!apiKey) {
    return "Maaf, fitur asisten AI saat ini tidak tersedia karena konfigurasi kunci belum lengkap. Anda tetap dapat melanjutkan pengisian formulir secara manual.";
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Konteks Form: ${context}\n\nPertanyaan User: ${query}`,
      config: {
        systemInstruction: "Anda adalah asisten pendaftaran mitra toko di platform Petanikopiku. Jawab dengan ramah, singkat, dan gunakan Bahasa Indonesia yang mendukung.",
        temperature: 0.7,
      },
    });
    return response.text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Terjadi kendala koneksi dengan asisten AI. Silakan lanjutkan pendaftaran Anda.";
  }
};

export const generateProfessionalSummary = async (data: any) => {
  const apiKey = getSafeApiKey();
  if (!apiKey) return null;

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Buat ringkasan pendaftaran profesional untuk data berikut: ${JSON.stringify(data)}. Gunakan format rapi untuk WhatsApp.`,
      config: { temperature: 0.5 },
    });
    return response.text;
  } catch (error) {
    return null;
  }
};
