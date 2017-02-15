



define([Negotium.Boost.CorporateNews.Modules.App, Negotium.Boost.CorporateNews.Modules.Service], function () {
    (function () {
        'use strict';
        angular
            .module('Negotium.Boost.CorporateNews')
            .controller('CorporateNewsController', CorporateNewsController)

        CorporateNewsController.$inject = ['_', 'CorporateNewsService', 'customConfig', '$timeout', '$scope', 'spSiteUrl', '$mdSidenav', '$log'];
        function CorporateNewsController(_, CorporateNewsService, customConfig, $timeout, $scope, spSiteUrl, $mdSidenav, $log) {
            var vm = this;

            vm.Department = "";

            vm.siteUrl = null;
            vm.news = [];
            vm.newsCount = 0;
            vm.currentNew = null;
            vm.numberOfImagesToDisplay = customConfig.numberOfSlides;
            vm.width = customConfig.width;
            vm.height = customConfig.height;

            vm.OpenRightSideNav = openRightSideNav
            vm.CloseRightSideNav = closeRightSideNav
            vm.FetchPreviousNew = fetchPreviousNew
            vm.FetchNextNew = fetchNextNew

            activate();

            function activate() {
                vm.siteUrl = spSiteUrl;
                CorporateNewsService.GetNews().then(function (news) {
                    //console.log('CorporateNewsController: news', news);
                    _.forEach(news, function (item) {
                        item.Image = angular.element(item.Image).attr('src');
                    })
                    vm.news = news;
                    vm.newsCount = news.length;
                });
            }

            function openRightSideNav(currentItem) {
                vm.currentNew = angular.copy(currentItem);
                $mdSidenav('CorporateNews-SideNav').toggle();
            }

            function closeRightSideNav() {
                $mdSidenav('CorporateNews-SideNav').close();
            }

            function fetchPreviousNew() {
                var index = _.findIndex(vm.news, function (item) { return item.Path == vm.currentNew.Path })

                do {
                    index = (index == 0) ? vm.newsCount - 1 : index - 1;
                }
                while (vm.Department && vm.news[index].Department.indexOf(vm.Department) == -1)

                vm.currentNew = angular.copy(vm.news[index]);
            }

            function fetchNextNew() {
                var index = _.findIndex(vm.news, function (item) { return item.Path == vm.currentNew.Path })

                do {
                    index = (index == vm.newsCount - 1) ? 0 : index + 1;
                }
                while (vm.Department && vm.news[index].Department.indexOf(vm.Department) == -1)

                vm.currentNew = angular.copy(vm.news[index]);
            }


        }

    })();
});