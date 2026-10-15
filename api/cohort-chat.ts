/**
 * POST /api/cohort-chat
 *
 * The dashboard's deals assistant, answered by Claude on AWS Bedrock.
 * Members only: the caller's Supabase token is checked, and the deals list is
 * read with that token so RLS applies.
 *
 * Env (Vercel):
 *   AWS_BEARER_TOKEN_BEDROCK  Bedrock API key (required)
 *   AWS_REGION                default us-east-1
 *   BEDROCK_MODEL_ID          default us.anthropic.claude-opus-4-6-v1
 *   VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY  (already set for the site)
 *
 * Responds 503 when Bedrock isn't configured; the client then falls back to
 * its built-in answers.
 */

type Turn = { role: "user" | "assistant"; content: string };
type Deal = {
  id: number;
  name: string;
  category: string;
  offer: string | null;
  value_amount: number | null;
  value_confidence: string | null;
};

function json(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

/** Bedrock wants user-first, strictly alternating turns. */
function normalize(turns: Turn[]) {
  const out: { role: "user" | "assistant"; content: { text: string }[] }[] = [];
  for (const t of turns) {
    const text = String(t.content || "").slice(0, 2000).trim();
    if (!text || (t.role !== "user" && t.role !== "assistant")) continue;
    if (!out.length && t.role !== "user") continue;
    const last = out[out.length - 1];
    if (last && last.role === t.role) last.content[0].text += `\n${text}`;
    else out.push({ role: t.role, content: [{ text }] });
  }
  return out;
}

function parseReply(raw: string) {
  const match = raw.match(/\{[\s\S]*\}/);
  try {
    const obj = JSON.parse(match ? match[0] : raw) as Record<string, unknown>;
    const show = ["rho", "request", "logos", "special"].includes(String(obj.show)) ? String(obj.show) : null;
    const req = obj.request as { companies?: string; note?: string } | null | undefined;
    return {
      reply: String(obj.reply || "").slice(0, 1500),
      dealIds: Array.isArray(obj.dealIds) ? obj.dealIds.map(Number).filter(Number.isFinite).slice(0, 12) : [],
      show,
      request: req && req.companies ? { companies: String(req.companies), note: String(req.note || "") } : null,
    };
  } catch {
    return { reply: raw.slice(0, 1500), dealIds: [], show: null, request: null };
  }
}

export async function POST(request: Request): Promise<Response> {
  const bedrockKey = (process.env.AWS_BEARER_TOKEN_BEDROCK || "").trim();
  const region = (process.env.AWS_REGION || "us-east-1").trim();
  const model = (process.env.BEDROCK_MODEL_ID || "us.anthropic.claude-opus-4-6-v1").trim();
  const base = (process.env.VITE_SUPABASE_URL || "").trim().replace(/\/+$/, "");
  const anon = (process.env.VITE_SUPABASE_ANON_KEY || "").trim();
  if (!bedrockKey || !base || !anon) {
    const missing = [
      !bedrockKey && "AWS_BEARER_TOKEN_BEDROCK",
      !base && "VITE_SUPABASE_URL",
      !anon && "VITE_SUPABASE_ANON_KEY",
    ].filter(Boolean);
    return json(503, { error: "assistant not configured", missing });
  }

  const token = (request.headers.get("authorization") || "").replace(/^Bearer\s+/i, "");
  if (!token) return json(401, { error: "sign in first." });
  const asUser = { apikey: anon, Authorization: `Bearer ${token}` };

  const who = await fetch(`${base}/auth/v1/user`, { headers: asUser });
  if (!who.ok) return json(401, { error: "session expired." });
  const email = String(((await who.json()) as { email?: string }).email || "").toLowerCase();

  const get = async <T,>(path: string): Promise<T | null> => {
    const r = await fetch(`${base}/rest/v1/${path}`, { headers: asUser });
    return r.ok ? ((await r.json()) as T) : null;
  };
  const [members, deals, progress, content] = await Promise.all([
    get<{ name: string | null }[]>(`cohort_members?select=name&email=eq.${encodeURIComponent(email)}`),
    get<Deal[]>("deals?select=id,name,category,offer,value_amount,value_confidence&order=sort"),
    get<{ rho_done_at: string | null; rho_path: string | null }[]>(
      `cohort_progress?select=rho_done_at,rho_path&email=eq.${encodeURIComponent(email)}`,
    ),
    get<{ data: { rho?: { fee?: string } } }[]>("cohort_content?select=data&cohort=eq.cohort-01"),
  ]);
  if (!members?.length || !deals) return json(403, { error: "not a cohort member." });

  const unlocked = Boolean(progress?.[0]?.rho_done_at);
  const fee = content?.[0]?.data?.rho?.fee || "$2,000";
  const body = (await request.json().catch(() => ({}))) as { messages?: Turn[] };
  const messages = normalize((body.messages || []).slice(-12));
  if (!messages.length) return json(400, { error: "say something first." });

  const system = `You are the deals assistant inside the Boston Square Ventures cohort 01 founder dashboard. You are talking to ${members[0].name || "a founder"}.

How deals work:
- Step 1 is Rho: the founder incorporates their company OR opens business banking through Rho (either one counts). Boston Square Ventures partners with Rho, so the ${fee} setup fee is waived for them.
- Every other deal unlocks once step 1 is done. This founder has ${unlocked ? "FINISHED step 1, so every deal is unlocked" : "NOT finished step 1 yet, so the deals are locked; nudge them toward Rho when relevant"}.
- If they want a tool we don't list, offer to file a deal request and we'll go find one.
- Extra credits on special request, on top of the listed deals: $20K extra in Supabase, $20K extra in AWS, and $5K extra in OpenAI. To request, they email Soneesh (soneeshkothagundla@gmail.com) or Hadi (hadiabdul@college.harvard.edu) with what they're building and what they need. Mention this when they ask about Supabase, AWS, OpenAI, cloud, or AI credits.

Rules:
- Only mention deals from the list below, with the offer exactly as written. Never invent deals, amounts, or terms.
- "worth" is an estimated USD value. When confidence is high, the amount is stated in the offer; otherwise say "about" or "an estimated".
- Be brief and warm: 1 to 3 short sentences, lowercase like the rest of the site, no emojis, no em-dashes.
- Recommend specific deals by id when they fit the question (up to 12).

Reply with JSON only, no prose around it:
{"reply": string, "dealIds": number[], "show": "rho" | "request" | "logos" | "special" | null, "request": {"companies": string, "note": string} | null}
- show "rho" when talking about step 1, "logos" to show every partner, "request" to open the request form, "special" for the extra Supabase / AWS / OpenAI credits.
- Fill "request" when they ask for something we don't have, so the form is prefilled.

Deals (id | name | category | offer | worth):
${deals
  .map(
    (d) =>
      `${d.id} | ${d.name} | ${d.category} | ${d.offer ?? ""} | ${
        d.value_amount ? `$${d.value_amount} (${d.value_confidence} confidence)` : "no fixed value"
      }`,
  )
  .join("\n")}`;

  const res = await fetch(
    `https://bedrock-runtime.${region}.amazonaws.com/model/${encodeURIComponent(model)}/converse`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${bedrockKey}` },
      body: JSON.stringify({
        system: [{ text: system }],
        messages,
        inferenceConfig: { maxTokens: 900, temperature: 0.3 },
      }),
    },
  );
  if (!res.ok) return json(502, { error: "assistant unavailable", status: res.status });
  const out = (await res.json()) as { output?: { message?: { content?: { text?: string }[] } } };
  const text = (out.output?.message?.content || []).map((c) => c.text || "").join("");
  return json(200, parseReply(text));
}
