"use client";

import Magnetic from "./Magnetic";
import Reveal from "./Reveal";

/** The page's optional motion, in one piece, so it can be fetched after everything else (Motion.tsx). */
export default function Effects() {
  return (
    <>
      <Reveal />
      <Magnetic />
    </>
  );
}
