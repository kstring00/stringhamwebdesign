import { NextResponse } from "next/server";

import { adminRest, getPortalSession } from "../../../../lib/portalSupabase";

type ProjectRow = { id:string; client_id:string; name:string; slug:string; status:string; quoted_total:number|null; started_at:string|null; launched_at:string|null; created_at:string; updated_at:string };
type ClientRow = { id:string; user_id:string; business_name:string; contact_name:string; invited_at:string|null; invite_last_sent_at:string|null };
type UserRow = { id:string; email:string; role:"admin"|"client"; name:string };
type MessageRow = { id:string; project_id:string; sender_id:string; body:string; created_at:string; read_at:string|null };
type FileRow = { id:string; project_id:string; uploaded_by:string; filename:string; kind:string; created_at:string };
type TimeRow = { id:string; project_id:string; date:string; phase:string; description:string; hours:number; created_at:string };
type InvoiceRow = { id:string; project_id:string; amount:number; status:string; stripe_invoice_id:string|null; due_at:string|null; paid_at:string|null; created_at:string };
type ChecklistRow = { id:string; project_id:string; name:string; item_type:"file"|"text"|"link"|"confirm"; status:"pending"|"submitted"|"accepted"|"needs_changes"|"not_applicable"; note:string|null; value:string|null; position:number; submitted_at:string|null; reviewed_at:string|null; accepted_at:string|null; updated_at:string };
type CheckinRow = { id:string; project_id:string; hours_mark:number; sent_at:string };

const DAY=86400000;
const ACTIVE_STATUSES=new Set(["consultation","plan_quote","build","launch"]);
const UNPAID_STATUSES=new Set(["open","past_due"]);
function asDate(value:string|null|undefined){ if(!value)return null; const date=new Date(value); return Number.isNaN(date.getTime())?null:date; }
function daysSince(value:string){ const date=asDate(value); return date?Math.max(0,Math.floor((Date.now()-date.getTime())/DAY)):0; }
function latestDate(values:Array<string|null|undefined>){ let latest:Date|null=null; for(const value of values){const date=asDate(value); if(date&&(!latest||date>latest))latest=date;} return latest?.toISOString()??null; }
function invoiceLabel(invoice:InvoiceRow){ if(invoice.stripe_invoice_id){const digits=invoice.stripe_invoice_id.match(/\d+/g)?.join(""); if(digits)return `#${digits.slice(-6)}`;} return `#${invoice.id.replaceAll("-","").slice(0,6).toUpperCase()}`; }

export async function GET(){
  const session=await getPortalSession();
  if(!session)return NextResponse.json({error:"Unauthorized."},{status:401});
  if(session.profile.role!=="admin")return NextResponse.json({error:"Admin access required."},{status:403});
  try{
    const [projects,clients,users,messages,files,timeEntries,invoices,checklistItems,checkins]=await Promise.all([
      adminRest<ProjectRow[]>("projects?select=id,client_id,name,slug,status,quoted_total,started_at,launched_at,created_at,updated_at&order=created_at.desc"),
      adminRest<ClientRow[]>("clients?select=id,user_id,business_name,contact_name,invited_at,invite_last_sent_at&order=business_name.asc"),
      adminRest<UserRow[]>("users?select=id,email,role,name"),
      adminRest<MessageRow[]>("messages?select=id,project_id,sender_id,body,created_at,read_at&order=created_at.desc&limit=200"),
      adminRest<FileRow[]>("files?select=id,project_id,uploaded_by,filename,kind,created_at&order=created_at.desc&limit=200"),
      adminRest<TimeRow[]>("time_entries?select=id,project_id,date,phase,description,hours,created_at&order=date.desc,created_at.desc&limit=500"),
      adminRest<InvoiceRow[]>("invoices?select=id,project_id,amount,status,stripe_invoice_id,due_at,paid_at,created_at&order=created_at.desc"),
      adminRest<ChecklistRow[]>("project_onboarding_items?select=id,project_id,name,item_type,status,note,value,position,submitted_at,reviewed_at,accepted_at,updated_at&order=position.asc,created_at.asc"),
      adminRest<CheckinRow[]>("time_checkins?select=id,project_id,hours_mark,sent_at&order=hours_mark.desc"),
    ]);
    const userById=new Map<string,UserRow>(users.map(u=>[u.id,u] as [string,UserRow]));
    const clientById=new Map<string,ClientRow>(clients.map(c=>[c.id,c] as [string,ClientRow]));
    const projectById=new Map<string,ProjectRow>(projects.map(p=>[p.id,p] as [string,ProjectRow]));
    const activeProjects=projects.filter(p=>ACTIVE_STATUSES.has(p.status));
    const messagesByProject=new Map<string,MessageRow[]>(), filesByProject=new Map<string,FileRow[]>(), timeByProject=new Map<string,TimeRow[]>(), invoicesByProject=new Map<string,InvoiceRow[]>(), checklistByProject=new Map<string,ChecklistRow[]>(), checkinsByProject=new Map<string,CheckinRow[]>();
    for(const row of messages)messagesByProject.set(row.project_id,[...(messagesByProject.get(row.project_id)??[]),row]);
    for(const row of files)filesByProject.set(row.project_id,[...(filesByProject.get(row.project_id)??[]),row]);
    for(const row of timeEntries)timeByProject.set(row.project_id,[...(timeByProject.get(row.project_id)??[]),row]);
    for(const row of invoices)invoicesByProject.set(row.project_id,[...(invoicesByProject.get(row.project_id)??[]),row]);
    for(const row of checklistItems)checklistByProject.set(row.project_id,[...(checklistByProject.get(row.project_id)??[]),row]);
    for(const row of checkins)checkinsByProject.set(row.project_id,[...(checkinsByProject.get(row.project_id)??[]),row]);

    const checklists=activeProjects.map(project=>{
      const rows=checklistByProject.get(project.id)??[];
      const total=rows.filter(i=>i.status!=="not_applicable").length;
      const complete=rows.filter(i=>i.status==="accepted").length;
      const client=clientById.get(project.client_id);
      return {projectId:project.id,projectName:project.name,clientName:client?.business_name??"Client",complete,total,percent:total?Math.round(complete/total*100):0,items:rows.map(i=>({id:i.id,projectId:i.project_id,name:i.name,itemType:i.item_type,status:i.status,note:i.note,value:i.value,position:i.position,submittedAt:i.submitted_at,reviewedAt:i.reviewed_at,acceptedAt:i.accepted_at,updatedAt:i.updated_at}))};
    });
    const checklistSummary=new Map<string,(typeof checklists)[number]>(checklists.map(i=>[i.projectId,i] as [string,(typeof checklists)[number]]));
    const hoursByProject=new Map<string,number>(); for(const e of timeEntries)hoursByProject.set(e.project_id,(hoursByProject.get(e.project_id)??0)+Number(e.hours));
    const unpaidByProject=new Map<string,number>(); for(const invoice of invoices)if(UNPAID_STATUSES.has(invoice.status))unpaidByProject.set(invoice.project_id,(unpaidByProject.get(invoice.project_id)??0)+Number(invoice.amount));
    const projectSummaries=activeProjects.map(project=>{
      const client=clientById.get(project.client_id), clientUser=client?userById.get(client.user_id):undefined;
      const pm=messagesByProject.get(project.id)??[], pf=filesByProject.get(project.id)??[], pt=timeByProject.get(project.id)??[], pc=checklistByProject.get(project.id)??[];
      const lastActivity=latestDate([project.updated_at,pm[0]?.created_at,pf[0]?.created_at,pt[0]?.created_at||pt[0]?.date,latestDate(pc.map(i=>i.updated_at))]);
      const checklist=checklistSummary.get(project.id);
      return {id:project.id,clientId:project.client_id,clientName:client?.business_name??"Client",clientEmail:clientUser?.email??"",name:project.name,slug:project.slug,phase:project.status,onboardingComplete:checklist?.complete??0,onboardingTotal:checklist?.total??0,onboardingPercent:checklist?.percent??0,hoursLogged:hoursByProject.get(project.id)??0,amountDue:unpaidByProject.get(project.id)??0,lastActivity};
    });

    const needs:Array<{id:string;kind:"stale_message"|"onboarding"|"invoice"|"time_checkin";projectId:string;title:string;evidence:string;actionLabel:string;itemId?:string;invoiceId?:string;nextMark?:number}>=[];
    for(const project of activeProjects){
      const client=clientById.get(project.client_id), clientName=client?.business_name??"Client", clientUserId=client?.user_id;
      const pm=messagesByProject.get(project.id)??[]; const inbound=clientUserId?pm.find(m=>m.sender_id===clientUserId):undefined;
      if(inbound){const age=daysSince(inbound.created_at); if(age>4)needs.push({id:`stale-${project.id}`,kind:"stale_message",projectId:project.id,title:`${clientName} hasn't responded in ${age} days`,evidence:`Last inbound message ${new Date(inbound.created_at).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"})}`,actionLabel:"Nudge"});}
      const checklist=checklistSummary.get(project.id), pending=checklist?.items.find(i=>i.status==="pending"||i.status==="needs_changes");
      if(checklist&&pending)needs.push({id:`onboarding-${pending.id}`,kind:"onboarding",projectId:project.id,itemId:pending.id,title:`Onboarding checklist ${checklist.complete}/${checklist.total} — waiting on ${pending.name.toLowerCase()}`,evidence:pending.status==="needs_changes"&&pending.note?pending.note:`Updated ${new Date(pending.updatedAt).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"})}`,actionLabel:"Remind"});
      for(const invoice of invoicesByProject.get(project.id)??[]){if(!invoice.due_at||!UNPAID_STATUSES.has(invoice.status))continue; const due=asDate(invoice.due_at); if(!due||due.getTime()>=Date.now())continue; const overdue=Math.max(1,Math.floor((Date.now()-due.getTime())/DAY)); needs.push({id:`invoice-${invoice.id}`,kind:"invoice",projectId:project.id,invoiceId:invoice.id,title:`Invoice ${invoiceLabel(invoice)} overdue ${overdue} ${overdue===1?"day":"days"}`,evidence:`${clientName} · ${new Intl.NumberFormat("en-US",{style:"currency",currency:"USD",maximumFractionDigits:0}).format(Number(invoice.amount))}`,actionLabel:"Send"});}
      const totalHours=hoursByProject.get(project.id)??0, lastCheckin=(checkinsByProject.get(project.id)??[]).reduce((m,i)=>Math.max(m,Number(i.hours_mark)),0), nextMark=lastCheckin+10, sinceLast=Math.max(0,totalHours-lastCheckin);
      if(sinceLast>=9)needs.push({id:`checkin-${project.id}-${nextMark}`,kind:"time_checkin",projectId:project.id,nextMark,title:`You're at ${totalHours.toFixed(1)} hrs — check-in due at ${nextMark.toFixed(0)}`,evidence:clientName,actionLabel:"Log"});
    }

    const now=new Date(), prefix=`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}`;
    const hoursThisMonth=timeEntries.filter(e=>e.date.startsWith(prefix)).reduce((s,e)=>s+Number(e.hours),0);
    const outstanding=invoices.filter(i=>UNPAID_STATUSES.has(i.status)).reduce((s,i)=>s+Number(i.amount),0);
    const activeIds=new Set(activeProjects.map(p=>p.id));
    const awaitingClientItems=checklistItems.filter(i=>activeIds.has(i.project_id)&&(i.status==="pending"||i.status==="needs_changes")).length;
    const enrichedTime=timeEntries.slice(0,8).map(e=>{const p=projectById.get(e.project_id),c=p?clientById.get(p.client_id):undefined; return {id:e.id,projectId:e.project_id,clientName:c?.business_name??"Client",projectName:p?.name??"Project",date:e.date,phase:e.phase,description:e.description,hours:Number(e.hours)};});
    const recentMessages=messages.slice(0,12).map(m=>{const p=projectById.get(m.project_id),c=p?clientById.get(p.client_id):undefined,s=userById.get(m.sender_id); return {id:m.id,projectId:m.project_id,clientName:c?.business_name??"Client",senderName:s?.name??"Portal user",body:m.body,createdAt:m.created_at,unread:s?.role==="client"&&!m.read_at};});
    const recentFiles=files.slice(0,12).map(f=>{const p=projectById.get(f.project_id),c=p?clientById.get(p.client_id):undefined; return {id:f.id,projectId:f.project_id,clientName:c?.business_name??"Client",filename:f.filename,kind:f.kind,createdAt:f.created_at};});
    const invites=clients.map(c=>({id:c.id,businessName:c.business_name,contactName:c.contact_name,email:userById.get(c.user_id)?.email??"",invitedAt:c.invited_at,inviteLastSentAt:c.invite_last_sent_at}));
    const progressCandidates=activeProjects.map(p=>{const totalHours=hoursByProject.get(p.id)??0,last=(checkinsByProject.get(p.id)??[]).reduce((m,i)=>Math.max(m,Number(i.hours_mark)),0),since=Math.max(0,totalHours-last),next=last+10,c=clientById.get(p.client_id); return {projectId:p.id,clientName:c?.business_name??"Client",totalHours,sinceLastCheckin:since,nextMark:next,percent:Math.min(100,Math.round(since/10*100)),due:since>=10};}).sort((a,b)=>b.percent-a.percent);
    return NextResponse.json({user:{id:session.profile.id,email:session.profile.email,name:session.profile.name},metrics:{activeProjects:activeProjects.length,hoursThisMonth,outstanding,awaitingClientItems},needs,projects:projectSummaries,checklists,recentTimeEntries:enrichedTime,recentMessages,recentFiles,invites,clients:clients.map(c=>({id:c.id,businessName:c.business_name,email:userById.get(c.user_id)?.email??""})),unreadCount:messages.filter(m=>userById.get(m.sender_id)?.role==="client"&&!m.read_at).length,checkinProgress:progressCandidates[0]??null});
  }catch(error){console.error("Admin dashboard load failed",error); return NextResponse.json({error:"The admin dashboard could not be loaded."},{status:500});}
}
