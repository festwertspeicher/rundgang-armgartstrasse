/*
* Scrollspy Hashchange
* Hash change on scroll with Bootstrap 3 Scrollspy
* Author: Franco Moya - @iamravenous
*/

(function($) {
  $(document).ready(function (){
    'use strict';

    $(window).on('activate.bs.scrollspy', function (e) {
      history.replaceState({}, "", $("a[href^='#']", e.target).attr("href"));
    });
  });
})(jQuery);
