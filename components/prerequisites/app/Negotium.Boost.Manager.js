window.Negotium = window.Negotium || {};
window.Negotium.Boost = window.Negotium.Boost || {};

/**
 * Ensures the initialization of the BoostManager in the good
 * sequence with SharePoint MDS strategies
 */
jQuery(document).ready(function () {
    SP.SOD.executeFunc('sp.js', 'SP.ClientContext', function () {
        Negotium.Boost.Manager = new Negotium.Boost.BoostManager();
        Negotium.Boost.Manager.initializeBoosts();
    });
});

/**
 * Boost Manager
 */
Negotium.Boost.BoostManager = function () {
  
  /**
   * Gets the BaseUrl of the Boost Manager
   */
  var getBaseUrl = function() {
    return _spPageContextInfo.siteAbsoluteUrl + "/SiteAssets/Negotium/Boost/";
  }
  
  /**
   * Gets the BaseUrl of the Boost Manager
   */
  var getModuleName = function() {
    return "Negotium.Boost";
  }
  
  /**
   * Gets the Boost container identified by its WebPart Id
   * @param  {any} webPartId
   */
  var getBoostContainer = function(webPartId) {
    return jQuery(".ms-WPBody[webpartid='" + webPartId + "']");
  }
  
  /**
   * Initialize the part or the editor for the part
   */
    
  var initializeBoosts = function() {
    //----------------------------------------------------------------------
    //If the SharePoint WebPart is Open, Initialize the Custom ToolPane
    //----------------------------------------------------------------------
    if(isEditorOpen()) {
      //----------------------------------------------------------------------
      // Gets the ToolPane DOM element
      //----------------------------------------------------------------------
      var body = jQuery(".ms-TPBody").first();
      
      //----------------------------------------------------------------------
      // If the ToolPane exists, initialize the ToolPane
      //----------------------------------------------------------------------
      if (body.length > 0) {
        initializeToolPane();
      }
    } else {
      //----------------------------------------------------------------------
      // Get all the Boost available on the page
      //----------------------------------------------------------------------
      var parts = jQuery(".negotium-boost");
      
      //----------------------------------------------------------------------
      // For Each Boost, initialize the Boost
      //----------------------------------------------------------------------
      parts.each(function (index, value) {
        initializeBoost(jQuery(value));
      });
    }
  }

  /**
   * Get the Boost HTML Template and Class and calls the Boost initialize method
   * @param  {any} boostElement
   */
  var initializeBoost = function(boostElement) {
    //----------------------------------------------------------------------
    // Getting the reference to the current Boost
    //----------------------------------------------------------------------
    var partName = boostElement.attr("data-part-name");
    var partGroup = boostElement.attr("data-part-group") ? boostElement.attr("data-part-group") : "Negotium";
    var webPartElem = boostElement.closest(".ms-WPBody");
    var webPartId = webPartElem.attr("webpartid");

    //----------------------------------------------------------------------
    // Getting the Boost HTML Template
    //----------------------------------------------------------------------
    getBoostTemplate(partGroup , partName).then(function(data) {
      //----------------------------------------------------------------------
      // Inject the template into the Boost element 
      //----------------------------------------------------------------------
      boostElement.html(data);
      
      //----------------------------------------------------------------------
      // Get a reference to the Boost CodeBehind class constructor
      //----------------------------------------------------------------------
      getBoostClass(partGroup , partName).then(function(Boost) {
        //----------------------------------------------------------------------
        // Create an instance of the CodeBehind Boost class
        //----------------------------------------------------------------------
        var instance = new Boost(webPartId);

        //----------------------------------------------------------------------
        // Initialize the Boost
        //----------------------------------------------------------------------
        instance.initialize();
      }, function(errorMessage) {
        //----------------------------------------------------------------------
        // Inject the error message into the Boost element 
        //----------------------------------------------------------------------
        boostElement.html(errorMessage);
      });
    }, function(errorMessage) {
      //----------------------------------------------------------------------
      // Inject the error message into the Boost element 
      //----------------------------------------------------------------------
      boostElement.html("Unable to load boost template");
    });
  }
  
  /**
   * Get the HTML Template of the Boost
   * @param  {any} partName
   * @return async Async call to the Boost HTML Template
   */
  var getBoostTemplate = function(partGroup , partName) {
    //----------------------------------------------------------------------
    // Make an async call to get the Boost HTML Template
    //----------------------------------------------------------------------
    return jQuery.get(buildBoostArtifactUrl(partName, 'html'));
  }
  
  /**
   * Get the HTML Template of the Boost
   * @param  {any} partName
   * @return async Async call to the Boost HTML Template
   */
  var getBoostEditorTemplate = function(partName) {    
    //----------------------------------------------------------------------
    // Make an async call to get the Boost HTML Template
    //----------------------------------------------------------------------
    return jQuery.get(getBaseUrl() + partName + '/' + partName + '.Editor' + '.html');
  }
  
  /**
   * Loads the Boost class
   * @param  {any} partName
   */
  var getBoostClass = function(partGroup , partName) {
    //----------------------------------------------------------------------
    // Build a deferred Object to manage the return of the Boost Class
    //----------------------------------------------------------------------
    var deferred = jQuery.Deferred();

    //----------------------------------------------------------------------
    // Check if the script has already been loaded
    //----------------------------------------------------------------------
    var instance = null
    if(window[partGroup] && window[partGroup].Boost) {
      // Negotium.Boost.YammerFeed , Robic.Boost.Deadlines ...
      instance = window[partGroup].Boost[partName];
    }
    
    //----------------------------------------------------------------------
    // If the Boost has already been loaded, deferred the existing Boost
    //----------------------------------------------------------------------
    if (instance) {
      deferred.resolve(instance);
    } else {
      //----------------------------------------------------------------------
      // Make an async call to get the script file containing the Boost Class
      //----------------------------------------------------------------------
      var url = buildBoostArtifactUrl(partName, "js");
      
      //----------------------------------------------------------------------
      // Getting the Boost Class
      //----------------------------------------------------------------------
      jQuery.ajax({
        crossDomain: true,
        dataType: "script",
        url: url,
        cache: true,
        success: function() {
          var instance = window[partGroup].Boost[partName];
          deferred.resolve(instance);
        },
        error: function() {
          deferred.reject("Unable to load Boost Class");
        }
      });
    }

    //----------------------------------------------------------------------
    // Returns the deferred version of the Boost Class
    //----------------------------------------------------------------------
    return deferred.promise();
  }
  
  /**
   * Builds the Boost Artifact URL
   * @param  {string} partName
   * @param  {string} extension
   * @return {string} The artifact URL
   */
  var buildBoostArtifactUrl = function(partName, extension) {
    //----------------------------------------------------------------------
    // Gets the artifact based on its name and its extension
    //----------------------------------------------------------------------
    return getBaseUrl() + partName + "/" + partName + "." + extension;
  };
    
  /**
   * Get the current properties for the Boost
   * @param  {any} container
   * @param  {any} boostName
   */
  var getBoostProperties = function(webPartId, boostName) {
    //----------------------------------------------------------------------
    // Gets the Boost container
    //----------------------------------------------------------------------
    var container = getBoostContainer(webPartId);
    var partContainer = container.find(".negotium-boost");
    
    //----------------------------------------------------------------------
    // Gets the Boost properties
    //----------------------------------------------------------------------
    var properties = partContainer.attr("data-part-properties");    
    
    //----------------------------------------------------------------------
    // Returns the properties of the Boost
    //----------------------------------------------------------------------
    return properties ? JSON.parse(properties) : null;
  }

  /**
   * Validates if the WebPart Editor is open
   * @return {boolean} If the WebPart Editor is open
   */
  var isEditorOpen = function() {
    //----------------------------------------------------------------------
    // Gets actual page Form name
    //----------------------------------------------------------------------
    var formName = (typeof window.MSOWebPartPageFormName === "string") ? window.MSOWebPartPageFormName : "aspnetForm";
    var form = window.document.forms[formName];

    //----------------------------------------------------------------------
    // Returns if the form is in a Design Mode or Edit Mode
    //----------------------------------------------------------------------
    return form && ((form.MSOLayout_InDesignMode && form.MSOLayout_InDesignMode.value) || (typeof window.MSOLayout_IsWikiEditMode === "function" && MSOLayout_IsWikiEditMode()));
  }
  
  /**
   * Initializes the ToolPane by adding the Custom Properties panel
   */
  var initializeToolPane = function() {
    var body = jQuery(".ms-TPBody").first();

    var webPartId = body[0].id.split("_").slice(-5).join("-");
    var webPartElement = jQuery(".ms-WPBody[webpartid='" + webPartId + "']");
    var boostElement = webPartElement.find(".negotium-boost");
    var boostName = boostElement.attr("data-part-name");
    var partProperties = getBoostProperties(webPartId, boostName);

    //----------------------------------------------------------------------
    // Get a reference to the Boost CodeBehind class constructor
    //----------------------------------------------------------------------
    getBoostClass("Negotium",boostName).then(function(Boost) {
      //----------------------------------------------------------------------
      // Create an instance of the CodeBehind Boost class
      //----------------------------------------------------------------------
      var instance = new Boost(webPartId);

      //----------------------------------------------------------------------
      // Get the Boost PropertyEditors
      //----------------------------------------------------------------------
      instance.getPropertyEditors(partProperties).then(function(propertyEditors) {
        //----------------------------------------------------------------------
        // Add editor UI elements to the editor zone
        //----------------------------------------------------------------------
        if (propertyEditors && propertyEditors.length > 0) {
            addEditorsToToolPane(instance.getEditorTitle(), webPartId, boostName, propertyEditors);
        }
      }, function() {        
        //----------------------------------------------------------------------
        // Fail but does nothing
        //----------------------------------------------------------------------
      });
    }, function() {
      //----------------------------------------------------------------------
      // Fail but does nothing
      //----------------------------------------------------------------------
    });
  }
  
  /**
   * Adds the BoostEditorControls to the ToolPane
   * @param  {any} editorTitle
   * @param  {any} webPartId
   * @param  {any} boostName
   * @param  {any} editors
   */
  function addEditorsToToolPane(editorTitle, webPartId, boostName, editors) {
    var sectionTitle = editorTitle;
    var id = String.format("ctl00_MSOTlPn_EditorZone_Edit0g_{0}_{1}Category", webPartId, sectionTitle);

    //----------------------------------------------------------------------
    // Building the Category UI Element
    //----------------------------------------------------------------------
    var header = 
      '<table cellspacing=\"0\" cellpadding=\"0\" style=\"width:100%;border-collapse:collapse;\">' +
        '<tbody>' +
          '<tr>' +
            '<td>' + 
              '<div class=\"UserSectionTitle\"><a id=\"' + id + '_IMAGEANCHOR\" href=\"#\" onkeydown=\"WebPartMenuKeyboardClick(this, 13, 32, event);\" style=\"cursor:hand\" ' +
              'onclick=\"javascript:MSOTlPn_ToggleDisplay(\'' + id + '\', \'' + id + '_IMAGE\', \'' + id + '_ANCHOR\', \'Expand category: ' + sectionTitle + '\', \'Collapse category: ' +
              sectionTitle + '\',\'' + id + '_IMAGEANCHOR\'); return false;\" title=\"Expand category: ' + sectionTitle + '\">&nbsp;<img id=\"' + id + '_IMAGE\" alt=\"Expand category: ' +
              sectionTitle + '\" border=\"0\" src=\"/_layouts/15/images/TPMax2.gif\">&nbsp;</a><a tabindex=\"-1\" onkeydown=\"WebPartMenuKeyboardClick(this, 13, 32, event);\" id=\"' +
              id + '_ANCHOR\" style=\"cursor:hand\" onclick=\"javascript:MSOTlPn_ToggleDisplay(\'' + id + '\', \'' + id + '_IMAGE\', \'' + id + '_ANCHOR\', \'Expand category: ' +
              sectionTitle + '\', \'Collapse category: ' + sectionTitle + '\',\'' + id + '_IMAGEANCHOR\'); return false;\" title=\"Expand category: ' + sectionTitle + '\"> &nbsp;' +
              sectionTitle + '</a></div>' + 
            '</td>' +
          '</tr>' +
        '</tbody>' + 
      '</table>';

    //----------------------------------------------------------------------
    // Building the Inputs UI Elements
    //----------------------------------------------------------------------
    var inputFields = header +
                '<div>' +
                    '<div class="ms-propGridTable" id="' + id + '" style="display: none;">' +
                        '<table cellspacing=\"0\" cellpadding=\"0\" style=\"width:100%;\"><tbody>';

    for (var i = 0; i < editors.length; i++) {
        var editor = editors[i];

        inputFields += '<tr><td>' +
                                '<div class=\"UserSectionHead\"><label>' + editor.caption + '</label></div>' +
                                '<div class=\"UserControlGroup\">' + editor.control + '</div>'

        if (i < editors.length - 1) {
            inputFields += '<div style=\"width:100%\" class=\"UserDottedLine\"></div></td></tr>';
        }
        else {
            inputFields += '</td></tr>';
        }
    }

    //----------------------------------------------------------------------
    // Injecting the Additional Category and its Inputs to the ToolPane
    //----------------------------------------------------------------------
    var body = jQuery(".ms-TPBody").first();
    body.append(inputFields);
    
    //----------------------------------------------------------------------
    // Attach save event handlers
    //---------------------------------------------------------------------- 
    attachSaveEventHandlers(webPartId, boostName);
  }

  /**
   * Attaches the Save Boost Properties handler to the Save and Apply buttons
   * @param  {any} webPartId
   * @param  {any} boostName
   */
  function attachSaveEventHandlers(webPartId, boostName) {
    //----------------------------------------------------------------------
    // Gets the Command Bar from the ToolPane
    //----------------------------------------------------------------------
    var commandBar = jQuery('#MSOTlPn_CommandUI');
    
    //----------------------------------------------------------------------
    // Gets all the required buttons from the Command Bar
    //----------------------------------------------------------------------
    var buttons = commandBar.find("input[name$='AppBtn'],input[name$='OKBtn']");
    
    buttons.click(function () {
      //----------------------------------------------------------------------
      // On button click, save the Boost Properties
      //----------------------------------------------------------------------
      savePartProperties(webPartId, boostName);
    });
  }
    
  /**
   * Builds a new version of the script editor content and injects it into the hidden field.
   * SharePoint will natively persist new content.
   * @param  {any} webPartId
   * @param  {any} boostName
   */
  function savePartProperties(webPartId, boostName) {
    var body = jQuery(".ms-TPBody").first();

    //----------------------------------------------------------------------
    // Gets all Boost property editors
    //----------------------------------------------------------------------
    var inputs = body.find(".negotium-property-editor");

    //----------------------------------------------------------------------
    // Retrieve all the properties values by building the Boost Properties object
    //----------------------------------------------------------------------
    var properties = {};
    inputs.each(function (index, value) {
      var input = jQuery(value);
      var propName = input.attr("data-property-name");
      var propVal = input.val();
      properties[propName] = propVal;
    });

    //----------------------------------------------------------------------
    // Generates the new Boost Editor control
    //----------------------------------------------------------------------
    var boost = jQuery("<div>");
    boost.addClass("negotium-boost");
    boost.attr("data-part-name", boostName);
    boost.attr("data-part-properties", JSON.stringify(properties));

    //----------------------------------------------------------------------
    // Find the hidden input of the current Boost
    //----------------------------------------------------------------------
    var hidden = jQuery("input:hidden[id^='" + webPartId + "']");
    hidden.each(function (index, value) {
      //----------------------------------------------------------------------
      // Assign its value to the generated HTML of the Boost
      //----------------------------------------------------------------------
      jQuery(value).val(boost[0].outerHTML);
    });
  }
    
  /**
   * Builds the Object representing a BoostEditControl of type Choice
   * @param  {any} propertyValue
   * @param  {any} propertyName
   * @param  {any} propertyTitle
   * @param  {any} choices
   * @param  {any} defaultValue
   */
  function buildSelectEditor(propertyValue, propertyName, propertyTitle, choices, defaultValue) {
    
    //----------------------------------------------------------------------
    // Gets the value of the selected choice of the Boost properties
    //----------------------------------------------------------------------
    var value = propertyValue ? propertyValue : defaultValue;
    
    //----------------------------------------------------------------------
    // Builds the Choices control
    //----------------------------------------------------------------------
    var control = [];
    control.push(String.format("<select id='{0}Select' class='negotium-property-editor' data-property-name='{0}' style='width:60%'>", propertyName));
    
    jQuery.each(choices, function(index, choice) {
      var selected = choice.value == value ? "selected" : "";
      var option = String.format("  <option value='{0}' {2}>{1}</option>", choice.value, choice.title, selected);
      control.push(option);
    });
    
    control.push("</select>");
    
    //----------------------------------------------------------------------
    // Returns the BoostEditControl
    //----------------------------------------------------------------------
    return { 
      name: propertyName, 
      caption: propertyTitle, 
      control: control.join("\r\n") 
    };
  }
    
  /**
   * Builds the Object representing a BoostEditorControl of type Textbox
   * @param  {any} propertyValue
   * @param  {any} propertyName
   * @param  {any} propertyTitle
   * @param  {any} defaultValue
   */
  function buildTextboxEditor(propertyValue, propertyName, propertyTitle, defaultValue) {
    return { 
      name: propertyName, 
      caption: propertyTitle, 
      control: String.format("<input type='text' class='negotium-property-editor' data-property-name='{0}' style='width:50%' value='{1}'/>", propertyName, propertyValue ? propertyValue : defaultValue) 
    };
  }

  return {
    getBaseUrl: getBaseUrl,
    getModuleName: getModuleName,
    initializeBoosts: initializeBoosts,
    getBoostProperties: getBoostProperties,
    buildSelectEditor: buildSelectEditor,
    buildTextboxEditor: buildTextboxEditor        
  }
}