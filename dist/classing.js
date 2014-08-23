!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.Classing=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
'use strict';

function ClassFactory () {}

module.exports = ClassFactory;

var prototype = ClassFactory.prototype;

/**
 * Extend the ClassFactory class.
 *
 * @param  {Object} methods     The methods for the class factory.
 *
 * @return {Function} The child class factory.
 */
ClassFactory.extend = function (methods) {
  var ChildFactory = function ClassFactory () {};

  each(this, function (value, key) {
    ChildFactory[key] = value;
  });

  ChildFactory.prototype = Object.create(this.prototype);
  ChildFactory.prototype.constructor = ChildFactory;

  if (methods) {
    each(methods, function (value, key) {
      ChildFactory.prototype[key] = value;
    });
  }
  ChildFactory.__super__ = this;
  ChildFactory.prototype.__super__ = this.prototype;
  return ChildFactory;
};

/**
 * Create a new class.
 *
 * @param  {String} name              The name of the new class.
 * @param  {Object} descriptors       The instance property descriptors.
 * @param  {Object} staticDescriptors The static property descriptors.
 *
 * @return {Function} The class function.
 */
prototype.create = function (name, descriptors, staticDescriptors) {
  if (name && typeof name === 'object') {
    staticDescriptors = descriptors;
    descriptors = name;
    name = 'Class';
  }
  else if (!name) {
    name = 'Class';
    descriptors = descriptors || {};
    staticDescriptors = staticDescriptors || {};
  }
  descriptors = this.normalizeDescriptors(descriptors || {});
  staticDescriptors = this.normalizeDescriptors(staticDescriptors || {});
  var Class = this.createConstructor(name);
  Object.defineProperties(Class, this.createStatic(Class, descriptors, staticDescriptors));
  Class.prototype = {};
  Object.defineProperties(Class.prototype, this.createPrototype(Class, descriptors));
  Class.prototype.constructor = Class;
  return Class;
};


/**
 * Normalize the given descriptors
 *
 * @param  {Object} descriptors The raw descriptors.
 *
 * @return {Object} The normalized descriptors.
 */
prototype.normalizeDescriptors = function (descriptors) {
  var normalized = {},
      self = this;
  each(descriptors, function (descriptor, name) {
    normalized[name] = self.normalizeDescriptor(name, descriptor);
  });
  return normalized;
};

/**
 * Normalize a descriptor.
 *
 * @param  {String} name        The name of the descriptor.
 * @param  {mixed}  descriptor  The raw descriptor or value.
 *
 * @return {Object} The normalized descriptor.
 */
prototype.normalizeDescriptor = function (name, descriptor) {
  var normalized = {};

  if (descriptor === null || typeof descriptor !== 'object') {
    descriptor = {
      value: descriptor
    };
  }

  each(descriptor, function (value, key) {
    normalized[key] = value;
  });

  if (normalized.value === undefined &&
      normalized.get === undefined &&
      normalized.set === undefined
  ) {
    normalized.value = null;
  }

  if (normalized.enumerable === undefined &&
      typeof normalized.value !== 'undefined' &&
      typeof normalized.value !== 'function'
  ) {
    normalized.enumerable = true;
  }

  if (normalized.configurable === undefined) {
    normalized.configurable = true;
  }

  if (normalized.writable === undefined &&
      normalized.get === undefined &&
      normalized.set === undefined
  ) {
    normalized.writable = true;
  }

  return normalized;
};


/**
 * Create a constructor function for a class.
 *
 * @param  {String} name The name of the class.
 *
 * @return {Function} The constructor function.
 */
prototype.createConstructor = function (name) {
  var body = 'return function ' + name + ' (config) {\n\
                "use strict";\n\
                if (!(this instanceof ' + name + ')) {\n\
                  return new ' + name + '(config);\n\
                }\n\
                this.applyDefaults();\n\
                if (config) { this.configure(config); }\n\
                this.initialize();\n\
              };';
  return (new Function(body))(); // jshint ignore: line
};

/**
 * Create the prototype for a given class + descriptors.
 *
 * @param  {Function} Class       The class.
 * @param  {Object}   descriptors The property descriptors.
 *
 * @return {Object} The descriptors for the prototype.
 */
prototype.createPrototype = function (Class, descriptors) {
  var proto = this.createDefaultPrototype(Class, descriptors);
  each(descriptors, function (descriptor, name) {
    proto[name] = descriptor;
  });
  return proto;
};

/**
 * Create a prototype for the given Class + descriptors.
 *
 * @param  {Function} Class       The class.
 * @param  {Object}   descriptors The property descriptors.
 *
 * @return {Object} The descriptors for the default prototype.
 */
prototype.createDefaultPrototype = function (Class, descriptors) {
  return {
    initialize: {
      enumerable: false,
      configurable: false,
      writable: true,
      value: this.createInitialize(Class, descriptors)
    },
    applyDefaults: {
      enumerable: false,
      configurable: false,
      writable: true,
      value: this.createApplyDefaults(Class, descriptors)
    },
    configure: {
      enumerable: false,
      configurable: false,
      writable: true,
      value: this.createConfigure(Class, descriptors)
    },
    toJSON: {
      enumerable: false,
      configurable: false,
      writable: true,
      value: this.createToJSON(Class, descriptors)
    }
  };
};

/**
 * Create a dynamic function, accepts the same arguments as
 * the `Function` constructor, but marks it as an auto-generated function.
 *
 * @return {Function} The autogenerated function.
 */
prototype.createDynamicFunction = function () {
  var fn = Function.apply(undefined, arguments);
  fn.isAutoGenerated = true;
  return fn;
};


/**
 * Create an `initialize()` function for a class.
 *
 * @param  {Function} Class       The class.
 * @param  {Object}   descriptors The property descriptors.
 *
 * @return {Function} The initialize function.
 */
prototype.createInitialize = function (Class, descriptors) {
  return this.createDynamicFunction('"use strict";');
};

/**
 * Create an `applyDefaults` function for a class.
 *
 * @param  {Function} Class       The class.
 * @param  {Object}   descriptors The property descriptors.
 *
 * @return {Function} The applyDefaults function.
 */
prototype.createApplyDefaults = function (Class, descriptors) {
  var body = '';
  each(descriptors, function (descriptor, name) {
    var accessor = createAccessor(name),
        value;
    if (typeof descriptor.default === 'function') {
      body += 'this' + accessor + ' = descriptors' + accessor + '.default(this, ' + JSON.stringify(name) + ');\n';
    }
    else if (typeof descriptor.default !== 'undefined') {
      body += 'this' + accessor + ' = descriptors' + accessor + '.default;\n';
    }
    else if (typeof descriptor.bind !== 'undefined') {
      if (descriptor.bind === true) {
        value = 'this';
      }
      else {
        value = 'descriptors' + accessor + '.bind';
      }
      body += 'this' + accessor + ' = this' + accessor + '.bind(' + value + ');\n';
    }
  });

  if (body.length) {
    body = 'var descriptors = this.constructor["[[descriptors]]"];\n' + body;
  }
  return this.createDynamicFunction('"use strict";\n' + body);
};


/**
 * Create a `configure` function for a class.
 *
 * @param  {Function} Class       The class.
 * @param  {Object}   descriptors The property descriptors.
 *
 * @return {Function} The configure function.
 */
prototype.createConfigure = function (Class, descriptors) {
  var body = '"use strict";\n';
  each(descriptors, function (descriptor, name) {
    if (descriptor.writable || typeof descriptor.set === 'function') {
      var accessor = createAccessor(name);
      body += 'if (config' + accessor + ' !== undefined) {\n\
                  this' + accessor + ' = config' + accessor + ';\n\
               }\n';
    }
  });
  return this.createDynamicFunction('config', body);
};

/**
 * Create a `toJSON` function for a class.
 *
 * @param  {Function} Class       The class.
 * @param  {Object}   descriptors The property descriptors.
 *
 * @return {Function} The toJSON function.
 */
prototype.createToJSON = function (Class, descriptors) {
  var body = [];
  each(descriptors, function (descriptor, name) {
    if (descriptor.enumerable) {
      var accessor = createAccessor(name);
      body.push('  ' + JSON.stringify(name) + ': this' + accessor);
    }
  });

  return this.createDynamicFunction('"use strict";\nreturn {\n  ' + body.join(',\n  ') + '};\n');
};

/**
 * Create the static methods / properties for a class.
 *
 * @param  {Function} Class             The class.
 * @param  {Object}   descriptors       The property descriptors.
 * @param  {Object}   staticDescriptors The static property descriptors.
 *
 * @return {Object} The static descriptors.
 */
prototype.createStatic = function (Class, descriptors, staticDescriptors) {
  var context = this.createDefaultStatic(Class, descriptors, staticDescriptors),
      self = this;
  each(staticDescriptors, function (descriptor, name) {
    context[name] = descriptor;
  });

  return context;
};

/**
 * Create the default static methods / properties for a class.
 *
 * @param  {Function} Class             The class.
 * @param  {Object}   descriptors       The property descriptors.
 * @param  {Object}   staticDescriptors The static property descriptors.
 *
 * @return {Object} The default static descriptors.
 */
prototype.createDefaultStatic = function (Class, descriptors, staticDescriptors) {
  return {
    '[[descriptors]]': {
      enumerable: false,
      configurable: false,
      writable: true,
      value: descriptors
    },
    create: {
      enumerable: true,
      configurable: true,
      writable: true,
      value: this.createStaticCreate(Class, descriptors, staticDescriptors)
    },
    inherits: {
      enumerable: true,
      configurable: true,
      writable: true,
      value: this.createStaticInherits(Class, descriptors, staticDescriptors)
    },
    extend: {
      enumerable: true,
      configurable: true,
      writable: true,
      value: this.createStaticExtend(Class, descriptors, staticDescriptors)
    },
    mixin: {
      enumerable: true,
      configurable: true,
      writable: true,
      value: this.createStaticMixin(Class, descriptors, staticDescriptors)
    },
    defineProperty: {
      enumerable: true,
      configurable: true,
      writable: true,
      value: this.createStaticDefineProperty(Class, descriptors, staticDescriptors)
    },
    defineProperties: {
      enumerable: true,
      configurable: true,
      writable: true,
      value: this.createStaticDefineProperties(Class, descriptors, staticDescriptors)
    },
    getOwnPropertyDescriptor: {
      enumerable: true,
      configurable: true,
      writable: true,
      value: this.createStaticGetOwnPropertyDescriptor(Class, descriptors, staticDescriptors)
    }
  };
};

/**
 * Create a function which can create new instances of the class.
 *
 * @param  {Function} Class             The class.
 * @param  {Object}   descriptors       The property descriptors.
 * @param  {Object}   staticDescriptors The static property descriptors.
 *
 * @return {Function} The generated function.
 */
prototype.createStaticCreate = function (Class, descriptors, staticDescriptors) {
  return function create (config) {
    return new this(config);
  };
};

/**
 * Create a function which can add another class to the given class's inheritance chain.
 *
 * @param  {Function} Class             The class.
 * @param  {Object}   descriptors       The property descriptors.
 * @param  {Object}   staticDescriptors The static property descriptors.
 *
 * @return {Function} The generated function.
 */
prototype.createStaticInherits = function (Class, descriptors, staticDescriptors) {
  var factory = this;
  return function inherits (Super) {
    var self = this;
    each(Super, function (value, key) {
      if (!self.hasOwnProperty(key)) {
        self[key] = value;
      }
    });
    if (Super['[[descriptors]]'] && typeof Super['[[descriptors]]'] === 'object') {
      each(Super['[[descriptors]]'], function (descriptor, name) {
        if (self['[[descriptors]]'][name] === undefined) {
          self['[[descriptors]]'][name] = descriptor;
        }
      });
    }
    self.__super__ = Super;
    self.prototype = Object.create(Super.prototype, self['[[descriptors]]']);
    self.prototype.constructor = self;
    self.prototype.__super__ = Super.prototype;
    factory.updateDynamicFunctions(self, self['[[descriptors]]']);
    return self;
  };
};

/**
 * Create a function which can create a new class extending from this one.
 *
 * @param  {Function} Class             The class.
 * @param  {Object}   descriptors       The property descriptors.
 * @param  {Object}   staticDescriptors The static property descriptors.
 *
 * @return {Function} The generated function.
 */
prototype.createStaticExtend = function (Class, descriptors) {
  var factory = this;
  return function extend (name, descriptors, staticDescriptors) {
    if (name && typeof name === 'object') {
      staticDescriptors = descriptors || {};
      descriptors = name;
      name = this.name || 'Class';
    }
    else if (!name) {
      name = 'Class';
      descriptors = descriptors || {};
      staticDescriptors = staticDescriptors || {};
    }
    var Class = factory.create(name, descriptors, staticDescriptors);
    Class.inherits(this);
    return Class;
  };
};

/**
 * Create a function which can mix properties from an object into the prototype of the class.
 *
 * @param  {Function} Class             The class.
 * @param  {Object}   descriptors       The property descriptors.
 * @param  {Object}   staticDescriptors The static property descriptors.
 *
 * @return {Function} The generated function.
 */
prototype.createStaticMixin = function (Class, descriptors, staticDescriptors) {
  return function mixin (source) {
    var self = this,
        combined = {};
    each(source, function (value, key) {
      combined[key] = {
        value: value
      };
    });
    this.defineProperties(combined);
    return this;
  };
};


/**
 * Create a `defineProperties()` function for the class.
 *
 * @param  {Function} Class             The class.
 * @param  {Object}   descriptors       The property descriptors.
 * @param  {Object}   staticDescriptors The static property descriptors.
 *
 * @return {Function} The generated function.
 */
prototype.createStaticDefineProperties = function (Class, descriptors, staticDescriptors) {
  return function defineProperties (obj) {
    if (!obj) {
      return this;
    }
    var self = this;
    each(obj, function (descriptor, name) {
      self.defineProperty(name, descriptor);
    });
    return this;
  };
};


/**
 * Create a `defineProperty()` function for the class.
 *
 * @param  {Function} Class             The class.
 * @param  {Object}   descriptors       The property descriptors.
 * @param  {Object}   staticDescriptors The static property descriptors.
 *
 * @return {Function} The generated function.
 */
prototype.createStaticDefineProperty = function (Class, descriptors, staticDescriptors) {
  var factory = this;
  return function defineProperty (name, descriptor) {
    this['[[descriptors]]'][name] = factory.normalizeDescriptor(name, descriptor);
    Object.defineProperty(this.prototype, name, this['[[descriptors]]'][name]);
    factory.updateDynamicFunctions(Class, Class['[[descriptors]]']);
    return this;
  };
};

/**
 * Create a `getOwnPropertyDescriptor()` function for the class.
 *
 * @param  {Function} Class             The class.
 * @param  {Object}   descriptors       The property descriptors.
 * @param  {Object}   staticDescriptors The static property descriptors.
 *
 * @return {Function} The generated function.
 */
prototype.createStaticGetOwnPropertyDescriptor = function (Class, descriptors, staticDescriptors) {
  var factory = this;
  return function getOwnPropertyDescriptor (name) {
    return this['[[descriptors]]'][name];
  };
};

/**
 * Update the dynamic auto-generated functions for a class.
 *
 * @param  {Function} Class             The class.
 * @param  {Object}   descriptors       The property descriptors.
 * @param  {Object}   staticDescriptors The static property descriptors.
 */
prototype.updateDynamicFunctions = function (Class, descriptors) {
  if (!Class.prototype.initialize || Class.prototype.initialize.isAutoGenerated) {
    Class.prototype.initialize = this.createInitialize(Class, descriptors);
  }

  if (!Class.prototype.applyDefaults || Class.prototype.applyDefaults.isAutoGenerated) {
    Class.prototype.applyDefaults = this.createApplyDefaults(Class, descriptors);
  }

  if (!Class.prototype.configure || Class.prototype.configure.isAutoGenerated) {
    Class.prototype.configure = this.createConfigure(Class, descriptors);
  }

  if (!Class.prototype.toJSON || Class.prototype.toJSON.isAutoGenerated) {
    Class.prototype.toJSON = this.createToJSON(Class, descriptors);
  }
};

function each (obj, visitor) {
  var keys = Object.keys(obj),
      length = keys.length,
      key, i;
  for (i = 0; i < length; i++) {
    key = keys[i];
    visitor(obj[key], key, obj);
  }
}

var safeIdentifier = /^[a-zA-Z_$][0-9a-zA-Z_$]*$/;

function createAccessor (name) {
  if (safeIdentifier.test(name)) {
    return '.' + name;
  }
  else {
    return '[' + JSON.stringify(name) + ']';
  }
}

ClassFactory.each = each;
ClassFactory.createAccessor = createAccessor;
},{}],2:[function(_dereq_,module,exports){
'use strict';


var Factory = _dereq_('./factory'),
    factory = new Factory();

module.exports = exports = function (name, descriptors, staticDescriptors) {
  return factory.create(name, descriptors, staticDescriptors);
};

exports.create = function (name, descriptors, staticDescriptors) {
  return factory.create(name, descriptors, staticDescriptors);
};

exports.extend = function (methods) {
  return Factory.extend(methods);
};

exports.Factory = Factory;

},{"./factory":1}]},{},[2])
(2)
});