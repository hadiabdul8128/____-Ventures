-- Cohort 01 dashboard content. Edit the row in the Supabase table editor
-- (public.cohort_content) to change what founders see; no redeploy needed.
-- Re-running this file does NOT overwrite edits made since.

insert into public.cohort_content (cohort, data) values ('cohort-01', $cc${
  "curriculum": {
    "note": [
      "lectures: once a week, 30 minutes, recorded.",
      "homework: once a week. part-timers and full-timers welcome."
    ],
    "weeks": [
      {
        "number": "01",
        "startIso": "2026-10-15",
        "theme": "problem",
        "lecture": "who hurts, how much, and how you'd prove it.",
        "homework": "ten real conversations with people who have the problem."
      },
      {
        "number": "02",
        "startIso": "2026-10-22",
        "theme": "product",
        "lecture": "the smallest thing that could possibly work.",
        "homework": "ship a v0. ugly is fine. imaginary is not."
      },
      {
        "number": "03",
        "startIso": "2026-10-29",
        "theme": "distribution",
        "lecture": "getting strangers to use it without begging friends.",
        "homework": "first ten users you don't know."
      },
      {
        "number": "04",
        "startIso": "2026-11-05",
        "theme": "traction",
        "lecture": "retention, and the numbers that actually matter.",
        "homework": "a number that moved, and why you think it moved."
      },
      {
        "number": "05",
        "startIso": "2026-11-12",
        "theme": "story",
        "lecture": "the pitch, the numbers, and the ask.",
        "homework": "four minutes, rehearsed out loud, in front of someone."
      },
      {
        "number": "06",
        "startIso": "2026-11-19",
        "theme": "demo day",
        "lecture": "run of show, order, and who is in the room.",
        "homework": "demo day. four minutes. the network is watching."
      }
    ]
  },
  "checkins": {
    "weekly": {
      "label": "weekly check-in",
      "when": "Wednesdays, 7:00pm ET",
      "note": "the whole cohort, 45 minutes.",
      "href": ""
    },
    "booking": {
      "label": "book extra time",
      "note": "any time during the week, with both of us.",
      "href": ""
    }
  },
  "perks": {
    "heading": "compute, credits, and perks.",
    "body": "what cohort 01 gets on top of the program. if anything here doesn't work for you, tell us and we'll sort it out.",
    "partners": [
      {
        "name": "Rho",
        "value": "$200K",
        "label": "in compute and credits",
        "body": "startups banking with Rho can open the Rho perks page for $200K in compute and credits. we also give you free incorporation and free banking through Rho.",
        "href": "https://www.rho.co/perks",
        "cta": "open Rho perks"
      },
      {
        "name": "Gusto",
        "value": "payroll",
        "label": "payroll, benefits, and HR",
        "body": "when you hire, set up payroll, benefits, and HR through Gusto using our link.",
        "href": "https://gusto.com/go/bd/bostonsquareventures?cache_reset=1792005923038",
        "cta": "sign up for Gusto"
      }
    ]
  },
  "compute": {
    "note": "available through our network. several have their own application and eligibility. ask us and we'll point you at the right one.",
    "groups": [
      {
        "title": "cloud & infrastructure",
        "items": [
          "AWS",
          "Google Cloud",
          "Supabase",
          "Blaxel"
        ]
      },
      {
        "title": "ai & developer tools",
        "items": [
          "Devin",
          "Browser Use",
          "Sarvam AI",
          "Firecrawl",
          "Langfuse",
          "Greptile",
          "Respan",
          "Roboflow",
          "Gumloop",
          "AgentMail",
          "Corsair"
        ]
      },
      {
        "title": "voice & video",
        "items": [
          "Deepgram",
          "Bolna AI",
          "Tavus",
          "sync."
        ]
      },
      {
        "title": "other",
        "items": [
          "Razorpay",
          "Coinbase / Base",
          "écentic"
        ]
      }
    ]
  },
  "vcSlots": 15
}$cc$::jsonb)
on conflict (cohort) do nothing;
