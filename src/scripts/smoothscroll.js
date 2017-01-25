/* ========================================================================
 * Smoothscroll Plugin for Hash-events
 * ========================================================================
 * From Github (Mili Abdo)
 * @link https://stackoverflow.com/questions/21484195/smooth-scroll-and-accordion-conflict-bootstrap
 * ======================================================================== */


+function ($) {
  'use strict';

  $(document).ready(function(){
    $('a[href*="#"]:not([href="#"]):not([data-toggle])').click(function() {
        if (location.pathname.replace(/^\//, '') == this.pathname.replace(/^\//, '') && location.hostname == this.hostname) {
            var target = $(this.hash);
            target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');
            if (target.length) {
                $('html, body').animate({
                    scrollTop: target.offset().top
                }, 900, 'swing');
                return false;
            }
        }
    });
  });

}(jQuery);
