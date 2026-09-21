import { useEffect, useRef, useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import {
  Activity, Radar, LayoutGrid, Wallet, Settings, Search, NotebookPen,
  Moon, Sun, ChevronsLeft, ChevronsRight, LineChart, Github, UserRound,
  Cog, Cpu, Database, Cable, Rocket, FlaskConical, Star, FileText,
  Menu, X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useDarkMode } from "@/hooks/useDarkMode";

const APP_VERSION = "v0.1.3";
const REPO_URL = "https://github.com/intro0520/Vibe-Research";
const SITE_URL = "https://github.com/intro0520/Vibe-Research"; // 作者主页

const NAV = [
  { to: "/daily-review", icon: Activity, label: "每日复盘" },
  { to: "/intel", icon: Radar, label: "资讯雷达" },
  { to: "/sectors", icon: LayoutGrid, label: "板块中心" },
  { to: "/stock-data", icon: Search, label: "个股数据" },
  { to: "/watchlist", icon: Star, label: "自选股" },
  { to: "/portfolio", icon: Wallet, label: "我的持仓" },
  { to: "/my-reports", icon: FileText, label: "我的研报" },
  { to: "/notes", icon: NotebookPen, label: "研究记录" },
  { to: "/settings", icon: Settings, label: "接入 AI" },
];

// 常看的板块，作为「板块中心」下的快捷入口（缩进显示）。
const SECTOR_LINKS = [
  { to: "/sectors/humanoid", icon: Cog, label: "人形机器人" },
  { to: "/sectors/ai-computing", icon: Cpu, label: "AI 算力" },
  { to: "/sectors/hbm", icon: Database, label: "HBM" },
  { to: "/sectors/cpo", icon: Cable, label: "光互联" },
  { to: "/sectors/business-space", icon: Rocket, label: "商业航天" },
  { to: "/sectors/ai-pharma", icon: FlaskConical, label: "生物医药" },
];

// 手机宽度下侧栏改为抽屉：常驻侧栏会吃掉 240px，正文只剩一条缝。
const MOBILE_QUERY = "(max-width: 767px)";

export function Layout() {
  const { pathname } = useLocation();
  const { dark, toggle } = useDarkMode();
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem("vr-sidebar") === "collapsed");
  const [mobile, setMobile] = useState(() => typeof window !== "undefined" && window.matchMedia(MOBILE_QUERY).matches);
  const [mobileOpen, setMobileOpen] = useState(false);
  const menuRef = useRef<HTMLButtonElement | null>(null);
  const sidebarRef = useRef<HTMLElement | null>(null);
  const mainRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    localStorage.setItem("vr-sidebar", collapsed ? "collapsed" : "expanded");
  }, [collapsed]);

  useEffect(() => {
    const query = window.matchMedia(MOBILE_QUERY);
    const update = () => {
      setMobile(query.matches);
      setMobileOpen(false);
    };
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  useEffect(() => { setMobileOpen(false); }, [pathname]);

  const closeDrawer = () => {
    setMobileOpen(false);
    // 焦点原本在抽屉里时才交还给汉堡按钮，否则点击关闭会在按钮上留下焦点环。
    if (sidebarRef.current?.contains(document.activeElement)) {
      requestAnimationFrame(() => menuRef.current?.focus());
    }
  };

  useEffect(() => {
    if (!mobileOpen) return;
    sidebarRef.current?.querySelector<HTMLElement>("a,button")?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") closeDrawer(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [mobileOpen]);

  // 抽屉展开时冻住正文：否则背景跟着滚，遮罩下的内容会窜，看起来像页面在晃。
  useEffect(() => {
    const main = mainRef.current;
    if (!main) return;
    if (mobile && mobileOpen) {
      const top = main.scrollTop;
      main.dataset.lockedTop = String(top);
      main.style.overflow = "hidden";
    } else {
      main.style.overflow = "";
      if (main.dataset.lockedTop) main.scrollTop = Number(main.dataset.lockedTop);
    }
  }, [mobile, mobileOpen]);

  // 抽屉外一有滚动手势就收起。正文此刻是被冻住的，所以监听手势本身而不是
  // 监听 scrollTop —— 后者永远不会变，收起也就永远不会发生。
  useEffect(() => {
    if (!mobileOpen) return;
    const onScrollIntent = (e: Event) => {
      if (sidebarRef.current?.contains(e.target as Node)) return;
      closeDrawer();
    };
    document.addEventListener("wheel", onScrollIntent, { passive: true });
    document.addEventListener("touchmove", onScrollIntent, { passive: true });
    return () => {
      document.removeEventListener("wheel", onScrollIntent);
      document.removeEventListener("touchmove", onScrollIntent);
    };
  }, [mobileOpen]);

  const compact = collapsed && !mobile;
  const currentTitle = NAV.find(n => n.to === pathname)?.label
    ?? SECTOR_LINKS.find(n => n.to === pathname)?.label
    ?? "Vibe-Research";

  return (
    <div className={cn("flex h-dvh", mobile ? "flex-col" : "overflow-hidden")}>
      {/* 手机端顶栏：汉堡 + 当前页标题 + 主题切换 */}
      {mobile && (
        <header className="glass z-30 m-2 mb-0 flex shrink-0 items-center gap-1 rounded-2xl px-2 py-2">
          <button
            ref={menuRef}
            aria-label={mobileOpen ? "关闭导航" : "打开导航"}
            aria-expanded={mobileOpen}
            aria-controls="workspace-sidebar"
            onClick={() => setMobileOpen(v => !v)}
            className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <LineChart className="h-5 w-5 shrink-0 text-primary text-glow" />
          <span className="min-w-0 flex-1 truncate text-sm font-semibold">{currentTitle}</span>
          <button
            onClick={toggle}
            aria-label={dark ? "切换亮色" : "切换暗色"}
            className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
          >
            {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
        </header>
      )}

      {mobile && mobileOpen && (
        <button
          tabIndex={-1}
          aria-label="关闭导航遮罩"
          className="fixed inset-0 z-40 bg-black/60"
          onClick={closeDrawer}
        />
      )}

      {/* Sidebar */}
      <aside
        ref={sidebarRef}
        id="workspace-sidebar"
        aria-label="主导航"
        className={cn(
          "glass m-2 flex shrink-0 flex-col rounded-2xl",
          // 手机端不做宽度过渡：抽屉是瞬时开合，过渡会让整页跟着抖。
          !mobile && "z-10 transition-all duration-200",
          mobile
            ? "z-50"
            : compact ? "w-14" : "w-60",
          mobile && mobileOpen && "fixed inset-y-2 left-2 w-60",
          mobile && !mobileOpen && "hidden",
        )}
      >
        {/* Brand */}
        <div className={cn("border-b border-border/50", compact ? "flex justify-center p-3" : "p-4")}>
          <Link to="/daily-review" onClick={closeDrawer} className={cn("flex items-center", compact ? "justify-center" : "gap-2")}>
            <LineChart className="h-6 w-6 shrink-0 text-primary text-glow" />
            {!compact && (
              <span className="text-lg font-extrabold tracking-tight">
                Vibe-<span className="text-primary">Research</span>
              </span>
            )}
          </Link>
          {!compact && <p className="mt-1 text-[11px] text-muted-foreground">个人 AI 投研系统 · A股/美股/港股</p>}
        </div>

        {/* Nav */}
        <nav className={cn("flex-1 space-y-1 overflow-auto overscroll-contain", compact ? "p-1.5" : "p-2.5")}>
          {NAV.map(({ to, icon: Icon, label }) => {
            const active = pathname === to;
            return (
              <div key={to}>
                <Link
                  to={to}
                  onClick={closeDrawer}
                  title={compact ? label : undefined}
                  className={cn(
                    "flex items-center rounded-lg text-sm transition-colors",
                    compact ? "justify-center p-2.5" : "gap-2.5 px-3 py-2.5",
                    active
                      ? "bg-primary/15 font-medium text-primary shadow-glow"
                      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {!compact && label}
                </Link>

                {/* 板块中心下方：常看板块的快捷入口（缩进） */}
                {to === "/sectors" && (
                  <div className={cn("mt-1 space-y-0.5", !compact && "ml-4 border-l border-border/40 pl-1.5")}>
                    {SECTOR_LINKS.map(({ to: st, icon: SIcon, label: slabel }) => {
                      const sactive = pathname === st;
                      return (
                        <Link
                          key={st}
                          to={st}
                          onClick={closeDrawer}
                          title={compact ? slabel : undefined}
                          className={cn(
                            "flex items-center rounded-lg transition-colors",
                            compact ? "justify-center p-2" : "gap-2 px-2.5 py-1.5 text-[13px]",
                            sactive
                              ? "bg-primary/10 font-medium text-primary"
                              : "text-muted-foreground/80 hover:bg-muted/40 hover:text-foreground",
                          )}
                        >
                          <SIcon className="h-3.5 w-3.5 shrink-0" />
                          {!compact && slabel}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Footer */}
        <div className={cn("border-t border-border/50", compact ? "flex flex-col items-center gap-2 p-2" : "space-y-2 p-3")}>
          {compact ? (
            <>
              <button onClick={toggle} className="rounded p-1.5 text-muted-foreground transition-colors hover:text-foreground" title={dark ? "亮色" : "暗色"}>
                {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>
              <a href={SITE_URL} target="_blank" rel="noreferrer" className="rounded p-1.5 text-muted-foreground transition-colors hover:text-foreground" title="联系作者">
                <UserRound className="h-4 w-4" />
              </a>
              <button onClick={() => setCollapsed(false)} className="rounded p-1.5 text-muted-foreground transition-colors hover:text-foreground" title="展开">
                <ChevronsRight className="h-4 w-4" />
              </button>
            </>
          ) : (
            <>
              <div className="flex items-center justify-between">
                {mobile ? (
                  <button onClick={closeDrawer} className="flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground">
                    <X className="h-4 w-4" /> 关闭
                  </button>
                ) : (
                  <button onClick={toggle} className="flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground">
                    {dark ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
                    {dark ? "亮色" : "暗色"}
                  </button>
                )}
                <div className="flex items-center gap-2">
                  <a href={SITE_URL} target="_blank" rel="noreferrer" className="text-muted-foreground transition-colors hover:text-foreground" title="联系作者">
                    <UserRound className="h-3.5 w-3.5" />
                  </a>
                  <a href={REPO_URL} target="_blank" rel="noreferrer" className="text-muted-foreground transition-colors hover:text-foreground" title="GitHub">
                    <Github className="h-3.5 w-3.5" />
                  </a>
                  {!mobile && (
                    <button onClick={() => setCollapsed(true)} className="rounded p-1 text-muted-foreground transition-colors hover:text-foreground" title="收起">
                      <ChevronsLeft className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
              <a href={SITE_URL} target="_blank" rel="noreferrer" className="block text-[11px] text-primary/80 transition-colors hover:text-primary">
                联系作者 · GitHub
              </a>
              <p className="text-[11px] leading-relaxed text-muted-foreground/60">
                {APP_VERSION} · 不荐股 · 不预测 · 无倾向
              </p>
            </>
          )}
        </div>
      </aside>

      {/* Main */}
      <main ref={mainRef} className="workspace-main min-h-0 flex-1 overflow-auto overscroll-contain">
        <div className={cn("mx-auto max-w-6xl", mobile ? "px-3 py-4" : "px-6 py-6")}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}
