; (function(root, factory) {
    if (typeof exports === 'object') {
        module.exports = factory(require);
    } else if (typeof define === 'function' && define.amd) {
        define([ 'require' ], factory);
    } else {
        root.P = factory(function() { return root.Q; });
    }
})(this, function(require) {

function Pointless(val, previous) {
    if (!(this instanceof Pointless)) { return new Pointless(val); }
    this._ = val;
    if (previous) {
        this.p = previous;
    }
}

Pointless.partial = function(fn) {
    var left = Pointless.slice(arguments, 1);
    return function() {
        return fn.apply(this, left.concat(Pointless.slice(arguments)));
    };
};

Pointless.partialRight = function(fn) {
    var right = Pointless.slice(arguments, 1);
    return function() {
        return fn.apply(this, Pointless.slice(arguments).concat(right));
    };
};

Pointless.extend = function(target, source) {
    for (var key in source) {
        if (source.hasOwnProperty(key)) {
            target[key] = source[key];
        }
    }
    return target;
};

Pointless.map = function(_, fn) {
    var result;
    if (_.map) {
        result = _.map(fn);
    } else if (typeof _.length === 'number') {
        result = [];
        for (var i = 0, n = _.length; i < n; i++) {
            result.push(fn(_[i], i));
        }
    } else {
        result = fn(_, 0);
    }
    return result;
};

Pointless.reduce = function(_, fn, seed) {
    var result;
    var seeded = arguments.length >= 3;
    if (_.reduce) {
        result = seeded ? _.reduce(fn, seed) : _.reduce(fn);
    } else if (typeof _.length === 'number') {
        var i = 0;
        if (seeded) {
            result = seed;
        } else {
            if (_.length === 0) {
                throw new TypeError('Reduce of empty array with no initial value');
            }
            i = 1;
            result = _[0];
        }
        for (var n = _.length; i < n; i++) {
            result = fn(result, _[i], i);
        }
    } else {
        if (seeded) {
            result = fn(seed, _, 0);
        } else {
            result = _;
        }
    }
    return result;
};

Pointless.each = function(_, fn) {
    if (_.forEach) {
        _.forEach(fn);
    } else if (typeof _.length === 'number') {
        for (var i = 0, n = _.length; i < n; i++) {
            fn(_[i], i, _);
        }
    } else {
        fn(_, 0);
    }
    return _;
};

Pointless.slice = function(_, start, end) {
    if (_.slice) {
        return _.slice(start, end);
    } else if (typeof _.length === 'number') {
        return Array.prototype.slice.call(_, start, end);
    }
    return [ _ ].slice(start, end);
};

Pointless.join = function(_, separator) {
    if (_.join) {
        return _.join(separator);
    }
    return Pointless.slice(_).join(separator);
};

Pointless.keys = function(_) {
    if (Object.keys) {
        return Object.keys(_);
    }
    var keys = [];
    for (var key in _) {
        if (_.hasOwnProperty(key)) {
            keys.push(key);
        }
    }
    return keys;
};

Pointless.prototype.then = function(fn) {
    return new this.constructor(fn(this._), this);
};

Pointless.prototype.extend = function(source) {
    return this.then(function(val) {
        return Pointless.extend(val, source);
    });
};

Pointless.prototype.map = function(fn) {
    return new this.constructor(
        Pointless.map(this._, fn),
        this
    );
};

Pointless.prototype.reduce = function(fn, seed) {
    return new this.constructor(
        arguments.length === 2 ? Pointless.reduce(this._, fn, seed)
                               : Pointless.reduce(this._, fn),
        this
    );
};

Pointless.prototype.each = function(fn) {
    return new this.constructor(
        Pointless.each(this._, fn),
        this
    );
};

Pointless.prototype.mapEach = function(fn) {
    return this.map(fn);
};

Pointless.prototype.slice = function(start, end) {
    return this.then(function(_) {
        return Pointless.slice(_, start, end);
    });
};

Pointless.prototype.join = function(separator) {
    return this.then(function(_) {
        return Pointless.join(_, separator);
    });
};

Pointless.prototype.keys = function() {
    return this.then(function(_) {
        return Pointless.keys(_);
    });
};

Pointless.prototype.tap = function(fn) {
    return this.then(function(val) {
        fn(val);
        return val;
    });
};

Pointless.prototype.console = function(method, label) {
    return this.tap(function(val) {
        if (typeof console !== 'undefined') {
            console[method](label ? label + ': ' + val : val);
        }
    });
};

Pointless.prototype.log = function(label) {
    return this.console('log', label);
};

Pointless.prototype.info = function(label) {
    return this.console('info', label);
};

Pointless.prototype.warn = function(label) {
    return this.console('warn', label);
};

Pointless.prototype.error = function(label) {
    return this.console('error', label);
};

Pointless.prototype.save = function() {
    this.saved = true;
    return this;
};

Pointless.prototype.restore = function() {
    var previous = this.p;
    while (previous) {
        if (previous.saved) {
            return previous;
        }
        previous = previous.p;
    }
    throw new Error('Nothing saved');
};

Pointless.truthy = function(_) { return !!_; };
Pointless.falsy = function(_) { return !_; };
Pointless.defined = function(_) { return _ !== void 0; };
Pointless['undefined'] = function(_) { return _ === void 0; };
Pointless.any = function(_) { return _ && typeof _.length === 'number' ? _.length > 0 : !!_; };
Pointless.empty = function(_) { return (_ && _.length === 0) || !_; };
Pointless.exists = function(_) { return _ !== null && _ !== undefined; };
Pointless.nothing = function(_) { return _ === null || _ === undefined; };

Pointless.prototype.when = function(test, then, else_) {
    return this.then(function(_) {
        return (typeof test === 'function' ? test(_)
                                           : _ === test) ?  then ? then (_) : _
                                                         : else_ ? else_(_) : _
                                                         ;
    });
};

var conditionals = 'truthy falsy defined undefined any empty exists nothing'.split(' ');

Pointless.each(conditionals, function(name) {
    var test = Pointless[name];
    Pointless.prototype[name] = function(then, else_) {
        return this.when(test, then, else_);
    };
});

Pointless.prototype.eventually = function() {
    return new Promise(this._, this);
};

Pointless.prototype.immediately = function() {
    return new Pointless(this._, this);
};

var Q;

function Promise(val, previous) {
    if (!(this instanceof Promise)) { return new Promise(val, previous); }
    Q = Q || require('q');
    if (!Q) { throw new Error('Q?'); }
    Pointless.call(this, Q.when(val), previous);
}

Promise.prototype = new Pointless();

Promise.prototype.constructor = Promise;

Pointless(Promise.prototype).extend({

    then: function(fulfilled, rejected, progressed) {
        return new this.constructor(
            this._.then(function(val) {
                return Array.isArray(val) ? Q.all(val) : val;
            })
            .then(fulfilled, rejected, progressed)
        );
    },

    fail: function(rejected) {
        return new this.constructor(
            this._.fail(rejected)
        );
    },

    map: function(fn) {
        return new this.constructor(
            this._.then(function(val) {
                return Pointless.map(val, function(val) {
                    return Q.when(val, function(val) {
                        return fn(val);
                    });
                });
            })
        );
    },

    reduce: function(fn, seed) {
        var seeded = arguments.length === 2;
        return new this.constructor(
            this._.then(function(_) {
                // Since we always pass a seed into Pointless.reduce,
                // we need to check if the actual seed exists here.
                if (!seeded) {
                    if (typeof _.length === 'number') {
                        if (_.length === 0) {
                            throw new TypeError('Reduce of empty array with no initial value');
                        }
                        seed = _[0];
                        _ = Pointless.slice(_, 1);
                    } else {
                        // Check for undefined and pretend it's empty array?
                        return _;
                    }
                }
                return Pointless.reduce(_, function(promise, current, index) {
                    return promise.then(function(previous) {
                        return fn(previous, current, index + (seeded ? 0 : 1));
                    });
                }, Q.when(seed));
            })
        );
    },

    each: function(fn) {
        return this.reduce(function(previous, current) {
            return Q.when(fn(current), function(val) {
                return current;
            });
        }, null); // Seed is ignored, but this allows empty arrays.
    },

    mapEach: function(fn) {
        return this.reduce(function(results, current) {
            return Q.when(fn(current), function(val) {
                return results.concat(val);
            });
        }, []);
    }

});

function Nothing(previous) {
    this.p = previous;
}

Nothing.prototype = new Pointless();

Nothing.prototype.constructor = Nothing;

Pointless(Pointless.prototype).keys().each(function(key) {
    Nothing.prototype[key] = function() { return this; };
});

Pointless.Promise = Promise;
Pointless.Nothing = Nothing;

return Pointless;

});
