/**
 * Created by Filip on 2016-11-03.
 */
'use strict';

var app = angular.module('suppliers-list-app', ['angularModalService']);
app.service('PaymentsService', function ($http) {

    this.getPayments = function (search_query, rating, page) {
        return $http.get("http://test-api.kuria.tshdev.io/?query=" + search_query + "&rating=" + rating + "&" + page)
            .then(function (response) {
                if (typeof response.data === 'object') {
                    return response.data;
                }
                return false;
            });
    };

    this.setPage = function (value) {
        return 'page=' + value;
    };

    this.getPage = function (value) {
        return value.match(/\d+$/)[0];
    };

});

app.controller("PaymentsController", function ($scope, PaymentsService, ModalService) {

    $scope.error = false;

    $scope.resetFilters = function () {
        $scope.search = "";
        $scope.pounds = "";
        $scope.currentPage = PaymentsService.setPage('0');
        $scope.updatePayments();
    };

    $scope.updatePayments = function () {
        PaymentsService.getPayments($scope.search, $scope.pounds, $scope.currentPage).then(function (response) {
            if (response) {
                $scope.error = false;
                $scope.response_data = response;
                $scope.payments = $scope.response_data['payments'];
                $scope.pagination = $scope.response_data['pagination'];
            }
            else $scope.error = true;
        });
    };

    $scope.selectPage = function (value) {
        $scope.currentPage = value;
        $scope.updatePayments();
    };

    $scope.getPageValue = function () {
        return PaymentsService.getPage($scope.currentPage);
    };

    $scope.goToLastPage = function () {
        $scope.selectPage($scope.pagination['links'][$scope.pagination['total'] - 1]);
    };

    $scope.showModal = function (payment) {

    };

    $scope.resetFilters();


    $scope.show = function (payment) {
        ModalService.showModal({
            templateUrl: 'modal.html',
            controller: "ModalController",
            inputs: {
                payment: payment
            }
        }).then(function (modal) {
            modal.element.modal();
            modal.close.then(function (result) {
                $scope.message = "You said " + result;
            });
        });
    };
});

app.filter('num', function () {
    return function (input) {
        return parseInt(input, 10);
    };
});

app.filter('decimal2comma', [
    function () {
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
    }]);

app.filter('range', function () {
    return function (input, total) {
        total = parseInt(total);

        for (var i = 0; i < total; i++) {
            input.push(i);
        }

        return input;
    };
});

app.controller('ModalController', function ($scope, payment, close) {

    $scope.close = function (result) {
        close(result, 500);
    };

    $scope.test = '1234312543414543';
    $scope.payment = payment;
});