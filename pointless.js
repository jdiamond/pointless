; (function(root, factory) {
    if (typeof exports === 'object') {
        module.exports = factory(require);
    } else if (typeof define === 'function' && define.amd) {
        define([ 'require' ], factory);
    } else {
        root.P = factory(function() { return root.Q; });
    }
})(this, function(require) {

var P = Pointless;

function Pointless(val) {
    if (!(this instanceof P)) { return new P(val); }
    this._ = val;
}

P.chain = function() {
    var fns = P.slice(arguments);
    return function(value) {
        return fns.reduce(function(p, c) { return c(p); }, value);
    };
};

P.partial = function(fn) {
    var left = P.slice(arguments, 1);
    return function() {
        return fn.apply(this, left.concat(P.slice(arguments)));
    };
};

P.partialRight = function(fn) {
    var right = P.slice(arguments, 1);
    return function() {
        return fn.apply(this, P.slice(arguments).concat(right));
    };
};

P.extend = function(target, source) {
    for (var key in source) {
        if (source.hasOwnProperty(key)) {
            target[key] = source[key];
        }
    }
    return target;
};

P.map = function(_, fn) {
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

P.reduce = function(_, fn, seed) {
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

P.each = function(_, fn) {
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

P.slice = function(_, start, end) {
    if (_.slice) {
        return _.slice(start, end);
    } else if (typeof _.length === 'number') {
        return Array.prototype.slice.call(_, start, end);
    }
    return [ _ ].slice(start, end);
};

P.join = function(_, separator) {
    if (_.join) {
        return _.join(separator);
    }
    return _ === null || _ === undefined ? '' : _.toString();
};

P.keys = function(_) {
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

P.prototype.then = function(fn) {
    return new this.constructor(fn(this._));
};

P.prototype.extend = function(source) {
    return this.then(function(val) {
        return P.extend(val, source);
    });
};

P.prototype.map = function(fn) {
    return new this.constructor(P.map(this._, fn));
};

P.prototype.reduce = function(fn, seed) {
    return new this.constructor(
        arguments.length === 2 ? P.reduce(this._, fn, seed)
                               : P.reduce(this._, fn)
    );
};

P.prototype.each = function(fn) {
    return new this.constructor(P.each(this._, fn));
};

P.prototype.mapEach = function(fn) {
    return this.map(fn);
};

P.prototype.slice = function(start, end) {
    return this.then(function(_) {
        return P.slice(_, start, end);
    });
};

P.prototype.join = function(separator) {
    return this.then(function(_) {
        return P.join(_, separator);
    });
};

P.prototype.keys = function() {
    return this.then(function(_) {
        return P.keys(_);
    });
};

P.prototype.tap = function(fn) {
    return this.then(function(val) {
        fn(val);
        return val;
    });
};

P.prototype.console = function(method, label) {
    return this.tap(function(val) {
        if (typeof console !== 'undefined') {
            console[method](label ? label + ': ' + val : val);
        }
    });
};

P.prototype.log = function(label) {
    return this.console('log', label);
};

P.prototype.info = function(label) {
    return this.console('info', label);
};

P.prototype.warn = function(label) {
    return this.console('warn', label);
};

P.prototype.error = function(label) {
    return this.console('error', label);
};

P.truthy = function(_) { return !!_; };
P.falsy = function(_) { return !_; };
P.defined = function(_) { return _ !== void 0; };
P['undefined'] = function(_) { return _ === void 0; };
P.any = function(_) { return _ && typeof _.length === 'number' ? _.length > 0 : !!_; };
P.empty = function(_) { return (_ && _.length === 0) || !_; };
P.exists = function(_) { return _ !== null && _ !== undefined; };
P.nothing = function(_) { return _ === null || _ === undefined; };

P.prototype.when = function(test, then, else_) {
    return this.then(function(_) {
        return (typeof test === 'function' ? test(_)
                                           : _ === test) ?  then ? then (_) : _
                                                         : else_ ? else_(_) : _
                                                         ;
    });
};

var conditionals = 'truthy falsy defined undefined any empty exists nothing'.split(' ');

P.each(conditionals, function(name) {
    var test = P[name];
    P.prototype[name] = function(then, else_) {
        return this.when(test, then, else_);
    };
});

P.prototype.eventually = function() {
    return new Promise(this._, this);
};

P.prototype.immediately = function() {
    return new P(this._, this);
};

var Q;

function Promise(val) {
    if (!(this instanceof Promise)) { return new Promise(val); }
    Q = Q || require('q');
    if (!Q) { throw new Error('Q?'); }
    P.call(this, Q.when(val));
}

Promise.prototype = new P();

Promise.prototype.constructor = Promise;

P(Promise.prototype).extend({

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
                return P.map(val, function(val) {
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
                // Since we always pass a seed into P.reduce,
                // we need to check if the actual seed exists here.
                if (!seeded) {
                    if (typeof _.length === 'number') {
                        if (_.length === 0) {
                            throw new TypeError('Reduce of empty array with no initial value');
                        }
                        seed = _[0];
                        _ = P.slice(_, 1);
                    } else {
                        // Check for undefined and pretend it's empty array?
                        return _;
                    }
                }
                return P.reduce(_, function(promise, current, index) {
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

P.Promise = Promise;

return P;

});
