import { BillIntent } from "./types";

export async function callBillIntent(command: string, osState: any): Promise<BillIntent> {
  try {
    const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-thinking:generateContent?key=YOUR_GEMINI_API_KEY_HERE", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        contents: [
          { role: "user", parts: [{ text: buildPrompt(command, osState) }] }
        ]
      })
    });

    const data = await response.json();

    const json = JSON.parse(data.candidates?.[0]?.content?.parts?.[0]?.text || "{}");

    return json as BillIntent;
  } catch (err) {
    console.error("BILL API Error:", err);
    return { intent: "unknown" };
  }
}

function buildPrompt(command: string, osState: any) {
  return `
You are BILL, the cognitive operating system orchestrator for parcOS.
You output ONLY valid JSON matching the BillIntent schema.

User command:
${command}

Current OS state:
${JSON.stringify(osState, null, 2)}

Respond ONLY with JSON:
{
  "intent": "...",
  "target": "...",
  "layout": "...",
  "payload": {},
  "confidence": 0.0
}
`;
}
