<?php

if (!defined('ABSPATH')) {
    exit;
}

final class YFM_Ads_Meta_Boxes
{
    public static function boot(): void
    {
        add_action('add_meta_boxes', array(__CLASS__, 'register'));
        add_action('save_post_' . YFM_Ads_Campaign::POST_TYPE, array(__CLASS__, 'save'));
        add_action('admin_enqueue_scripts', array(__CLASS__, 'enqueue_assets'));
    }

    public static function register(): void
    {
        add_meta_box('yfm-ads-campaign', 'Configuracao da campanha', array(__CLASS__, 'render_campaign'), YFM_Ads_Campaign::POST_TYPE, 'normal', 'high');
        add_meta_box('yfm-ads-targeting', 'Segmentacao e entrega', array(__CLASS__, 'render_targeting'), YFM_Ads_Campaign::POST_TYPE, 'side', 'default');
    }

    public static function enqueue_assets(string $hook): void
    {
        if (!in_array($hook, array('post.php', 'post-new.php', 'edit.php'), true)) {
            return;
        }

        $screen = get_current_screen();
        if (!$screen || $screen->post_type !== YFM_Ads_Campaign::POST_TYPE) {
            return;
        }

        wp_enqueue_media();
        wp_enqueue_script('yfm-ads-admin', YFM_ADS_URL . 'assets/admin.js', array('jquery'), YFM_ADS_VERSION, true);
        wp_enqueue_style('yfm-ads-admin', YFM_ADS_URL . 'assets/admin.css', array(), YFM_ADS_VERSION);
    }

    public static function render_campaign(WP_Post $post): void
    {
        $campaign = YFM_Ads_Campaign::get($post->ID);
        wp_nonce_field('yfm_ads_save_campaign', 'yfm_ads_nonce');
        ?>
        <div class="yfm-ads-grid">
            <p>
                <label for="yfm_ads_advertiser"><strong>Anunciante ou programa de afiliados</strong></label>
                <input class="widefat" id="yfm_ads_advertiser" name="yfm_ads_advertiser" type="text" value="<?php echo esc_attr($campaign['advertiser']); ?>">
            </p>
            <p>
                <label for="yfm_ads_destination_url"><strong>URL de destino</strong></label>
                <input class="widefat" id="yfm_ads_destination_url" name="yfm_ads_destination_url" type="url" required value="<?php echo esc_attr($campaign['destination_url']); ?>" placeholder="https://exemplo.com/produto?ref=yfm">
            </p>
            <p>
                <label for="yfm_ads_format"><strong>Formato</strong></label>
                <select class="widefat" id="yfm_ads_format" name="yfm_ads_format">
                    <?php foreach (YFM_Ads_Campaign::formats() as $value => $label) : ?>
                        <option value="<?php echo esc_attr($value); ?>" <?php selected($campaign['format'], $value); ?>><?php echo esc_html($label); ?></option>
                    <?php endforeach; ?>
                </select>
            </p>
            <p>
                <label for="yfm_ads_alt_text"><strong>Texto alternativo</strong></label>
                <input class="widefat" id="yfm_ads_alt_text" name="yfm_ads_alt_text" type="text" value="<?php echo esc_attr($campaign['alt_text']); ?>" placeholder="Descricao objetiva do anuncio">
            </p>
            <?php self::render_media_field('desktop', 'Criativo desktop', $campaign['desktop_creative_id'], true); ?>
            <?php self::render_media_field('mobile', 'Criativo mobile (opcional)', $campaign['mobile_creative_id'], false); ?>
            <p>
                <label for="yfm_ads_disclosure"><strong>Identificacao publica</strong></label>
                <input class="widefat" id="yfm_ads_disclosure" name="yfm_ads_disclosure" type="text" value="<?php echo esc_attr($campaign['disclosure'] ?: 'Publicidade'); ?>">
            </p>
            <p>
                <label for="yfm_ads_weight"><strong>Peso na rotacao (1-100)</strong></label>
                <input class="small-text" id="yfm_ads_weight" name="yfm_ads_weight" type="number" min="1" max="100" value="<?php echo esc_attr((string) $campaign['weight']); ?>">
            </p>
        </div>
        <p class="description">Esta versao aceita JPG, PNG, GIF, WebP e AVIF. HTML5/ZIP sera liberado somente apos a camada de isolamento e validacao de seguranca.</p>
        <?php
    }

    public static function render_targeting(WP_Post $post): void
    {
        $campaign = YFM_Ads_Campaign::get($post->ID);
        ?>
        <fieldset class="yfm-ads-placements">
            <legend><strong>Posicoes</strong></legend>
            <?php foreach (YFM_Ads_Campaign::placements() as $value => $label) : ?>
                <label><input type="checkbox" name="yfm_ads_placements[]" value="<?php echo esc_attr($value); ?>" <?php checked(in_array($value, $campaign['placements'], true)); ?>> <?php echo esc_html($label); ?></label>
            <?php endforeach; ?>
        </fieldset>
        <p>
            <label for="yfm_ads_start_at"><strong>Inicio</strong></label>
            <input class="widefat" id="yfm_ads_start_at" name="yfm_ads_start_at" type="datetime-local" value="<?php echo esc_attr($campaign['start_at']); ?>">
        </p>
        <p>
            <label for="yfm_ads_end_at"><strong>Termino</strong></label>
            <input class="widefat" id="yfm_ads_end_at" name="yfm_ads_end_at" type="datetime-local" value="<?php echo esc_attr($campaign['end_at']); ?>">
        </p>
        <p>
            <label for="yfm_ads_include_paths"><strong>Incluir apenas rotas</strong></label>
            <textarea class="widefat" id="yfm_ads_include_paths" name="yfm_ads_include_paths" rows="4" placeholder="/cartas/*"><?php echo esc_textarea($campaign['include_paths']); ?></textarea>
        </p>
        <p>
            <label for="yfm_ads_exclude_paths"><strong>Excluir rotas</strong></label>
            <textarea class="widefat" id="yfm_ads_exclude_paths" name="yfm_ads_exclude_paths" rows="4" placeholder="/cartas/exodia/*"><?php echo esc_textarea($campaign['exclude_paths']); ?></textarea>
        </p>
        <p class="description">Use uma rota por linha. O caractere * funciona como curinga.</p>
        <?php
    }

    public static function save(int $post_id): void
    {
        if (!isset($_POST['yfm_ads_nonce']) || !wp_verify_nonce(sanitize_text_field(wp_unslash($_POST['yfm_ads_nonce'])), 'yfm_ads_save_campaign')) {
            return;
        }
        if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) {
            return;
        }
        if (!current_user_can('manage_options')) {
            return;
        }

        $formats = YFM_Ads_Campaign::formats();
        $format = sanitize_key(wp_unslash($_POST['yfm_ads_format'] ?? ''));
        $format = isset($formats[$format]) ? $format : 'square';

        $known_placements = array_keys(YFM_Ads_Campaign::placements());
        $placements = array_map('sanitize_key', (array) wp_unslash($_POST['yfm_ads_placements'] ?? array()));
        $placements = array_values(array_intersect($known_placements, $placements));

        self::update($post_id, YFM_Ads_Campaign::META_ADVERTISER, sanitize_text_field(wp_unslash($_POST['yfm_ads_advertiser'] ?? '')));
        self::update($post_id, YFM_Ads_Campaign::META_DESTINATION_URL, esc_url_raw(wp_unslash($_POST['yfm_ads_destination_url'] ?? ''), array('http', 'https')));
        self::update($post_id, YFM_Ads_Campaign::META_FORMAT, $format);
        self::update($post_id, YFM_Ads_Campaign::META_DESKTOP_CREATIVE_ID, absint($_POST['yfm_ads_desktop_creative_id'] ?? 0));
        self::update($post_id, YFM_Ads_Campaign::META_MOBILE_CREATIVE_ID, absint($_POST['yfm_ads_mobile_creative_id'] ?? 0));
        self::update($post_id, YFM_Ads_Campaign::META_ALT_TEXT, sanitize_text_field(wp_unslash($_POST['yfm_ads_alt_text'] ?? '')));
        self::update($post_id, YFM_Ads_Campaign::META_DISCLOSURE, sanitize_text_field(wp_unslash($_POST['yfm_ads_disclosure'] ?? 'Publicidade')) ?: 'Publicidade');
        self::update($post_id, YFM_Ads_Campaign::META_START_AT, YFM_Ads_Campaign::sanitize_datetime((string) wp_unslash($_POST['yfm_ads_start_at'] ?? '')));
        self::update($post_id, YFM_Ads_Campaign::META_END_AT, YFM_Ads_Campaign::sanitize_datetime((string) wp_unslash($_POST['yfm_ads_end_at'] ?? '')));
        self::update($post_id, YFM_Ads_Campaign::META_WEIGHT, max(1, min(100, absint($_POST['yfm_ads_weight'] ?? 1))));
        self::update($post_id, YFM_Ads_Campaign::META_PLACEMENTS, $placements);
        self::update($post_id, YFM_Ads_Campaign::META_INCLUDE_PATHS, YFM_Ads_Campaign::sanitize_paths((string) wp_unslash($_POST['yfm_ads_include_paths'] ?? '')));
        self::update($post_id, YFM_Ads_Campaign::META_EXCLUDE_PATHS, YFM_Ads_Campaign::sanitize_paths((string) wp_unslash($_POST['yfm_ads_exclude_paths'] ?? '')));
    }

    private static function render_media_field(string $key, string $label, int $attachment_id, bool $required): void
    {
        $image = $attachment_id ? wp_get_attachment_image($attachment_id, 'medium') : '';
        ?>
        <div class="yfm-ads-media" data-yfm-ads-media>
            <p><strong><?php echo esc_html($label); ?><?php echo $required ? ' *' : ''; ?></strong></p>
            <div class="yfm-ads-media__preview" data-yfm-ads-preview><?php echo wp_kses_post($image); ?></div>
            <input data-yfm-ads-input name="yfm_ads_<?php echo esc_attr($key); ?>_creative_id" type="hidden" value="<?php echo esc_attr((string) $attachment_id); ?>">
            <button class="button" data-yfm-ads-select type="button">Selecionar imagem</button>
            <button class="button-link-delete" data-yfm-ads-remove type="button" <?php echo $attachment_id ? '' : 'hidden'; ?>>Remover</button>
        </div>
        <?php
    }

    private static function update(int $post_id, string $key, $value): void
    {
        if ($value === '' || $value === array()) {
            delete_post_meta($post_id, $key);
            return;
        }
        update_post_meta($post_id, $key, $value);
    }
}
