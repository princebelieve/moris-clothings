import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { API_BASE } from "../services/apiBase";
import { readApiJson } from "../services/apiResponse";
const API = API_BASE;
export default function RecentSalesNotice() {
  const [sale, setSale] = useState(null);
  const [dismissed, setDismissed] = useState(false);
  useEffect(() => { const controller = new AbortController(); fetch(`${API}/api/orders/recent-sales`, { signal: controller.signal }).then(response => response.ok ? readApiJson(response) : null).then(data => { if (data?.name) setSale(data); }).catch(() => {}); return () => controller.abort(); }, []);
  if (!sale || dismissed) return null;
  return <aside className="recent-sale-notice" aria-live="polite"><span><strong>A Moris piece found a home</strong><small>{sale.name} · {new Date(sale.createdAt).toLocaleDateString("en-GB", { dateStyle: "medium" })}</small></span><button type="button" aria-label="Dismiss recent sale notice" onClick={() => setDismissed(true)}><X size={15} /></button></aside>;
}
