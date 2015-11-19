define(["require", "exports"], function (require, exports) {
    var CoreModule = (function () {
        function CoreModule($interval, $timeout, $compile) {
            this.$interval = $interval;
            this.$timeout = $timeout;
            this.$compile = $compile;
            this.restrict = 'A';
            this.scope = {};
            this.$interval = $interval;
            this.$timeout = $timeout;
            this.$compile = $compile;
            this.parentName = this.constructor.name;
        }
        CoreModule.prototype.compile = function (el) {
        };
        CoreModule.prototype.link = function ($scope, $element, $attr, $ctrl) {
            this.$scope = $scope;
            this.$element = $element;
            this.$attr = $attr;
            this.$ctrl = $ctrl;
        };
        return CoreModule;
    })();
    return CoreModule;
});
