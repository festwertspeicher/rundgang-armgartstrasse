/* ========================================================================
 * Bootstrap: affix.js v3.3.7
 * http://getbootstrap.com/javascript/#affix
 * ========================================================================
 * Copyright 2011-2016 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  'use strict';

  // AFFIX CLASS DEFINITION
  // ======================

  var Affix = function (element, options) {
    this.options = $.extend({}, Affix.DEFAULTS, options)

    this.$target = $(this.options.target)
      .on('scroll.bs.affix.data-api', $.proxy(this.checkPosition, this))
      .on('click.bs.affix.data-api',  $.proxy(this.checkPositionWithEventLoop, this))

    this.$element     = $(element)
    this.affixed      = null
    this.unpin        = null
    this.pinnedOffset = null

    this.checkPosition()
  }

  Affix.VERSION  = '3.3.7'

  Affix.RESET    = 'affix affix-top affix-bottom'

  Affix.DEFAULTS = {
    offset: 0,
    target: window
  }

  Affix.prototype.getState = function (scrollHeight, height, offsetTop, offsetBottom) {
    var scrollTop    = this.$target.scrollTop()
    var position     = this.$element.offset()
    var targetHeight = this.$target.height()

    if (offsetTop != null && this.affixed == 'top') return scrollTop < offsetTop ? 'top' : false

    if (this.affixed == 'bottom') {
      if (offsetTop != null) return (scrollTop + this.unpin <= position.top) ? false : 'bottom'
      return (scrollTop + targetHeight <= scrollHeight - offsetBottom) ? false : 'bottom'
    }

    var initializing   = this.affixed == null
    var colliderTop    = initializing ? scrollTop : position.top
    var colliderHeight = initializing ? targetHeight : height

    if (offsetTop != null && scrollTop <= offsetTop) return 'top'
    if (offsetBottom != null && (colliderTop + colliderHeight >= scrollHeight - offsetBottom)) return 'bottom'

    return false
  }

  Affix.prototype.getPinnedOffset = function () {
    if (this.pinnedOffset) return this.pinnedOffset
    this.$element.removeClass(Affix.RESET).addClass('affix')
    var scrollTop = this.$target.scrollTop()
    var position  = this.$element.offset()
    return (this.pinnedOffset = position.top - scrollTop)
  }

  Affix.prototype.checkPositionWithEventLoop = function () {
    setTimeout($.proxy(this.checkPosition, this), 1)
  }

  Affix.prototype.checkPosition = function () {
    if (!this.$element.is(':visible')) return

    var height       = this.$element.height()
    var offset       = this.options.offset
    var offsetTop    = offset.top
    var offsetBottom = offset.bottom
    var scrollHeight = Math.max($(document).height(), $(document.body).height())

    if (typeof offset != 'object')         offsetBottom = offsetTop = offset
    if (typeof offsetTop == 'function')    offsetTop    = offset.top(this.$element)
    if (typeof offsetBottom == 'function') offsetBottom = offset.bottom(this.$element)

    var affix = this.getState(scrollHeight, height, offsetTop, offsetBottom)

    if (this.affixed != affix) {
      if (this.unpin != null) this.$element.css('top', '')

      var affixType = 'affix' + (affix ? '-' + affix : '')
      var e         = $.Event(affixType + '.bs.affix')

      this.$element.trigger(e)

      if (e.isDefaultPrevented()) return

      this.affixed = affix
      this.unpin = affix == 'bottom' ? this.getPinnedOffset() : null

      this.$element
        .removeClass(Affix.RESET)
        .addClass(affixType)
        .trigger(affixType.replace('affix', 'affixed') + '.bs.affix')
    }

    if (affix == 'bottom') {
      this.$element.offset({
        top: scrollHeight - height - offsetBottom
      })
    }
  }


  // AFFIX PLUGIN DEFINITION
  // =======================

  function Plugin(option) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.affix')
      var options = typeof option == 'object' && option

      if (!data) $this.data('bs.affix', (data = new Affix(this, options)))
      if (typeof option == 'string') data[option]()
    })
  }

  var old = $.fn.affix

  $.fn.affix             = Plugin
  $.fn.affix.Constructor = Affix


  // AFFIX NO CONFLICT
  // =================

  $.fn.affix.noConflict = function () {
    $.fn.affix = old
    return this
  }


  // AFFIX DATA-API
  // ==============

  $(window).on('load', function () {
    $('[data-spy="affix"]').each(function () {
      var $spy = $(this)
      var data = $spy.data()

      data.offset = data.offset || {}

      if (data.offsetBottom != null) data.offset.bottom = data.offsetBottom
      if (data.offsetTop    != null) data.offset.top    = data.offsetTop

      Plugin.call($spy, data)
    })
  })

}(jQuery);

/* ========================================================================
 * Bootstrap: collapse.js v3.3.7
 * http://getbootstrap.com/javascript/#collapse
 * ========================================================================
 * Copyright 2011-2016 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */

/* jshint latedef: false */

+function ($) {
  'use strict';

  // COLLAPSE PUBLIC CLASS DEFINITION
  // ================================

  var Collapse = function (element, options) {
    this.$element      = $(element)
    this.options       = $.extend({}, Collapse.DEFAULTS, options)
    this.$trigger      = $('[data-toggle="collapse"][href="#' + element.id + '"],' +
                           '[data-toggle="collapse"][data-target="#' + element.id + '"]')
    this.transitioning = null

    if (this.options.parent) {
      this.$parent = this.getParent()
    } else {
      this.addAriaAndCollapsedClass(this.$element, this.$trigger)
    }

    if (this.options.toggle) this.toggle()
  }

  Collapse.VERSION  = '3.3.7'

  Collapse.TRANSITION_DURATION = 350

  Collapse.DEFAULTS = {
    toggle: true
  }

  Collapse.prototype.dimension = function () {
    var hasWidth = this.$element.hasClass('width')
    return hasWidth ? 'width' : 'height'
  }

  Collapse.prototype.show = function () {
    if (this.transitioning || this.$element.hasClass('in')) return

    var activesData
    var actives = this.$parent && this.$parent.children('.panel').children('.in, .collapsing')

    if (actives && actives.length) {
      activesData = actives.data('bs.collapse')
      if (activesData && activesData.transitioning) return
    }

    var startEvent = $.Event('show.bs.collapse')
    this.$element.trigger(startEvent)
    if (startEvent.isDefaultPrevented()) return

    if (actives && actives.length) {
      Plugin.call(actives, 'hide')
      activesData || actives.data('bs.collapse', null)
    }

    var dimension = this.dimension()

    this.$element
      .removeClass('collapse')
      .addClass('collapsing')[dimension](0)
      .attr('aria-expanded', true)

    this.$trigger
      .removeClass('collapsed')
      .attr('aria-expanded', true)

    this.transitioning = 1

    var complete = function () {
      this.$element
        .removeClass('collapsing')
        .addClass('collapse in')[dimension]('')
      this.transitioning = 0
      this.$element
        .trigger('shown.bs.collapse')
    }

    if (!$.support.transition) return complete.call(this)

    var scrollSize = $.camelCase(['scroll', dimension].join('-'))

    this.$element
      .one('bsTransitionEnd', $.proxy(complete, this))
      .emulateTransitionEnd(Collapse.TRANSITION_DURATION)[dimension](this.$element[0][scrollSize])
  }

  Collapse.prototype.hide = function () {
    if (this.transitioning || !this.$element.hasClass('in')) return

    var startEvent = $.Event('hide.bs.collapse')
    this.$element.trigger(startEvent)
    if (startEvent.isDefaultPrevented()) return

    var dimension = this.dimension()

    this.$element[dimension](this.$element[dimension]())[0].offsetHeight

    this.$element
      .addClass('collapsing')
      .removeClass('collapse in')
      .attr('aria-expanded', false)

    this.$trigger
      .addClass('collapsed')
      .attr('aria-expanded', false)

    this.transitioning = 1

    var complete = function () {
      this.transitioning = 0
      this.$element
        .removeClass('collapsing')
        .addClass('collapse')
        .trigger('hidden.bs.collapse')
    }

    if (!$.support.transition) return complete.call(this)

    this.$element
      [dimension](0)
      .one('bsTransitionEnd', $.proxy(complete, this))
      .emulateTransitionEnd(Collapse.TRANSITION_DURATION)
  }

  Collapse.prototype.toggle = function () {
    this[this.$element.hasClass('in') ? 'hide' : 'show']()
  }

  Collapse.prototype.getParent = function () {
    return $(this.options.parent)
      .find('[data-toggle="collapse"][data-parent="' + this.options.parent + '"]')
      .each($.proxy(function (i, element) {
        var $element = $(element)
        this.addAriaAndCollapsedClass(getTargetFromTrigger($element), $element)
      }, this))
      .end()
  }

  Collapse.prototype.addAriaAndCollapsedClass = function ($element, $trigger) {
    var isOpen = $element.hasClass('in')

    $element.attr('aria-expanded', isOpen)
    $trigger
      .toggleClass('collapsed', !isOpen)
      .attr('aria-expanded', isOpen)
  }

  function getTargetFromTrigger($trigger) {
    var href
    var target = $trigger.attr('data-target')
      || (href = $trigger.attr('href')) && href.replace(/.*(?=#[^\s]+$)/, '') // strip for ie7

    return $(target)
  }


  // COLLAPSE PLUGIN DEFINITION
  // ==========================

  function Plugin(option) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.collapse')
      var options = $.extend({}, Collapse.DEFAULTS, $this.data(), typeof option == 'object' && option)

      if (!data && options.toggle && /show|hide/.test(option)) options.toggle = false
      if (!data) $this.data('bs.collapse', (data = new Collapse(this, options)))
      if (typeof option == 'string') data[option]()
    })
  }

  var old = $.fn.collapse

  $.fn.collapse             = Plugin
  $.fn.collapse.Constructor = Collapse


  // COLLAPSE NO CONFLICT
  // ====================

  $.fn.collapse.noConflict = function () {
    $.fn.collapse = old
    return this
  }


  // COLLAPSE DATA-API
  // =================

  $(document).on('click.bs.collapse.data-api', '[data-toggle="collapse"]', function (e) {
    var $this   = $(this)

    if (!$this.attr('data-target')) e.preventDefault()

    var $target = getTargetFromTrigger($this)
    var data    = $target.data('bs.collapse')
    var option  = data ? 'toggle' : $this.data()

    Plugin.call($target, option)
  })

}(jQuery);

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


function initialize() {

  var styleArray = [
  {
    "featureType": "administrative",
    "elementType": "labels.text.fill",
    "stylers": [
    {
      "color": "#444444"
    }
    ]
  },
  {
    "featureType": "landscape",
    "elementType": "all",
    "stylers": [
    {
      "color": "#ffffff"
    }
    ]
  },
  {
    "featureType": "poi",
    "elementType": "all",
    "stylers": [
    {
      "visibility": "off"
    }
    ]
  },
  {
    "featureType": "road",
    "elementType": "all",
    "stylers": [
    {
      "saturation": -100
    },
    {
      "lightness": 45
    }
    ]
  },
  {
    "featureType": "road",
    "elementType": "geometry.fill",
    "stylers": [
    {
      "visibility": "on"
    },
    {
      "saturation": "100"
    },
    {
      "color": "#d3a87c"
    }
    ]
  },
  {
    "featureType": "road",
    "elementType": "geometry.stroke",
    "stylers": [
    {
      "color": "#d3a87c"
    }
    ]
  },
  {
    "featureType": "road.highway",
    "elementType": "all",
    "stylers": [
    {
      "visibility": "simplified"
    }
    ]
  },
  {
    "featureType": "road.highway",
    "elementType": "geometry.fill",
    "stylers": [
    {
      "color": "#d3a87c"
    }
    ]
  },
  {
    "featureType": "road.arterial",
    "elementType": "geometry.fill",
    "stylers": [
    {
      "color": "#d3a87c"
    }
    ]
  },
  {
    "featureType": "road.arterial",
    "elementType": "geometry.stroke",
    "stylers": [
    {
      "color": "#d3a87c"
    }
    ]
  },
  {
    "featureType": "road.arterial",
    "elementType": "labels.icon",
    "stylers": [
    {
      "visibility": "off"
    }
    ]
  },
  {
    "featureType": "road.local",
    "elementType": "geometry.fill",
    "stylers": [
    {
      "color": "#d3a87c"
    }
    ]
  },
  {
    "featureType": "road.local",
    "elementType": "geometry.stroke",
    "stylers": [
    {
      "color": "#d3a87c"
    }
    ]
  },
  {
    "featureType": "transit",
    "elementType": "all",
    "stylers": [
    {
      "visibility": "off"
    }
    ]
  },
  {
    "featureType": "transit",
    "elementType": "geometry.stroke",
    "stylers": [
    {
      "color": "#d3a87c"
    }
    ]
  },
  {
    "featureType": "water",
    "elementType": "all",
    "stylers": [
    {
      "color": "#e7e7e7"
    },
    {
      "visibility": "on"
    }
    ]
  }
  ];

  var myLatLng = {lat: 53.5651147, lng: 10.0224086};

  var mapOptions = {
    zoom: 15,
    center: myLatLng,
    styles: styleArray,
    disableDefaultUI: true
  };

  var map = new google.maps.Map(document.getElementById('map'), mapOptions);

  var image = '/dist/img/marker.png';

  var marker = new google.maps.Marker({
    position: myLatLng,
    map: map,
    title: 'Hochschule für angewandte Wissenschaften Hamburg Modecampus Armgartstraße (HAW Hamburg)',
    icon: image
  });

}

google.maps.event.addDomListener(window, 'load', initialize);

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

/* ========================================================================
 * Bootstrap: scrollspy.js v3.3.7
 * http://getbootstrap.com/javascript/#scrollspy
 * ========================================================================
 * Copyright 2011-2016 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  'use strict';

  // SCROLLSPY CLASS DEFINITION
  // ==========================

  function ScrollSpy(element, options) {
    this.$body          = $(document.body)
    this.$scrollElement = $(element).is(document.body) ? $(window) : $(element)
    this.options        = $.extend({}, ScrollSpy.DEFAULTS, options)
    this.selector       = (this.options.target || '') + ' .nav li > a'
    this.offsets        = []
    this.targets        = []
    this.activeTarget   = null
    this.scrollHeight   = 0

    this.$scrollElement.on('scroll.bs.scrollspy', $.proxy(this.process, this))
    this.refresh()
    this.process()
  }

  ScrollSpy.VERSION  = '3.3.7'

  ScrollSpy.DEFAULTS = {
    offset: 10
  }

  ScrollSpy.prototype.getScrollHeight = function () {
    return this.$scrollElement[0].scrollHeight || Math.max(this.$body[0].scrollHeight, document.documentElement.scrollHeight)
  }

  ScrollSpy.prototype.refresh = function () {
    var that          = this
    var offsetMethod  = 'offset'
    var offsetBase    = 0

    this.offsets      = []
    this.targets      = []
    this.scrollHeight = this.getScrollHeight()

    if (!$.isWindow(this.$scrollElement[0])) {
      offsetMethod = 'position'
      offsetBase   = this.$scrollElement.scrollTop()
    }

    this.$body
      .find(this.selector)
      .map(function () {
        var $el   = $(this)
        var href  = $el.data('target') || $el.attr('href')
        var $href = /^#./.test(href) && $(href)

        return ($href
          && $href.length
          && $href.is(':visible')
          && [[$href[offsetMethod]().top + offsetBase, href]]) || null
      })
      .sort(function (a, b) { return a[0] - b[0] })
      .each(function () {
        that.offsets.push(this[0])
        that.targets.push(this[1])
      })
  }

  ScrollSpy.prototype.process = function () {
    var scrollTop    = this.$scrollElement.scrollTop() + this.options.offset
    var scrollHeight = this.getScrollHeight()
    var maxScroll    = this.options.offset + scrollHeight - this.$scrollElement.height()
    var offsets      = this.offsets
    var targets      = this.targets
    var activeTarget = this.activeTarget
    var i

    if (this.scrollHeight != scrollHeight) {
      this.refresh()
    }

    if (scrollTop >= maxScroll) {
      return activeTarget != (i = targets[targets.length - 1]) && this.activate(i)
    }

    if (activeTarget && scrollTop < offsets[0]) {
      this.activeTarget = null
      return this.clear()
    }

    for (i = offsets.length; i--;) {
      activeTarget != targets[i]
        && scrollTop >= offsets[i]
        && (offsets[i + 1] === undefined || scrollTop < offsets[i + 1])
        && this.activate(targets[i])
    }
  }

  ScrollSpy.prototype.activate = function (target) {
    this.activeTarget = target

    this.clear()

    var selector = this.selector +
      '[data-target="' + target + '"],' +
      this.selector + '[href="' + target + '"]'

    var active = $(selector)
      .parents('li')
      .addClass('active')

    if (active.parent('.dropdown-menu').length) {
      active = active
        .closest('li.dropdown')
        .addClass('active')
    }

    active.trigger('activate.bs.scrollspy')
  }

  ScrollSpy.prototype.clear = function () {
    $(this.selector)
      .parentsUntil(this.options.target, '.active')
      .removeClass('active')
  }


  // SCROLLSPY PLUGIN DEFINITION
  // ===========================

  function Plugin(option) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.scrollspy')
      var options = typeof option == 'object' && option

      if (!data) $this.data('bs.scrollspy', (data = new ScrollSpy(this, options)))
      if (typeof option == 'string') data[option]()
    })
  }

  var old = $.fn.scrollspy

  $.fn.scrollspy             = Plugin
  $.fn.scrollspy.Constructor = ScrollSpy


  // SCROLLSPY NO CONFLICT
  // =====================

  $.fn.scrollspy.noConflict = function () {
    $.fn.scrollspy = old
    return this
  }


  // SCROLLSPY DATA-API
  // ==================

  $(window).on('load.bs.scrollspy.data-api', function () {
    $('[data-spy="scroll"]').each(function () {
      var $spy = $(this)
      Plugin.call($spy, $spy.data())
    })
  })

}(jQuery);

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

// synchronce breakpoints from css to js. checking for css-changes in body::before { content: 'VIEWPORT' }
// fires every time the window is resized. should be debounced but this file is to messy for a safe implementation.
// you can now check in this misc function for viewport == "state"
// 0 - 767 -> xs
// 768 - 991 -> sm
// 992 - 1199 -> md
// ab 1200 -> lg
// in other documents you can check for if($('body').hasClass('state')) {}

var misc = (function() {
  'use strict';

  var pub = {},
      viewport;

  pub.checkForViewportChange = function () {
    var state;

    if (window.getComputedStyle) {
      state = window.getComputedStyle(document.body,':before').content;
      state = state
        .replace(/"/g, '')
        .replace(/'/g, '');
    }
    //For oldIE inspired by https://gist.github.com/branneman/6366121
    else {
      //Use .getCompStyle instead of .getComputedStyle so above check for window.getComputedStyle never fires true for old browsers
      window.getCompStyle = function(el, pseudo) {
        this.el = el;
        this.getPropertyValue = function(prop) {
          var re = /(\-([a-z]){1})/g;
          if (prop == 'float') prop = 'styleFloat';
          if (re.test(prop)) {
            prop = prop.replace(re, function () {
              return arguments[2].toUpperCase();
            });
          }
          return el.currentStyle[prop] ? el.currentStyle[prop] : null;
        };
        return this;
      };
      var compStyle = window.getCompStyle(document.getElementsByTagName('body')[0], '');
      state = compStyle.getPropertyValue('content');
    }
    this.lastState = this.lastState || "";
    if (state != this.lastState) {
      $('body').removeClass(this.lastState);
      if (state == 'xs' || state == 'sm' || state == 'md' || state == 'lg') {
        $('body').addClass(state);
        viewport = state;
      }
      else {
        console.log(state);
      }
    this.lastState = state;
    }
  };

  $(document).ready(function() {
    $(window).on("resize load", function() {
      pub.checkForViewportChange();
    });
  });

  return pub;
}());

/* ========================================================================
 * Bootstrap: transition.js v3.3.7
 * http://getbootstrap.com/javascript/#transitions
 * ========================================================================
 * Copyright 2011-2016 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  'use strict';

  // CSS TRANSITION SUPPORT (Shoutout: http://www.modernizr.com/)
  // ============================================================

  function transitionEnd() {
    var el = document.createElement('bootstrap')

    var transEndEventNames = {
      WebkitTransition : 'webkitTransitionEnd',
      MozTransition    : 'transitionend',
      OTransition      : 'oTransitionEnd otransitionend',
      transition       : 'transitionend'
    }

    for (var name in transEndEventNames) {
      if (el.style[name] !== undefined) {
        return { end: transEndEventNames[name] }
      }
    }

    return false // explicit for ie8 (  ._.)
  }

  // http://blog.alexmaccaw.com/css-transitions
  $.fn.emulateTransitionEnd = function (duration) {
    var called = false
    var $el = this
    $(this).one('bsTransitionEnd', function () { called = true })
    var callback = function () { if (!called) $($el).trigger($.support.transition.end) }
    setTimeout(callback, duration)
    return this
  }

  $(function () {
    $.support.transition = transitionEnd()

    if (!$.support.transition) return

    $.event.special.bsTransitionEnd = {
      bindType: $.support.transition.end,
      delegateType: $.support.transition.end,
      handle: function (e) {
        if ($(e.target).is(this)) return e.handleObj.handler.apply(this, arguments)
      }
    }
  })

}(jQuery);
