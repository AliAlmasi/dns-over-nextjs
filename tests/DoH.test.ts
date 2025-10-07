import { POST, GET } from "../src/app/api/route";
import { encode, decode, RecordType, Packet } from "dns-packet";

class MockNextRequest {
  constructor(public url: string, private body?: Buffer) {}
  async arrayBuffer() {
    return (
      this.body?.buffer.slice(
        this.body.byteOffset,
        this.body.byteOffset + this.body.byteLength
      ) ?? new ArrayBuffer(0)
    );
  }
}

describe("DoH API Route", () => {
  it("resolves A record via POST", async () => {
    const queryPacket = {
      type: "query" as const,
      id: 1234,
      flags: 256,
      questions: [{ type: "A" as RecordType, name: "example.com" }],
    };

    const buf = Buffer.from(encode(queryPacket));
    const req = new MockNextRequest("http://localhost/api/route", buf);
    const res = await POST(req as any);

    expect(res.status).toBe(200);
    const respBuf = Buffer.from(await res.arrayBuffer());
    const resp = decode(respBuf) as Packet;
    const answers = resp.answers ?? [];
    expect(answers.length).toBeGreaterThan(0);
  });

  it("resolves A record via GET", async () => {
    const req = new MockNextRequest(
      "http://localhost/api/route?domain=example.com"
    );
    const res = await GET(req as any);

    expect(res.status).toBe(200);
    const respBuf = Buffer.from(await res.arrayBuffer());
    const resp = decode(respBuf) as Packet;
    const answers = resp.answers ?? [];
    expect(answers.length).toBeGreaterThan(0);
  });
});
