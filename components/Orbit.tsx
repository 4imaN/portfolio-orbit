"use client";
import { useEffect, useRef, useState } from "react";
import { projects, type Project } from "@/lib/projects";
import type { OrbitEngine } from "@/lib/orbit-engine";
interface Props {
  onSelect: (project: Project) => void;
  focusedId: string | null;
  hoveredId: string | null;
  paused: boolean;
  reduced: boolean;
  resetKey: number;
}
export default function Orbit(props: Props) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const labels = useRef<HTMLDivElement>(null);
  const api = useRef<OrbitEngine | null>(null);
  const latest = useRef(props);
  latest.current = props;
  const [state, setState] = useState<"loading" | "ready" | "fallback">(
    "loading",
  );
  useEffect(() => {
    let cancelled = false;
    import("@/lib/orbit-engine")
      .then(({ createOrbit }) => {
        if (cancelled || !canvas.current || !labels.current) return;
        api.current = createOrbit(
          canvas.current,
          labels.current,
          projects,
          (p) => latest.current.onSelect(p),
          () => setState("fallback"),
        );
        api.current.update(latest.current);
        setState("ready");
      })
      .catch(() => {
        if (!cancelled) setState("fallback");
      });
    return () => {
      cancelled = true;
      api.current?.dispose();
      api.current = null;
    };
  }, []);
  useEffect(() => api.current?.update(props), [props]);
  useEffect(() => {
    const host = canvas.current?.closest(".universe");
    host?.classList.toggle("webgl-ready", state === "ready");
    host?.classList.toggle("no-webgl", state === "fallback");
    return () => {
      host?.classList.remove("webgl-ready", "no-webgl");
    };
  }, [state]);
  return (
    <>
      <canvas
        ref={canvas}
        id="orbit-canvas"
        aria-label="Project solar system. Drag to rotate, or use the named project buttons to explore."
      />
      <div ref={labels} id="planet-labels" />
      {state !== "ready" && (
        <p className="scene-loading mono" role="status">
          {state === "loading"
            ? "ASSEMBLING THE UNIVERSE · · ·"
            : "3D UNAVAILABLE · EXPLORE THE PROJECTS BELOW"}
        </p>
      )}
    </>
  );
}
