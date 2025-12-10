"use client";

import { useState } from "react";

async function getIp(domain: string) {
  if (!domain) throw new Error("no domain specified");

  const res: {
    status: string;
    data: { answers: Array<{ data: string }> };
  } = await (await fetch(`/api?domain=${domain}`)).json();

  if (res.status === "ok") return res.data.answers;
  else throw new Error("fetch response not ok");
}

export default function Home() {
  const [ips, setIps] = useState<Array<{ data: string }>>([]);

  const fetchData = async () => {
    const input = (document.getElementById("dinput") as HTMLInputElement).value;
    try {
      const answers = await getIp(input);
      setIps(answers);
    } catch (error) {
      alert("Error. See console for details.");
      console.error(error);
    }
  };

  return (
    <main>
      <input
        type="text"
        id="dinput"
        onKeyDown={(e) => (e.key === "Enter" ? fetchData() : null)}
        placeholder="one.one.one.one"
      />
      <button onClick={fetchData}>Go</button>
      <p id="ips">{ips.map((ip) => ip.data).join(" / ")}</p>
    </main>
  );
}
