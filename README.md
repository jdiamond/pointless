Pointless.js
============

Pointless is a library for working with values, arrays, objects,
functions, and promises with a uniform interface and in a point-free style.

It works in the browser (with or without AMD) and as a Node.js module.

Pointless does not provide any facilities for working with the DOM,
but can be extended to do so via plugins.

Pointless is inspired by:

  - jQuery
  - Underscore
  - @raganwald
  - @domenic

API
---

`P` is the main function. It returns a Pointless object.

Pointless objects wrap values. The original value is accessible via
the Pointless object's `_` property:

    equal( P(42)._, 42 );

That example may seem pointless (it is!), but you won't normally use
the `_` property. Pointless objects provide many methods for
manipulating their values and returning new Pointless objects.

    P(document.querySelectorAll('#form input'))
    .map(function(input) { return input.name + '=' + input.value; })
    .join('&')
    .then(function(values) {
        // Do Ajax with values...
    });

Many of the methods available on Pointless objects are also available
as "static" methods on the `P` function. These methods take in an
unwrapped value as their first argument and return an unwrapped
value. They are meant for quick application of a single Pointless
method. To apply more than one Pointless method to a value, consider
chaining off a Pointless object instead.

### map(fn)

    deepEqual( P([ 1, 2 ]).map(add1)._, [ 2, 3 ] );

    function add1(val) { return val + 1; }

### reduce(fn, [seed])

    equal( P([ 1, 2 ]).reduce(add)._, 3 );

    function add(a, b) { return a + b; }

### each(fn)

    deepEqual( P([ 1, 2 ]).each(add1)._, [ 1, 2 ] );

    function add1(val) { return val + 1; }

### slice(start, end)

Like `Array.prototype.slice()`, but works with array-like objects.

    deepEqual( P([ 1, 2, 3, 4 ]).slice(1, 3)._, [ 2, 3 ] );

### join(separator)

Like `Array.prototype.join()`, but works with array-like objects.

    equal( P([ 1, 2 ]).join(', ')._, '1, 2' );

### keys()

Like `Object.keys()`, but works when `Object.keys` isn't defined.

### tap(fn)

Invokes `fn` with the current value and then returns the current
Pointless object.

### console(method, [label])

Invokes `method` on `console` with the current value. If `label` is
defined, `': '` is appended to it, and then that's used as a prefix.

### log([label]), info([label]), warn([label]), error([label])

Logs (via `console.log`, etc) the current value with an optional
label.

### Conditional Functions

The following functions take in a value and return a boolean:

- P.truthy(val) - true when truthy
- P.falsy(val) - true when falsy
- P.defined(val) - true when not `undefined` (even `null`)
- P.undefined(val) - true when `undefined`
- P.any(val) - true when non-empty array or truthy non-array
- P.empty(val) - true when empty array or falsy non-array
- P.exists(val) - true when not `null` or `undefined`
- P.nothing(val) - true when `null` or `undefined`

### when(test, then, else)

Tests the current value and then executes one of the two functions.

The test can be a function, in which case the current value is
applied to that function.

The test can also be a non-function. In this case, the current
value is compared (with `===`) to that value.

### Conditional Methods

The following methods can be invoked on Pointless objects:

- .truthy(then, else)
- .falsy(then, else)
- .defined(then, else)
- .undefined(then, else)
- .any(then, else)
- .empty(then, else)
- .exists(then, else)
- .nothing(then, else)

Both `then` and `else` arguments are optional.

### Partial Application

`P.partial()` returns a function that applies its arguments to the
right of the original arguments.

    var pf = P.partial(f, 1, 2);
    pf(3, 4); // Calls f with 1, 2, 3, and 4

`P.partialRight()` returns a function that applies its arguments to
the left of the original arguments.

    var pf = P.partialRight(f, 3, 4);
    pf(1, 2); // Calls f with 1, 2, 3, and 4

### save(), restore()

`.save()` and `.restore()` can be used to save and restore
(surprise!) a previous Pointless object.

TODO: Named saves and restores?

### then(fn)

Pointless objects have a `.then()` method that takes in a function
and invokes that function with the current value:

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

Pointless relies on [Q](http://documentup.com/kriskowal/q/) for its
promise implementation. If you need support for promises, be sure to
include Q (or install it in node_modules). If you never call
`.eventually()`, you don't need to bother with Q.
