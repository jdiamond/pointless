(function() {

QUnit.module('basic');

test('then applies value to function', function() {
    P(12).then(expect(12));
});

test('then transforms value to new value', function() {
    P(12).then(add1).then(expect(13));
});

test('map number', function() {
    P(12).map(add1).then(expect(13));
});

test('map array of numbers', function() {
    P([ 1, 2 ]).map(add1).then(expect([ 2, 3 ]));
});

test('map array-like of numbers', function() {
    P(arrayLike(1, 2)).map(add1).then(expect([ 2, 3 ]));
});

test('reduce number with seed', function() {
    P(12).reduce(add, 1).then(expect(13));
});

test('reduce number without seed', function() {
    P(12).reduce(add).then(expect(12));
});

test('reduce array of numbers', function() {
    P([ 1, 2 ]).reduce(add, 0).then(expect(3));
});

test('reduce array of numbers with no initial value', function() {
    P([ 1, 2 ]).reduce(add).then(expect(3));
});

test('reduce empty array with no initial value', function() {
    throws(function() {
        P([]).reduce(add).then(expect(3));
    }, TypeError);
});

test('reduce array-like of numbers', function() {
    P(arrayLike(1, 2)).reduce(add, 0).then(expect(3));
});

test('reduce array-like of numbers with no initial value', function() {
    P(arrayLike(1, 2)).reduce(add).then(expect(3));
});

test('reduce empty array-like with no initial value', function() {
    throws(function() {
        P(arrayLike()).reduce(add).then(expect(3));
    }, TypeError);
});

test('each number', function() {
    // TODO: Assert that add1 gets called with value and index.
    P(12).each(add1).then(expect(12));
});

test('each array of numbers', function() {
    // TODO: Assert that add1 gets called with each value and index.
    P([ 1, 2 ]).each(add1).then(expect([ 1, 2 ]));
});

test('each array-like of numbers', function() {
    // TODO: Assert that add1 gets called with each argument and index.
    P(arrayLike(1, 2)).each(add1).then(expect(arrayLike(1, 2)));
});

function expect(expected) {
    return function(actual) {
        deepEqual(actual, expected);
    };
}

function arrayLike() {
    return arguments;
}

function add1(val) {
    return val + 1;
}

function add(a, b) {
    return a + b;
}

})();
