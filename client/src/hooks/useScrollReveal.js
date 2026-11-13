import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function useScrollReveal() {
  const location = useLocation();

  useEffect(() => {
    const supportsObserver = "IntersectionObserver" in window;
    const observer = supportsObserver ? new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add("active");
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }) : null;

    const observe = (node) => {
      if (node.nodeType !== Node.ELEMENT_NODE) return;
      const elements = [];
      if (node.matches?.(".reveal")) elements.push(node);
      elements.push(...(node.querySelectorAll?.(".reveal") || []));
      elements.forEach((element) => {
        if (supportsObserver) observer.observe(element);
        if (element.getBoundingClientRect().top < window.innerHeight * 0.92) element.classList.add("active");
      });
    };

    observe(document.body);
    // Some homepage sections render after the product request completes.
    const mutations = new MutationObserver((records) => records.forEach((record) => record.addedNodes.forEach(observe)));
    mutations.observe(document.body, { childList: true, subtree: true });

    return () => {
      mutations.disconnect();
      observer?.disconnect();
    };
  }, [location.pathname]);
}
