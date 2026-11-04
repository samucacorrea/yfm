<?php
/**
 * Plugin Name: YFM Ads
 * Description: Gerencia campanhas de afiliados para o frontend headless do YFM.
 * Version: 0.1.0
 * Author: YFM
 * Requires at least: 6.4
 * Requires PHP: 8.0
 * Text Domain: yfm-ads
 */

if (!defined('ABSPATH')) {
    exit;
}

define('YFM_ADS_VERSION', '0.1.0');
define('YFM_ADS_FILE', __FILE__);
define('YFM_ADS_PATH', plugin_dir_path(__FILE__));
define('YFM_ADS_URL', plugin_dir_url(__FILE__));

require_once YFM_ADS_PATH . 'includes/class-yfm-ads-campaign.php';
require_once YFM_ADS_PATH . 'includes/class-yfm-ads-post-type.php';
require_once YFM_ADS_PATH . 'includes/class-yfm-ads-meta-boxes.php';
require_once YFM_ADS_PATH . 'includes/class-yfm-ads-rest-controller.php';

final class YFM_Ads_Plugin
{
    public static function boot(): void
    {
        add_action('init', array('YFM_Ads_Post_Type', 'register'));
        add_action('rest_api_init', array('YFM_Ads_REST_Controller', 'register_routes'));

        if (is_admin()) {
            YFM_Ads_Meta_Boxes::boot();
            YFM_Ads_Post_Type::boot_admin();
        }
    }

    public static function activate(): void
    {
        YFM_Ads_Post_Type::register();
        flush_rewrite_rules();
    }
}

register_activation_hook(YFM_ADS_FILE, array('YFM_Ads_Plugin', 'activate'));
YFM_Ads_Plugin::boot();
