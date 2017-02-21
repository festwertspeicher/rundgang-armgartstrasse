/*
* Script for the Image-Gallery.
* Using Slick-Slider by Ken Wheeler http://kenwheeler.github.io/slick
*/

// Namespace-object to keep global scope clean:
var slick = (function () {
  "use strict";

  var pub = {}, // Stands for public, gets returned
    slider, darkBox, doNotHover, doNotHoverMobile, slickPrev, slickNext, slickTrack,
    dropdownVisible = false, lastOpened, animating = false,
    autoslideInt, autoslideEvent = true, autoslideResize = false,
    scrollPosition = 0, resizeTimer, windowInnerWidth,
    ANIMATION_DURATION = 200, SCROLL_DISTANCE = 50;

  pub.init = function () {
    slider = $(".subject-slider");

    slider.slick({
      slide: "div",
      dots: false,
      infinite: true,
      centerMode: true,
      centerPadding: "8.3333%", // 100% / 6 / 2
      slidesToShow: 5,
      slidesToScroll: 5,
      autoplay: true,
      autoplaySpeed: 75,
      accessibility: false,
      pauseOnHover: false,
      swipeToSlide: true,
      prevArrow: "<button class='slick-prev slick-arrow' role='button' aria-label='Previous' data-role='none' type='button' style='display: block;'>Previous</button>",
      nextArrow: "<button class='slick-next slick-arrow' role='button' aria-label='Next' data-role='none' type='button' style='display: block;'>Next</button>",
    });

    autoslideInt = pub.getRandomInt(1, 3);
    slickPrev = $(".slick-prev");
    slickNext = $(".slick-next");
    slickTrack = $(".slick-track");
    darkBox = $("#shadow-box-slick");
    doNotHover = $("#do-not-hover");
    doNotHoverMobile = $("#do-not-hover-mobile");

    $(window).scroll(pub.handleScroll);
    $(window).on('resize', pub.resizeDebounce);
    $(".slick-close-link").on('click', pub.closeLink);
    $(slickPrev).hover(pub.mouseEnterPrev, pub.mouseLeavePrev);
    $(slickNext).hover(pub.mouseEnterNext, pub.mouseLeaveNext);
    slider.on('beforeChange', pub.beforeChange);
    slider.on('afterChange', pub.afterChange);
    $(".slick-slide").on('click', pub.clickSlide);
    $(darkBox).on('click', pub.clickShadowBox);

    pub.checkMediaQueries();
  };

  $(document).ready( function () {
      pub.init();
  });

  pub.beforeChange = function(event, slick, currentSlide) {
    // hide controll elements, disables hover
    slick.accessibility = false;
    animating = true;
    $(slickPrev).addClass("slick-disabled");
    $(slickNext).addClass("slick-disabled");
    //remove all hover class
    $(".slick-active").removeClass("slick-slide-hover");
    //deactivate all clicked slides
    if (dropdownVisible) {
      pub.close(lastOpened);
    }
  };

  pub.afterChange = function(event, slick, currentSlide) {
    // deactivates autoplay after random number of autoslides
    if(autoslideInt <= currentSlide || slick.slideCount <= currentSlide + 1 || autoslideResize) {
      slick.paused = true;
      slick.autoplay = false;
      autoslideEvent = false;
      autoslideResize = false;
    }

    if(!autoslideEvent) {
      //show controll elements, enable hover
      slick.accessibility = true;
      animating = false;
      $(slickPrev).removeClass("slick-disabled");
      $(slickNext).removeClass("slick-disabled");
      //slick-active class is added before the animation starts so slick-slide-hover is added when finished to prevent the hover animation while sliding.
      $(".slick-active").addClass('slick-slide-hover');
    }
  };

  pub.clickSlide = function(event) {
    //show dropdown
    if ($(this).hasClass("slick-active") && $(this).hasClass("slick-notclicked") && !autoslideEvent){
      //if another subject is clicked
      if (dropdownVisible && $(lastOpened) != $(this)) {
        pub.toggle($(lastOpened), $(this));
      } else if (!dropdownVisible) {
        pub.open($(this));
      }
    }
  };

  pub.clickShadowBox = function() {
    pub.close($(lastOpened));
  };

  pub.open = function (subject) {
    if(!dropdownVisible && !animating) {
      dropdownVisible = true;
      $(subject).removeClass("slick-notclicked");
      $(subject).addClass("slick-clicked");
      lastOpened = subject;
      $(subject).find(".slick-hidden").animate({
        height: "toggle",
        opacity: "toggle"
      });
      animating = true;
      doNotHover.css({"z-index": "2"});
      doNotHoverMobile.css({"z-index": "2"});
      darkBox.fadeIn(ANIMATION_DURATION, pub.liftDown);
    }
  };

  pub.close = function (subject) {
    if(dropdownVisible) {
      dropdownVisible = false;
      $(subject).addClass("slick-notclicked");
      $(subject).removeClass("slick-clicked");
      lastOpened = null;
      $(subject).find(".slick-hidden").animate({
        height: "toggle",
        opacity: "toggle"
      });
      animating = true;
      darkBox.fadeOut(ANIMATION_DURATION, pub.liftUp);
    }
  };

  pub.toggle = function (closeToggle, openToggle) {
    if(dropdownVisible) {
      $(closeToggle).addClass("slick-notclicked");
      $(openToggle).removeClass("slick-notclicked");
      $(closeToggle).removeClass("slick-clicked");
      $(openToggle).addClass("slick-clicked");
      lastOpened = openToggle;
      $(closeToggle).find(".slick-hidden").animate({
        height: "toggle",
        opacity: "toggle"
      });
      $(openToggle).find(".slick-hidden").animate({
        height: "toggle",
        opacity: "toggle"
      });
    }
  };

  pub.liftUp = function () {
    doNotHover.css({"z-index": "4"});
    doNotHoverMobile.css({"z-index": "4"});
    animating = false;
  };
  pub.liftDown = function () {
    animating = false;
  };

  pub.closeLink = function (event) {
    var parent = $(this).closest(".slick-active");
    pub.close(parent);
    event.stopPropagation();
  };

  pub.mouseEnterPrev = function () {
    $(slickTrack).addClass('slick-hover-prev');
    $(slickNext).addClass('slick-hover-disabled');
  };

  pub.mouseLeavePrev = function () {
    $(slickTrack).removeClass('slick-hover-prev');
    $(slickNext).removeClass('slick-hover-disabled');
  };

  pub.mouseEnterNext = function () {
    $(slickTrack).addClass('slick-hover-next');
    $(slickPrev).addClass('slick-hover-disabled');
  };

  pub.mouseLeaveNext = function () {
    $(slickTrack).removeClass('slick-hover-next');
    $(slickPrev).removeClass('slick-hover-disabled');
  };

  pub.getRandomInt = function (min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  pub.checkMediaQueries = function () {
    if($('body').hasClass('md')) { //min 1000
      $(slider).slick("slickSetOption", {
        slidesToShow: 5,
        arrows: true
      }, true);
      // rebind lost elements and event-handler
      slickPrev = $(".slick-prev");
      slickNext = $(".slick-next");
      $(slickPrev).hover(pub.mouseEnterPrev, pub.mouseLeavePrev);
      $(slickNext).hover(pub.mouseEnterNext, pub.mouseLeaveNext);
    }
    else if($('body').hasClass('smedium')) {  //min 768 - max 999
      $(slider).slick("slickSetOption", {
        slidesToShow: 3,
        arrows: false
      }, true);
    }
    else if($('body').hasClass('sm')) { //min 500 - max 767
      $(slider).slick("slickSetOption", {
        slidesToShow: 2,
        arrows: false
      }, true);
    }
    else if($('body').hasClass('xs')) {  //max 499
      $(slider).slick("slickSetOption", {
        slidesToShow: 1,
        arrows: false
      }, true);
    }
    else {
      //wait for the checkForViewportChange Function from misc.js
      pub.resizeDebounce();
      return;
    }
    if(!slider.hasClass("breakpoint-Loaded")) {
      slider.addClass("breakpoint-Loaded");
    }
  };

  pub.handleScroll = function () {
    var windowPosition = $(window).scrollTop();

    var w = $( window ).width();
    if (dropdownVisible || !animating) {
      if (windowPosition - scrollPosition < 0) {
        scrollPosition = $(window).scrollTop();
      }
      if (windowPosition - scrollPosition > SCROLL_DISTANCE) {
        if (dropdownVisible) {
          pub.close($(lastOpened));
        }
      }
    }
    if (dropdownVisible && !animating) { return; }
  };

  pub.resizeDebounce = function(e) {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function() {
      autoslideResize = true;
      if (dropdownVisible) {
        pub.close(lastOpened);
      }
      pub.checkMediaQueries();
    }, 250);
  };

  return pub;
}());

