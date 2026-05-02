"use client";

import React from "react";
import {
  Bell,
  Check,
  ChevronRight,
  KeyRound,
  Lock,
  Mail,
  MoonStar,
  ShieldCheck,
  Smartphone,
  Sparkles,
  User2,
  Zap,
} from "lucide-react";

const quickStats = [
  { label: "Security score", value: "92%", tone: "text-emerald-300" },
  { label: "Active alerts", value: "18", tone: "text-brand-cyan" },
  { label: "Devices", value: "2", tone: "text-violet-300" },
];

export default function SettingsPage() {
  const [user, setUser] = React.useState(null);
  const [preferences, setPreferences] = React.useState({
    browserAlerts: true,
    priceDropDigest: true,
    suspiciousLoginAlerts: true,
    darkMode: true,
    focusMode: false,
  });

  React.useEffect(() => {
    const storedUser = sessionStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const togglePreference = (key) => {
    setPreferences((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const settingRows = [
    {
      key: "browserAlerts",
      title: "Browser alerts",
      subtitle: "Instant alerts when prices drop below your target.",
      icon: Bell,
    },
    {
      key: "priceDropDigest",
      title: "Daily drop digest",
      subtitle: "Morning summary of all tracked product movements.",
      icon: Mail,
    },
    {
      key: "suspiciousLoginAlerts",
      title: "Login protection notices",
      subtitle: "Get notified when a new session is detected.",
      icon: ShieldCheck,
    },
    {
      key: "darkMode",
      title: "Dark mode",
      subtitle: "Premium dark theme optimized for market dashboards.",
      icon: MoonStar,
    },
    {
      key: "focusMode",
      title: "Focus mode",
      subtitle: "Reduce visual noise while analyzing product history.",
      icon: Zap,
    },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#060b13] px-4 py-6 sm:px-6 sm:py-10 md:px-10">
      <div className="pointer-events-none absolute -left-28 top-0 h-96 w-96 rounded-full bg-brand-cyan/10 blur-[120px]" />
      <div className="pointer-events-none absolute -right-20 bottom-10 h-80 w-80 rounded-full bg-violet-500/10 blur-[120px]" />

      <div className="mx-auto max-w-7xl space-y-6">
        <section className="rounded-[1.5rem] md:rounded-[2rem] border border-brand-border bg-brand-card/30 p-5 sm:p-7 backdrop-blur-xl md:p-10">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-cyan">
                Personalization Center
              </p>
              <h1 className="mt-2 text-2xl font-black tracking-tight text-white sm:text-3xl md:text-5xl">
                Settings that feel enterprise-grade.
              </h1>
              <p className="mt-3 max-w-2xl text-sm text-gray-400">
                Fine-tune your account, notifications, and security controls with a clean,
                premium control panel.
              </p>
            </div>
            <div className="flex w-full items-center gap-3 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 sm:w-auto">
              <Check className="h-4 w-4 text-emerald-300" />
              <span className="text-xs font-black uppercase tracking-[0.18em] text-emerald-300">
                Session Login Protected
              </span>
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <article className="rounded-[1.5rem] md:rounded-[2rem] border border-brand-border bg-brand-card/25 p-5 sm:p-6 md:p-8">
            <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-xl border border-brand-border bg-brand-bg/70 p-2.5">
                  <User2 className="h-5 w-5 text-brand-cyan" />
                </div>
                <h2 className="text-xl font-black text-white">Account Identity</h2>
              </div>
              <button className="rounded-xl border border-brand-border bg-brand-bg px-4 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-gray-300 transition hover:border-brand-cyan/40 hover:text-brand-cyan">
                Edit
              </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-brand-border bg-brand-bg/55 p-4">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Full name</p>
                <p className="mt-2 text-sm font-semibold text-white">{user?.name || "Guest User"}</p>
              </div>
              <div className="rounded-2xl border border-brand-border bg-brand-bg/55 p-4">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Email</p>
                <p className="mt-2 text-sm font-semibold text-white">
                  {user?.email || "hello@pricebuddy.app"}
                </p>
              </div>
              <div className="rounded-2xl border border-brand-border bg-brand-bg/55 p-4">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Role</p>
                <p className="mt-2 text-sm font-semibold text-white">Data Analyst</p>
              </div>
              <div className="rounded-2xl border border-brand-border bg-brand-bg/55 p-4">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Region</p>
                <p className="mt-2 text-sm font-semibold text-white">India (IST)</p>
              </div>
            </div>
          </article>

          <article className="rounded-[1.5rem] md:rounded-[2rem] border border-brand-border bg-brand-card/25 p-5 sm:p-6 md:p-8">
            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-xl border border-brand-border bg-brand-bg/70 p-2.5">
                <Sparkles className="h-5 w-5 text-brand-cyan" />
              </div>
              <h2 className="text-xl font-black text-white">Quick Status</h2>
            </div>

            <div className="space-y-3">
              {quickStats.map((stat) => (
                <div
                  key={stat.label}
                  className="flex items-center justify-between rounded-xl border border-brand-border bg-brand-bg/60 px-4 py-3"
                >
                  <span className="text-xs font-semibold text-gray-400">{stat.label}</span>
                  <span className={`text-sm font-black ${stat.tone}`}>{stat.value}</span>
                </div>
              ))}

              <div className="rounded-2xl border border-brand-cyan/20 bg-brand-cyan/10 p-4">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-cyan">
                  System Note
                </p>
                <p className="mt-2 text-sm text-gray-200">
                  New browser session always requires authentication before dashboard access.
                </p>
              </div>
            </div>
          </article>
        </section>

        <section className="rounded-[1.5rem] md:rounded-[2rem] border border-brand-border bg-brand-card/25 p-5 sm:p-6 md:p-8">
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-xl border border-brand-border bg-brand-bg/70 p-2.5">
              <Lock className="h-5 w-5 text-brand-cyan" />
            </div>
            <h2 className="text-xl font-black text-white">Preferences & Controls</h2>
          </div>

          <div className="space-y-3">
            {settingRows.map((item) => {
              const Icon = item.icon;
              const enabled = preferences[item.key];

              return (
                <div
                  key={item.key}
                  className="flex flex-col gap-3 rounded-2xl border border-brand-border bg-brand-bg/55 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 rounded-lg bg-white/5 p-2">
                      <Icon className="h-4 w-4 text-brand-cyan" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{item.title}</p>
                      <p className="text-xs text-gray-500">{item.subtitle}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => togglePreference(item.key)}
                    className={`relative h-7 w-12 rounded-full transition ${
                      enabled ? "bg-brand-cyan" : "bg-gray-700"
                    }`}
                    aria-label={`Toggle ${item.title}`}
                  >
                    <span
                      className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${
                        enabled ? "left-6" : "left-1"
                      }`}
                    />
                  </button>
                </div>
              );
            })}
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <button className="flex items-center justify-between rounded-2xl border border-brand-border bg-brand-card/20 p-5 text-left transition hover:border-brand-cyan/30">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.15em] text-white">Change Password</p>
              <p className="mt-1 text-xs text-gray-500">Refresh your credentials regularly.</p>
            </div>
            <KeyRound className="h-4 w-4 text-gray-400" />
          </button>

          <button className="flex items-center justify-between rounded-2xl border border-brand-border bg-brand-card/20 p-5 text-left transition hover:border-brand-cyan/30">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.15em] text-white">Connected Devices</p>
              <p className="mt-1 text-xs text-gray-500">Review and revoke active sessions.</p>
            </div>
            <Smartphone className="h-4 w-4 text-gray-400" />
          </button>

          <button className="flex items-center justify-between rounded-2xl border border-brand-border bg-brand-card/20 p-5 text-left transition hover:border-brand-cyan/30">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.15em] text-white">Notification Rules</p>
              <p className="mt-1 text-xs text-gray-500">Fine tune when and how alerts are sent.</p>
            </div>
            <ChevronRight className="h-4 w-4 text-gray-400" />
          </button>
        </section>
      </div>
    </div>
  );
}
