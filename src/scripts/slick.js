/*
* Script for the Image-Gallery.
* Using Slick-Slider by Ken Wheeler http://kenwheeler.github.io/slick
*/

// Namespace-object to keep global scope clean:
var slick = (function () {
  "use strict";

  var pub = {}, // Stands for public, gets returned
    slider, doNotHoverMobile, slickPrev, slickNext, slickTrack

  pub.init = function () {
    slider = $(".slider");

    slider.slick({
      lazyLoad: 'ondemand',
    });

  };

  $(document).ready( function () {
      pub.init();
  });

  return pub;
}());

