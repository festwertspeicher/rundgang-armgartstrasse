/*
* Script for the Image-Gallery.
* Using Slick-Slider by Ken Wheeler http://kenwheeler.github.io/slick
*/

// Namespace-object to keep global scope clean:
var slick = (function () {
  "use strict";

  var pub = {}, // Stands for public, gets returned
    $slider, $sliderNav, $status, $customPrevArrow, $customNextArrow, $controllMouseRight, $controllMouseLeft

  pub.init = function () {
    $slider = $(".slider");
    $sliderNav = $('.slider-nav');
    $status = $("#pagination");
    $customPrevArrow = $(".slick-prev");
    $customNextArrow = $(".slick-next");
    $controllMouseLeft = $(".controll-mouse-left");
    $controllMouseRight = $(".controll-mouse-right");

    $slider.on('init reInit afterChange', pub.updateCounter);
    $slider.on('click', pub.nextSlide);
    // mouse click on slider
    $controllMouseLeft.on('click', pub.prevSlide);
    $controllMouseRight.on('click', pub.nextSlide);
    //mouse click on controll-arrows beneath
    $customPrevArrow.on('click', pub.prevSlide);
    $customNextArrow.on('click', pub.nextSlide);

    $slider.slick({
      slide: ".picture",
      lazyLoad: "ondemand",
      dots: false,
      infinite: true,
      fade: true,
      speed: 250,
      cssEase: "linear",
      swipeToSlide: true,
      adaptiveHeight: true,
      prevArrow: false,
      nextArrow: false,
      asNavFor: '.slider-nav'
    });

    $sliderNav.slick({
      slidesToShow: 5,
      slidesToScroll: 10, //to load ten pictures via lazy load
      slide: ".picture",
      lazyLoad: "ondemand",
      infinite: true,
      dots: false,
      swipeToSlide: true,
      adaptiveHeight: true,
      prevArrow: false,
      nextArrow: false,
      asNavFor: '.slider',
      centerMode: true,
      centerPadding: '60px',
      focusOnSelect: true
    })
  };

  pub.updateCounter = function(event, slick, currentSlide, nextSlide) {
    //currentSlide is undefined on init -- set it to 0 in this case (currentSlide is 0 based)
    var i = (currentSlide ? currentSlide : 0) + 1;
    $status.text("Bild " + i + "/" + slick.slideCount);
  };

  pub.nextSlide = function(event) {
    $slider.slick('slickNext');
  }

  pub.prevSlide = function(event) {
    $slider.slick('slickPrev');
  }

  $(document).ready( function () {
      pub.init();
  });

  return pub;
}(jQuery));

