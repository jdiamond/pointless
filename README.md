Pointless.js
============

Pointless is a library for working with values, arrays, objects,
functions, and promises with a uniform interface and in a point-free style.

It does not provide any facilities for working with the DOM, but can
be extended to do so via plugins.

Pointless is inspired by:

  - jQuery
  - Underscore
  - @raganwald
  - @domenic

API
---

`P` is the main function. It returns a Pointless object.

Pointless objects wrap values. The original value is accessible via
the `._` property.

    equal( P(42)._, 42 );

Pointless objects provide many methods for manipulating their values.

All methods available on Pointless objects are also available as
"static" methods on the `P` function. These methods take in an
unwrapped value as their first argument and return an unwrapped
value. They are meant for quick application of a single Pointless
method. To apply more than one Pointless method to a value, consider
chaining off a Pointless object instead.

### map

    deepEqual( P([ 1, 2 ]).map(add1)._, [ 2, 3 ] );

    function add1(val) { return val + 1; }

### reduce

    equal( P([ 1, 2 ]).reduce(add)._, 3 );

    function add(a, b) { return a + b; }

### each

    deepEqual( P([ 1, 2 ]).each(add1)._, [ 1, 2 ] );

    function add1(val) { return val + 1; }

### ifFirst, ifNotFirst

    fs.exists('file.txt', P.maybeIfFirst(
        P.partial(
            fs.readFile, 'file.txt', 'utf-8',
            P.maybeIfNotFirst(console.log, console.error)
        )
    ));

    P(fs.exists).callBackLast()
    .call('file.txt')
    .eventually()
    .ifFirst(function() {
        P(fs.readFile).nodeBackLast()
        .call('file.txt')
        .eventually()
        .ifNotFirst(console.log, console.error);
    });

    P('file.txt')
    .save()
    .applyToFirst(P(fs.exists).callBackLast()._)
    .eventually()
    .ifFirst()
    .restore()
    .applyToFirst(P.nodeBackLast(fs.readFile), 'utf-8')
    .ifNotFirst(console.log, console.error);

### then

Pointless objects have a `.then()` method:

    P(42).then(function(val) { equal( val, 42 ); });

`.then()` returns a Pointless object wrapping the return value of
its callback:

    equal( P(42).then(add1)._, 43 );

    function add1(val) { return val + 1; }

This method is supposed to resemble the `.then()` method from
Promises/A.

Promises
--------

Pointless objects work well with promises. Invoke `.eventually()` to
get a Pointless object with a `.then()` method that is Promises/A
compliant.

All of the usual Pointless methods are still available but they all
implicitly call `.then()` so that they can be applied to the
resolved values.

Code to map the results of a promise for an array that looks like
this:

    getPromiseForArray().then(function(arr) {
        return arr.map(processResult);
    })

can become this:

    P(getPromiseForArray())
    .eventually()
    .map(processResult)

The value of that Pointless object will be a promise. To use the
fulfilled value of that promise, pass a callback function to
`.then()` just like you would do with the result of the previous
example:

    P(getPromiseForArray())
    .eventually()
    .map(processResult)
    .then(function(values) {
        // values and everything in it has been fulfilled.
    });

Pointless relies on Q for its promise implementation. If you need
support for promises, be sure to include Q. If you never call
`.eventually()`, you don't need to bother including Q.
