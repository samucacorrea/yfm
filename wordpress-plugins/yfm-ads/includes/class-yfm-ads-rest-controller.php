<?php

if (!defined('ABSPATH')) {
    exit;
}

final class YFM_Ads_REST_Controller
{
    private const NAMESPACE = 'yfm-ads/v1';

    public static function register_routes(): void
    {
        register_rest_route(self::NAMESPACE, '/campaign', array(
            'methods' => WP_REST_Server::READABLE,
            'callback' => array(__CLASS__, 'get_campaign'),
            'permission_callback' => '__return_true',
            'args' => array(
                'placement' => array(
                    'required' => true,
                    'sanitize_callback' => 'sanitize_key',
                    'validate_callback' => static fn($value) => isset(YFM_Ads_Campaign::placements()[$value]),
                ),
                'path' => array(
                    'default' => '/',
                    'sanitize_callback' => array(__CLASS__, 'sanitize_path'),
                ),
                'device' => array(
                    'default' => 'desktop',
                    'sanitize_callback' => 'sanitize_key',
                    'validate_callback' => static fn($value) => in_array($value, array('desktop', 'mobile'), true),
                ),
            ),
        ));
    }

    public static function sanitize_path($value): string
    {
        $path = wp_parse_url((string) $value, PHP_URL_PATH);
        $path = is_string($path) && $path !== '' ? $path : '/';
        return '/' . ltrim(sanitize_text_field($path), '/');
    }

    public static function get_campaign(WP_REST_Request $request): WP_REST_Response
    {
        $placement = (string) $request->get_param('placement');
        $path = self::sanitize_path($request->get_param('path'));
        $device = (string) $request->get_param('device');
        $now = current_datetime();

        $posts = get_posts(array(
            'post_type' => YFM_Ads_Campaign::POST_TYPE,
            'post_status' => 'publish',
            'posts_per_page' => -1,
            'orderby' => 'ID',
            'order' => 'ASC',
            'no_found_rows' => true,
        ));
        $eligible = array_values(array_filter($posts, static fn($post) => YFM_Ads_Campaign::is_eligible($post, $placement, $path, $now)));

        $bucket = intdiv(time(), 600);
        $selected = YFM_Ads_Campaign::select_weighted($eligible, $placement . '|' . $path . '|' . $bucket);
        if (!$selected) {
            $response = new WP_REST_Response(null, 204);
            return self::cache($response);
        }

        $campaign = YFM_Ads_Campaign::get($selected->ID);
        $desktop_creative = YFM_Ads_Campaign::creative($campaign['desktop_creative_id']);
        $mobile_creative = YFM_Ads_Campaign::creative($campaign['mobile_creative_id']);
        $creative_id = $device === 'mobile' && $mobile_creative
            ? $campaign['mobile_creative_id']
            : $campaign['desktop_creative_id'];
        $creative = YFM_Ads_Campaign::creative($creative_id);
        if (!$creative) {
            $creative = $desktop_creative;
        }
        if (!$creative || !$desktop_creative) {
            return self::cache(new WP_REST_Response(null, 204));
        }

        $creative['alt'] = $campaign['alt_text'] ?: get_the_title($selected);
        $desktop_creative['alt'] = $creative['alt'];
        if ($mobile_creative) {
            $mobile_creative['alt'] = $creative['alt'];
        }
        $response = new WP_REST_Response(array(
            'id' => $selected->ID,
            'campaign_id' => 'yfm-' . $selected->ID,
            'campaign_name' => get_the_title($selected),
            'advertiser' => $campaign['advertiser'],
            'placement' => $placement,
            'format' => $campaign['format'],
            'destination_url' => $campaign['destination_url'],
            'disclosure' => $campaign['disclosure'] ?: 'Publicidade',
            'creative' => $creative,
            'creatives' => array(
                'desktop' => $desktop_creative,
                'mobile' => $mobile_creative,
            ),
            'rotation_expires_at' => ($bucket + 1) * 600,
        ));

        return self::cache($response);
    }

    private static function cache(WP_REST_Response $response): WP_REST_Response
    {
        $response->header('Cache-Control', 'public, max-age=300, stale-while-revalidate=600');
        return $response;
    }
}
