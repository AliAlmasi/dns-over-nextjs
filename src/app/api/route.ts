import { NextRequest } from "next/server";
import { handleDnsQuery } from "./modules";

export async function POST(req: NextRequest) {
  try {
    const buf = Buffer.from(await req.arrayBuffer());
    const respBuf = await handleDnsQuery(buf);
    return new Response(new Uint8Array(respBuf), {
      status: 200,
      headers: { "Content-Type": "application/dns-message" },
    });
  } catch (err) {
    console.error("POST error:", err);
    return new Response("Invalid DNS query", { status: 400 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const domain = url.searchParams.get("domain");
    const isHelp: boolean = url.searchParams.has("help");

    if (!domain || domain.trim() === "")
      return new Response(null, {
        status: 307,
        headers: {
          Location: "/",
        },
      });

    if (isHelp) return new Response("Help is comming", { status: 200 });

    const queryPacket = {
      type: "query" as const,
      id: Math.floor(Math.random() * 65535),
      flags: 256,
      questions: [{ type: "A" as const, name: domain }],
    };

    const buf = Buffer.from(require("dns-packet").encode(queryPacket));
    const respBuf = await handleDnsQuery(buf);

    return new Response(new Uint8Array(respBuf), {
      status: 200,
      headers: { "Content-Type": "application/dns-message" },
    });
  } catch (err) {
    console.error("GET error:", err);
    return new Response("Invalid DNS query", { status: 400 });
  }
}
