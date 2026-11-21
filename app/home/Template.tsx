import { template } from "../data/template";
import s from "./template.module.css";

/**
 * Directly under the hero: the case for a custom site, made fairly. Three
 * points in one panel (what a template does well, where it stops, what a
 * custom build adds) and the honest limit of the custom route as a
 * footnote. The copy is in app/data/template.ts and is a draft for the
 * owner's review.
 */
export default function Template() {
  return (
    <section className={s.section} id="why" aria-labelledby="why-title">
      <div className={s.panel} data-reveal-group>
        <div className={s.head}>
          <h2 id="why-title" className={s.title} data-reveal>{template.title}</h2>
          <p className={s.lede} data-reveal>{template.lede}</p>
        </div>
        <ol className={s.points}>
          {template.points.map((p, i) => (
            <li key={p.label} className={s.point} data-reveal>
              <p className={s.label}><span className={s.n} aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>{p.label}</p>
              <h3 className={s.pointTitle}>{p.title}{"mark" in p && p.mark ? <span className="ast" aria-hidden="true">*</span> : null}</h3>
              <p className={s.body}>{p.body}</p>
            </li>
          ))}
        </ol>
        <p className={s.footnote} data-reveal><span className="ast" aria-hidden="true">* </span>{template.footnote}</p>
      </div>
    </section>
  );
}
