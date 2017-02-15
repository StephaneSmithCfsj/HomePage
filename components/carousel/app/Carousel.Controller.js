define([Negotium.Boost.Carousel.Modules.App, Negotium.Boost.Carousel.Modules.Service], function () {
  (function () {
    'use strict';

    angular
      .module('Negotium.Boost.Carousel')
      .controller('CarouselController', CarouselController);

    CarouselController.$inject = ['_', 'CarouselService', 'customConfig', '$timeout', '$scope', 'spSiteUrl'];
    function CarouselController(_, CarouselService, customConfig, $timeout, $scope, spSiteUrl) {
      var vm = this;
      vm.news = [];
      vm.siteUrl = null;
      vm.numberOfImagesToDisplay = customConfig.numberOfSlides;
      vm.width = customConfig.width;
      vm.height = customConfig.height


      $scope.slickConfig = {
        enabled: false,
        autoplay: true,
        draggable: true,
        autoplaySpeed: 4500,
        method: {},
        // adaptiveHeight:true,
        event: {
          beforeChange: function (event, slick, currentSlide, nextSlide) {
          },
          afterChange: function (event, slick, currentSlide, nextSlide) {
          }
        }
      };

      activate();

      function activate() {
        vm.siteUrl = spSiteUrl;
        CarouselService.GetCarouselNews().then(function (news) {
          _.forEach(news, function (item) {
            item.Image = angular.element(item.Image).attr('src');
            $scope.slickConfig.enabled = true; //enable the carousel
          })
          vm.news = news;
        });
        //console.log("configuration", customConfig);
      }
    }
  })();
});