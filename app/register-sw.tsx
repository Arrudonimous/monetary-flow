"use client";

import { useEffect } from "react";

export function RegisterServiceWorker() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // Instalação continua funcionando sem o service worker; ele só
        // ajuda o app shell a carregar mais rápido quando reaberto.
      });
    }
  }, []);

  return null;
}
