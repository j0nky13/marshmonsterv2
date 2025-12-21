// src/components/common/IntroSplash.jsx
import { useEffect, useRef } from "react";

export default function IntroSplash({ onFinish }) {
  const logoRef = useRef(null);
  const bgRef = useRef(null);

  useEffect(() => {
    let raf;

    const run = () => {
      const logo = logoRef.current;
      const bg = bgRef.current;
      const anchor = document.getElementById("navbar-logo-anchor");

      if (!logo || !anchor || !bg) {
        raf = requestAnimationFrame(run);
        return;
      }

      const from = logo.getBoundingClientRect();
      const to = anchor.getBoundingClientRect();

      // 👉 center-to-center math (THIS is the key fix)
      const fromCenterX = from.left + from.width / 2;
      const fromCenterY = from.top + from.height / 2;

      const toCenterX = to.left + to.width / 2;
      const toCenterY = to.top + to.height / 2;

      const dx = toCenterX - fromCenterX;
      const dy = toCenterY - fromCenterY;
      const scale = to.height / from.height;

      // Hold center briefly for drama
      setTimeout(() => {
        // Fade background away
        bg.style.opacity = "0";

        // Fly logo EXACTLY into anchor
        logo.style.transform = `
          translate(${dx}px, ${dy}px)
          scale(${scale})
        `;
      }, 900);

      // End splash
      setTimeout(() => {
        onFinish?.();
      }, 3400);
    };

    raf = requestAnimationFrame(run);
    return () => cancelAnimationFrame(raf);
  }, [onFinish]);

  return (
    <div
      ref={bgRef}
      className="
        fixed inset-0 z-[100]
        flex items-center justify-center
        bg-black
        transition-opacity
        duration-[900ms]
        ease-out
      "
    >
      <img
        ref={logoRef}
        src="/MM-Header2.svg"
        alt="Marsh Monster"
        className="
          h-40 w-auto
          select-none
          will-change-transform
          transition-transform
          duration-[1300ms]
          ease-[cubic-bezier(.16,1,.3,1)]
        "
        draggable={false}
      />
    </div>
  );
}