<?php
/**
 * Plugin Name: js-infrastucture
 * Plugin URI: 
 * Description: js-infrastucture to load everything with ajax
 * Version: 1.0.1
 * Author: Bharat
 * Author URI: https://github.com/bs-wtw
 */
 
add_action('wp_enqueue_scripts','js_infrastucture_init');
add_filter('woocommerce_after_add_to_cart_button','add_price_to_atc_button');

function js_infrastucture_init() {
    wp_enqueue_script( 'wp-initiator-js', plugins_url( '/js/wp-initiator.js', __FILE__), array('jquery'), '1.0.1.11', true);
    wp_enqueue_style( 'wp-clodflr-animate-css', "//cdnjs.cloudflare.com/ajax/libs/animate.css/3.7.2/animate.min.css");

    wp_enqueue_script( 'wp-notify-js', plugins_url( '/js/bootstrap-notify.js', __FILE__), array('jquery'), '1.0.1.11', true);
    wp_enqueue_script( 'wp-nprogress-js', plugins_url( '/js/nprogress.js', __FILE__), array('jquery'), '1.0.1.12', true);

    wp_enqueue_style( 'wp-notify-css', plugins_url( '/css/style.css', __FILE__));
    wp_enqueue_style( 'wp-nprogress-css', plugins_url( '/css/nprogress.css', __FILE__));
}

function add_price_to_atc_button(){
	echo '<div class="wooco_total wooco-total wooco-text"></div>';
}