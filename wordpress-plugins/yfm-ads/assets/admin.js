/* global jQuery, wp */

(function ($) {
  "use strict";

  $(document).on("click", "[data-yfm-ads-select]", function () {
    const container = $(this).closest("[data-yfm-ads-media]");
    const frame = wp.media({
      title: "Selecionar criativo",
      button: { text: "Usar este criativo" },
      library: { type: "image" },
      multiple: false,
    });

    frame.on("select", function () {
      const attachment = frame.state().get("selection").first().toJSON();
      const preview = attachment.sizes?.medium?.url || attachment.url;
      container.find("[data-yfm-ads-input]").val(attachment.id);
      container.find("[data-yfm-ads-preview]").html($("<img>", { src: preview, alt: "" }));
      container.find("[data-yfm-ads-remove]").prop("hidden", false);
    });

    frame.open();
  });

  $(document).on("click", "[data-yfm-ads-remove]", function () {
    const container = $(this).closest("[data-yfm-ads-media]");
    container.find("[data-yfm-ads-input]").val("");
    container.find("[data-yfm-ads-preview]").empty();
    $(this).prop("hidden", true);
  });
})(jQuery);
