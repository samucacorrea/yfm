<?php

if (!defined('ABSPATH')) {
    exit;
}

final class YFM_Ads_Campaign
{
    public const POST_TYPE = 'yfm_campaign';

    public const META_ADVERTISER = '_yfm_ads_advertiser';
    public const META_DESTINATION_URL = '_yfm_ads_destination_url';
    public const META_FORMAT = '_yfm_ads_format';
    public const META_DESKTOP_CREATIVE_ID = '_yfm_ads_desktop_creative_id';
    public const META_MOBILE_CREATIVE_ID = '_yfm_ads_mobile_creative_id';
    public const META_ALT_TEXT = '_yfm_ads_alt_text';
    public const META_DISCLOSURE = '_yfm_ads_disclosure';
    public const META_START_AT = '_yfm_ads_start_at';
    public const META_END_AT = '_yfm_ads_end_at';
    public const META_WEIGHT = '_yfm_ads_weight';
    public const META_PLACEMENTS = '_yfm_ads_placements';
    public const META_INCLUDE_PATHS = '_yfm_ads_include_paths';
    public const META_EXCLUDE_PATHS = '_yfm_ads_exclude_paths';

    public static function placements(): array
    {
        return array(
            'home_billboard' => 'Home - billboard',
            'cards_inline' => 'Cartas - entre resultados',
            'card_detail_inline' => 'Carta - depois das informacoes principais',
            'passwords_inline' => 'Passwords - depois da resposta principal',
            'drops_inline' => 'Drops - depois do primeiro bloco',
            'mods_inline' => 'Mods - depois do download real',
            'blog_inline' => 'Blog - dentro do artigo',
            'blog_sidebar' => 'Blog - barra lateral',
        );
    }

    public static function formats(): array
    {
        return array(
            'billboard' => 'Billboard responsivo (4:1)',
            'square' => 'Inline quadrado (1:1)',
            'mobile_strip' => 'Faixa mobile (6:1)',
        );
    }

    public static function image_mime_types(): array
    {
        return array('image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/avif');
    }

    public static function get(int $post_id): array
    {
        $placements = get_post_meta($post_id, self::META_PLACEMENTS, true);

        return array(
            'advertiser' => (string) get_post_meta($post_id, self::META_ADVERTISER, true),
            'destination_url' => (string) get_post_meta($post_id, self::META_DESTINATION_URL, true),
            'format' => (string) get_post_meta($post_id, self::META_FORMAT, true),
            'desktop_creative_id' => absint(get_post_meta($post_id, self::META_DESKTOP_CREATIVE_ID, true)),
            'mobile_creative_id' => absint(get_post_meta($post_id, self::META_MOBILE_CREATIVE_ID, true)),
            'alt_text' => (string) get_post_meta($post_id, self::META_ALT_TEXT, true),
            'disclosure' => (string) get_post_meta($post_id, self::META_DISCLOSURE, true),
            'start_at' => (string) get_post_meta($post_id, self::META_START_AT, true),
            'end_at' => (string) get_post_meta($post_id, self::META_END_AT, true),
            'weight' => max(1, min(100, absint(get_post_meta($post_id, self::META_WEIGHT, true)) ?: 1)),
            'placements' => is_array($placements) ? array_values($placements) : array(),
            'include_paths' => (string) get_post_meta($post_id, self::META_INCLUDE_PATHS, true),
            'exclude_paths' => (string) get_post_meta($post_id, self::META_EXCLUDE_PATHS, true),
        );
    }

    public static function sanitize_datetime(string $value): string
    {
        $value = sanitize_text_field($value);
        if ($value === '') {
            return '';
        }

        $date = DateTimeImmutable::createFromFormat('!Y-m-d\TH:i', $value, wp_timezone());
        return $date instanceof DateTimeImmutable ? $date->format('Y-m-d\TH:i') : '';
    }

    public static function sanitize_paths(string $value): string
    {
        $paths = preg_split('/\r\n|\r|\n/', $value) ?: array();
        $clean = array();

        foreach ($paths as $path) {
            $path = trim(sanitize_text_field($path));
            if ($path === '') {
                continue;
            }
            if ($path[0] !== '/') {
                $path = '/' . $path;
            }
            $clean[] = $path;
        }

        return implode("\n", array_values(array_unique($clean)));
    }

    public static function path_matches(string $path, string $patterns): bool
    {
        $patterns = preg_split('/\r\n|\r|\n/', $patterns) ?: array();
        foreach ($patterns as $pattern) {
            $pattern = trim($pattern);
            if ($pattern === '') {
                continue;
            }

            $regex = '#^' . str_replace('\\*', '.*', preg_quote($pattern, '#')) . '$#u';
            if (preg_match($regex, $path) === 1) {
                return true;
            }
        }

        return false;
    }

    public static function creative(int $attachment_id): ?array
    {
        if ($attachment_id <= 0 || !wp_attachment_is_image($attachment_id)) {
            return null;
        }

        $mime = (string) get_post_mime_type($attachment_id);
        if (!in_array($mime, self::image_mime_types(), true)) {
            return null;
        }

        $source = wp_get_attachment_image_src($attachment_id, 'full');
        if (!is_array($source) || empty($source[0])) {
            return null;
        }

        return array(
            'type' => $mime === 'image/gif' ? 'gif' : 'image',
            'url' => esc_url_raw($source[0]),
            'width' => absint($source[1] ?? 0),
            'height' => absint($source[2] ?? 0),
            'mime_type' => $mime,
        );
    }

    public static function delivery_status(WP_Post $post, ?DateTimeImmutable $now = null): array
    {
        if ($post->post_status !== 'publish') {
            return array('code' => 'draft', 'label' => 'Rascunho');
        }

        $campaign = self::get($post->ID);
        if (!$campaign['destination_url'] || !wp_http_validate_url($campaign['destination_url'])) {
            return array('code' => 'incomplete', 'label' => 'URL invalida ou ausente');
        }
        if (!isset(self::formats()[$campaign['format']])) {
            return array('code' => 'incomplete', 'label' => 'Formato ausente');
        }
        if (!$campaign['placements']) {
            return array('code' => 'incomplete', 'label' => 'Posicao ausente');
        }
        if (!self::creative($campaign['desktop_creative_id'])) {
            return array('code' => 'incomplete', 'label' => 'Criativo desktop ausente');
        }

        $now = $now ?: current_datetime();
        $start = self::parse_datetime($campaign['start_at']);
        $end = self::parse_datetime($campaign['end_at']);

        if ($start && $end && $end <= $start) {
            return array('code' => 'incomplete', 'label' => 'Periodo invalido');
        }
        if ($start && $now < $start) {
            return array('code' => 'scheduled', 'label' => 'Agendada');
        }
        if ($end && $now > $end) {
            return array('code' => 'expired', 'label' => 'Encerrada');
        }

        return array('code' => 'active', 'label' => 'Em veiculacao');
    }

    public static function is_eligible(WP_Post $post, string $placement, string $path, ?DateTimeImmutable $now = null): bool
    {
        if (self::delivery_status($post, $now)['code'] !== 'active') {
            return false;
        }

        $campaign = self::get($post->ID);
        if (!in_array($placement, $campaign['placements'], true)) {
            return false;
        }
        if ($campaign['include_paths'] !== '' && !self::path_matches($path, $campaign['include_paths'])) {
            return false;
        }
        if ($campaign['exclude_paths'] !== '' && self::path_matches($path, $campaign['exclude_paths'])) {
            return false;
        }

        return true;
    }

    public static function select_weighted(array $posts, string $rotation_key): ?WP_Post
    {
        if (!$posts) {
            return null;
        }

        $total = 0;
        foreach ($posts as $post) {
            $total += self::get($post->ID)['weight'];
        }

        $hash = hexdec(substr(hash('sha256', $rotation_key), 0, 8));
        $selected = $hash % max(1, $total);

        foreach ($posts as $post) {
            $selected -= self::get($post->ID)['weight'];
            if ($selected < 0) {
                return $post;
            }
        }

        return $posts[0];
    }

    private static function parse_datetime(string $value): ?DateTimeImmutable
    {
        if ($value === '') {
            return null;
        }

        $date = DateTimeImmutable::createFromFormat('!Y-m-d\TH:i', $value, wp_timezone());
        return $date instanceof DateTimeImmutable ? $date : null;
    }
}
