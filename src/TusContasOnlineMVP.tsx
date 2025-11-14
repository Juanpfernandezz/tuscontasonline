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
} from "lucide-react";

// ==== THEME / COLORS ========================================================
const ACCENT = "#E66663";
const LIGHT_APP_BG = "#FBEAEA";
const LIGHT_WASH = "rgba(230,102,99,0.06)";
const DARK_APP_BG = "#0B0B0B";
const DARK_PANEL_BG = "#111111";

const WHATSAPP_LINK = "https://wa.me/3624718712";

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
      <span
        key={idx}
        className="inline-block will-change-transform animate-word-flip"
        style={{ whiteSpace: "nowrap" }}
      >
        {words[idx]}
      </span>
      <style>
        {"@keyframes word-flip { 0% { transform: translateY(100%); opacity: 0 } 10% { transform: translateY(0%); opacity: 1 } 90% { transform: translateY(0%); opacity: 1 } 100% { transform: translateY(-100%); opacity: 0 } } .animate-word-flip { animation: word-flip " +
          interval +
          "ms ease-in-out; }"}
      </style>
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
        style={{
          background: `radial-gradient(600px circle at var(--x,50%) var(--y,50%), ${ACCENT}22, transparent 40%)`,
        }}
      />
      <div className="relative rounded-3xl transition-transform duration-300 group-hover:-translate-y-1">
        {children}
      </div>
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
  const [content] = useState<SiteContent>(() =>
    typeof window !== "undefined" ? loadContent() : DEFAULT_CONTENT
  );
  useEffect(() => {
    // Se guarda el contenido actual, aunque ya no haya panel admin
    saveContent(content);
  }, [content]);

  const isDark = theme === "dark";
  const colors = isDark
    ? {
        app: DARK_APP_BG,
        panel: DARK_PANEL_BG,
        border: "rgba(255,255,255,0.10)",
        text: "#E5E7EB",
        muted: "#D1D5DB",
        muted2: "#9CA3AF",
        wash: "rgba(230,102,99,0.10)",
        headerBg: "rgba(17,17,17,0.40)",
      }
    : {
        app: LIGHT_APP_BG,
        panel: "#FFFFFF",
        border: "rgba(0,0,0,0.10)",
        text: "#111827",
        muted: "#52525B",
        muted2: "#6B7280",
        wash: LIGHT_WASH,
        headerBg: "rgba(255,255,255,0.55)",
      };

  const testimonials = content.testimonials;

  return (
    <div style={{ minHeight: "100vh", backgroundColor: colors.app, color: colors.text }}>
      {/* Global keyword highlight */}
      <style>
        {".keyword{background-image:linear-gradient(0deg, " +
          ACCENT +
          "22 0%, " +
          ACCENT +
          "22 100%); background-size:0% 100%; background-repeat:no-repeat; transition:background-size .25s ease;}" +
          ".keyword:hover{background-size:100% 100%;}"}
      </style>

      <Header theme={theme} setTheme={setTheme} colors={colors} />

      <main style={{ paddingTop: "6rem" }}>
        <Hero colors={colors} content={content} />
        <Services colors={colors} content={content} />
        <AboutUs colors={colors} content={content.about} />
        <AnimatedTestimonials
          items={testimonials.map((t) => ({
            logo: t.imageUrl || "",
            logoAlt: t.name,
            quote: t.quote,
            name: t.name,
            role: t.role,
          }))}
          colors={colors}
        />
        <Contact colors={colors} />
      </main>

      <Footer colors={colors} />
    </div>
  );
}

// ==== HEADER / NAVBAR (Floating + scroll-aware) ============================
function Header({
  theme,
  setTheme,
  colors,
}: {
  theme: "light" | "dark";
  setTheme: (t: "light" | "dark") => void;
  colors: any;
}) {
  const [solid, setSolid] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const lastY = useRef(0);

  const links = [
    { href: "#services", label: "Servicios" },
    { href: "#testimonials", label: "Clientes" },
    { href: "#about", label: "Quiénes somos" },
    { href: "#contact", label: "Contacto" },
  ];

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

  const toggleMobile = () => setMobileOpen((o) => !o);
  const closeMobile = () => setMobileOpen(false);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 backdrop-blur border-b transition-all duration-300 ${
        hidden ? "-translate-y-full" : "translate-y-0"
      }`}
      style={{
        backgroundColor: solid ? colors.headerBg : "transparent",
        borderColor: solid ? colors.border : "transparent",
      }}
    >
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
        <a href="#home" className="flex items-center gap-3 group">
          <span className="hidden sm:inline text-base md:text-lg font-serif font-semibold tracking-tight">
            Tus Contas{" "}
            <span style={{ color: ACCENT }} className="keyword">
              Online
            </span>
          </span>
        </a>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6 text-sm">
          {links.map((l) => (
            <a
              key={l.href + l.label}
              href={l.href}
              className="hover:opacity-100 relative group/nav"
              style={{ color: "inherit" }}
            >
              <span className="navlink">{l.label}</span>
              <span
                className="pointer-events-none absolute inset-x-0 -bottom-1 h-px scale-x-0 group-hover/nav:scale-x-100 origin-left transition-transform"
                style={{ background: `linear-gradient(90deg, ${ACCENT}, transparent)` }}
              />
            </a>
          ))}
        </nav>

        {/* Right side: theme + WhatsApp + mobile menu */}
        <div className="flex items-center gap-2">
          {/* Botón menú mobile */}
          <button
            onClick={toggleMobile}
            aria-label="Abrir menú"
            aria-expanded={mobileOpen}
            className="inline-flex items-center justify-center rounded-2xl p-2 border md:hidden"
            style={{ borderColor: colors.border }}
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Botón WhatsApp desktop/tablet */}
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

          {/* Botón tema siempre visible */}
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

      {/* Menú mobile desplegable */}
      {mobileOpen && (
        <div
          className="md:hidden border-t"
          style={{ backgroundColor: colors.panel, borderColor: colors.border }}
        >
          <nav className="px-4 py-3 flex flex-col gap-3">
            {links.map((l) => (
              <a
                key={l.href + l.label}
                href={l.href}
                onClick={closeMobile}
                className="text-sm py-1"
                style={{ color: colors.text }}
              >
                {l.label}
              </a>
            ))}

            <a
              href={WHATSAPP_LINK}
              target="_blank"
              rel="noreferrer"
              onClick={closeMobile}
              className="mt-2 inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-medium shadow-sm"
              style={{ backgroundColor: ACCENT, color: "#ffffff" }}
            >
              <MessageCircle className="h-4 w-4" />
              Escribir por WhatsApp
            </a>

            <button
              onClick={() => {
                setTheme(theme === "light" ? "dark" : "light");
                closeMobile();
              }}
              className="mt-2 inline-flex items-center gap-2 rounded-2xl px-3 py-2 text-sm border"
              style={{ borderColor: colors.border, color: colors.text }}
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              <span>Cambiar tema</span>
            </button>
          </nav>
        </div>
      )}

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
            {h.titleBase}{" "}
            <span style={{ color: ACCENT }}>
              <span className="sr-only"> </span>
              <FlipWords className="ml-2" words={h.flipWords} />
            </span>
          </h1>
          <p className="mt-4 max-w-prose" style={{ color: colors.muted }}>
            {h.subtitle}
          </p>
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
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-2xl border px-4 py-3 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5"
              style={{ borderColor: colors.border }}
            >
              Consultar por WhatsApp
            </a>
          </div>
          <ul className="mt-6 space-y-2 text-sm" style={{ color: colors.muted }}>
            {h.bullets.map((b, i) => (
              <li key={i} className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" style={{ color: ACCENT }} />{" "}
                <span className="keyword">{b}</span>
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
            <CardHover
              key={idx}
              className="p-5 shadow-md hover:shadow-xl"
              style={{ backgroundColor: colors.panel, borderColor: colors.border }}
            >
              <div
                className="h-10 w-10 rounded-xl grid place-items-center font-bold text-white shadow-sm"
                style={{ backgroundColor: ACCENT + "26", color: ACCENT }}
              >
                ✓
              </div>
              <h3 className="mt-4 text-lg font-medium">{c.title}</h3>
              <p className="mt-1 text-sm" style={{ color: colors.muted }}>
                {c.desc}
              </p>
              <a
                href="#contact"
                className="mt-4 inline-flex items-center gap-2 text-sm keyword"
                style={{ color: ACCENT }}
              >
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
              onMouseEnter={(e) =>
                (e.currentTarget.style.transform = "scale(1.04) rotateX(1deg) rotateY(-1deg)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.transform = "scale(1) rotateX(0) rotateY(0)")
              }
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
          <div
            className="rounded-3xl border shadow-md overflow-hidden"
            style={{ backgroundColor: colors.panel, borderColor: colors.border }}
          >
            <div className="grid md:grid-cols-5 gap-0">
              {/* Imagen 4:3 cover, centro => nunca se deforma */}
              <div
                className="md:col-span-2 flex items-center justify-center p-8 border-b md:border-b-0 md:border-r"
                style={{ borderColor: colors.border }}
              >
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
                className={`h-2.5 w-2.5 rounded-full ${
                  i === idx ? "scale-110" : "opacity-60"
                } transition`}
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
    const hp =
      (formRef.current?.querySelector('input[name="empresa"]') as HTMLInputElement)?.value || "";
    if (hp.trim().length > 0) {
      setStatus("error");
      setGlobalMsg("Se detectó un error en el envío.");
      return;
    }

    // Validar todo
    const allErrs = validateAll(form);
    setErrors(allErrs);
    setTouched({
      nombre: true,
      apellido: true,
      email: true,
      mensaje: touched.mensaje ?? false,
    });

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
            style={{
              color:
                status === "error"
                  ? "#ef4444"
                  : status === "success"
                  ? "#16a34a"
                  : colors.muted2,
            }}
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
              <FieldMsg
                id={msgId("email")}
                ok={touched.email ? !errors.email : false}
                error={errors.email}
              />
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
    <footer
      className="border-t py-10"
      style={{ backgroundColor: LIGHT_WASH, borderColor: colors.border }}
    >
      <div className="mx-auto max-w-6xl px-4">
        <div className="text-sm text-center">
          © Tus Contas Online 2025 – Todos los derechos reservados.
        </div>
      </div>
    </footer>
  );
}
