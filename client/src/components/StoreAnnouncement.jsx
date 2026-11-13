import { useEffect, useState } from "react";
export default function StoreAnnouncement() {
  const [message, setMessage] = useState("");
  useEffect(() => { const controller = new AbortController(); fetch(`${import.meta.env.VITE_API_URL}/api/settings`, { signal: controller.signal }).then(r => r.ok ? r.json() : null).then(s => setMessage(s?.announcement || "")).catch(() => {}); return () => controller.abort(); }, []);
  return message ? <div className="store-announcement">{message}</div> : null;
}
