import { GoogleGenAI } from "@google/genai";
import { QUIZ_SCHEMA, EXAM_SCHEMA } from "../lib/schemas";

export async function generateClinicalJSON(
  apiKey: string,
  prompt: string,
  imagesBase64: { data: string; mimeType: string }[],
  schemaType: "quiz" | "exam"
) {
  if (!apiKey) throw new Error("Gemini API Key is missing.");

  const ai = new GoogleGenAI({ apiKey });
  
  const schema = schemaType === "quiz" ? QUIZ_SCHEMA : EXAM_SCHEMA;
  const sysInstruction = `Você é um Médico Preceptor Chefe e especialista sênior em elaboração de exames de residência médica de alta complexidade.
  
DIRETRIZES DE EXCELÊNCIA CLÍNICA PARA GERAÇÃO:
1. Título e Estrutura: A sua saída sempre será UM ÚNICO Quiz/Prova (um objeto JSON). Dê um título geral no campo 'title' (ex: "Simulado de Cirurgia e UTI"). O campo 'initial_presentation' pode ser uma breve introdução à prova.
2. Vinhetas nos Steps: Toda vez que for introduzir uma nova questão ou caso, você deve escrever a história clínica densa (exames, laboratoriais reais, TNMs) DIRETAMENTE dentro do campo 'content' de cada item no array 'steps'.
3. Distratores de Alto Nível: As alternativas erradas não devem ser óbvias. Devem ser plausíveis, baseadas em guidelines desatualizados ou sutilezas.
4. Explicação Magistral: O campo 'explanation' atua como aula, citando guidelines.
5. Diversidade de Casos: Mude de paciente ao decorrer da prova! Faça vários pacientes e cenários independentes, colocando a história de cada um no seu respectivo 'content'.

REGRA ABSOLUTA DE SAÍDA:
Sua ÚNICA saída (output) deve ser um Array avaliado contendo APENAS UM objeto JSON pai estritamente modelado (ex: [ { "title": "...", "steps": [...] } ]). Não inclua Markdown, "Aqui está...", apenas JSON.

[JSON SCHEMA ALVO]:
${JSON.stringify(schema, null, 2)}`;

  const parts: any[] = [];
  
  if (prompt) {
    parts.push({ text: prompt });
  }

  imagesBase64.forEach(img => {
    parts.push({
      inlineData: {
        data: img.data,
        mimeType: img.mimeType
      }
    });
  });

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: { parts },
      config: {
        systemInstruction: sysInstruction,
        responseMimeType: "application/json"
      }
    });

    return JSON.parse(response.text || "[]");
  } catch (error) {
    console.error("Erro no Gemini:", error);
    throw error;
  }
}
