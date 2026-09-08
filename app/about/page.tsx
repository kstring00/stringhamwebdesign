import type { Metadata } from "next";

import Header from "../Header";
import SiteFooter from "../SiteFooter";
import styles from "./about.module.css";

export const metadata: Metadata = {
  title: "About Kyle Stringham — Web Design & Development",
  description:
    "About Kyle Stringham, a web designer and developer in League City, Texas, building thoughtful custom websites for small businesses.",
};

export default function AboutPage() {
  return (
    <>
      <Header />
      <main className={styles.page}>
        <section className={styles.hero} aria-labelledby="about-title">
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>About</p>
            <h1 id="about-title">I build the thing I wish more small businesses had.</h1>
            <p className={styles.meta}>
              Kyle Stringham — Web Design &amp; Development · League City, Texas
            </p>
          </div>

          <figure className={styles.portrait}>
            <img
              src="https://raw.githubusercontent.com/kstring00/stringhamwebdesign/62150537aa73260bb47bb7799f12d3ea3485f811/IMG_0157.jpg"
              alt="Portrait of Kyle Stringham"
              width="640"
              height="800"
              fetchPriority="high"
            />
          </figure>
        </section>

        <article className={styles.story}>
          <div className={styles.prose}>
            <p>
              I work in ABA. I spend my days around behavior analysts, therapists, and the
              families they serve — which is how this started.
            </p>

            <p>
              Parents of autistic kids were suffering quietly. Scattered resources, no clear
              next step, a lot of energy spent searching instead of being present with their
              own children. I pitched a site that would close that gap, and I built it.
              That&apos;s Common Ground.
            </p>

            <p className={styles.pivot}>Nine months ago I didn&apos;t know how to do any of this.</p>

            <p>
              I taught myself. Budgeting apps, personal systems, a journaling app built
              around faith called <a href="/work/with-little">With Little</a>. I learned by
              building things that were broken and then fixing them, which is still mostly
              how I work.
            </p>
          </div>

          <section className={styles.section} aria-labelledby="why-title">
            <h2 id="why-title">Why I do this</h2>
            <div className={styles.prose}>
              <p>
                I&apos;m an introvert. This work suits me — long stretches of solving something
                carefully, then handing someone a thing that makes their life easier. AI is a
                large part of how I build, and I&apos;m grateful for it. It&apos;s a tool that lets one
                person serve more people than one person used to be able to.
              </p>

              <p>
                The businesses I build for are ones where the owner is the brand — coaches,
                clinicians, family businesses. My dad owns a storage facility. My friend
                coaches. I work in ABA. These aren&apos;t abstract markets to me.
              </p>
            </div>
          </section>

          <section className={styles.section} aria-labelledby="how-title">
            <h2 id="how-title">How I work</h2>
            <div className={styles.prose}>
              <p className={styles.pillar}>
                <strong>Equal exchange. That&apos;s the pillar.</strong>
              </p>

              <p>
                You know what you&apos;re paying and what you&apos;re getting before I start. You see
                the hours as they&apos;re logged. The price doesn&apos;t move unless the scope does, and
                the scope doesn&apos;t move without both of us agreeing. When it&apos;s finished, it&apos;s
                yours — the code, the repo, the domain. No hostage situations.
              </p>

              <p>
                I work hard to make things right. Not &quot;good enough for the price,&quot; but right.
              </p>
            </div>
          </section>

          <footer className={styles.closing}>
            <p>
              God&apos;s the reason I do this. The care I try to put into the work comes from
              there.
            </p>
            <a href="/quote">Start a project <span aria-hidden="true">→</span></a>
          </footer>
        </article>
      </main>
      <SiteFooter />
    </>
  );
}
