(function(root) {

QUnit.module('save/restore');

test('save marks object for later restore', function() {
    equal(
        P(12)
        .save()
        .map(add1)
        .reduce(add, 2)
        .then(function(value) {
            equal(value, 15);
        })
        .restore()
        ._,
        12);
});

function add1(value) {
    return value + 1;
}

function add(a, b) {
    return a + b;
}

})(this);
