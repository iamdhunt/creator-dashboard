import { Link } from "react-router";

export function Welcome() {
  return (
    <div className="">
      <main className="flex items-center justify-center pt-16 pb-4 max-w-3xl mx-auto">
        <div className="flex-1 flex flex-col items-center gap-6 min-h-0">
          <header className="flex flex-col items-center gap-9">
            <div className="p-4 text-center space-y-6">
              <div className="text-2xl">
                Synqlo is a unified analytics dashboard for creators. We bring
                your key stats together, highlight what actually matters, and
                help you make smarter content decisions.
              </div>
            </div>
          </header>

          <div className="space-y-6">
            <div className="flex flex-row gap-6 items-center">
              <Link
                to="/auth/signup"
                className="px-12 py-4 bg-accent text-lg uppercase text-white font-bold rounded-md flex-1 text-center hover:scale-105 transition-all duration-300 ease-in-out"
              >
                Signup
              </Link>
            </div>
          </div>

          {/* Dummy Statistics Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full animate-in fade-in slide-in-from-bottom-8 duration-700 mt-12">
            {/* 1. Total Views - Area Chart */}
            <div className="bg-offwhite dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow col-span-2">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-neutral-500 dark:text-neutral-400 text-sm font-medium">
                    Total Views
                  </p>
                  <p className="text-3xl font-bold dark:text-white mt-1">
                    1.2M
                  </p>
                </div>
                <span className="text-emerald-500 text-xs font-bold bg-emerald-100 dark:bg-emerald-500/10 px-2 py-1 rounded-full">
                  +12.5%
                </span>
              </div>
              <div className="h-32 w-full flex items-end">
                <svg
                  className="w-full h-full overflow-visible"
                  preserveAspectRatio="none"
                  viewBox="0 0 100 100"
                >
                  <defs>
                    <linearGradient
                      id="gradientViews"
                      x1="0"
                      x2="0"
                      y1="0"
                      y2="1"
                    >
                      <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M0 80 C 20 75, 40 90, 60 50 S 80 20, 100 30 V 100 H 0 Z"
                    fill="url(#gradientViews)"
                  />
                  <path
                    d="M0 80 C 20 75, 40 90, 60 50 S 80 20, 100 30"
                    fill="none"
                    stroke="#8b5cf6"
                    strokeWidth="3"
                    vectorEffect="non-scaling-stroke"
                  />
                </svg>
              </div>
            </div>

            {/* 2. Total Interactions - Bar Chart */}
            <div className="bg-offwhite dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <p className="text-neutral-500 dark:text-neutral-400 text-sm font-medium">
                    Total Interactions
                  </p>
                  <p className="text-3xl font-bold dark:text-white mt-1">
                    48.2K
                  </p>
                </div>
              </div>
              <div className="h-32 flex items-end gap-3 justify-between">
                {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
                  <div
                    key={i}
                    className="w-full bg-neutral-100 dark:bg-neutral-800 rounded-t-sm relative group"
                    style={{ height: "100%" }}
                  >
                    <div
                      className="absolute bottom-0 w-full bg-accent dark:bg-amber-400 rounded-t-sm transition-all duration-300 group-hover:bg-amber-300"
                      style={{ height: `${h}%` }}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* 3. Active Subscribers - Trend */}
            <div className="bg-offwhite dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
              <div>
                <p className="text-neutral-500 dark:text-neutral-400 text-sm font-medium">
                  New Subscribers
                </p>
                <div className="flex items-baseline gap-2 mt-1">
                  <p className="text-3xl font-bold dark:text-white">854</p>
                  <span className="text-neutral-400 text-sm">this week</span>
                </div>
              </div>
              <div className="mt-4 flex gap-1 items-end h-24">
                {[20, 35, 30, 50, 45, 60, 55, 75, 65, 80, 70, 95].map(
                  (h, i) => (
                    <div
                      key={i}
                      className="flex-1 bg-cyan-500/20 dark:bg-cyan-500/20 hover:bg-cyan-500 rounded-sm transition-colors"
                      style={{ height: `${h}%` }}
                    ></div>
                  )
                )}
              </div>
            </div>

            {/* 4. Platform Growth - Progress Bars */}
            <div className="bg-offwhite dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-center col-span-2">
              <p className="text-neutral-500 dark:text-neutral-400 text-sm font-medium mb-6">
                Audience Growth by Platform
              </p>
              <div className="space-y-5">
                {[
                  { label: "YouTube", val: "85%", color: "bg-red-500" },
                  { label: "Instagram", val: "62%", color: "bg-pink-500" },
                  {
                    label: "TikTok",
                    val: "45%",
                    color: "bg-black dark:bg-white",
                  },
                ].map((item) => (
                  <div key={item.label}>
                    <div className="flex justify-between text-xs font-semibold mb-1 dark:text-neutral-300">
                      <span>{item.label}</span>
                      <span>{item.val}</span>
                    </div>
                    <div className="h-2 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${item.color}`}
                        style={{ width: item.val }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 5. Traffic Sources - Donut Chart */}
            <div className="bg-offwhite dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col items-center justify-center col-span-2">
              <div className="w-full flex justify-between items-start mb-2">
                <p className="text-neutral-500 dark:text-neutral-400 text-sm font-medium">
                  Traffic Sources
                </p>
              </div>
              <div className="relative w-40 h-40 flex items-center justify-center">
                {/* Conic Gradient for Pie Chart */}
                <div
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: `conic-gradient(
                           #8b5cf6 0% 35%, 
                           #f59e0b 35% 65%, 
                           #10b981 65% 100%
                        )`,
                  }}
                ></div>
                {/* Inner Cutout for Donut effect */}
                <div className="absolute inset-4 bg-white dark:bg-neutral-900 rounded-full z-10 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold dark:text-white">
                    Source
                  </span>
                  <span className="text-xs text-neutral-500">Breakdown</span>
                </div>
              </div>
              <div className="flex gap-4 mt-6 w-full justify-center">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-violet-500"></div>
                  <span className="text-xs font-medium dark:text-neutral-300">
                    Direct 35%
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                  <span className="text-xs font-medium dark:text-neutral-300">
                    Search 30%
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                  <span className="text-xs font-medium dark:text-neutral-300">
                    Social 35%
                  </span>
                </div>
              </div>
            </div>

            {/* 6. Audience Age - Distribution Bar Chart */}
            <div className="bg-offwhite dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <p className="text-neutral-500 dark:text-neutral-400 text-sm font-medium mb-6">
                Age Demographics
              </p>
              <div className="flex items-end justify-between h-32 gap-2 px-2">
                {[
                  { label: "13-17", val: 15, h: "h-[15%]" },
                  { label: "18-24", val: 45, h: "h-[45%]" },
                  { label: "25-34", val: 68, h: "h-[68%]" },
                  { label: "35-44", val: 30, h: "h-[30%]" },
                  { label: "45+", val: 10, h: "h-[10%]" },
                ].map((group) => (
                  <div
                    key={group.label}
                    className="flex flex-col items-center justify-end w-full group h-full"
                  >
                    <div
                      className={`w-full max-w-10 bg-accent/20 dark:bg-accent/20 group-hover:bg-accent rounded-t-sm transition-all duration-300 relative ${group.h}`}
                    >
                      <span className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-xs font-bold bg-neutral-800 text-white px-2 py-1 rounded">
                        {group.val}%
                      </span>
                    </div>
                    <span className="text-[10px] text-neutral-400 mt-2 font-medium">
                      {group.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* 7. Top Countries - List Chart */}
            <div className="bg-offwhite dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-center mb-6">
                <p className="text-neutral-500 dark:text-neutral-400 text-sm font-medium">
                  Top Regions
                </p>
                <span className="text-xs text-neutral-400">Last 30 days</span>
              </div>
              <div className="space-y-4">
                {[
                  { country: "United States", flag: "🇺🇸", pct: 42 },
                  { country: "United Kingdom", flag: "🇬🇧", pct: 24 },
                  { country: "Germany", flag: "🇩🇪", pct: 15 },
                  { country: "Canada", flag: "🇨🇦", pct: 9 },
                ].map((item) => (
                  <div key={item.country} className="flex items-center gap-3">
                    <span className="text-lg">{item.flag}</span>
                    <div className="flex-1">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-medium dark:text-neutral-200">
                          {item.country}
                        </span>
                        <span className="text-neutral-500">{item.pct}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-neutral-800 dark:bg-neutral-400 rounded-full"
                          style={{ width: `${item.pct}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
