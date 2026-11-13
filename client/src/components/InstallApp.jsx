import { createContext, useContext, useEffect, useState } from "react";
import { Download } from "lucide-react";

const InstallContext = createContext(null);
const DISMISSED = "moris-install-dismissed-until";
function iosDevice() { return /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1); }
function installed() { return window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true; }

export function InstallAppProvider({ children }) {
  const [prompt, setPrompt] = useState(null);
  const [isInstalled, setInstalled] = useState(installed);
  const [ios] = useState(iosDevice);
  const [open, setOpen] = useState(false);
  const [suggestion, setSuggestion] = useState(false);
  useEffect(() => {
    const onPrompt = event => {
      event.preventDefault(); setPrompt(event);
      try { if (Date.now() >= Number(localStorage.getItem(DISMISSED) || 0)) setSuggestion(true); } catch { setSuggestion(true); }
    };
    const onInstalled = () => { setInstalled(true); setPrompt(null); setSuggestion(false); };
    window.addEventListener("beforeinstallprompt", onPrompt); window.addEventListener("appinstalled", onInstalled);
    let dismissedUntil = 0; try { dismissedUntil = Number(localStorage.getItem(DISMISSED) || 0); } catch { /* Session fallback. */ }
    const timer = window.setTimeout(() => { if (ios && !installed() && Date.now() >= dismissedUntil) setSuggestion(true); }, 7000);
    return () => { clearTimeout(timer); window.removeEventListener("beforeinstallprompt", onPrompt); window.removeEventListener("appinstalled", onInstalled); };
  }, [ios]);
  function dismiss() { setSuggestion(false); try { localStorage.setItem(DISMISSED, String(Date.now() + 7 * 86400000)); } catch { /* Only affects the current visit. */ } }
  async function install() { if (ios || !prompt) { setOpen(true); return; } await prompt.prompt(); const choice = await prompt.userChoice; if (choice?.outcome === "accepted") setSuggestion(false); setPrompt(null); }
  return <InstallContext.Provider value={{ installed: isInstalled, install, ios }}>{children}{!isInstalled && suggestion && <aside className="install-suggestion" aria-label="Install Moris Clothing"><button type="button" aria-label="Dismiss" onClick={dismiss}>×</button><strong>Keep Moris close</strong><p>Add Moris Clothing to your home screen for quick access.</p><button type="button" className="install-app-action" onClick={install}>Install app</button></aside>}{open && <div className="install-modal-backdrop" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) setOpen(false); }}><section className="install-modal" role="dialog" aria-modal="true" aria-labelledby="install-heading"><button type="button" aria-label="Close" onClick={() => setOpen(false)}>×</button><p className="eyebrow">MORIS CLOTHING</p><h2 id="install-heading">{ios ? "Add to your Home Screen" : "Install the app"}</h2><ol>{ios ? <><li>Tap the Share button in Safari.</li><li>Choose <strong>Add to Home Screen</strong>.</li><li>Tap <strong>Add</strong> to finish.</li></> : <><li>Open this site in Chrome.</li><li>Choose <strong>Install app</strong> or <strong>Add to Home screen</strong>.</li><li>Confirm the installation.</li></>}</ol><button type="button" className="shop-button" onClick={() => setOpen(false)}>Got it</button></section></div>}</InstallContext.Provider>;
}
export function useInstallApp() { const value = useContext(InstallContext); if (!value) throw new Error("useInstallApp must be used inside InstallAppProvider"); return value; }
export function InstallAppButton() { const { installed, install } = useInstallApp(); return installed ? null : <button className="install-footer-button" type="button" onClick={install}><Download size={15} /> Install Moris app</button>; }
