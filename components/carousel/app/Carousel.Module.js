// All the dependencies are loaded here
define(['lodash','moment','moment-timezone','angularMoment','ngAnimate','ngAria','ngMessages','ngMaterial','slick','slickCarousel'], function(_,moment) {
  (function() {
    'use strict';
   angular
    .module('Negotium.Boost.Carousel', ['angularMoment','ngMaterial','slickCarousel'])
      .constant('_', window._)
      .constant('moment',moment)
      .constant('spWebUrl', _spPageContextInfo.webAbsoluteUrl)
      .constant('spSiteUrl', _spPageContextInfo.siteAbsoluteUrl)
      .run(function ($rootScope, customConfig) {
        $rootScope._ = window._;
      });
  })();
});
