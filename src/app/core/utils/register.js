///<reference path="../../../typing/all.d.ts"/>
define(["require", "exports"], function (require, exports) {
    var Register = (function () {
        function Register() {
        }
        Register.prototype.register = function (appName) {
            var app = angular.module(appName);
            return {
                directive: directive,
                controller: controller,
                service: service,
                provider: provider,
                factory: factory,
                has: has
            };
            function has(name) {
                var ifHas = false;
                angular.forEach(Register.registered, function (rName) {
                    if (name === rName)
                        ifHas = true;
                });
                return ifHas;
            }
            function directive(name, constructorFn) {
                constructorFn = _normalizeConstructor(constructorFn);
                if (!constructorFn.prototype.compile) {
                    // create an empty compile function if none was defined.
                    constructorFn.prototype.compile = function () { };
                }
                var originalCompileFn = _cloneFunction(constructorFn.prototype.compile);
                // Decorate the compile method to automatically return the link method (if it exists)
                // and bind it to the context of the constructor (so `this` works correctly).
                // This gets around the problem of a non-lexical "this" which occurs when the directive class itself
                // returns `this.link` from within the compile function.
                _override(constructorFn.prototype, 'compile', function () {
                    return function () {
                        originalCompileFn.apply(this, arguments);
                        if (constructorFn.prototype.link) {
                            // bug fix: $.extend to make sure it will use the new this instance
                            // Useful in multi instantiated directives
                            return constructorFn.prototype.link.bind($.extend({}, this));
                        }
                    };
                });
                var factoryArray = _createFactoryArray(constructorFn);
                app.directive(name, factoryArray);
                Register.registered.push(name);
                return this;
            }
            function controller(name, contructorFn) {
                app.controller(name, contructorFn);
                Register.registered.push(name);
                return this;
            }
            function service(name, contructorFn) {
                app.service(name, contructorFn);
                Register.registered.push(name);
                return this;
            }
            function provider(name, constructorFn) {
                app.provider(name, constructorFn);
                Register.registered.push(name);
                return this;
            }
            function factory(name, constructorFn) {
                constructorFn = _normalizeConstructor(constructorFn);
                var factoryArray = _createFactoryArray(constructorFn);
                app.factory(name, factoryArray);
                Register.registered.push(name);
                return this;
            }
            /**
             * If the constructorFn is an array of type ['dep1', 'dep2', ..., constructor() {}]
             * we need to pull out the array of dependencies and add it as an $inject property of the
             * actual constructor function.
             * @param input
             * @returns {*}
             * @private
             */
            function _normalizeConstructor(input) {
                var constructorFn;
                if (input.constructor === Array) {
                    //
                    var injected = input.slice(0, input.length - 1);
                    constructorFn = input[input.length - 1];
                    constructorFn.$inject = injected;
                }
                else {
                    constructorFn = input;
                }
                return constructorFn;
            }
            /**
             * Convert a constructor function into a factory function which returns a new instance of that
             * constructor, with the correct dependencies automatically injected as arguments.
             *
             * In order to inject the dependencies, they must be attached to the constructor function with the
             * `$inject` property annotation.
             *
             * @param constructorFn
             * @returns {Array.<T>}
             * @private
             */
            function _createFactoryArray(constructorFn) {
                // get the array of dependencies that are needed by this component (as contained in the `$inject` array)
                var args = constructorFn.$inject || [];
                var factoryArray = args.slice(); // create a copy of the array
                // The factoryArray uses Angular's array notation whereby each element of the array is the name of a
                // dependency, and the final item is the factory function itself.
                factoryArray.push(function () {
                    var args = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        args[_i - 0] = arguments[_i];
                    }
                    //return new constructorFn(...args);
                    var instance = new (Function.prototype.bind.apply(constructorFn, [null].concat(args)))();
                    for (var key in instance) {
                        instance[key] = instance[key];
                    }
                    return instance;
                });
                return factoryArray;
            }
            /**
             * Clone a function
             * @param original
             * @returns {Function}
             */
            function _cloneFunction(original) {
                return function () {
                    return original.apply(this, arguments);
                };
            }
            /**
             * Override an object's method with a new one specified by `callback`.
             * @param object
             * @param methodName
             * @param callback
             */
            function _override(object, methodName, callback) {
                object[methodName] = callback(object[methodName]);
            }
        };
        Register.registered = [];
        return Register;
    })();
    return Register;
});
