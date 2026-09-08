"use client";

import type { FormEvent } from "react";
import { today } from "./AdminBits";
import type { Data, Item, Modal } from "./adminTypes";
import s from "./adminShell.module.css";

type Props={modal:Exclude<Modal,null>;data:Data|null;busy:boolean;projectId:string;changeItem:Item|null;onSubmit:(e:FormEvent<HTMLFormElement>)=>void;onClose:()=>void};

export default function AdminModal({modal,data,busy,projectId,changeItem,onSubmit,onClose}:Props){
  return <div className={s.backdrop} onMouseDown={e=>{if(e.target===e.currentTarget)onClose()}}>
    <section className={s.modal} role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <header><div><p className={s.eyebrow}>Quick add</p><h2 id="modal-title">{modal==="client"?"Add a client":modal==="project"?"Create a project":modal==="time"?"Log time":modal==="message"?"Send a message":modal==="changes"?`Request changes — ${changeItem?.name||"item"}`:"Add checklist item"}</h2></div><button type="button" aria-label="Close" onClick={onClose}>×</button></header>
      <form onSubmit={onSubmit}>
        {modal==="client"?<><label>Client name<input name="name" required autoFocus/></label><label>Email<input name="email" type="email" required/></label><label>Business name<input name="businessName" required/></label><label>Phone <small>optional</small><input name="phone"/></label><label>First project<input name="projectName" required/></label></>:null}
        {modal==="project"?<><label>Client<select name="clientId" required defaultValue={data?.clients[0]?.id||""}><option value="" disabled>Select client</option>{data?.clients.map(c=><option key={c.id} value={c.id}>{c.businessName}</option>)}</select></label><label>Project name<input name="name" required autoFocus/></label><label>Phase<select name="status" defaultValue="consultation"><option value="consultation">Consultation</option><option value="plan_quote">Plan & quote</option><option value="build">Build</option><option value="launch">Launch</option><option value="paused">Paused</option></select></label></>:null}
        {modal==="time"?<><label>Project<select name="projectId" required defaultValue={projectId}><option value="" disabled>Select project</option>{data?.projects.map(p=><option key={p.id} value={p.id}>{p.clientName} — {p.name}</option>)}</select></label><div className={s.split}><label>Date<input name="date" type="date" defaultValue={today()} required/></label><label>Hours<input name="hours" type="number" min="0.1" max="24" step="0.1" required/></label></div><label>Phase<input name="phase" placeholder="Design, build, QA…" required/></label><label>Description<textarea name="description" rows={3} required placeholder="Plain-language description of what you did"/></label></>:null}
        {modal==="message"?<><label>Project<select name="projectId" required defaultValue={projectId}><option value="" disabled>Select project</option>{data?.projects.map(p=><option key={p.id} value={p.id}>{p.clientName} — {p.name}</option>)}</select></label><label>Message<textarea name="body" rows={5} required autoFocus placeholder="Write a project update…"/></label></>:null}
        {modal==="changes"?<label>What needs to change?<textarea name="note" rows={4} required autoFocus defaultValue={changeItem?.note||""} placeholder="Be specific — this note is visible to the client."/></label>:null}
        {modal==="addItem"?<><input type="hidden" name="projectId" value={projectId}/><label>Item name<input name="name" required autoFocus placeholder="e.g. Testimonials"/></label><label>Item type<select name="itemType" defaultValue="confirm"><option value="file">File</option><option value="text">Text</option><option value="link">Link</option><option value="confirm">Confirmation</option></select></label></>:null}
        <div className={s.modalActions}><button type="button" onClick={onClose}>Cancel</button><button type="submit" disabled={busy||(modal==="project"&&!data?.clients.length)}>{busy?"Saving…":"Save"}</button></div>
      </form>
    </section>
  </div>
}
