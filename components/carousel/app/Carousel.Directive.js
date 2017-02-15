define([Negotium.Boost.Carousel.Modules.App], function() {
  (function() {
    'use strict';

    angular
      .module('Negotium.Boost.Carousel')
      .directive('slickCarousel', SlickCarouselDirective);

    /** @ngInject */
    function SlickCarouselDirective($timeout) {
        var directive = {
            link: link,
            restrict: 'EA'
         };
         
        return directive;
         
        function link(scope, element, attr) {    
          angular.element(element).css('display', 'none');
          var container = angular.element(element)[0]; 
          //console.log('Slick Carousel App', container);
          
           $timeout(function () {
                $(container).css('display', 'block');
                $(container).slick();
              },600); //This timeout is not legit.. Do a $watch on a variable instead   
        
        }
    }
  })();
});