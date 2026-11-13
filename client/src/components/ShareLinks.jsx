import { useState } from "react";
import { Copy, MessageCircle, Share2 } from "lucide-react";

export default function ShareLinks({ title = "Moris Clothing" }) {
  const [copied, setCopied] = useState(false);
  const url = typeof window === "undefined" ? "https://morisclothing.co.uk" : window.location.href;
  const text = encodeURIComponent(`${title} — ${url}`);
  async function copy() { try { await navigator.clipboard.writeText(url); setCopied(true); window.setTimeout(() => setCopied(false), 1800); } catch { setCopied(false); } }
  return <div className="share-links"><span><Share2 size={16} /> Share this piece</span><a href={`https://wa.me/?text=${text}`} target="_blank" rel="noreferrer"><MessageCircle size={16} /> WhatsApp</a><button type="button" onClick={copy}><Copy size={16} /> {copied ? "Link copied" : "Copy link"}</button></div>;
}
