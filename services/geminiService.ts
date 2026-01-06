
import { GoogleGenAI, Type } from "@google/genai";

// Fungsi helper untuk mengambil API Key secara aman
const getApiKey = () => {
  try {
    return process.env.API_KEY || "";
  } catch (e) {
    // Jika process.env tidak didefinisikan (di browser), kembalikan string kosong
    return "";
  }
};

const apiKey = getApiKey();

export const getSellerAssistance = async (query: string, context: string) => {
  if (!apiKey) {
    return "Catatan: API Key belum dikonfigurasi. Silakan hubungi admin atau cek pengaturan GitHub Secrets Anda.";
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `You are a helpful assistant for Petanikopiku, a coffee commerce platform. 
      The user is a seller (penjual) registering their store (toko). 
      Current form context: ${context}
      User question: ${query}`,
      config: {
        systemInstruction: "Answer briefly and warmly in Indonesian. Help the seller understand why we need their 'Nama Toko', 'Alamat Toko', 'Estimasi Penjualan', or why we need their KTP. Address them as 'Mitra Penjual' or 'Pemilik Toko'.",
        temperature: 0.7,
      },
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Maaf, saya sedang mengalami kendala teknis. Silakan lanjutkan pengisian formulir pendaftaran toko Anda.";
  }
};

export const generateProfessionalSummary = async (data: any) => {
  if (!apiKey) return null;

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate a professional registration summary for a coffee store owner (penjual) with these details: ${JSON.stringify(data)}. 
      The summary will be sent to an admin via WhatsApp. 
      Format it neatly with emojis and clear sections. Use formal Indonesian. Use the term 'Informasi Toko'.`,
      config: {
        temperature: 0.5,
      },
    });
    return response.text;
  } catch (error) {
    console.error("Summary Generation Error:", error);
    return null;
  }
};
