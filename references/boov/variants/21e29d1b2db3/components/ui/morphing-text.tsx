"use client"

import { useCallback, useEffect, useId, useRef } from "react"

import { clsx } from "clsx"

const morphTime = 0.72
const cooldownTime = 0.5
// The threshold look only needs the 0–12px range. Capping it here and keeping
// the filter regions tight avoids the huge offscreen surfaces that made iOS
// Safari repaint several million pixels per frame.
const maxBlur = 12
const svgNamespace = "http://www.w3.org/2000/svg"
// A suspended tab or a busy mobile main thread can hand requestAnimationFrame
// a very large delta. Cap the amount of animation time one frame can consume
// so the opening words cannot skip straight to the final state.
const maxFrameDelta = 1 / 18

// Ease both ends of the liquid handoff so the letters gather and release
// without a visible snap through the midpoint. The total morph is only about
// four percent quicker; most of the perceived polish comes from this curve.
const smoothMorphFraction = (fraction: number) =>
  fraction * fraction * (3 - 2 * fraction)

interface MorphingTextOptions {
  /** Seconds the first text takes to resolve out of blur. 0 shows it at once. */
  entrance: number
  /** Seconds to hold on the first text before the first morph starts. */
  hold: number
  /** When false, the sequence settles on the last text instead of cycling. */
  loop: boolean
  onComplete?: () => void
}

const blurForFraction = (fraction: number) =>
  fraction > 0 ? Math.min(8 / fraction - 8, maxBlur) : maxBlur

const setLayerText = (layer: SVGGElement, text: string) => {
  if (layer.dataset.text === text) return

  const lines = text.split("\n").map((line, index) => {
    const textNode = document.createElementNS(svgNamespace, "text")
    textNode.setAttribute("x", "50%")
    textNode.setAttribute("y", `${(index + 1) * 0.78}em`)
    textNode.setAttribute("text-anchor", "middle")
    textNode.setAttribute("fill", "currentColor")
    textNode.textContent = line
    return textNode
  })

  layer.replaceChildren(...lines)
  layer.dataset.text = text
}

const setLayerState = (
  layer: SVGGElement | null,
  blur: SVGFEGaussianBlurElement | null,
  text: string,
  blurAmount: number,
  opacity: number,
) => {
  if (!layer || !blur) return
  setLayerText(layer, text)
  const nextBlur = `${Math.max(0, blurAmount).toFixed(3)}`
  const nextOpacity = `${opacity.toFixed(4)}`
  const nextFilter = blurAmount > 0 ? layer.dataset.blurFilter ?? "none" : "none"

  if (blur.getAttribute("stdDeviation") !== nextBlur) {
    blur.setAttribute("stdDeviation", nextBlur)
  }
  if (layer.getAttribute("opacity") !== nextOpacity) {
    layer.setAttribute("opacity", nextOpacity)
  }
  if (layer.getAttribute("filter") !== nextFilter) {
    layer.setAttribute("filter", nextFilter)
  }
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
  const timeRef = useRef(0)

  const text1Ref = useRef<SVGGElement>(null)
  const text2Ref = useRef<SVGGElement>(null)
  const blur1Ref = useRef<SVGFEGaussianBlurElement>(null)
  const blur2Ref = useRef<SVGFEGaussianBlurElement>(null)
  const thresholdRef = useRef<SVGGElement>(null)

  const setThresholdActive = useCallback((active: boolean) => {
    const threshold = thresholdRef.current
    if (!threshold) return
    const nextFilter = active
      ? threshold.dataset.thresholdFilter ?? "none"
      : "none"
    if (threshold.getAttribute("filter") !== nextFilter) {
      threshold.setAttribute("filter", nextFilter)
    }
  }, [])

  const onCompleteRef = useRef(onComplete)
  useEffect(() => {
    onCompleteRef.current = onComplete
  }, [onComplete])

  const setStyles = useCallback(
    (fraction: number) => {
      setThresholdActive(true)
      const invertedFraction = 1 - fraction
      setLayerState(
        text1Ref.current,
        blur1Ref.current,
        texts[textIndexRef.current % texts.length],
        blurForFraction(invertedFraction),
        Math.pow(invertedFraction, 0.4),
      )
      setLayerState(
        text2Ref.current,
        blur2Ref.current,
        texts[(textIndexRef.current + 1) % texts.length],
        blurForFraction(fraction),
        Math.pow(fraction, 0.4),
      )
    },
    [setThresholdActive, texts]
  )

  /** Resolve the first text out of blur on the same curve the morph uses, so
   *  the entrance and the morph read as one continuous effect. */
  const setEntranceStyles = useCallback(
    (fraction: number) => {
      setThresholdActive(true)
      setLayerState(
        text1Ref.current,
        blur1Ref.current,
        texts[0],
        blurForFraction(fraction),
        Math.pow(fraction, 0.4),
      )
      setLayerState(
        text2Ref.current,
        blur2Ref.current,
        texts[1 % texts.length],
        0,
        0,
      )
    },
    [setThresholdActive, texts]
  )

  /** Pin a single text at full opacity with no blur - used for the opening
   *  hold and for the final resting state. */
  const settleOn = useCallback((text: string) => {
    setThresholdActive(false)
    setLayerState(text1Ref.current, blur1Ref.current, text, 0, 0)
    setLayerState(text2Ref.current, blur2Ref.current, text, 0, 1)
  }, [setThresholdActive])

  const doMorph = useCallback(() => {
    morphRef.current -= cooldownRef.current
    cooldownRef.current = 0

    let fraction = morphRef.current / morphTime

    if (fraction > 1) {
      cooldownRef.current = cooldownTime
      fraction = 1
    }

    setStyles(smoothMorphFraction(fraction))

    if (fraction === 1) {
      textIndexRef.current++
    }
  }, [setStyles])

  const doCooldown = useCallback(() => {
    morphRef.current = 0
    setThresholdActive(false)
    const currentText = texts[textIndexRef.current % texts.length]
    setLayerState(text1Ref.current, blur1Ref.current, currentText, 0, 0)
    setLayerState(text2Ref.current, blur2Ref.current, currentText, 0, 1)
  }, [setThresholdActive, texts])

  useEffect(() => {
    let animationFrameId: number
    // Reset here rather than at hook creation so the gap between render and
    // mount doesn't get charged against the opening hold.
    timeRef.current = performance.now()

    const animate = (timestamp: number) => {
      animationFrameId = requestAnimationFrame(animate)

      const dt = Math.min(
        maxFrameDelta,
        (timestamp - timeRef.current) / 1000
      )
      timeRef.current = timestamp

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

    animationFrameId = requestAnimationFrame(animate)
    return () => {
      cancelAnimationFrame(animationFrameId)
    }
  }, [doMorph, doCooldown, settleOn, setEntranceStyles, texts, loop, entrance])

  return { text1Ref, text2Ref, blur1Ref, blur2Ref, thresholdRef }
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

const SvgTextLines = ({ text }: { text: string }) => (
  <>
    {text.split("\n").map((line, index) => (
      <text
        key={`${line}-${index}`}
        x="50%"
        y={`${(index + 1) * 0.78}em`}
        textAnchor="middle"
        fill="currentColor"
      >
        {line}
      </text>
    ))}
  </>
)

const SvgMorph: React.FC<MorphingTextProps> = ({
  texts,
  className,
  entrance = 0,
  hold = 0,
  loop = true,
  onComplete,
}) => {
  const reactId = useId().replace(/:/g, "")
  const thresholdId = `morph-threshold-${reactId}`
  const blur1Id = `morph-blur-a-${reactId}`
  const blur2Id = `morph-blur-b-${reactId}`
  const { text1Ref, text2Ref, blur1Ref, blur2Ref, thresholdRef } = useMorphingText(texts, {
    entrance,
    hold,
    loop,
    onComplete,
  })

  return (
    <svg
      className={clsx("relative mx-auto w-full overflow-visible text-center", className)}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <filter
          id={blur1Id}
          x="-20%"
          y="-60%"
          width="140%"
          height="220%"
          colorInterpolationFilters="sRGB"
        >
          <feGaussianBlur ref={blur1Ref} stdDeviation={maxBlur} />
        </filter>
        <filter
          id={blur2Id}
          x="-20%"
          y="-60%"
          width="140%"
          height="220%"
          colorInterpolationFilters="sRGB"
        >
          <feGaussianBlur ref={blur2Ref} stdDeviation={0} />
        </filter>
        <filter
          id={thresholdId}
          x="-15%"
          y="-30%"
          width="130%"
          height="160%"
          colorInterpolationFilters="sRGB"
        >
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
      <g
        ref={thresholdRef}
        data-threshold-filter={`url(#${thresholdId})`}
        filter="none"
      >
        <g
          ref={text1Ref}
          data-text={texts[0]}
          data-blur-filter={`url(#${blur1Id})`}
          filter="none"
          opacity={0}
        >
          <SvgTextLines text={texts[0]} />
        </g>
        <g
          ref={text2Ref}
          data-text={texts[1 % texts.length]}
          data-blur-filter={`url(#${blur2Id})`}
          filter="none"
          opacity={0}
        >
          <SvgTextLines text={texts[1 % texts.length]} />
        </g>
      </g>
    </svg>
  )
}

// All blur and threshold primitives live inside the same SVG as the text they
// affect. Mobile WebKit can drop a CSS url(#filter) attached to an HTML box,
// leaving only an opacity fade; SVG filter attributes keep the liquid threshold
// path intact across desktop and phone browsers.
export const MorphingText: React.FC<MorphingTextProps> = ({
  texts,
  className,
  entrance,
  hold,
  loop,
  onComplete,
}) => (
  <SvgMorph
    texts={texts}
    className={className}
    entrance={entrance}
    hold={hold}
    loop={loop}
    onComplete={onComplete}
  />
)
