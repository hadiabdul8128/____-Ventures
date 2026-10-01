import Image from "next/image";
import {
  Activity,
  ArrowDown,
  ArrowRight,
  BarChart3,
  Cloud,
  ExternalLink,
  Smartphone,
} from "lucide-react";
import { Section } from "@/components/Section";
import { SensorCard } from "@/components/ui/SensorCard";
import { StatCard } from "@/components/ui/StatCard";

const architecture = [
  {
    title: "Wearable Device",
    description: "Multimodal physiological and motion sensing at research-grade frequency.",
    icon: Activity,
  },
  {
    title: "iOS App",
    description: "Bluetooth streaming, session control, and offline logging for field use.",
    icon: Smartphone,
  },
  {
    title: "Cloud Storage",
    description: "Secure synchronization for processing, validation, and longitudinal studies.",
    icon: Cloud,
  },
  {
    title: "Web Dashboard",
    description: "Visualization and export tools for digital biomarker analysis.",
    icon: BarChart3,
  },
] as const;

const sensors = [
  {
    abbreviation: "PPG",
    name: "Photoplethysmography",
    description: "An optical pulse signal that tracks blood-volume changes under the skin.",
    captures: "Pulse waveform, heart rate, and heart-rate variability features from reflected light.",
    projectRole:
      "VitalWave used PPG to estimate heart rate and compare physiologically relevant trends against a Polar H10 reference.",
  },
  {
    abbreviation: "ACC",
    name: "Accelerometer",
    description: "A three-axis motion sensor that measures linear acceleration.",
    captures: "Walking, activity intensity, posture shifts, steps, and motion artifacts in the signal.",
    projectRole:
      "ACC contextualizes physiology: elevated heart rate during high movement means something different than elevated heart rate during low activity.",
  },
  {
    abbreviation: "GYR",
    name: "Gyroscope",
    description: "A rotational motion sensor that measures angular velocity.",
    captures: "Device rotation, wrist turns, gesture dynamics, and movement direction changes.",
    projectRole:
      "GYR complements accelerometry so downstream models can separate true physiology from movement-driven noise.",
  },
  {
    abbreviation: "MAG",
    name: "Magnetometer",
    description: "An orientation sensor that measures the local magnetic field.",
    captures: "Heading and device orientation relative to the surrounding environment.",
    projectRole:
      "MAG helps stabilize motion context when the wearable changes orientation during everyday use.",
  },
  {
    abbreviation: "HUM",
    name: "Humidity",
    description: "An environmental channel that records local humidity around the device.",
    captures: "Ambient moisture and skin-adjacent humidity conditions during collection.",
    projectRole:
      "HUM adds context for field studies because moisture and device contact can affect signal quality and user comfort.",
  },
  {
    abbreviation: "TMP",
    name: "Temperature",
    description: "A thermal channel for skin-adjacent and ambient temperature context.",
    captures: "Temperature changes around the sensor package and local environment.",
    projectRole:
      "TMP supports richer interpretation of wearable data by adding thermal context to cardiovascular and motion signals.",
  },
] as const;

export function ResearchOverview() {
  return (
    <Section id="research" label="02 · Research" className="bg-ink text-white" dark>
      <div className="max-w-4xl">
        <h2 className="text-white">
          VitalWave: An Open-Source End-to-End Wearable Platform for Digital Health
        </h2>
        <p className="mt-5 text-lg text-white/68">Duke University · BIG IDEAs Lab · Dr. Jessilyn Dunn</p>
      </div>

      <div className="mt-14 grid gap-8 md:grid-cols-3">
        <StatCard value="100 Hz" label="Raw multimodal sampling across physiological and motion channels." />
        <StatCard value="0" label="Packets lost in streaming trials during initial system evaluation." />
        <StatCard value="3+ days" label="Battery life under standard use for longitudinal collection." />
      </div>

      <div className="mt-16 grid gap-8 rounded-lg border border-white/12 bg-white/[0.035] p-4 md:grid-cols-[0.9fr_1.1fr] md:p-6 lg:p-8">
        <div className="overflow-hidden rounded-md border border-white/10 bg-ink-soft">
          <Image
            src="/assets/vitalwave-lederer.jpg"
            alt="Lauren Lederer and Hadi Abdul holding a VitalWave wearable device at Duke"
            width={1600}
            height={1200}
            className="aspect-[4/3] h-full w-full object-cover"
            priority={false}
          />
        </div>
        <div className="flex flex-col justify-center">
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-accent">
            Featured In · Duke Vertices
          </p>
          <h3 className="mt-4 font-serif text-3xl leading-tight text-white">
            The BIG IDEAs Lab at Duke is shaping the future of medical wearable technology
          </h3>
          <p className="mt-4 text-sm leading-6 text-white/68">
            The article highlights Dr. Jessilyn Dunn&apos;s lab, Lauren Lederer&apos;s work on
            Project VitalWave, and the importance of open-source wearable tools that can move
            from research prototypes into real clinical and field settings.
          </p>
          <a
            href="https://www.dukevertices.org/blog/the-big-ideas-lab-at-duke-is-shaping-the-future-of-medical-wearable-technology"
            target="_blank"
            rel="noopener"
            className="mt-6 inline-flex w-fit items-center gap-2 rounded-md border border-white/18 px-4 py-2 text-sm font-semibold text-white transition hover:border-accent hover:text-accent"
          >
            Read the Duke Vertices feature
            <ExternalLink aria-hidden size={16} />
          </a>
        </div>
      </div>

      <div className="mt-20">
        <h3 className="font-serif text-2xl text-white">System Architecture</h3>
        <div className="mt-8 grid gap-4 lg:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] lg:items-stretch">
          {architecture.map((node, index) => {
            const Icon = node.icon;
            return (
              <div key={node.title} className="contents">
                <article className="rounded-lg border border-white/12 bg-white/[0.035] p-6 transition hover:border-accent/60 hover:shadow-lift-dark">
                  <Icon aria-hidden className="text-accent" size={26} strokeWidth={1.8} />
                  <h4 className="mt-5 font-serif text-xl text-white">{node.title}</h4>
                  <p className="mt-3 text-sm leading-6 text-white/64">{node.description}</p>
                </article>
                {index < architecture.length - 1 ? (
                  <div className="flex items-center justify-center text-accent">
                    <ArrowRight aria-hidden className="hidden lg:block" size={22} />
                    <ArrowDown aria-hidden className="lg:hidden" size={22} />
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-20">
        <h3 className="font-serif text-2xl text-white">Sensor Field Guide</h3>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-white/62">
          VitalWave collects raw physiological, motion, and environmental channels rather than
          only low-frequency summaries. That matters because digital biomarker research often
          depends on interpreting how these signals interact.
        </p>
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {sensors.map((sensor) => (
            <SensorCard
              key={sensor.abbreviation}
              abbreviation={sensor.abbreviation}
              name={sensor.name}
              description={sensor.description}
              captures={sensor.captures}
              projectRole={sensor.projectRole}
            />
          ))}
        </div>
      </div>
    </Section>
  );
}
