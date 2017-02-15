(function () {
    var cacheTimeout = 1800;
    var currentTime;
    var timeStamp;
    var buildSecondaryNavigation;
    // Register script for MDS if possible
    if ("undefined" != typeof g_MinimalDownload && g_MinimalDownload && (window.location.pathname.toLowerCase()).endsWith("/_layouts/15/start.aspx") && "undefined" != typeof asyncDeltaManager) {
        // Register script for MDS if possible
        RegisterModuleInit("startup.js", Initialize); //MDS registration
        Initialize(); //non MDS run
    } else {
        Initialize();
    }

    function Initialize() {
        console.log(" - Initializing Side Navigation");

        var siteUrl = window.location.protocol + "//" + window.location.host
            + _spPageContextInfo.siteServerRelativeUrl;
        var baseUrl = siteUrl + "/SiteAssets/Negotium/bower_components";
        var templateUrl = siteUrl + "/SiteAssets/Negotium/Boost/SideNavigation/templates/sidenav.html";

        require.config({
            baseUrl: baseUrl,
            paths: {
                "jquery": "jquery/dist/jquery.min",
                "handlebars": "handlebars/handlebars.min"
            }
        });
        require(["jquery", "handlebars"], function (jq, Handlebars) {
            var $sideNavBox = $("#sideNavBox");

            if ($sideNavBox.is(':visible')) {
                //$sideNavBox.hide();
            }

            injectSideNavigation(Handlebars, "#contentBox .layout-row .homeSideNav", templateUrl, siteUrl);
        });
    }

    function injectSideNavigation(Handlebars, elementSelector, templateUrl, siteUrl) {
        $.when(
            getCompiledTemplate(Handlebars, templateUrl),
            getListItems(siteUrl, "Side Navigation Links"),
            getUserProfile(siteUrl)
        ).then(function (template, links, userProfile) {
            var html = template({ UserProfile: userProfile, SideNavItems: links });
            $(html).appendTo(elementSelector);
            console.log("[Side Navigation] App Loaded");
        });
    }

    function getCompiledTemplate(Handlebars, templateUrl) {
        return $.get(templateUrl).then(function (tpl) {
            return Handlebars.compile(tpl);
        });
    }

    function getListItems(url, listname, query) {
        return $.ajax({
            url: url + "/_api/web/lists/getbytitle('" + listname + "')/GetItems(query=@v1)?@v1={'ViewXml':'<View><Query></Query></View>'}",
            method: "Post",
            headers: {
                "Accept": "application/json; odata=minimalmetadata",
                "X-RequestDigest": $("#__REQUESTDIGEST").val()
            }
        })
            .then(function (data) {
                return data.value;
            });
    }

    function getUserProfile(url) {
        return $.ajax({
            url: url + "/_api/SP.UserProfiles.PeopleManager/GetMyProperties",
            method: "GET",
            headers: { "Accept": "application/json; odata=minimalmetadata" }
        })
            .then(function (data) {
                return data;
            });

    }

})();

function FilterDepartment(departmentLabel, departmentGuid) {
    //console.log("Filter by department: '"+departmentLabel +"' --- ID: "+departmentGuid);

    var department = departmentLabel == "Corporation" ? "" : departmentGuid;

    var calendarScope = angular.element($('.negotium-boost [ng-controller^="CalendarController"]')).scope();
    calendarScope.calendar.Department = department;
    calendarScope.$apply();

    var corpoNewsScope = angular.element($('.negotium-boost [ng-controller^="CorporateNewsController"]')).scope();
    corpoNewsScope.corporateNews.Department = department;
    corpoNewsScope.$apply();

}
