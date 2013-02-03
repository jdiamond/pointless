/*jshint es5: true*/

(function(root) {

QUnit.module('when');

test('when executes 2nd function when 1st returns truthy', function() {
    equal(P(12).when(
        function() { return true; },
        function(val) { return val + 1; },
        function(val) { return val - 1; }
    )._, 13);
});

test('when executes 3rd function when 1st returns falsy', function() {
    equal(P(12).when(
        function() { return false; },
        function(val) { return val + 1; },
        function(val) { return val - 1; }
    )._, 11);
});

test('when can test with non-function', function() {
    equal(P(12).when(
        12,
        function(val) { return val + 1; },
        function(val) { return val - 1; }
    )._, 13);
});

test('truthy', function() {
    strictEqual(P.truthy(true), true);
    strictEqual(P.truthy({}), true);
    strictEqual(P.truthy(1), true);
    strictEqual(P.truthy(false), false);
    strictEqual(P.truthy(0), false);

    equal(P(12).truthy(
        function(_) { return _ + 1; },
        function(_) { return _ - 1; }
    )._, 13);

    equal(P(0).truthy(
        function(_) { return _ + 1; },
        function(_) { return _ - 1; }
    )._, -1);
});

test('falsy', function() {
    strictEqual(P.falsy(true), false);
    strictEqual(P.falsy({}), false);
    strictEqual(P.falsy(1), false);
    strictEqual(P.falsy(false), true);
    strictEqual(P.falsy(0), true);
});

test('defined', function() {
    strictEqual(P.defined(true), true);
    strictEqual(P.defined({}), true);
    strictEqual(P.defined(1), true);
    strictEqual(P.defined(false), true);
    strictEqual(P.defined(0), true);
    strictEqual(P.defined(''), true);
    strictEqual(P.defined(null), true);
    strictEqual(P.defined(undefined), false);
});

test('undefined', function() {
    strictEqual(P.undefined(true), false);
    strictEqual(P.undefined({}), false);
    strictEqual(P.undefined(1), false);
    strictEqual(P.undefined(false), false);
    strictEqual(P.undefined(0), false);
    strictEqual(P.undefined(''), false);
    strictEqual(P.undefined(null), false);
    strictEqual(P.undefined(undefined), true);
});

test('any', function() {
    strictEqual(P.any([ 1, 2 ]), true);
    strictEqual(P.any([ 1 ]), true);
    strictEqual(P.any([]), false);
    strictEqual(P.any(true), true);
    strictEqual(P.any(1), true);
    strictEqual(P.any(false), false);
    strictEqual(P.any(0), false);
    strictEqual(P.any(null), false);
    strictEqual(P.any(undefined), false);
});

test('empty', function() {
    strictEqual(P.empty([ 1, 2 ]), false, 'array with length 2 is not empty');
    strictEqual(P.empty([ 1 ]), false, 'array with length 1 is not empty');
    strictEqual(P.empty([]), true, 'empty array is empty');
    strictEqual(P.empty(true), false, 'true is not empty');
    strictEqual(P.empty(1), false, '1 is not empty');
    strictEqual(P.empty(false), true, 'false is empty');
    strictEqual(P.empty(0), true, '0 is empty');
    strictEqual(P.empty(null), true, 'null is empty');
    strictEqual(P.empty(undefined), true, 'undefined is empty');
});

test('exists', function() {
    strictEqual(P.exists(false), true);
    strictEqual(P.exists(0), true);
    strictEqual(P.exists(null), false);
    strictEqual(P.exists(undefined), false);
});

test('nothing', function() {
    strictEqual(P.nothing(false), false);
    strictEqual(P.nothing(0), false);
    strictEqual(P.nothing(null), true);
    strictEqual(P.nothing(undefined), true);
});

// object, array, function, string, number, boolean

})(this);
