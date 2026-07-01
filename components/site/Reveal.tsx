"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Fades and rises its children into view the first time they enter the
 * viewport. Styling lives in globals.css (`[data-reveal]`), so this only
 * toggles the revealed flag.
 *
 * Reliability first: content must never stay invisible. If the element is
 * already on screen at mount we reveal immediately, and a fallback timer
 * guarantees reveal even if the IntersectionObserver never fires (fast
 * programmatic scrolls, unsupported environments). Reduced motion is handled
 * in CSS, which simply skips the hidden state.
 */
export default function Reveal({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Already in (or near) the viewport at mount — reveal right away.
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.92 && rect.bottom > 0) {
      setRevealed(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setRevealed(true);
          observer.disconnect();
        }
      },
      { threshold: 0, rootMargin: "0px 0px -8% 0px" },
    );
    observer.observe(el);

    // Safety net: never leave content hidden if the observer misses.
    const fallback = window.setTimeout(() => setRevealed(true), 1200);

    return () => {
      observer.disconnect();
      window.clearTimeout(fallback);
    };
  }, []);

  return (
    <div ref={ref} data-reveal data-revealed={revealed} className={className}>
      {children}
    </div>
  );
}
