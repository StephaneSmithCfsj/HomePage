// All the dependencies are loaded here
define(['lodash','moment','moment-timezone','angularMoment','ngAnimate','ngAria','ngMessages','ngMaterial'], function(_,moment) {
  (function() {
    'use strict';
   angular
    .module('Negotium.Boost.Calendar', ['angularMoment','ngMaterial'])
      .constant('_', window._)
      .constant('moment',moment)
      .constant('spWebUrl', _spPageContextInfo.webAbsoluteUrl)
      .constant('spSiteUrl', _spPageContextInfo.siteAbsoluteUrl)
      .run(function ($rootScope) {
        $rootScope._ = window._;
      });
  })();
});
