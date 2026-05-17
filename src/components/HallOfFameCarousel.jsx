import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'framer-motion';
import { GlassCard } from './ui/GlassCard';
import { dedupeResultsById } from '../lib/dedupeResults';

function HallOfFameCard({ result }) {
  const displayRank = result.achievement || result.rank || 'Top Rank';

  return (
    <GlassCard className="flex min-w-[320px] max-w-[360px] flex-shrink-0 items-center gap-4 border-l-4 border-l-[#D90429] px-6 py-4">
      <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-slate-100">
        {result.photo ? (
          <img src={result.photo} alt={result.name} className="h-full w-full object-cover" />
        ) : (
          <div className="font-serif text-2xl font-black text-[#0A0F2C]">
            {result.name?.charAt(0) || 'S'}
          </div>
        )}
      </div>
      <div className="min-w-0">
        <h4 className="text-lg font-bold text-[#0A0F2C]">{result.name}</h4>
        <p className="mt-1 text-xl font-black text-[#D90429]">{displayRank}</p>
        {result.college && (
          <p className="mt-1 text-sm font-semibold text-slate-700">{result.college}</p>
        )}
        {result.exam && (
          <p className="mt-0.5 text-xs uppercase tracking-wide text-slate-500">{result.exam}</p>
        )}
      </div>
    </GlassCard>
  );
}

/** Auto-scrolls a single copy of each student (no duplicate tiles). */
export function HallOfFameCarousel({ results = [] }) {
  const unique = dedupeResultsById(results);
  const reduceMotion = useReducedMotion();
  const containerRef = useRef(null);
  const trackRef = useRef(null);
  const [canScroll, setCanScroll] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    const track = trackRef.current;
    if (!container || !track) return;

    const measure = () => {
      setCanScroll(track.scrollWidth > container.clientWidth + 8);
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(container);
    ro.observe(track);
    return () => ro.disconnect();
  }, [unique]);

  useEffect(() => {
    if (reduceMotion || !canScroll) return;

    const track = trackRef.current;
    const container = containerRef.current;
    if (!track || !container) return;

    let offset = 0;
    let rafId = 0;
    const speed = 0.75;

    const tick = () => {
      const maxOffset = track.scrollWidth - container.clientWidth;
      offset += speed;
      if (offset >= maxOffset) {
        offset = 0;
      }
      track.style.transform = `translate3d(${-offset}px, 0, 0)`;
      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [unique, canScroll, reduceMotion]);

  if (unique.length === 0) return null;

  const track = (
    <div ref={trackRef} className="flex w-max gap-6 px-4 py-4 will-change-transform">
      {unique.map((result) => (
        <HallOfFameCard key={result.id} result={result} />
      ))}
    </div>
  );

  if (reduceMotion || !canScroll) {
    return (
      <div
        ref={containerRef}
        className="flex justify-center overflow-hidden px-4 py-4"
      >
        {track}
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative w-full overflow-hidden">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-[#F8F9FA] to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-[#F8F9FA] to-transparent" />
      {track}
    </div>
  );
}
