define([Negotium.Boost.Calendar.Modules.App, Negotium.Boost.Calendar.Modules.Service], function () {
  (function () {
    'use strict';

    angular
      .module('Negotium.Boost.Calendar')
      .controller('CalendarController', CalendarController);

    CalendarController.$inject = ['EventsService', 'moment', 'spWebUrl', '_', 'customConfig', '$timeout', '$scope', '$mdSidenav', '$window'];
    function CalendarController(EventsService, moment, spWebUrl, _, customConfig, $timeout, $scope, $mdSidenav, $window) {
      var vm = this;
      vm.siteUrl = spWebUrl;
      vm.pickerDate = moment().toDate();
      vm.events = [];
      vm.allDayEvents = [];
      vm.timedEvents = [];
      vm.eventsCount = 0;
      vm.currentEvent = null;
      vm.Department = "";
      vm.LoadDateEvents = getDateEvents
      vm.getEventHourFromDate = getEventHourFromDate;
      vm.filterBySelectedDate = filterBySelectedDate;

      vm.OpenRightSideNav = openRightSideNav;
      vm.CloseRightSideNav = closeRightSideNav;
      vm.FetchPreviousEvent = fetchPreviousEvent;
      vm.FetchNextEvent = fetchNextEvent;


      getDateEvents();

      function getDateEvents() {
        return EventsService.GetEvents(moment(vm.pickerDate).format("L")).then(function (events) {
          vm.events = events
          vm.timedEvents = _.reject(events, 'AllDayEvent');
          vm.allDayEvents = _.filter(events, 'AllDayEvent');
          vm.eventsCount = events.length;
        });
      }

      function getEventHourFromDate(eventDate) {
        var localTime = moment(eventDate).add(moment().utcOffset(), 'minutes')
        //  var localTime  = moment.utc(eventDate).toDate();
        //return localTime.format('HH:mm');
        return moment(eventDate).format('HH:mm');
      }

      function filterBySelectedDate(filterSourceDate, filterDate) {
        return moment(filterSourceDate).isSame(filterDate, 'day');
      }


      function openRightSideNav(currentItem) {
        vm.currentEvent = angular.copy(currentItem);
        $mdSidenav('Events-SideNav').toggle();
      }

      function closeRightSideNav() {
        $mdSidenav('Events-SideNav').close();
      }

      function fetchPreviousEvent() {
        var index = _.findIndex(vm.events, function (item) { return item.Path == vm.currentEvent.Path })

        do {
          index = (index == 0) ? vm.eventsCount - 1 : index - 1;
        }
        while (vm.Department && vm.events[index].Department.indexOf(vm.Department) == -1)

        vm.currentEvent = angular.copy(vm.events[index]);
      }

      function fetchNextEvent() {
        var index = _.findIndex(vm.events, function (item) { return item.Path == vm.currentEvent.Path })

        do {
          index = (index == vm.eventsCount - 1) ? 0 : index + 1;
        }
        while (vm.Department && vm.events[index].Department.indexOf(vm.Department) == -1)

        vm.currentEvent = angular.copy(vm.events[index]);
      }

    }

    angular
      .module('Negotium.Boost.Calendar')
      .filter('truncate', function () {
        /**
         * @param  {boolean} wordwise - if true, cut only by words bounds
         * @param  {string} max -  max length of the text, cut to this number of chars
         * @param  {string} tail - add this string to the input string if the string was cut
         */
        return function (value, wordwise, max, tail) {
          if (!value) return '';

          max = parseInt(max, 10);
          if (!max) return value;
          if (value.length <= max) return value;

          value = value.substr(0, max);
          if (wordwise) {
            var lastspace = value.lastIndexOf(' ');
            if (lastspace != -1) {
              if (value.charAt(lastspace - 1) == '.' || value.charAt(lastspace - 1) == ',') {
                lastspace = lastspace - 1;
              }
              value = value.substr(0, lastspace);
            }
          }
          return value + (tail || ' …');
        };
      });

    angular
      .module('Negotium.Boost.Calendar')
      .filter('filterBySelectedDate', function (moment, _) {
        return function (items, property, value) {
          return _.filter(items, function (item) {
            return moment(item[property]).isSame(value, 'day');
          })

        }
      });
  })();
});