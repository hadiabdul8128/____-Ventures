/**
 * Creator tracking links: bostonsquareventures.com/r/<code>.
 *
 * The code is kept for 30 days (last link wins) and sent as `ref` with any
 * application, so an applicant who browses first and applies later still
 * counts for the creator who sent them. `?ref=<code>` on any page works too.
 */

const KEY = "bsv-ref";
const TTL_MS = 30 * 24 * 60 * 60 * 1000;
const CODE = /^[a-z0-9]{4,12}$/;

function save(code: string) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify({ code, at: Date.now() }));
  } catch {
    /* storage unavailable */
  }
}

/** Call once at startup, before the router reads the URL. */
export function captureRef() {
  const { pathname, search, hash } = window.location;
  const short = pathname.match(/^\/r\/([^/]+)\/?$/);
  const code = (short?.[1] ?? new URLSearchParams(search).get("ref") ?? "")
    .trim()
    .toLowerCase();
  if (CODE.test(code)) save(code);
  // Land /r/<code> visitors on the home page with a clean URL.
  if (short) window.history.replaceState({}, "", `/${hash}`);
}

export function currentRef(): string | null {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    const { code, at } = JSON.parse(raw) as { code?: string; at?: number };
    if (!code || !CODE.test(code) || !at || Date.now() - at > TTL_MS)
      return null;
    return code;
  } catch {
    return null;
  }
}
