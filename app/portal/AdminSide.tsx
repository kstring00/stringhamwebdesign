"use client";
import { Glyph, dateText, initials, preview } from "./AdminBits";
import type { Data, FileRow } from "./adminTypes";
import s from "./adminPanels.module.css";

type Props={data:Data|null;busy:boolean;onOpen:(mode:"client"|"project"|"time"|"message",project?:string)=>void;onInvite:(id:string)=>void;onDownload:(file:FileRow)=>void;onUpload:()=>void};
export default function AdminSide({data,busy,onOpen,onInvite,onDownload,onUpload}:Props){return <aside className={s.right}>
 <section className={s.side} id="messages"><Head title="Recent messages" action={()=>onOpen("message")} actionLabel="Send a message"/>{data?.recentMessages.length?<div className={s.list}>{data.recentMessages.slice(0,3).map(m=><button type="button" key={m.id} onClick={()=>onOpen("message",m.projectId)}><span className={s.avatar}>{initials(m.clientName)}</span><span><strong>{m.clientName}</strong><small>{preview(m.body)}</small></span><time>{dateText(m.createdAt,false)}</time>{m.unread?<i className={s.dot} aria-label="Unread"/>:null}<Glyph name="open"/></button>)}</div>:<Empty title="No client messages yet." body="The newest client reply will surface here." action="Send message" onClick={()=>onOpen("message")}/>}</section>
 <section className={s.side} id="files"><Head title="Recent files" action={onUpload} actionLabel="Upload a file"/>{data?.recentFiles.length?<div className={s.list}>{data.recentFiles.slice(0,3).map(f=><button type="button" key={f.id} onClick={()=>onDownload(f)}><span className={s.fileIcon}><Glyph name="files"/></span><span><strong>{f.filename}</strong><small>{f.clientName}</small></span><time>{dateText(f.createdAt,false)}</time><Glyph name="open"/></button>)}</div>:<div className={s.sideEmpty}><Glyph name="upload"/><span>No new uploads today — client files will land here.</span><button type="button" onClick={onUpload}>Upload files</button></div>}</section>
 <section className={s.side} id="clients"><Head title="Client invites" action={()=>onOpen("client")} actionLabel="+ Add client"/>{data?.invites.length?<div className={s.invites}>{data.invites.slice(0,3).map(i=><article key={i.id}><span><strong>{i.businessName}</strong><small>{i.email}</small></span><small>{i.inviteLastSentAt?`Sent ${dateText(i.inviteLastSentAt,false)}`:"Not sent yet"}</small><button type="button" onClick={()=>onInvite(i.id)} disabled={busy}>{i.inviteLastSentAt?"Resend":"Send"}</button></article>)}</div>:<Empty title="No client invites yet." body="Create the first client and their private access starts here." action="Add client" onClick={()=>onOpen("client")}/>}</section>
 <section className={s.side} id="settings"><div className={s.sideHead}><h2>Quick actions</h2></div><div className={s.quickGrid}><button onClick={()=>onOpen("client")}><Glyph name="plus"/>Add new client</button><button onClick={()=>onOpen("project")}><Glyph name="folder"/>Create project</button><button onClick={()=>onOpen("time")}><Glyph name="time"/>Log time</button><button onClick={()=>onOpen("message")}><Glyph name="messages"/>Send message</button></div></section>
 </aside>}
// The label now says what the control does. "View all" previously either
// scrolled to the top of the page or, on Client invites, opened the Add-client
// modal — both read as broken.
function Head({title,action,actionLabel,anchor}:{title:string;action?:()=>void;actionLabel?:string;anchor?:string}){
  return <div className={s.sideHead}>
    <h2>{title}</h2>
    {action
      ? <button type="button" onClick={action}>{actionLabel}</button>
      : anchor
        ? <a href={anchor}>Jump to section →</a>
        : null}
  </div>
}
function Empty({title,body,action,onClick}:{title:string;body:string;action:string;onClick:()=>void}){return <div className={s.sideEmpty}><span>{title}</span><p>{body}</p><button type="button" onClick={onClick}>{action}</button></div>}
