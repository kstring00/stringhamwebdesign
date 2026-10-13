import type { Metadata } from "next";

import { pageMeta } from "../data/meta";
import { site } from "../data/site";
import home from "../home/home.module.css";
import styles from "./blog.module.css";
import { getPosts, longDate } from "./lib";
import PostCard from "./PostCard";

export const metadata: Metadata = pageMeta({
  absolute: "Blog: Plain Answers About Websites, League City, TX | Stringham Web Design",
  description: "Plain-English help for business owners in League City and Greater Houston: what a website should do for you, what I need to build one, how to keep your domain and Google listing in your name, and more.",
  path: "/blog",
});

/**
 * The blog index: a title block, then the posts as a grid, newest first:
 * the latest across the top with its cover beside it, the rest two to a
 * row (one on phones), each with its cover drawing. A short line at the
 * end points to a text or a quote.
 */
export default function BlogIndex() {
  const posts = getPosts();
  const [latest, ...rest] = posts;
  return (
    <>
      <section className={styles.hero} aria-labelledby="blog-title">
        <div className={`container ${styles.heroGrid}`}>
          <div className={styles.heroText}>
            <p className={home.chip}>Blog</p>
            <h1 id="blog-title" className={styles.h1}>Plain answers for business owners.</h1>
          </div>
          <div className={styles.heroAside}>
            <p className={styles.heroLede}>What a website should do for you, what to have ready, and how to keep it all in your name. Written for owners, not developers.</p>
            <p className={styles.count}>
              <span><b>{posts.length}</b> posts</span>
              {latest ? <span>Updated <time dateTime={latest.date}>{longDate(latest.date)}</time></span> : null}
            </p>
          </div>
        </div>
      </section>

      <section className={styles.posts} aria-label="Posts">
        <div className="container">
          {latest ? <div className={styles.featureRow}><PostCard post={latest} variant="feature" /></div> : null}
          {rest.length ? (
            <ul className={styles.grid}>
              {rest.map((p) => <li key={p.slug}><PostCard post={p} /></li>)}
            </ul>
          ) : null}
          <p className={styles.end}>
            Have a question I haven&rsquo;t written about? <a className="u" href={site.smsHref} data-track="blog-text" data-slug="index">Text me at {site.phone}</a>
          </p>
        </div>
      </section>
    </>
  );
}
