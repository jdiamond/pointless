(function(root) {

QUnit.module('if');

test('if passes existing value through', function() {
    equal(P(12)['if']()._, 12);
});

test('ifExists is alias for if', function() {
    equal(P(12).ifExists()._, 12);
});

test('ifExists with nothing returns Nothing object', function() {
    ok(P().ifExists() instanceof P.Nothing);
});

test('Nothing objects return same Nothing object for all methods', function() {
    var nothing = P().ifExists();
    strictEqual(nothing.map(), nothing);
    strictEqual(nothing.reduce(), nothing);
    strictEqual(nothing.each(), nothing);
});

})(this);
