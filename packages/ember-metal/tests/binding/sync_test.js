module("system/binding/sync_test.js");

testBoth("bindings should not sync twice in a single run loop", function(get, set) {
  var a, b, setValue, setCalled=0, getCalled=0;

  Ember.run(function() {
    a = {};

    Ember.defineProperty(a, 'foo', Ember.computed(function(key, value) {
      if (arguments.length === 2) {
        setCalled++;
        setValue = value;
        return value;
      } else {
        getCalled++;
        return setValue;
      }
    }));

    b = {
      a: a
    };
    Ember.bind(b, 'foo', 'a.foo');
  });

  // reset after initial binding synchronization
  getCalled = 0;

  Ember.run(function() {
    set(a, 'foo', 'trollface');
  });

  equal(get(b, 'foo'), "trollface", "the binding should sync");
  equal(setCalled, 1, "Set should only be called once");
  equal(getCalled, 1, "Get should only be called once");
});

testBoth("bindings should not infinite loop if computed properties return objects", function(get, set) {
  var a, b, getCalled=0;

  Ember.run(function() {
    a = {};

    Ember.defineProperty(a, 'foo', Ember.computed(function() {
      getCalled++;
      return ['foo', 'bar'];
    }));

    b = {
      a: a
    };
    Ember.bind(b, 'foo', 'a.foo');
  });

  deepEqual(get(b, 'foo'), ['foo', 'bar'], "the binding should sync");
  equal(getCalled, 1, "Get should only be called once");
});

testBoth("bindings should do the right thing when observers trigger bindings in the opposite direction", function(get, set) {
  var a, b, c;

  Ember.run(function() {
    a = {
      foo: 'trololol'
    };

    b = {
      a: a
    };
    Ember.bind(b, 'foo', 'a.foo');

    c = {
      a: a
    };
    Ember.bind(c, 'foo', 'a.foo');
  });

  Ember.addObserver(b, 'foo', function() {
    set(c, 'foo', "what is going on");
  });

  Ember.run(function() {
    set(a, 'foo', 'trollface');
  });

  equal(get(a, 'foo'), "what is going on");
});

testBoth("bindings should not try to sync destroyed objects", function(get, set) {
  var a, b;

  Ember.run(function() {
    a = {
      foo: 'trololol'
    };

    b = {
      a: a
    };
    Ember.bind(b, 'foo', 'a.foo');
  });

  Ember.run(function() {
    set(a, 'foo', 'trollface');
    set(b, 'isDestroyed', true);
    ok(true, "should not raise");
  });

  Ember.run(function() {
    a = {
      foo: 'trololol'
    };

    b = {
      a: a
    };
    Ember.bind(b, 'foo', 'a.foo');
  });

  Ember.run(function() {
    set(b, 'foo', 'trollface');
    set(a, 'isDestroyed', true);
    ok(true, "should not raise");
  });
});
