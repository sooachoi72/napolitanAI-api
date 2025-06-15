import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export default async function handler(req, res) {

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  let keyword;
  try {
    if (typeof req.body === 'string') {
      const body = JSON.parse(req.body);
      keyword = body.keyword;
    } else {
      keyword = req.body?.keyword;
    }
  } catch (e) {
    return res.status(400).json({ error: "Invalid JSON format" });
  }
  
  if (!keyword) {
    return res.status(400).json({ error: "키워드가 필요합니다." });
  }

  try {
    const prompt = `
키워드: ${keyword}

아래 조건에 따라 '나폴리탄 괴담'을 만들어줘.

- '나폴리탄 괴담'은 인터넷에서 유행하는, 일상적인 소재를 기괴하게 비틀어 만든 짧은 괴담이야.(나폴리탄 괴담, 거북스프 괴담 등)
- 결말에는 소름 돋는 반전이나 여운을 남겨줘.
- 괴담을 읽는 사람이 사건의 전말을 추리할 수 있도록 내용을 완결시키지 말고 의구심이 들게 해야 해.
- 전체 분량은 400~600자 내외로 해줘.
- 구어체(친근한 말투, 대화체)도 적절히 섞어줘.
- 개연성이 조금 떨어져도 괜찮아. 독자가 상상할 수 있는 여지를 남겨줘.
- 이야기의 전개는 현실적이면서도 점차 기묘해지는 분위기를 연출해야 해.
- 글의 가독성이 좋게끔 문단을 적절히 나눠줘.
`;

    const result = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
      config: {
        systemInstruction: `
당신은 인터넷 괴담 커뮤니티에서 활동하는 '나폴리탄 괴담' 전문가입니다.
주어진 키워드를 활용해, 일상에서 벌어질 법한 소름 돋는 이야기를 만들어주세요.
스토리의 전개는 현실적이면서도 점차 기묘해지는 분위기를 연출해야 하며,
마지막에는 독자가 여운을 느낄 수 있는 반전이나 의문을 남겨주세요.
        `,
      },
    });

    res.status(200).json({ story: result.text });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Gemini API 오류 발생" });
  }
}
