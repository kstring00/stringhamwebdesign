import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ArticleJsonLd } from "../../components/JsonLd";
import { pageMeta } from "../../data/meta";
import { site } from "../../data/site";
import { showcaseWork } from "../../data/work";
import home from "../../home/home.module.css";
import Cover from "../Cover";
import FourKeys from "../FourKeys";
import { getPost, getPosts, longDate } from "../lib";
import PostCard from "../PostCard";
import PostExtras from "../PostExtras";
import { postExtras } from "../posts";
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
 * One post, on a grid: the title block beside the post's cover; then the
 * list of sections (sticky, left), the reading column (markdown from
 * content/blog, about 68 characters, 18px, 1.7) and, on wide screens, a
 * small "Questions? Text me" card (sticky, right). The column holds the
 * four-keys diagram (that post), the email template, callouts, charts and
 * tables (lib.ts), then the closing call to action as a card (with a demo
 * when the post has one) and two related posts. A reading-progress line
 * runs along the top; on phones a "Need help? Text me" pill stands in for
 * the site's bottom bar.
 */
export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();
  const extras = postExtras(post.slug);
  const [before, after] = post.html.split("<!--keys-->");
  const demo = extras.demo ? showcaseWork.find((w) => w.key === extras.demo) : undefined;

  // Related posts: the ones this post names first, then the newest others; two in all.
  const others = getPosts().filter((p) => p.slug !== post.slug);
  const named = (extras.related ?? []).map((r) => others.find((p) => p.slug === r)).filter((p) => p !== undefined);
  const related = [...named, ...others.filter((p) => !named.includes(p))].slice(0, 2);

  return (
    <article className={styles.post} aria-labelledby="post-title">
      <PostExtras slug={post.slug} />
      <header className={styles.head}>
        <div className={`container ${styles.headGrid}`}>
          <div className={styles.headText}>
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
          <div className={styles.headCover}>
            <Cover motif={extras.cover} seq={extras.seq} size="hero" />
          </div>
        </div>
      </header>

      <div className={`container ${styles.layout}`}>
        {post.steps.length ? (
          <nav className={styles.toc} aria-label="In this post">
            <p className={styles.tocTitle}>{extras.tocTitle}</p>
            <ol>
              {post.steps.map((s, i) => <li key={s.id}><a href={`#${s.id}`}><span aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>{s.label}</a></li>)}
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
            <p className={home.chipOnInk}>{extras.chip}</p>
            <h2 id="cta-title" className={styles.ctaTitle}>{post.ctaTitle}</h2>
            {demo && demo.href ? (
              <a className={styles.demo} href={demo.href} target="_blank" rel="noopener noreferrer" data-track="demo" data-project={demo.name}>
                <picture>
                  <source type="image/avif" srcSet={`/showcase/${demo.key}-desktop.avif`} />
                  <img src={`/showcase/${demo.key}-desktop.webp`} alt={demo.alt} width={1440} height={900} loading="lazy" decoding="async" />
                </picture>
                <span className={styles.demoText}>
                  <span className={styles.demoKind}>Design demo · not launched</span>
                  <b>{demo.name}</b>
                  <span className={styles.demoLink}>{demo.linkLabel}<span aria-hidden="true"> ↗</span><span className="sr-only"> (opens in a new tab)</span></span>
                </span>
              </a>
            ) : null}
            <div className={styles.ctaBody} dangerouslySetInnerHTML={{ __html: post.ctaHtml }} />
            <div className={styles.ctaActions}>
              <a className="btn" href={site.smsHref} data-track="blog-text" data-slug={post.slug} data-magnetic>Text me at {site.phone}</a>
              <a className={`btn btn-secondary ${styles.ctaSecondary}`} href="/#quote" data-track="blog-quote" data-slug={post.slug}>{post.ctaQuoteLabel}</a>
            </div>
            <p className={styles.signature}>{post.author}, {site.name} · {site.city}, {site.regionLong}</p>
          </aside>

          {related.length ? (
            <nav className={styles.related} aria-labelledby="related-title">
              <h2 id="related-title" className={styles.relatedTitle}>Related posts</h2>
              <ul>
                {related.map((r) => <li key={r.slug}><PostCard post={r} variant="compact" headingLevel={3} /></li>)}
              </ul>
            </nav>
          ) : null}
        </div>

        <aside className={styles.rail} aria-label="Ask me">
          <div className={styles.railCard}>
            <picture>
              <source type="image/webp" srcSet="/kyle-founder.webp" />
              <img className={styles.railAvatar} src="/kyle-founder.jpg" alt="" width={56} height={56} loading="lazy" decoding="async" />
            </picture>
            <p className={styles.railTitle}>Questions about your site?</p>
            <p className={styles.railText}>I&rsquo;m {site.person.split(" ")[0]}. Text me and I reply within 24 hours.</p>
            <a className={`btn ${styles.railBtn}`} href={site.smsHref} data-track="blog-text" data-slug={post.slug}>Text me</a>
            <a className={`u ${styles.railLink}`} href="/#quote" data-track="blog-quote" data-slug={post.slug}>Or request a quote</a>
          </div>
        </aside>
      </div>

      <ArticleJsonLd title={post.title} description={post.description} slug={post.slug} date={post.date} author={post.author} />
    </article>
  );
}
