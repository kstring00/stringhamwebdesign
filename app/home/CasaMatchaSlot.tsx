import { casaMatcha } from "../data/casaMatcha";
import { SHOW_CASA_MATCHA } from "../data/flags";
import styles from "./home.module.css";

// The marker Kyle's unwritten Casa Matcha fields start with.
const MARK = "TO" + "DO";

/** A field Kyle hasn't written yet (it still starts with the marker) renders as a dashed box. */
function Unwritten({ text, as: Tag = "p", className }: { text: string; as?: "p" | "h2"; className?: string }) {
  return text.startsWith(MARK) ? <Tag className={`${styles.unwritten} ${className ?? ""}`}>{text}</Tag> : <Tag className={className}>{text}</Tag>;
}

/**
 * The optional second project. With SHOW_CASA_MATCHA off (the default) this
 * renders nothing. With it on, the Casa Matcha case study, whose copy shows
 * as a dashed box until Kyle writes it.
 */
export default function CasaMatchaSlot() {
  if (!SHOW_CASA_MATCHA) return null;
  return (
    <section className={styles.second} id="casa-matcha" aria-labelledby="second-title">
      <div className="container">
        <p className="label"><b>05</b> {casaMatcha.label}</p>
        <Unwritten as="h2" text={casaMatcha.title} className="display-l" />
        <Unwritten text={casaMatcha.problem} />
        <Unwritten text={casaMatcha.built} />
        <Unwritten text={casaMatcha.outcome} />
        {casaMatcha.screens.length === 0 ? <p className={styles.unwritten}>{MARK}: add real Casa Matcha screens (see app/data/casaMatcha.ts).</p> : null}
      </div>
    </section>
  );
}
