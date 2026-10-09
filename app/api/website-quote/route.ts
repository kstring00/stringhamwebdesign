import { NextRequest, NextResponse } from "next/server";
import { clean, clientIp, deliver, isEmail, rateLimited } from "@/app/lib/inbox";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const native = !(request.headers.get("content-type") || "").includes("application/json");
  const reply = (status: number, data: {ok?: boolean; error?: string}) => {
    if (!native) return NextResponse.json(data, {status});
    const url = new URL("/websites", request.url);
    url.searchParams.set(data.ok ? "sent" : "error", data.ok ? "1" : status === 429 ? "busy" : status === 502 ? "send" : "fields");
    url.hash = "website-quote";
    return NextResponse.redirect(url, 303);
  };
  if (rateLimited(`website-quote:${clientIp(request.headers)}`)) return reply(429, {error: "Too many requests. Please wait a few minutes."});
  let body: Record<string, unknown>;
  try {
    body = native ? Object.fromEntries((await request.formData()).entries()) : await request.json();
    if (!body || typeof body !== "object" || Array.isArray(body)) return reply(400, {error: "Invalid request."});
  } catch { return reply(400, {error: "Invalid request."}); }
  if (clean(body.website, 50)) return reply(200, {ok:true}); // honeypot
  const name=clean(body.name,100), business=clean(body.business,120), town=clean(body.town,80);
  const email=clean(body.email,180), phone=clean(body.phone,30), current=clean(body.current_site,200), goals=clean(body.goals,1000);
  if (name.length<2 || business.length<2 || town.length<2 || (!isEmail(email) && phone.replace(/\D/g,"").length<7) || (email && !isEmail(email))) return reply(400,{error:"Please include your name, business, town and a valid email or phone."});
  const text=[
    "Website quote request",`Name: ${name}`,`Business: ${business}`,`Town: ${town}`,
    `Phone: ${phone || "(not supplied)"}`,`Email: ${email || "(not supplied)"}`,
    `Current site: ${current || "(not supplied)"}`,`Goals: ${goals || "(not supplied)"}`,
    `Received: ${new Date().toISOString()}`
  ].join("\n");
  const result=await deliver({subject:`Website quote: ${business} (${name})`,text,replyTo: email || undefined,label:"website quote request"});
  if(!result.ok || !result.sent) return reply(502,{error:"Unable to confirm delivery. Please contact Kyle directly."});
  return reply(200,{ok:true});
}
