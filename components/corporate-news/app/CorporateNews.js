"use strict";

window.Negotium = window.Negotium || {};
window.Negotium.Boost = window.Negotium.Boost || {};

Negotium.Boost.CorporateNews = function (webPartId) {
  var partName = "CorporateNews";
  
  Negotium.Boost.CorporateNews.Modules = Negotium.Boost.CorporateNews.Modules || {}
  Negotium.Boost.CorporateNews.Modules = {
    App: Negotium.Boost.Manager.getModuleName() + '.' + partName + '.App',
    Controller: Negotium.Boost.Manager.getModuleName() + '.' + partName + '.Controller',
    Directive: Negotium.Boost.Manager.getModuleName() + '.' + partName + '.Directive',
    Service: Negotium.Boost.Manager.getModuleName() + '.' + partName + '.Service'
  }
  
  var requirePaths = [];
  requirePaths[Negotium.Boost.CorporateNews.Modules.App] = partName + '/' + partName + '.Module';
  requirePaths[Negotium.Boost.CorporateNews.Modules.Controller] = partName + '/' + partName + '.Controller';
  requirePaths[Negotium.Boost.CorporateNews.Modules.Service] = partName + '/' + partName + '.Service';
  requirePaths[Negotium.Boost.CorporateNews.Modules.Directive] = partName + '/' + partName + '.Directive';
 
 //Vendor dependencies. See /packages/files.xml for uploaded files on SharePoint
  define('angular', [], function() {return window.angular;}); // Grab the existing angular from prerequisites 
  define('jquery',[],function(){return window.jQuery;});
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
    
    require([Negotium.Boost.CorporateNews.Modules.App, Negotium.Boost.CorporateNews.Modules.Controller, Negotium.Boost.CorporateNews.Modules.Directive], function() {
      SP.SOD.executeFunc('sp.js', 'SP.ClientContext', function () {
        //----------------------------------------------------------------------
        // Getting the current Boost Config
        //----------------------------------------------------------------------
        var boostConfig = Negotium.Boost.Manager.getBoostProperties(webPartId, partName);
        
        //----------------------------------------------------------------------
        // Creating a module with the required configuration information
        //----------------------------------------------------------------------
        angular
          .module('Negotium.Boost.CorporateNews.Properties', [])
          .value('customProperties', {
            webPartId: webPartId,
            languageId: _spPageContextInfo.currentLanguage
          })
          .value('customConfig', boostConfig || {});
    
        //----------------------------------------------------------------------
        // Building the webpart selector
        //----------------------------------------------------------------------
        var currentAppSelector = ".ms-WPBody[webpartid='" + webPartId + "'] .CorporateNews";
        
        //----------------------------------------------------------------------
        // Bootstraping the application injecting the custom properties
        //----------------------------------------------------------------------
        angular.bootstrap(jQuery(currentAppSelector), ['Negotium.Boost.CorporateNews', 'Negotium.Boost.CorporateNews.Properties']);
        console.log("[CorporateNews] App Loaded");
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
    return "Corporate News Options"
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
      'Title':'Title',
      'Path':'Path',
      'Image':'PublishingImage',
      'ArticleAbstract':'ArticleAbstractOWSMTXT',
      'DisplayStartDate':'StartDate',
      'DisplayEndDate':'EndDate',
      'Department':'owstaxIdFSJDepartment'
    };
    var defaults = {
      numberOfNews:3,
      targetContentTypes: 'Corporate News',
      fieldsMapping:angular.toJson(fieldsMapping)
    };

    properties = properties === null ? {} :properties; //defensive programming    
    angular.extend(finalProperties,defaults,properties); // merge defaults and dynamic options
    //----------------------------------------------------------------------
    // Adding the editors to the Array
    //----------------------------------------------------------------------
    editors.push(Negotium.Boost.Manager.buildTextboxEditor(finalProperties.numberOfNews, 'numberOfNews', 'Max number of news', defaults.numberOfNews));
    editors.push(Negotium.Boost.Manager.buildTextboxEditor(finalProperties.targetContentTypes, 'targetContentTypes', 'Content Types to query (comma separated values)', defaults.targetContentTypes));
    editors.push(Negotium.Boost.Manager.buildTextboxEditor(finalProperties.fieldsMapping, 'fieldsMapping', 'Search Fields mapping', defaults.fieldsMapping));
    deferred.resolve(editors);
    

    return deferred.promise();
  }

  return {
    initialize: initialize,
    getPropertyEditors: getPropertyEditors,
    getEditorTitle: getEditorTitle
  }
}