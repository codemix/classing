# Classing

[![Build Status](https://travis-ci.org/codemix/classing.svg?branch=master)](https://travis-ci.org/codemix/classing)

Easy, flexible classes for JavaScript, works in node and all modern browser (> IE8).

# Why another class library?

Because none of the other class libs have a good way to associate meta data with properties, and have that meta data easily available in child classes. This is useful for e.g. defining property labels, types, validation rules etc.

Classing presents an API similar to the native `Object.defineProperty()` and `Object.defineProperties()` methods.

```js

var Class = require('classing');

var User = Class();

User.defineProperty('name', {
  label: 'Name',
  value: 'anonymous'
});

User.defineProperties({
  email: {
    label: 'Email Address'
  },
  avatarUrl: {
    label: 'Avatar URL',
    // getter
    get: function () {
      return getGravatarUrl(this.email);
    }
  }

});


var user = new User({
  name: 'charles',
  email: 'foo@example.com'
});

console.log(User.descriptors.name.label + ':', user.name); // "Name: charles"

console.log(user.avatarUrl);

```

The main difference between this and the native methods is that the full descriptor declarations are preserved. The native methods discard these extra keys (anything other than `enumerable`, `configurable`, `writable`, `value`, `get` and `set`), making them unsuitable for storing metadata. Classing corrects this and ensures that the descriptors are accessible within child classes.


# Installation

Via [npm](https://npmjs.org/package/classing):

    npm install --save classing


or [bower](http://bower.io/search/?q=classing):


    bower install --save classing



# Usage



**Simple classes**

```js
var Class = require('classing');

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

