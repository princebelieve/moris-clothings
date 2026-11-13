import { MessageCircle } from "lucide-react";
const number = String(import.meta.env.VITE_WHATSAPP_NUMBER || "").replace(/\D/g, "");
export default function WhatsAppButton() { return number ? <a className="whatsapp-float" href={`https://wa.me/${number}?text=${encodeURIComponent("Hello Moris Clothing, I would like to ask about a piece.")}`} target="_blank" rel="noreferrer" aria-label="Chat with Moris Clothing on WhatsApp"><MessageCircle size={23} /></a> : null; }
