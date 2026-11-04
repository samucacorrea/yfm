<?php

if (!defined('ABSPATH')) {
    exit;
}

final class YFM_Ads_Post_Type
{
    public static function register(): void
    {
        register_post_type(YFM_Ads_Campaign::POST_TYPE, array(
            'labels' => array(
                'name' => 'YFM Ads',
                'singular_name' => 'Campanha',
                'add_new' => 'Adicionar campanha',
                'add_new_item' => 'Adicionar campanha',
                'edit_item' => 'Editar campanha',
                'new_item' => 'Nova campanha',
                'view_item' => 'Ver campanha',
                'search_items' => 'Buscar campanhas',
                'not_found' => 'Nenhuma campanha encontrada',
                'menu_name' => 'YFM Ads',
            ),
            'public' => false,
            'show_ui' => true,
            'show_in_menu' => true,
            'show_in_rest' => false,
            'menu_icon' => 'dashicons-megaphone',
            'supports' => array('title'),
            'capabilities' => array(
                'edit_post' => 'manage_options',
                'read_post' => 'manage_options',
                'delete_post' => 'manage_options',
                'edit_posts' => 'manage_options',
                'edit_others_posts' => 'manage_options',
                'publish_posts' => 'manage_options',
                'read_private_posts' => 'manage_options',
                'delete_posts' => 'manage_options',
                'delete_private_posts' => 'manage_options',
                'delete_published_posts' => 'manage_options',
                'delete_others_posts' => 'manage_options',
                'edit_private_posts' => 'manage_options',
                'edit_published_posts' => 'manage_options',
                'create_posts' => 'manage_options',
            ),
            'map_meta_cap' => false,
        ));
    }

    public static function boot_admin(): void
    {
        add_filter('manage_' . YFM_Ads_Campaign::POST_TYPE . '_posts_columns', array(__CLASS__, 'columns'));
        add_action('manage_' . YFM_Ads_Campaign::POST_TYPE . '_posts_custom_column', array(__CLASS__, 'column_content'), 10, 2);
    }

    public static function columns(array $columns): array
    {
        return array(
            'cb' => $columns['cb'] ?? '<input type="checkbox" />',
            'title' => 'Campanha',
            'yfm_ads_delivery' => 'Entrega',
            'yfm_ads_placements' => 'Posicoes',
            'yfm_ads_period' => 'Periodo',
            'date' => $columns['date'] ?? 'Data',
        );
    }

    public static function column_content(string $column, int $post_id): void
    {
        $campaign = YFM_Ads_Campaign::get($post_id);

        if ($column === 'yfm_ads_delivery') {
            $post = get_post($post_id);
            if ($post instanceof WP_Post) {
                $status = YFM_Ads_Campaign::delivery_status($post);
                printf('<strong class="yfm-ads-status yfm-ads-status--%1$s">%2$s</strong>', esc_attr($status['code']), esc_html($status['label']));
            }
            return;
        }

        if ($column === 'yfm_ads_placements') {
            $labels = YFM_Ads_Campaign::placements();
            $selected = array_map(static fn($key) => $labels[$key] ?? $key, $campaign['placements']);
            echo esc_html(implode(', ', $selected) ?: 'Nenhuma');
            return;
        }

        if ($column === 'yfm_ads_period') {
            $start = $campaign['start_at'] ?: 'imediato';
            $end = $campaign['end_at'] ?: 'sem termino';
            echo esc_html($start . ' ate ' . $end);
        }
    }
}
