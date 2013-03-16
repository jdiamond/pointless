/*jshint es5: true*/

(function(root) {

QUnit.module('functions');

test('unary', function() {
    var add1 = P.unary(function(value) {
        return value + 1;
    });

    var anotherAdd1 = add1();

    strictEqual(anotherAdd1(2), 3);
});

test('binary', function() {
    var add = P.binary(function(value1, value2) {
        return value1 + value2;
    });

    var anotherAdd = add();
    var addTo1 = anotherAdd(1);

    strictEqual(addTo1(2), 3);
});

test('nary', function() {
    var add3 = P.nary(3, function(value1, value2, value3) {
        return value1 + value2 + value3;
    });

    var anotherAdd3 = add3();
    var addTo1 = anotherAdd3(1);
    var addTo1And2 = addTo1(2);
    var anotherAddTo1And2 = addTo1And2();

    strictEqual(anotherAddTo1And2(3), 6);
});

test('partial', function() {
    var fn = P.partial(joinAll, ', ', 1, 2);

    var result = fn(3, 4);

    equal(result, '1, 2, 3, 4');
});

test('partialRight', function() {
    var fn = P.partialRight(joinAll, 3, 4);

    var result = fn(', ', 1, 2);

    equal(result, '1, 2, 3, 4');
});

test('chain', function() {
    var fn = P.chain(add1, mul2);

    var result = fn(1);

    equal(result, 4);
});

function joinAll(separator) {
    return P.join(P.slice(arguments, 1), separator);
}

function add1(value) { return value + 1; }
function mul2(value) { return value * 2; }

})(this);
