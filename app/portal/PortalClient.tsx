"use client";

import {
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import ActivityFeed from "./ActivityFeed";
import OnboardingPanel, { type OnboardingItem } from "./OnboardingPanel";
import TimesheetPanel, { type TimeCheckin } from "./TimesheetPanel";
import styles from "./portal.module.css";

type PortalUser = {
  id: string;
  email: string;
  role: "admin" | "client";
  name: string;
};

type Project = {
  id: string;
  client_id: string;
  name: string;
  slug: string;
  status: string;
  tier: string | null;
  quoted_total: number | null;
  started_at: string | null;
  launched_at: string | null;
  created_at: string;
};

type Client = {
  id: string;
  user_id: string;
  business_name: string;
  contact_name: string;
  phone: string | null;
};

type PortalFile = {
  id: string;
  project_id: string;
  uploaded_by: string;
  filename: string;
  size: number;
  kind: "deliverable" | "asset" | "doc";
  created_at: string;
};

type TimeEntry = {
  id: string;
  project_id: string;
  date: string;
  phase: string;
  description: string;
  hours: number;
};

type Invoice = {
  id: string;
  project_id: string;
  amount: number;
  status: string;
  due_at: string | null;
  paid_at: string | null;
};

type Message = {
  id: string;
  project_id: string;
  sender_id: string;
  body: string;
  created_at: string;
  read_at: string | null;
  sender: {
    name: string;
    role: string;
  };
};

type DashboardPayload = {
  user: PortalUser;
  projects: Project[];
  clients: Client[];
  files: PortalFile[];
  timeEntries: TimeEntry[];
  invoices: Invoice[];
  onboardingItems: OnboardingItem[];
  timeCheckins: TimeCheckin[];
};

/** Tabs double as URL segments under /portal/projects. */
const TABS = [
  ["overview", "Overview"],
  ["onboarding", "Onboarding"],
  ["timesheet", "Timesheet"],
  ["files", "Files"],
  ["messages", "Messages"],
] as const;

type TabId = (typeof TABS)[number][0];

function tabFromPath(pathname: string): TabId {
  const last = pathname.split("/").filter(Boolean).pop() ?? "";
  const match = TABS.find(([id]) => id === last);
  return match ? match[0] : "overview";
}

function money(value: number | null) {
  if (value === null) return "Not set";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function bytes(value: number) {
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${Math.round(value / 1024)} KB`;
  return `${(value / (1024 * 1024)).toFixed(1)} MB`;
}

function statusLabel(value: string) {
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export default function PortalClient() {
  const [sessionState, setSessionState] = useState<"loading" | "signed-out" | "ready">(
    "loading",
  );
  const [user, setUser] = useState<PortalUser | null>(null);
  const [dashboard, setDashboard] = useState<DashboardPayload | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState("");
  const [messageBusy, setMessageBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [uploadBusy, setUploadBusy] = useState(false);
  const [tab, setTab] = useState<TabId>("overview");

  // The catch-all /portal/projects/[[...slug]] route already accepts these
  // segments, so the tab can live in the URL without a route rewrite. Using
  // history directly rather than a router push keeps the client-side data
  // loaded instead of re-running the server component on every tab change.
  useEffect(() => {
    setTab(tabFromPath(window.location.pathname));
    const onPop = () => setTab(tabFromPath(window.location.pathname));
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  function selectTab(next: TabId) {
    setTab(next);
    const path = next === "overview" ? "/portal/projects" : `/portal/projects/${next}`;
    window.history.pushState(null, "", path);
  }
  const [inviteOpen, setInviteOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const loadDashboard = useCallback(async () => {
    const response = await fetch("/api/portal/data", { cache: "no-store" });
    if (!response.ok) {
      throw new Error("Could not load your project workspace.");
    }

    const payload = (await response.json()) as DashboardPayload;
    setDashboard(payload);
    setUser(payload.user);
    setSelectedProjectId((current) => current || payload.projects[0]?.id || "");
    return payload;
  }, []);

  const establishSession = useCallback(async () => {
    const sessionResponse = await fetch("/api/portal/auth/session", {
      cache: "no-store",
    });

    if (!sessionResponse.ok) {
      setSessionState("signed-out");
      return;
    }

    const payload = (await sessionResponse.json()) as { user: PortalUser };
    setUser(payload.user);
    await loadDashboard();
    setSessionState("ready");
  }, [loadDashboard]);

  useEffect(() => {
    establishSession().catch((caught) => {
      setError(caught instanceof Error ? caught.message : "Could not sign in.");
      setSessionState("signed-out");
    });
  }, [establishSession]);

  useEffect(() => {
    if (sessionState === "signed-out") {
      window.location.replace("/portal");
    }
  }, [sessionState]);

  const loadMessages = useCallback(async (projectId: string) => {
    if (!projectId) {
      setMessages([]);
      return;
    }

    const response = await fetch(
      `/api/portal/messages?projectId=${encodeURIComponent(projectId)}`,
      { cache: "no-store" },
    );

    if (!response.ok) {
      setMessages([]);
      return;
    }

    const payload = (await response.json()) as { messages: Message[] };
    setMessages(payload.messages);

    // Clear the unread count for whoever is looking. The database refuses to
    // mark your own messages read, so this only ever touches the other side's.
    if (payload.messages.some((message) => !message.read_at)) {
      fetch("/api/portal/messages", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId }),
      }).catch(() => undefined);
    }
  }, []);

  useEffect(() => {
    if (sessionState === "ready" && selectedProjectId) {
      loadMessages(selectedProjectId);
    }
  }, [loadMessages, selectedProjectId, sessionState]);

  const selectedProject = dashboard?.projects.find(
    (project) => project.id === selectedProjectId,
  );
  const selectedClient = dashboard?.clients.find(
    (client) => client.id === selectedProject?.client_id,
  );
  const selectedFiles = useMemo(
    () =>
      dashboard?.files.filter((file) => file.project_id === selectedProjectId) ?? [],
    [dashboard, selectedProjectId],
  );
  const selectedTimeEntries = useMemo(
    () =>
      dashboard?.timeEntries.filter(
        (entry) => entry.project_id === selectedProjectId,
      ) ?? [],
    [dashboard, selectedProjectId],
  );
  const selectedInvoices = useMemo(
    () =>
      dashboard?.invoices.filter(
        (invoice) => invoice.project_id === selectedProjectId,
      ) ?? [],
    [dashboard, selectedProjectId],
  );
  const totalHours = selectedTimeEntries.reduce(
    (sum, entry) => sum + Number(entry.hours),
    0,
  );


  async function logout() {
    await fetch("/api/portal/auth/session", { method: "DELETE" });
    window.location.replace("/portal");
  }

  async function sendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedProjectId || !messageText.trim() || messageBusy) return;

    setMessageBusy(true);
    setError("");

    const response = await fetch("/api/portal/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        projectId: selectedProjectId,
        body: messageText,
      }),
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as
        | { error?: string }
        | null;
      setError(payload?.error || "Could not send your message.");
      setMessageBusy(false);
      return;
    }

    const payload = (await response.json()) as { message: Message };
    setMessages((current) => [...current, payload.message]);
    setMessageText("");
    setMessageBusy(false);
  }

  async function uploadFile(file: File) {
    if (!selectedProjectId || uploadBusy) return;

    setUploadBusy(true);
    setError("");

    const form = new FormData();
    form.append("projectId", selectedProjectId);
    form.append("kind", user?.role === "admin" ? "deliverable" : "asset");
    form.append("file", file);

    const response = await fetch("/api/portal/files", {
      method: "POST",
      body: form,
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as
        | { error?: string }
        | null;
      setError(payload?.error || "Could not upload that file.");
      setUploadBusy(false);
      return;
    }

    await loadDashboard();
    setUploadBusy(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function downloadFile(file: PortalFile) {
    const response = await fetch(
      `/api/portal/files?fileId=${encodeURIComponent(file.id)}`,
      { cache: "no-store" },
    );

    if (!response.ok) {
      setError("Could not prepare that download.");
      return;
    }

    const payload = (await response.json()) as { url: string };
    window.open(payload.url, "_blank", "noopener,noreferrer");
  }

  async function inviteClient(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const quotedText = String(form.get("quotedTotal") ?? "").trim();

    setError("");
    setNotice("");

    const response = await fetch("/api/portal/admin/invite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.get("name"),
        email: form.get("email"),
        businessName: form.get("businessName"),
        phone: form.get("phone"),
        projectName: form.get("projectName"),
        tier: form.get("tier"),
        quotedTotal: quotedText ? Number(quotedText) : null,
      }),
    });

    const payload = (await response.json().catch(() => null)) as
      | { error?: string; message?: string }
      | null;

    if (!response.ok) {
      setError(payload?.error || "Could not add that client.");
      return;
    }

    setNotice(payload?.message || "Client added.");
    event.currentTarget.reset();
    setInviteOpen(false);
    await loadDashboard();
  }

  if (sessionState !== "ready") {
    return (
      <main className={styles.portalShell}>
        <div className={styles.loadingMark} aria-label="Loading client portal">
          <span>KS</span>
          <i />
        </div>
      </main>
    );
  }

  return (
    <main className={styles.portalShell}>
      <header className={styles.portalHeader}>
        <a className={styles.portalBrand} href="/">
          <span>KS</span>
          <b>Client Portal</b>
        </a>
        <div className={styles.userBlock}>
          <span>
            {user?.name}
            <small>
              {user?.role === "admin" ? "Admin" : selectedClient?.business_name || "Client"}
            </small>
          </span>
          <button type="button" onClick={logout}>Sign out</button>
        </div>
      </header>

      <div className={styles.workspace}>
        <aside className={styles.projectRail}>
          <div className={styles.railHeading}>
            <p className={styles.eyebrow}>
              {user?.role === "admin" ? "All projects" : "Your projects"}
            </p>
            {user?.role === "admin" ? (
              <button
                className={styles.inviteToggle}
                type="button"
                onClick={() => setInviteOpen((current) => !current)}
              >
                {inviteOpen ? "Close" : "+ Client"}
              </button>
            ) : null}
          </div>

          {inviteOpen && user?.role === "admin" ? (
            <form className={styles.inviteForm} onSubmit={inviteClient}>
              <input name="name" placeholder="Client name" required />
              <input name="email" type="email" placeholder="Email" required />
              <input name="businessName" placeholder="Business" required />
              <input name="phone" placeholder="Phone (optional)" />
              <input name="projectName" placeholder="Project name" required />
              <div className={styles.inviteSplit}>
                <input name="tier" placeholder="Tier" />
                <input
                  name="quotedTotal"
                  type="number"
                  min="0"
                  step="1"
                  placeholder="Quote"
                />
              </div>
              <button type="submit">Create + send magic link</button>
            </form>
          ) : null}

          <nav className={styles.projectList} aria-label="Projects">
            {dashboard?.projects.map((project) => (
              <button
                type="button"
                className={project.id === selectedProjectId ? styles.activeProject : ""}
                onClick={() => setSelectedProjectId(project.id)}
                key={project.id}
              >
                <span>{project.name}</span>
                <small>{statusLabel(project.status)}</small>
              </button>
            ))}
          </nav>

          {!dashboard?.projects.length ? (
            <p className={styles.emptyRail}>
              {user?.role === "admin"
                ? "No projects yet. Add the first client above."
                : "No project has been assigned to this account yet."}
            </p>
          ) : null}
        </aside>

        <section className={styles.projectView}>
          {notice ? <div className={styles.notice} role="status">{notice}</div> : null}
          {error ? <div className={styles.errorBanner} role="alert">{error}</div> : null}

          {selectedProject ? (
            <>
              <header className={styles.projectHero}>
                <div>
                  <p className={styles.eyebrow}>
                    {selectedClient?.business_name || "Project"}
                  </p>
                  <h1>{selectedProject.name}</h1>
                </div>
                <span className={styles.statusBadge}>
                  <i aria-hidden="true" />
                  {statusLabel(selectedProject.status)}
                </span>
              </header>

              <nav className={styles.tabBar} aria-label="Project sections">
                {TABS.map(([id, label]) => {
                  const open =
                    id === "onboarding"
                      ? (dashboard?.onboardingItems ?? []).filter(
                          (item) =>
                            item.project_id === selectedProjectId &&
                            (item.status === "pending" || item.status === "needs_changes"),
                        ).length
                      : 0;

                  return (
                    <button
                      aria-current={tab === id ? "page" : undefined}
                      className={tab === id ? styles.tabActive : ""}
                      key={id}
                      onClick={() => selectTab(id)}
                      type="button"
                    >
                      {label}
                      {open > 0 ? (
                        <i className={styles.tabCount} aria-label={`${open} waiting on you`}>
                          {open}
                        </i>
                      ) : null}
                    </button>
                  );
                })}
              </nav>

              <div className={styles.summaryGrid} hidden={tab !== "overview"}>
                <article>
                  <span>Current phase</span>
                  <strong>{statusLabel(selectedProject.status)}</strong>
                  <small>The single source of truth for where the build is.</small>
                </article>
                <article>
                  <span>Quoted total</span>
                  <strong>{money(selectedProject.quoted_total)}</strong>
                  <small>The agreed project floor — not a moving target.</small>
                </article>
                <article>
                  <span>Hours logged</span>
                  <strong>{totalHours.toFixed(1)}</strong>
                  <small>
                    {totalHours >= 10
                      ? `${Math.floor(totalHours / 10)} ten-hour check-in${Math.floor(totalHours / 10) === 1 ? "" : "s"} reached.`
                      : `${Math.max(0, 10 - totalHours).toFixed(1)} hours until the first check-in.`}
                  </small>
                </article>
              </div>

              {tab === "overview" ? (
                <ActivityFeed
                  currentUserId={user?.id ?? ""}
                  files={dashboard?.files ?? []}
                  messages={messages}
                  onboardingItems={dashboard?.onboardingItems ?? []}
                  projectId={selectedProjectId}
                  timeEntries={dashboard?.timeEntries ?? []}
                />
              ) : null}

              {tab === "onboarding" ? (
                <OnboardingPanel
                  items={dashboard?.onboardingItems ?? []}
                  onChanged={async () => {
                    await loadDashboard();
                  }}
                  onError={setError}
                  projectId={selectedProjectId}
                />
              ) : null}

              {tab === "timesheet" ? (
                <TimesheetPanel
                  checkins={dashboard?.timeCheckins ?? []}
                  entries={dashboard?.timeEntries ?? []}
                  projectId={selectedProjectId}
                />
              ) : null}

              <div className={styles.mainGrid} hidden={tab !== "messages" && tab !== "files"}>
                <section
                  className={styles.messagesPanel}
                  aria-labelledby="messages-title"
                  hidden={tab !== "messages"}
                >
                  <div className={styles.panelHeading}>
                    <div>
                      <p className={styles.eyebrow}>Conversation</p>
                      <h2 id="messages-title">Project messages</h2>
                    </div>
                    <span>{messages.length}</span>
                  </div>

                  <div className={styles.messageThread}>
                    {messages.length ? (
                      messages.map((message) => {
                        const mine = message.sender_id === user?.id;
                        return (
                          <article
                            className={`${styles.message} ${mine ? styles.messageMine : ""}`}
                            key={message.id}
                          >
                            <header>
                              <strong>{message.sender.name}</strong>
                              <time dateTime={message.created_at}>
                                {new Date(message.created_at).toLocaleString([], {
                                  month: "short",
                                  day: "numeric",
                                  hour: "numeric",
                                  minute: "2-digit",
                                })}
                              </time>
                            </header>
                            <p>{message.body}</p>
                          </article>
                        );
                      })
                    ) : (
                      <div className={styles.emptyThread}>
                        <span>Nothing buried in an inbox yet.</span>
                        <p>Use this thread for project-specific decisions and updates.</p>
                      </div>
                    )}
                  </div>

                  <form className={styles.messageForm} onSubmit={sendMessage}>
                    <label htmlFor="portal-message">New message</label>
                    <textarea
                      id="portal-message"
                      value={messageText}
                      onChange={(event) => setMessageText(event.target.value)}
                      placeholder="Write a project update…"
                      maxLength={10000}
                      rows={4}
                    />
                    <button type="submit" disabled={messageBusy || !messageText.trim()}>
                      {messageBusy ? "Sending…" : "Send message →"}
                    </button>
                  </form>
                </section>

                <div className={styles.sideStack} hidden={tab !== "files"}>
                  <section className={styles.filesPanel} aria-labelledby="files-title">
                    <div className={styles.panelHeading}>
                      <div>
                        <p className={styles.eyebrow}>Files</p>
                        <h2 id="files-title">Shared files</h2>
                      </div>
                      <span>{selectedFiles.length}</span>
                    </div>

                    <div className={styles.fileList}>
                      {selectedFiles.map((file) => (
                        <button
                          type="button"
                          onClick={() => downloadFile(file)}
                          key={file.id}
                        >
                          <span>
                            <strong>{file.filename}</strong>
                            <small>{file.kind} · {bytes(file.size)}</small>
                          </span>
                          <b aria-hidden="true">↓</b>
                        </button>
                      ))}
                      {!selectedFiles.length ? (
                        <p className={styles.emptySmall}>No files shared yet.</p>
                      ) : null}
                    </div>

                    <label className={styles.uploadButton}>
                      <input
                        ref={fileInputRef}
                        type="file"
                        onChange={(event) => {
                          const file = event.target.files?.[0];
                          if (file) uploadFile(file);
                        }}
                        disabled={uploadBusy}
                      />
                      <span>{uploadBusy ? "Uploading…" : "+ Upload a file"}</span>
                      <small>20 MB max</small>
                    </label>
                  </section>

                  <section className={styles.invoicePanel} aria-labelledby="invoice-title">
                    <div className={styles.panelHeading}>
                      <div>
                        <p className={styles.eyebrow}>Billing</p>
                        <h2 id="invoice-title">Invoices</h2>
                      </div>
                      <span>{selectedInvoices.length}</span>
                    </div>

                    {selectedInvoices.length ? (
                      <div className={styles.invoiceList}>
                        {selectedInvoices.slice(0, 4).map((invoice) => (
                          <div key={invoice.id}>
                            <strong>{money(Number(invoice.amount))}</strong>
                            <span>{statusLabel(invoice.status)}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className={styles.emptySmall}>
                        No invoices have been issued for this project.
                      </p>
                    )}
                  </section>
                </div>
              </div>
            </>
          ) : (
            <div className={styles.noProject}>
              <p className={styles.eyebrow}>Client portal</p>
              <h1>One place for the project.</h1>
              <p>
                Add a client and the workspace becomes the record for status, files,
                messages, logged time, and billing.
              </p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
