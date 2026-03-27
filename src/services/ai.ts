/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function generateResponse(prompt: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction: "أنت مساعد ذكي لمتجر 'العاصم فون' للهواتف الذكية في اليمن. قدم معلومات عن خدمات المتجر: صيانة، برمجة، بيع هواتف، ودفتر حسابات. كن ودوداً ومختصراً وباللغة العربية. إذا سألك المستخدم عن موقعه، أخبره أن المتجر يقع في صنعاء، شارع القصر.",
      },
    });
    return response.text;
  } catch (error) {
    console.error("AI Error:", error);
    return "عذراً، حدث خطأ في الاتصال بالذكاء الاصطناعي.";
  }
}
