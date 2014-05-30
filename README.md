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

**Default values**

```js
var Collection = Class({
  items: {
    enumerable: false,
    default: function () { return []; }
  },
  length: {
    get: function () {
      return this.items.length;
    }
  },
  push: function () {
    return this.items.push.apply(this.items, arguments);
  }
});

var list = new Collection();

list.length === 0; // true

list.push(1, 2, 3);

list.length === 3; // true


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
  capacity: 28
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


**Auto Binding**

```js
var MyConsole = Class.create({
  alert: {
    bind: true,
    value: function (message) {
      this.alertCalledCount++;
      console.warn(message);
    }
  },
  log: {
    bind: console,
    value: console.log
  },
  alertCalledCount: {
    value: 0
  }
});

var myconsole = new MyConsole(),
    alert = myconsole.alert,
    log = myconsole.log;

myconsole.alertCalledCount.should.equal(0);

alert('Hello');
alert('World');

myconsole.alertCalledCount.should.equal(2);

log('If you can see this in the console, it worked.');

```

# Running the tests

First, `npm install`, then `npm test`. Code coverage generated with `npm run coverage`.


# License

MIT, see [LICENSE.md](LICENSE.md).

