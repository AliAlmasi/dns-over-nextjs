"use client";

import { useRef, useState } from "react";

type Answer = { data: string };

async function getIp(domain: string): Promise<Answer[]> {
  if (!domain) throw new Error("No domain specified");

  const resp = await fetch(`/api?domain=${encodeURIComponent(domain)}`);
  if (!resp.ok) throw new Error(`No result found`);

  const json: {
    status: string;
    data?: { answers?: Answer[] };
  } = await resp.json();

  if (json.status === "ok" && json.data?.answers) return json.data.answers;
  throw new Error("Fetch response not ok");
}

export default function Home() {
  const [ips, setIps] = useState<Answer[]>([]);
  const [showIp, setShowIp] = useState(false);
  const [loading, setLoading] = useState(false);
  const dinput = useRef<HTMLInputElement | null>(null);

  const fetchData = async () => {
    if (!loading) {
      const domain = dinput.current?.value?.trim() || "";
      if (!domain) {
        alert("Please enter a domain");
        return;
      }

      try {
        setLoading(true);
        const answers = await getIp(domain);
        setIps(answers);
        setShowIp(true);
      } catch (error) {
        alert(`${(error as Error).message}.`);
        console.error(error);
      } finally {
        setLoading(false);
      }
    } else return;
  };

  return (
    <main>
      <h2>Enter a domain:</h2>
      <input
        ref={dinput}
        id="dinput"
        onKeyDown={(e) => (e.key === "Enter" ? fetchData() : null)}
        onChange={() => {
          if (showIp) setTimeout(() => setShowIp(false), 1000);
        }}
        placeholder="example.com"
      />
      <button onClick={fetchData} disabled={loading}>
        {loading ? "Looking up..." : "Go"}
      </button>
      {showIp ? <p id="ips">{ips.map((ip) => ip.data).join(" / ")}</p> : null}
    </main>
  );
}
