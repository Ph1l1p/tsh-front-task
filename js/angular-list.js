/**
 * Created by Filip on 2016-11-03.
 */

'use strict';

var app = angular.module('suppliersListApp', ['angularModalService']);

app.directive('wbSelect2', function () {
    return {
        restrict: 'A',
        scope: {
            'ngModel': '='
        },
        link: function (scope, element, attrs) {
            element.select2({
                placeholder: "Select pound rating",
                allowClear: false,
                minimumResultsForSearch: Infinity,
                //dropdownParent: $('.filters-bar')
                dropdownParent: angular.element(document.getElementsByClassName("filters-bar"))
            });

            scope.$watch('ngModel', function (newValue, oldValue) {
                element.select2({
                    placeholder: "Select pound rating",
                    allowClear: false,
                    minimumResultsForSearch: Infinity,
                    //dropdownParent: $('.filters-bar')
                    dropdownParent: angular.element(document.getElementsByClassName("filters-bar"))
                }).select('val', newValue);
            });
        }
    };
});

app.service('PaymentsService', function ($http) {

    var urlPath = "http://test-api.kuria.tshdev.io/?";

    this.getPayments = function (link) {
        return $http.get(urlPath + link)
            .then(function (response) {
                if (typeof response.data === 'object') {
                    return response.data;
                }
                return false;
            });
    };

    this.filterPayments = function (search, rating) {
        var link = '';
        var search_not_empty = false;
        if (search) {
            link += 'query=' + search;
            search_not_empty = true;
        }
        if (rating) {
            if (search_not_empty) link += '&';
            link += 'rating=' + rating;
        }
        return this.getPayments(link);
    };

});

app.controller("PaymentsController", function ($scope, PaymentsService, ModalService) {

    $scope.error = false;

    $scope.resetFilters = function () {
        $scope.search = "";
        $scope.pounds = "";
        $scope.goToPage();
    };

    $scope.goToPage = function (link) {
        if (!link) link = '';
        PaymentsService.getPayments(link).then(function (response) {
            if (response) {
                $scope.error = false;
                $scope.response_data = response;
                $scope.payments = $scope.response_data['payments'];
                $scope.pagination = $scope.response_data['pagination'];
            }
            else $scope.error = true;
        });
    };

    $scope.applyFilters = function () {
        PaymentsService.filterPayments($scope.search, $scope.pounds)
            .then(function (response) {
                if (response) {
                    $scope.error = false;
                    $scope.response_data = response;
                    $scope.payments = $scope.response_data['payments'];
                    $scope.pagination = $scope.response_data['pagination'];
                }
                else $scope.error = true;
            });
    };

    $scope.show = function (payment) {
        ModalService.showModal({
            templateUrl: 'modal.html',
            controller: "ModalController",
            inputs: {
                payment: payment
            }
        }).then(function (modal) {
            modal.element.modal();
        });
    };

    $scope.goToPage();

});

app.filter('num', function () {
    return function (input) {
        return parseInt(input, 10);
    };
});

app.filter('decimal2comma', function () {
    return function (input) {
        var ret = (input) ? input.toString().replace(".", ",") : null;
        if (ret) {
            var decArr = ret.split(",");
            if (decArr.length > 1) {
                var dec = decArr[1].length;
                if (dec === 1) {
                    ret += "0";
                }
            }
        }
        return ret;
    };
});

app.filter('range', function () {
    return function (input, total) {
        total = parseInt(total);

        for (var i = 0; i < total; i++) {
            input.push(i);
        }

        return input;
    };
});

app.filter('paginationFilter', function () {
    return function (items, from, to) {
        var filtered = {};
        angular.forEach(items, function (value, key) {
            if (key >= from && key < to) {
                filtered[key] = value;
            }
        });
        return filtered;
    };
});


app.controller('ModalController', function ($scope, payment, close) {

    $scope.close = function (result) {
        close(result, 500);
    };
    $scope.payment = payment;
});