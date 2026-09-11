"use client";

import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Glyph, NAV } from "./AdminBits";
import AdminMain from "./AdminMain";
import AdminModal from "./AdminModal";
import AdminSide from "./AdminSide";
import type { AdminUser, Data, FileRow, Item, Modal, Need, Progress } from "./adminTypes";
import s from "./adminShell.module.css";

export default function AdminDashboard({user,onLogout}:{user:AdminUser;onLogout:()=>Promise<void>|void}){
  const [data,setData]=useState<Data|null>(null);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState("");
  const [notice,setNotice]=useState("");
  const [selected,setSelected]=useState("");
  const [drawer,setDrawer]=useState(false);
  const [quick,setQuick]=useState(false);
  const [modal,setModal]=useState<Modal>(null);
  const [modalProject,setModalProject]=useState("");
  const [changeItem,setChangeItem]=useState<Item|null>(null);
  const [busy,setBusy]=useState(false);
  const [search,setSearch]=useState("");
  const [searchOpen,setSearchOpen]=useState(false);
  const searchRef=useRef<HTMLInputElement|null>(null);
  const fileRef=useRef<HTMLInputElement|null>(null);

  const load=useCallback(async()=>{
    setError("");
    try{
      const r=await fetch("/api/portal/admin/dashboard",{cache:"no-store"});
      const raw=await r.json().catch(()=>null) as Data|{error?:string}|null;
      if(!r.ok||!raw||"error" in raw) throw new Error(raw&&"error" in raw?raw.error||"Could not load dashboard.":"Could not load dashboard.");
      const p=raw as Data;
      setData(p);
      setSelected(cur=>cur&&p.checklists.some(c=>c.projectId===cur)?cur:[...p.checklists].sort((a,b)=>a.percent-b.percent)[0]?.projectId||p.projects[0]?.id||"");
    }catch(e){
      setError(e instanceof Error?e.message:"Could not load dashboard.");
    }finally{
      setLoading(false);
    }
  },[]);

  useEffect(()=>{load()},[load]);
  useEffect(()=>{
    const fn=(e:globalThis.KeyboardEvent)=>{
      if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==="k"){
        e.preventDefault();
        searchRef.current?.focus();
        setSearchOpen(true);
      }
      if(e.key==="Escape"){
        setSearchOpen(false);
        setQuick(false);
        setDrawer(false);
        setModal(null);
      }
    };
    window.addEventListener("keydown",fn);
    return()=>window.removeEventListener("keydown",fn);
  },[]);

  const checklist=useMemo(()=>data?.checklists.find(c=>c.projectId===selected)||null,[data,selected]);
  const results=useMemo(()=>{
    if(!data||!search.trim()) return [] as {type:string;label:string;meta:string;projectId?:string}[];
    const q=search.toLowerCase();
    const out:{type:string;label:string;meta:string;projectId?:string}[]=[];
    data.projects.forEach(p=>{if(`${p.clientName} ${p.name} ${p.phase}`.toLowerCase().includes(q))out.push({type:"Project",label:p.name,meta:p.clientName,projectId:p.id})});
    data.clients.forEach(c=>{if(`${c.businessName} ${c.email}`.toLowerCase().includes(q))out.push({type:"Client",label:c.businessName,meta:c.email})});
    data.recentMessages.forEach(m=>{if(`${m.clientName} ${m.body}`.toLowerCase().includes(q))out.push({type:"Message",label:m.clientName,meta:m.body,projectId:m.projectId})});
    data.recentFiles.forEach(f=>{if(`${f.clientName} ${f.filename}`.toLowerCase().includes(q))out.push({type:"File",label:f.filename,meta:f.clientName,projectId:f.projectId})});
    return out.slice(0,8);
  },[data,search]);

  // The client side clears its unread count when a thread loads. This is the
  // admin half, which was missing: without it `read_at` stayed null on every
  // client message and the bell badge could only ever climb — the same phantom
  // count the read-receipt migration exists to stop.
  //
  // Opening a message from the list is the read signal. Merely rendering the
  // dashboard is not, even though it shows a body preview: clearing on load
  // would empty the badge every time and make it mean nothing.
  const markRead=useCallback(async(projectId:string)=>{
    if(!projectId)return;
    try{
      const r=await fetch("/api/portal/messages",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({projectId})});
      const p=await r.json().catch(()=>null) as {marked?:number}|null;
      if(p?.marked)await load();
    }catch{/* Read receipts are a convenience; never surface a failure here. */}
  },[load]);

  function open(m:Exclude<Modal,null>,project=""){
    setQuick(false);
    setChangeItem(null);
    setModalProject(project||selected||data?.projects[0]?.id||"");
    setModal(m);
    // Only when a specific message was clicked — the quick-add compose box
    // arrives here with no project and has read nothing.
    if(m==="message"&&project)void markRead(project);
  }

  async function action(url:string,options:RequestInit){
    setBusy(true);setError("");setNotice("");
    try{
      const r=await fetch(url,options);
      const p=await r.json().catch(()=>null) as {error?:string;message?:string}|null;
      if(!r.ok)throw new Error(p?.error||"Action failed.");
      if(p?.message)setNotice(p.message);
      await load();
      return true;
    }catch(e){
      setError(e instanceof Error?e.message:"Action failed.");
      return false;
    }finally{setBusy(false)}
  }

  async function needAction(n:Need){
    if(n.kind==="time_checkin"){open("time",n.projectId);return}
    await action(n.kind==="onboarding"?"/api/portal/admin/checklist":"/api/portal/admin/needs",{
      method:"PATCH",headers:{"Content-Type":"application/json"},
      body:JSON.stringify(n.kind==="onboarding"?{itemId:n.itemId,action:"nudge"}:{kind:n.kind==="invoice"?"invoice_reminder":"nudge_client",projectId:n.projectId,invoiceId:n.invoiceId})
    });
  }

  const checklistAction=(i:Item,a:"accept"|"nudge"|"not_applicable"|"restore")=>action("/api/portal/admin/checklist",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({itemId:i.id,action:a})});
  async function removeItem(i:Item){if(confirm(`Remove “${i.name}” from this project checklist?`))await action(`/api/portal/admin/checklist?itemId=${encodeURIComponent(i.id)}`,{method:"DELETE"})}
  async function resendInvite(id:string){await action("/api/portal/admin/invite/resend",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({clientId:id})})}
  async function markCheckin(p:NonNullable<Progress>){await action("/api/portal/admin/time",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({mode:"checkin",projectId:p.projectId,hoursMark:p.nextMark})})}

  async function download(f:FileRow){
    const r=await fetch(`/api/portal/files?fileId=${encodeURIComponent(f.id)}`);
    if(!r.ok){setError("Could not prepare that download.");return}
    const p=await r.json() as {url:string};
    window.open(p.url,"_blank","noopener,noreferrer");
  }

  async function upload(file:File){
    const projectId=selected||data?.projects[0]?.id||"";
    if(!projectId){setError("Create a project before uploading files.");return}
    setBusy(true);
    const form=new FormData();form.append("projectId",projectId);form.append("kind","deliverable");form.append("file",file);
    try{
      const r=await fetch("/api/portal/files",{method:"POST",body:form});
      const p=await r.json().catch(()=>null) as {error?:string}|null;
      if(!r.ok)throw new Error(p?.error||"Upload failed.");
      setNotice(`${file.name} uploaded.`);await load();
    }catch(e){setError(e instanceof Error?e.message:"Upload failed.")}
    finally{setBusy(false);if(fileRef.current)fileRef.current.value=""}
  }

  async function submit(e:FormEvent<HTMLFormElement>){
    e.preventDefault();if(!modal||busy)return;
    const f=new FormData(e.currentTarget);
    let url="",method="POST";let body:Record<string,unknown>={};
    if(modal==="client"){url="/api/portal/admin/invite";body={name:f.get("name"),email:f.get("email"),businessName:f.get("businessName"),phone:f.get("phone"),projectName:f.get("projectName")}}
    if(modal==="project"){url="/api/portal/admin/project";body={clientId:f.get("clientId"),name:f.get("name"),status:f.get("status")}}
    if(modal==="time"){url="/api/portal/admin/time";body={mode:"entry",projectId:f.get("projectId"),date:f.get("date"),phase:f.get("phase"),description:f.get("description"),hours:Number(f.get("hours"))}}
    if(modal==="message"){url="/api/portal/messages";body={projectId:f.get("projectId"),body:f.get("body")}}
    if(modal==="changes"&&changeItem){url="/api/portal/admin/checklist";method="PATCH";body={itemId:changeItem.id,action:"request_changes",note:f.get("note")}}
    if(modal==="addItem"){url="/api/portal/admin/checklist";body={projectId:f.get("projectId"),name:f.get("name"),itemType:f.get("itemType")}}
    if(!url)return;
    setBusy(true);
    try{
      const r=await fetch(url,{method,headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});
      const p=await r.json().catch(()=>null) as {error?:string;message?:string;project?:{id?:string}}|null;
      if(!r.ok)throw new Error(p?.error||"Save failed.");
      if(p?.project?.id)setSelected(p.project.id);
      setNotice(p?.message||"Saved.");setModal(null);setChangeItem(null);await load();
    }catch(e){setError(e instanceof Error?e.message:"Save failed.")}
    finally{setBusy(false)}
  }

  function selectProject(id:string){setSelected(id);document.getElementById("onboarding")?.scrollIntoView({behavior:"smooth",block:"start"})}
  function chooseResult(id?:string){if(id)selectProject(id);setSearch("");setSearchOpen(false)}

  if(loading&&!data)return <main className={s.loading}><span>KS</span><i/><p>Loading admin workspace…</p></main>;

  return <main className={s.shell} id="dashboard">
    <button className={s.mobileNav} onClick={()=>setDrawer(x=>!x)} aria-label="Open portal navigation" aria-expanded={drawer}><span/><span/></button>
    <aside className={`${s.nav} ${drawer?s.navOpen:""}`}><a className={s.brand} href="/"><span>KS</span><b>Stringham<br/>Web Design</b></a><nav aria-label="Admin portal">{NAV.map(([label,icon,href],i)=><a key={label} href={href} className={i===0?s.activeNav:""} onClick={()=>setDrawer(false)}><Glyph name={icon}/><span>{label}</span>{label==="Messages"&&(data?.unreadCount||0)>0?<i className={s.dot} aria-label={`${data?.unreadCount} unread messages`}/>:null}</a>)}</nav></aside>
    {drawer?<button className={s.scrim} aria-label="Close navigation" onClick={()=>setDrawer(false)}/>:null}
    <div className={s.frame}>
      <header className={s.top}>
        <div className={s.search}><Glyph name="search"/><input ref={searchRef} value={search} placeholder="Search clients, projects, messages, files…" aria-label="Search portal" onChange={e=>{setSearch(e.target.value);setSearchOpen(!!e.target.value.trim())}} onFocus={()=>setSearchOpen(!!search.trim())}/><kbd>⌘ K</kbd>{searchOpen?<div className={s.results}>{results.length?results.map((r,i)=><button type="button" key={`${r.type}-${i}`} onClick={()=>chooseResult(r.projectId)}><span>{r.label}</span><small>{r.type} · {r.meta}</small></button>):<p>No matches yet.</p>}</div>:null}</div>
        <div className={s.topActions}><div className={s.quick}><button type="button" onClick={()=>setQuick(x=>!x)} aria-expanded={quick}><Glyph name="plus"/>Quick add</button>{quick?<div>{(["client","project","time","message"] as const).map((m,i)=><button type="button" key={m} onClick={()=>open(m)}>{["Add new client","Create project","Log time","Send message"][i]}</button>)}</div>:null}</div><a className={s.bell} href="#needs-you" aria-label={`${data?.unreadCount||0} unread notifications`}><Glyph name="bell"/>{(data?.unreadCount||0)>0?<i/>:null}</a><details className={s.identity}><summary><span>{user.name.split(/\s+/).slice(0,2).map(x=>x[0]).join("")}</span><b>{user.name}<small>Admin</small></b><span>⌄</span></summary><div><small>{user.email}</small><button type="button" onClick={()=>onLogout()}>Sign out</button></div></details></div>
      </header>
      {notice?<div className={s.notice} role="status">{notice}</div>:null}{error?<div className={s.error} role="alert">{error}</div>:null}
      <div className={s.layout}><AdminMain data={data} checklist={checklist} selected={selected} busy={busy} onSelect={selectProject} onNeed={needAction} onOpen={open} onChecklist={checklistAction} onChanges={i=>{setChangeItem(i);setModalProject(i.projectId);setModal("changes")}} onRemove={removeItem} onAddItem={id=>{setModalProject(id);setModal("addItem")}} onCheckin={markCheckin}/><AdminSide data={data} busy={busy} onOpen={open} onInvite={resendInvite} onDownload={download} onUpload={()=>fileRef.current?.click()}/></div>
      <input ref={fileRef} className={s.hidden} type="file" onChange={e=>{const f=e.target.files?.[0];if(f)upload(f)}}/>
    </div>
    {modal?<AdminModal modal={modal} data={data} busy={busy} projectId={modalProject} changeItem={changeItem} onSubmit={submit} onClose={()=>setModal(null)}/>:null}
  </main>
}
