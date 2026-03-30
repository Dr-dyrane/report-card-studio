"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    __kradlePwaReloading?: boolean;
  }
}

function forceReload() {
  if (window.__kradlePwaReloading) return;
  window.__kradlePwaReloading = true;
  window.location.reload();
}

export function PwaRegistrar() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }

    let isMounted = true;

    const activateWaitingWorker = (registration: ServiceWorkerRegistration) => {
      if (registration.waiting) {
        registration.waiting.postMessage({ type: "SKIP_WAITING" });
      }
    };

    const wireRegistration = (registration: ServiceWorkerRegistration) => {
      activateWaitingWorker(registration);

      registration.addEventListener("updatefound", () => {
        const installingWorker = registration.installing;
        if (!installingWorker) return;

        installingWorker.addEventListener("statechange", () => {
          if (installingWorker.state === "installed") {
            activateWaitingWorker(registration);
          }
        });
      });
    };

    navigator.serviceWorker
      .register("/sw.js", { scope: "/" })
      .then((registration) => {
        if (!isMounted) return;
        wireRegistration(registration);

        navigator.serviceWorker.addEventListener("controllerchange", forceReload);
        navigator.serviceWorker.addEventListener("message", (event) => {
          if (event.data?.type === "KRADLE_SW_ACTIVATED") {
            forceReload();
          }
        });
      })
      .catch(() => {
        return;
      });

    return () => {
      isMounted = false;
      navigator.serviceWorker.removeEventListener("controllerchange", forceReload);
    };
  }, []);

  return null;
}
