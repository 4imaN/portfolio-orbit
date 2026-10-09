"use client";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { motion, useReducedMotion, MotionConfig } from "motion/react";
import dynamic from "next/dynamic";
import { projects, type Project } from "@/lib/projects";
const Orbit = dynamic(() => import("./Orbit"), {
  ssr: false,
  loading: () => (
    <div className="scene-loading mono">
      ASSEMBLING THE UNIVERSE <span>· · ·</span>
    </div>
  ),
});
const ease = [0.22, 1, 0.36, 1] as const;
export default function Portfolio() {
  const reduce = useReducedMotion();
  const [selected, setSelected] = useState<Project | null>(null);
  const [focus, setFocus] = useState<string | null>(null);
  const [copy, setCopy] = useState("");
  const [time, setTime] = useState("ADDIS ABABA · UTC+3");
  const [paused, setPaused] = useState(false);
  const [reset, setReset] = useState(0);
  const [hover, setHover] = useState<string | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const trigger = useRef<HTMLElement | null>(null);
  const select = useCallback((project: Project, fromOrbit = false) => {
    if (timer.current) clearTimeout(timer.current);
    trigger.current = document.activeElement as HTMLElement;
    setFocus(fromOrbit ? project.id : null);
    if (fromOrbit && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
      timer.current = setTimeout(() => setSelected(project), 750);
    } else setSelected(project);
  }, []);
  const selectOrbit = useCallback(
    (project: Project) => select(project, true),
    [select],
  );
  const close = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    setSelected(null);
    setFocus(null);
  }, []);
  useEffect(() => {
    if (reduce !== null) setPaused(Boolean(reduce));
  }, [reduce]);
  useEffect(() => {
    const update = () =>
      setTime(
        `ADDIS ABABA · ${new Intl.DateTimeFormat("en-GB", { timeZone: "Africa/Addis_Ababa", hour: "2-digit", minute: "2-digit" }).format(new Date())}`,
      );
    update();
    const id = setInterval(update, 60000);
    return () => clearInterval(id);
  }, []);
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );
  useEffect(() => {
    const el = dialog.current;
    if (!el) return;
    if (selected) {
      if (!el.open) el.showModal();
      document.body.style.overflow = "hidden";
    } else {
      el.close();
      document.body.style.overflow = "";
      trigger.current?.focus({ preventScroll: true });
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [selected]);
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [close]);
  // CSS handles visible-by-default section reveals; Motion stages the hero.
  return (
    <MotionConfig reducedMotion="user">
      <a className="skip" href="#work">
        Skip to projects
      </a>
      <header className="header">
        <a className="brand" href="#home" aria-label="Aiman Mengesha home">
          <span className="brand-mark">
            a<span>m</span>
            <i>✳</i>
          </span>
          <span className="brand-caption">
            INDEPENDENT DEVELOPER
            <br />
            ADDIS ABABA, ETHIOPIA
          </span>
        </a>
        <nav aria-label="Main navigation">
          <a href="#work">
            Work <sup>04</sup>
          </a>
          <a href="#about">About</a>
          <a href="#contact" className="nav-contact">
            Let’s talk <span>↗</span>
          </a>
        </nav>
      </header>
      <main>
        <section
          className={`hero ${focus ? "is-exploring" : ""}`}
          id="home"
          aria-labelledby="hero-title"
        >
          <div className="hero-atmosphere" aria-hidden="true" />
          <motion.div
            className="hero-copy"
            initial={false}
            animate={{ opacity: focus ? 0.16 : 1, y: 0 }}
            transition={{ duration: 1, delay: 0.15, ease }}
          >
            <div className="eyebrow">
              <span className="signal" /> A UNIVERSE OF IDEAS
            </div>
            <h1 id="hero-title">
              Aiman
              <br />
              <em>Mengesha.</em>
            </h1>
            <p className="intro">
              Small experiments.
              <br />
              <span>Worlds of possibility.</span>
            </p>
            <p className="hero-description">
              I build software that connects the dots.
              <br />
              Every planet is a project. Pick one to explore.
            </p>
            <a className="primary-link" href="#work">
              Find your orbit <span>↘</span>
            </a>
            <div className="hero-coordinate mono">
              09°01′ N &nbsp; 38°45′ E{" "}
              <span>FOUR WORLDS. ONE CURIOUS MIND.</span>
            </div>
          </motion.div>
          <div className="universe" id="universe">
            <div className="orbit-fallback" aria-hidden="true">
              <div />
              <div />
              <div />
              <span>✳</span>
            </div>
            <Orbit
              onSelect={selectOrbit}
              focusedId={focus}
              hoveredId={hover}
              paused={paused}
              reduced={Boolean(reduce)}
              resetKey={reset}
            />
            <div className="scene-top mono">
              <span>THE PROJECT SYSTEM</span>
              <span>EST. 2026 / VOL. 02</span>
            </div>
            <div className="scene-bottom">
              <span className="mono scene-hint">
                {focus
                  ? "APPROACHING YOUR NEXT DISCOVERY"
                  : "DRAG TO ORBIT · CLICK A WORLD"}
              </span>
              <button
                id="motion-toggle"
                className="control"
                aria-pressed={paused}
                aria-label={
                  paused ? "Play orbit animation" : "Pause orbit animation"
                }
                onClick={() => setPaused((p) => !p)}
              >
                {paused ? "▷" : "Ⅱ"}
              </button>
              <button
                className="control"
                aria-label="Reset orbit view"
                onClick={() => {
                  close();
                  setReset((r) => r + 1);
                }}
              >
                ↺
              </button>
            </div>
          </div>
          <div
            className="planet-index"
            aria-label="Explore the project planets"
          >
            {projects.map((p) => (
              <button
                key={p.id}
                aria-label={`Travel to ${p.name}`}
                aria-pressed={focus === p.id}
                onClick={() => select(p, true)}
                onMouseEnter={() => setHover(p.id)}
                onMouseLeave={() => setHover(null)}
                onFocus={() => setHover(p.id)}
                onBlur={() => setHover(null)}
                style={{ "--project-color": p.color } as CSSProperties}
              >
                <span className="index-dot" />
                <span className="mono">{p.id}</span>
                {p.name}
                <span className="index-arrow">↗</span>
              </button>
            ))}
          </div>
          <div className="hero-foot mono">
            <span>
              <i className="tiny-cross">+</i> CODE WITH INTENT. BUILD WITH
              CURIOSITY.
            </span>
            <a href="#work">
              SCROLL TO DISCOVER <span>↓</span>
            </a>
          </div>
        </section>
        <section
          className="work section"
          id="work"
          aria-labelledby="work-title"
        >
          <Reveal>
            <div className="section-top">
              <div>
                <span className="eyebrow">01 / SELECTED WORK</span>
                <h2 id="work-title">
                  Ideas in <em>orbit.</em>
                </h2>
              </div>
              <p>
                Different worlds. The same curiosity.
                <br />
                Explore the systems behind the satellites.
              </p>
            </div>
          </Reveal>
          <div className="project-list">
            {projects.map((p) => (
              <Reveal key={p.id}>
                <button
                  className="project-row"
                  aria-label={`Explore ${p.name}`}
                  onClick={() => select(p)}
                  style={{ "--project-color": p.color } as CSSProperties}
                >
                  <span className="project-number">{p.id}</span>
                  <span
                    className={`project-art planet-art-${p.id}`}
                    aria-hidden="true"
                  />
                  <span>
                    <span className="project-name">{p.name}</span>
                    <span className="category">{p.category}</span>
                  </span>
                  <span className="project-short">{p.short}</span>
                  <span className="project-arrow">↗</span>
                </button>
              </Reveal>
            ))}
          </div>
          <a
            className="all-work mono"
            href="https://github.com/4imaN"
            target="_blank"
            rel="noopener noreferrer"
          >
            MORE EXPERIMENTS ON GITHUB <span>↗</span>
          </a>
        </section>
        <section
          className="about section"
          id="about"
          aria-labelledby="about-title"
        >
          <div className="about-mark" aria-hidden="true">
            <span>✳</span>
            <p className="mono">
              ALWAYS IN MOTION.
              <br />
              ALWAYS LEARNING.
            </p>
          </div>
          <Reveal>
            <div className="about-copy">
              <span className="eyebrow">
                02 / THE PERSON BEHIND THE PLANETS
              </span>
              <h2 id="about-title">
                A builder at heart.
                <br />
                <em>Curious by default.</em>
              </h2>
              <p>
                I’m Aiman, a full-stack developer based in Addis Ababa. I like
                connecting the whole system — the data underneath, the logic in
                between, and the interface you actually touch.
              </p>
              <p>
                My projects move between developer tools, operational software,
                and sports analytics. Different worlds, connected by the same
                question: <span>what could I make work better?</span>
              </p>
              <div className="skills mono">
                {[
                  "TYPESCRIPT",
                  "REACT",
                  "PYTHON",
                  "NODE.JS",
                  "SQL",
                  "FLUTTER",
                ].map((s) => (
                  <span key={s}>{s}</span>
                ))}
              </div>
            </div>
          </Reveal>
        </section>
        <section
          className="contact section"
          id="contact"
          aria-labelledby="contact-title"
        >
          <Reveal>
            <span className="eyebrow">03 / OPEN A CHANNEL</span>
            <div className="contact-main">
              <h2 id="contact-title">
                Got something
                <br />
                <em>in mind?</em>
              </h2>
              <a
                className="contact-arrow"
                href="mailto:like93860@gmail.com"
                aria-label="Email Aiman"
              >
                ↗
              </a>
            </div>
          </Reveal>
          <div className="contact-bottom">
            <a href="mailto:like93860@gmail.com">like93860@gmail.com</a>
            <button
              className="mono"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText("like93860@gmail.com");
                  setCopy("COPIED TO CLIPBOARD");
                } catch {
                  setCopy("Select the email address to copy it.");
                }
              }}
            >
              COPY EMAIL <span>⧉</span>
            </button>
            <span className="mono" role="status">
              {copy}
            </span>
          </div>
        </section>
      </main>
      <footer className="footer mono">
        <a href="#home">
          AIMAN MENGESHA <span>© 2026</span>
        </a>
        <span>{time}</span>
        <a
          href="https://github.com/4imaN"
          target="_blank"
          rel="noopener noreferrer"
        >
          GITHUB ↗
        </a>
        <a href="#home">BACK TO TOP ↑</a>
      </footer>
      <dialog
        ref={dialog}
        id="project-dialog"
        aria-labelledby="dialog-title"
        onCancel={(e) => {
          e.preventDefault();
          close();
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            const r = e.currentTarget.getBoundingClientRect();
            if (
              e.clientX < r.left ||
              e.clientX > r.right ||
              e.clientY < r.top ||
              e.clientY > r.bottom
            )
              close();
          }
        }}
      >
        <button
          className="dialog-close"
          aria-label="Close project details"
          onClick={close}
        >
          ✕
        </button>
        {selected && (
          <motion.div
            key={selected.id}
            initial={false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease }}
          >
            <div
              className={`dialog-planet planet-art-${selected.id}`}
              style={{ "--project-color": selected.color } as CSSProperties}
              aria-hidden="true"
            />
            <span className="eyebrow">
              WORLD {selected.id} / {selected.category}
            </span>
            <h2 id="dialog-title">{selected.name}</h2>
            <p className="dialog-body">{selected.description}</p>
            <div className="dialog-facts">
              <div>
                <span className="mono">PLATFORM</span>
                <p>{selected.platform}</p>
              </div>
              <div>
                <span className="mono">PROJECT STATUS</span>
                <p>{selected.status}</p>
              </div>
            </div>
            <div className="skills mono">
              {selected.stack.map((s) => (
                <span key={s}>{s}</span>
              ))}
            </div>
            <a
              className="primary-link"
              href={`https://github.com/4imaN/${selected.repo}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Explore the repository <span>↗</span>
            </a>
            <div className="dialog-navigation">
              <button
                onClick={() => {
                  const p =
                    projects[
                      (projects.findIndex((p) => p.id === selected.id) +
                        projects.length -
                        1) %
                        projects.length
                    ];
                  setSelected(p);
                  if (focus) setFocus(p.id);
                }}
              >
                ← Previous world
              </button>
              <button
                onClick={() => {
                  const p =
                    projects[
                      (projects.findIndex((p) => p.id === selected.id) + 1) %
                        projects.length
                    ];
                  setSelected(p);
                  if (focus) setFocus(p.id);
                }}
              >
                Next world →
              </button>
            </div>
          </motion.div>
        )}
      </dialog>
    </MotionConfig>
  );
}
function Reveal({ children }: { children: React.ReactNode }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={false}
      whileInView={reduce ? {} : { y: [24, 0], opacity: [0.5, 1] }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.8, ease }}
    >
      {children}
    </motion.div>
  );
}
