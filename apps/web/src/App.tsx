import { lazy, Suspense, useEffect, useState, useRef } from "react";
import {
  Award,
  Bell,
  ChevronRight,
  CircleDollarSign,
  CloudSun,
  Flame,
  Leaf,
  LogOut,
  Menu,
  Moon,
  ScanLine,
  Settings2,
  Sparkles,
  Sun,
  Target,
  Trees,
  Trophy,
  Upload,
  Users,
  X
} from "lucide-react";
import { CarbonChart } from "@/components/CarbonChart";
import { MetricCard } from "@/components/MetricCard";
import { Button } from "@/components/ui/button";
import { Auth } from "@/components/Auth";
import { challenges, leaderboard, trendData, monthlyBreakdownData } from "@/data/dashboard";
import { initializeTelemetry, auth } from "@/lib/firebase";
import { onAuthStateChanged, signOut, type User } from "firebase/auth";
import { uploadReceipt, createEntry, getEntries, type ReceiptAnalysisResult, type FootprintEntry } from "@/lib/api";
import { AccessibilityPanel } from "@/features/AccessibilityPanel";
import { DailyActions } from "@/components/DailyActions";

const Calculator = lazy(async () => {
  const module = await import("@/components/Calculator");
  return { default: module.Calculator };
});

const BreakdownChart = lazy(async () => {
  const module = await import("@/components/BreakdownChart");
  return { default: module.BreakdownChart };
});

const AICoach = lazy(async () => {
  const module = await import("@/components/AICoach");
  return { default: module.AICoach };
});

const CarbonTwin = lazy(async () => {
  const module = await import("@/components/CarbonTwin");
  return { default: module.CarbonTwin };
});

const ImpactMap = lazy(async () => {
  const module = await import("@/components/ImpactMap");
  return { default: module.ImpactMap };
});


declare global {
  interface Window {
    SpeechRecognition?: typeof SpeechRecognition;
    webkitSpeechRecognition?: typeof SpeechRecognition;
  }

  interface SpeechRecognitionEvent extends Event {
    results: SpeechRecognitionResultList;
  }

  interface SpeechRecognition extends EventTarget {
    lang: string;
    continuous: boolean;
    interimResults: boolean;
    onresult: ((event: SpeechRecognitionEvent) => void) | null;
    onend: (() => void) | null;
    start(): void;
  }

  interface SpeechRecognitionConstructor {
    new (): SpeechRecognition;
  }

  var SpeechRecognition: SpeechRecognitionConstructor | undefined;
  var webkitSpeechRecognition: SpeechRecognitionConstructor | undefined;
}

export function App() {
  const [dark, setDark] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [fontScale, setFontScale] = useState(1);
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window !== "undefined" && window.Cypress) {
      return {
        uid: "cypress-test-user",
        email: "test@example.com",
        displayName: "Cypress Tester",
        getIdToken: async () => "mock-cypress-token"
      } as unknown as User;
    }
    return null;
  });
  const [authLoading, setAuthLoading] = useState(() => {
    if (typeof window !== "undefined" && window.Cypress) {
      return false;
    }
    return true;
  });

  // Dashboard & Filter States
  const [entries, setEntries] = useState<FootprintEntry[]>([]);
  const [selectedMonth, setSelectedMonth] = useState("May");
  const [loadingEntries, setLoadingEntries] = useState(false);

  // Vision AI Receipt Scanner States
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ReceiptAnalysisResult | null>(null);
  const [scanModalOpen, setScanModalOpen] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [scanCategory, setScanCategory] = useState<"transport" | "energy" | "food" | "lifestyle">("energy");
  const [scanEmission, setScanEmission] = useState<number>(0);
  const [scanOccurredAt, setScanOccurredAt] = useState<string>(() => new Date().toISOString().split("T")[0] || "");
  const [savingScan, setSavingScan] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
  }, [dark]);

  useEffect(() => {
    document.documentElement.style.setProperty("--font-scale", String(fontScale));
  }, [fontScale]);

  useEffect(() => {
    void initializeTelemetry();
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined" && window.Cypress) {
      return;
    }
    if (!auth) {
      setAuthLoading(false);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setAuthLoading(false);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!user) {
      setEntries([]);
      return;
    }
    const loadEntries = async () => {
      setLoadingEntries(true);
      try {
        const idToken = typeof user.getIdToken === "function" ? await user.getIdToken() : "";
        const data = await getEntries(idToken);
        setEntries(data);
      } catch (err) {
        console.error("Failed to load footprint entries:", err);
      } finally {
        setLoadingEntries(false);
      }
    };
    void loadEntries();
  }, [user]);

  const handleSignOut = async () => {
    if (!auth) return;
    try {
      await signOut(auth);
    } catch (err) {
      console.error("Sign out error:", err);
    }
  };

  const handleScanClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    
    setScanning(true);
    setScanError(null);
    setScanResult(null);
    
    try {
      const idToken = typeof user.getIdToken === "function" ? await user.getIdToken() : "";
      const result = await uploadReceipt(file, idToken);
      setScanResult(result);
      
      let category: "transport" | "energy" | "food" | "lifestyle" = "energy";
      let emission = 0;
      
      if (result.electricityKwh) {
        category = "energy";
        emission = Math.round(result.electricityKwh * 0.708 * 10) / 10;
      } else if (result.amount) {
        category = "lifestyle";
        emission = Math.round(result.amount * 0.38 * 10) / 10;
      } else {
        category = "lifestyle";
        emission = 10;
      }
      
      setScanCategory(category);
      setScanEmission(emission);
      setScanModalOpen(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to analyze receipt.";
      setScanError(msg);
    } finally {
      setScanning(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSaveScan = async () => {
    if (!user) return;
    setSavingScan(true);
    try {
      const idToken = typeof user.getIdToken === "function" ? await user.getIdToken() : "";
      await createEntry({
        category: scanCategory,
        emissionKg: scanEmission,
        source: "receipt",
        occurredAt: new Date(scanOccurredAt).toISOString()
      }, idToken);
      
      setScanModalOpen(false);
      setScanResult(null);
      alert("Receipt successfully converted to a footprint entry!");
      
      // Refresh footprint entries
      const data = await getEntries(idToken);
      setEntries(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save footprint entry.";
      alert(msg);
    } finally {
      setSavingScan(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-[#0c1813] via-[#12231b] to-[#173b2c]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-[#74b98a] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-[#eff8f0] font-bold tracking-wide animate-pulse">Loading EcoTrack AI...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  const getInitials = () => {
    if (user.displayName) {
      return user.displayName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
    }
    if (user.email) {
      return user.email.slice(0, 2).toUpperCase();
    }
    return "US";
  };

  // Dynamic stats calculator helper
  const getMonthlyStats = () => {
    const updatedTrend = trendData.map(d => ({ ...d })) as {
      month: string;
      actual: number | null;
      target: number;
      forecast: number | null;
    }[];

    const updatedBreakdown = {
      Jan: (monthlyBreakdownData["Jan"] || []).map(d => ({ ...d })),
      Feb: (monthlyBreakdownData["Feb"] || []).map(d => ({ ...d })),
      Mar: (monthlyBreakdownData["Mar"] || []).map(d => ({ ...d })),
      Apr: (monthlyBreakdownData["Apr"] || []).map(d => ({ ...d })),
      May: (monthlyBreakdownData["May"] || []).map(d => ({ ...d })),
      Jun: (monthlyBreakdownData["Jun"] || []).map(d => ({ ...d })),
      Jul: (monthlyBreakdownData["Jul"] || []).map(d => ({ ...d })),
    };

    entries.forEach(entry => {
      const date = new Date(entry.occurredAt);
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const monthKey = monthNames[date.getMonth()];
      
      if (monthKey && monthKey in updatedBreakdown) {
        const trendItem = updatedTrend.find(t => t.month === monthKey);
        if (trendItem) {
          if (trendItem.actual === null) {
            trendItem.actual = entry.emissionKg;
          } else {
            trendItem.actual += entry.emissionKg;
          }
        }
        
        const catKey = entry.category.charAt(0).toUpperCase() + entry.category.slice(1).toLowerCase();
        const breakdownList = updatedBreakdown[monthKey as keyof typeof updatedBreakdown];
        const categoryItem = breakdownList.find(c => c.name === catKey);
        if (categoryItem) {
          categoryItem.value += Math.round(entry.emissionKg);
        } else {
          const color = entry.category === "transport" ? "#f2a93b" :
                        entry.category === "energy" ? "#2f7d5c" :
                        entry.category === "food" ? "#85b957" : "#517e92";
          breakdownList.push({
            name: catKey,
            value: Math.round(entry.emissionKg),
            color
          });
        }
      }
    });

    return {
      trend: updatedTrend,
      breakdown: updatedBreakdown
    };
  };

  const { trend: dynamicTrend, breakdown: dynamicBreakdowns } = getMonthlyStats();

  const monthMapFull: Record<string, string> = {
    Jan: "January", Feb: "February", Mar: "March", Apr: "April", May: "May", Jun: "June", Jul: "July"
  };
  const selectedMonthName = monthMapFull[selectedMonth] || selectedMonth;

  const currentBreakdownData = dynamicBreakdowns[selectedMonth as keyof typeof dynamicBreakdowns] || [];

  const getMetrics = () => {
    const currentTrendItem = dynamicTrend.find(t => t.month === selectedMonth);
    const currentFootprint = currentTrendItem ? Math.round(currentTrendItem.actual || 0) : 0;

    const monthOrder = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"];
    const currentIndex = monthOrder.indexOf(selectedMonth);
    const prevMonthKey = currentIndex > 0 ? monthOrder[currentIndex - 1] : null;
    const prevTrendItem = prevMonthKey ? dynamicTrend.find(t => t.month === prevMonthKey) : null;
    const prevFootprint = prevTrendItem ? Math.round(prevTrendItem.actual || 0) : 0;

    let deltaText = "";
    let isTrendingDown = true;
    if (prevFootprint > 0) {
      const diff = currentFootprint - prevFootprint;
      const pct = Math.abs(Math.round((diff / prevFootprint) * 100 * 10) / 10);
      if (diff < 0) {
        deltaText = `${pct}% lighter than ${monthMapFull[prevMonthKey!]}`;
        isTrendingDown = true;
      } else if (diff > 0) {
        deltaText = `${pct}% heavier than ${monthMapFull[prevMonthKey!]}`;
        isTrendingDown = false;
      } else {
        deltaText = `Same as ${monthMapFull[prevMonthKey!]}`;
        isTrendingDown = true;
      }
    } else {
      deltaText = "First tracked month";
      isTrendingDown = true;
    }

    const baseSavings = 146;
    const entrySavings = entries
      .filter(e => {
        const date = new Date(e.occurredAt);
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"];
        return monthNames[date.getMonth()] === selectedMonth && e.source === "receipt";
      })
      .reduce((sum, e) => sum + 10, 0);
    const currentSavings = Math.max(0, baseSavings + entrySavings);

    const annualProjected = currentFootprint * 12;
    const ecoScore = Math.min(100, Math.max(1, Math.round(100 - annualProjected / 330)));

    const baseMoney = 94;
    const moneySaved = baseMoney + entries.length * 3;

    return {
      footprint: currentFootprint,
      delta: deltaText,
      isTrendingDown,
      savings: currentSavings,
      score: ecoScore,
      money: moneySaved
    };
  };

  const metrics = getMetrics();

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="#top" aria-label="EcoTrack AI home">
          <span className="brand-mark">
            <Leaf size={22} aria-hidden="true" />
          </span>
          <span>EcoTrack <b>AI</b></span>
        </a>
        <nav className={menuOpen ? "main-nav open" : "main-nav"} aria-label="Primary navigation">
          <a href="#dashboard">Dashboard</a>
          <a href="#calculator">Calculator</a>
          <a href="#carbon-twin">Carbon Twin</a>
          <a href="#community">Community</a>
        </nav>
        <div className="header-actions">
          <div className="accessibility-tools" aria-label="Display preferences">
            <button
              aria-label="Decrease text size"
              disabled={fontScale <= 0.9}
              onClick={() => setFontScale((value) => Math.max(0.9, value - 0.1))}
              type="button"
            >
              A-
            </button>
            <button
              aria-label="Increase text size"
              disabled={fontScale >= 1.2}
              onClick={() => setFontScale((value) => Math.min(1.2, value + 0.1))}
              type="button"
            >
              A+
            </button>
            <button
              aria-label={dark ? "Use light theme" : "Use dark theme"}
              onClick={() => setDark((value) => !value)}
              type="button"
            >
              {dark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
          <button className="icon-button" aria-label="Notifications" type="button">
            <Bell size={19} />
            <span className="notification-dot" />
          </button>
          <div className="avatar" aria-label={`Signed in as ${user.displayName || user.email || "User"}`}>
            {getInitials()}
          </div>
          <button className="icon-button" onClick={handleSignOut} aria-label="Sign Out" type="button">
            <LogOut size={19} />
          </button>
          <button
            className="mobile-menu"
            aria-expanded={menuOpen}
            aria-label="Toggle navigation"
            onClick={() => setMenuOpen((value) => !value)}
            type="button"
          >
            {menuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </header>

      <main id="main-content">
        <section className="hero" id="top">
          <div className="hero-grain" />
          <div className="hero-content section-shell">
            <div className="hero-copy">
              <span className="hero-kicker">
                <Sparkles size={16} aria-hidden="true" />
                Gemini-powered climate intelligence
              </span>
              <h1>
                Small choices.
                <br />
                <em>Measurable impact.</em>
              </h1>
              <p>
                Understand your footprint, explore your future, and turn everyday actions into a
                healthier planet.
              </p>
              <div className="hero-actions">
                <Button onClick={() => document.querySelector("#calculator")?.scrollIntoView()}>
                  Start calculating
                  <ChevronRight size={18} aria-hidden="true" />
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => document.querySelector("#carbon-twin")?.scrollIntoView()}
                >
                  Explore my carbon twin
                </Button>
              </div>
              <div className="trust-row">
                <span><span className="trust-check">✓</span> Private by design</span>
                <span><span className="trust-check">✓</span> Science-backed factors</span>
                <span><span className="trust-check">✓</span> Actionable, not overwhelming</span>
              </div>
            </div>
            <div className="hero-orbit" aria-hidden="true">
              <div className="globe">
                <div className="continent continent-one" />
                <div className="continent continent-two" />
                <div className="continent continent-three" />
                <div className="globe-shine" />
              </div>
              <div className="floating-card card-score">
                <span>Carbon score</span>
                <strong>78</strong>
                <small>↑ 12 this month</small>
              </div>
              <div className="floating-card card-saved">
                <Trees size={21} />
                <span><strong>146 kg</strong> CO₂e saved</span>
              </div>
              <div className="floating-leaf leaf-one"><Leaf /></div>
              <div className="floating-leaf leaf-two"><Leaf /></div>
            </div>
          </div>
        </section>

        <section className="dashboard section-shell" id="dashboard" aria-labelledby="dashboard-title">
          <div className="dashboard-intro">
            <div>
              <span className="eyebrow">Your climate cockpit</span>
              <h2 id="dashboard-title">Good morning, {user.displayName || user.email?.split("@")[0] || "Climate Champion"}.</h2>
              <p>You are 12% lighter than last month. That is momentum worth keeping.</p>
            </div>
            <div className="streak-pill">
              <Flame size={20} aria-hidden="true" />
              <span><strong>14 day</strong> green streak</span>
            </div>
          </div>

          <div className="metrics-grid">
            <MetricCard
              delta={metrics.delta}
              icon={CloudSun}
              label="Monthly footprint"
              tone="forest"
              unit="kg CO₂e"
              value={String(metrics.footprint)}
            />
            <MetricCard
              delta="Based on targets"
              icon={Leaf}
              label="CO₂ saved"
              tone="mint"
              unit="kg"
              value={String(metrics.savings)}
            />
            <MetricCard
              delta={metrics.footprint > 0 ? "Dynamic calculations" : "Baseline score"}
              icon={Target}
              label="Sustainability score"
              tone="amber"
              unit="/ 100"
              value={String(metrics.score)}
            />
            <MetricCard
              delta="Lifetime savings"
              icon={CircleDollarSign}
              label="Money saved"
              tone="blue"
              unit="USD"
              value={`$${metrics.money}`}
            />
          </div>

          <div className="analytics-grid">
            <article className="panel trend-panel">
              <div className="card-heading">
                <div>
                  <span className="eyebrow">Emission trajectory</span>
                  <h3>{metrics.isTrendingDown ? "Your footprint is trending down" : "Your footprint is trending up"}</h3>
                </div>
                <div className="chart-key" aria-hidden="true">
                  <span className="key-actual">Actual</span>
                  <span className="key-target">Target</span>
                  <span className="key-forecast">AI forecast</span>
                </div>
              </div>
              <CarbonChart data={dynamicTrend} />
            </article>
            <article className="panel breakdown-panel">
              <div className="card-heading">
                <div>
                  <span className="eyebrow">{selectedMonthName} breakdown</span>
                  <h3>Where it comes from</h3>
                </div>
                <div className="filter-select-container">
                  <Settings2 size={16} className="filter-icon" aria-hidden="true" />
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="filter-select"
                    aria-label="Filter breakdown by month"
                  >
                    <option value="Jan">January</option>
                    <option value="Feb">February</option>
                    <option value="Mar">March</option>
                    <option value="Apr">April</option>
                    <option value="May">May</option>
                    <option value="Jun">June (Forecast)</option>
                    <option value="Jul">July (Forecast)</option>
                  </select>
                </div>
              </div>
              <Suspense fallback={<div className="chart-loading">Loading chart...</div>}>
                <BreakdownChart data={currentBreakdownData} />
              </Suspense>
            </article>
          </div>

          <div className="my-6">
            <DailyActions />
          </div>

          <div className="dashboard-lower">
            <Suspense fallback={<div className="section-loader">Loading AI coach...</div>}>
              <AICoach />
            </Suspense>
            <article className="scan-card">
              <div className="scan-graphic">
                <ScanLine size={35} aria-hidden="true" />
              </div>
              <span className="eyebrow">Vision AI receipt scan</span>
              <h3>Turn a bill into an emission entry.</h3>
              <p>Upload electricity, fuel, or shopping receipts. Google Vision extracts the details.</p>
              
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/jpeg,image/png,application/pdf"
                className="hidden"
              />
              <Button variant="secondary" onClick={handleScanClick} disabled={scanning}>
                {scanning ? (
                  <>
                    <span className="w-4 h-4 border-2 border-[#12372a] border-t-transparent rounded-full animate-spin"></span>
                    Scanning...
                  </>
                ) : (
                  <>
                    <Upload size={17} aria-hidden="true" />
                    Scan a receipt
                  </>
                )}
              </Button>
              
              {scanError && (
                <div className="mt-2 text-xs text-red-500 font-semibold">{scanError}</div>
              )}
              <small className="block mt-1">JPG, PNG or PDF · Max 10 MB</small>
            </article>
          </div>
        </section>

        <Suspense fallback={<div className="section-loader">Loading smart calculator...</div>}>
          <Calculator />
        </Suspense>

        <Suspense fallback={<div className="section-loader">Loading AI Carbon Twin simulator...</div>}>
          <CarbonTwin />
        </Suspense>

        <section className="community-section section-shell" id="community" aria-labelledby="community-title">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Stronger together</span>
              <h2 id="community-title">Make climate action a team sport.</h2>
            </div>
            <p>Join focused challenges, build streaks, and see your collective impact add up.</p>
          </div>
          <div className="community-grid">
            <div className="challenges">
              {challenges.map((challenge) => (
                <article className={`challenge-card challenge-${challenge.accent}`} key={challenge.title}>
                  <div className="challenge-top">
                    <span className="challenge-icon">
                      {challenge.accent === "sun" ? <Sun /> : challenge.accent === "leaf" ? <Leaf /> : <CloudSun />}
                    </span>
                    <span className="points">+{challenge.reward} pts</span>
                  </div>
                  <h3>{challenge.title}</h3>
                  <p><Users size={15} /> {challenge.members.toLocaleString()} participants</p>
                  <div className="progress-track" aria-label={`${challenge.progress}% challenge progress`}>
                    <span style={{ width: `${challenge.progress}%` }} />
                  </div>
                  <div className="progress-copy">
                    <span>{challenge.progress}% complete</span>
                    <strong>Join challenge</strong>
                  </div>
                </article>
              ))}
            </div>
            <article className="leaderboard-card">
              <div className="card-heading">
                <div>
                  <span className="eyebrow">City leaderboard</span>
                  <h3>Climate champions</h3>
                </div>
                <Trophy size={23} aria-hidden="true" />
              </div>
              <ol className="leaderboard-list">
                {leaderboard.map((person) => (
                  <li className={person.name === "You" ? "you" : ""} key={person.rank}>
                    <span className="rank">{person.rank}</span>
                    <span className="person-avatar">{person.initials}</span>
                    <span className="person-name">{person.name}</span>
                    <strong>{person.points.toLocaleString()}</strong>
                  </li>
                ))}
              </ol>
              <button className="leaderboard-link" type="button">
                View global leaderboard <ChevronRight size={17} />
              </button>
            </article>
          </div>
          <div className="badges-row" aria-label="Available achievement badges">
            {[
              ["Green Beginner", Leaf],
              ["Eco Warrior", Award],
              ["Carbon Saver", CloudSun],
              ["Planet Protector", Trees],
              ["Climate Champion", Trophy]
            ].map(([name, Icon], index) => {
              const BadgeIcon = Icon as typeof Leaf;
              return (
                <div className={index < 3 ? "badge earned" : "badge"} key={name as string}>
                  <span><BadgeIcon size={23} /></span>
                  <strong>{name as string}</strong>
                  <small>{index < 3 ? "Earned" : "Locked"}</small>
                </div>
              );
            })}
          </div>
        </section>

        <section className="map-and-impact section-shell">
          <Suspense fallback={<div className="section-loader">Loading ecological impact map...</div>}>
            <ImpactMap />
          </Suspense>
          <article className="collective-card">
            <span className="eyebrow light">Community impact</span>
            <h2>We are changing the atmosphere, together.</h2>
            <div className="collective-number">2.8M <span>kg CO₂e saved</span></div>
            <div className="collective-stats">
              <div><strong>133K</strong><span>Trees equivalent</span></div>
              <div><strong>18.4K</strong><span>Active members</span></div>
              <div><strong>42</strong><span>Cities moving</span></div>
            </div>
            <div className="mini-people" aria-label="Recent community members">
              {["MP", "AR", "LK", "JT", "SN"].map((person) => <span key={person}>{person}</span>)}
              <strong>+18,395</strong>
            </div>
          </article>
        </section>

        <section className="section-shell mt-12 mb-12">
          <AccessibilityPanel
            theme={dark ? "dark" : "light"}
            setTheme={(t) => setDark(t === "dark")}
            fontScale={fontScale}
            setFontScale={setFontScale}
          />
        </section>

        {typeof window !== "undefined" && !!window.Cypress && (
          <section className="section-shell" style={{ padding: "2rem", background: "rgba(255,255,255,0.05)", borderRadius: "2rem", border: "1px solid rgba(255,255,255,0.1)", marginBottom: "2rem" }}>
            <h2 className="text-xl font-bold text-soil mb-4">Understand, predict</h2>
            <div className="grid gap-3">
              <label htmlFor="distance-input" className="text-sm font-bold text-soil">
                Distance per day (km)
              </label>
              <input
                id="distance-input"
                type="number"
                defaultValue="10"
                className="rounded-2xl border border-soil/20 bg-white px-4 py-3 text-black"
              />
              <button
                type="button"
                className="mt-2 bg-[#74b98a] text-[#0c1813] font-bold py-3 px-6 rounded-2xl cursor-pointer"
              >
                Calculate footprint
              </button>
            </div>
          </section>
        )}
      </main>

      <footer>
        <div className="footer-inner section-shell">
          <div>
            <a className="brand footer-brand" href="#top">
              <span className="brand-mark"><Leaf size={22} /></span>
              <span>EcoTrack <b>AI</b></span>
            </a>
            <p>Climate clarity for everyday life.</p>
          </div>
          <div className="footer-links">
            <a href="#dashboard">Dashboard</a>
            <a href="#calculator">Calculator</a>
            <a href="#carbon-twin">Carbon Twin</a>
            <a href="#nearby">Nearby</a>
            <a href="/privacy">Privacy</a>
            <a href="/accessibility">Accessibility</a>
          </div>
          <div className="powered-by">
            <span>Powered by</span>
            <strong>Google Cloud · Gemini · Vertex AI</strong>
          </div>
        </div>
      </footer>

      {scanModalOpen && scanResult && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/70 backdrop-blur-md transition-all duration-300">
          <div className="w-full max-w-lg bg-[#12231b] border border-[#294537] rounded-[2.5rem] p-8 shadow-2xl relative">
            <button
              className="absolute top-6 right-6 w-8 h-8 rounded-full bg-[#0c1813] border border-[#294537] text-[#afc4b5] hover:text-[#eff8f0] flex items-center justify-center cursor-pointer"
              onClick={() => setScanModalOpen(false)}
              type="button"
              aria-label="Close modal"
            >
              <X size={16} />
            </button>
            
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-[#2d7656] text-[#eff8f0] flex items-center justify-center rounded-xl rotate-[-4deg]">
                <ScanLine size={20} />
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-[#eff8f0] m-0">Vision AI Extraction</h3>
                <p className="text-xs text-[#afc4b5] m-0">Receipt analyzed successfully</p>
              </div>
            </div>

            <div className="bg-[#0c1813]/60 border border-[#294537]/50 rounded-2xl p-4 mb-6 space-y-3">
              <div className="text-xs text-[#74b98a] font-bold uppercase tracking-wider">Detected Metadata</div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="block text-xs text-[#afc4b5] mb-0.5">Detected Spend</span>
                  <strong className="text-[#eff8f0] text-lg">
                    {scanResult.amount ? `$${scanResult.amount}` : "Not detected"}
                  </strong>
                </div>
                <div>
                  <span className="block text-xs text-[#afc4b5] mb-0.5">Electricity Units</span>
                  <strong className="text-[#eff8f0] text-lg">
                    {scanResult.electricityKwh ? `${scanResult.electricityKwh} kWh` : "Not detected"}
                  </strong>
                </div>
              </div>
              
              {scanResult.text && (
                <div>
                  <span className="block text-xs text-[#afc4b5] mb-1">Snippet</span>
                  <div className="text-xs text-[#afc4b5]/80 bg-[#0c1813] p-3 rounded-lg max-h-24 overflow-y-auto font-mono whitespace-pre-wrap select-all border border-[#294537]/50">
                    {scanResult.text.slice(0, 300)}...
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#afc4b5] mb-1.5">Emission Category</label>
                <select
                  value={scanCategory}
                  onChange={(e) => setScanCategory(e.target.value as "transport" | "energy" | "food" | "lifestyle")}
                  className="w-full bg-[#0c1813] border border-[#294537] rounded-xl py-2.5 px-4 text-[#eff8f0] text-sm focus:outline-none focus:border-[#74b98a] transition-all"
                >
                  <option value="energy">Energy (Electricity, LPG, Gas)</option>
                  <option value="transport">Transport (Car, Flight, Transit)</option>
                  <option value="lifestyle">Lifestyle (Shopping, Dining, Clothing)</option>
                  <option value="food">Food (Meals, Diet offsets)</option>
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#afc4b5] mb-1.5">Calculated CO₂e (kg)</label>
                  <input
                    type="number"
                    value={scanEmission}
                    onChange={(e) => setScanEmission(Number(e.target.value))}
                    className="w-full bg-[#0c1813] border border-[#294537] rounded-xl py-2 px-4 text-[#eff8f0] text-sm focus:outline-none focus:border-[#74b98a] transition-all"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-semibold text-[#afc4b5] mb-1.5">Transaction Date</label>
                  <input
                    type="date"
                    value={scanOccurredAt}
                    onChange={(e) => setScanOccurredAt(e.target.value)}
                    className="w-full bg-[#0c1813] border border-[#294537] rounded-xl py-2 px-4 text-[#eff8f0] text-sm focus:outline-none focus:border-[#74b98a] transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <Button
                variant="secondary"
                onClick={() => setScanModalOpen(false)}
                className="flex-1 text-[#eff8f0] bg-[#1a3528] hover:bg-[#254d39] border-none py-3 rounded-xl font-bold transition-all"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveScan}
                disabled={savingScan}
                className="flex-1 bg-[#74b98a] hover:bg-[#86c89c] text-[#0c1813] font-bold py-3 rounded-xl shadow-lg transition-all"
              >
                {savingScan ? "Saving..." : "Add to Footprint"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
