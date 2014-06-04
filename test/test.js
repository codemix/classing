var Class = require('../lib'),
    expect = require('expect.js');

describe('Classing', function () {

  var Base = Class();

  var Thing = Class('Thing', {
    '@id' : {
      default: 123
    },
    name: {
      default: 'Unnamed Item'
    },
    className: function () {
      return 'Thing';
    },
    computed: {
      get: function () {
        return Date.now();
      }
    }
  });

  Thing.inherits(Base);

  Thing.staticMethod = function () { return 'Thing'; };


  var Person = Class('Person', {
    name: {
      default: 'Unnamed Person'
    },
    age: {},
    location: {
      default: 'The world.'
    },
    className: function () {
      return 'Person';
    }
  });


  it('should apply class names correctly', function () {
    Base.name.should.equal('Class'); // the default value
    Thing.name.should.equal('Thing');
    Person.name.should.equal('Person');
  });

  it('should add properties correctly', function () {
    var thing = new Thing();
    thing['@id'].should.equal(123);
    thing.name.should.equal('Unnamed Item');
    thing.className.should.have.type('function');
    thing.className().should.equal('Thing');
  });

  describe('Class.defineProperty()', function () {
    it('should add new properties correctly', function () {
      Thing.defineProperty('url', {
        value: 'http://example.com/'
      });
      var thing = new Thing();
      thing.name.should.equal('Unnamed Item');
      thing.url.should.equal('http://example.com/');
    });

    it('should configure objects correctly', function () {
      var thing = new Thing({
        name: 'codemix',
        url: 'http://codemix.com/'
      });

      thing.name.should.equal('codemix');
      thing.url.should.equal('http://codemix.com/');
    });

    it('should add a property without a descriptor', function () {
      Thing.defineProperty('sameAs');
    });
  });

  describe('Class.defineProperties()', function () {
    it('should define multiple properties at once', function () {
      Thing.defineProperties({
        description: {
          value: 'No description yet.'
        },
        alternateName: {}
      });

      var thing = new Thing();
      thing.should.have.properties(['name', 'description', 'url', 'alternateName']);
    });

    it('should do nothing if no properties are specified', function () {
      Thing.defineProperties();
    });
  });

  describe('Class::constructor()', function () {
    it('should use the correct context, if `new` is not used', function () {
      var thing = Thing();
      thing.should.be.an.instanceOf(Thing);
    });
  });


  describe('Class::applyDefaults()', function () {
    it('should apply the default values', function () {
      var MyClass = Class.create({
        '@id': {
          default: 123
        },
        arr: {
          default: function () { return [1, 2, 3]; }
        }
      });

      var instance = new MyClass();

      instance['@id'].should.equal(123);
      instance.arr.should.eql([1, 2, 3]);
    });

    it('should auto bind functions to the right context', function () {
      var MyClass = Class.create({
        '@fn': {
          bind: true,
          value: function () {
            return this.name;
          }
        },
        name: {
          value: 'no name'
        },
        identity: {
          bind: true,
          value: function () {
            return this;
          }
        }
      });

      var instance = new MyClass();

      var fn = instance['@fn'];

      fn().should.equal('no name');

      var identity = instance.identity;

      identity().should.equal(instance);
    });
  });

  describe('Class::initialize()', function () {
    it('should allow a custom initializer', function () {
      var wasCalled = false;
      var MyClass = Class({
        name: {},
        initialize: function (config) {
          wasCalled = true;
        }
      });
      var instance = new MyClass({name: 'foo'});

      wasCalled.should.be.true;
      instance.name.should.equal('foo');

    });
  });

  describe('Class::configure()', function () {
    var MyClass = Thing.extend({
      setter: {
        get: function () {
          return this._setter;
        },
        set: function (setter) {
          this._setter = setter;
        }
      }
    })
    it('configure an object correctly', function () {
      var obj = new MyClass('MyClass');
      obj.configure({
        name: 'myname',
        setter: 'wat'
      });

      obj.should.have.properties({
        name: 'myname',
        setter: 'wat'
      });
    });
  });


  describe('Class::toString()', function () {
    it('should define a `toString` function', function () {
      var thing = new Thing();
      (''+thing).should.equal('[object Thing]');
    });
  });

  describe('Class.create()', function () {
    it('should create a new class instance', function () {
      var thing = Thing.create();
      thing.should.be.an.instanceOf(Thing);
    });
  });


  describe('Class.inherits()', function () {
    it('should inherit from other classes', function () {
      Person.inherits(Thing);

      var person = new Person();

      person.should.be.an.instanceOf(Person);
      person.should.be.an.instanceOf(Thing);
      person.should.have.properties(['name', 'description', 'url', 'alternateName', 'age', 'location']);
    });
    it('should copy static values', function () {
      Person.should.have.property('staticMethod');
      Person.staticMethod().should.equal('Thing');
    });
    it('should only assign the correct keys', function () {
      var person = new Person();
      Object.keys(person).should.eql([
        'name',
        'location',
        '@id'
      ]);
    });
    it('should apply the default values', function () {
      var person = new Person();
      person.should.have.properties({
        name: 'Unnamed Person',
        description: 'No description yet.',
        url: 'http://example.com/',
        alternateName: undefined,
        age: undefined,
        location: 'The world.'
      });
    });
    it('should configure the child class correctly', function () {
      var person = new Person({
        name: 'Charles',
        description: 'Hello World!',
        url: 'http://codemix.com/',
        age: 29,
        location: 'United Kingdom'
      });

      person.should.have.properties({
        name: 'Charles',
        description: 'Hello World!',
        url: 'http://codemix.com/',
        age: 29,
        location: 'United Kingdom'
      });
    });
    it('should inherit from other classes, deeply', function () {
      var Visitor = Class({
        name: {
          value: 'Unnamed Visitor'
        },
        visitedAt: {},
        className: function () {
          return 'Visitor'
        }
      });

      Visitor.inherits(Person);

      Visitor.should.have.property('staticMethod');
      Visitor.staticMethod().should.equal('Thing');

      var visitor = new Visitor();
      visitor.should.be.an.instanceOf(Visitor);
      visitor.should.be.an.instanceOf(Person);
      visitor.should.be.an.instanceOf(Thing);
      visitor.should.have.properties(['name', 'description', 'url', 'alternateName', 'age', 'location', 'visitedAt']);
      visitor.className().should.equal('Visitor');
    });

    it('should inherit from native objects', function () {
      var MyError = Class.create({});
      MyError.inherits(Error);

      var err = new MyError();
      err.should.be.an.instanceOf(MyError);
      err.should.be.an.instanceOf(Error);
    });

    it('should not overwrite custom `configure()` and `toJSON()` functions', function () {
      var MyClass = Thing.extend();

      MyClass.staticMethod = function () { return 'MyClass'; };

      MyClass.defineProperties({
        configure: function (config) {
          this.bananas = true;
        },
        toJSON: function () {
          return false;
        }
      });

      MyClass.defineProperty('foo');

      var instance = new MyClass({
        name: 'Test'
      });

      instance.name.should.not.equal('Test');
      instance.bananas.should.be.true;


      expect(instance.configure.isAutoGenerated).to.be.undefined;
      expect(instance.toJSON.isAutoGenerated).to.be.undefined;
    });

    it('should not overwrite custom `configure()` and `toJSON()` functions, when deeply inheriting', function () {
      var MyClass = Thing.extend({
        applyDefaults: function () {

        },
        configure: function (config) {
          this.bananas = true;
        },
        toJSON: function () {
          return false;
        }
      });

      MyClass.staticMethod = function () { return 'MyClass'; };

      var MyChildClass = Class();
      MyChildClass.staticMethod = function () { return 'MyClass'; };
      MyChildClass.inherits(MyClass);


      var instance = new MyChildClass({
        name: 'Test'
      });

      expect(instance.name).to.not.equal('Test');
      instance.bananas.should.be.true;

      expect(instance.applyDefaults.isAutoGenerated).to.be.undefined;
      expect(instance.configure.isAutoGenerated).to.be.undefined;
      expect(instance.toJSON.isAutoGenerated).to.be.undefined;
    });
  });

  describe('Class.extend()', function () {
    var Visitor;

    before(function () {
      Visitor = Person.extend('Visitor', {
        name: {
          value: 'Unnamed Visitor'
        },
        visitedAt: {},
        className: function () {
          return 'Visitor'
        },
        parentClass: function () {
          return this.__super__.className();
        }
      });
    });

    it('should assign the correct name', function () {
      Visitor.name.should.equal('Visitor');
    });

    it('should inherit from other classes', function () {
      var visitor = new Visitor();

      visitor.should.be.an.instanceOf(Visitor);
      visitor.should.be.an.instanceOf(Person);
      visitor.should.be.an.instanceOf(Thing);
      visitor.should.have.properties(['name', 'description', 'url', 'alternateName', 'age', 'location']);
      visitor.className().should.equal('Visitor');
    });

    it('should apply the default values', function () {
      var visitor = new Visitor();
      visitor.should.have.properties({
        name: 'Unnamed Visitor',
        description: 'No description yet.',
        url: 'http://example.com/',
        alternateName: undefined,
        age: undefined,
        location: 'The world.',
        visitedAt: undefined
      });
    });
    it('should configure the child class correctly', function () {
      var now = new Date();
      var visitor = new Visitor({
        name: 'Charles',
        description: 'Hello World!',
        url: 'http://codemix.com/',
        age: 29,
        location: 'United Kingdom',
        visitedAt: now
      });

      visitor.should.have.properties({
        name: 'Charles',
        description: 'Hello World!',
        url: 'http://codemix.com/',
        age: 29,
        location: 'United Kingdom',
        visitedAt: now
      });
    });

    it('should populate `super`', function () {
      var visitor = new Visitor();
      visitor.parentClass().should.equal('Person');
    });
  });


  describe('Class.mixin()', function () {
    var MyClass = Thing.extend();

    MyClass.mixin({
      name: 'nope',
      newProp: true
    });

    var obj = new MyClass();
    obj.name.should.equal('nope');
    obj.newProp.should.be.true;

  });

  describe('Classing.extend()', function () {
    var constructedCount = 0;
    var CustomClassing = Class.extend({
      makeConstructor: function () {
        function CustomClass (config) {
          if (!(this instanceof CustomClass)) {
            return new CustomClass(config);
          }
          this.applyDefaults();
          if (config) {
            this.configure(config);
          }
          this.initialize();
          constructedCount++;
        }
        return CustomClass;
      },
      descriptors: {
        configurable: true
      }
    });
    it('should be easy to extend', function () {
      var MyClass = CustomClassing.create();
      constructedCount.should.equal(0);
      var instance = new MyClass();
      constructedCount.should.equal(1);
    });

    it('should create a subclass with default values', function () {
      var MyFactory = CustomClassing.extend(),
          MyClass = MyFactory();
      var instance = new MyClass();
      constructedCount.should.equal(2);
    });
  });
});