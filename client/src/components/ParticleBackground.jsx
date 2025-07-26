import Particles from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";

export default function ParticleBackground() {
  const particlesInit = async (engine) => {
    await loadSlim(engine);
  };

  return (
    <Particles
      id="tsparticles"
      init={particlesInit}
      options={{
        fullScreen: { enable: false },
        detectRetina: true,
        background: { color: "#111111" },
        fpsLimit: 60,
        particles: {
          number: { value: 60 },
          color: { value: "#A0FF7F" },
          shape: { type: "circle" },
          opacity: { value: 0.3 },
          size: { value: { min: 1, max: 3 } },
          move: { enable: true, speed: 0.3, random: true },
          links: { enable: true, color: "#A0FF7F", distance: 100, opacity: 0.2 },
        },
        interactivity: {
          events: {
            onHover: { enable: true, mode: "connect" },
            onClick: { enable: false },
          },
        },
      }}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        zIndex: 0,
      }}
    />
  );
}