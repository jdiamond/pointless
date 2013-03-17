Pointless.js
============

Pointless is a library for working with values, arrays, objects, functions,
and promises all with a uniform interface and in a point-free style.

It works in the browser (with or without AMD) and as a Node.js module.

Pointless is inspired by:

  - jQuery
  - Underscore
  - @raganwald
  - @domenic
  - http://www.slideshare.net/drboolean/pointfree-functional-programming-in-javascript

Introduction
------------

`P` is the main function. It returns a Pointless object.

Pointless objects wrap values. The original value is accessible via the `_`
property:

    P(42)._ // 42

That example may seem pointless (it is!), but you would normally use one or
more methods on the Pointless object before accessing its value.

Pointless objects provide many methods for manipulating their values and
returning new Pointless objects. Here's a more involved example:

    P(document.querySelectorAll('#form input'))
    .filter(P.get('name'))
    .map(P.format('{name}={value}'))
    .join('&')
    .then(function(qs) {
        // Do Ajax with query string...
    });

When you're done chaining method calls, you can use the `_` property to access
the final result or the `.then()` method (which is supposed to be reminiscient
of the Promises/A specification) as in the above example.

Many of the methods available on Pointless objects are also available as
"static" methods on the `P` function. You can see two of them in the previous
example. These methods take in an unwrapped value and return an unwrapped
value. They are meant for quick application of a single Pointless method. To
apply more than one Pointless method to a value, consider chaining off a
Pointless object instead.

Many of the static methods also support automatic partial application. For
example, the calls to `P.get()` and `P.format()` with just one argument in the
previous example returned new functions that takes the value to read from or
to format. The more traditional way to write that might look like this:

    P(document.querySelectorAll('#form input'))
    .filter(function(input) {
        return input.name;
    })
    .map(function(input) {
        return P.format('{name}={value}', input);
    })
    .join('&')
    .then(function(qs) {
        // Do Ajax with query string...
    });

The point of Pointless is to enable programming in a point-free style. If you
find yourself writing function expressions as above, you may be able to
discover a way to remove them by exploring the API.

Pointless may seem familiar to the popular Underscore and Lo-Dash libraries
and it is. Many of the functions in Pointless accept their arguments in
reverse when compared to these libraries. This is done on purpose to make the
automatic partial application more convenient.

API
---

For each of the following methods, an examples are shown using Pointless
object methods and "static" methods, when available. If the static method can
be partially applied, that will be indicated with an example, too.

Comments at the end of lines in the following examples indicate the results.
Results that look like `[ 1, 2 ]` are normal arrays. Results that look like
`P([ 1, 2 ])` are Pointless objects wrapping an array. You can invoke more
methods on those objects or access their values with either the `_` property
or `.then()` method.

### map

Maps (tranforms) each value into new values. The callback function does _not_
receive an index argument.
    
    P([ 1, 2 ]).map(add1) // P([ 2, 3 ])

    P.map(add1, [ 1, 2 ]) // [ 2, 3 ]

    P.map(add1)([ 1, 2 ]) // [ 2, 3 ]

### reduce

Reduces values to a single value. The callback function receives the previous
and current values, but does _not_ receive an index argument. Empty arrays
result in a `TypeError`.

    P([ 1, 2 ]).reduce(add) // P(3)

    P.reduce(add, [ 1, 2 ]) // 3

    P.reduce(add)([ 1, 2 ]) // 3

### inject

Reduces values to a single value, starting with a seed value. The callback
function receives the previous and current values, but does _not_ receive an
index argument.

    P([ 1, 2 ]).inject(add, 3) // P(6)

    P.inject(add, 3, [ 1, 2 ]) // 6

    P.inject(add)(3, [ 1, 2 ]) // 6

    P.inject(add)(3)([ 1, 2 ]) // 6

### filter

Removes values that don't result in true when applied to the callback
function.

    P([ 1, 2, 3 ]).filter(isOdd) // P([ 1, 3 ])

    P.filter(isOdd, [ 1, 2, 3 ]) // [ 1, 3 ]

    P.filter(isOdd)([ 1, 2, 3 ]) // [ 1, 3 ]
    
### each

Iterates over each value and passes it into the callback function. The
callback function does _not_ receive an index argument.

    P([ 1, 2 ]).each(log) // P([ 1, 2 ]) and logs each value

    P.each(log, [ 1, 2 ]) // [ 1, 2 ] and logs each value

    P.each(log)([ 1, 2 ]) // [ 1, 2 ] and logs each value

### slice

Like `Array.prototype.slice`, but works with array-like objects. Both `start`
and `end` arguments are required, but you can pass in `undefined` for `end` to
slice from `start` to the end of the array.

    P([ 1, 2, 3, 4 ].slice(1, 2) // P([ 2, 3 ])

    P.slice(1, 2, [ 1, 2, 3, 4 ]) // [ 2, 3 ]

    P.slice(1, undefined, [ 1, 2, 3, 4 ]) // [ 2, 3, 4 ]

### join

Like `Array.prototype.join`, but works with array-like objects.

    P([ 1, 2 ]).join(',') // P('1, 2')

    P.join(',', [ 1, 2 ]) // '1, 2'

### keys

Like `Object.keys()`, but works even when `Object.keys` isn't defined.

    P({ a: 1, b: 2 }).keys() // P([ 'a', 'b' ]) or P([ 'b', 'a' ])

    P.keys({ a: 1, b: 2 }) // [ 'a', 'b' ] or [ 'b', 'a' ]

JavaScript does not guarantee the order in which an object's keys are returned
so don't rely on it.

### tap

Invokes the callback function with the current value and then returns the
current Pointless object. This is meant mostly for debugging purposes.

    P([ 1, 2 ]).tap(log) // P([ 1, 2 ]) and logs the array

Unfortunately, not all browsers allow `console.log` to be invoked as an
unbound function. Use the `.console`, `.log`, or similar methods for that.

### console

Invokes `method` on `console` with the current value. If `label` is
defined, `': '` is appended to it, and then that's used as a prefix.

    P([ 1, 2 ]).console('log', 'foo') // P([ 1, 2 ]) and logs "foo: 1, 2"

For convenience, `log`, `info`, `warn`, and `error` methods also exist:

    P([ 1, 2 ]).log('foo') // P([ 1, 2 ]) and logs "foo: 1, 2"

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

### when

Tests the current value and then executes one of the two functions.

The test can be a function, in which case the current value is
applied to that function.

The test can also be a non-function. In this case, the current
value is compared (with `===`) to that value.

### Conditional Methods

These common tests have their own Pointless object methods that invoke
`.when()` for you:

- .truthy(then, else) // tests if value is truthy
- .falsy(then, else) // value is falsy
- .defined(then, else) // value is not `undefined` (`null` is OK)
- .undefined(then, else) // value is `undefined` (`null` is not `undefined`)
- .exists(then, else) // value is not `null` or `undefined`
- .nothing(then, else) // value is `null` or `undefined`
- .any(then, else) // value has `length > 0` or is truthy
- .empty(then, else) // value has `length === 0` or is falsy

If the test passes, the `then` argument is invoked with the current value.
Otherwise, the `else` argument is invoked with the current value. Both the
`then` and `else` arguments are optional.

### Partial Application

`P.partial()` returns a function that applies its arguments to the
right of the original arguments.

    var pf = P.partial(f, 1, 2);
    pf(3, 4); // Calls f with 1, 2, 3, and 4

`P.partialRight()` returns a function that applies its arguments to
the left of the original arguments.

    var pf = P.partialRight(f, 3, 4);
    pf(1, 2); // Calls f with 1, 2, 3, and 4

### Function Chaining

`P.chain()` accepts any number of functions and returns a new function that
passes its argument through those function arguments. It's like reverse
function composition.

    var squareThenIncrement = P.chain(square, increment);
    squareThenIncrement(2); // Equivalent to increment(square(2)) so returns 5

### Formatting

Use `P.format()` like you would use C#'s `string.Format()`:

    var greeting = P.format('Hello, {0}!', person.name);

It also accepts named placeholders when the second argument is an object:

    var greeting = P.format('Hello, {name}!', person);

The second argument can be an array:

    var greeting = P.format('Hello, {0} and {1}', [ person1.name, person2.name ]);

If only one argument is specified, a partially applied function is returned:

    var greeter = P.format('Hello, {name}!');
    var greeting = greeter(person);

When used as a method on Pointless objects, the current value is the data:

    var greeting = P(person).format('Hello, {name}!');

### then

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
