import { useEffect, useRef } from "react";

const API = import.meta.env.VITE_API_URL;
const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

export default function GoogleAccountButton({ mode = "signin", onAuthenticated, onError, onBusy }) {
  const host = useRef(null);
  useEffect(() => {
    if (!CLIENT_ID || !host.current) return undefined;
    let active = true;
    const render = () => {
      if (!active || !window.google?.accounts?.id || !host.current) return;
      host.current.replaceChildren();
      window.google.accounts.id.initialize({
        client_id: CLIENT_ID,
        callback: async ({ credential }) => {
          onBusy?.(true);
          try {
            const response = await fetch(`${API}/api/auth/google`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ credential }) });
            const data = await response.json();
            if (!response.ok || !data.token) throw new Error(data.message || "Google sign-in failed.");
            onAuthenticated(data);
          } catch (error) { onError(error.message); }
          finally { onBusy?.(false); }
        },
      });
      window.google.accounts.id.renderButton(host.current, { theme: "outline", size: "large", shape: "rectangular", text: mode === "signup" ? "signup_with" : "signin_with", width: Math.max(240, Math.floor(host.current.clientWidth)) });
    };
    if (window.google?.accounts?.id) render();
    else {
      let script = document.querySelector("script[data-google-identity]");
      if (!script) { script = document.createElement("script"); script.src = "https://accounts.google.com/gsi/client"; script.async = true; script.defer = true; script.dataset.googleIdentity = "true"; document.head.appendChild(script); }
      script.addEventListener("load", render);
      return () => { active = false; script.removeEventListener("load", render); };
    }
    return () => { active = false; };
  }, [mode, onAuthenticated, onError, onBusy]);
  return <div className="google-account-option"><span>or continue with</span>{CLIENT_ID ? <div className="google-button-wrap"><div ref={host} /></div> : <p className="account-hint">Google sign-in will be available after VITE_GOOGLE_CLIENT_ID and GOOGLE_CLIENT_ID are configured for this deployment.</p>}</div>;
}
