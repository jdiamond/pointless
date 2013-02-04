/*jshint es5: true*/

(function(root) {

QUnit.module('functions');

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

function joinAll(separator) {
    return P.join(P.slice(arguments, 1), separator);
}

})(this);
