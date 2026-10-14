/**
 * POST /api/cohort-invite
 *
 * Admin-only. Adds someone to cohort_members and returns a one-time link that
 * lets them set their dashboard password. Nothing is emailed: this Supabase
 * project has no custom SMTP, so the admin copies the link and sends it.
 *
 * Needs SUPABASE_SERVICE_ROLE_KEY in the Vercel environment (never in the
 * client bundle). The project URL comes from VITE_SUPABASE_URL.
 */

const ALLOWED_ORIGINS = [
  "https://bostonsquareventures.com",
  "https://www.bostonsquareventures.com",
];
const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[a-zA-Z]{2,}$/;

function json(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

export async function POST(request: Request): Promise<Response> {
  const base = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "")
    .trim()
    .replace(/\/+$/, "");
  const service = (process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim();
  if (!base || !service) return json(500, { error: "invites aren't configured yet." });

  const admin = { apikey: service, Authorization: `Bearer ${service}` };

  // 1. Who is calling?
  const token = (request.headers.get("authorization") || "").replace(/^Bearer\s+/i, "");
  if (!token) return json(401, { error: "sign in first." });
  const who = await fetch(`${base}/auth/v1/user`, {
    headers: { apikey: service, Authorization: `Bearer ${token}` },
  });
  if (!who.ok) return json(401, { error: "your session expired. sign in again." });
  const caller = String(((await who.json()) as { email?: string }).email || "").toLowerCase();

  // 2. Are they an admin?
  const check = await fetch(
    `${base}/rest/v1/cohort_members?select=email&role=eq.admin&email=eq.${encodeURIComponent(caller)}`,
    { headers: admin },
  );
  const rows = check.ok ? ((await check.json()) as unknown[]) : [];
  if (!rows.length) return json(403, { error: "only admins can add people." });

  // 3. Validate input.
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const email = String(body.email || "").trim().toLowerCase();
  const name = String(body.name || "").trim().slice(0, 120);
  const company = String(body.company || "").trim().slice(0, 120);
  const role = body.role === "admin" ? "admin" : "founder";
  if (!EMAIL_RE.test(email)) return json(400, { error: "that email doesn't look right." });

  // 4. Add to the allowlist (re-adding updates name/company/role).
  const row: Record<string, string> = { email, role };
  if (name) row.name = name;
  if (company) row.company = company;
  const upsert = await fetch(`${base}/rest/v1/cohort_members?on_conflict=email`, {
    method: "POST",
    headers: {
      ...admin,
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates,return=minimal",
    },
    body: JSON.stringify(row),
  });
  if (!upsert.ok) return json(500, { error: "couldn't save that member." });

  // 5. One-time set-password link. "invite" creates the auth user; if they
  //    already have an account (e.g. from another app), fall back to recovery.
  const origin = request.headers.get("origin") || "";
  const site = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  const redirect_to = `${site}/cohort-01`;
  for (const type of ["invite", "recovery"] as const) {
    const res = await fetch(`${base}/auth/v1/admin/generate_link`, {
      method: "POST",
      headers: { ...admin, "Content-Type": "application/json" },
      body: JSON.stringify({ type, email, redirect_to }),
    });
    if (res.ok) {
      const link = ((await res.json()) as { action_link?: string }).action_link;
      if (link) return json(200, { link, email, type });
    }
  }
  return json(500, { error: "added them, but couldn't make a sign-in link. try again." });
}
