"""Build the deals seed migration from supabase/seed/deals.csv.

Adds a category, a logo domain, and a short description (taken from the Rho
perk URL slug, so nothing is invented) to each deal, then writes
supabase/migrations/20261015000100_deals_seed.sql.

    python scripts/build-deals-seed.py
"""
import csv
import json
import os
import re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "supabase", "seed", "deals.csv")
OUT = os.path.join(ROOT, "supabase", "migrations", "20261015000100_deals_seed.sql")

CATEGORIES = {
    "ai, cloud & dev": [
        "AWS", "Google Cloud", "Supabase", "MongoDB", "Algolia", "Aiven", "Anthropic", "ElevenLabs",
        "CustomGPT.ai", "Concentrate AI", "XTrace", "AgentMail", "Lovable", "Framer", "Bubble", "B12",
        "Outseta", "Dassault Systemes (Solidworks)", "evervault.com", "Photon", "Agora", "Okta",
    ],
    "legal, equity & incorporation": [
        "Carta", "Clerky", "Capbase", "Pulley", "Shoobx", "Common Paper", "Legal and Ops", "Agree.com",
        "Soxton AI", "doola", "PandaDoc",
    ],
    "finance, accounting & tax": [
        "Quickbooks", "Heartland Payments", "Stripe", "Chargebee", "Forecastr", "Pilot.com", "Puzzle",
        "Startup.Money", "Xendoo", "Xero", "FinRatio", "TaxTaker", "NeoTax", "SAP", "Spendflo",
        "Stackpack", "Fazeshift", "COUNT", "BurnRate",
    ],
    "fundraising & capital": ["Foundersuite", "OpenVC", "DocSend", "ClearCo", "Lighter Capital"],
    "hr, payroll & hiring": [
        "Justworks", "Remote", "vic's company", "Lattice", "Icon Savings", "Globalization-Partners",
        "Omnipresent", "Oyster", "SingleSprout", "SafetyWing", "Remotely", "TriNet", "Velocity Global",
        "Renavest", "Gusto", "Sequoia One", "Human Interest", "Vestwell", "Ignition Benefits", "Freedom",
        "Deel", "Radish Health", "GoGrow",
    ],
    "visas & immigration": ["Ellis", "Greencard Inc", "Global Citizens"],
    "insurance, security & compliance": [
        "Founder Shield", "Vouch", "Embroker", "Thoropass", "A-LIGN", "Secureframe", "Sprinto", "Vanta",
        "ComplyAdvantage", "Nightfall AI", "Sphinx",
    ],
    "sales & crm": [
        "Hubspot for Startups", "Apollo.io", "Drift", "Copper CRM", "Close", "Pipedrive", "Salesforce",
        "sugarcrm.com", "Sendoso", "Reveal", "Sales Assembly", "Harmonic", "Glencoco",
    ],
    "marketing & analytics": [
        "Segment", "Amplitude", "Adjust", "MobileAction", "Brevo", "Hotjar", "Fomo", "Unbounce", "Yext",
        "Statsig", "UserTesting", "Swagup", "Vistaprint", "Proxima",
    ],
    "support & communication": [
        "Fin [formerly Intercom]", "Zendesk", "Freshworks", "Help Scout", "Dialpad",
        "Quo (formerly OpenPhone)", "Vonage", "Talkroute", "Slack", "Gather",
    ],
    "productivity & workspace": [
        "Airtable", "Miro", "Coda", "Fellow", "Linear", "Balsamiq", "Slab", "Notion", "Monday.com", "Canva",
        "Google", "WeWork", "Uber for Business", "Make", "n8n",
    ],
}

DOMAINS = {
    "Carta": "carta.com", "Airtable": "airtable.com", "Hubspot for Startups": "hubspot.com",
    "Segment": "segment.com", "Slack": "slack.com", "TaxTaker": "taxtaker.com",
    "Founder Shield": "foundershield.com", "Fin [formerly Intercom]": "intercom.com",
    "Proxima": "proxima.ai", "Quickbooks": "quickbooks.intuit.com", "Zendesk": "zendesk.com",
    "Heartland Payments": "heartland.us", "Vouch": "vouch.us", "Justworks": "justworks.com",
    "Stripe": "stripe.com", "Remote": "remote.com", "Quo (formerly OpenPhone)": "quo.com",
    "Clerky": "clerky.com", "Thoropass": "thoropass.com", "Ellis": "ellis.ai",
    "vic's company": "oysterhr.com", "doola": "doola.com", "Fazeshift": "fazeshift.com",
    "Apollo.io": "apollo.io", "GoGrow": "gogrow.io", "ClearCo": "clear.co",
    "Amplitude": "amplitude.com", "Chargebee": "chargebee.com", "Drift": "drift.com",
    "Foundersuite": "foundersuite.com", "Capbase": "capbase.com", "Adjust": "adjust.com",
    "Miro": "miro.com", "Freshworks": "freshworks.com", "Bubble": "bubble.io",
    "MobileAction": "mobileaction.co", "Dialpad": "dialpad.com", "Lighter Capital": "lightercapital.com",
    "Copper CRM": "copper.com", "Close": "close.com", "BurnRate": "burnrate.io",
    "Embroker": "embroker.com", "Brevo": "brevo.com", "Fellow": "fellow.app", "Algolia": "algolia.com",
    "Lattice": "lattice.com", "Dassault Systemes (Solidworks)": "solidworks.com",
    "Icon Savings": "iconsavingsplan.com", "Coda": "coda.io", "Agora": "agora.io",
    "Help Scout": "helpscout.com", "Hotjar": "hotjar.com", "Fomo": "fomo.com",
    "ComplyAdvantage": "complyadvantage.com", "Common Paper": "commonpaper.com",
    "Forecastr": "forecastr.co", "Harmonic": "harmonic.ai", "evervault.com": "evervault.com",
    "Gather": "gather.town", "Linear": "linear.app", "Balsamiq": "balsamiq.com",
    "Globalization-Partners": "globalization-partners.com", "A-LIGN": "a-lign.com",
    "Aiven": "aiven.io", "Legal and Ops": "legalandops.com", "Make": "make.com",
    "CustomGPT.ai": "customgpt.ai", "PandaDoc": "pandadoc.com", "Pilot.com": "pilot.com",
    "Pipedrive": "pipedrive.com", "MongoDB": "mongodb.com", "NeoTax": "neo.tax", "Pulley": "pulley.com",
    "Nightfall AI": "nightfall.ai", "Radish Health": "radish-health.com",
    "Omnipresent": "omnipresent.com", "Oyster": "oysterhr.com", "n8n": "n8n.io",
    "OpenVC": "openvc.app", "Okta": "okta.com", "Puzzle": "puzzle.io", "Outseta": "outseta.com",
    "Statsig": "statsig.com", "Spendflo": "spendflo.com", "Salesforce": "salesforce.com",
    "SingleSprout": "singlesprout.com", "SAP": "concur.com", "Sendoso": "sendoso.com",
    "Shoobx": "shoobx.com", "Secureframe": "secureframe.com", "SafetyWing": "safetywing.com",
    "Slab": "slab.com", "Sprinto": "sprinto.com", "Reveal": "reveal.co", "Remotely": "remotely.works",
    "Sales Assembly": "salesassembly.com", "Startup.Money": "startup.money", "Vanta": "vanta.com",
    "TriNet": "trinet.com", "UserTesting": "usertesting.com", "Unbounce": "unbounce.com",
    "Xendoo": "xendoo.com", "Velocity Global": "velocityglobal.com", "Swagup": "swagup.com",
    "Vistaprint": "vistaprint.com", "sugarcrm.com": "sugarcrm.com", "Yext": "yext.com",
    "Vonage": "vonage.com", "Talkroute": "talkroute.com", "Xero": "xero.com",
    "Stackpack": "stackpack.com", "Renavest": "renavestapp.com", "FinRatio": "finratio.com",
    "Greencard Inc": "greencardinc.com", "Agree.com": "agree.com", "DocSend": "docsend.com",
    "COUNT": "count.co", "ElevenLabs": "elevenlabs.io", "AWS": "aws.amazon.com",
    "Notion": "notion.so", "Supabase": "supabase.com", "Deel": "deel.com", "Framer": "framer.com",
    "Lovable": "lovable.dev", "AgentMail": "agentmail.to", "Soxton AI": "soxton.ai",
    "Anthropic": "anthropic.com", "Gusto": "gusto.com", "Sequoia One": "sequoia.com", "B12": "b12.io",
    "Google": "workspace.google.com", "Human Interest": "humaninterest.com",
    "Uber for Business": "uber.com", "Google Cloud": "cloud.google.com",
    "Global Citizens": "globalcitizens.io", "WeWork": "wework.com", "Vestwell": "vestwell.com",
    "Ignition Benefits": "ignitionbenefits.com", "Freedom": "freedom.co", "Sphinx": "sphinx.ai",
    "Photon": "photon.codes", "Glencoco": "glencoco.com", "Concentrate AI": "concentrate.ai",
    "XTrace": "xtrace.ai", "Monday.com": "monday.com", "Canva": "canva.com",
}

# Hand-written where the URL slug reads badly or just repeats the name.
BLURBS = {
    "Founder Shield": "startup insurance",
    "Proxima": "ai-powered ad targeting",
    "Heartland Payments": "payment processing",
    "Justworks": "payroll, benefits, and hr",
    "Remote": "hire and pay employees globally",
    "Quo (formerly OpenPhone)": "business phone system",
    "vic's company": "global hiring through Oyster",
    "doola": "incorporation and compliance for founders",
    "Fazeshift": "accounts receivable automation",
    "MobileAction": "app store and mobile ad intelligence",
    "Dialpad": "business communication",
    "Embroker": "startup insurance",
    "Brevo": "email marketing (formerly Sendinblue)",
    "Fellow": "meeting notes and agendas",
    "Linear": "issue tracking for product teams",
    "CustomGPT.ai": "custom ai agents on your own data",
    "OpenVC": "OpenVC premium for fundraising",
    "Vanta": "automated SOC 2 and security compliance",
    "Xero": "accounting software",
    "Stackpack": "automated vendor contract management",
    "Renavest": "financial wellness for employees",
    "FinRatio": "ai cfo",
    "Greencard Inc": "green card and visa support",
    "Agree.com": "contracts and e-signatures",
    "ElevenLabs": "ai voice and audio",
    "Soxton AI": "ai legal for startups",
    "B12": "ai website builder",
    "Glencoco": "outsourced sales reps",
    "Canva": "design for your whole team",
    "SAP": "expense management (SAP Concur)",
    "Gusto": "6 months of Gusto free",
    "COUNT": "100% off any new COUNT subscription for 3 months",
    "Fin [formerly Intercom]": "Fin (Intercom) free for 1 year",
    "Amplitude": "free year of the Growth plan ($60K value)",
    "Uber for Business": "up to 10% off 5 eligible business rides",
    "Vestwell": "up to $1,100 off a Vestwell 401(k)",
    "Carta": "equity, cap table, and fund management",
    "Hubspot for Startups": "all-in-one CRM for early-stage startups",
    "Slack": "team communication and collaboration",
    "Zendesk": "full Zendesk resolution suite, including AI agents and copilot",
    "Chargebee": "subscription billing and revenue growth",
    "BurnRate": "team performance optimization",
    "Forecastr": "financial modeling and fractional CFO services",
    "evervault.com": "flexible payments security",
    "Globalization-Partners": "global employer of record",
    "Make": "no-code automation platform",
    "Puzzle": "accounting software for startups",
    "Salesforce": "Pro Suite through the Salesforce Launchpad program",
    "Reveal": "partner ecosystem sales",
    "AWS": "$5,000 in AWS Activate credits",
    "Notion": "6 months of Notion Business free",
    "Supabase": "$300 in Supabase credits",
    "Framer": "1 year of Framer Pro free",
    "Lovable": "20% off Lovable Business plans",
    "AgentMail": "3 months of the AgentMail Startup plan free",
    "Anthropic": "$500 in Claude credits",
    "Sequoia One": "$12,000 in HR credits",
    "Google": "25% off Google Workspace",
    "Google Cloud": "Google Cloud credits and Google Workspace",
    "Photon": "APIs for iMessage, WhatsApp, SMS, RCS, and more",
    "Monday.com": "monday.com for startups",
    "Pilot.com": "bookkeeping for startups and small businesses",
    "Freedom": "free payroll, benefits, and HR",
    "Global Citizens": "expedited visa filing: O-1, EB-1, J-1, TN, H-1B, and more",
    "Dassault Systemes (Solidworks)": "SOLIDWORKS 3D CAD",
    "Bubble": "no-code websites and apps",
    "Copper CRM": "CRM built into Google Workspace",
    "Hotjar": "user behavior and engagement insights",
    "Fomo": "social proof notifications",
    "Proxima": "AI-powered ad targeting",
    "Justworks": "payroll, benefits, and HR",
    "CustomGPT.ai": "custom AI agents on your own data",
    "FinRatio": "AI CFO",
    "ElevenLabs": "AI voice and audio",
    "Soxton AI": "AI legal for startups",
    "B12": "AI website builder",
    "Sendoso": "gifting and direct mail",
    "Pipedrive": "sales pipeline CRM",
    "Okta": "identity and access management",
    "Lighter Capital": "revenue-based financing",
    "ClearCo": "equity-free capital",
    "Agora": "real-time voice and video",
}

# Brands listed more than once: describe each offer separately.
BLURB_BY_URL = {
    "stripe-stripe-startups": "Stripe for startups: payments and financial infrastructure",
    "stripe-stripe-atlas": "Stripe Atlas: incorporate your startup",
    "rho-20-off-deel": "20% off Deel for 1 year",
    "deel-hire-manage": "hire, manage, and pay global teams compliantly",
    "gogrow-hire-software": "hire software engineers",
    "gogrow-ai-prototype": "AI prototype to product",
    "gogrow-product-development": "product development",
}

SMALL = {"ai", "and", "for", "of", "the", "to", "a", "with", "in", "your", "on", "all", "any", "more"}
ACRONYMS = {"ai": "AI", "crm": "CRM", "hr": "HR", "api": "API", "apis": "APIs", "aml": "AML", "b2b": "B2B",
            "llms": "LLMs", "gtm": "GTM", "saas": "SaaS", "r": "R", "d": "D", "u": "U", "s": "S", "3d": "3D",
            "cad": "CAD", "sms": "SMS", "rcs": "RCS", "o1": "O-1", "eb1": "EB-1", "j1": "J-1", "tn": "TN",
            "h1b": "H-1B", "401k": "401(k)", "imessage": "iMessage"}


def slug_to_blurb(name: str, url: str) -> str:
    slug = url.rstrip("/").rsplit("/", 1)[-1]
    if slug.startswith("rho-"):
        slug = slug[4:]
    else:
        brand = re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")
        for prefix in (brand, brand.split("-")[0]):
            if slug.startswith(prefix + "-"):
                slug = slug[len(prefix) + 1:]
                break
    slug = re.sub(r"-[0-9a-f]{5}$", "", slug)  # Rho's de-dup suffixes
    text = slug.replace("-", " ")
    text = re.sub(r"\b(\d) (\d{3})\b", r"\1,\2", text)  # 5 000 -> 5,000
    text = re.sub(r"\b(\d[\d,]*)\b(?= (aws|supabase|claude|in hr|off))", r"$\1", text)
    text = re.sub(r"\b(\d+) off\b", r"\1% off", text)
    text = text.replace("$20% off", "20% off").replace("$25% off", "25% off")
    text = re.sub(r"r d\b", "R&D", text)
    text = re.sub(r"u s\b", "U.S.", text)
    words = [ACRONYMS.get(w, w) for w in text.split()]
    return " ".join(words)


def main():
    by_name = {}
    for cat, names in CATEGORIES.items():
        for n in names:
            by_name[n] = cat

    rows = list(csv.DictReader(open(SRC, encoding="utf-8")))
    deals = []
    for i, r in enumerate(rows, 1):
        name, url = r["name"].strip(), r["url"].strip()
        assert name in by_name, f"no category for {name}"
        assert name in DOMAINS, f"no domain for {name}"
        # Brands listed twice (Stripe, GoGrow, Deel) keep per-offer slug blurbs.
        by_url = next((v for k, v in BLURB_BY_URL.items() if k in url), None)
        blurb = by_url or BLURBS.get(name) or slug_to_blurb(name, url)
        if name == "Stripe" and "atlas" in url:
            by_cat = "legal, equity & incorporation"
        else:
            by_cat = by_name[name]
        deals.append({"name": name, "url": url, "domain": DOMAINS[name], "category": by_cat,
                      "blurb": blurb, "sort": i})

    urls = [d["url"] for d in deals]
    assert len(urls) == len(set(urls)), "duplicate urls"

    values = ",\n".join(
        "  ({}, {}, {}, {}, {}, {})".format(*(
            "'" + str(v).replace("'", "''") + "'" if not isinstance(v, int) else str(v)
            for v in (d["name"], d["url"], d["domain"], d["category"], d["blurb"], d["sort"])
        ))
        for d in deals
    )
    sql = (
        "-- Generated by scripts/build-deals-seed.py from supabase/seed/deals.csv.\n"
        "-- Re-running updates names, categories, and blurbs in place by url.\n\n"
        "insert into public.deals (name, url, domain, category, blurb, sort) values\n"
        f"{values}\n"
        "on conflict (url) do update set\n"
        "  name = excluded.name, domain = excluded.domain, category = excluded.category,\n"
        "  blurb = excluded.blurb, sort = excluded.sort;\n"
    )
    open(OUT, "w", encoding="utf-8", newline="\n").write(sql)
    cats = {}
    for d in deals:
        cats[d["category"]] = cats.get(d["category"], 0) + 1
    print(len(deals), "deals")
    print(json.dumps(cats, indent=1))
    for d in deals:
        print(f"  {d['name']:<32} {d['blurb']}")


if __name__ == "__main__":
    main()
