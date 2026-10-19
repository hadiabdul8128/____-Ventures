import { LiquidButton } from "@/components/ui/liquid-glass-button";
import { ArrowUpRight, CalendarDays, Clock, MapPin } from "lucide-react";
import { Reveal } from "@/components/Shell";
import { events, eventsPage, type BsvEvent } from "@/events/content";

function EventCard({ event, past }: { event: BsvEvent; past: boolean }) {
  return (
    <Reveal className={past ? "event is-past" : "event"}>
      <a
        className="event-cover"
        href={event.href}
        target="_blank"
        rel="noopener noreferrer"
        tabIndex={-1}
        aria-hidden="true"
      >
        <img
          src={event.image.src}
          alt=""
          width={800}
          height={800}
          loading="lazy"
          decoding="async"
        />
      </a>
      <div className="event-copy">
        <p className="eyebrow">{event.kicker}</p>
        <h3 className="event-title">{event.title}</h3>
        <p className="event-partner">{event.partner}</p>
        <ul className="event-meta">
          <li>
            <CalendarDays size={15} aria-hidden="true" />
            <time dateTime={event.start}>
              {event.dayLabel}, {event.dateLabel}
            </time>
          </li>
          <li>
            <Clock size={15} aria-hidden="true" />
            {event.timeLabel}
          </li>
          <li>
            <MapPin size={15} aria-hidden="true" />
            <span>
              {event.location}
              <small>{event.locationNote}</small>
            </span>
          </li>
        </ul>
        <p className="event-body">{event.body}</p>
        <ul className="event-agenda">
          {event.agenda.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <p className="event-hosts">
          {eventsPage.hostedBy} {event.hosts.join(", ")}
        </p>
        {!past && (
          <div className="event-actions">
            <LiquidButton asChild className="btn">
              <a href={event.href} target="_blank" rel="noopener noreferrer">
                {event.cta} <ArrowUpRight size={14} />
              </a>
            </LiquidButton>
            <p className="event-note">{event.ctaNote}</p>
          </div>
        )}
      </div>
    </Reveal>
  );
}

export function Events() {
  const now = Date.now();
  const byStart = [...events].sort(
    (a, b) => Date.parse(a.start) - Date.parse(b.start),
  );
  const upcoming = byStart.filter((e) => Date.parse(e.end) >= now);
  const past = byStart.filter((e) => Date.parse(e.end) < now).reverse();

  return (
    <main id="main" className="events-page">
      <section className="section" aria-labelledby="events-heading">
        <div className="wrap">
          <Reveal className="section-head">
            <p className="eyebrow">{eventsPage.eyebrow}</p>
            <h1 id="events-heading" className="events-heading">
              <span className="heading-highlight">{eventsPage.heading}</span>
            </h1>
            <p className="lede">{eventsPage.body}</p>
          </Reveal>

          <h2 className="events-group">{eventsPage.upcoming}</h2>
          {upcoming.length ? (
            <div className="events-list">
              {upcoming.map((e) => (
                <EventCard key={e.id} event={e} past={false} />
              ))}
            </div>
          ) : (
            <p className="lede">{eventsPage.none}</p>
          )}

          {past.length > 0 && (
            <>
              <h2 className="events-group">{eventsPage.past}</h2>
              <div className="events-list">
                {past.map((e) => (
                  <EventCard key={e.id} event={e} past />
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </main>
  );
}
