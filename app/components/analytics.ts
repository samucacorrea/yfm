export type AnalyticsValue = string | number | boolean | undefined;

let lastDynamicSearch = "";

export function trackAnalyticsEvent(event: string, params: Record<string, AnalyticsValue> = {}) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("yfm:analytics", { detail: { event, ...params } }));
}

export function trackDynamicSearch(params: {
  searchTerm: string;
  searchContext: string;
  resultCount: number;
  filterType?: string;
  filterPool?: string;
}) {
  const searchTerm = params.searchTerm.trim();
  if (searchTerm.length < 2) return;

  const eventParams = {
    search_term: searchTerm,
    search_context: params.searchContext,
    result_count: params.resultCount,
    filter_type: params.filterType,
    filter_pool: params.filterPool,
  };
  const eventKey = JSON.stringify(eventParams);
  if (eventKey === lastDynamicSearch) return;

  lastDynamicSearch = eventKey;
  trackAnalyticsEvent("search", eventParams);
  trackAnalyticsEvent("view_search_results", eventParams);
}
