"use client";

import {
  CSSProperties,
  KeyboardEvent as ReactKeyboardEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import styles from "./SelectedWork.module.css";
import polish from "./SelectedWorkPolish.module.css";

type Feature = {
  label: string;
  detail: string;
};

type Project = {
  id: string;
  tab: string;
  title: string;
  category: string;
  year: string;
  status: string;
  eyebrow: string;
  headline: string;
  body: string;
  accent: "navy" | "gold" | "plum" | "forest";
  siteUrl: string;
  screenshots?: string[];
  features: Feature[];
};

const projects: Project[] = [
  {
    id: "with-little",
    tab: "With Little",
    title: "With Little",
    category: "Personal project",
    year: "2026",
    status: "Live",
    eyebrow: "SMALL STEPS. BIGGER POSSIBILITIES.",
    headline: "A calmer digital home for families.",
    body: "A gentle, useful experience built around clarity, trust, and the next right step.",
    accent: "plum",
    siteUrl: "withlittle.com",
    screenshots: [
      "/selected-work/with-little-01.png",
      "/selected-work/with-little-02.png",
    ],
    features: [
      { label: "Email / CRM", detail: "Follow-up and nurturing flows" },
      { label: "Intake forms", detail: "Structured client information" },
      { label: "Analytics", detail: "See what visitors actually use" },
      { label: "CMS", detail: "Simple content updates" },
      { label: "Payments", detail: "Ready for secure checkout" },
      { label: "Client portal", detail: "Private resources and access" },
    ],
  },
  {
    id: "common-ground",
    tab: "Common Ground",
    title: "Common Ground",
    category: "ABA / autism support",
    year: "2026",
    status: "Piloted",
    eyebrow: "PARENT NAVIGATION, WITHOUT THE OVERWHELM.",
    headline: "One place to know what comes next.",
    body: "A parent-navigation platform that turns scattered information into guided next steps.",
    accent: "gold",
    siteUrl: "texasabacenterscg.com",
    screenshots: ["/hero-crt/common-ground.png"],
    features: [
      { label: "Guided intake", detail: "Personalized parent pathways" },
      { label: "Resource system", detail: "Curated tools in one place" },
      { label: "Analytics", detail: "Understand parent usage" },
      { label: "Care-plan logic", detail: "Adaptive next-step planning" },
      { label: "Provider tools", detail: "Interview and evaluation guides" },
      { label: "Support routing", detail: "Clear paths to human help" },
    ],
  },
  {
    id: "bcba-prep",
    tab: "BCBA Prep",
    title: "BCBA Prep",
    category: "Exam prep · licensing",
    year: "2026",
    status: "Pre-launch",
    eyebrow: "NINE DOMAINS. ONE STUDY EXPERIENCE.",
    headline: "A study storefront that feels like a library.",
    body: "Custom commerce and member architecture wrapped in an interactive book-based experience.",
    accent: "plum",
    siteUrl: "Bee the Behavior Bae",
    screenshots: [
      "/selected-work/bcba-prep-01.png",
      "/selected-work/bcba-prep-02.png",
    ],
    features: [
      { label: "Stripe", detail: "Server-side product pricing" },
      { label: "Member access", detail: "Account-based study library" },
      { label: "Bundles", detail: "Domain and full-library pricing" },
      { label: "Testimonials", detail: "Social-proof collection" },
      { label: "Analytics", detail: "Launch behavior insights" },
      { label: "Licensing", detail: "Personal-use access structure" },
    ],
  },
  {
    id: "storage",
    tab: "Storage",
    title: "Lake City Self Storage",
    category: "Self storage",
    year: "2025",
    status: "Archived",
    eyebrow: "LOCAL, CLEAR, CONVERSION-READY.",
    headline: "A storage site that gets people to the unit faster.",
    body: "A straightforward local-business experience built around trust, location clarity, and action.",
    accent: "navy",
    siteUrl: "lakecityselfstorage.com",
    screenshots: [
      "/selected-work/lake-city-01.png",
      "/selected-work/lake-city-02.png",
    ],
    features: [
      { label: "Unit discovery", detail: "Clear paths to availability" },
      { label: "Contact flows", detail: "Fewer dead ends" },
      { label: "Local SEO", detail: "Search-ready structure" },
      { label: "Analytics", detail: "Track high-intent actions" },
      { label: "Mobile", detail: "Fast, thumb-friendly browsing" },
      { label: "Lead capture", detail: "Simple inquiry paths" },
    ],
  },
];

const featureGlyphs = ["✉", "▤", "⌁", "▦", "▣", "◎"];

function GeneratedPreview({ active }: { active: Project }) {
  return (
    <div className={styles.siteScroller} key={active.id}>
      <div className={styles.siteHero}>
        <div className={styles.fakeNav}>
          <strong>{active.title}</strong>
          <span>Home</span>
          <span>Work</span>
          <span>About</span>
          <b>Let&apos;s talk</b>
        </div>

        <div className={styles.siteHeroGrid}>
          <div>
            <p className={styles.mockEyebrow}>{active.eyebrow}</p>
            <h3>{active.headline}</h3>
            <p>{active.body}</p>
            <span className={styles.mockButton}>Explore the project →</span>
          </div>
          <div className={styles.heroArtwork} aria-hidden="true">
            <span className={styles.artOrb} />
            <span className={styles.artCard} />
            <span className={styles.artLine} />
          </div>
        </div>
      </div>

      <div className={styles.mockStats}>
        <div>
          <strong>Custom</strong>
          <span>Built around the workflow</span>
        </div>
        <div>
          <strong>Responsive</strong>
          <span>Designed across devices</span>
        </div>
        <div>
          <strong>Maintainable</strong>
          <span>Made to grow after launch</span>
        </div>
      </div>

      <div className={styles.mockFeatureBlock}>
        <div className={styles.mockPhoto} aria-hidden="true" />
        <div>
          <p>THE SYSTEM BEHIND THE SCREEN</p>
          <h4>Design is only the front layer.</h4>
          <span>
            Forms, payments, analytics, content, automation and client access can all
            live behind the same experience.
          </span>
        </div>
      </div>

      <div className={styles.mockFooter}>
        <strong>{active.title}</strong>
        <span>{active.category}</span>
        <span>{active.year}</span>
      </div>
    </div>
  );
}

export default function SelectedWork() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [shotIndex, setShotIndex] = useState(0);
  const [entered, setEntered] = useState(false);
  // Which way the page flips. Set from the tab you came from, so moving down
  // the tabs turns the page forward and moving up turns it back.
  const [turnDirection, setTurnDirection] = useState<"forward" | "back">("forward");
  const sectionRef = useRef<HTMLElement | null>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const active = projects[activeIndex];
  const shotCount = active.screenshots?.length ?? 0;
  const total = projects.length;
  const totalLabel = String(total).padStart(2, "0");

  useEffect(() => {
    const node = sectionRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setEntered(true);
      },
      { threshold: 0.18 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    setShotIndex(0);
    if (shotCount < 2) return;

    const timer = window.setInterval(() => {
      setShotIndex((current) => (current + 1) % shotCount);
    }, 6500);

    return () => window.clearInterval(timer);
  }, [active.id, shotCount]);

  const accentClass = useMemo(() => {
    return styles[`accent_${active.accent}`] ?? "";
  }, [active.accent]);

  const previousShot = () => {
    if (shotCount < 2) return;
    setShotIndex((current) => (current - 1 + shotCount) % shotCount);
  };

  const nextShot = () => {
    if (shotCount < 2) return;
    setShotIndex((current) => (current + 1) % shotCount);
  };

  const selectProject = (index: number) => {
    if (index === activeIndex) return;
    setTurnDirection(index > activeIndex ? "forward" : "back");
    setActiveIndex(index);
    setShotIndex(0);
  };

  // Roving tabindex: only the selected tab is in the tab order, and the arrow
  // keys move between tabs the way the tablist pattern expects.
  const onTabKeyDown = (event: ReactKeyboardEvent<HTMLButtonElement>) => {
    const keys = ["ArrowDown", "ArrowRight", "ArrowUp", "ArrowLeft", "Home", "End"];
    if (!keys.includes(event.key)) return;
    event.preventDefault();

    let next = activeIndex;
    if (event.key === "ArrowDown" || event.key === "ArrowRight") {
      next = (activeIndex + 1) % total;
    } else if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
      next = (activeIndex - 1 + total) % total;
    } else if (event.key === "Home") {
      next = 0;
    } else if (event.key === "End") {
      next = total - 1;
    }

    selectProject(next);
    tabRefs.current[next]?.focus();
  };

  return (
    <section
      ref={sectionRef}
      className={`${styles.section} ${polish.sectionPolish} ${entered ? styles.entered : ""}`}
      id="selected-work"
      aria-labelledby="selected-work-heading"
    >
      <div className={styles.headingWrap}>
        <p className={styles.eyebrow}>Selected work</p>
        <div className={styles.headingRow}>
          <h2 id="selected-work-heading">The work, up close.</h2>
          <p className={styles.headingNote}>
            Open the binder. Pick a tab. See the site at full size, then see the
            system behind it.
          </p>
        </div>
      </div>

      <div className={`${styles.stage} ${polish.stagePolish} ${accentClass}`}>
        <div className={styles.tableGlow} aria-hidden="true" />

        <div
          className={`${styles.binder} ${polish.binderPolish}`}
          aria-label="Selected project binder"
        >
          <div className={styles.coverLeft}>
            <div className={`${styles.coverPaper} ${polish.coverPolish}`}>
              <p className={styles.coverKicker}>Selected work</p>
              <p className={`${styles.coverLine} ${polish.coverLinePolish}`}>
                Thoughtful websites,
                <br />
                built around
                <br />
                real businesses.
              </p>
              <span className={styles.coverRule} />
              <p className={styles.coverSmall}>
                Strategy
                <br />
                design
                <br />
                systems
                <br />
                launch
              </p>
              <blockquote>“Good design makes the next step obvious.”</blockquote>
            </div>
          </div>

          <div className={styles.rings} aria-hidden="true">
            {[0, 1, 2, 3, 4].map((ring) => (
              <span key={ring} />
            ))}
          </div>

          <div className={styles.pageStack} data-turn={turnDirection}>
            <div className={styles.backPage} aria-hidden="true" />
            <div
              className={`${styles.sitePage} ${polish.sitePagePolish}`}
              key={active.id}
              id={`binder-panel-${active.id}`}
              role="tabpanel"
              aria-labelledby={`binder-tab-${active.id}`}
              tabIndex={0}
            >
              <span className={styles.turnShade} aria-hidden="true" />
              <div className={`${styles.browserBar} ${polish.browserBarPolish}`}>
                <span className={styles.browserDots} aria-hidden="true">
                  <i />
                  <i />
                  <i />
                </span>
                <span className={styles.browserAddress}>{active.siteUrl}</span>
                <span className={styles.browserAction}>↗</span>
              </div>

              <div className={`${styles.siteViewport} ${polish.viewportPolish}`}>
                {shotCount > 0 ? (
                  <div className={polish.screenshotStage}>
                    {active.screenshots?.map((src, index) => (
                      <img
                        alt={`${active.title} website screen ${index + 1}`}
                        className={`${polish.screenshotImage} ${index === shotIndex ? polish.screenshotActive : ""}`}
                        decoding="async"
                        key={src}
                        loading={index === 0 ? "eager" : "lazy"}
                        src={src}
                      />
                    ))}

                    {shotCount > 1 ? (
                      <div className={polish.shotNavigator} aria-label="Website screenshot navigation">
                        <button
                          aria-label={`Show previous ${active.title} screenshot`}
                          onClick={previousShot}
                          type="button"
                        >
                          ←
                        </button>
                        <div className={polish.shotReadout}>
                          <span>Screen</span>
                          <strong>
                            {String(shotIndex + 1).padStart(2, "0")} / {String(shotCount).padStart(2, "0")}
                          </strong>
                          <i className={polish.shotProgress} key={`${active.id}-${shotIndex}`} />
                        </div>
                        <button
                          aria-label={`Show next ${active.title} screenshot`}
                          onClick={nextShot}
                          type="button"
                        >
                          →
                        </button>
                      </div>
                    ) : (
                      <div className={polish.captureLabel} aria-hidden="true">
                        <span>Live screen</span>
                        <b>01 / 01</b>
                      </div>
                    )}
                  </div>
                ) : (
                  <GeneratedPreview active={active} />
                )}
              </div>

              <div className={`${styles.pageMeta} ${polish.pageMetaPolish}`}>
                <div>
                  <span>{String(activeIndex + 1).padStart(2, "0")} / {totalLabel}</span>
                  <strong>{active.title}</strong>
                </div>
                <div>
                  <span>{active.category}</span>
                  <strong className={polish.statusBadge}>{active.status}</strong>
                </div>
              </div>
            </div>

            <div
              className={`${styles.tabs} ${polish.tabsPolish}`}
              role="tablist"
              aria-label="Portfolio projects"
            >
              {projects.map((project, index) => (
                <button
                  type="button"
                  role="tab"
                  id={`binder-tab-${project.id}`}
                  aria-selected={index === activeIndex}
                  aria-controls={`binder-panel-${project.id}`}
                  tabIndex={index === activeIndex ? 0 : -1}
                  ref={(node) => {
                    tabRefs.current[index] = node;
                  }}
                  className={`${index === activeIndex ? styles.activeTab : ""} ${polish.tabButton} ${index === activeIndex ? polish.tabButtonActive : ""}`}
                  key={project.id}
                  onClick={() => selectProject(index)}
                  onKeyDown={onTabKeyDown}
                >
                  {project.tab}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className={`${styles.sheetZone} ${polish.sheetZonePolish}`}>
          <div className={styles.sheetShadow} aria-hidden="true" />
          <article
            className={`${styles.featureSheet} ${polish.featureSheetPolish}`}
            key={active.id}
          >
            <div className={styles.sheetTop}>
              <p>What&apos;s under the hood</p>
              <div className={polish.sheetTopMeta}>
                <span className={polish.sheetStatus}>{active.status}</span>
                <span>{String(activeIndex + 1).padStart(2, "0")} / {totalLabel}</span>
              </div>
            </div>

            <h3>
              Everything the site
              <br />
              can do behind the scenes.
            </h3>

            <p className={styles.sheetIntro}>
              The visible website is only one layer. These are the systems that can
              make it useful after someone lands on it.
            </p>

            <div className={styles.featureGrid}>
              {active.features.map((feature, index) => (
                <div
                  className={`${styles.feature} ${polish.featurePolish}`}
                  key={`${active.id}-${feature.label}`}
                  style={{ "--i": index } as CSSProperties}
                >
                  <span className={styles.featureGlyph} aria-hidden="true">
                      {featureGlyphs[index]}
                    </span>
                  <div>
                    <strong>{feature.label}</strong>
                    <p>{feature.detail}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className={styles.sheetFoot}>
              <span>{active.title}</span>
              <span>Built around the business.</span>
            </div>
          </article>
        </div>
      </div>

      <div className={styles.underStage}>
        <p>
          The binder is the work. The loose sheet is the infrastructure that makes
          the work useful.
        </p>
        <a href="/work">View all work <span>→</span></a>
      </div>
    </section>
  );
}
