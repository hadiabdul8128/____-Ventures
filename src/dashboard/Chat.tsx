import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { ArrowUp } from "lucide-react";
import { Mark } from "@/components/Mark";
import { totalValue, type CohortContent, type Deal, type Progress } from "@/dashboard/content";
import { askAssistant, type AssistantTurn, type Member } from "@/lib/dashboard";
import { DealGrid, LogoWall, RequestForm, RhoStep, categoriesOf, isUnlocked } from "@/dashboard/Deals";

type Block =
  | { kind: "rho" }
  | { kind: "wall" }
  | { kind: "deals"; ids: number[] }
  | { kind: "request"; initial?: { companies: string; note: string } };

type Msg = {
  id: number;
  role: "assistant" | "user";
  text: string;
  blocks?: Block[];
  chips?: string[];
};

const CATEGORY_WORDS: [string, RegExp][] = [
  ["ai, cloud & dev", /\b(ai|llms?|cloud|credits?|compute|gpus?|aws|api|dev|developer|hosting|database|claude|openai|models?|build|website|no.?code)\b/],
  ["hr, payroll & hiring", /\b(hr|payroll|hir(e|ing)|recruit\w*|benefits|401\(?k\)?|employees?|contractors?|retirement)\b/],
  ["legal, equity & incorporation", /\b(legal|lawyers?|equity|cap table|contracts?|safe|attorney|counsel)\b/],
  ["finance, accounting & tax", /\b(accounting|bookkeeping|tax(es)?|finance|payments?|billing|expenses?|cfo|r&d)\b/],
  ["fundraising & capital", /\b(fundrais\w*|investors?|raise|raising|capital|vcs?|financing|loan)\b/],
  ["visas & immigration", /\b(visas?|immigration|green ?card|o-?1|h-?1b|eb-?1)\b/],
  ["insurance, security & compliance", /\b(insurance|soc ?2|compliance|security|fraud)\b/],
  ["sales & crm", /\b(sales|crm|leads?|outbound|prospect\w*|pipeline)\b/],
  ["marketing & analytics", /\b(marketing|analytics|ads?|growth|seo|swag|landing pages?)\b/],
  ["support & communication", /\b(support|phone|helpdesk|communication|calls?|messaging|slack)\b/],
  ["productivity & workspace", /\b(productivity|notes|docs|design|project management|workspace|office|coworking|automation|canva|notion)\b/],
];

const STOP = new Set(["the", "and", "for", "what", "with", "any", "have", "you", "deal", "deals", "get", "can", "how", "are", "there", "show", "about", "need", "want", "some", "our", "my"]);

function search(deals: Deal[], text: string) {
  const words = text.toLowerCase().split(/[^a-z0-9.+#]+/).filter((w) => w.length > 2 && !STOP.has(w));
  if (!words.length) return [];
  return deals
    .map((d) => {
      const name = d.name.toLowerCase();
      const hay = `${name} ${d.blurb ?? ""}`.toLowerCase();
      const score = words.reduce((s, w) => s + (name.includes(w) ? 5 : 0) + (hay.includes(w) ? 1 : 0), 0);
      return { d, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 12)
    .map((x) => x.d.id);
}

type Ctx = { deals: Deal[]; locked: boolean; fee: string };

/** Built-in answers. Used for the quick chips, and whenever Claude isn't set up. */
function localAnswer(text: string, ctx: Ctx): Omit<Msg, "id" | "role"> {
  const t = text.toLowerCase();
  const total = ctx.deals.length;
  const lockNote = ctx.locked ? " they unlock as soon as you finish step 1 with Rho." : "";

  if (/\b(rho|incorporat\w*|bank\w*|setup fee|step 1|step one|already did|i did it)\b/.test(t)) {
    return {
      text: ctx.locked
        ? `step 1 is Rho. incorporate your company or open your business bank account through Rho, either one counts. we partner with Rho, so the ${ctx.fee} setup fee is waived for you. once you're done, tap the button below and all ${total} deals unlock.`
        : "you're done with Rho, so everything is unlocked. ask me for anything else.",
      blocks: [{ kind: "rho" }],
    };
  }
  if (/\b(request|missing|can'?t find|not (here|listed|on)|find me|don'?t see)\b/.test(t)) {
    return {
      text: "tell me which companies or tools you want and we'll go find a deal for you.",
      blocks: [{ kind: "request" }],
    };
  }
  if (/\b(unlock\w*|everything|all (the )?deals|what do i get|list|categories|what('?s| is) (in|there|available))\b/.test(t)) {
    const cats = categoriesOf(ctx.deals);
    return {
      text: `${total} deals across ${cats.length} categories: ${cats.map(([c, n]) => `${c} (${n})`).join(", ")}.${lockNote}`,
      blocks: [{ kind: "wall" }],
      chips: cats.slice(0, 6).map(([c]) => c),
    };
  }

  const named = search(ctx.deals, text);
  const cat = CATEGORY_WORDS.find(([, re]) => re.test(t))?.[0] ?? ctx.deals.find((d) => d.category === t)?.category;
  if (cat && named.length < 2) {
    const ids = ctx.deals.filter((d) => d.category === cat).map((d) => d.id);
    return { text: `${ids.length} deals in ${cat}.${lockNote}`, blocks: [{ kind: "deals", ids }] };
  }
  if (named.length) {
    return {
      text: `found ${named.length} deal${named.length === 1 ? "" : "s"} for that.${lockNote}`,
      blocks: [{ kind: "deals", ids: named }],
    };
  }
  return {
    text: "I don't see a deal for that yet. want us to go find one? send it over and we'll follow up by email.",
    blocks: [{ kind: "request", initial: { companies: text.slice(0, 120), note: "" } }],
  };
}

export function Chat({
  me,
  content,
  deals,
  progress,
  onProgress,
  question,
  onQuestionHandled,
}: {
  me: Member;
  content: CohortContent;
  deals: Deal[];
  progress: Progress | null;
  onProgress: (p: Progress) => void;
  /** A question asked from the dashboard home; sent once, then cleared. */
  question?: string | null;
  onQuestionHandled?: () => void;
}) {
  const locked = !isUnlocked(progress);
  const first = (me.name || me.email).split(/[\s@]/)[0];
  const byId = useMemo(() => new Map(deals.map((d) => [d.id, d])), [deals]);
  const nextId = useRef(1);
  const claude = useRef(true);
  const end = useRef<HTMLDivElement>(null);
  const [thinking, setThinking] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>(() => {
    const id = () => nextId.current++;
    const names = [...new Set(deals.map((d) => d.name))];
    const sample = ["AWS", "Google Cloud", "Anthropic", "Notion", "Stripe", "Gusto", "Carta", "Hubspot for Startups"]
      .filter((n) => names.includes(n))
      .join(", ");
    const intro: Msg[] = [
      { id: id(), role: "assistant", text: `hey ${first}. welcome to Boston Square Ventures cohort 01. I'm your deals assistant.` },
      {
        id: id(),
        role: "assistant",
        text: `you have ${deals.length} deals waiting from our partners, worth an estimated ${totalValue(deals)}: ${sample}, and ${Math.max(names.length - 8, 0)} more companies. hover any logo to see what it's worth.`,
        blocks: [{ kind: "wall" }],
      },
    ];
    intro.push(
      locked
        ? {
            id: id(),
            role: "assistant",
            text: `they unlock after one step: incorporate or bank through Rho. because we partner with Rho, your ${content.rho.fee} setup fee is waived.`,
            blocks: [{ kind: "rho" }],
            chips: ["why Rho?", "what unlocks after?", "AI and cloud credits", "request a deal"],
          }
        : {
            id: id(),
            role: "assistant",
            text: "everything is unlocked. ask me for anything, like credits, payroll, legal, or a tool we don't list yet.",
            chips: ["AI and cloud credits", "HR and payroll", "legal and equity", "request a deal"],
          },
    );
    return intro;
  });

  useEffect(() => {
    end.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [msgs, thinking]);

  const ctx: Ctx = { deals, locked, fee: content.rho.fee };

  useEffect(() => {
    if (!question) return;
    onQuestionHandled?.();
    send(question);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [question]);

  const send = async (text: string, viaChip = false) => {
    const clean = text.trim();
    if (!clean || thinking) return;
    const userMsg: Msg = { id: nextId.current++, role: "user", text: clean };
    setMsgs((m) => [...m, userMsg]);

    let answer: Omit<Msg, "id" | "role"> | null = null;
    if (!viaChip && claude.current) {
      setThinking(true);
      const turns: AssistantTurn[] = [...msgs, userMsg].map((m) => ({ role: m.role, content: m.text }));
      const reply = await askAssistant(turns);
      setThinking(false);
      if (reply) {
        const blocks: Block[] = [];
        if (reply.show === "rho") blocks.push({ kind: "rho" });
        if (reply.show === "logos") blocks.push({ kind: "wall" });
        const ids = (reply.dealIds ?? []).filter((i) => byId.has(i));
        if (ids.length) blocks.push({ kind: "deals", ids });
        if (reply.show === "request" || reply.request)
          blocks.push({ kind: "request", initial: reply.request ?? undefined });
        answer = { text: reply.reply, blocks };
      } else {
        claude.current = false;
      }
    }
    answer ??= localAnswer(clean, ctx);
    setMsgs((m) => [...m, { id: nextId.current++, role: "assistant", ...answer }]);
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const input = event.currentTarget.elements.namedItem("q") as HTMLInputElement;
    const value = input.value;
    input.value = "";
    send(value);
  };

  const renderBlock = (b: Block, key: number) => {
    if (b.kind === "rho")
      return <RhoStep key={key} rho={content.rho} me={me} progress={progress} onProgress={onProgress} compact />;
    if (b.kind === "wall") return <LogoWall key={key} deals={deals} locked={locked} />;
    if (b.kind === "request") return <RequestForm key={key} me={me} initial={b.initial} source="chat" />;
    const list = b.ids.map((i) => byId.get(i)).filter((d): d is Deal => Boolean(d));
    return <DealGrid key={key} deals={list} locked={locked} />;
  };

  return (
    <div className="cd-chat">
      <div className="cd-chat-log" aria-live="polite">
        {msgs.map((m) => (
          <div key={m.id} className="cd-msg" data-role={m.role}>
            {m.role === "assistant" && (
              <span className="cd-msg-avatar" aria-hidden="true">
                <Mark size={18} />
              </span>
            )}
            <div className="cd-msg-body">
              <p className="cd-msg-text">{m.text}</p>
              {m.blocks?.map(renderBlock)}
              {m.chips && (
                <div className="cd-chips">
                  {m.chips.map((c) => (
                    <button key={c} type="button" className="cd-chip-btn" onClick={() => send(c, true)}>
                      {c}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {thinking && (
          <div className="cd-msg" data-role="assistant">
            <span className="cd-msg-avatar" aria-hidden="true">
              <Mark size={18} />
            </span>
            <p className="cd-typing" aria-label="thinking">
              <span />
              <span />
              <span />
            </p>
          </div>
        )}
        <div ref={end} />
      </div>
      <form className="cd-chat-input" onSubmit={onSubmit}>
        <input name="q" placeholder="ask about any deal, or tell me what you need…" autoComplete="off" aria-label="message" />
        <button type="submit" className="cd-send" aria-label="send" disabled={thinking}>
          <ArrowUp size={18} />
        </button>
      </form>
    </div>
  );
}
