import Link from "next/link";
import styles from "./PricingConfigurator.module.css";

function ScopeDove() {
  return (
    <div className={styles.doveStage} aria-hidden="true">
      <svg
        className={styles.dove}
        viewBox="0 0 760 620"
        role="presentation"
        focusable="false"
      >
        <defs>
          <linearGradient id="scopeWingGold" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#c9a227" stopOpacity="0.12" />
            <stop offset="58%" stopColor="#c9a227" stopOpacity="0.72" />
            <stop offset="100%" stopColor="#c9a227" stopOpacity="0.18" />
          </linearGradient>
          <linearGradient id="scopeWingNavy" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#0d1b26" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#0d1b26" stopOpacity="0.92" />
          </linearGradient>
        </defs>

        <g className={styles.orbits}>
          <path className={styles.orbitA} d="M90 418C188 535 399 576 603 486C694 446 725 376 704 302" />
          <path className={styles.orbitB} d="M154 185C249 77 437 52 593 125C681 166 719 226 714 282" />
          <circle className={styles.signalDot} cx="704" cy="302" r="5" />
          <circle className={styles.signalDotSmall} cx="162" cy="454" r="2.5" />
          <circle className={styles.signalDotSmall} cx="178" cy="462" r="2.5" />
          <circle className={styles.signalDotSmall} cx="194" cy="467" r="2.5" />
        </g>

        <g className={styles.doveGroup}>
          <path
            className={`${styles.line} ${styles.bodyLine}`}
            d="M454 361C503 348 531 312 555 271C568 250 584 237 606 233C624 230 642 235 655 247C641 250 629 258 620 270C605 292 591 324 574 355C550 400 516 432 469 447C438 457 409 449 386 431C407 416 427 394 454 361Z"
          />
          <path
            className={`${styles.line} ${styles.headLine}`}
            d="M605 234C623 219 646 218 663 228C674 235 681 245 685 257C670 252 657 252 646 258"
          />
          <path className={`${styles.line} ${styles.beakLine}`} d="M684 257L719 269L686 276" />
          <circle className={styles.eye} cx="654" cy="241" r="3.2" />

          <g className={styles.upperWing}>
            <path
              className={`${styles.line} ${styles.featherNavy}`}
              d="M466 362C414 298 381 227 380 130C412 169 441 207 469 251C485 277 500 304 511 334"
            />
            <path
              className={`${styles.line} ${styles.featherGold}`}
              d="M451 365C375 317 320 248 292 155C337 190 380 226 416 270C437 296 452 322 463 348"
            />
            <path
              className={`${styles.line} ${styles.featherSoft}`}
              d="M437 374C346 348 271 301 220 226C277 249 331 275 375 309C401 329 419 349 432 367"
            />
            <path
              className={`${styles.line} ${styles.featherGold}`}
              d="M426 385C326 381 239 356 166 303C229 307 288 315 339 334C377 348 403 364 421 381"
            />
            <path
              className={`${styles.line} ${styles.featherSoft}`}
              d="M423 396C328 420 242 420 157 392C218 379 277 372 331 374C372 376 402 384 423 396"
            />
          </g>

          <g className={styles.lowerWing}>
            <path
              className={`${styles.line} ${styles.featherNavy}`}
              d="M469 447C446 487 414 523 370 552C389 511 402 475 409 440"
            />
            <path
              className={`${styles.line} ${styles.featherGold}`}
              d="M454 452C415 506 366 544 303 566C335 525 359 486 372 447"
            />
            <path
              className={`${styles.line} ${styles.featherSoft}`}
              d="M438 449C383 496 319 523 246 528C291 497 327 465 351 431"
            />
          </g>

          <path
            className={`${styles.line} ${styles.tailLine}`}
            d="M388 431C332 456 270 467 198 457C252 439 299 418 336 391"
          />
          <path
            className={`${styles.line} ${styles.tailGold}`}
            d="M397 439C337 482 268 505 188 506C245 477 294 447 333 410"
          />

          <g className={styles.olive}>
            <path className={`${styles.line} ${styles.oliveStem}`} d="M716 269C730 256 741 239 748 219" />
            <path className={styles.leaf} d="M728 254C728 238 735 226 747 218C748 233 742 246 728 254Z" />
            <path className={styles.leaf} d="M737 240C747 228 756 224 766 225C761 237 752 244 737 240Z" />
            <path className={styles.leaf} d="M741 232C741 218 746 207 757 198C759 212 753 224 741 232Z" />
          </g>
        </g>
      </svg>
    </div>
  );
}

export default function PricingConfigurator() {
  return (
    <section className={styles.section} id="scope">
      <div className={styles.inner}>
        <div className={styles.copy}>
          <p className={styles.eyebrow}>Scope before numbers</p>
          <h2>Tell me what you&apos;re building. I&apos;ll scope it from there.</h2>
          <p className={styles.intro}>
            There is no public price menu to decode. You start with a quote request,
            I review what you actually need, and the final scope is confirmed with you
            before anything is priced or built.
          </p>

          <div className={styles.actionRow}>
            <Link href="/quote" className={styles.quoteButton}>
              Start your quote request <span aria-hidden="true">→</span>
            </Link>
            <span className={styles.signal} aria-hidden="true">
              scope / quote / build
            </span>
          </div>
        </div>

        <ScopeDove />
      </div>
    </section>
  );
}
