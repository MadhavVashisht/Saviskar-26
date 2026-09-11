"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "motion/react";
import { Sparkles, Trophy, Building2, Calendar, Infinity as InfinityIcon } from "lucide-react";

function Counter({
  target,
  suffix = "",
  duration = 1500,
}: {
  target: number;
  suffix?: string;
  duration?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.7 });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return;

    let startTime: number | null = null;
    let frame: number;

    const animate = (time: number) => {
      if (!startTime) startTime = time;
      const progress = Math.min((time - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));

      if (progress < 1) {
        frame = requestAnimationFrame(animate);
      } else {
        setCount(target);
      }
    };

    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [inView, target, duration]);

  return (
    <span ref={ref}>
      {count}
      {suffix}
    </span>
  );
}

const EVENT_START = new Date("2026-10-24T00:00:00+05:30").getTime();

function Countdown() {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const updateCountdown = () => {
      const difference = Math.max(EVENT_START - Date.now(), 0);
      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / (1000 * 60)) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      });
    };

    updateCountdown();
    const interval = window.setInterval(updateCountdown, 1000);
    return () => window.clearInterval(interval);
  }, []);

  const units = [
    { value: timeLeft.days, label: "Days" },
    { value: timeLeft.hours, label: "Hours" },
    { value: timeLeft.minutes, label: "Minutes" },
    { value: timeLeft.seconds, label: "Seconds" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.8 }}
      className="liquid-glass relative overflow-hidden rounded-[28px] p-7 md:p-10"
    >
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="h-2 w-2 rounded-full bg-violet-400 animate-pulse shadow-[0_0_8px_#c084fc]" />
          <span className="text-[10px] uppercase tracking-[0.3em] text-white/50">
            The Countdown
          </span>
        </div>
        <span className="font-mono text-xs text-violet-300/80">OCTOBER 24, 2026</span>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {units.map((unit) => (
          <motion.div
            key={unit.label}
            whileHover={{ scale: 1.04, y: -3, borderColor: "rgba(168,85,247,0.5)" }}
            whileTap={{ scale: 0.97 }}
            transition={{ duration: 0.2 }}
            className="rounded-2xl border border-white/5 bg-white/[0.02] p-4 text-center transition-colors"
          >
            <div className="font-mono text-3xl font-bold tracking-tight text-white md:text-4xl">
              {String(unit.value).padStart(2, "0")}
            </div>
            <div className="mt-2 text-[10px] uppercase tracking-[0.2em] text-white/40">
              {unit.label}
            </div>
          </motion.div>
        ))}
      </div>

      <p className="mt-6 text-center text-xs tracking-wider text-white/45 md:text-sm">
        Until stadium floodlights illuminate Saviskar 2026 at CGC University.
      </p>
    </motion.div>
  );
}

const stats = [
  {
    type: "counter",
    target: 50,
    suffix: "+",
    label: "Competitive Events",
    desc: "Across tech, culture & sports",
    icon: Trophy,
  },
  {
    type: "counter",
    target: 100,
    suffix: "+",
    label: "Participating Colleges",
    desc: "From all across the nation",
    icon: Building2,
  },
  {
    type: "counter",
    target: 2,
    suffix: "",
    label: "Action-Packed Days",
    desc: "Non-stop celebration & arena battles",
    icon: Calendar,
  },
  {
    type: "infinity",
    label: "Endless Possibilities",
    desc: "Where true talent takes centerstage",
    icon: InfinityIcon,
  },
];

export default function About() {
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { once: true, amount: 0.25 });

  return (
    <section
      ref={sectionRef}
      id="about"
      className="relative overflow-hidden bg-black px-6 py-28 text-white md:px-10 md:py-36"
    >
      {/* Subtle stage haze accent in background */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-600/10 blur-[160px]" />

      <div className="relative z-10 mx-auto max-w-[1350px]">
        {/* Section Pill */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="liquid-glass mb-8 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.3em] text-violet-300"
        >
          <Sparkles size={12} />
          The Experience • Aevorian Reverie
        </motion.div>

        {/* Headings Grid */}
        <div className="grid gap-10 md:grid-cols-2 md:items-end md:gap-16">
          <motion.div
            initial={{ opacity: 0, y: 35 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-[clamp(3.5rem,7vw,6.8rem)] font-light leading-[0.88] tracking-tight text-white">
              More than <br />
              <span className="font-editorial text-violet-300 font-normal">a college fest.</span>
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.15 }}
          >
            <p className="max-w-xl text-base leading-7 text-white/60 md:text-xl md:leading-9">
              Guided by <span className="font-editorial text-violet-300 not-italic font-normal">Aevorian Reverie</span> — where tomorrow dreams awake. Saviskar brings technology, culture, creativity and competition
              together in one unforgettable 8K concert atmosphere.
            </p>
          </motion.div>
        </div>

        {/* Live Metrics Cards Grid */}
        <div className="mt-20 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 md:mt-28">
          {stats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 30 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.7, delay: index * 0.1 }}
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                className="liquid-glass group relative overflow-hidden rounded-[26px] p-8 transition-all hover:border-violet-500/40 hover:shadow-[0_20px_45px_rgba(168,85,247,0.15)]"
              >
                <div className="flex items-center justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-violet-300 transition-colors group-hover:bg-violet-500/20">
                    <IconComponent size={20} />
                  </div>
                  <span className="font-mono text-xs text-white/30">0{index + 1}</span>
                </div>

                <div className="mt-8">
                  {stat.type === "counter" ? (
                    <div className="font-sans text-5xl font-bold tracking-tight text-white md:text-6xl">
                      <Counter target={stat.target!} suffix={stat.suffix} />
                    </div>
                  ) : (
                    <div className="font-sans text-5xl font-bold tracking-tight text-violet-300 md:text-6xl">
                      ∞
                    </div>
                  )}

                  <h3 className="mt-4 text-base font-semibold text-white/90">
                    {stat.label}
                  </h3>
                  <p className="mt-1 text-xs text-white/45">
                    {stat.desc}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Countdown & Final Stage Statement */}
        <div className="mt-20 grid gap-10 md:grid-cols-2 md:items-center md:mt-28">
          <Countdown />

          <motion.div
            initial={{ opacity: 0, x: 25 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="flex flex-col justify-center rounded-[28px] border border-white/10 bg-white/[0.015] p-8 md:p-12"
          >
            <p className="text-[10px] uppercase tracking-[0.3em] text-violet-400">
              The Experience
            </p>
            <h3 className="mt-4 text-3xl font-light leading-tight text-white md:text-4xl">
              Two days. <br />
              Hundreds of moments. <br />
              <span className="font-editorial text-violet-300 font-normal">One stage.</span>
            </h3>
            <p className="mt-4 text-sm leading-6 text-white/50">
              CGC University, Mohali sets the benchmark for Punjab&apos;s biggest collegiate spectacle.
              Are you ready to claim your spotlight?
            </p>
          </motion.div>
        </div>
      </div>

      {/* Multi-stop Bottom Blend into Events */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-36 bg-gradient-to-b from-transparent via-black/80 to-black" />
    </section>
  );
}