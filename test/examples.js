var Class = require('../lib'),
    expect = require('expect.js');

describe('Examples', function () {
  it('Simple classes', function () {

    var Person = Class({
      name: {
        value: 'No Name'
      },
      dateOfBirth: {}
    });

    var person = new Person();

    person.name.should.equal('No Name');

    var person = new Person({
      name: 'Bob',
      dateOfBirth: new Date()
    });

    person.name.should.equal('Bob');
    person.dateOfBirth.should.be.instanceOf(Date);
  });

  it('Default values', function () {
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
    list.length.should.equal(0);
    list.push(1, 2, 3);
    list.length.should.equal(3);
  });

  describe('Inheritance', function () {
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

    it('should inherit properties', function () {
      var mini = new Car({
        name: 'mini',
        capacity: 28
      });

      mini.should.be.instanceOf(Vehicle);
      mini.should.be.instanceOf(RoadVehicle);
      mini.should.be.instanceOf(Car);
      mini.capacityPerWheel.should.equal(7);
    });

    it('should mixin properties', function () {

      var Truck = RoadVehicle.extend();

      Truck.mixin({
        capacity: 2,
        wheels: 8
      });

      var truck = new Truck();
      truck.capacityPerWheel.should.equal(0.25);
    });

  });

  it('Auto binding', function () {
    var MyConsole = Class.create({
      alert: {
        bind: true,
        value: function (message) {
          this.alertCalledCount++;
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
  });
});