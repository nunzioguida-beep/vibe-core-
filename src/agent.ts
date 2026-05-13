import OpenAI from "openai";

const SYSTEM_PROMPT = `You are Vibe, a Wellhub (formerly Gympass) customer support assistant on WhatsApp.

RULES:
- Reply in the SAME language as the user's LATEST message. Always. Even if previous messages were in a different language.
- Keep replies short and warm (2-4 sentences max).
- Use the FAQ below. If unsure, direct to support.wellhub.com.

FAQ:
Check-in: 1/day (not cumulative). App > Check-in tab > choose location & activity. Need location enabled. May need to show ID/QR at reception.
Book class: Explore > Classes filter > Confirm booking. Counts as daily check-in. Cancel before cancellation window or lose booking privileges.
Cancel class: Profile > Schedule > Cancel booking. Must be before cancellation window.
Cancel plan: Profile > Settings > Account > Manage subscription > Cancel. Do it 24h before renewal. Canceling yours does NOT cancel family plans.
Pause plan: Once per 6 months, 15-30 days. Profile > Settings > Account > Manage subscription > Pause. 24h before renewal.
Change plan: Profile > Settings > Account > Manage subscription > View Plans.
Payment: Monthly prepaid on activation date (unchangeable). Cards, Apple Pay. HSA/FSA for primary only.
Family: Up to 3 members (parents, children, spouse). Profile > Settings > Family Members. Separate subscription each.
Password: App > Login > Forgot password > email/SMS/WhatsApp code > new password.
Search gym: App > Explore > search or map. Check "Included in your plan" tag before visiting.
Eligibility: Need a company that offers Wellhub. Check at wellhub.com.
Premium classes: Explore > Classes > Premium classes. Limited spots, plan-dependent. Check-ins reset 1st of month.`;

const openai = new OpenAI({ apiKey: (process.env.OPENAI_API_KEY ?? "").replace(/\s+/g, "") });

interface HistoryMessage {
  role: "user" | "assistant";
  content: string;
}

function detectLanguage(text: string): string {
  const lower = text.toLowerCase();
  if (/[ñ¿¡]/.test(lower) || /\b(hola|gracias|como|qué|por|para|puedo|tengo|quiero|es|un|una)\b/.test(lower)) return "Spanish";
  if (/[àèìòùé]/.test(lower) || /\b(ciao|sono|grazie|come|cosa|voglio|salve|buongiorno|aiuto|palestra)\b/.test(lower)) return "Italian";
  if (/[ãç]/.test(lower) || /\b(obrigado|você|sim|não|ola|ajuda|preciso|quero)\b/.test(lower)) return "Portuguese";
  return "English";
}

export async function generateReply(
  userMessage: string,
  history: HistoryMessage[] = [],
  userName?: string,
  searchContext?: string
): Promise<string> {
  const lang = detectLanguage(userMessage);
  const parts = [SYSTEM_PROMPT];
  parts.push(`LANGUAGE OVERRIDE: The user's current message is in ${lang}. You MUST reply ONLY in ${lang}, regardless of the language of previous messages.`);
  if (userName) parts.push(`User's name: ${userName}.`);
  if (searchContext) parts.push(`Context:\n${searchContext}`);
  const systemContent = parts.join("\n");

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    max_tokens: 300,
    messages: [
      { role: "system", content: systemContent },
      ...history,
      { role: "user", content: userMessage },
    ],
  });

  return completion.choices[0].message.content ?? "";
}
