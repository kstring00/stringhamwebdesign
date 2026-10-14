import Cover from "./Cover";
import { longDate, type Post } from "./lib";
import { postExtras } from "./posts";
import s from "./blog.module.css";

/**
 * A post as a card: its cover, then the category, date and reading time,
 * the title, the description and a "Read" line. "feature" lays the cover
 * beside the words (the newest post on /blog); "compact" drops the
 * description (related posts under a post).
 */
export default function PostCard({ post, variant = "card", headingLevel = 2 }: { post: Post; variant?: "feature" | "card" | "compact"; headingLevel?: 2 | 3 }) {
  const extras = postExtras(post.slug);
  const H = headingLevel === 2 ? "h2" : "h3";
  return (
    <a className={s.card} href={`/blog/${post.slug}`} data-variant={variant}>
      <Cover motif={extras.cover} seq={extras.seq} />
      <span className={s.body}>
        <span className={s.meta}>
          {variant === "feature" ? <span className={s.latest}>Latest</span> : null}
          {variant !== "compact" ? <span className={s.category}>{post.category}</span> : null}
          <time dateTime={post.date}>{longDate(post.date)}</time>
          <span aria-hidden="true">·</span>
          <span>{post.readMinutes} min read</span>
        </span>
        <H className={s.cardTitle}>{post.title}</H>
        {variant !== "compact" ? <span className={s.cardDesc}>{post.description}</span> : null}
        <span className={s.readMore}>Read the post<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 8h10M9 4l4 4-4 4" /></svg></span>
      </span>
    </a>
  );
}
