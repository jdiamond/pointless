/*jshint es5:true*/

(function(root) {

QUnit.module('basic');

var sinon = root.sinon || require('sinon');

test('_ has value', function() {
    equal(P(12)._, 12);
});

test('then applies value to function', function() {
    P(12).then(function(value) {
        equal(value, 12);
    });
});

test('then transforms value to new value', function() {
    P(12).then(add1).then(function(value) {
        equal(value, 13);
    });
});

test('map number', function() {
    equal(P(12).map(add1)._, 13);
});

test('map array of numbers', function() {
    deepEqual(P([ 1, 2 ]).map(add1)._, [ 2, 3 ]);
});

test('map array-like of numbers', function() {
    deepEqual(P(arrayLike(1, 2)).map(add1)._, [ 2, 3 ]);
});

test('map returns partial', function() {
    var fn = P.map(add1);
    deepEqual(fn([ 1, 2 ]), [ 2, 3 ]);
});

test('map array of objects with object', function() {
    deepEqual(P([
        { a: 1, b: 2 },
        { a: 3, b: 4 }
    ]).map({
        x: P.get('a'),
        y: P.chain(P.get('b'), add1)
    })._, [
        { x: 1, y: 3 },
        { x: 3, y: 5 }
    ]);
});

test('reduce number', function() {
    equal(P(12).reduce(add)._, 12);
});

test('reduce array of numbers', function() {
    equal(P([ 1, 2 ]).reduce(add)._, 3);
});

test('reduce empty array', function() {
    throws(function() { P([]).reduce(add); }, TypeError);
});

test('reduce array-like of numbers', function() {
    equal(P(arrayLike(1, 2)).reduce(add)._, 3);
});

test('reduce empty array-like', function() {
    throws(function() { P(arrayLike()).reduce(add); }, TypeError);
});

test('reduce returns partial', function() {
    var adder = P.reduce(add);
    equal(adder([ 1, 2 ]), 3);
});

test('fold number', function() {
    equal(P(12).fold(1, add)._, 13);
});

test('fold array of numbers', function() {
    equal(P([ 1, 2 ]).fold(0, add)._, 3);
});

test('fold array-like of numbers', function() {
    equal(P(arrayLike(1, 2)).fold(0, add)._, 3);
});

test('fold returns partial', function() {
    var foldFrom3 = P.fold(3);
    var adderTo3 = foldFrom3(add);
    equal(adderTo3([ 1, 2 ]), 6);
});

test('each number', function() {
    var add1Spy = sinon.spy(add1);
    equal(P(12).each(add1Spy)._, 12);
    equal(add1Spy.callCount, 1);
    deepEqual(add1Spy.getCall(0).args, [ 12, 0, [ 12 ] ]);
});

test('each array of numbers', function() {
    var add1Spy = sinon.spy(add1);
    deepEqual(P([ 1, 2 ]).each(add1Spy)._, [ 1, 2 ]);
    equal(add1Spy.callCount, 2);
    deepEqual(add1Spy.getCall(0).args, [ 1, 0, [ 1, 2 ] ]);
    deepEqual(add1Spy.getCall(1).args, [ 2, 1, [ 1, 2 ] ]);
});

test('each array-like of numbers', function() {
    var add1Spy = sinon.spy(add1);
    deepEqual(P(arrayLike(1, 2)).each(add1Spy)._, arrayLike(1, 2));
    equal(add1Spy.callCount, 2);
    deepEqual(add1Spy.getCall(0).args, [ 1, 0, arrayLike(1, 2) ]);
    deepEqual(add1Spy.getCall(1).args, [ 2, 1, arrayLike(1, 2) ]);
});

test('filter number true', function() {
    var isEvenSpy = sinon.spy(isEven);
    equal(P(12).filter(isEvenSpy)._, 12);
    equal(isEvenSpy.callCount, 1);
    deepEqual(isEvenSpy.getCall(0).args, [ 12, 0, [ 12 ] ]);
});

test('filter number false', function() {
    var isEvenSpy = sinon.spy(isEven);
    strictEqual(P(13).filter(isEvenSpy)._, undefined);
    equal(isEvenSpy.callCount, 1);
    deepEqual(isEvenSpy.getCall(0).args, [ 13, 0, [ 13 ] ]);
});

test('filter array of numbers', function() {
    var isEvenSpy = sinon.spy(isEven);
    deepEqual(P([ 1, 2 ]).filter(isEvenSpy)._, [ 2 ]);
    equal(isEvenSpy.callCount, 2);
    deepEqual(isEvenSpy.getCall(0).args, [ 1, 0, [ 1, 2 ] ]);
    deepEqual(isEvenSpy.getCall(1).args, [ 2, 1, [ 1, 2 ] ]);
});

test('filter array-like of numbers', function() {
    var isEvenSpy = sinon.spy(isEven);
    deepEqual(P(arrayLike(1, 2)).filter(isEvenSpy)._, [ 2 ]);
    equal(isEvenSpy.callCount, 2);
    deepEqual(isEvenSpy.getCall(0).args, [ 1, 0, arrayLike(1, 2) ]);
    deepEqual(isEvenSpy.getCall(1).args, [ 2, 1, arrayLike(1, 2) ]);
});

test('skip', function() {
    deepEqual(P([ 1, 2, 3 ]).skip(1)._, [ 2, 3 ]);
});

test('take', function() {
    deepEqual(P([ 1, 2, 3 ]).take(2)._, [ 1, 2 ]);
});

test('join array of numbers', function() {
    deepEqual(P([ 1, 2 ]).join(', ')._, '1, 2');
});

test('join array-like of numbers', function() {
    deepEqual(P(arrayLike(1, 2)).join(', ')._, '1, 2');
});

test('keys from object', function() {
    deepEqual(
        P({ foo: 1, bar: 2 })
        .keys()
        .then(function(keys) {
            keys.sort();
            return keys;
        })._,
        [ 'bar', 'foo' ]
    );
});

test('extends', function() {
    var target = {};
    var source = { foo: 1 };
    var result = P.extend(target, source);
    strictEqual(result, target);
    strictEqual(target.foo, 1);
});

test('defaults', function() {
    var target = { foo: 1 };
    var source = { foo: 2, bar: 3 };
    var result = P.defaults(target, source);
    strictEqual(result, target);
    strictEqual(target.foo, 1);
    strictEqual(target.bar, 3);
});

function arrayLike() {
    return arguments;
}

function add1(val) {
    return val + 1;
}

function add(a, b) {
    return a + b;
}

function isEven(val) {
    return val % 2 === 0;
}

})(this);
