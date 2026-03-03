import React from 'react';
import {
  Sparkles,
  Rocket,
  PenSquare,
  Globe,
  Wand2,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';

const features = [
  {
    icon: PenSquare,
    title: 'Content Hooks Generator',
    description:
      'Video, reel aur post ke liye attention-grabbing hooks generate karo in seconds.',
  },
  {
    icon: Wand2,
    title: 'Caption + Hashtag Ideas',
    description:
      'Niche-based captions aur hashtags lo jo engagement improve karne me help karein.',
  },
  {
    icon: Globe,
    title: 'Single Page, Fast Setup',
    description:
      'Ek simple web page jo quickly run ho aur aap turant use kar sako.',
  },
];

const steps = [
  'Apna topic ya video idea likho',
  'Tone choose karo (viral, professional, funny, motivational)',
  'Generate par click karke ready hooks copy karo',
];

export default function App() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto flex w-full max-w-6xl flex-col px-6 py-10 md:px-10">
        <header className="rounded-3xl border border-white/10 bg-gradient-to-br from-indigo-500/20 via-fuchsia-500/10 to-emerald-400/10 p-8 shadow-2xl backdrop-blur">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.15em] text-cyan-200">
            <Sparkles className="h-4 w-4" />
            AI Web App Demo
          </div>
          <h1 className="text-3xl font-extrabold leading-tight md:text-5xl">
            Aapke link ke idea par based
            <span className="block text-cyan-300">single-page website</span>
          </h1>
          <p className="mt-4 max-w-2xl text-sm text-slate-200 md:text-base">
            Ye ek clean, modern aur responsive web page hai jo aapke “single coding me kaam kare”
            requirement ko match karta hai. Isko aap landing page, AI tool intro ya SaaS demo ke
            liye use kar sakte ho.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button className="inline-flex items-center gap-2 rounded-xl bg-cyan-400 px-5 py-3 font-semibold text-slate-950 transition hover:bg-cyan-300">
              Start Now <ArrowRight className="h-4 w-4" />
            </button>
            <button className="rounded-xl border border-white/25 px-5 py-3 font-semibold text-white transition hover:bg-white/10">
              View Demo
            </button>
          </div>
        </header>

        <section className="mt-10 grid gap-4 md:grid-cols-3">
          {features.map((item) => {
            const Icon = item.icon;
            return (
              <article
                key={item.title}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition hover:-translate-y-1 hover:border-cyan-300/40"
              >
                <div className="mb-4 inline-flex rounded-xl bg-cyan-400/15 p-3 text-cyan-300">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm text-slate-300">{item.description}</p>
              </article>
            );
          })}
        </section>

        <section className="mt-10 rounded-3xl border border-white/10 bg-slate-900/70 p-6 md:p-8">
          <div className="mb-6 flex items-center gap-2 text-cyan-300">
            <Rocket className="h-5 w-5" />
            <h2 className="text-xl font-bold">Kaise kaam karta hai?</h2>
          </div>
          <div className="space-y-4">
            {steps.map((step, idx) => (
              <div key={step} className="flex items-start gap-3 rounded-xl bg-white/[0.03] p-4">
                <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-300" />
                <p className="text-sm text-slate-200">
                  <span className="mr-2 font-semibold text-cyan-200">Step {idx + 1}:</span>
                  {step}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
