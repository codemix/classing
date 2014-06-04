!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.Classing=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
"use strict";


/**
 * Main entry point
 */

function Classing (name, descriptors) {
  return Classing.create(name, descriptors);
}

module.exports = exports = Classing;

/**
 * Make a class with the given property descriptors.
 *
 * @param  {Object}   descriptors An object containing the property descriptors for the class.
 * @return {Function}             The created class.
 */
Classing.create = function (name, descriptors) {
  if (name && typeof name === 'string') {
    descriptors = descriptors || {};
  }
  else {
    descriptors = name || {};
    name = 'Class';
  }

  var Class = this.makeConstructor(name);

  this.makeStatic(Class, descriptors);
  this.makePrototype(Class, descriptors);

  return Class;
};

/**
 * Make a constructor for a class.
 *
 * @param  {String} name The name of the class.
 * @return {Function}    The constructor function.
 */
Classing.makeConstructor = function (name) {
  var body = 'return function ' + name + ' (config) {' +
             '  if (!(this instanceof ' + name + ')) {' +
             '    return new ' + name + '(config);' +
             '  }' +
             '  this.applyDefaults();' +
             '  if (config) { this.configure(config); }' +
             '  this.initialize();' +
             '};';
  return new Function(body)(); // jshint ignore:line
};

/**
 * Make the static methods for a class.
 *
 * @param  {Function} Class        The class itself.
 * @param  {Object}   descriptors  The property descriptors for the class.
 */
Classing.makeStatic = function (Class, descriptors) {
  var Classing = this; // to allow subclassing
  Object.defineProperties(Class, {
    /**
     * Create a new instance of the class.
     */
    create: {
      configurable: true,
      value: function (properties) {
        return new Class(properties);
      }
    },
    /**
     * Get the descriptors of the class.
     */
    descriptors: {
      value: descriptors
    },
    /**
     * Define a new property on the class.
     */
    defineProperty: {
      configurable: true,
      value: function (name, descriptor, skipReload) {
        descriptor = descriptor || {value: null};
        if (typeof descriptor === 'function') {
          // this is a method
          descriptor = {
            enumerable: false,
            configurable: true,
            writable: true,
            value: descriptor
          };
        }

        if (descriptor.value === undefined && !(descriptor.get || descriptor.set)) {
          descriptor.value = null;
        }

        if (descriptor.writable == null && descriptor.value !== undefined) {
          descriptor.writable = true;
        }
        if (descriptor.enumerable == null) {
          descriptor.enumerable = true;
        }
        if (descriptor.configurable == null) {
          descriptor.configurable = true;
        }
        descriptors[name] = descriptor;
        Object.defineProperty(this.prototype, name, descriptor);
        if (!skipReload) {
          this.updateAutoGeneratedFunctions();
        }
        return this;
      }
    },
    /**
     * Define a list of properties on the class.
     */
    defineProperties: {
      configurable: true,
      value: function (items) {
        if (!items) {
          return this;
        }
        var keys = Object.keys(items),
            total = keys.length,
            key, i;

        for (i = 0; i < total; i++) {
          key = keys[i];
          this.defineProperty(key, items[key], true);
        }
        this.updateAutoGeneratedFunctions();
        return this;
      }
    },
    /**
     * Inherit descriptors from another class.
     */
    inherits: {
      configurable: true,
      value: function (Super) {
        var keys = Object.keys(Super),
            total = keys.length,
            key, i;


        for (i = 0; i < total; i++) {
          key = keys[i];
          if (!this.hasOwnProperty(key)) {
            this[key] = Super[key];
          }
        }
        var superDescriptors = Super.descriptors || {};
        keys = Object.keys(superDescriptors);
        total = keys.length;
        for (i = 0; i < total; i++) {
          key = keys[i];
          if (!descriptors.hasOwnProperty(key)) {
            descriptors[key] = superDescriptors[key];
          }
        }
        descriptors.super = {
          enumerable: false,
          value: Super.prototype
        };
        this.prototype = Object.create(Super.prototype, descriptors);
        this.prototype.constructor = this;
        // don't overwrite custom toString functions if supplied.
        if (!descriptors.hasOwnProperty('toString')) {
          Object.defineProperty(Class.prototype, 'toString', {
            configurable: true,
            writable: true,
            value: Class.makeToString(descriptors)
          });
        }
        this.updateAutoGeneratedFunctions();

        return this;
      }
    },
    /**
     * Create a new class which extends from this one.
     */
    extend: {
      configurable: true,
      value: function (config) {
        var Child = Classing.create(config);
        Child.inherits(this);
        return Child;
      }
    },
    /**
     * Mix the properties from a source object into this one.
     * @type {Object}
     */
    mixin: {
      configurable: true,
      value: function (source) {
        var keys = Object.keys(source),
            total = keys.length,
            combined = {},
            key, i;

        for (i = 0; i < total; i++) {
          key = keys[i];
          combined[key] = {
            value: source[key]
          };
        }
        this.defineProperties(combined);
        return this;
      }
    },
    /**
     * Update any autogenerated functions.
     */
    updateAutoGeneratedFunctions: {
      configurable: true,
      value: function () {
        if (!this.prototype.applyDefaults || this.prototype.applyDefaults.isAutoGenerated) {
          this.prototype.applyDefaults = this.makeApplyDefaults(descriptors);
        }
        if (!this.prototype.configure || this.prototype.configure.isAutoGenerated) {
          this.prototype.configure = this.makeConfigure(descriptors);
        }
        if (!this.prototype.toJSON || this.prototype.toJSON.isAutoGenerated) {
          this.prototype.toJSON = this.makeToJSON(descriptors);
        }
      }
    },
    /**
     * Make an efficient `applyDefaults()` function to set
     * the default property values for a class instance.
     *
     * @param  {Object} descriptors The descriptors for the object.
     * @return {Function}           The `applyDefaults()` function.
     */
    makeApplyDefaults: {
      configurable: true,
      value: function (descriptors) {
        var keys = Object.keys(descriptors),
            total = keys.length,
            body = '',
            key, descriptor, i, suffix, value;

        for (i = 0; i < total; i++) {
          key = keys[i];
          descriptor = descriptors[key];
          if (descriptor.hasOwnProperty('default')) {
            suffix = '';
            if (typeof descriptor.default === 'function') {
              suffix = '(this)';
            }
            if (/^([\w|_|$]+)$/.test(key)) {
              body += 'this.' + key + ' = this.constructor.descriptors.' + key + '.default' + suffix + ';';
            }
            else {
              body += 'this["' + key + '"] = this.constructor.descriptors["' + key + '"].default' + suffix + ';';
            }
          }
          else if (descriptor.bind) {
            if (/^([\w|_|$]+)$/.test(key)) {
              if (descriptor.bind === true) {
                value = 'this';
              }
              else {
                value = 'this.constructor.descriptors.' + key + '.bind';
              }
              body += 'this.' + key + ' = this.' + key + '.bind(' + value + ');';
            }
            else {
              if (descriptor.bind === true) {
                value = 'this';
              }
              else {
                value = 'this.constructor.descriptors["' + key + '"].bind';
              }
              body += 'this["' + key + '"] = this["' + key + '"].bind(' + value + ');';
            }
          }
        }
        var applyDefaults = new Function(body); // jshint ignore:line
        applyDefaults.isAutoGenerated = true;
        return applyDefaults;
      }
    },
    /**
     * Make an efficient `configure()` function to set property values
     * for an object based on the given descriptors.
     *
     * @param  {Object} descriptors The descriptors for the object.
     * @return {Function}           The `configure()` function.
     */
    makeConfigure: {
      configurable: true,
      value: function (descriptors) {
        var keys = Object.keys(descriptors),
            total = keys.length,
            body = '',
            key, descriptor, i;

        for (i = 0; i < total; i++) {
          key = keys[i];
          descriptor = descriptors[key];
          if (descriptor.writable || descriptor.hasOwnProperty('set')) {
            if (/^([\w|_|$]+)$/.test(key)) {
              body += 'this.' + key + ' = config.' + key + ' !== undefined ? config.' + key + ' : this.' + key + ';'; // jshint ignore:line
            }
            else {
              body += 'this["' + key + '"] = config["' + key + '"] !== undefined ? config["' + key + '"] : this["' + key + '"];'; // jshint ignore:line
            }
          }
        }
        var configure = new Function('config', body); // jshint ignore:line
        configure.isAutoGenerated = true;
        return configure;
      }
    },
    /**
     * Make an efficient `toJSON()` function for an object
     * based on the given descriptors.
     *
     * @param  {Object} descriptors The descriptors for the object.
     * @return {Function}           The `toJSON()` function.
     */
    makeToJSON: {
      configurable: true,

      value: function (descriptors) {
        var keys = Object.keys(descriptors),
            total = keys.length,
            parts = [],
            key, descriptor, i;

        for (i = 0; i < total; i++) {
          key = keys[i];
          descriptor = descriptors[key];
          if (descriptor.enumerable || descriptor.enumerable == null) {
            if (/^([\w|_|$]+)$/.test(key)) {
              parts.push(key + ': this.' + key);
            }
            else {
              parts.push('"' + key + '": this["' + key + '"]');
            }
          }
        }
        var toJSON = new Function('return {' + parts.join(',') + '};'); // jshint ignore:line
        toJSON.isAutoGenerated = true;
        return toJSON;
      }
    },
    /**
     * Make an efficient `toString()` function for the class.
     *
     * @return {Function} The `toString()` function.
     */
    makeToString: {
      configurable: true,
      value: function () {
        var fn = new Function('return "[object ' + this.name + ']";'); // jshint ignore:line
        fn.isAutoGenerated = true;
        return fn;
      }
    }
  });
};

/**
 * Make a prototype for a class, based on the given descriptors.
 *
 * @param  {Function} Class       The class itself.
 * @param  {Object} descriptors   The descriptors for the class.
 */
Classing.makePrototype = function (Class, descriptors) {
  if (!descriptors.initialize) {
    descriptors.initialize = function () {};
  }
  Class.defineProperties(descriptors);
  Class.updateAutoGeneratedFunctions();

  // don't overwrite custom toString functions if supplied.
  if (!descriptors.hasOwnProperty('toString')) {
    Object.defineProperty(Class.prototype, 'toString', {
      configurable: true,
      writable: true,
      value: Class.makeToString(descriptors)
    });
  }
};

/**
 * Extend the class factory.
 *
 * @param  {Object} descriptors The descriptors for the new class factory.
 * @return {Classing}            The class factory
 */
Classing.extend = function (descriptors) {
  descriptors = descriptors || {};

  function Child (descriptors) {
    return Child.create(descriptors);
  }


  var keys = Object.keys(this),
      total = keys.length,
      i, key;


  for (i = 0; i < total; i++) {
    key = keys[i];
    Child[key] = this[key];
  }

  keys = Object.keys(descriptors);
  total = keys.length;


  for (i = 0; i < total; i++) {
    key = keys[i];
    if (typeof descriptors[key] === "function") {
      descriptors[key] = {
        configurable: true,
        value: descriptors[key]
      };
    }
  }

  Object.defineProperties(Child, descriptors);
  Child.super = this;
  return Child;
};
},{}]},{},[1])
(1)
});