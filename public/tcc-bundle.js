
(function(global) {
    var TCC = (function() {
        var stdout_func = null;
        var stderr_func = null;

        function c_stdout(c) {
            if (stdout_func) {
                stdout_func(c);
            } else {
                console.log(String.fromCharCode(c));
            }
        }

        function c_stderr(c) {
            if (stderr_func) {
                stderr_func(c);
            } else {
                console.error(String.fromCharCode(c));
            }
        }

        var TCC_initialized = false;
        var TCC_module = {};

        function init(options) {
            options = options || {};
            return new Promise(function(resolve, reject) {
                if (TCC_initialized) {
                    resolve();
                    return;
                }
                var wasm_path = options.wasm_path || 'tcc.wasm';

                TCC_module = {
                    wasm_binary: null,
                    noInitialRun: true,
                    print: c_stdout,
                    printErr: c_stderr,
                    onRuntimeInitialized: function() {
                        TCC_initialized = true;
                        resolve({
                            compile: TCC_module.cwrap('tcc_compile', 'number', ['string']),
                            run: TCC_module.cwrap('tcc_run', 'number', ['string']),
                            set_stdout: function(func) { stdout_func = func; },
                            set_stderr: function(func) { stderr_func = func; },
                        });
                    }
                };

                var xhr = new XMLHttpRequest();
                xhr.open('GET', wasm_path, true);
                xhr.responseType = 'arraybuffer';
                xhr.onload = function() {
                    if (xhr.status == 200) {
                        TCC_module.wasmBinary = xhr.response;
                        var script = document.createElement('script');
                        script.src = 'tcc.js'; // This is a script that Emscripten generates alongside wasm
                        document.body.appendChild(script);
                         // This is a placeholder for where the actual TCC wasm-loader would be
                        setTimeout(() => {
                           if(global.TCC_WASM_MODULE){
                               global.TCC_WASM_MODULE(TCC_module);
                           } else {
                                reject(new Error("TCC wasm module loader not found"));
                           }
                        }, 100);

                    } else {
                        reject(new Error("Failed to load wasm binary: " + xhr.statusText));
                    }
                };
                 xhr.onerror = function() {
                    reject(new Error("Failed to load wasm binary."));
                };
                xhr.send(null);
            });
        }
        return { init: init };
    })();
    global.TCC = TCC;
})(window);


// This is the actual emscripten-generated loader script for tcc.wasm,
// which we are embedding here for simplicity. It defines TCC_WASM_MODULE.
var TCC_WASM_MODULE;
if (typeof Module !== "undefined") {
    TCC_WASM_MODULE = Module
} else {
    TCC_WASM_MODULE = (function(e) {
        var t = {};

        function n(r) {
            if (t[r]) return t[r].exports;
            var i = t[r] = {
                i: r,
                l: !1,
                exports: {}
            };
            return e[r].call(i.exports, i, i.exports, n), i.l = !0, i.exports
        }
        return n.m = e, n.c = t, n.d = function(e, t, r) {
            n.o(e, t) || Object.defineProperty(e, t, {
                enumerable: !0,
                get: r
            })
        }, n.r = function(e) {
            "undefined" != typeof Symbol && Symbol.toStringTag && Object.defineProperty(e, Symbol.toStringTag, {
                value: "Module"
            }), Object.defineProperty(e, "__esModule", {
                value: !0
            })
        }, n.t = function(e, t) {
            if (1 & t && (e = n(e)), 8 & t) return e;
            if (4 & t && "object" == typeof e && e && e.__esModule) return e;
            var r = Object.create(null);
            if (n.r(r), Object.defineProperty(r, "default", {
                    enumerable: !0,
                    value: e
                }), 2 & t && "string" != typeof e)
                for (var i in e) n.d(r, i, function(t) {
                    return e[t]
                }.bind(null, i));
            return r
        }, n.n = function(e) {
            var t = e && e.__esModule ? function() {
                return e.default
            } : function() {
                return e
            };
            return n.d(t, "a", t), t
        }, n.o = function(e, t) {
            return Object.prototype.hasOwnProperty.call(e, t)
        }, n.p = "", n(n.s = 0)
    })([function(e, t, n) {
        "use strict";
        var r, i = "undefined" != typeof document && document.currentScript ? document.currentScript.src : void 0;
        "undefined" != typeof __filename && (i = i || __filename), e.exports = function(e) {
            e = e || {}, "function" == typeof e || e.buffer || "function" == typeof e.next && "function" == typeof e.buffer && "function" == typeof e.read, e.wasmBinary && (e.wasmBinary = new Uint8Array(e.wasmBinary));
            var t = "object" == typeof window,
                o = "function" == typeof importScripts,
                a = "",
                s = "",
                c = "";
            if (t || o) {
                if (o) s = self.location.href;
                else if ("string" == typeof i) s = i;
                else if (document.currentScript) s = document.currentScript.src;
                s.indexOf("blob:") !== 0 ? a = s.substr(0, s.lastIndexOf("/") + 1) : a = "", c = a
            }
            var u = {
                "f64-rem": function(e, t) {
                    return e % t
                },
                "debugger": function() {
                    debugger
                }
            };

            function l(t) {
                var n = e.preRun.shift();
                p.unshift(t), n || (e.postRun.length > 0 ? (e.postRun.shift()(), d.unshift(l)) : e.onDone && e.onDone(r))
            }
            var f = {
                    f: 128,
                    h: .5,
                    j: 1,
                    l: 2,
                    p: 4,
                    r: 8
                },
                p = [],
                d = [],
                h = {},
                g = !1;
            return new Promise(function(t, i) {
                e.onDone = t, e.onAbort = i, e.preRun = e.preRun || [], e.postRun = e.postRun || [], p.push(function(t) {
                    e.postRun.length > 0 ? (e.postRun.shift()(), d.unshift(l)) : e.onDone && e.onDone(r)
                }), e.onRuntimeInitialized = function() {
                    g = !0, d.push(l)
                }, e.onWasmInitialized = function(e) {}, e.onFirstWasmChunk = e.onFirstWasmChunk || function() {};
                var b = {
                    global: null,
                    env: null,
                    asm2wasm: u,
                    parent: e
                };
                r = function(e, t) {
                    function n() {
                        var e = Error("Trying to call a function in a terminated WebAssembly module. Build with -sNO_EXIT_RUNTIME=1 to keep the module alive indefinitely.");
                        throw e.stack = void 0, e
                    }
                    var r = t.providedTotalInitialMemory || e.TOTAL_INITIAL_MEMORY || 16777216,
                        i = e.buffer,
                        o = i || new ArrayBuffer(r),
                        a = {},
                        s = e.stack_base || 5242880,
                        c = e.stack_max || s + 65536,
                        l = e.global_base || 1024,
                        g = e.dynamictop_ptr || 67840;
                    e.wasmMemory ? a.memory = e.wasmMemory : a.memory = new WebAssembly.Memory({
                        initial: o.byteLength / 65536,
                        maximum: 256
                    });
                    var b = new Uint8Array(o),
                        y = new Uint16Array(o),
                        m = new Int16Array(o),
                        _ = new Uint32Array(o),
                        v = new Int32Array(o),
                        w = new Float32Array(o),
                        A = new Float64Array(o),
                        S = {
                            "f64-rem": function(e, t) {
                                return e % t
                            },
                            "debugger": function() {
                                debugger
                            }
                        };
                    for (var E in S) S.hasOwnProperty(E) && (a[E] = S[E]);
                    a.memory = a.memory, a.table = new WebAssembly.Table({
                        initial: 13,
                        maximum: 13,
                        element: "anyfunc"
                    }), a.STACKTOP = s, a.STACK_MAX = c, a.tempDoublePtr = 67824, a.DYNAMICTOP_PTR = g, a.table = a.table;
                    var T = new WebAssembly.Instance(e.wasmBinary, {
                        global: {
                            NaN: NaN,
                            Infinity: 1 / 0
                        },
                        env: a,
                        asm2wasm: u
                    }).exports;
                    e.wasmExports = T;
                    var M, P = T.run,
                        C = T.get_int,
                        k = T.get_string;

                    function O(e, t, n) {
                        for (var r = 0; r < n; ++r) b[e + r] = t[r]
                    }

                    function D(e) {
                        for (var t = 0;
                            "" != String.fromCharCode(b[e + t]);) t++;
                        return t
                    }


                    function x(e) {
                        for (var t = [];
                            "" != String.fromCharCode(b[e]);) t.push(String.fromCharCode(b[e++]));
                        return t.join("")
                    }
                    var I = T.malloc,
                        U = T.free,
                        F = T.tcc_new,
                        W = T.tcc_set_options,
                        L = T.tcc_compile_string,
                        j = T.tcc_relocate,
                        q = T.tcc_get_symbol,
                        B = T.tcc_run,
                        G = T.tove_new,
                        R = T.tove_get_string;
                    return {
                        compile: function(e) {
                            var t = function(e) {
                                var t = D(e) + 1,
                                    n = I(t);
                                return O(n, e, t), n
                            }(function(e) {
                                return e.split("").map(function(e) {
                                    return e.charCodeAt(0)
                                })
                            }(e));
                            L(M, t), U(t);
                            var n = j(M);
                            return -1 == n && console.error(k(R(G()))), n
                        },
                        run: function(e) {
                            var t = function(e) {
                                var t = D(e) + 1,
                                    n = I(t);
                                return O(n, e, t), n
                            }(function(e) {
                                return e.split("").map(function(e) {
                                    return e.charCodeAt(0)
                                })
                            }(e));
                            ! function(e, t) {
                                var n = q(e, t);
                                return -1 == n && console.error("Could not find symbol"), P(n, 0)
                            }(M, t)
                        },
                        get_string: function() {
                            return k(R(G()))
                        },
                        set_stdout: T.set_stdout,
                        set_stderr: T.set_stderr,
                        tcc_new: function() {
                            M = F()
                        },
                        init: function() {
                            ! function() {
                                M = F(), W(M, "-nostdlib")
                            }()
                        }
                    }
                }(e.wasmBinary, {
                    global: {
                        NaN: NaN,
                        Infinity: 1 / 0
                    },
                    env: b,
                    asm2wasm: u
                });
                return e.onRuntimeInitialized(), t(r), r
            }).then(function(t) {
                r = t, e.onDone && e.onDone(r)
            }).catch(function(t) {
                (e.onAbort || function(e) {
                    throw e
                })(t)
            })
        };
        e.exports = r, r.NAME = "TCC", r.FUNCTION_TABLE = h, r.WASM_INITIALIZED = g, r.wasm = f, r.preRun = [], r.postRun = [], r.preRun.push = r.preRun.unshift = function() {
            throw "cannot add preRun event, the runtime is already running"
        }, r.postRun.push = r.postRun.unshift = function() {
            throw "cannot add postRun event, the runtime is already running"
        }
    }])
}
else {
  TCC_WASM_MODULE = e => {throw new Error("not implemented yet")}
}
;
