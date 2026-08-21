"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
  }
}

const ROUTE_CHANGE_EVENT = "yfm:route-change";

export function GoogleTagManagerPageViews() {
  useEffect(() => {
    let lastLocation = "";
    let scheduledFrame = 0;

    const sendPageView = () => {
      const pageLocation = window.location.href;
      if (pageLocation === lastLocation) return;

      lastLocation = pageLocation;
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        event: "page_view",
        page_location: pageLocation,
        page_path: `${window.location.pathname}${window.location.search}`,
        page_title: document.title,
      });
    };

    const schedulePageView = () => {
      window.cancelAnimationFrame(scheduledFrame);
      scheduledFrame = window.requestAnimationFrame(sendPageView);
    };

    const originalPushState = window.history.pushState;
    const originalReplaceState = window.history.replaceState;

    window.history.pushState = function (...args) {
      originalPushState.apply(this, args);
      window.dispatchEvent(new Event(ROUTE_CHANGE_EVENT));
    };

    window.history.replaceState = function (...args) {
      originalReplaceState.apply(this, args);
      window.dispatchEvent(new Event(ROUTE_CHANGE_EVENT));
    };

    window.addEventListener("popstate", schedulePageView);
    window.addEventListener(ROUTE_CHANGE_EVENT, schedulePageView);
    schedulePageView();

    return () => {
      window.cancelAnimationFrame(scheduledFrame);
      window.history.pushState = originalPushState;
      window.history.replaceState = originalReplaceState;
      window.removeEventListener("popstate", schedulePageView);
      window.removeEventListener(ROUTE_CHANGE_EVENT, schedulePageView);
    };
  }, []);

  return null;
}
