import { env } from '../../config/env.js'

const MODEL = 'gemini-flash-latest'

// AgentWallet only ever settles in INR — never ask the user for a currency,
// just fill it in. Category is always inferred by the model too (never
// asked about); merchant and amount are the only fields worth a clarifying
// question, and only when the amount genuinely can't be pinned down yet.
const SYSTEM_INSTRUCTION = `You are the AgentWallet AI Agent — not a generic chatbot. You act on the user's real wallets, payments, and policies inside AgentWallet, an AI payment authorization app.

You support exactly these intents. Silently classify every user message into one of them (or none, for small talk/greetings/unrelated questions, which you answer normally with no action):

- book_flight, book_hotel, pay_merchant, buy_subscription — the user wants to spend money with a merchant.
- transfer_money — the user wants to move money into one of their own wallets.
- check_wallet_balance — the user wants to see their wallet balances.
- show_payment_requests — the user wants to see their payment request history.
- show_alerts — the user wants to see their security alerts.
- show_audit_logs — the user wants to see their audit log.
- show_virtual_cards — the user wants to see their virtual cards.
- explain_policy — the user wants their AI Wallet policy explained.
- create_ai_wallet — the user wants a new AI Wallet created.

For book_flight, book_hotel, pay_merchant, and buy_subscription:
Do not just chat about it. Extract structured information: merchant, amount, currency, category.
- currency is always "INR" — fill it in yourself, never ask.
- category is always your own best short guess (e.g. "Travel", "AI Subscription", "Cloud", "Shopping", "Food", "Bills") — never ask.
- merchant is the real-world company/vendor name. If it's genuinely unclear who the merchant is, ask.
- amount is the only field that's often worth a question. Ask (and do not guess) whenever the price genuinely depends on something the user hasn't told you yet — a plan or tier (e.g. "ChatGPT Plus" has separate Monthly and Yearly prices — always ask which one, even though you know the service), a quantity, a number of nights, specific dates, or an amount the user didn't state at all. Only fill in an amount yourself when there is truly just one normal price and no plan/tier choice exists for that specific thing (e.g. a single flat subscription fee, or the user already told you the amount). When in doubt about whether something has multiple tiers, ask rather than guess. Ask ONLY about the missing detail, in one short question, and say nothing else. Do not emit an action on a turn where you asked a question.
- Once you have a merchant and a confidently-known amount (whether from this message or from earlier in the conversation), emit the action. Your visible reply for that turn must say the request is being sent to the Policy Engine for evaluation — never say "I approved" or "I'm approving" or "I declined" yourself; you are not the one who decides. The Policy Engine's real decision is reported back to the user separately, after your action is processed.

For transfer_money: extract amount and destination (e.g. "Main Wallet", or the name of an AI Wallet). If either is missing, ask only for that.

For create_ai_wallet: extract name and budget (the amount to allocate, in INR). If either is missing, ask only for that. An expiry date is optional — only include it if the user mentions one.

For check_wallet_balance, show_payment_requests, show_alerts, show_audit_logs, show_virtual_cards, and explain_policy: no fields are needed — emit the action immediately every time you detect the intent. You don't have real access to this data yourself, so keep your visible reply to a short lead-in (e.g. "Here's your wallet balance:") — the real data is filled in separately, after your action is processed.

When — and only when — you have everything needed to act this turn, on a new line by itself output a line starting with exactly "AGENT_ACTION:" followed by a single-line JSON object with exactly two keys: "intent" (one of the keys listed above) and "fields" (an object with that intent's fields, or {} for the no-field intents). Never show this JSON anywhere else in your reply, and never describe its contents in prose. If you're still missing something, do not output this line at all — just ask your question.`

// Matches an "AGENT_ACTION: {...}" line the model was instructed to emit
// above. The JSON itself must never reach the visible chat — this both
// extracts it and strips it out of the text shown to the user.
const AGENT_ACTION_PATTERN = /AGENT_ACTION:\s*(\{[^\n]*\})/i

function extractAgentAction(rawText) {
  const match = rawText.match(AGENT_ACTION_PATTERN)
  const cleanedText = rawText.replace(AGENT_ACTION_PATTERN, '').trim()

  if (!match) return { text: cleanedText, agentAction: null }

  try {
    const parsed = JSON.parse(match[1])
    if (typeof parsed.intent !== 'string') return { text: cleanedText, agentAction: null }
    return { text: cleanedText, agentAction: { intent: parsed.intent, fields: parsed.fields ?? {} } }
  } catch {
    // Malformed JSON from the model — still strip the line, just don't act on it.
    return { text: cleanedText, agentAction: null }
  }
}

function toGeminiRole(role) {
  return role === 'assistant' ? 'model' : 'user'
}

const MAX_RETRIES = 3
const RETRY_DELAYS_MS = [2000, 4000, 8000]

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function callGemini(messages) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${env.gemini.apiKey}`

  return fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      systemInstruction: { role: 'system', parts: [{ text: SYSTEM_INSTRUCTION }] },
      contents: messages.map((message) => ({
        role: toGeminiRole(message.role),
        parts: [{ text: message.content }],
      })),
    }),
  })
}

// messages: array of { role: 'user' | 'assistant', content: string }, oldest first.
// Returns { text, agentAction }: `text` is the reply shown to the user (the
// raw AGENT_ACTION line, if any, is always stripped out of it); `agentAction`
// is { intent, fields } when the model decided it has enough information to
// act this turn, otherwise null (e.g. it's still asking a clarifying question,
// or the message needs no action at all).
export async function generateReply(messages) {
  if (!env.gemini.apiKey) {
    const error = new Error('AI assistant is not configured (GEMINI_API_KEY). Replies cannot be generated.')
    error.status = 500
    throw error
  }

  // Gemini returns 503 when it's overloaded, not when the request is invalid —
  // retrying with backoff is the right response; any other status fails immediately.
  let response
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    response = await callGemini(messages)

    if (response.status !== 503) break

    if (attempt === MAX_RETRIES) {
      const error = new Error('AI Assistant is currently busy. Please try again in a moment.')
      error.status = 503
      throw error
    }

    await sleep(RETRY_DELAYS_MS[attempt])
  }

  if (!response.ok) {
    const body = await response.text().catch(() => '')
    console.error(`Gemini API request failed (${response.status}): ${body}`)
    const error = new Error('AI assistant is temporarily unavailable. Please try again shortly.')
    error.status = 502
    throw error
  }

  const data = await response.json()
  const rawText = data?.candidates?.[0]?.content?.parts?.map((part) => part.text).join('') ?? null

  if (!rawText) {
    const error = new Error('Gemini API returned no reply content')
    error.status = 502
    throw error
  }

  return extractAgentAction(rawText)
}
