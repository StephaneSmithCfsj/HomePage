"use strict";

window.Negotium = window.Negotium || {};
window.Negotium.Boost = window.Negotium.Boost || {};

Negotium.Boost.Calendar = function (webPartId) {
  var partName = "Calendar";

  Negotium.Boost.Calendar.Modules = Negotium.Boost.Calendar.Modules || {}
  Negotium.Boost.Calendar.Modules = {
    App: Negotium.Boost.Manager.getModuleName() + '.' + partName + '.App',
    Controller: Negotium.Boost.Manager.getModuleName() + '.' + partName + '.Controller',
    Directive: Negotium.Boost.Manager.getModuleName() + '.' + partName + '.Directive',
    Service: Negotium.Boost.Manager.getModuleName() + '.' + partName + '.Service'
  }

  var requirePaths = [];
  requirePaths[Negotium.Boost.Calendar.Modules.App] = partName + '/' + partName + '.Module';
  requirePaths[Negotium.Boost.Calendar.Modules.Controller] = partName + '/' + partName + '.Controller';
  requirePaths[Negotium.Boost.Calendar.Modules.Service] = partName + '/' + partName + '.Service';

  //Vendor dependencies. See /packages/files.xml for uploaded files on SharePoint
  define('angular', [], function () { return window.angular; }); // Grab the existing angular from prerequisites 
  requirePaths["lodash"] = '../bower_components/lodash/lodash.min';
  requirePaths["moment"] = '../bower_components/moment/moment.min';
  requirePaths["moment-timezone"] = '../bower_components/moment-timezone/moment-timezone-with-data.min';
  requirePaths["angularMoment"] = '../bower_components/angular-moment/angular-moment.min';
  requirePaths["ngAnimate"] = '../bower_components/angular-animate/angular-animate.min';
  requirePaths["ngAria"] = '../bower_components/angular-aria/angular-aria.min';
  requirePaths["ngMaterial"] = '../bower_components/angular-material/angular-material.min';
  requirePaths["ngMessages"] = '../bower_components/angular-messages/angular-messages.min';

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

    require([Negotium.Boost.Calendar.Modules.App, Negotium.Boost.Calendar.Modules.Controller], function () {
      SP.SOD.executeFunc('sp.js', 'SP.ClientContext', function () {
        //----------------------------------------------------------------------
        // Getting the current Boost Config
        //----------------------------------------------------------------------
        var boostConfig = Negotium.Boost.Manager.getBoostProperties(webPartId, partName);

        //----------------------------------------------------------------------
        // Creating a module with the required configuration information
        //----------------------------------------------------------------------
        angular
          .module('Negotium.Boost.Calendar.Properties', [])
          .value('customProperties', {
            webPartId: webPartId,
            languageId: _spPageContextInfo.currentLanguage
          })
          .value('customConfig', boostConfig);

        //----------------------------------------------------------------------
        // Building the webpart selector
        //----------------------------------------------------------------------
        var currentAppSelector = ".ms-WPBody[webpartid='" + webPartId + "'] .Calendar";

        //----------------------------------------------------------------------
        // Bootstraping the application injecting the custom properties
        //----------------------------------------------------------------------
        angular.bootstrap(jQuery(currentAppSelector), ['Negotium.Boost.Calendar', 'Negotium.Boost.Calendar.Properties']);
        console.log("[Calendar] App Loaded");
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
    return "Events Calendar Options"
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
      'Description': 'Description',
      'Location': 'Location',
      'EventDate': 'StartDate',
      'EndDate': 'EndDate',
      'AllDayEvent': 'AllDayEvent',
      'Department': 'owstaxIdFSJDepartment'
    };
    var defaults = {
      width: '100%',
      height: '100%',
      numberOfEvents: '10',
      targetContentTypes: 'FSJ Event',
      fieldsMapping: angular.toJson(fieldsMapping)
    };

    properties = properties === null ? {} : properties; //defensive programming    
    angular.extend(finalProperties, defaults, properties); // merge defaults and dynamic options
    //----------------------------------------------------------------------
    // Adding the editors to the Array
    //----------------------------------------------------------------------

    editors.push(Negotium.Boost.Manager.buildTextboxEditor(finalProperties.width, 'width', 'Width', defaults.width));
    editors.push(Negotium.Boost.Manager.buildTextboxEditor(finalProperties.height, 'height', 'Height', defaults.height));
    editors.push(Negotium.Boost.Manager.buildTextboxEditor(finalProperties.numberOfEvents, 'numberOfEvents', 'Max number of events', defaults.numberOfEvents));
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