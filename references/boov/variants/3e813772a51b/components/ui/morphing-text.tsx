"use client"

import { useCallback, useEffect, useRef } from "react"

import { clsx } from "clsx"

const morphTime = 0.75
const cooldownTime = 0.5
const thresholdFilter = 'url("#threshold") blur(0.6px)'
// A suspended tab or a busy mobile main thread can hand requestAnimationFrame
// a very large delta. Cap the amount of animation time one frame can consume
// so the opening words cannot skip straight to the final state.
const maxFrameDelta = 1 / 20

interface MorphingTextOptions {
  /** Seconds the first text takes to resolve out of blur. 0 shows it at once. */
  entrance: number
  /** Seconds to hold on the first text before the first morph starts. */
  hold: number
  /** When false, the sequence settles on the last text instead of cycling. */
  loop: boolean
  onComplete?: () => void
}

const useMorphingText = (
  texts: string[],
  { entrance, hold, loop, onComplete }: MorphingTextOptions
) => {
  const textIndexRef = useRef(0)
  const morphRef = useRef(0)
  const cooldownRef = useRef(0)
  const entranceRef = useRef(entrance)
  const holdRef = useRef(hold)
  const doneRef = useRef(false)
  const timeRef = useRef(new Date())

  const text1Ref = useRef<HTMLSpanElement>(null)
  const text2Ref = useRef<HTMLSpanElement>(null)

  const onCompleteRef = useRef(onComplete)
  useEffect(() => {
    onCompleteRef.current = onComplete
  }, [onComplete])

  const setStyles = useCallback(
    (fraction: number) => {
      const [current1, current2] = [text1Ref.current, text2Ref.current]
      if (!current1 || !current2) return

      current2.style.filter = `blur(${Math.min(8 / fraction - 8, 100)}px)`
      current2.style.opacity = `${Math.pow(fraction, 0.4)}`

      const invertedFraction = 1 - fraction
      current1.style.filter = `blur(${Math.min(
        8 / invertedFraction - 8,
        100
      )}px)`
      current1.style.opacity = `${Math.pow(invertedFraction, 0.4)}`

      current1.textContent = texts[textIndexRef.current % texts.length]
      current2.textContent = texts[(textIndexRef.current + 1) % texts.length]
    },
    [texts]
  )

  /** Resolve the first text out of blur on the same curve the morph uses, so
   *  the entrance and the morph read as one continuous effect. */
  const setEntranceStyles = useCallback(
    (fraction: number) => {
      const [current1, current2] = [text1Ref.current, text2Ref.current]
      if (!current1 || !current2) return

      current1.textContent = texts[0]
      current2.textContent = texts[1 % texts.length]

      current1.style.filter = `blur(${
        fraction > 0 ? Math.min(8 / fraction - 8, 100) : 100
      }px)`
      current1.style.opacity = `${Math.pow(fraction, 0.4)}`
      current2.style.filter = "none"
      current2.style.opacity = "0"
    },
    [texts]
  )

  /** Pin a single text at full opacity with no blur - used for the opening
   *  hold and for the final resting state. */
  const settleOn = useCallback((text: string) => {
    const [current1, current2] = [text1Ref.current, text2Ref.current]
    if (!current1 || !current2) return

    current1.style.filter = "none"
    current1.style.opacity = "0"
    current2.style.filter = "none"
    current2.style.opacity = "1"
    current2.textContent = text
  }, [])

  const doMorph = useCallback(() => {
    morphRef.current -= cooldownRef.current
    cooldownRef.current = 0

    let fraction = morphRef.current / morphTime

    if (fraction > 1) {
      cooldownRef.current = cooldownTime
      fraction = 1
    }

    setStyles(fraction)

    if (fraction === 1) {
      textIndexRef.current++
    }
  }, [setStyles])

  const doCooldown = useCallback(() => {
    morphRef.current = 0
    const [current1, current2] = [text1Ref.current, text2Ref.current]
    if (current1 && current2) {
      current2.style.filter = "none"
      current2.style.opacity = "1"
      current1.style.filter = "none"
      current1.style.opacity = "0"
    }
  }, [])

  useEffect(() => {
    let animationFrameId: number
    // Reset here rather than at hook creation so the gap between render and
    // mount doesn't get charged against the opening hold.
    timeRef.current = new Date()

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate)

      const newTime = new Date()
      const dt = Math.min(
        maxFrameDelta,
        (newTime.getTime() - timeRef.current.getTime()) / 1000
      )
      timeRef.current = newTime

      // Opening entrance: the first text condenses out of blur.
      if (entranceRef.current > 0) {
        entranceRef.current -= dt
        const fraction = Math.max(
          0,
          Math.min(1, 1 - entranceRef.current / entrance)
        )
        setEntranceStyles(fraction)
        return
      }

      // Opening hold: show the first text plainly so it can be read.
      if (holdRef.current > 0) {
        holdRef.current -= dt
        settleOn(texts[0])
        return
      }

      cooldownRef.current -= dt

      if (cooldownRef.current <= 0) doMorph()
      else doCooldown()

      if (!loop && textIndexRef.current >= texts.length - 1) {
        settleOn(texts[texts.length - 1])
        cancelAnimationFrame(animationFrameId)
        if (!doneRef.current) {
          doneRef.current = true
          onCompleteRef.current?.()
        }
      }
    }

    animate()
    return () => {
      cancelAnimationFrame(animationFrameId)
    }
  }, [doMorph, doCooldown, settleOn, setEntranceStyles, texts, loop, entrance])

  return { text1Ref, text2Ref }
}

interface MorphingTextProps {
  className?: string
  texts: string[]
  /** Seconds the first text takes to resolve out of blur. Defaults to 0. */
  entrance?: number
  /** Seconds the first text stays put before morphing. Defaults to 0. */
  hold?: number
  /** Set false to stop on the last text rather than cycling. Defaults to true. */
  loop?: boolean
  onComplete?: () => void
}

const Texts: React.FC<Omit<MorphingTextProps, "className">> = ({
  texts,
  entrance = 0,
  hold = 0,
  loop = true,
  onComplete,
}) => {
  const { text1Ref, text2Ref } = useMorphingText(texts, {
    entrance,
    hold,
    loop,
    onComplete,
  })
  return (
    <>
      <span
        className="absolute inset-x-0 top-0 m-auto inline-block w-full"
        ref={text1Ref}
        style={{ filter: "blur(100px)", opacity: 0 }}
      >
        {texts[0]}
      </span>
      <span
        className="absolute inset-x-0 top-0 m-auto inline-block w-full"
        ref={text2Ref}
        style={{ filter: "none", opacity: 0 }}
      >
        {texts[1 % texts.length]}
      </span>
    </>
  )
}

const SvgFilters: React.FC = () => (
  <svg
    id="filters"
    className="fixed h-0 w-0"
    preserveAspectRatio="xMidYMid slice"
  >
    <defs>
      <filter id="threshold" colorInterpolationFilters="sRGB">
        <feColorMatrix
          in="SourceGraphic"
          type="matrix"
          values="1 0 0 0 0
                  0 1 0 0 0
                  0 0 1 0 0
                  0 0 0 255 -140"
        />
      </filter>
    </defs>
  </svg>
)

// Only structural classes here: the threshold filter and the relative box the two
// overlapping spans position against. Typography is left to the caller so this
// composes with the CSS modules the rest of the site uses.
export const MorphingText: React.FC<MorphingTextProps> = ({
  texts,
  className,
  entrance,
  hold,
  loop,
  onComplete,
}) => (
  <>
    {/* Keep the definition outside the filtered element. Mobile WebKit can
        fail a fragment filter when its SVG lives inside the element consuming
        it; rendering it first as a sibling preserves the desktop threshold
        effect on mobile instead of falling back to a different animation. */}
    <SvgFilters />
    <div
      className={clsx(
        "relative mx-auto w-full text-center leading-none",
        className
      )}
      style={{ filter: thresholdFilter, WebkitFilter: thresholdFilter }}
    >
      <Texts
        texts={texts}
        entrance={entrance}
        hold={hold}
        loop={loop}
        onComplete={onComplete}
      />
    </div>
  </>
)
