import { getAdCampaign, type AdPlacement } from "../../lib/ads";
import { AdPromotionTracker } from "./ad-promotion-tracker";

export async function AdSlot({ placement, path, className = "" }: { placement: AdPlacement; path: string; className?: string }) {
  const campaign = await getAdCampaign(placement, path);
  if (!campaign) return null;

  const desktop = campaign.desktopCreative;
  const mobile = campaign.mobileCreative;
  const wrapperClass = ["ad-slot-section", className].filter(Boolean).join(" ");
  const slotClass = `ad-slot ad-slot--${campaign.format}`;

  return <section className={wrapperClass} aria-label={`${campaign.disclosure}: ${campaign.campaignName}`}>
    <div className="shell">
      <AdPromotionTracker
        campaignId={campaign.campaignId}
        campaignName={campaign.campaignName}
        advertiser={campaign.advertiser}
        placement={placement}
        destinationUrl={campaign.destinationUrl}
        className={slotClass}
      >
        <span className="ad-slot__disclosure">{campaign.disclosure}</span>
        <a
          className="ad-slot__link"
          href={campaign.destinationUrl}
          target="_blank"
          rel="sponsored noopener noreferrer"
          aria-label={`${campaign.disclosure}: ${campaign.campaignName}`}
        >
          <picture>
            {mobile ? <source media="(max-width: 620px)" srcSet={mobile.url} type={mobile.mimeType} /> : null}
            {/* External campaign assets are validated by the YFM Ads API. */}
            <img src={desktop.url} width={desktop.width} height={desktop.height} alt={desktop.alt} loading="lazy" decoding="async" fetchPriority="low" />
          </picture>
        </a>
      </AdPromotionTracker>
    </div>
  </section>;
}
