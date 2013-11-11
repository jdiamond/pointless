(function(root) {

QUnit.module('eventually');

var Q = root.Q || require('q');
var sinon = root.sinon || require('sinon');

asyncTest('then after number', function() {
    P(12).eventually().then(eventuallyExpect(12));
});

asyncTest('then after promise for number', function() {
    P(Q.when(12)).eventually().then(eventuallyExpect(12));
});

asyncTest('map number', function() {
    P(12).eventually().map(add1).then(eventuallyExpect(13));
});

asyncTest('map array of numbers', function() {
    P([ 1, 2 ]).eventually().map(add1).then(eventuallyExpect([ 2, 3 ]));
});

asyncTest('map promise for number', function() {
    P(Q.when(12)).eventually().map(add1).then(eventuallyExpect(13));
});

asyncTest('map array of promises for numbers', function() {
    P([ Q.when(1), Q.when(2) ]).eventually().map(add1).then(eventuallyExpect([ 2, 3 ]));
});

asyncTest('map promise for array of promises for numbers', function() {
    P(Q.when([ Q.when(1), Q.when(2) ])).eventually().map(add1).then(eventuallyExpect([ 2, 3 ]));
});

asyncTest('map number to promise for number', function() {
    P(12).eventually().map(eventuallyAdd1).then(eventuallyExpect(13));
});

asyncTest('map array of numbers to array of promises for numbers', function() {
    P([ 1, 2 ]).eventually().map(eventuallyAdd1).then(eventuallyExpect([ 2, 3 ]));
});

asyncTest('map promise for number to promise for number', function() {
    P(Q.when(12)).eventually().map(eventuallyAdd1).then(eventuallyExpect(13));
});

asyncTest('map array of promises for numbers to array of promises for numbers', function() {
    P([ Q.when(1), Q.when(2) ]).eventually().map(eventuallyAdd1).then(eventuallyExpect([ 2, 3 ]));
});

asyncTest('map promise for array of promises for numbers to array of promises for numbers', function() {
    P(Q.when([ Q.when(1), Q.when(2) ])).eventually().map(eventuallyAdd1).then(eventuallyExpect([ 2, 3 ]));
});

asyncTest('mixed map test', function() {
    var deferredArray = Q.defer();
    var deferredNumber = Q.defer();

    P(deferredArray.promise).eventually().map(add1).then(eventuallyExpect([ 2, 3 ]));

    deferredArray.resolve([ 1, deferredNumber.promise ]);
    deferredNumber.resolve(2);
});

asyncTest('reduce number', function() {
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

asyncTest('reduce array of numbers', function() {
    var addSpy = sinon.spy(add);
    P([ 1, 2 ])
    .eventually()
    .reduce(addSpy)
    .then(function(result) {
        equal(result, 3);
        equal(addSpy.callCount, 1);
        deepEqual(addSpy.getCall(0).args, [ 1, 2 ]);
        start();
    });
});

asyncTest('reduce empty array', function() {
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

asyncTest('reduce empty array-like', function() {
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

asyncTest('reduce array of numbers with function returning promise', function() {
    var addSpy = sinon.spy(eventuallyAdd);
    P([ 1, 2 ])
    .eventually()
    .reduce(addSpy)
    .then(function(result) {
        equal(result, 3);
        equal(addSpy.callCount, 1);
        deepEqual(addSpy.getCall(0).args, [ 1, 2 ]);
        start();
    });
});

asyncTest('fold number', function() {
    var addSpy = sinon.spy(add);
    P(12)
    .eventually()
    .fold(1, addSpy)
    .then(function(result) {
        equal(result, 13);
        equal(addSpy.callCount, 1);
        deepEqual(addSpy.getCall(0).args, [ 1, 12 ]);
        start();
    });
});

asyncTest('fold array of numbers', function() {
    var addSpy = sinon.spy(add);
    P([ 1, 2 ])
    .eventually()
    .fold(0, addSpy)
    .then(function(result) {
        equal(result, 3);
        equal(addSpy.callCount, 2);
        deepEqual(addSpy.getCall(0).args, [ 0, 1 ]);
        deepEqual(addSpy.getCall(1).args, [ 1, 2 ]);
        start();
    });
});

asyncTest('fold empty array', function() {
    var addSpy = sinon.spy(add);
    P([])
    .eventually()
    .fold(12, addSpy)
    .then(function(result) {
        equal(result, 12);
        equal(addSpy.callCount, 0);
        start();
    });
});

asyncTest('fold empty array-like', function() {
    var addSpy = sinon.spy(add);
    P(arrayLike())
    .eventually()
    .fold(12, addSpy)
    .then(function(result) {
        equal(result, 12);
        equal(addSpy.callCount, 0);
        start();
    });
});

asyncTest('fold array of numbers with function returning promise', function() {
    var addSpy = sinon.spy(eventuallyAdd);
    P([ 1, 2 ])
    .eventually()
    .fold(0, addSpy)
    .then(function(result) {
        equal(result, 3);
        equal(addSpy.callCount, 2);
        deepEqual(addSpy.getCall(0).args, [ 0, 1 ]);
        deepEqual(addSpy.getCall(1).args, [ 1, 2 ]);
        start();
    });
});

function eventuallyExpect(expected) {
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

function eventuallyAdd(a, b) {
    return Q.when(a + b);
}

})(this);
