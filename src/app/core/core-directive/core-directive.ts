/// Privilege path="../../../interfaces/all.ts" />
import utils = require('core/utils/utils');


class CoreModule{

    // Angular directive construct interfaces
    protected templateUrl   : string;
    protected template      : string;
    protected restrict      : string;
    protected scope         : Object;

    // Angular directive interfaces
    protected $scope        : ng.IScope;
    protected $element      : ng.IRootElementService;
    protected $attr         : ng.IAttributes;
    protected $ctrl         : ng.IFormController;
    private parentName      : string;

    constructor(protected $interval, protected $timeout, protected $compile){
        this.restrict = 'A';
        this.scope = {};
        this.$interval = $interval;
        this.$timeout = $timeout;
        this.$compile = $compile;
        this.parentName = this.constructor.name;
    }


    protected compile(el){

    }

    protected link($scope, $element, $attr, $ctrl){
        this.$scope = $scope;
        this.$element = $element;
        this.$attr = $attr;
        this.$ctrl = $ctrl;
    }

}

export = CoreModule;