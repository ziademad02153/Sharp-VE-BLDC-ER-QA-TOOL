import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Check, CheckCircle2, ChevronDown, CircleHelp, Clock3, Droplets, Gauge, ListChecks, LockKeyhole, Menu, Play, RotateCcw, Search, Settings2, ShieldCheck, Sparkles, TriangleAlert, WashingMachine, X, Zap, Globe } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";

type TestStatus = "not-started" | "in-progress" | "passed" | "failed";
type TestCase = { id: string; code: string; titleKey: string; groupKey: string; error?: string; duration: string; risk?: "high" | "medium"; summaryKey: string; stepsCount: number; expectedKey: string; noteKey: string; icon: typeof Droplets };

const testCasesData: TestCase[] = [
  { id: "err-water", code: "TC-ERR-01", titleKey: "tc.err-water.title", groupKey: "tc.err-water.group", error: "E5", duration: "20 m", summaryKey: "tc.err-water.summary", stepsCount: 4, expectedKey: "tc.err-water.expected", noteKey: "tc.err-water.note", icon: Droplets },
  { id: "err-drain", code: "TC-ERR-02", titleKey: "tc.err-drain.title", groupKey: "tc.err-drain.group", error: "E1", duration: "15 m", summaryKey: "tc.err-drain.summary", stepsCount: 4, expectedKey: "tc.err-drain.expected", noteKey: "tc.err-drain.note", icon: Settings2 },
  { id: "err-door", code: "TC-ERR-03", titleKey: "tc.err-door.title", groupKey: "tc.err-door.group", error: "E2", duration: "Instant", risk: "medium", summaryKey: "tc.err-door.summary", stepsCount: 4, expectedKey: "tc.err-door.expected", noteKey: "tc.err-door.note", icon: LockKeyhole },
  { id: "err-leak", code: "TC-ERR-04", titleKey: "tc.err-leak.title", groupKey: "tc.err-leak.group", error: "E9", duration: "Varies", risk: "high", summaryKey: "tc.err-leak.summary", stepsCount: 4, expectedKey: "tc.err-leak.expected", noteKey: "tc.err-leak.note", icon: TriangleAlert },
  { id: "child-lock", code: "TC-CL-01", titleKey: "tc.child-lock.title", groupKey: "tc.child-lock.group", duration: "Instant", summaryKey: "tc.child-lock.summary", stepsCount: 4, expectedKey: "tc.child-lock.expected", noteKey: "tc.child-lock.note", icon: ShieldCheck },
  { id: "child-short", code: "TC-CL-02", titleKey: "tc.child-short.title", groupKey: "tc.child-short.group", error: "E2", duration: "< 20s", summaryKey: "tc.child-short.summary", stepsCount: 4, expectedKey: "tc.child-short.expected", noteKey: "tc.child-short.note", icon: LockKeyhole },
  { id: "child-open", code: "TC-CL-03", titleKey: "tc.child-open.title", groupKey: "tc.child-open.group", duration: "> 20s", risk: "high", summaryKey: "tc.child-open.summary", stepsCount: 4, expectedKey: "tc.child-open.expected", noteKey: "tc.child-open.note", icon: Zap },
  { id: "door-fill", code: "TC-DOOR-01", titleKey: "tc.door-fill.title", groupKey: "tc.door-fill.group", duration: "Instant", summaryKey: "tc.door-fill.summary", stepsCount: 4, expectedKey: "tc.door-fill.expected", noteKey: "tc.door-fill.note", icon: WashingMachine },
  { id: "pause-allowed", code: "TC-TB3-01", titleKey: "tc.pause-allowed.title", groupKey: "tc.pause-allowed.group", duration: "5 m", summaryKey: "tc.pause-allowed.summary", stepsCount: 4, expectedKey: "tc.pause-allowed.expected", noteKey: "tc.pause-allowed.note", icon: Settings2 },
  { id: "pause-invalid", code: "TC-TB3-02", titleKey: "tc.pause-invalid.title", groupKey: "tc.pause-invalid.group", duration: "3 m", summaryKey: "tc.pause-invalid.summary", stepsCount: 4, expectedKey: "tc.pause-invalid.expected", noteKey: "tc.pause-invalid.note", icon: CircleHelp },
  { id: "anti-wrinkle", code: "TC-TB3-03", titleKey: "tc.anti-wrinkle.title", groupKey: "tc.anti-wrinkle.group", duration: "Instant", summaryKey: "tc.anti-wrinkle.summary", stepsCount: 4, expectedKey: "tc.anti-wrinkle.expected", noteKey: "tc.anti-wrinkle.note", icon: CircleHelp },
  { id: "weight-led", code: "TC-WD-01", titleKey: "tc.weight-led.title", groupKey: "tc.weight-led.group", duration: "Varies", summaryKey: "tc.weight-led.summary", stepsCount: 4, expectedKey: "tc.weight-led.expected", noteKey: "tc.weight-led.note", icon: Gauge },
  { id: "weight-accuracy", code: "TC-WD-02", titleKey: "tc.weight-accuracy.title", groupKey: "tc.weight-accuracy.group", duration: "2 cycles", summaryKey: "tc.weight-accuracy.summary", stepsCount: 4, expectedKey: "tc.weight-accuracy.expected", noteKey: "tc.weight-accuracy.note", icon: Gauge },
  { id: "program-switch", code: "TC-SW-01", titleKey: "tc.program-switch.title", groupKey: "tc.program-switch.group", duration: "1 m", summaryKey: "tc.program-switch.summary", stepsCount: 4, expectedKey: "tc.program-switch.expected", noteKey: "tc.program-switch.note", icon: ListChecks },
  { id: "tub-clean", code: "TC-SW-02", titleKey: "tc.tub-clean.title", groupKey: "tc.tub-clean.group", duration: "Varies", summaryKey: "tc.tub-clean.summary", stepsCount: 4, expectedKey: "tc.tub-clean.expected", noteKey: "tc.tub-clean.note", icon: Sparkles },
  { id: "unbalance", code: "TC-UNB-01", titleKey: "tc.unbalance.title", groupKey: "tc.unbalance.group", error: "E3-2", duration: "Varies", risk: "high", summaryKey: "tc.unbalance.summary", stepsCount: 4, expectedKey: "tc.unbalance.expected", noteKey: "tc.unbalance.note", icon: AlertTriangle },
];

function formatTime(seconds: number) { return `${Math.floor(seconds / 60).toString().padStart(2, "0")}:${(seconds % 60).toString().padStart(2, "0")}`; }

export default function Home() {
  const { t, dir, language, setLanguage } = useLanguage();
  const [selectedId, setSelectedId] = useState("err-water");
  const [query, setQuery] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("all");
  const [checkedSteps, setCheckedSteps] = useState<Record<string, number[]>>({});
  const [statuses, setStatuses] = useState<Record<string, TestStatus>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [isRunning, setIsRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);
  
  const groups = ["all", ...Array.from(new Set(testCasesData.map((item) => item.groupKey)))];
  
  const filtered = useMemo(() => { 
    const q = query.trim().toLowerCase(); 
    return testCasesData.filter((item) => {
      const matchGroup = selectedGroup === "all" || item.groupKey === selectedGroup;
      const matchQuery = !q || [item.code, t(item.titleKey), item.error, t(item.groupKey), t(item.summaryKey)].some((value) => value?.toLowerCase().includes(q));
      return matchGroup && matchQuery;
    }); 
  }, [query, selectedGroup, t]);
  
  const selected = testCasesData.find((item) => item.id === selectedId) ?? testCasesData[0];
  const selectedChecked = checkedSteps[selected.id] ?? [];
  const selectedStatus = statuses[selected.id] ?? "not-started";
  const passedCount = Object.values(statuses).filter((status) => status === "passed").length;
  const failedCount = Object.values(statuses).filter((status) => status === "failed").length;
  const completedCount = passedCount + failedCount;

  useEffect(() => { if (!isRunning) return undefined; const interval = window.setInterval(() => setElapsed((value) => value + 1), 1000); return () => window.clearInterval(interval); }, [isRunning]);
  function openTest(id: string) { setSelectedId(id); setIsRunning(false); setElapsed(0); setMobileOpen(false); }
  function toggleStep(index: number) { const current = checkedSteps[selected.id] ?? []; const next = current.includes(index) ? current.filter((step) => step !== index) : [...current, index]; setCheckedSteps({ ...checkedSteps, [selected.id]: next }); }
  function setStatus(status: TestStatus) { setStatuses({ ...statuses, [selected.id]: status }); }
  function resetSelected() { setCheckedSteps({ ...checkedSteps, [selected.id]: [] }); setStatuses({ ...statuses, [selected.id]: "not-started" }); setNotes({ ...notes, [selected.id]: "" }); setIsRunning(false); setElapsed(0); }

  const toggleLanguage = () => {
    setLanguage(language === 'ar' ? 'en' : 'ar');
  };

  return <div className="app-shell" dir={dir}>
    <aside className={`sidebar ${mobileOpen ? "sidebar-open" : ""}`}>
      <div className="brand-block"><div className="brand-mark"><WashingMachine size={22} strokeWidth={1.8} /></div><div><div className="brand-name">WASH<span>LAB</span></div><div className="brand-subtitle">{t('app.subtitle')}</div></div></div>
      <div className="workspace-label">{t('app.machine')}</div>
      <div className="model-sidebar">Sharp VE BLDC<br /><span>11,13kg</span></div>
      <nav className="side-nav"><button className="nav-item active" type="button"><TriangleAlert size={18} /><span>{t('nav.allTests')}</span><span className="nav-count">16</span></button></nav>
      <div className="sidebar-spacer" /><div className="sidebar-footer"><span>{t('nav.manualGuide')}</span><span>{t('nav.qa')}</span></div>
    </aside>
    <main className="main-content">
      <header className="topbar">
        <div className="topbar-start">
          <button className="icon-button mobile-menu" type="button" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Menu"><Menu size={20} /></button>
          <div className="breadcrumb"><span>{t('app.model')}</span><ChevronDown size={14} /><strong>{t('topbar.breadcrumb')}</strong></div>
        </div>
        <div className="topbar-actions">
          <button className="secondary-button !px-3 !py-1.5 flex items-center gap-2" type="button" onClick={toggleLanguage}>
            <Globe size={16} /> {language === 'ar' ? 'English' : 'العربية'}
          </button>
          <button className="secondary-button" type="button" onClick={() => window.print()}>{t('topbar.print')}</button>
        </div>
      </header>
      <div className="page-wrap">
        <section className="simple-title-row"><div><div className="eyebrow"><span className="eyebrow-line" /> {t('hero.eyebrow')}</div><div className="model-label">{t('app.model')}</div><h1>{t('hero.title')}<br /><em>{t('hero.subtitle')}</em></h1><p className="hero-copy">{t('hero.desc')}</p></div><div className="error-summary"><ListChecks size={20} /><strong>16 {t('summary.testsCount')}</strong><span>{t('summary.allCases')}</span></div></section>
        <section className="metrics-grid error-metrics"><div className="metric-card metric-accent"><div className="metric-label">{t('metrics.total')}</div><div className="metric-value">16<small> {t('metrics.case')}</small></div><div className="metric-foot"><ListChecks size={14} /> Errors & Specs</div></div><div className="metric-card"><div className="metric-label">{t('metrics.recorded')}</div><div className="metric-value">{completedCount}<small> / 16</small></div><div className="progress-line"><span style={{ width: `${(completedCount / 16) * 100}%` }} /></div><div className="metric-foot">{t('metrics.progress')}</div></div><div className="metric-card"><div className="metric-label">{t('metrics.pass')}</div><div className="metric-value success-value">{passedCount}<small> {t('metrics.case')}</small></div><div className="metric-foot"><CheckCircle2 size={14} /> Pass</div></div><div className="metric-card"><div className="metric-label">{t('metrics.fail')}</div><div className="metric-value warning-value">{failedCount}<small> {t('metrics.case')}</small></div><div className="metric-foot"><AlertTriangle size={14} /> Fail / Bug</div></div></section>
        <section className="content-layout"><div className="tests-column"><div className="section-heading-row"><div><div className="section-kicker">{t('list.kicker')}</div><h2>{t('list.title')}</h2></div><span className="case-count">{filtered.length} {t('list.from')} 16</span></div><div className="filter-row"><div className="search-box"><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t('list.search')} aria-label="Search" /></div></div><div className="category-chips">{groups.map((group) => <button key={group} type="button" className={`category-chip ${selectedGroup === group ? "selected" : ""}`} onClick={() => setSelectedGroup(group)}>{group === "all" ? t('list.all') : t(group)}</button>)}</div><div className="test-list">{filtered.map((item, index) => { const ItemIcon = item.icon; const status = statuses[item.id] ?? "not-started"; return <button key={item.id} type="button" className={`test-item ${selected.id === item.id ? "selected" : ""}`} onClick={() => openTest(item.id)}><div className="test-index">{String(index + 1).padStart(2, "0")}</div><div className={`test-icon ${item.risk ? "risk-icon" : ""}`}><ItemIcon size={18} /></div><div className="test-info"><div className="test-title-line"><span className="test-code">{item.code}</span>{item.error && <span className="error-pill">{item.error}</span>}{item.risk === "high" && <span className="risk-pill">{t('list.risk')}</span>}</div><div className="test-title">{t(item.titleKey)}</div><div className="test-meta"><Clock3 size={12} /> {item.duration} <span className="meta-divider" /> {t(item.groupKey)}</div></div><div className={`status-marker status-${status}`}>{status === "passed" ? <Check size={15} /> : status === "failed" ? <X size={15} /> : status === "in-progress" ? <Play size={13} fill="currentColor" /> : <ChevronDown size={15} />}</div></button>; })}</div></div>
          <div className="detail-column"><div className="section-heading-row detail-heading"><div><div className="section-kicker">{t('detail.kicker')}</div><h2>{t('detail.title')}</h2></div><button className="reset-button" type="button" onClick={resetSelected}><RotateCcw size={14} /> {t('detail.reset')}</button></div><article className={`detail-card ${selected.risk === "high" ? "detail-risk" : ""}`}><div className="detail-card-top"><div className="detail-badges"><span className="code-badge">{selected.code}</span>{selected.error && <span className="error-badge">ERROR {selected.error}</span>}<span className="group-badge">{t(selected.groupKey)}</span>{selected.risk === "high" && <span className="high-badge"><AlertTriangle size={13} /> {t('detail.careful')}</span>}</div><span className="detail-duration"><Clock3 size={14} /> {selected.duration}</span></div><h3>{t(selected.titleKey)}</h3><p className="detail-summary">{t(selected.summaryKey)}</p><div className="detail-divider" /><div className="step-header"><span className="step-title">{t('detail.todo')}</span><span className="step-progress">{selectedChecked.length} / {selected.stepsCount} {t('detail.done')}</span></div><div className="steps-list">{Array.from({ length: selected.stepsCount }).map((_, index) => { const stepKey = `${selected.id}.steps.${index}`; return <button key={index} type="button" className={`step-row ${selectedChecked.includes(index) ? "checked" : ""}`} onClick={() => toggleStep(index)}><span className="step-number">{selectedChecked.includes(index) ? <Check size={14} /> : index + 1}</span><span>{t(`tc.${stepKey}`)}</span></button>; })}</div><div className="expected-box"><div className="expected-label"><CheckCircle2 size={16} /> {t('detail.expected')}</div><p>{t(selected.expectedKey)}</p></div><div className="note-box"><div className="note-label"><CircleHelp size={15} /> {t('detail.note')}</div><p>{t(selected.noteKey)}</p></div><div className="run-row"><div className="timer-display"><span className="timer-label">{t('detail.time')}</span><strong>{formatTime(elapsed)}</strong></div><button className={`run-button ${isRunning ? "running" : ""}`} type="button" onClick={() => { setIsRunning(!isRunning); setStatus("in-progress"); }}><Play size={16} fill="currentColor" /> {isRunning ? t('detail.running') : t('detail.start')}</button></div><div className="result-section"><div className="result-label">{t('detail.yourResult')}</div><div className="result-buttons"><button type="button" className={`result-button pass ${selectedStatus === "passed" ? "active" : ""}`} onClick={() => setStatus("passed")}><CheckCircle2 size={17} /> {t('detail.passBtn')}</button><button type="button" className={`result-button fail ${selectedStatus === "failed" ? "active" : ""}`} onClick={() => setStatus("failed")}><X size={17} /> {t('detail.failBtn')}</button></div></div><div className="notes-field"><label htmlFor="test-notes">{t('detail.notesLabel')}</label><textarea id="test-notes" value={notes[selected.id] ?? ""} onChange={(event) => setNotes({ ...notes, [selected.id]: event.target.value })} placeholder={t('detail.notesPlaceholder')} /></div></article></div></section>
        <footer className="page-footer"><span><span className="footer-dot" /> {t('footer.desc')}</span><span>{t('footer.warn')}</span></footer>
      </div>
    </main>
  </div>;
}
