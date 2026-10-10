import type { Metadata } from "next";

import { pageMeta } from "../data/meta";
import home from "../home/home.module.css";
import styles from "./blog.module.css";
import { getPosts, longDate } from "./lib";

export const metadata: Metadata = pageMeta({
  absolute: "Blog: Plain Answers About Websites, League City, TX | Stringham Web Design",
  description: "Plain-English help for business owners in League City and Greater Houston: what to do when a web designer disappears, how to keep your domain and Google listing in your name, and more.",
  path: "/blog",
});

/** The blog index: every post, newest first. */
export default function BlogIndex() {
  const posts = getPosts();
  return (
    <>
      <section className={styles.hero} aria-labelledby="blog-title">
        <div className="container">
          <p className={home.chip}>Blog</p>
          <h1 id="blog-title" className={styles.h1}>Plain answers for business owners.</h1>
          <p className={home.lede}>What to do, in order, when something goes wrong with your website or your Google listing. Written for owners, not developers.</p>
        </div>
      </section>
      <section className={`${home.section} ${home.alt}`} aria-label="Posts">
        <div className="container">
          <ul className={styles.list}>
            {posts.map((p) => (
              <li key={p.slug}>
                <a className={styles.card} href={`/blog/${p.slug}`} data-reveal>
                  <p className={styles.meta}><span className={styles.category}>{p.category}</span> <time dateTime={p.date}>{longDate(p.date)}</time> · {p.readMinutes} min read</p>
                  <h2 className={styles.cardTitle}>{p.title}</h2>
                  <p className={styles.cardDesc}>{p.description}</p>
                  <span className={styles.readMore}>Read the post<span aria-hidden="true"> →</span></span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
