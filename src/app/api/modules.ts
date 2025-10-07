// src/app/api/modules.ts
import { promises as dns } from "dns";
import { encode, decode, Packet } from "dns-packet";

export async function handleDnsQuery(
  input: Buffer | ArrayBuffer | Uint8Array
): Promise<Buffer> {
  let buf: Buffer;

  if (Buffer.isBuffer(input)) {
    buf = input;
  } else if (input instanceof ArrayBuffer) {
    buf = Buffer.from(input);
  } else if (input instanceof Uint8Array) {
    buf = Buffer.from(input.buffer, input.byteOffset, input.byteLength);
  } else {
    throw new Error("Invalid input type");
  }

  const query = decode(buf) as Packet;
  const question = query.questions?.at(0);
  if (!question) throw new Error("No DNS question found");
  let answers: Packet["answers"] = [];

  try {
    if (question.type === "A") {
      const ips = await dns.resolve4(question.name);
      answers = ips.map((ip) => ({
        type: "A",
        name: question.name,
        ttl: 60,
        class: "IN",
        data: ip,
      }));
    } else if (question.type === "AAAA") {
      const ips = await dns.resolve6(question.name);
      answers = ips.map((ip) => ({
        type: "AAAA",
        name: question.name,
        ttl: 60,
        class: "IN",
        data: ip,
      }));
    }
  } catch {
    answers = [];
  }

  const response: Packet = {
    id: query.id,
    type: "response",
    flags: (query.flags ?? 0) | 0x8000,
    questions: query.questions,
    answers,
  };

  return encode(response); // Node Buffer
}
