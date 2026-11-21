import { faq } from "../data/offer";
import { locationLine, site } from "../data/site";
import s from "./home.module.css";

/**
 * Who you'd work with, beside the questions practices ask. Every fact in
 * the About column is something Kyle has stated himself: a web designer
 * with a psychology degree and behavioral-health work as an RBT, not a
 * licensed mental-health professional.
 */
export default function AboutFaq() {
  return (
    <section className={s.section} id="about" aria-labelledby="about-title">
      <div className={`container ${s.aboutGrid}`}>
        <div className={s.about}>
          <picture>
            <source type="image/webp" srcSet="/kyle-founder.webp" />
            <img className={s.portrait} src="/kyle-founder.jpg" alt="Kyle Stringham" width={96} height={96} loading="lazy" decoding="async" />
          </picture>
          <h2 id="about-title" className={s.h2} data-reveal>You work with me, start to finish.</h2>
          <p>I&rsquo;m Kyle Stringham, a web designer. My degree is in psychology, and I&rsquo;ve worked in behavioral health as a Registered Behavior Technician with autistic children and their families. I&rsquo;m not a licensed clinician and I don&rsquo;t provide care; I build websites for the people who do.</p>
          <p>That background shapes every page: what someone looking for help needs to understand, what makes reaching out feel safe, and what comes next.</p>
          <p>{locationLine} No agency layers, and nobody passing your project along. I use AI-assisted tools so you get custom work faster, and I review, test and stand behind every line that ships.</p>
          <p className={s.aboutLinks}>
            <a className="u" href={`mailto:${site.email}`} data-track="email">{site.email}</a>
            <a className="u" href={site.phoneHref}>Call or text {site.phone}</a>
          </p>
        </div>
        <div className={s.faq} id="faq" aria-labelledby="faq-title">
          <h2 id="faq-title" className={s.faqTitle}>Questions practices ask</h2>
          {faq.map((item) => (
            <details className={s.qaItem} key={item.q} name="faq">
              <summary>{item.q}<span className={s.qaIcon} aria-hidden="true" /></summary>
              <p>
                {item.a}
                {"link" in item && item.link ? <> <a className={`u ${s.qaLink}`} href={item.link.href}>{item.link.label}</a></> : null}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
