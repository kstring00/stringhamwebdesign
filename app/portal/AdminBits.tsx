import type { Item } from "./adminTypes";
export type GlyphName="home"|"clients"|"projects"|"time"|"messages"|"files"|"settings"|"search"|"plus"|"bell"|"folder"|"money"|"people"|"upload"|"check"|"warn"|"pending"|"review"|"menu";
const G:Record<GlyphName,string>={home:"⌂",clients:"◎",projects:"▱",time:"◷",messages:"□",files:"▤",settings:"⚙",search:"⌕",plus:"＋",bell:"♢",folder:"▱",money:"$",people:"◎",upload:"⇧",check:"✓",warn:"!",pending:"○",review:"◷",menu:"•••"};
export function Glyph({name}:{name:GlyphName}){return <span data-glyph aria-hidden="true">{G[name]}</span>}
export const NAV:[string,GlyphName,string][]=[["Dashboard","home","#dashboard"],["Clients","clients","#clients"],["Projects","projects","#projects"],["Time Logs","time","#time-log"],["Messages","messages","#messages"],["Files","files","#files"],["Settings","settings","#settings"]];
export const money=(n:number)=>new Intl.NumberFormat("en-US",{style:"currency",currency:"USD",maximumFractionDigits:0}).format(n||0);
function parseDate(v:string){return /^\d{4}-\d{2}-\d{2}$/.test(v)?new Date(`${v}T12:00:00`):new Date(v)}
export function dateText(v:string|null,year=true){if(!v)return "No activity yet";const d=parseDate(v);if(Number.isNaN(d.getTime()))return v;return new Intl.DateTimeFormat("en-US",{month:"short",day:"numeric",...(year?{year:"numeric" as const}:{})}).format(d)}
export function phase(v:string){return ({consultation:"Consultation",plan_quote:"Plan & quote",build:"Build",launch:"Launch",complete:"Complete",paused:"Paused",archived:"Archived"} as Record<string,string>)[v]||v.replaceAll("_"," ")}
export function initials(v:string){return v.split(/\s+/).filter(Boolean).slice(0,2).map(x=>x[0]?.toUpperCase()).join("")||"CL"}
export function itemText(i:Item){if(i.status==="accepted")return "Accepted";if(i.status==="submitted")return "Submitted — needs review";if(i.status==="needs_changes")return `Needs changes${i.note?` — ${i.note}`:""}`;if(i.status==="not_applicable")return "Not applicable";return "Pending"}
export function itemStamp(i:Item){if(i.status==="pending")return "Not yet submitted";if(i.status==="accepted"&&i.acceptedAt)return `Accepted ${dateText(i.acceptedAt)}`;if(i.submittedAt)return `Submitted ${dateText(i.submittedAt)}`;return `Updated ${dateText(i.updatedAt)}`}
export function today(){const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`}
