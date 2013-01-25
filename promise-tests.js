(function(root) {

QUnit.module('eventually');

var Q = root.Q || require('q');
var sinon = root.sinon || require('sinon');

asyncTest('then after number', function() {
    P(12).eventually().then(expect(12));
});

asyncTest('then after promise for number', function() {
    P(Q.when(12)).eventually().then(expect(12));
});

asyncTest('map number', function() {
    P(12).eventually().map(add1).then(expect(13));
});

asyncTest('map array of numbers', function() {
    P([ 1, 2 ]).eventually().map(add1).then(expect([ 2, 3 ]));
});

asyncTest('map promise for number', function() {
    P(Q.when(12)).eventually().map(add1).then(expect(13));
});

asyncTest('map array of promises for numbers', function() {
    P([ Q.when(1), Q.when(2) ]).eventually().map(add1).then(expect([ 2, 3 ]));
});

asyncTest('map promise for array of promises for numbers', function() {
    P(Q.when([ Q.when(1), Q.when(2) ])).eventually().map(add1).then(expect([ 2, 3 ]));
});

asyncTest('map number to promise for number', function() {
    P(12).eventually().map(eventuallyAdd1).then(expect(13));
});

asyncTest('map array of numbers to array of promises for numbers', function() {
    P([ 1, 2 ]).eventually().map(eventuallyAdd1).then(expect([ 2, 3 ]));
});

asyncTest('map promise for number to promise for number', function() {
    P(Q.when(12)).eventually().map(eventuallyAdd1).then(expect(13));
});

asyncTest('map array of promises for numbers to array of promises for numbers', function() {
    P([ Q.when(1), Q.when(2) ]).eventually().map(eventuallyAdd1).then(expect([ 2, 3 ]));
});

asyncTest('map promise for array of promises for numbers to array of promises for numbers', function() {
    P(Q.when([ Q.when(1), Q.when(2) ])).eventually().map(eventuallyAdd1).then(expect([ 2, 3 ]));
});

asyncTest('mixed map test', function() {
    var deferredArray = Q.defer();
    var deferredNumber = Q.defer();

    P(deferredArray.promise).eventually().map(add1).then(expect([ 2, 3 ]));

    deferredArray.resolve([ 1, deferredNumber.promise ]);
    deferredNumber.resolve(2);
});

asyncTest('reduce number with seed', function() {
    var addSpy = sinon.spy(add);
    P(12)
    .eventually()
    .reduce(addSpy, 1)
    .then(function(result) {
        equal(result, 13);
        equal(addSpy.callCount, 1);
        deepEqual(addSpy.getCall(0).args, [ 1, 12, 0 ]);
        start();
    });
});

asyncTest('reduce number without seed', function() {
    var addSpy = sinon.spy(add);
    P(12)
    .eventually()
    .reduce(addSpy)
    .then(function(result) {
        equal(result, 12);
        equal(addSpy.callCount, 0);
        start();
    });
});

asyncTest('reduce array of numbers with seed', function() {
    var addSpy = sinon.spy(add);
    P([ 1, 2 ])
    .eventually()
    .reduce(addSpy, 0)
    .then(function(result) {
        equal(result, 3);
        equal(addSpy.callCount, 2);
        deepEqual(addSpy.getCall(0).args, [ 0, 1, 0 ]);
        deepEqual(addSpy.getCall(1).args, [ 1, 2, 1 ]);
        start();
    });
});

asyncTest('reduce array of numbers without seed', function() {
    var addSpy = sinon.spy(add);
    P([ 1, 2 ])
    .eventually()
    .reduce(addSpy)
    .then(function(result) {
        equal(result, 3);
        equal(addSpy.callCount, 1);
        deepEqual(addSpy.getCall(0).args, [ 1, 2, 1 ]);
        start();
    });
});

asyncTest('reduce empty array with seed', function() {
    var addSpy = sinon.spy(add);
    P([])
    .eventually()
    .reduce(addSpy, 12)
    .then(function(result) {
        equal(result, 12);
        equal(addSpy.callCount, 0);
        start();
    });
});

asyncTest('reduce empty array without seed', function() {
    var addSpy = sinon.spy(add);
    P([])
    .eventually()
    .reduce(addSpy)
    .then(function(result) {
        ok(false);
        start();
    })
    .fail(function(error) {
        ok(error instanceof TypeError);
        equal(addSpy.callCount, 0);
        start();
    });
});

asyncTest('reduce empty array-like with seed', function() {
    var addSpy = sinon.spy(add);
    P(arrayLike())
    .eventually()
    .reduce(addSpy, 12)
    .then(function(result) {
        equal(result, 12);
        equal(addSpy.callCount, 0);
        start();
    });
});

asyncTest('reduce empty array-like without seed', function() {
    var addSpy = sinon.spy(add);
    P(arrayLike())
    .eventually()
    .reduce(addSpy)
    .then(function(result) {
        ok(false);
        start();
    })
    .fail(function(error) {
        ok(error instanceof TypeError);
        equal(addSpy.callCount, 0);
        start();
    });
});

function expect(expected) {
    return function(actual) {
        deepEqual(actual, expected);
        start();
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

function eventuallyAdd1(val) {
    return Q.when(val + 1);
}

})(this);
