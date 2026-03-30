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
    let updateIntervalId: number | undefined;
    let registeredMessageHandler: ((event: MessageEvent) => void) | undefined;
    let registeredVisibilityHandler: (() => void) | undefined;
    let registeredFocusHandler: (() => void) | undefined;
    let registeredOnlineHandler: (() => void) | undefined;

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

    const requestUpdateCheck = (registration?: ServiceWorkerRegistration | null) => {
      if (!registration) return;
      registration.update().catch(() => undefined);
    };

    navigator.serviceWorker
      .register("/sw.js", { scope: "/" })
      .then((registration) => {
        if (!isMounted) return;
        wireRegistration(registration);
        requestUpdateCheck(registration);

        updateIntervalId = window.setInterval(() => {
          requestUpdateCheck(registration);
        }, 60 * 1000);

        const handleVisibilityRefresh = () => {
          if (document.visibilityState === "visible") {
            requestUpdateCheck(registration);
          }
        };

        const handleWindowFocus = () => {
          requestUpdateCheck(registration);
        };

        const handleReconnect = () => {
          requestUpdateCheck(registration);
        };

        document.addEventListener("visibilitychange", handleVisibilityRefresh);
        window.addEventListener("focus", handleWindowFocus);
        window.addEventListener("online", handleReconnect);
        registeredVisibilityHandler = handleVisibilityRefresh;
        registeredFocusHandler = handleWindowFocus;
        registeredOnlineHandler = handleReconnect;

        navigator.serviceWorker.addEventListener("controllerchange", forceReload);
        registeredMessageHandler = (event) => {
          if (event.data?.type === "KRADLE_SW_ACTIVATED") {
            forceReload();
          }
        };
        navigator.serviceWorker.addEventListener("message", registeredMessageHandler);
      })
      .catch(() => {
        return;
      });

    return () => {
      isMounted = false;
      if (updateIntervalId) {
        window.clearInterval(updateIntervalId);
      }
      if (registeredVisibilityHandler) {
        document.removeEventListener("visibilitychange", registeredVisibilityHandler);
      }
      if (registeredFocusHandler) {
        window.removeEventListener("focus", registeredFocusHandler);
      }
      if (registeredOnlineHandler) {
        window.removeEventListener("online", registeredOnlineHandler);
      }
      navigator.serviceWorker.removeEventListener("controllerchange", forceReload);
      if (registeredMessageHandler) {
        navigator.serviceWorker.removeEventListener("message", registeredMessageHandler);
      }
    };
  }, []);

  return null;
}
