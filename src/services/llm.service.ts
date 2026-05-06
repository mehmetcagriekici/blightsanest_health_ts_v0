import ollama from "ollama"
import type { SymptomInput, SymptomHistory } from "../types/symptom.type.js"

function llmPrompt(currentSymptoms: SymptomInput[], history: SymptomHistory[]) {
  return `
You are a personal health tracking assistant. You help users understand their health patterns over time. 
You are NOT a doctor and you do NOT diagnose conditions. 
Never suggest a specific diagnosis or recommend medications.

Current symptoms:
${currentSymptoms}

Health history:
${history}

Analyze the data above and return a JSON object with exactly these five fields:
"patterns" — Recurring symptoms or combinations that appear frequently across the history. If this is the first entry, note that there is not enough history yet.
"severityTrend" — Is the patient's overall condition improving, worsening, or stable over time? Reference specific severity scores if available.
"doctorBriefing" — A clean, professional summary the patient can show their doctor. Include dates, symptoms, severity, duration, and how things have changed over time.
"triggerInsights" — Any correlations between symptoms. For example, do certain symptoms appear together consistently? Note patterns in duration or timing if visible.
"gaps" — Any concerns about missing follow-ups, long silences after severe episodes, or symptoms that have been ignored over time.

Always respond with valid JSON only. No preamble, no explanation outside the JSON, no markdown code blocks.
`
}

export async function getLLMResponse(currentSymptoms: SymptomInput[], history: SymptomHistory[]) {
  const response = await ollama.chat({
    model: 'llama3.1',
    messages: [{role: "system", content: llmPrompt(currentSymptoms, history)}],
    format: "json",
    stream: false,
  });

  return response.message.content;
}
