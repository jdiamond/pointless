/*jshint es5: true*/

(function(root) {

QUnit.module('format');

test('format arguments', function() {
    equal(P.format('{0}={1}', 1, 2), '1=2');
});

test('format array', function() {
    equal(P.format('{0}={1}', [ 1, 2 ]), '1=2');
});

test('format object', function() {
    equal(P.format('{one}={two}', { one: 1, two: 2 }), '1=2');
});

test('{0} works with just one, non-array argument', function() {
    equal(P.format('{0}', 12), '12');
});

test('null and undefined output the empty string', function() {
    equal(P.format('{0}', null), '');
    equal(P.format('{0}', undefined), '');
});

test('format method', function() {
    equal(P([ 1, 2 ]).format('{0}={1}')._, '1=2');
});

})(this);
