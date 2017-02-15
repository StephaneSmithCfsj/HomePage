define([Negotium.Boost.Carousel.Modules.App], function () {
    'use strict';
    angular
        .module('Negotium.Boost.Carousel')
        .factory('CarouselService', CarouselServiceFactory);


    CarouselServiceFactory.$inject = ['$http', 'moment', 'customConfig', '_'];
    function CarouselServiceFactory($http, moment, customConfig, _) {
        var defaultSearchFields = ['Title', 'Path', 'PublishingImage', 'StartDate', 'EndDate', 'ForceDisplay', 'owstaxIdFSJDepartment'];
        var fieldsMapping = angular.fromJson(customConfig.fieldsMapping);
        var extractMappedResults = dataMapper(fieldsMapping);
        var searchParams = {
            rowLimit: customConfig.numberOfSlides,
            contentType: customConfig.targetContentTypes,
            fields: getSearchFields()
        };

        var service = {
            GetCarouselNews: getCarouselNews
        };

        return service;

        function getCarouselNews(department) {
            return searchRequestBuilder(buildNewsQuery(searchParams, department))
                .then(function (relevantResults) {
                    return parseNews(extractMappedResults(relevantResults.Table.Rows.results));
                });
        }

        function getSearchFields() {
            return _.chain(fieldsMapping).map().mergeWith(defaultSearchFields).value();
        }

        function dataPathFormatter(path) {
            var formatObject = function (spSearchObject) {
                return _.chain(spSearchObject)
                    .keyBy('Key').mapValues('Value').value() //Index the objects raw fields by Key property
            }
            return function (rawSeachResults) {
                return _.chain(rawSeachResults).map(path) // Extract every fields from the search result and make them clean
                    .map(formatObject).value();
            }
        }

        function dataPicker(searchFields) {
            return function (formattedResults) {
                return _.chain(formattedResults)
                    .map(function (singleResult) {
                        return _.pick(singleResult, searchFields);
                    }).value();
            }
        }

        function fieldMapper(fieldsMapping) {
            return function (formattedData) {
                return _.chain(formattedData)
                    .map(function (obj) {
                        var schema = _.clone(fieldsMapping);
                        return _.mapValues(schema, function (searchField) {
                            return obj[searchField]
                        })

                    }).value();
            }
        }

        function dataMapper(fieldsMapping) {
            var searchFields = _.map(fieldsMapping);
            var formattedRelevantResults = dataPathFormatter('Cells.results');
            var pickSearchDataFrom = dataPicker(searchFields); // init the extractor with the search fields            
            var mapSearchDataToFields = fieldMapper(fieldsMapping);
            return function (searchResults) {
                //console.log('searchResults', searchResults);
                var searchData = pickSearchDataFrom(formattedRelevantResults(searchResults));
                //console.log('searchData', searchData);
                return mapSearchDataToFields(searchData);
            };
        }

        function parseNews(News) {
            return _.forEach(News, function (value) {
                if (value.Department.indexOf("|Bâtiments") > -1)
                    value.Department = "Batiments";
                else if (value.Department.indexOf("|Corporation") > -1)
                    value.Department = "Corporation";
                else if (value.Department.indexOf("|Environnement") > -1)
                    value.Department = "Environnement";
                else if (value.Department.indexOf("|Évènements") > -1)
                    value.Department = "Evenements";
                else if (value.Department.indexOf("|Ressources") > -1)
                    value.Department = "Ressources";
                else if (value.Department.indexOf("|Corporation") > -1)
                    value.Department = "Corporation";
            });
        }

        function buildNewsQuery(params, department) {
            var querytext = "contenttype:\"" + params.contentType + "\"  (StartDate<=today EndDate>=today) OR ForceDisplay:1"
            if (department)
                querytext += " owstaxIdFSJDepartment:\"" + department + "\""

            return "QueryText='" + querytext + "'&selectProperties='" + params.fields.join(',') + "'&rowlimit=" + params.rowLimit
        }

        // Build an HTTP request to be executed against SharePoint Search API
        function searchRequestBuilder(query) {
            return $http({
                url: '/_api/search/query?' + query,
                method: "GET",
                headers: { "Accept": "application/json; odata=verbose" }
            }).then(
                function success(response) {
                    return response.data.d.query.PrimaryQueryResult.RelevantResults;
                },
                function error() {
                    console.log('Carousel: An error has occured when executing the request', query);
                });
        }
    }
});