"use strict";

window.Negotium = window.Negotium || {};
window.Negotium.Boost = window.Negotium.Boost || {};

Negotium.Boost.Carousel = function (webPartId) {
  var partName = "Carousel";

  Negotium.Boost.Carousel.Modules = Negotium.Boost.Carousel.Modules || {}
  Negotium.Boost.Carousel.Modules = {
    App: Negotium.Boost.Manager.getModuleName() + '.' + partName + '.App',
    Controller: Negotium.Boost.Manager.getModuleName() + '.' + partName + '.Controller',
    Directive: Negotium.Boost.Manager.getModuleName() + '.' + partName + '.Directive',
    Service: Negotium.Boost.Manager.getModuleName() + '.' + partName + '.Service'
  }

  var requirePaths = [];
  requirePaths[Negotium.Boost.Carousel.Modules.App] = partName + '/' + partName + '.Module';
  requirePaths[Negotium.Boost.Carousel.Modules.Controller] = partName + '/' + partName + '.Controller';
  requirePaths[Negotium.Boost.Carousel.Modules.Service] = partName + '/' + partName + '.Service';
  requirePaths[Negotium.Boost.Carousel.Modules.Directive] = partName + '/' + partName + '.Directive';

  //Vendor dependencies. See /packages/files.xml for uploaded files on SharePoint
  define('angular', [], function () { return window.angular; }); // Grab the existing angular from prerequisites 
  define('jquery', [], function () { return window.jQuery; });
  requirePaths["lodash"] = '../bower_components/lodash/lodash.min';
  requirePaths["moment"] = '../bower_components/moment/moment.min';
  requirePaths["moment-timezone"] = '../bower_components/moment-timezone/moment-timezone-with-data.min';
  requirePaths["angularMoment"] = '../bower_components/angular-moment/angular-moment.min';
  requirePaths["ngAnimate"] = '../bower_components/angular-animate/angular-animate.min';
  requirePaths["ngAria"] = '../bower_components/angular-aria/angular-aria.min';
  requirePaths["ngMaterial"] = '../bower_components/angular-material/angular-material.min';
  requirePaths["ngMessages"] = '../bower_components/angular-messages/angular-messages.min';
  requirePaths["slick"] = '../bower_components/slick-carousel/slick.min';
  requirePaths["slickCarousel"] = '../bower_components/angular-slick-carousel/angular-slick';

  /**
   * Initialized and instantiate the Boost
   */
  function initialize() {
    //----------------------------------------------------------------------
    // Configuring the required external scripts
    //----------------------------------------------------------------------
    require.config({
      baseUrl: Negotium.Boost.Manager.getBaseUrl(),
      paths: requirePaths
    });

    require([Negotium.Boost.Carousel.Modules.App, Negotium.Boost.Carousel.Modules.Controller, Negotium.Boost.Carousel.Modules.Directive], function () {
      SP.SOD.executeFunc('sp.js', 'SP.ClientContext', function () {
        //----------------------------------------------------------------------
        // Getting the current Boost Config
        //----------------------------------------------------------------------
        var boostConfig = Negotium.Boost.Manager.getBoostProperties(webPartId, partName);

        //----------------------------------------------------------------------
        // Creating a module with the required configuration information
        //----------------------------------------------------------------------
        angular
          .module('Negotium.Boost.Carousel.Properties', [])
          .value('customProperties', {
            webPartId: webPartId,
            languageId: _spPageContextInfo.currentLanguage
          })
          .value('customConfig', boostConfig);

        //----------------------------------------------------------------------
        // Building the webpart selector
        //----------------------------------------------------------------------
        var currentAppSelector = ".ms-WPBody[webpartid='" + webPartId + "'] .Carousel";

        //----------------------------------------------------------------------
        // Bootstraping the application injecting the custom properties
        //----------------------------------------------------------------------
        angular.bootstrap(jQuery(currentAppSelector), ['Negotium.Boost.Carousel', 'Negotium.Boost.Carousel.Properties']);
        console.log("[Carousel] App Loaded");
      });
    });
  }

  /**
   * Returns the Editor Pane Title to be displayed
   */
  function getEditorTitle() {
    //----------------------------------------------------------------------
    // Returns the Editor Pane Title to be displayed
    //----------------------------------------------------------------------
    return "Carousel Options"
  }

  /**
   * Returns the necessary Editor controls for the Editor Pane
   * @param  {any} properties
   */
  function getPropertyEditors(properties) {
    var deferred = jQuery.Deferred();
    var editors = [];
    var finalProperties = {};
    var fieldsMapping = {
      'Title': 'Title',
      'Path': 'Path',
      'Image': 'PublishingImage',
      'ArticleAbstract': 'ArticleAbstractOWSMTXT',
      'DisplayStartDate': 'StartDate',
      'DisplayEndDate': 'EndDate',
      'ForceDisplay': 'ForceDisplay',
      'Department': 'owstaxIdFSJDepartment'
    };
    var defaults = {
      width: '100%',
      height: '100%',
      numberOfSlides: '4',
      targetContentTypes: 'Corporate News',
      fieldsMapping: angular.toJson(fieldsMapping)
    };

    properties = properties === null ? {} : properties; //defensive programming    
    angular.extend(finalProperties, defaults, properties); // merge defaults and dynamic options
    //----------------------------------------------------------------------
    // Adding the editors to the Array
    //----------------------------------------------------------------------

    editors.push(Negotium.Boost.Manager.buildTextboxEditor(finalProperties.width, 'width', 'Width', defaults.width));
    editors.push(Negotium.Boost.Manager.buildTextboxEditor(finalProperties.height, 'height', 'Height', defaults.height));
    editors.push(Negotium.Boost.Manager.buildTextboxEditor(finalProperties.numberOfSlides, 'numberOfSlides', 'Max number of slides', defaults.numberOfSlides));
    editors.push(Negotium.Boost.Manager.buildTextboxEditor(finalProperties.targetContentTypes, 'targetContentTypes', 'Content Types to query (comma separated values)', defaults.targetContentTypes));
    editors.push(Negotium.Boost.Manager.buildTextboxEditor(finalProperties.fieldsMapping, 'fieldsMapping', 'Fields', defaults.fieldsMapping));
    deferred.resolve(editors);



    return deferred.promise();
  }

  return {
    initialize: initialize,
    getPropertyEditors: getPropertyEditors,
    getEditorTitle: getEditorTitle
  }
}