import type { Item } from "./adminTypes";
export type GlyphName="home"|"clients"|"projects"|"time"|"messages"|"files"|"settings"|"search"|"plus"|"bell"|"folder"|"money"|"people"|"upload"|"check"|"warn"|"pending"|"review"|"menu"|"open";
// Drawn as paths rather than unicode: the sidebar font has no glyph for several of
// the characters this used to rely on, so Clients, Messages and Files all fell back
// to tofu boxes and read as the same icon.
const G:Record<GlyphName,string>={
  home:"M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z",
  clients:"M12 11.6a3.6 3.6 0 110-7.2 3.6 3.6 0 010 7.2M4.8 20c0-3.6 3.2-5.6 7.2-5.6s7.2 2 7.2 5.6",
  projects:"M4 8h16v11H4zM9 8V6a1.5 1.5 0 011.5-1.5h3A1.5 1.5 0 0115 6v2M4 12.8h16",
  time:"M20 12a8 8 0 11-16 0 8 8 0 0116 0M12 7.4V12l3.1 1.9",
  messages:"M20 15.4a1.6 1.6 0 01-1.6 1.6H9l-4.4 3.4V5.6A1.6 1.6 0 016.2 4h12.2A1.6 1.6 0 0120 5.6z",
  files:"M13.6 3.5H7A1.5 1.5 0 005.5 5v14A1.5 1.5 0 007 20.5h10a1.5 1.5 0 001.5-1.5V8.4zM13.6 3.5v4.9h4.9",
  settings:"M4 7.2h16M4 12h16M4 16.8h16M10.4 7.2a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0M17.6 12a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0M10.4 16.8a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0",
  search:"M17 11a6 6 0 11-12 0 6 6 0 0112 0M15.4 15.4L20.2 20.2",
  plus:"M12 5v14M5 12h14",
  bell:"M18 9.2a6 6 0 10-12 0c0 5.4-2 6.6-2 6.6h16s-2-1.2-2-6.6M10.2 19.4a2.2 2.2 0 003.6 0",
  folder:"M3.6 6.6A1.6 1.6 0 015.2 5h3.9l2 2.6h7.7a1.6 1.6 0 011.6 1.6v8.8a1.6 1.6 0 01-1.6 1.6H5.2a1.6 1.6 0 01-1.6-1.6z",
  money:"M12 3.6v16.8M16 7.9c0-1.9-1.8-3-4-3s-4 1.1-4 3 1.8 2.8 4 3.5 4 1.6 4 3.5-1.8 3-4 3-4-1.1-4-3",
  people:"M9.6 11.2a3.1 3.1 0 110-6.2 3.1 3.1 0 010 6.2M3 19.8c0-3.2 2.9-5 6.6-5s6.6 1.8 6.6 5M16.2 5.5a3.1 3.1 0 010 6.1M17.7 14.9c2.2.6 3.3 2.2 3.3 4.4",
  upload:"M12 15.4V4.2M8 8.2l4-4 4 4M4.6 15.4V19A1.5 1.5 0 006.1 20.5h11.8A1.5 1.5 0 0019.4 19v-3.6",
  check:"M5 12.6l4.5 4.5L19 7.4",
  warn:"M12 4.4L21 19.6H3zM12 10v4.1M12 17.2v.2",
  pending:"M20 12a8 8 0 11-16 0 8 8 0 0116 0",
  review:"M2.6 12S6.2 6.6 12 6.6 21.4 12 21.4 12 17.8 17.4 12 17.4 2.6 12 2.6 12M14.5 12a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0",
  menu:"M6.4 12a1.4 1.4 0 11-2.8 0 1.4 1.4 0 012.8 0M13.4 12a1.4 1.4 0 11-2.8 0 1.4 1.4 0 012.8 0M20.4 12a1.4 1.4 0 11-2.8 0 1.4 1.4 0 012.8 0",
  // Rows that open something get a chevron. A "menu" glyph on a row with no
  // menu behind it reads as a broken control.
  open:"M9.5 5.5L16 12l-6.5 6.5",
};
export function Glyph({name}:{name:GlyphName}){return <span data-glyph aria-hidden="true"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d={G[name]}/></svg></span>}
// These are in-page anchors, not routes — every target is a section of the
// dashboard. "Settings" used to point at the Quick-actions block, which is not
// settings, so it is gone until there is a settings page to point at.
export const NAV:[string,GlyphName,string][]=[["Dashboard","home","#dashboard"],["Clients","clients","#clients"],["Projects","projects","#projects"],["Time Logs","time","#time-log"],["Messages","messages","#messages"],["Files","files","#files"]];
export const money=(n:number)=>new Intl.NumberFormat("en-US",{style:"currency",currency:"USD",maximumFractionDigits:0}).format(n||0);
/** "1 project", not "1 projects". Counts are read at a glance; the mismatch reads as a bug in the data. */
export const plural=(n:number,word:string)=>`${n} ${n===1?word:`${word}s`}`;
function parseDate(v:string){return /^\d{4}-\d{2}-\d{2}$/.test(v)?new Date(`${v}T12:00:00`):new Date(v)}
export function dateText(v:string|null,year=true){if(!v)return "No activity yet";const d=parseDate(v);if(Number.isNaN(d.getTime()))return v;return new Intl.DateTimeFormat("en-US",{month:"short",day:"numeric",...(year?{year:"numeric" as const}:{})}).format(d)}
export function phase(v:string){return ({consultation:"Consultation",plan_quote:"Plan & quote",build:"Build",launch:"Launch",complete:"Complete",paused:"Paused",archived:"Archived"} as Record<string,string>)[v]||v.replaceAll("_"," ")}
// Message bodies arrive whole. Collapse the newlines and stray whitespace a client
// may have typed, then cut to a fixed length so the panel shows a clean ellipsis
// instead of letting CSS clip the raw text mid-character.
export function preview(v:string,max=80){const t=(v??"").replace(/\s+/g," ").trim();return t.length>max?`${t.slice(0,max).trimEnd()}…`:t}
export function initials(v:string){return v.split(/\s+/).filter(Boolean).slice(0,2).map(x=>x[0]?.toUpperCase()).join("")||"CL"}
export function itemText(i:Item){if(i.status==="accepted")return "Accepted";if(i.status==="submitted")return "Submitted — needs review";if(i.status==="needs_changes")return `Needs changes${i.note?` — ${i.note}`:""}`;if(i.status==="not_applicable")return "Not applicable";return "Pending"}
export function itemStamp(i:Item){if(i.status==="pending")return "Not yet submitted";if(i.status==="accepted"&&i.acceptedAt)return `Accepted ${dateText(i.acceptedAt)}`;if(i.submittedAt)return `Submitted ${dateText(i.submittedAt)}`;return `Updated ${dateText(i.updatedAt)}`}
export function today(){const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`}
