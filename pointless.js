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

P.unary = function(fn) {
    return function(value) {
        if (arguments.length === 0) {
            return P.unary(fn);
        }
        return fn.call(this, value);
    };
};

P.binary = function(fn) {
    return function(value1, value2) {
        switch (arguments.length) {
            case 0:
                return P.binary(fn);
            case 1:
                return P.unary(function(value2) {
                    return fn.call(this, value1, value2);
                });
            default:
                return fn.call(this, value1, value2);
        }
    };
};

P.value = function(_) {
    return _;
};

P.get = P.binary(function(key, _) {
    return _ && _[key];
});

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

P.chain = function() {
    var fns = P.slice(arguments);
    return function(value) {
        return fns.reduce(function(p, c) { return c(p); }, value);
    };
};

var formatRegExp = /\{([^}]+)\}/g;

P.format = function(fmt, data) {
    if (arguments.length === 1) {
        return P.partial(P.format, fmt);
    }
    var args = arguments.length > 2 ? P.slice(arguments, 1) : data;
    return fmt.replace(formatRegExp, function(match, key) {
        var val = key === '0' ? (args && args.length > 0 ? args[0] : data)
                              : (args && args[key]);
        return P.exists(val) ? val : '';
    });
};

P.extend = function(target, source) {
    for (var key in source) {
        if (source.hasOwnProperty(key)) {
            target[key] = source[key];
        }
    }
    return target;
};

P.isArrayLike = function(_) {
    return _ && typeof _.length === 'number';
};

P.map = P.binary(function(fn, _) {
    if (typeof fn === 'object') {
        return P.map(function(val) {
            var obj = {};
            P(fn).keys().each(function(key) {
                obj[key] = fn[key](val);
            });
            return obj;
        }, _);
    }
    var result;
    if (_.map) {
        result = _.map(function(_) {
            return fn(_);
        });
    } else if (P.isArrayLike(_)) {
        result = [];
        for (var i = 0, n = _.length; i < n; i++) {
            result.push(fn(_[i]));
        }
    } else {
        result = fn(_);
    }
    return result;
});

P.reduce = function(_, fn, seed) {
    var result;
    var seeded = arguments.length >= 3;
    if (_.reduce) {
        var ignoreIndex = function(previous, current) {
            return fn(previous, current);
        };
        result = seeded ? _.reduce(ignoreIndex, seed) : _.reduce(ignoreIndex);
    } else if (P.isArrayLike(_)) {
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
            result = fn(result, _[i]);
        }
    } else {
        if (seeded) {
            result = fn(seed, _);
        } else {
            result = _;
        }
    }
    return result;
};

P.each = function(_, fn) {
    if (_.forEach) {
        _.forEach(fn);
    } else if (P.isArrayLike(_)) {
        for (var i = 0, n = _.length; i < n; i++) {
            fn(_[i], i, _);
        }
    } else {
        fn(_, 0, [ _ ]);
    }
    return _;
};

P.filter = function(_, fn) {
    var result;
    if (_.filter) {
        result = _.filter(fn);
    } else if (P.isArrayLike(_)) {
        result = [];
        for (var i = 0, n = _.length; i < n; i++) {
            if (fn(_[i], i, _)) {
                result.push(_[i]);
            }
        }
    } else {
        result = fn(_, 0, [ _ ]) ? _ : undefined;
    }
    return result;
};

P.slice = function(_, start, end) {
    if (_.slice) {
        return _.slice(start, end);
    } else if (P.isArrayLike(_)) {
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

P.prototype.then = function(fulfilled) {
    return new this.constructor(fulfilled(this._));
};

P.prototype.fail = function(rejected) {
    return this.then(null, rejected);
};

P.prototype.format = function(fmt) {
    return this.then(function(val) {
        return P.format(fmt, val);
    });
};

P.prototype.extend = function(source) {
    return this.then(function(val) {
        return P.extend(val, source);
    });
};

P.prototype.map = function(fn) {
    return this.then(function(_) { return P.map(fn, _); });
};

P.prototype.reduce = function(fn, seed) {
    var seeded = arguments.length === 2;
    return this.then(function(val) {
        return seeded ? P.reduce(val, fn, seed) : P.reduce(val, fn);
    });
};

P.prototype.each = function(fn) {
    return this.then(function(val) { return P.each(val, fn); });
};

P.prototype.filter = function(fn) {
    return this.then(function(val) { return P.filter(val, fn); });
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

var consoleMethods = 'log info warn error'.split(' ');

P.each(consoleMethods, function(name) {
    P.prototype[name] = function(label) {
        return this.console(name, label);
    };
});

P.prototype.when = function(test, then, else_) {
    return this.then(function(_) {
        return (typeof test === 'function' ? test(_)
                                           : _ === test) ? then  ? then (_) : _
                                                         : else_ ? else_(_) : _
                                                         ;
    });
};

P.truthy = function(_) { return !!_; };
P.falsy = function(_) { return !_; };
P.defined = function(_) { return _ !== void 0; };
P['undefined'] = function(_) { return _ === void 0; };
P.exists = function(_) { return _ !== null && _ !== undefined; };
P.nothing = function(_) { return _ === null || _ === undefined; };
P.any = function(_) { return P.isArrayLike(_) ? _.length > 0 : !!_; };
P.empty = function(_) { return (_ && _.length === 0) || !_; };

var conditionals = 'truthy falsy defined undefined exists nothing any empty'.split(' ');

P.each(conditionals, function(name) {
    var test = P[name];
    P.prototype[name] = function(then, else_) {
        return this.when(test, then, else_);
    };
});

P.prototype.eventually = function() {
    return new Promise(this._);
};

P.prototype.immediately = function() {
    return new P(this._);
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

Promise.prototype.then = function(fulfilled, rejected, progressed) {
    return new this.constructor(
        this._.then(function(val) {
            return Array.isArray(val) ? Q.all(val) : val;
        })
        .then(fulfilled, rejected, progressed)
    );
};

Promise.prototype.reduce = function(fn, seed) {
    var seeded = arguments.length === 2;
    return this.then(function(val) {
        return seeded ? Q.when(seed)
                         .then(function(seed) {
                            return P.reduce(val, reducer, seed);
                         })
                      : P.reduce(val, reducer)
                      ;
    });
    function reducer(previous, current) {
        return Q.when(previous)
                .then(function(previous) {
                    return fn(previous, current);
                }
        );
    }
};

P.Promise = Promise;

return P;

});
