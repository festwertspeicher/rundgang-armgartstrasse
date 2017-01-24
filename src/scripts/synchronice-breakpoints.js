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
