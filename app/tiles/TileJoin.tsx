"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

import { gsap, prefersReducedMotion } from "../motion/gsap";

/**
 * Brings each tile scene's pieces together as it is scrolled to. A scene
 * is any element marked data-tile-scene; its pieces are marked data-tile
 * and say where they come from in data-from ("x,y,turn": percent of the
 * piece's own size, and degrees), with data-from-narrow for the stacked
 * layout on a phone.
 *
 * The pieces are joined in the HTML and the CSS. This only pulls them
 * apart at the start and ties their way back to the scroll position, so
 * with no JavaScript, or with reduced motion, the scene is simply whole.
 * Transforms and opacity only, and a loose piece never reaches past the
 * edge of the screen: its sideways travel is cut to the room it has, so
 * the page never scrolls sideways. When the pieces have met, anything marked
 * data-draw is drawn (the line around the block) and anything marked
 * data-after arrives (the block's label).
 *
 * One gsap.matchMedia per page: it rebuilds the scenes when the layout
 * crosses the breakpoint and reverts everything on the way out.
 */
/** A loose piece is a little smaller than its place. */
const SCALE = 0.9;

export default function TileJoin() {
  const pathname = usePathname();

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const scenes = Array.from(document.querySelectorAll<HTMLElement>("[data-tile-scene]"));
    if (!scenes.length) return;

    const mm = gsap.matchMedia();
    mm.add({ wide: "(min-width: 52.0625rem)", narrow: "(max-width: 52rem)" }, (context) => {
      const narrow = Boolean(context.conditions?.narrow);
      scenes.forEach((scene) => {
        const pieces = gsap.utils.toArray<HTMLElement>("[data-tile]", scene);
        const shadows = gsap.utils.toArray<SVGElement>("[data-tile-shadow]", scene);
        const lines = gsap.utils.toArray<SVGElement>("[data-draw]", scene);
        const after = gsap.utils.toArray<HTMLElement>("[data-after]", scene);

        const tl = gsap.timeline({
          defaults: { ease: "power3.out" },
          scrollTrigger: { trigger: scene, start: "top 94%", end: "center 56%", scrub: 0.8, invalidateOnRefresh: true },
        });
        pieces.forEach((piece, i) => {
          const [x, y, turn] = ((narrow && piece.dataset.fromNarrow) || piece.dataset.from || "0,0,0").split(",").map(Number);
          // How far sideways it may start: no further than the screen's edge, turned corners included.
          const startX = () => {
            const w = piece.offsetWidth, h = piece.offsetHeight;
            if (!x || !w) return 0;
            const left = scene.getBoundingClientRect().left + piece.offsetLeft;
            const room = x < 0 ? left : document.documentElement.clientWidth - (left + w);
            const a = (Math.abs(turn) * Math.PI) / 180;
            const grow = ((w * Math.cos(a) + h * Math.sin(a)) * SCALE - w) / 2;
            const px = Math.min((Math.abs(x) / 100) * w, Math.max(0, room - grow - 2));
            return (Math.sign(x) * px * 100) / w;
          };
          tl.from(piece, { xPercent: startX, yPercent: y, rotation: turn, scale: SCALE, duration: 1, ease: "back.out(1.25)" }, i * 0.07);
        });
        if (shadows.length) tl.fromTo(shadows, { opacity: 0.3 }, { opacity: 0, duration: 0.9, ease: "power2.in" }, 0.1);
        if (lines.length) tl.fromTo(lines, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.55, ease: "none" }, ">-0.2");
        if (after.length) tl.from(after, { autoAlpha: 0, scale: 0.8, transformOrigin: "50% 50%", duration: 0.5, ease: "back.out(1.7)" }, "<0.15");
      });
    });

    return () => mm.revert();
  }, [pathname]);

  return null;
}
