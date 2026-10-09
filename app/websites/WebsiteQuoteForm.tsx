"use client";
import { useState, type FormEvent } from "react";
import { site } from "../data/site";
import styles from "../home/form.module.css";

export default function WebsiteQuoteForm({sent=false,errorCode=""}:{sent?:boolean;errorCode?:string}) {
  const [state,setState]=useState<"idle"|"sending"|"sent"|"error">(sent?"sent":errorCode?"error":"idle");
  const [error,setError]=useState(errorCode?"Your request couldn't be delivered. Please contact me directly.":"");
  async function submit(e:FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data=Object.fromEntries(new FormData(e.currentTarget).entries());
    setState("sending"); setError("");
    try {
      const res=await fetch("/api/website-quote",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(data)});
      const payload=await res.json() as {ok?:boolean;error?:string};
      if(!res.ok || !payload.ok) throw new Error(payload.error||"Please contact me directly.");
      setState("sent");
    } catch(e) {setState("error");setError(e instanceof Error?e.message:"Please contact me directly.");}
  }
  if(state==="sent") return <div className={styles.sent} role="status"><h2>Thanks for reaching out.</h2><p>Your website inquiry has been received. I&rsquo;ll be in touch to discuss your project. &mdash; Kyle</p></div>;
  return <form id="website-quote-form" className={styles.form} onSubmit={submit} method="post" action="/api/website-quote">
    <div className={styles.row}><div className={styles.field}><label htmlFor="wq-name">Your name</label><input className={styles.input} id="wq-name" name="name" required maxLength={100} autoComplete="name"/></div><div className={styles.field}><label htmlFor="wq-business">Business name</label><input className={styles.input} id="wq-business" name="business" required maxLength={120} autoComplete="organization"/></div></div>
    <div className={styles.row}><div className={styles.field}><label htmlFor="wq-town">Town</label><input className={styles.input} id="wq-town" name="town" required maxLength={80}/></div><div className={styles.field}><label htmlFor="wq-email">Email</label><input className={styles.input} id="wq-email" name="email" type="email" maxLength={180} autoComplete="email"/></div></div>
    <div className={styles.row}><div className={styles.field}><label htmlFor="wq-phone">Best phone number</label><input className={styles.input} id="wq-phone" name="phone" type="tel" maxLength={30} autoComplete="tel"/></div><div className={styles.field}><label htmlFor="wq-current">Current website (optional)</label><input className={styles.input} id="wq-current" name="current_site" maxLength={200} placeholder="example.com"/></div></div>
    <div className={styles.field}><label htmlFor="wq-goals">What should your website help customers do?</label><textarea className={styles.input} id="wq-goals" name="goals" rows={4} maxLength={1000}/></div>
    <div className={styles.honeypot} aria-hidden="true" inert={true}><label htmlFor="wq-hp">Leave this empty</label><input id="wq-hp" name="website" tabIndex={-1} autoComplete="off"/></div>
    <p className={styles.fine}>Please enter either an email or phone number so I can reply. No obligation. <a href="/privacy">Privacy</a>.</p>
    {state==="error"?<p className={styles.error} role="alert">{error} You can also email <a href={`mailto:${site.email}`}>{site.email}</a>.</p>:null}
    <button className="btn" type="submit" disabled={state==="sending"}>{state==="sending"?"Sending…":"Request a website quote"}</button>
  </form>;
}
