import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ArticleJsonLd } from "../../components/JsonLd";
import { pageMeta } from "../../data/meta";
import { site } from "../../data/site";
import home from "../../home/home.module.css";
import FourKeys from "../FourKeys";
import { getPost, getPosts, longDate } from "../lib";
import PostExtras from "../PostExtras";
import styles from "./post.module.css";

export function generateStaticParams() {
  return getPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};
  return {
    ...pageMeta({ absolute: `${post.title} | ${site.name}`, description: post.description, path: `/blog/${post.slug}`, image: `/blog/${post.slug}/opengraph-image`, imageAlt: post.title }),
    openGraph: { type: "article", siteName: site.name, locale: "en_US", url: `/blog/${post.slug}`, title: post.title, description: post.description, publishedTime: post.date, authors: [post.author], images: [{ url: `/blog/${post.slug}/opengraph-image`, width: 1200, height: 630, alt: post.title }] },
  };
}

/**
 * One post: the title block, the reading column (markdown from
 * content/blog), the four-keys diagram after section 2, the email template
 * as an email card with a copy button, the step headings fading in, a
 * reading-progress line at the top, and the closing call to action as a
 * card. On phones a "Need help? Text me" pill stands in for the site's
 * bottom bar.
 */
export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();
  const [before, after] = post.html.split("<!--keys-->");

  return (
    <article className={styles.post} aria-labelledby="post-title">
      <PostExtras />
      <header className={styles.head}>
        <div className="container">
          <p className={styles.crumbs}><a className="u" href="/blog">Blog</a> <span aria-hidden="true">/</span> <span>{post.category}</span></p>
          <h1 id="post-title" className={styles.h1}>{post.title}</h1>
          <p className={styles.lede}>{post.description}</p>
          <p className={styles.meta}>
            <picture>
              <source type="image/webp" srcSet="/kyle-founder.webp" />
              <img className={styles.avatar} src="/kyle-founder.jpg" alt="" width={40} height={40} decoding="async" />
            </picture>
            <span><b>{post.author}</b> · <time dateTime={post.date}>{longDate(post.date)}</time> · {post.readMinutes} min read</span>
          </p>
        </div>
      </header>

      <div className={`container ${styles.layout}`}>
        {post.steps.length ? (
          <nav className={styles.toc} aria-label="In this post">
            <p className={styles.tocTitle}>The steps</p>
            <ol>
              {post.steps.map((s, i) => <li key={s.id}><a href={`#${s.id}`}><span aria-hidden="true">{i + 1}</span>{s.label}</a></li>)}
            </ol>
          </nav>
        ) : null}
        <div className={styles.column}>
          <div className={styles.prose} dangerouslySetInnerHTML={{ __html: before }} />
          {after !== undefined ? (
            <>
              <FourKeys />
              <div className={styles.prose} dangerouslySetInnerHTML={{ __html: after }} />
            </>
          ) : null}

          <aside className={styles.cta} id="help" aria-labelledby="cta-title">
            <p className={home.chipOnInk}>Free look at your situation</p>
            <h2 id="cta-title" className={styles.ctaTitle}>Want someone to handle it for you?</h2>
            <div className={styles.ctaBody} dangerouslySetInnerHTML={{ __html: post.ctaHtml }} />
            <div className={styles.ctaActions}>
              <a className="btn" href={site.smsHref} data-track="blog-text" data-magnetic>Text me at {site.phone}</a>
              <a className={`btn btn-secondary ${styles.ctaSecondary}`} href="/#quote" data-track="blog-quote">Tell me what&rsquo;s going on</a>
            </div>
            <p className={styles.signature}>{post.author}, {site.name} · {site.city}, {site.regionLong}</p>
          </aside>
        </div>
      </div>

      <ArticleJsonLd title={post.title} description={post.description} slug={post.slug} date={post.date} author={post.author} />
    </article>
  );
}
