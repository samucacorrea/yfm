"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { trackAnalyticsEvent } from "./analytics";

type Props = {
  campaignId: string;
  campaignName: string;
  advertiser: string;
  placement: string;
  destinationUrl: string;
  className: string;
  children: ReactNode;
};

export function AdPromotionTracker({ campaignId, campaignName, advertiser, placement, destinationUrl, className, children }: Props) {
  const container = useRef<HTMLElement>(null);
  const viewed = useRef(false);

  useEffect(() => {
    const element = container.current;
    if (!element) return;

    const promotionParams = {
      promotion_id: campaignId,
      promotion_name: campaignName,
      creative_name: campaignName,
      creative_slot: placement,
      location_id: window.location.pathname,
      items: [{ item_id: campaignId, item_name: campaignName, affiliation: advertiser || "Afiliado YFM" }],
    };

    const handleClick = (event: Event) => {
      if (!(event.target instanceof Element) || !event.target.closest("a")) return;
      trackAnalyticsEvent("select_promotion", promotionParams);
      trackAnalyticsEvent("affiliate_click", {
        campaign_id: campaignId,
        campaign_name: campaignName,
        advertiser,
        placement,
        link_url: destinationUrl,
      });
    };
    element.addEventListener("click", handleClick);

    if (viewed.current || typeof IntersectionObserver === "undefined") {
      return () => element.removeEventListener("click", handleClick);
    }

    let timer: ReturnType<typeof setTimeout> | undefined;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
        if (!timer) {
          timer = setTimeout(() => {
            viewed.current = true;
            trackAnalyticsEvent("view_promotion", promotionParams);
            observer.disconnect();
          }, 1000);
        }
      } else if (timer) {
        clearTimeout(timer);
        timer = undefined;
      }
    }, { threshold: [0, 0.5, 1] });

    observer.observe(element);
    return () => {
      if (timer) clearTimeout(timer);
      observer.disconnect();
      element.removeEventListener("click", handleClick);
    };
  }, [advertiser, campaignId, campaignName, destinationUrl, placement]);

  return <aside
    ref={container}
    className={className}
    data-ad-placement={placement}
    data-promotion-id={campaignId}
  >{children}</aside>;
}
