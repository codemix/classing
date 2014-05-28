# Classer

[![Build Status](https://travis-ci.org/codemix/classer.svg?branch=master)](https://travis-ci.org/codemix/classer)

Easy, flexible classes for JavaScript, works in node and all modern browser (> IE8).


# Installation

Via [npm](https://npmjs.org/package/classer):

    npm install --save classer


or [bower](http://bower.io/search/?q=classer):


    bower install --save classer



# Usage

**Simple classes**

```js
var Class = require('classer');

var Person = Class({
  name: {
    value: 'No Name'
  },
  dateOfBirth: {}
});

var person = new Person();

person.name === 'No Name'; // => true

var person = new Person({
  name: 'Bob',
  dateOfBirth: new Date()
});
```


**Inheritance**

```js
var Vehicle = Class({
  name: {
    value: 'No Name'
  }
});

var RoadVehicle = Vehicle.extend({
  wheels: {
    value: 0
  },
  capacity: {
    value: 0
  },
  capacityPerWheel: {
    get: function () {
      return (this.capacity || 1) / (this.wheels || 1)
    }
  }
});

var Car = RoadVehicle.extend({
  wheels: {
    value: 4
  }
});

var mini = new Car({
  name: 'mini',
  capacity: 3.5
});

console.log(mini.capacityPerWheel);

```


**Mixins**

```js

var Truck = RoadVehicle.extend();

Truck.mixin({
  capacity: 2,
  wheels: 8
});

var truck = new Truck();
console.log(truck.capacityPerWheel);


```


**Meta programming**

```js

var AutoBinding = Class();

Object.defineProperty(AutoBinding, 'defineProperty', {
  value: function (name, descriptor) {
    descriptor = descriptor || {};
    if (typeof descriptor.value === 'function') {
      descriptor.value = descriptor.value.bind(this);
    }
    Class.defineProperty.call(this, name, descriptor);
  }
});


var MyConsole = AutoBinding.extend({
  log: {
    value: function (message) {
      this.console.log('[' + new Date() + ']', message);
    }
  },
  console: {
    value: console
  }
});

var myconsole = new MyConsole(),
    log = myconsole.log;

log('Hello');
log('World');

```

# Running the tests

First, `npm install`, then `npm test`. Code coverage generated with `npm run coverage`.


# License

MIT, see [LICENSE.md](LICENSE.md).

