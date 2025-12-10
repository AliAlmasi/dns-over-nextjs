import { NextRequest } from "next/server";
import { handleDnsQuery } from "./modules";

export async function POST(req: NextRequest) {
  try {
    const buf = Buffer.from(await req.arrayBuffer());
    const respBuf = (await handleDnsQuery(buf))[0];
    return new Response(new Uint8Array(respBuf), {
      status: 200,
      headers: { "Content-Type": "application/dns-message" },
    });
  } catch (err) {
    console.error("POST error:", err);
    return new Response(`POST error: ${err}`, { status: 400 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const domain = url.searchParams.get("domain");

    if (url.toString().endsWith("/api") || domain?.trim() === "")
      return new Response(null, {
        status: 307,
        headers: {
          Location: "/",
        },
      });

    const queryPacket = {
      type: "query" as const,
      id: Math.floor(Math.random() * 65535),
      flags: 256,
      questions: [{ type: "A" as const, name: domain }],
    };

    const buf = Buffer.from(require("dns-packet").encode(queryPacket));
    const answers = (await handleDnsQuery(buf))[1];
    if (answers?.length === 0) {
      return new Response(
        JSON.stringify(
          {
            status: "error",
            message: `No DNS records found for ${domain}`,
          },
          null,
          2,
        ),
        { status: 404 },
      );
    }

    return new Response(
      JSON.stringify({ status: "ok", data: { answers } }, null, 2),
    );
  } catch (err) {
    console.error("GET error:", err);
    return new Response(`GET error: ${err}`, { status: 400 });
  }
}
