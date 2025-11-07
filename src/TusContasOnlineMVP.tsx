import { useEffect, useState, useRef } from "react";
import {
  MessageCircle,
  Instagram,
  Moon,
  Sun,
  ChevronRight,
  CheckCircle,
  Loader2,
  Check,
  X,
  ChevronLeft,
  ChevronRight as ChvRight,
  Menu,
  AlertCircle,
  LogIn,
  LogOut,
  Upload,
  Download,
  Trash2,
  Pencil,
  ArrowUp,
  ArrowDown
} from "lucide-react";

// ==== THEME / COLORS ========================================================
const ACCENT = "#E66663";
const LIGHT_APP_BG = "#FBEAEA";
const LIGHT_WASH = "rgba(230,102,99,0.06)";
const DARK_APP_BG = "#0B0B0B";
const DARK_PANEL_BG = "#111111";

const WHATSAPP_LINK = "https://wa.me/3777236888";

// ==== TIPOS DE DATOS ========================================================
// Contenido editable del sitio
type Testimonial = {
  imageUrl: string | null;
  quote: string;
  name: string;
  role?: string;
};

type ServiceItem = { title: string; desc: string };

type AboutContent = {
  title: string;
  paragraph: string; // admite \n\n para separar párrafos
  bullets: string[];
  imageUrl: string | null;
};

type SiteContent = {
  logoUrl: string | null;
  hero: {
    titleBase: string; // parte fija antes del resaltado
    flipWords: string[]; // palabras animadas
    subtitle: string;
    bullets: string[];
  };
  about: AboutContent;
  services: ServiceItem[];
  testimonials: Testimonial[];
};

// Sesión admin simple con expiración (ms epoch)
type AdminSession = { expiresAt: number };

// ==== CONTENIDO DEFAULT (fallback si no hay localStorage) ===================
const DEFAULT_CONTENT: SiteContent = {
  logoUrl: "/images/logo-tus-contas-online.jpg",
  hero: {
    titleBase: "Tu contaduría online,",
    flipWords: ["sin vueltas", "sin demoras"],
    subtitle:
      "Acompañamos a emprendedoras y pymes con servicios contables claros, 100% digitales y a medida.",
    bullets: ["Atención ágil y cercana", "Gestión impositiva al día", "100% online"],
  },
  about: {
    title: "Quiénes somos",
    paragraph:
      "Somos dos contadoras que aman simplificar la gestión para emprendedoras y pymes.\n\nTrabajamos 100% online, con procesos claros, recordatorios de vencimientos y reportes que te ayudan a decidir mejor.",
    bullets: ["Atención personalizada", "Onboarding en 48 hs", "Sin letra chica"],
    imageUrl: "/images/imagen-equipo.jpg",
  },
  services: [
    { title: "Monotributo y Autónomos", desc: "Alta, recategorización, vencimientos y presentación." },
    { title: "Gestión de impuestos", desc: "IVA, Ingresos Brutos, Ganancias. Nos ocupamos de todo." },
    { title: "Contabilidad para pymes", desc: "Estados, conciliaciones y reportes para decidir mejor." },
    { title: "Asesoramiento online", desc: "Espacios para despejar dudas y planificar." },
  ],
  testimonials: [
    {
      imageUrl: "/images/clients/hf-logo.png",
      quote: "Ordenamos impuestos y flujo de caja en 30 días. Ahora proyectamos con claridad.",
      name: "H&F Distribuidora",
    },
    {
      imageUrl: "/images/clients/tecwork-logo.png",
      quote: "Pasé de no entender mis vencimientos a tener todo calendarizado y automatizado.",
      name: "Agustin",
      role: "Tecwork",
    },
  ],
};

// ==== KEYS LOCALSTORAGE =====================================================
const LS_CONTENT_KEY = "tco-content"; // JSON con SiteContent
const LS_ADMIN_KEY = "tco-admin"; // JSON con AdminSession

// ==== ADMIN CREDENCIALES (placeholder; reemplazá por las tuyas) ============
const ADMIN_USER = "jasminynicole"
const ADMIN_PASS = "MP4120"
const ADMIN_TTL_HOURS = 12;

// ==== HELPERS (contenido) ===================================================
const loadContent = (): SiteContent => {
  try {
    const raw = localStorage.getItem(LS_CONTENT_KEY);
    if (!raw) return DEFAULT_CONTENT;
    const parsed = JSON.parse(raw) as Partial<SiteContent>;
    // merge superficial con defaults
    return {
      ...DEFAULT_CONTENT,
      ...parsed,
      hero: { ...DEFAULT_CONTENT.hero, ...(parsed.hero || {}) },
      about: { ...DEFAULT_CONTENT.about, ...(parsed as any).about },
      services: parsed.services && parsed.services.length ? parsed.services : DEFAULT_CONTENT.services,
      testimonials:
        parsed.testimonials && parsed.testimonials.length ? parsed.testimonials : DEFAULT_CONTENT.testimonials,
    };
  } catch {
    return DEFAULT_CONTENT;
  }
};

const saveContent = (data: SiteContent) => {
  localStorage.setItem(LS_CONTENT_KEY, JSON.stringify(data));
};

// ==== HELPERS (admin session) ==============================================
const now = () => Date.now();
const hours = (h: number) => h * 60 * 60 * 1000;

const setAdminSession = () => {
  const expiresAt = now() + hours(ADMIN_TTL_HOURS);
  const s: AdminSession = { expiresAt };
  localStorage.setItem(LS_ADMIN_KEY, JSON.stringify(s));
};

const getAdminSession = (): AdminSession | null => {
  try {
    const raw = localStorage.getItem(LS_ADMIN_KEY);
    if (!raw) return null;
    const s = JSON.parse(raw) as AdminSession;
    if (!s?.expiresAt || s.expiresAt < now()) {
      localStorage.removeItem(LS_ADMIN_KEY);
      return null;
    }
    return s;
  } catch {
    return null;
  }
};

const clearAdminSession = () => localStorage.removeItem(LS_ADMIN_KEY);

// ==== HELPERS (import/export) ==============================================
const downloadJSON = (obj: unknown, filename: string) => {
  const blob = new Blob([JSON.stringify(obj, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
};

// ==== VALIDACIONES (About) ==================================================
const validateAbout = (about: AboutContent) => {
  const titleLen = about.title.trim().length;
  const titleOk = titleLen >= 10 && titleLen <= 80;
  const paragraphs = about.paragraph
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean);
  const paraOk = paragraphs.length >= 1 && paragraphs.length <= 4;
  const bulletsOkCount = about.bullets.length >= 3 && about.bullets.length <= 6;
  const bulletLengths = about.bullets.map((b) => b.trim().length);
  const bulletsAllOk = bulletLengths.every((n) => n >= 1 && n <= 60);
  return { titleOk, paraOk, bulletsOkCount, bulletsAllOk, paragraphsCount: paragraphs.length, titleLen, bulletLengths };
};

// ==== SMALL UI PRIMITIVES (Aceternity-inspired) ============================
function FlipWords({
  words,
  interval = 3000,
  className = "",
}: {
  words: string[];
  interval?: number;
  className?: string;
}) {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setIdx((i) => (i + 1) % words.length), interval);
    return () => clearInterval(id);
  }, [interval, words.length]);
  return (
    <span className={`inline-block relative h-[1em] overflow-y-clip align-baseline ${className}`} aria-live="polite">
      <span key={idx} className="inline-block will-change-transform animate-word-flip" style={{ whiteSpace: "nowrap" }}>
        {words[idx]}
      </span>
      <style>{"@keyframes word-flip { 0% { transform: translateY(100%); opacity: 0 } 10% { transform: translateY(0%); opacity: 1 } 90% { transform: translateY(0%); opacity: 1 } 100% { transform: translateY(-100%); opacity: 0 } } .animate-word-flip { animation: word-flip " + interval + "ms ease-in-out; }"}</style>
    </span>
  );
}

function CardHover({
  children,
  className = "",
  style = {} as React.CSSProperties,
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div className={`group relative rounded-3xl border transition-all duration-300 ${className}`} style={style}>
      <div
        className="pointer-events-none absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 blur-xl transition-opacity"
        style={{ background: `radial-gradient(600px circle at var(--x,50%) var(--y,50%), ${ACCENT}22, transparent 40%)` }}
      />
      <div className="relative rounded-3xl transition-transform duration-300 group-hover:-translate-y-1">{children}</div>
      <script
        dangerouslySetInnerHTML={{
          __html:
            "document.addEventListener('mousemove', function(e){ var el = e.target && e.target.closest ? e.target.closest('.group') : null; if(!el) return; var r = el.getBoundingClientRect(); el.style.setProperty('--x', (e.clientX - r.left)+'px'); el.style.setProperty('--y', (e.clientY - r.top)+'px'); });",
        }}
      />
    </div>
  );
}

// ==== APP ===================================================================
export default function TusContasOnlineMVP() {
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    if (typeof window === "undefined") return "dark";
    return (localStorage.getItem("tco-theme") as "light" | "dark") || "dark";
  });

  useEffect(() => {
    localStorage.setItem("tco-theme", theme);
  }, [theme]);

  // Contenido (hidratar desde localStorage, fallback defaults)
  const [content, setContent] = useState<SiteContent>(() => (typeof window !== "undefined" ? loadContent() : DEFAULT_CONTENT));
  useEffect(() => {
    saveContent(content);
  }, [content]);

  // Sesión admin y vista admin
  const [admin, setAdmin] = useState<AdminSession | null>(() => (typeof window !== "undefined" ? getAdminSession() : null));
  const [showLogin, setShowLogin] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const showSaved = (msg = "Guardado") => {
    setToast(msg);
    setTimeout(() => setToast(null), 2000);
  };

  const isDark = theme === "dark";
  const colors = isDark
    ? { app: DARK_APP_BG, panel: DARK_PANEL_BG, border: "rgba(255,255,255,0.10)", text: "#E5E7EB", muted: "#D1D5DB", muted2: "#9CA3AF", wash: "rgba(230,102,99,0.10)", headerBg: "rgba(17,17,17,0.40)" }
    : { app: LIGHT_APP_BG, panel: "#FFFFFF", border: "rgba(0,0,0,0.10)", text: "#111827", muted: "#52525B", muted2: "#6B7280", wash: LIGHT_WASH, headerBg: "rgba(255,255,255,0.55)" };

  const testimonials = content.testimonials;

  return (
    <div style={{ minHeight: "100vh", backgroundColor: colors.app, color: colors.text }}>
      {/* Global keyword highlight */}
      <style>{
        ".keyword{background-image:linear-gradient(0deg, " +
          ACCENT +
          "22 0%, " +
          ACCENT +
          "22 100%); background-size:0% 100%; background-repeat:no-repeat; transition:background-size .25s ease;}" +
          ".keyword:hover{background-size:100% 100%;}"
      }</style>

      <Header
        theme={theme}
        setTheme={setTheme}
        colors={colors}
        admin={!!admin}
        onLogin={() => setShowLogin(true)}
        onOpenAdmin={() => setShowAdminPanel(true)}
        onLogout={() => {
          clearAdminSession();
          setAdmin(null);
          setShowAdminPanel(false);
          showSaved("Sesión cerrada");
        }}
      />

      <main style={{ paddingTop: "6rem" }}>
        <Hero colors={colors} content={content} />
        <Services colors={colors} content={content} />
        <AboutUs colors={colors} content={content.about} />
        <AnimatedTestimonials
          items={testimonials.map((t) => ({ logo: t.imageUrl || "", logoAlt: t.name, quote: t.quote, name: t.name, role: t.role }))}
          colors={colors}
        />
        <Contact colors={colors} />
      </main>

      <Footer colors={colors} />

      {/* Modales admin */}
      {showLogin && (
        <AdminLoginModal
          colors={colors}
          onClose={() => setShowLogin(false)}
          onSuccess={() => {
            setAdminSession();
            setAdmin(getAdminSession());
            setShowLogin(false);
            setShowAdminPanel(true);
          }}
        />
      )}

      {admin && showAdminPanel && (
        <AdminPanel
          colors={colors}
          content={content}
          setContent={(c) => {
            setContent(c);
            showSaved();
          }}
          onClose={() => setShowAdminPanel(false)}
        />
      )}

      {/* Toast simple */}
      {toast && (
        <div className="fixed bottom-4 inset-x-0 grid place-items-center z-[9999]">
          <div className="rounded-2xl px-4 py-2 text-white shadow" style={{ backgroundColor: ACCENT }}>{toast}</div>
        </div>
      )}
    </div>
  );
}

// ==== HEADER / NAVBAR (Floating + scroll-aware) ============================
function Header({
  theme,
  setTheme,
  colors,
  admin,
  onLogin,
  onOpenAdmin,
  onLogout,
}: {
  theme: "light" | "dark";
  setTheme: (t: "light" | "dark") => void;
  colors: any;
  admin: boolean;
  onLogin: () => void;
  onOpenAdmin: () => void;
  onLogout: () => void;
}) {
  const [solid, setSolid] = useState(false);
  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setSolid(y > 16);
      setHidden(y > lastY.current && y > 120); // hide when scrolling down
      lastY.current = y;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 backdrop-blur border-b transition-all duration-300 ${hidden ? "-translate-y-full" : "translate-y-0"}`}
      style={{
        backgroundColor: solid ? colors.headerBg : "transparent",
        borderColor: solid ? colors.border : "transparent",
      }}
    >
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
        <a href="#home" className="flex items-center gap-3 group">
          <span className="hidden sm:inline text-base md:text-lg font-serif font-semibold tracking-tight">
            Tus Contas <span style={{ color: ACCENT }} className="keyword">Online</span>
          </span>
        </a>

        <nav className="hidden md:flex items-center gap-6 text-sm">
          {[
            { href: "#services", label: "Servicios" },
            { href: "#testimonials", label: "Clientes" },
            { href: "#about", label: "Quiénes somos" },
            { href: "#contact", label: "Contacto" },
          ].map((l) => (
            <a key={l.href + l.label} href={l.href} className="hover:opacity-100 relative group/nav" style={{ color: "inherit" }}>
              <span className="navlink">{l.label}</span>
              <span className="pointer-events-none absolute inset-x-0 -bottom-1 h-px scale-x-0 group-hover/nav:scale-x-100 origin-left transition-transform" style={{ background: `linear-gradient(90deg, ${ACCENT}, transparent)` }} />
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {/* Botón Admin/Login */}
          {!admin ? (
            <button
              onClick={onLogin}
              aria-label="Ingresar como admin"
              className="inline-flex items-center gap-2 rounded-2xl px-3 py-2 transition-colors"
              style={{ border: `1px solid ${colors.border}` }}
            >
              <LogIn className="h-4 w-4" /> <span className="hidden sm:inline text-sm">Ingresar</span>
            </button>
          ) : (
            <>
              <button
                onClick={onOpenAdmin}
                aria-label="Abrir panel de administración"
                className="inline-flex items-center gap-2 rounded-2xl px-3 py-2 transition-colors"
                style={{ border: `1px solid ${colors.border}` }}
              >
                <Pencil className="h-4 w-4" /> <span className="hidden sm:inline text-sm">Sitio web</span>
              </button>
              <button
                onClick={onLogout}
                aria-label="Salir"
                className="inline-flex items-center gap-2 rounded-2xl px-3 py-2 transition-colors"
                style={{ border: `1px solid ${colors.border}` }}
              >
                <LogOut className="h-4 w-4" />
              </button>
            </>
          )}

          <a
            href={WHATSAPP_LINK}
            target="_blank"
            rel="noreferrer"
            className="hidden sm:inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-white shadow-sm hover:shadow transition-shadow"
            style={{ backgroundColor: ACCENT }}
          >
            <MessageCircle className="h-4 w-4" />
            <span className="text-sm font-medium">Escribinos</span>
          </a>

          <button
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            aria-label="Cambiar tema"
            className="inline-flex items-center gap-2 rounded-2xl px-3 py-2 transition-colors"
            style={{ border: `1px solid ${colors.border}` }}
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
        </div>
      </div>
      <style>{`.navlink { position: relative }`}</style>
    </header>
  );
}

// ==== HERO (lee desde content) =============================================
function Hero({ colors, content }: { colors: any; content: SiteContent }) {
  const h = content.hero;
  return (
    <section id="home" className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10" style={{ backgroundColor: colors.wash }} />
      <div className="mx-auto max-w-6xl px-4 pt-10 pb-20 grid md:grid-cols-2 gap-8 items-center">
        <div>
          <h1 className="text-4xl md:text-5xl font-serif font-semibold leading-tight">
            {h.titleBase} <span style={{ color: ACCENT }}>
              <span className="sr-only"> </span>
              <FlipWords className="ml-2" words={h.flipWords} />
            </span>
          </h1>
          <p className="mt-4 max-w-prose" style={{ color: colors.muted }}>{h.subtitle}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href="#services"
              className="inline-flex items-center gap-2 rounded-2xl px-4 py-3 text-white shadow hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5"
              style={{ backgroundColor: ACCENT }}
            >
              Ver servicios <ChevronRight className="h-4 w-4" />
            </a>
            <a
              href={WHATSAPP_LINK}
              target="_blank" rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-2xl border px-4 py-3 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5"
              style={{ borderColor: colors.border }}
            >
              Consultar por WhatsApp
            </a>
          </div>
          <ul className="mt-6 space-y-2 text-sm" style={{ color: colors.muted }}>
            {h.bullets.map((b, i) => (
              <li key={i} className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" style={{ color: ACCENT }} /> <span className="keyword">{b}</span>
              </li>
            ))}
          </ul>
        </div>
        <LogoCard colors={colors} logoUrl={content.logoUrl} />
      </div>
    </section>
  );
}

// ==== LOGO CARD (contain centrado, caja cuadrada estable) ==================
function LogoCard({ colors, logoUrl }: { colors: any; logoUrl: string | null }) {
  const [logoOk, setLogoOk] = useState(true);
  const cardRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState("rotateX(0deg) rotateY(0deg) scale(1)");

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const rotMax = 10;
    const scale = 1.03;
    const rotateY = ((x / rect.width) - 0.5) * (rotMax * 2);
    const rotateX = -((y / rect.height) - 0.5) * (rotMax * 2);
    setTransform(`rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(${scale})`);
  };

  const handleLeave = () => setTransform("rotateX(0deg) rotateY(0deg) scale(1)");

  return (
    <div className="mx-auto w-full max-w-md grid place-items-center">
      <div
        ref={cardRef}
        className="rounded-3xl shadow-2xl"
        style={{ perspective: "900px", position: "relative" }}
        onMouseMove={handleMove}
        onMouseLeave={handleLeave}
      >
        <div
          className="rounded-3xl"
          style={{
            transform: transform,
            transformStyle: "preserve-3d",
            transition: "transform 150ms ease",
            boxShadow: "0 12px 32px rgba(0,0,0,0.18)",
            background: "rgba(255,255,255,0.75)",
            backdropFilter: "blur(2px)",
          }}
        >
          {logoOk && logoUrl ? (
            <img
              src={logoUrl}
              alt="Logo Tus Contas Online"
              className="block w-72 md:w-80 h-auto rounded-3xl"
              style={{ display: "block", transform: "translateZ(0.01px)" }}
              onError={() => setLogoOk(false)}
            />
          ) : (
            <div
              className="w-72 md:w-80 h-24 rounded-3xl grid place-items-center text-white font-bold"
              style={{ backgroundColor: ACCENT }}
            >
              LOGO
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ==== SERVICES (lee desde content) =========================================
function Services({ colors, content }: { colors: any; content: SiteContent }) {
  const cards = content.services;
  return (
    <section id="services" className="scroll-mt-24 py-16">
      <div className="mx-auto max-w-6xl px-4">
        <h2 className="text-3xl font-serif font-semibold">Servicios</h2>
        <p className="mt-2 max-w-prose" style={{ color: colors.muted }}>
          Elegí el plan o servicio que mejor se adapte a tu etapa.
        </p>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((c, idx) => (
            <CardHover key={idx} className="p-5 shadow-md hover:shadow-xl" style={{ backgroundColor: colors.panel, borderColor: colors.border }}>
              <div className="h-10 w-10 rounded-xl grid place-items-center font-bold text-white shadow-sm" style={{ backgroundColor: ACCENT + '26', color: ACCENT }}>
                ✓
              </div>
              <h3 className="mt-4 text-lg font-medium">{c.title}</h3>
              <p className="mt-1 text-sm" style={{ color: colors.muted }}>
                {c.desc}
              </p>
              <a href="#contact" className="mt-4 inline-flex items-center gap-2 text-sm keyword" style={{ color: ACCENT }}>
                Consultar <ChevronRight className="h-4 w-4" />
              </a>
            </CardHover>
          ))}
        </div>
      </div>
    </section>
  );
}

// ==== ABOUT (EDITABLE) ======================================================
function AboutUs({ colors, content }: { colors: any; content: AboutContent }) {
  const paragraphs = content.paragraph
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean);
  const imgSrc = content.imageUrl || "/images/imagen-equipo.jpg";
  return (
    <section id="about" className="scroll-mt-24 py-16" style={{ backgroundColor: colors.wash }}>
      <div className="mx-auto max-w-6xl px-4 grid md:grid-cols-2 gap-8 items-center">
        <div>
          <h2 className="text-3xl font-serif font-semibold">{content.title}</h2>
          {paragraphs.map((p, i) => (
            <p key={i} className="mt-3" style={{ color: colors.muted }}>
              {p}
            </p>
          ))}
          <ul className="mt-4 space-y-2 text-sm" style={{ color: colors.muted }}>
            {content.bullets.map((b, i) => (
              <li key={i} className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" style={{ color: ACCENT }} /> {b}
              </li>
            ))}
          </ul>
        </div>

        <div
          className="rounded-3xl border overflow-hidden shadow-xl transition-transform duration-300 hover:-translate-y-1 hover:shadow-2xl"
          style={{ backgroundColor: colors.panel, borderColor: colors.border, transformStyle: "preserve-3d" }}
        >
          <div className="w-full aspect-[3/2]">
            <img
              src={imgSrc}
              alt="Equipo Tus Contas Online"
              className="w-full h-full object-cover object-center"
              style={{ transition: "transform 0.3s ease" }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.04) rotateX(1deg) rotateY(-1deg)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1) rotateX(0) rotateY(0)")}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

// ==== TESTIMONIOS (lee items mapeados desde content) =======================
function AnimatedTestimonials({
  items,
  colors,
  autoPlay = true,
  interval = 5000,
}: {
  items: { logo: string; logoAlt: string; quote: string; name: string; role?: string }[];
  colors: any;
  autoPlay?: boolean;
  interval?: number;
}) {
  const [idx, setIdx] = useState(0);
  const n = items.length;
  const next = () => setIdx((i) => (i + 1) % n);
  const prev = () => setIdx((i) => (i - 1 + n) % n);

  useEffect(() => {
    if (!autoPlay) return;
    const id = setInterval(next, interval);
    return () => clearInterval(id);
  }, [interval, autoPlay, n]);

  const it = items[idx] || { logo: "", logoAlt: "", quote: "", name: "" };

  return (
    <section id="testimonials" className="scroll-mt-24 py-16">
      <div className="mx-auto max-w-6xl px-4">
        <h2 className="text-3xl font-serif font-semibold">Clientes & Casos de éxito</h2>

        <div className="mt-8 relative">
          {/* Card */}
          <div className="rounded-3xl border shadow-md overflow-hidden" style={{ backgroundColor: colors.panel, borderColor: colors.border }}>
            <div className="grid md:grid-cols-5 gap-0">
              {/* Imagen 4:3 cover, centro => nunca se deforma */}
              <div className="md:col-span-2 flex items-center justify-center p-8 border-b md:border-b-0 md:border-r" style={{ borderColor: colors.border }}>
                <div className="w-full max-w-[280px] aspect-[4/3] bg-white/60 rounded-2xl overflow-hidden">
                  {it.logo ? (
                    <img src={it.logo} alt={it.logoAlt} className="w-full h-full object-cover object-center" />
                  ) : (
                    <div className="h-full grid place-items-center text-xs text-neutral-500">
                      Ideal 1200×900 (4:3). Otras proporciones se recortan centradas.
                    </div>
                  )}
                </div>
              </div>

              {/* Quote side */}
              <div className="md:col-span-3 p-6 md:p-8 flex flex-col">
                <blockquote
                  className="text-base md:text-lg leading-relaxed"
                  style={{
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    display: "-webkit-box",
                    WebkitLineClamp: 6,
                    WebkitBoxOrient: "vertical" as any,
                    wordBreak: "break-word",
                  }}
                >
                  “{it.quote}”
                </blockquote>
                <div className="mt-4 text-sm" style={{ color: colors.muted2 }}>
                  {it.name}
                  {it.role ? ` — ${it.role}` : ""}
                </div>
              </div>
            </div>
          </div>

          {/* Flechas */}
          <button
            aria-label="Anterior"
            onClick={prev}
            className="absolute left-2 top-1/2 -translate-y-1/2 p-2 opacity-60 hover:opacity-100 transition"
            style={{ color: ACCENT, background: "transparent" }}
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            aria-label="Siguiente"
            onClick={next}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 opacity-60 hover:opacity-100 transition"
            style={{ color: ACCENT, background: "transparent" }}
          >
            <ChvRight className="h-6 w-6" />
          </button>

          {/* Dots */}
          <div className="mt-4 flex items-center justify-center gap-2">
            {items.map((_, i) => (
              <button
                key={i}
                aria-label={`Ir al ${i + 1}`}
                onClick={() => setIdx(i)}
                className={`h-2.5 w-2.5 rounded-full ${i === idx ? "scale-110" : "opacity-60"} transition`}
                style={{ backgroundColor: ACCENT }}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ==== CONTACT (validación accesible y estética mejorada) ====================
function Contact({ colors }: { colors: any }) {
  type Fields = "nombre" | "apellido" | "email" | "mensaje";
  type FormData = Record<Fields, string>;
  type FormErrors = Partial<Record<Fields, string>>;
  type Touched = Partial<Record<Fields, boolean>>;

  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [form, setForm] = useState<FormData>({
    nombre: "",
    apellido: "",
    email: "",
    mensaje: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Touched>({});
  const [globalMsg, setGlobalMsg] = useState<string>("");

  const formRef = useRef<HTMLFormElement>(null);

  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Validación por campo y total
  const validateField = (k: Fields, v: string): string | "" => {
    const val = v.trim();
    if (k === "nombre") return val ? "" : "Ingresá tu nombre.";
    if (k === "apellido") return val ? "" : "Ingresá tu apellido.";
    if (k === "email") return val ? (emailRe.test(val) ? "" : "Email inválido.") : "Ingresá tu email.";
    if (k === "mensaje") return ""; // opcional
    return "";
  };

  const validateAll = (data: FormData): FormErrors => {
    const e: FormErrors = {};
    (Object.keys(data) as Fields[]).forEach((k) => {
      const msg = validateField(k, data[k]);
      if (msg) e[k] = msg;
    });
    return e;
  };

  // Handlers
  const onChange =
    (k: Fields) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const v = e.target.value;
      setForm((f) => ({ ...f, [k]: v }));
      if (touched[k]) {
        // validar en vivo sólo si ya se tocó el campo
        const msg = validateField(k, v);
        setErrors((prev) => ({ ...prev, [k]: msg || undefined }));
      }
    };

  const onBlur =
    (k: Fields) =>
    (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setTouched((t) => ({ ...t, [k]: true }));
      const msg = validateField(k, e.target.value);
      setErrors((prev) => ({ ...prev, [k]: msg || undefined }));
    };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === "loading") return;

    // honeypot
    const hp = (formRef.current?.querySelector('input[name="empresa"]') as HTMLInputElement)?.value || "";
    if (hp.trim().length > 0) {
      setStatus("error");
      setGlobalMsg("Se detectó un error en el envío.");
      return;
    }

    // Validar todo
    const allErrs = validateAll(form);
    setErrors(allErrs);
    setTouched({ nombre: true, apellido: true, email: true, mensaje: touched.mensaje ?? false });

    const hasErrors = Object.values(allErrs).some(Boolean);
    if (hasErrors) {
      setStatus("error");
      setGlobalMsg("Completá los campos marcados.");
      return;
    }

    // Simulación de request
    setStatus("loading");
    setGlobalMsg("");
    try {
      await new Promise((res) => setTimeout(res, 1200));
      setStatus("success");
      setGlobalMsg("¡Enviado!");
      setForm({ nombre: "", apellido: "", email: "", mensaje: "" });
      setErrors({});
      setTouched({});
      formRef.current?.reset();
      setTimeout(() => {
        setStatus("idle");
        setGlobalMsg("");
      }, 2000);
    } catch {
      setStatus("error");
      setGlobalMsg("Ocurrió un problema al enviar.");
      setTimeout(() => setStatus("idle"), 2000);
    }
  };

  const BtnIcon =
    status === "loading" ? Loader2 : status === "success" ? Check : status === "error" ? X : MessageCircle;

  // Helpers de estilo por campo
  const fieldClass = (k: Fields) => {
    const isTouched = !!touched[k];
    const hasError = !!errors[k];
    const valid = isTouched && !hasError && form[k].trim().length > 0;
    const base =
      "mt-1 w-full rounded-2xl border bg-transparent px-3 py-2 outline-none focus:ring-2 transition";
    if (hasError) return `${base} ring-1 ring-red-300 border-red-300`;
    if (valid) return `${base} ring-1 ring-green-300 border-green-300`;
    return `${base}`;
  };

  const msgId = (k: Fields) => `field-msg-${k}`;

  return (
    <section id="contact" className="scroll-mt-24 py-16">
      <div className="mx-auto max-w-6xl px-4 grid md:grid-cols-2 gap-10">
        <div>
          <h2 className="text-3xl font-serif font-semibold">Contacto</h2>
          <p className="mt-2" style={{ color: colors.muted }}>
            Elegí el canal que prefieras.
          </p>

          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <a
              href={WHATSAPP_LINK}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-white shadow hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5"
              style={{ backgroundColor: ACCENT }}
            >
              <MessageCircle className="h-5 w-5" />
              Escribir por WhatsApp
            </a>
            <a
              href="https://www.instagram.com/tuscontasonline"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-2xl border px-5 py-3 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5"
              style={{ borderColor: colors.border }}
            >
              <Instagram className="h-5 w-5" />
              Instagram
            </a>
          </div>

          {/* Live region para feedback global */}
          <p
            className="mt-6 text-sm min-h-[1.25rem]"
            style={{ color: status === "error" ? "#ef4444" : status === "success" ? "#16a34a" : colors.muted2 }}
            role="status"
            aria-live="polite"
          >
            {globalMsg}
          </p>
        </div>

        <form
          ref={formRef}
          onSubmit={onSubmit}
          noValidate
          className="rounded-3xl border p-6 shadow-md hover:shadow-lg transition-all duration-200"
          style={{ backgroundColor: colors.panel, borderColor: colors.border }}
        >
          <div className="grid sm:grid-cols-2 gap-4">
            {/* Nombre */}
            <div>
              <label className="text-sm" htmlFor="f-nombre">
                Nombre
              </label>
              <input
                id="f-nombre"
                name="nombre"
                className={fieldClass("nombre")}
                style={{ borderColor: colors.border }}
                placeholder="Tu nombre"
                value={form.nombre}
                onChange={onChange("nombre")}
                onBlur={onBlur("nombre")}
                aria-invalid={!!errors.nombre}
                aria-describedby={errors.nombre ? msgId("nombre") : undefined}
              />
              <FieldMsg
                id={msgId("nombre")}
                ok={touched.nombre ? !errors.nombre : false}
                error={errors.nombre}
              />
            </div>

            {/* Apellido */}
            <div>
              <label className="text-sm" htmlFor="f-apellido">
                Apellido
              </label>
              <input
                id="f-apellido"
                name="apellido"
                className={fieldClass("apellido")}
                style={{ borderColor: colors.border }}
                placeholder="Tu apellido"
                value={form.apellido}
                onChange={onChange("apellido")}
                onBlur={onBlur("apellido")}
                aria-invalid={!!errors.apellido}
                aria-describedby={errors.apellido ? msgId("apellido") : undefined}
              />
              <FieldMsg
                id={msgId("apellido")}
                ok={touched.apellido ? !errors.apellido : false}
                error={errors.apellido}
              />
            </div>

            {/* Email */}
            <div className="sm:col-span-2">
              <label className="text-sm" htmlFor="f-email">
                Email
              </label>
              <input
                id="f-email"
                type="email"
                name="email"
                className={fieldClass("email")}
                style={{ borderColor: colors.border }}
                placeholder="tu@email.com"
                value={form.email}
                onChange={onChange("email")}
                onBlur={onBlur("email")}
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? msgId("email") : undefined}
              />
              <FieldMsg id={msgId("email")} ok={touched.email ? !errors.email : false} error={errors.email} />
            </div>

            {/* Honeypot */}
            <input type="text" name="empresa" className="hidden" tabIndex={-1} autoComplete="off" />

            {/* Mensaje (opcional) */}
            <div className="sm:col-span-2">
              <label className="text-sm" htmlFor="f-mensaje">
                Mensaje
              </label>
              <textarea
                id="f-mensaje"
                name="mensaje"
                className={fieldClass("mensaje")}
                style={{ borderColor: colors.border }}
                rows={4}
                placeholder="Contanos en qué te podemos ayudar"
                value={form.mensaje}
                onChange={onChange("mensaje")}
                onBlur={onBlur("mensaje")}
                aria-invalid={!!errors.mensaje}
                aria-describedby={errors.mensaje ? msgId("mensaje") : undefined}
              />
              <FieldMsg
                id={msgId("mensaje")}
                ok={touched.mensaje ? !errors.mensaje : false}
                error={errors.mensaje}
              />
            </div>
          </div>

          <button
            disabled={status === "loading"}
            className="mt-4 inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-white shadow transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
            style={{
              backgroundColor:
                status === "error" ? "#ef4444" : status === "success" ? "#16a34a" : ACCENT,
            }}
          >
            <BtnIcon className={`h-5 w-5 ${status === "loading" ? "animate-spin" : ""}`} />
            {status === "idle" && "Enviar consulta"}
            {status === "loading" && "Enviando…"}
            {status === "success" && "¡Enviado!"}
            {status === "error" && "Revisá el formulario"}
          </button>
        </form>
      </div>
    </section>
  );
}

// Sub-componente de mensajes inline por campo
function FieldMsg({ id, ok, error }: { id: string; ok: boolean; error?: string }) {
  if (error) {
    return (
      <p id={id} className="mt-1 text-xs flex items-center gap-1 text-red-600">
        <AlertCircle className="h-3.5 w-3.5" /> {error}
      </p>
    );
  }
  if (ok) {
    return (
      <p id={id} className="mt-1 text-xs flex items-center gap-1 text-green-600">
        <CheckCircle className="h-3.5 w-3.5" /> 
      </p>
    );
  }
  return <span id={id} className="sr-only"></span>;
}

// ==== FOOTER ================================================================
function Footer({ colors }: { colors: any }) {
  return (
    <footer className="border-t py-10" style={{ backgroundColor: LIGHT_WASH, borderColor: colors.border }}>
      <div className="mx-auto max-w-6xl px-4">
        <div className="text-sm text-center">© Tus Contas Online 2025 – Todos los derechos reservados.</div>
      </div>
    </footer>
  );
}

// ==== ADMIN: LOGIN MODAL ====================================================
function AdminLoginModal({ colors, onClose, onSuccess }: { colors: any; onClose: () => void; onSuccess: () => void }) {
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeBtnRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    if (user === ADMIN_USER && pass === ADMIN_PASS) {
      onSuccess();
    } else {
      setErr("Usuario o contraseña incorrectos");
    }
  };

  return (
    <div role="dialog" aria-modal="true" className="fixed inset-0 z-[9998]">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div
        ref={panelRef}
        className="absolute inset-x-0 top-0 mx-auto max-w-md rounded-b-2xl border-b bg-white dark:bg-neutral-900 shadow-xl"
        style={{ borderColor: colors.border }}
      >
        <div className="px-4 py-3 flex items-center justify-between">
          <h3 className="text-base font-semibold">Ingresar como admin</h3>
          <button ref={closeBtnRef} onClick={onClose} aria-label="Cerrar" className="rounded-2xl p-2" style={{ border: `1px solid ${colors.border}` }}>
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={submit} className="px-4 pb-4">
          <div className="space-y-3">
            <div>
              <label className="text-sm" htmlFor="adm-user">
                Usuario
              </label>
              <input
                id="adm-user"
                className="mt-1 w-full rounded-2xl border bg-transparent px-3 py-2"
                style={{ borderColor: colors.border }}
                value={user}
                onChange={(e) => setUser(e.target.value)}
                placeholder="admin@tco"
                aria-invalid={!!err}
              />
            </div>
            <div>
              <label className="text-sm" htmlFor="adm-pass">
                Contraseña
              </label>
              <input
                id="adm-pass"
                type="password"
                className="mt-1 w-full rounded-2xl border bg-transparent px-3 py-2"
                style={{ borderColor: colors.border }}
                value={pass}
                onChange={(e) => setPass(e.target.value)}
                placeholder="••••••"
                aria-invalid={!!err}
              />
            </div>
            {err && <p className="text-sm text-red-500">{err}</p>}
            <div className="pt-2 flex items-center gap-2">
              <button className="rounded-2xl px-4 py-2 text-white" style={{ backgroundColor: ACCENT }} aria-label="Ingresar">
                Ingresar
              </button>
              <button
                type="button"
                className="rounded-2xl px-4 py-2 border"
                style={{ borderColor: colors.border }}
                onClick={onClose}
                aria-label="Cancelar"
              >
                Cancelar
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

// ==== ADMIN: PANEL ==========================================================
function AdminPanel({
  colors,
  content,
  setContent,
  onClose,
}: {
  colors: any;
  content: SiteContent;
  setContent: (c: SiteContent) => void;
  onClose: () => void;
}) {
  const [draft, setDraft] = useState<SiteContent>(content);
  const fileRefLogo = useRef<HTMLInputElement>(null);
  const fileRefImport = useRef<HTMLInputElement>(null);
  const fileRefAboutImg = useRef<HTMLInputElement>(null);
  const [heroFlipRaw, setHeroFlipRaw] = useState<string>(content.hero.flipWords.join(", "));
  
  useEffect(() => {
  setHeroFlipRaw(draft.hero.flipWords.join(", "));
}, [draft.hero.flipWords]);

  useEffect(() => {
    setDraft(content);
  }, [content]);

  const onPickLogo = () => fileRefLogo.current?.click();
  const onPickAboutImage = () => fileRefAboutImg.current?.click();
  const readAsDataURL = (f: File) =>
    new Promise<string>((res, rej) => {
      const r = new FileReader();
      r.onload = () => res(String(r.result));
      r.onerror = rej;
      r.readAsDataURL(f);
    });

  const onLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const dataUrl = await readAsDataURL(f);
    setDraft((d) => ({ ...d, logoUrl: dataUrl }));
  };

  const onAboutImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const dataUrl = await readAsDataURL(f);
    setDraft((d) => ({ ...d, about: { ...d.about, imageUrl: dataUrl } }));
  };

  const save = () => setContent(draft); // validaciones suaves: no bloquea

  const addService = () =>
    setDraft((d) => ({ ...d, services: [...d.services, { title: "Nuevo servicio", desc: "Descripción" }] }));
  const removeService = (i: number) =>
    setDraft((d) => ({ ...d, services: d.services.filter((_, idx) => idx !== i) }));

  const addTestimonial = () =>
    setDraft((d) => ({ ...d, testimonials: [...d.testimonials, { imageUrl: null, quote: "Nuevo testimonio", name: "Nombre", role: "Rol" }] }));
  const removeTestimonial = (i: number) =>
    setDraft((d) => ({ ...d, testimonials: d.testimonials.filter((_, idx) => idx !== i) }));
  const onPickTestimonialImage = async (i: number, f?: File) => {
    if (!f) return;
    const dataUrl = await readAsDataURL(f);
    setDraft((d) => {
      const arr = d.testimonials.slice();
      arr[i] = { ...arr[i], imageUrl: dataUrl };
      return { ...d, testimonials: arr };
    });
  };

  const exportJSON = () => downloadJSON(draft, "tco-content.json");

  const importJSON = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    try {
      const parsed = JSON.parse(text) as SiteContent;
      if (!parsed || !parsed.hero || !parsed.services || !parsed.testimonials || !parsed.about)
        throw new Error("Formato inválido");
      if (!confirm("¿Reemplazar el contenido actual?")) return;
      setDraft(parsed);
    } catch (err) {
      alert("JSON inválido");
    }
  };

  // Bloquear scroll y cerrar con Esc
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  const aboutValidation = validateAbout(draft.about);

  return (
    <div role="dialog" aria-modal="true" className="fixed inset-0 z-[9997]">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute right-0 top-0 h-full w-full max-w-3xl overflow-y-auto border-l bg-white dark:bg-neutral-900" style={{ borderColor: colors.border }}>
        <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white/80 dark:bg-neutral-900/80 backdrop-blur px-4 py-3" style={{ borderColor: colors.border }}>
          <h3 className="text-base font-semibold">Administrador</h3>
          <div className="flex items-center gap-2">
            <button onClick={save} className="rounded-2xl px-4 py-2 text-white" style={{ backgroundColor: ACCENT }} aria-label="Guardar cambios">
              Guardar
            </button>
            <button
              onClick={() => fileRefImport.current?.click()}
              className="rounded-2xl px-3 py-2 border inline-flex items-center gap-2"
              style={{ borderColor: colors.border }}
              aria-label="Importar JSON"
            >
              <Upload className="h-4 w-4" />
              <span className="hidden sm:inline text-sm">Importar</span>
            </button>
            <button
              onClick={exportJSON}
              className="rounded-2xl px-3 py-2 border inline-flex items-center gap-2"
              style={{ borderColor: colors.border }}
              aria-label="Exportar JSON"
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline text-sm">Exportar</span>
            </button>
            <button onClick={onClose} className="rounded-2xl px-3 py-2 border" style={{ borderColor: colors.border }} aria-label="Cerrar">
              <X className="h-4 w-4" />
            </button>
          </div>
          <input ref={fileRefImport} type="file" accept="application/json" onChange={importJSON} className="hidden" />
        </div>

        <div className="p-4 space-y-8">
          {/* LOGO */}
          <section>
            <h4 className="text-sm font-semibold">Logo</h4>
            <p className="text-xs text-neutral-500">Ideal 800×800; si no coincide, se centrará y adaptará sin deformarse ("contain").</p>
            <div className="mt-3 flex items-start gap-4">
              <div className="relative w-[160px] h-[160px] rounded-xl border bg-white/70 grid place-items-center" style={{ borderColor: colors.border }}>
                {draft.logoUrl ? (
                  <img src={draft.logoUrl} alt="Logo" className="max-w-full max-h-full object-contain" />
                ) : (
                  <div className="text-[11px] text-neutral-500 text-center px-2">Previsualización</div>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <button onClick={onPickLogo} className="rounded-2xl px-3 py-2 border" style={{ borderColor: colors.border }} aria-label="Subir logo">
                  Subir imagen
                </button>
                <button
                  onClick={() => setDraft((d) => ({ ...d, logoUrl: null }))}
                  className="rounded-2xl px-3 py-2 border inline-flex items-center gap-2"
                  style={{ borderColor: colors.border }}
                  aria-label="Quitar logo"
                >
                  <Trash2 className="h-4 w-4" />Quitar
                </button>
                <input ref={fileRefLogo} type="file" accept="image/*" onChange={onLogoChange} className="hidden" />
              </div>
            </div>
          </section>

          {/* HERO TEXTOS */}
          <section>
            <h4 className="text-sm font-semibold">Hero</h4>
            <div className="mt-3 grid sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs">Título (parte inicial)</label>
                <input
                  className="mt-1 w-full rounded-2xl border bg-transparent px-3 py-2"
                  style={{ borderColor: colors.border }}
                  value={draft.hero.titleBase}
                  onChange={(e) => setDraft({ ...draft, hero: { ...draft.hero, titleBase: e.target.value } })}
                />
              </div>
              <div>
                <label className="text-xs">Palabras animadas (separadas por coma)</label>
                <input
                   className="mt-1 w-full rounded-2xl border bg-transparent px-3 py-2"
                   style={{ borderColor: colors.border }}
                    value={heroFlipRaw}
                   onChange={(e) => setHeroFlipRaw(e.target.value)}              // no trim acá
                   onBlur={(e) => {
                     const arr = e.target.value
                       .split(",")
                       .map((s) => s.replace(/\s+/g, " ").trim())                // normalizá espacios internos
                        .filter(Boolean);
                      setDraft((d) => ({ ...d, hero: { ...d.hero, flipWords: arr } }));
                    }}
                    placeholder="sin vueltas, sin demoras"
                  />
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs">Subtítulo</label>
                <textarea
                  className="mt-1 w-full rounded-2xl border bg-transparent px-3 py-2"
                  style={{ borderColor: colors.border }}
                  rows={2}
                  value={draft.hero.subtitle}
                  onChange={(e) => setDraft({ ...draft, hero: { ...draft.hero, subtitle: e.target.value } })}
                />
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs">Bullets (una por línea)</label>
                <textarea
                  className="mt-1 w-full rounded-2xl border bg-transparent px-3 py-2"
                  style={{ borderColor: colors.border }}
                  rows={3}
                  value={draft.hero.bullets.join("\n")}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      hero: { ...draft.hero, bullets: e.target.value.split("\n").map((s) => s.trim()).filter(Boolean) },
                    })
                  }
                />
              </div>
            </div>
          </section>

          {/* ABOUT (NUEVO) */}
          <section>
            <h4 className="text-sm font-semibold">Quiénes somos</h4>
            <p className="text-xs text-neutral-500">Recomendado para imagen: 1200×800 (3:2) o 1600×1067 (~3:2). En público se muestra como <strong>cover</strong> centrado, sin deformar.</p>

            {/* Validaciones suaves */}
            <div className="mt-2 text-xs">
              <span className={aboutValidation.titleOk ? "text-green-600" : "text-red-600"}>Título {aboutValidation.titleLen}/80 (10–80)</span>
              <span className="mx-2">·</span>
              <span className={aboutValidation.paraOk ? "text-green-600" : "text-red-600"}>Párrafos {aboutValidation.paragraphsCount} (1–4)</span>
              <span className="mx-2">·</span>
              <span className={aboutValidation.bulletsOkCount ? "text-green-600" : "text-red-600"}>Bullets {draft.about.bullets.length} (3–6)</span>
            </div>

            <div className="mt-3 grid sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs">Título</label>
                <input
                  className={`mt-1 w-full rounded-2xl border bg-transparent px-3 py-2 ${aboutValidation.titleOk ? "" : "ring-1 ring-red-300 border-red-300"}`}
                  style={{ borderColor: colors.border }}
                  value={draft.about.title}
                  onChange={(e) => setDraft({ ...draft, about: { ...draft.about, title: e.target.value } })}
                />
              </div>
              <div>
                <label className="text-xs">Imagen del equipo</label>
                <div className="mt-1 flex gap-2 items-center">
                  <button onClick={onPickAboutImage} className="rounded-2xl px-3 py-2 border" style={{ borderColor: colors.border }} aria-label="Subir imagen">
                    Subir imagen
                  </button>
                  <input ref={fileRefAboutImg} type="file" accept="image/*" onChange={onAboutImageChange} className="hidden" />
                </div>
                <div className="mt-2 w-full rounded-xl border bg-white/70 overflow-hidden" style={{ borderColor: colors.border }}>
                  <div className="w-full aspect-[3/2] grid place-items-center">
                    {draft.about.imageUrl ? (
                      <img src={draft.about.imageUrl} alt="Equipo" className="w-full h-full object-cover object-center" />
                    ) : (
                      <span className="text-[11px] text-neutral-500">Previsualización 3:2 (cover)</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs">Párrafo principal (usá doble Enter para separar párrafos)</label>
                <textarea
                  className={`mt-1 w-full rounded-2xl border bg-transparent px-3 py-2 ${aboutValidation.paraOk ? "" : "ring-1 ring-red-300 border-red-300"}`}
                  style={{ borderColor: colors.border }}
                  rows={4}
                  value={draft.about.paragraph}
                  onChange={(e) => setDraft({ ...draft, about: { ...draft.about, paragraph: e.target.value } })}
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs">Bullets (1 por ítem)</label>
                <div className="mt-2 space-y-2">
                  {draft.about.bullets.map((b, i) => {
                    const len = b.trim().length;
                    const ok = len >= 1 && len <= 60;
                    return (
                      <div key={i} className="flex items-center gap-2">
                        <input
                          className={`flex-1 rounded-2xl border bg-transparent px-3 py-2 ${ok ? "" : "ring-1 ring-red-300 border-red-300"}`}
                          style={{ borderColor: colors.border }}
                          value={b}
                          onChange={(e) => {
                            const arr = draft.about.bullets.slice();
                            arr[i] = e.target.value;
                            setDraft({ ...draft, about: { ...draft.about, bullets: arr } });
                          }}
                        />
                        <span className={`text-[11px] ${ok ? "text-neutral-500" : "text-red-600"}`}>{len}/60</span>
                        <button
                          className="rounded-xl p-2 border"
                          style={{ borderColor: colors.border }}
                          aria-label={`Subir bullet ${i + 1}`}
                          onClick={() => {
                            if (i === 0) return;
                            const arr = draft.about.bullets.slice();
                            [arr[i - 1], arr[i]] = [arr[i], arr[i - 1]];
                            setDraft({ ...draft, about: { ...draft.about, bullets: arr } });
                          }}
                        >
                          <ArrowUp className="h-4 w-4" />
                        </button>
                        <button
                          className="rounded-xl p-2 border"
                          style={{ borderColor: colors.border }}
                          aria-label={`Bajar bullet ${i + 1}`}
                          onClick={() => {
                            const arr = draft.about.bullets.slice();
                            if (i >= arr.length - 1) return;
                            [arr[i + 1], arr[i]] = [arr[i], arr[i + 1]];
                            setDraft({ ...draft, about: { ...draft.about, bullets: arr } });
                          }}
                        >
                          <ArrowDown className="h-4 w-4" />
                        </button>
                        <button
                          className="rounded-xl p-2 border inline-flex items-center gap-1"
                          style={{ borderColor: colors.border }}
                          aria-label={`Eliminar bullet ${i + 1}`}
                          onClick={() => {
                            setDraft({ ...draft, about: { ...draft.about, bullets: draft.about.bullets.filter((_, idx) => idx !== i) } });
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    );
                  })}
                  <div className="pt-1">
                    <button
                      className="rounded-2xl px-3 py-2 border"
                      style={{ borderColor: colors.border }}
                      onClick={() => setDraft({ ...draft, about: { ...draft.about, bullets: [...draft.about.bullets, "Nuevo punto"] } })}
                      aria-label="Agregar bullet"
                    >
                      Agregar bullet
                    </button>
                    <span className={`ml-2 text-[11px] ${aboutValidation.bulletsOkCount && aboutValidation.bulletsAllOk ? "text-neutral-500" : "text-red-600"}`}>
                      {draft.about.bullets.length} ítems (esperado 3–6)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* SERVICES */}
          <section>
            <h4 className="text-sm font-semibold">Servicios</h4>
            <div className="mt-3 space-y-3">
              {draft.services.map((s, i) => (
                <div key={i} className="rounded-2xl border p-3" style={{ borderColor: colors.border }}>
                  <div className="grid sm:grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs">Título</label>
                      <input
                        className="mt-1 w-full rounded-2xl border bg-transparent px-3 py-2"
                        style={{ borderColor: colors.border }}
                        value={s.title}
                        onChange={(e) => {
                          const arr = draft.services.slice();
                          arr[i] = { ...arr[i], title: e.target.value };
                          setDraft({ ...draft, services: arr });
                        }}
                      />
                    </div>
                    <div>
                      <label className="text-xs">Descripción</label>
                      <input
                        className="mt-1 w-full rounded-2xl border bg-transparent px-3 py-2"
                        style={{ borderColor: colors.border }}
                        value={s.desc}
                        onChange={(e) => {
                          const arr = draft.services.slice();
                          arr[i] = { ...arr[i], desc: e.target.value };
                          setDraft({ ...draft, services: arr });
                        }}
                      />
                    </div>
                  </div>
                  <div className="mt-2 flex justify-end">
                    <button
                      onClick={() => removeService(i)}
                      className="rounded-2xl px-3 py-2 border inline-flex items-center gap-2"
                      style={{ borderColor: colors.border }}
                      aria-label={`Eliminar servicio ${i + 1}`}
                    >
                      <Trash2 className="h-4 w-4" />Eliminar
                    </button>
                  </div>
                </div>
              ))}
              <button
                onClick={addService}
                className="rounded-2xl px-3 py-2 border"
                style={{ borderColor: colors.border }}
                aria-label="Agregar servicio"
              >
                Agregar servicio
              </button>
            </div>
          </section>

          {/* TESTIMONIOS */}
          <section>
            <h4 className="text-sm font-semibold">Testimonios</h4>
            <p className="text-xs text-neutral-500">Ideal 1200×900 (4:3); otras proporciones se recortan centradas ("cover").</p>
            <div className="mt-3 space-y-3">
              {draft.testimonials.map((t, i) => (
                <div key={i} className="rounded-2xl border p-3" style={{ borderColor: colors.border }}>
                  <div className="grid sm:grid-cols-5 gap-3 items-start">
                    {/* Preview 4:3 */}
                    <div className="sm:col-span-2">
                      <div className="w-full aspect-[4/3] rounded-xl overflow-hidden border bg-white/70 grid place-items-center" style={{ borderColor: colors.border }}>
                        {t.imageUrl ? (
                          <img src={t.imageUrl} alt="Testimonio" className="w-full h-full object-cover object-center" />
                        ) : (
                          <span className="text-[11px] text-neutral-500">Previsualización 4:3</span>
                        )}
                      </div>
                      <div className="mt-2 flex gap-2">
                        <label className="rounded-2xl px-3 py-2 border cursor-pointer" style={{ borderColor: colors.border }}>
                          Subir imagen
                          <input type="file" accept="image/*" className="hidden" onChange={(e) => onPickTestimonialImage(i, e.target.files?.[0] || undefined)} />
                        </label>
                        <button
                          onClick={() =>
                            setDraft((d) => {
                              const arr = d.testimonials.slice();
                              arr[i] = { ...arr[i], imageUrl: null };
                              return { ...d, testimonials: arr };
                            })
                          }
                          className="rounded-2xl px-3 py-2 border inline-flex items-center gap-2"
                          style={{ borderColor: colors.border }}
                          aria-label={`Quitar imagen testimonio ${i + 1}`}
                        >
                          <Trash2 className="h-4 w-4" />Quitar
                        </button>
                      </div>
                    </div>

                    {/* Campos */}
                    <div className="sm:col-span-3 grid gap-2">
                      <div>
                        <label className="text-xs">Texto / cita</label>
                        <textarea
                          className="mt-1 w-full rounded-2xl border bg-transparent px-3 py-2"
                          style={{ borderColor: colors.border }}
                          rows={3}
                          value={t.quote}
                          onChange={(e) => {
                            const arr = draft.testimonials.slice();
                            arr[i] = { ...arr[i], quote: e.target.value };
                            setDraft({ ...draft, testimonials: arr });
                          }}
                        />
                      </div>
                      <div className="grid sm:grid-cols-2 gap-2">
                        <div>
                          <label className="text-xs">Nombre</label>
                          <input
                            className="mt-1 w-full rounded-2xl border bg-transparent px-3 py-2"
                            style={{ borderColor: colors.border }}
                            value={t.name}
                            onChange={(e) => {
                              const arr = draft.testimonials.slice();
                              arr[i] = { ...arr[i], name: e.target.value };
                              setDraft({ ...draft, testimonials: arr });
                            }}
                          />
                        </div>
                        <div>
                          <label className="text-xs">Rol (opcional)</label>
                          <input
                            className="mt-1 w-full rounded-2xl border bg-transparent px-3 py-2"
                            style={{ borderColor: colors.border }}
                            value={t.role || ""}
                            onChange={(e) => {
                              const arr = draft.testimonials.slice();
                              arr[i] = { ...arr[i], role: e.target.value };
                              setDraft({ ...draft, testimonials: arr });
                            }}
                          />
                        </div>
                      </div>
                      <div className="flex justify-end">
                        <button
                          onClick={() => removeTestimonial(i)}
                          className="rounded-2xl px-3 py-2 border inline-flex items-center gap-2"
                          style={{ borderColor: colors.border }}
                          aria-label={`Eliminar testimonio ${i + 1}`}
                        >
                          <Trash2 className="h-4 w-4" />Eliminar
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              <button
                onClick={addTestimonial}
                className="rounded-2xl px-3 py-2 border"
                style={{ borderColor: colors.border }}
                aria-label="Agregar testimonio"
              >
                Agregar testimonio
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

// ==== Dev-time tests ========================================================
if ((import.meta as any)?.env?.DEV) {
  console.assert(hours(12) === 12 * 60 * 60 * 1000, "hours() debe convertir correctamente");
  const ok = validateAbout({ title: "Título de ejemplo", paragraph: "p1\n\n p2", bullets: ["a", "b", "c"], imageUrl: null });
  console.assert(ok.titleOk && ok.paraOk && ok.bulletsOkCount && ok.bulletsAllOk, "validateAbout() debería aprobar valores válidos");
  const bad = validateAbout({ title: "corto", paragraph: "", bullets: ["", "b"], imageUrl: null });
  console.assert(!bad.titleOk && !bad.paraOk && !bad.bulletsAllOk, "validateAbout() debería detectar errores");
}
