import { useEffect, useState, useRef } from "react";
import { MessageCircle, Instagram, Moon, Sun, ChevronRight, CheckCircle, Loader2, Check, X, ChevronLeft, ChevronRight as ChvRight } from "lucide-react";

// ==== THEME / COLORS ========================================================
const ACCENT = "#E66663";
const LIGHT_APP_BG = "#FBEAEA";
const LIGHT_WASH = "rgba(230,102,99,0.06)";
const DARK_APP_BG = "#0B0B0B";
const DARK_PANEL_BG = "#111111";

const WHATSAPP_LINK = "https://wa.me/3777236888";

// ==== SMALL UI PRIMITIVES (Aceternity-inspired) ============================
function FlipWords({
  words,
  interval = 1600,
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
      <style>{`
        @keyframes word-flip {
          0% { transform: translateY(100%); opacity: 0 }
          10% { transform: translateY(0%); opacity: 1 }
          90% { transform: translateY(0%); opacity: 1 }
          100% { transform: translateY(-100%); opacity: 0 }
        }
        .animate-word-flip { animation: word-flip ${interval}ms ease-in-out; }
      `}</style>
    </span>
  );
}

// ✅ FIX TIPADO: children correctamente tipado
function CardHover({
  children,
  className = "",
  style = {} as React.CSSProperties,
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  // Aceternity-like hover glow + lift
  return (
    <div
      className={`group relative rounded-3xl border transition-all duration-300 ${className}`}
      style={style}
    >
      <div className="pointer-events-none absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 blur-xl transition-opacity"
           style={{ background: `radial-gradient(600px circle at var(--x,50%) var(--y,50%), ${ACCENT}22, transparent 40%)` }} />
      <div className="relative rounded-3xl transition-transform duration-300 group-hover:-translate-y-1">
        {children}
      </div>
      <script dangerouslySetInnerHTML={{__html:`
        document.addEventListener('mousemove', (e)=>{
          const t = (e.target as HTMLElement)?.closest?.('.group');
          if(!t) return; const r=t.getBoundingClientRect();
          (t as HTMLElement).style.setProperty('--x', (e.clientX - r.left)+'px');
          (t as HTMLElement).style.setProperty('--y', (e.clientY - r.top)+'px');
        });
      `}}/>
    </div>
  );
}

// Animated Testimonials (brands + quote + arrows)
function AnimatedTestimonials({
  items,
  colors,
  autoPlay = true,
  interval = 5000,
}: {
  items: {
    logo: string; // image path
    logoAlt: string;
    quote: string;
    name: string;
    role?: string;
  }[];
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

  const it = items[idx];

  return (
    <section id="testimonials" className="scroll-mt-24 py-16">
      <div className="mx-auto max-w-6xl px-4">
        <h2 className="text-3xl font-serif font-semibold">Clientes & Casos de éxito</h2>

        <div className="mt-8 relative">
          {/* Card */}
          <div className="rounded-3xl border shadow-md overflow-hidden" style={{ backgroundColor: colors.panel, borderColor: colors.border }}>
            <div className="grid md:grid-cols-5 gap-0">
              {/* Brand side */}
              <div className="md:col-span-2 flex items-center justify-center p-8 border-b md:border-b-0 md:border-r" style={{ borderColor: colors.border }}>
                <div className="w-full max-w-[280px] aspect-[4/3] bg-white/60 rounded-2xl grid place-items-center overflow-hidden">
                  {/* brand logo */}
                  {/* Replace logo size as needed */}
                  <img src={it.logo} alt={it.logoAlt} className="max-h-full max-w-full object-contain p-4" />
                </div>
              </div>

              {/* Quote side */}
              <div className="md:col-span-3 p-6 md:p-8 flex flex-col">
                <blockquote className="text-base md:text-lg leading-relaxed" style={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitLineClamp: 6,
                  WebkitBoxOrient: 'vertical' as any,
                  wordBreak: 'break-word',
                }}>“{it.quote}”</blockquote>
                <div className="mt-4 text-sm" style={{ color: colors.muted2 }}>{it.name}{it.role ? ` — ${it.role}` : ''}</div>
              </div>
            </div>
          </div>

          {/* ✅ Flechas minimalistas (sin fondo, sin borde, sólo icono) */}
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
              <button key={i} aria-label={`Ir al ${i+1}`}
                onClick={() => setIdx(i)}
                className={`h-2.5 w-2.5 rounded-full ${i===idx? 'scale-110' : 'opacity-60'} transition`}
                style={{ backgroundColor: ACCENT }} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ==== APP ===================================================================
export default function TusContasOnlineMVP() {
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    if (typeof window === "undefined") return "light";
    return (localStorage.getItem("tco-theme") as "light" | "dark") || "light";
  });

  useEffect(() => { localStorage.setItem("tco-theme", theme); }, [theme]);

  const isDark = theme === "dark";
  const colors = isDark
    ? { app: DARK_APP_BG, panel: DARK_PANEL_BG, border: "rgba(255,255,255,0.10)", text: "#E5E7EB", muted: "#D1D5DB", muted2: "#9CA3AF", wash: "rgba(230,102,99,0.10)", headerBg: "rgba(17,17,17,0.40)" }
    : { app: LIGHT_APP_BG, panel: "#FFFFFF", border: "rgba(0,0,0,0.10)", text: "#111827", muted: "#52525B", muted2: "#6B7280", wash: LIGHT_WASH, headerBg: "rgba(255,255,255,0.55)" };

  // demo data for testimonials (logos should exist in public/images/clients/*)
  const testimonials = [
    { logo: "/images/clients/hf-logo.png", logoAlt: "H&F Distribuidora", quote: "Ordenamos impuestos y flujo de caja en 30 días. Ahora proyectamos con claridad.", name: "H&F Distribuidora" },
    { logo: "/images/clients/tecwork-logo.png", logoAlt: "Tecwork", quote: "Pasé de no entender mis vencimientos a tener todo calendarizado y automatizado.", name: "Agustin", role: "Tecwork" },
   ];

  return (
    <div style={{ minHeight: "100vh", backgroundColor: colors.app, color: colors.text }}>
      {/* Global keyword highlight (hover shading instead of underline) */}
      <style>{`
        .keyword{background-image:linear-gradient(0deg, ${ACCENT}22 0%, ${ACCENT}22 100%); background-size:0% 100%; background-repeat:no-repeat; transition:background-size .25s ease;}
        .keyword:hover{background-size:100% 100%;}
      `}</style>
      <Header theme={theme} setTheme={setTheme} colors={colors} />
      <main style={{ paddingTop: "6rem" }}>
        <Hero colors={colors} />
        <Services colors={colors} />
        <AboutUs colors={colors} />
        <AnimatedTestimonials items={testimonials} colors={colors} />
        <Contact colors={colors} />
      </main>
      <Footer colors={colors} />
    </div>
  );
}

// ==== HEADER / NAVBAR (Floating + scroll-aware) ============================
function Header({ theme, setTheme, colors }: { theme: "light" | "dark"; setTheme: (t: "light" | "dark") => void; colors: any }) {
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
      className={`fixed inset-x-0 top-0 z-50 backdrop-blur border-b transition-all duration-300 ${hidden ? '-translate-y-full' : 'translate-y-0'}`}
      style={{
        backgroundColor: solid ? (colors.headerBg) : 'transparent',
        borderColor: solid ? colors.border : 'transparent',
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
            {href:'#services', label:'Servicios'},
            {href:'#testimonials', label:'Clientes'},
            {href:'#about', label:'Quiénes somos'},
            {href:'#contact', label:'Contacto'},
          ].map((l)=> (
            <a key={l.href + l.label} href={l.href} className="hover:opacity-100 relative group/nav" style={{ color: "inherit" }}>
              <span className="navlink">{l.label}</span>
              <span className="pointer-events-none absolute inset-x-0 -bottom-1 h-px scale-x-0 group-hover/nav:scale-x-100 origin-left transition-transform" style={{ background: `linear-gradient(90deg, ${ACCENT}, transparent)` }} />
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <a
            href={WHATSAPP_LINK}
            target="_blank" rel="noreferrer"
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
      <style>{`
        .navlink { position: relative }
      `}</style>
    </header>
  );
}

// ==== HERO ==================================================================
function Hero({ colors }: { colors: any }) {
  return (
    <section id="home" className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10" style={{ backgroundColor: colors.wash }} />
      <div className="mx-auto max-w-6xl px-4 pt-10 pb-20 grid md:grid-cols-2 gap-8 items-center">
        <div>
          <h1 className="text-4xl md:text-5xl font-serif font-semibold leading-tight">
            Tu contaduría online, <span style={{ color: ACCENT }}>sin
            <span className="sr-only"> </span>
            <FlipWords className="ml-2" words={["complicaciones","vuelta","demoras","papeles"]} />
            </span>.
          </h1>
          <p className="mt-4 max-w-prose" style={{ color: colors.muted }}>
            Acompañamos a <span className="keyword">emprendedoras</span> y <span className="keyword">pymes</span> con <a href="#services" className="keyword">servicios</a> contables claros, 100% digitales y a medida.
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
              target="_blank" rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-2xl border px-4 py-3 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5"
              style={{ borderColor: colors.border }}
            >
              Consultar por WhatsApp
            </a>
          </div>
          <ul className="mt-6 space-y-2 text-sm" style={{ color: colors.muted }}>
            <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4" style={{ color: ACCENT }}/> Atención ágil y cercana</li>
            <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4" style={{ color: ACCENT }}/> Gestión impositiva al día</li>
            <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4" style={{ color: ACCENT }}/> 100% online</li>
          </ul>
        </div>
        <MockCard colors={colors} />
      </div>
    </section>
  );
}

// ==== Hero Card =============================================================
function MockCard({ colors }: { colors: any }) {
  const [logoOk, setLogoOk] = useState(true);
  const cardRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState("rotateX(0deg) rotateY(0deg) scale(1)");

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = cardRef.current; if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left; const y = e.clientY - rect.top;
    const rotMax = 10; const scale = 1.03;
    const rotateY = ((x / rect.width) - 0.5) * (rotMax * 2);
    const rotateX = -((y / rect.height) - 0.5) * (rotMax * 2);
    setTransform(`rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(${scale})`);
  };
  const handleLeave = () => setTransform("rotateX(0deg) rotateY(0deg) scale(1)");

  return (
    <div className="mx-auto w-full max-w-md grid place-items-center">
      <div ref={cardRef} className="rounded-3xl shadow-2xl" style={{ perspective: "900px", position: "relative" }} onMouseMove={handleMove} onMouseLeave={handleLeave}>
        <div className="rounded-3xl" style={{ transform: transform, transformStyle: "preserve-3d", transition: "transform 150ms ease", boxShadow: "0 12px 32px rgba(0,0,0,0.18)", background: "rgba(255,255,255,0.75)", backdropFilter: "blur(2px)" }}>
          {logoOk ? (
            <img src="/images/logo-tus-contas-online.jpg" alt="Logo Tus Contas Online" className="block w-72 md:w-80 h-auto rounded-3xl" style={{ display: "block", transform: "translateZ(0.01px)" }} onError={() => setLogoOk(false)} />
          ) : (
            <div className="w-72 md:w-80 h-24 rounded-3xl grid place-items-center text-white font-bold" style={{ backgroundColor: ACCENT }}>LOGO</div>
          )}
        </div>
      </div>
    </div>
  );
}

// ==== SERVICES (Card hover effect) ==========================================
function Services({ colors }: { colors: any }) {
  const cards = [
    { title: "Monotributo y Autónomos", desc: "Alta, recategorización, vencimientos y presentación." },
    { title: "Gestión de impuestos", desc: "IVA, Ingresos Brutos, Ganancias. Nos ocupamos de todo." },
    { title: "Contabilidad para pymes", desc: "Estados, conciliaciones y reportes para decidir mejor." },
    { title: "Asesoramiento online", desc: "Espacios para despejar dudas y planificar." },
  ];

  return (
    <section id="services" className="scroll-mt-24 py-16">
      <div className="mx-auto max-w-6xl px-4">
        <h2 className="text-3xl font-serif font-semibold">Servicios</h2>
        <p className="mt-2 max-w-prose" style={{ color: colors.muted }}>Elegí el plan o servicio que mejor se adapte a tu etapa.</p>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((c) => (
            <CardHover key={c.title} className="p-5 shadow-md hover:shadow-xl" style={{ backgroundColor: colors.panel, borderColor: colors.border }}>
              <div className="h-10 w-10 rounded-xl grid place-items-center font-bold text-white shadow-sm" style={{ backgroundColor: ACCENT + '26', color: ACCENT }}>✓</div>
              <h3 className="mt-4 text-lg font-medium">{c.title}</h3>
              <p className="mt-1 text-sm" style={{ color: colors.muted }}>{c.desc}</p>
              <a href="#contact" className="mt-4 inline-flex items-center gap-2 text-sm keyword" style={{ color: ACCENT }}>
                Consultar <ChevronRight className="h-4 w-4"/>
              </a>
            </CardHover>
          ))}
        </div>
      </div>
    </section>
  );
}

// ==== ABOUT =================================================================
function AboutUs({ colors }: { colors: any }) {
  return (
    <section id="about" className="scroll-mt-24 py-16" style={{ backgroundColor: colors.wash }}>
      <div className="mx-auto max-w-6xl px-4 grid md:grid-cols-2 gap-8 items-center">
        <div>
          <h2 className="text-3xl font-serif font-semibold">Quiénes somos</h2>
          <p className="mt-3" style={{ color: colors.muted }}>
            Somos dos contadoras que aman simplificar la gestión para <a href="#testimonials" className="keyword">emprendedoras</a> y <span className="keyword">pymes</span>. Trabajamos 100% online,
            con procesos claros, recordatorios de vencimientos y reportes que te ayudan a decidir mejor.
          </p>
          <ul className="mt-4 space-y-2 text-sm" style={{ color: colors.muted }}>
            <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4" style={{ color: ACCENT }} /> Atención personalizada</li>
            <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4" style={{ color: ACCENT }} /> Onboarding en 48 hs</li>
            <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4" style={{ color: ACCENT }} /> Sin letra chica</li>
          </ul>
        </div>

        <div className="rounded-3xl border overflow-hidden shadow-xl transition-transform duration-300 hover:-translate-y-1 hover:shadow-2xl" style={{ backgroundColor: colors.panel, borderColor: colors.border, transformStyle: "preserve-3d" }}>
          <img src="/images/imagen-equipo.jpg" alt="Equipo Tus Contas Online" className="w-full h-auto object-cover rounded-3xl" style={{ transition: "transform 0.3s ease" }} onMouseEnter={(e)=> (e.currentTarget.style.transform = "scale(1.04) rotateX(1deg) rotateY(-1deg)")} onMouseLeave={(e)=> (e.currentTarget.style.transform = "scale(1) rotateX(0) rotateY(0)")} />
        </div>
      </div>
    </section>
  );
}

// ==== CONTACT (Stateful Button) =============================================
function Contact({ colors }: { colors: any }) {
  const [status, setStatus] = useState<"idle"|"loading"|"success"|"error">("idle");
  const formRef = useRef<HTMLFormElement>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === "loading") return;
    const form = formRef.current!;
    // Honeypot
    const hp = (form.querySelector('input[name="empresa"]') as HTMLInputElement)?.value || "";
    if (hp.trim().length > 0) { setStatus("error"); return; }

    setStatus("loading");
    try {
      // Simulación de request
      await new Promise((res) => setTimeout(res, 1300));
      setStatus("success");
      form.reset();
      setTimeout(() => setStatus("idle"), 2000);
    } catch (err) {
      setStatus("error");
      setTimeout(() => setStatus("idle"), 2000);
    }
  };

  const BtnIcon = status === 'loading' ? Loader2 : status === 'success' ? Check : status === 'error' ? X : MessageCircle;

  return (
    <section id="contact" className="scroll-mt-24 py-16">
      <div className="mx-auto max-w-6xl px-4 grid md:grid-cols-2 gap-10">
        <div>
          <h2 className="text-3xl font-serif font-semibold">Contacto</h2>
          <p className="mt-2" style={{ color: colors.muted }}>Elegí el canal que prefieras.</p>

          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <a href={WHATSAPP_LINK} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-white shadow hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5" style={{ backgroundColor: ACCENT }}>
              <MessageCircle className="h-5 w-5"/>
              Escribir por WhatsApp
            </a>
            <a href="https://www.instagram.com/tuscontasonline" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-2xl border px-5 py-3 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5" style={{ borderColor: colors.border }}>
              <Instagram className="h-5 w-5"/>
              Instagram
            </a>
          </div>

          <p className="mt-6 text-xs" style={{ color: colors.muted2 }}>También podés completar el formulario y te contactamos a la brevedad.</p>
        </div>

        <form ref={formRef} onSubmit={onSubmit} className="rounded-3xl border p-6 shadow-md hover:shadow-lg transition-all duration-200" style={{ backgroundColor: colors.panel, borderColor: colors.border }}>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm">Nombre</label>
              <input name="nombre" className="mt-1 w-full rounded-2xl border bg-transparent px-3 py-2 outline-none focus:ring-2" style={{ borderColor: colors.border }} placeholder="Tu nombre" required />
            </div>
            <div>
              <label className="text-sm">Apellido</label>
              <input name="apellido" className="mt-1 w-full rounded-2xl border bg-transparent px-3 py-2 outline-none focus:ring-2" style={{ borderColor: colors.border }} placeholder="Tu apellido" required />
            </div>
            <div className="sm:col-span-2">
              <label className="text-sm">Email</label>
              <input type="email" name="email" className="mt-1 w-full rounded-2xl border bg-transparent px-3 py-2 outline-none focus:ring-2" style={{ borderColor: colors.border }} placeholder="tu@email.com" required />
            </div>
            <input type="text" name="empresa" className="hidden" tabIndex={-1} autoComplete="off" />
            <div className="sm:col-span-2">
              <label className="text-sm">Mensaje</label>
              <textarea name="mensaje" className="mt-1 w-full rounded-2xl border bg-transparent px-3 py-2 outline-none focus:ring-2" style={{ borderColor: colors.border }} rows={4} placeholder="Contanos en qué te podemos ayudar" />
            </div>
          </div>
          <button
            disabled={status !== 'idle'}
            className="mt-4 inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-white shadow transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
            style={{ backgroundColor: status==='error' ? '#ef4444' : status==='success' ? '#16a34a' : ACCENT }}
          >
            <BtnIcon className={`h-5 w-5 ${status==='loading' ? 'animate-spin' : ''}`} />
            {status === 'idle' && 'Enviar consulta'}
            {status === 'loading' && 'Enviando…'}
            {status === 'success' && '¡Enviado!'}
            {status === 'error' && 'Hubo un error'}
          </button>
        </form>
      </div>
    </section>
  );
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
