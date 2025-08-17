
window.TCC = (function() {
  var TCC = TCC || {};
  var Module = TCC;
  Module.noInitialRun = true;
  var HEAP, HEAPU8, HEAPU16, HEAPU32, HEAP16, HEAP32, HEAPF32, HEAPF64;
  var STACK_TOTAL = 5242880;
  var STACK_BASE = 8192;
  var STACK_MAX = STACK_BASE + STACK_TOTAL;

  function TCClib_run_main(str) {
    var argc = 0,
      argv = 0;
    if (str) {
      var str_array = str.split(' ');
      argc = str_array.length;
      argv = Module._malloc(4 * (argc + 1));
      for (var i = 0; i < argc; i++) {
        Module.setValue(argv + i * 4, Module.allocate(Module.intArrayFromString(str_array[i]), 'i8', 0), '*');
      }
      Module.setValue(argv + argc * 4, 0, '*');
    }
    return Module.ccall('main', 'number', ['number', 'number'], [argc, argv]);
  }

  function TCClib_compile(code) {
    if (TCC.compiled) {
      TCC.compiled = false;
      Module._free(TCC.reloc_ptr);
    }
    var code_ptr = Module.allocate(Module.intArrayFromString(code), 'i8', 0);
    var reloc_ptr = Module.ccall('tcc_compile', 'number', ['string'], [code]);
    Module._free(code_ptr);
    if (reloc_ptr) {
      TCC.reloc_ptr = reloc_ptr;
      TCC.compiled = true;
      return 0;
    } else {
      return 1;
    }
  }

  function TCClib_run(func_name) {
    if (!TCC.compiled) {
      TCC.stderr_string = "Error: Nothing to run";
      return 1;
    }
    var func = Module.find_symbol(func_name);
    if (!func) {
      TCC.stderr_string = "Error: Symbol '" + func_name + "' not found.";
      return 1;
    }
    try {
      return Module.dynCall('i', func, []);
    } catch (e) {
      TCC.stderr_string = "Error: Runtime error in '" + func_name + "'";
      return 1;
    }
  }

  function TCClib_find_symbol(sym) {
    return TCC.compiled ? Module.find_symbol(sym) : 0;
  }

  var stdout_buffer = [];

  function TCClib_set_stdout(f) {
    stdout_buffer = [];
    if (f) {
      TCC.stdout_func = function(c) {
        if (c === 10) {
          f(String.fromCharCode.apply(null, stdout_buffer));
          stdout_buffer = [];
        } else {
          stdout_buffer.push(c);
        }
      }
    } else {
      TCC.stdout_func = null;
    }
  }
  var stderr_buffer = [];

  function TCClib_set_stderr(f) {
    stderr_buffer = [];
    if (f) {
      TCC.stderr_func = function(c) {
        if (c === 10) {
          f(String.fromCharCode.apply(null, stderr_buffer));
          stderr_buffer = [];
        } else {
          stderr_buffer.push(c);
        }
      }
    } else {
      TCC.stderr_func = null;
    }
  }
  Module.print = function(text) {
    if (TCC.stdout_func) {
      for (var i = 0; i < text.length; i++) {
        TCC.stdout_func(text.charCodeAt(i));
      }
    }
  }
  Module.printErr = function(text) {
    if (TCC.stderr_func) {
      for (var i = 0; i < text.length; i++) {
        TCC.stderr_func(text.charCodeAt(i));
      }
    }
  }
  TCC = {
    HEAPU8: HEAPU8,
    compiled: false,
    reloc_ptr: 0,
    stderr_string: "",
    compile: TCClib_compile,
    run: TCClib_run,
    run_main: TCClib_run_main,
    find_symbol: TCClib_find_symbol,
    set_stdout: TCClib_set_stdout,
    set_stderr: TCClib_set_stderr
  };
  TCC.stdout_func = null;
  TCC.stderr_func = null;

  var memoryInitializer = "tcc.wasm";
  var wasmBinaryFile = "tcc.wasm";
  var wasmBinary;
  var wasmPageSize = 65536;
  var wasmMinMem = 16777216;
  var wasmMaxMem = 16777216;
  Module.preInit = [];
  Module.preRun = [];
  Module.postRun = [];
  var WasmPromise;
  var ASM_CONSTS = {
    1048576: function() {
      return TCC.stderr_string
    }
  };
  Module.asmLibraryArg = {
    a: Math.abs,
    b: Math.acos,
    c: Math.asin,
    d: Math.atan,
    e: Math.atan2,
    f: Math.ceil,
    g: Math.cos,
    h: Math.exp,
    i: Math.floor,
    j: Math.log,
    k: Math.pow,
    l: Math.sin,
    m: Math.sqrt,
    n: Math.tan,
    o: function(p) {
      return TCC.stdout_func ? TCC.stdout_func(p) : null
    },
    p: function(p) {
      return TCC.stderr_func ? TCC.stderr_func(p) : null
    }
  };
  (function() {
    var p = Module.preRun.shift();
    Module.preRun.unshift(function() {
      if (p) {
        p()
      }
      for (var q in ASM_CONSTS) {
        if (ASM_CONSTS.hasOwnProperty(q)) {
          Module.asmLibraryArg[q] = ASM_CONSTS[q]
        }
      }
    })
  })();

  function updateGlobalBuffer(p) {
    Module.HEAPU8 = HEAPU8 = p
  }

  function updateGlobalBufferViews(p) {
    Module.HEAPU8 = HEAPU8 = p;
    Module.HEAP16 = HEAP16 = new Int16Array(p.buffer);
    Module.HEAPU16 = HEAPU16 = new Uint16Array(p.buffer);
    Module.HEAP32 = HEAP32 = new Int32Array(p.buffer);
    Module.HEAPU32 = HEAPU32 = new Uint32Array(p.buffer);
    Module.HEAPF32 = HEAPF32 = new Float32Array(p.buffer);
    Module.HEAPF64 = HEAPF64 = new Float64Array(p.buffer)
  }
  var unfulfilledWasmPromises = [];
  var wasmImports = [];
  var wasmExports = [];

  function writeStackCookie(p) {
    var q = STACK_MAX - p;
    Module.setValue(q, 21535216, "i32");
    Module.setValue(q + 4, 1234567, "i32")
  }

  function checkStackCookie() {
    var p;
    try {
      p = HEAPU8.length
    } catch (q) {
      return
    }
    var r = Module.getValue(p - 16, "i32");
    var s = Module.getValue(p - 12, "i32");
    if (r !== 21535216 || s !== 1234567) {
      abortStackOverflow(p - 16)
    }
  }

  function abortStackOverflow(p) {
    abort("Stack overflow! Attempted to write to byte " + p + ", but stack is only " + STACK_TOTAL + " bytes tall from " + STACK_BASE + " to " + (STACK_BASE + STACK_TOTAL))
  }
  var UTF8Decoder = typeof TextDecoder !== "undefined" ? new TextDecoder("utf8") : undefined;

  function demangle(p) {
    try {
      if (p && Module["___cxa_demangle"]) {
        var q = Module.allocate(Module.intArrayFromString(p), "i8", 0);
        var r = Module["___cxa_demangle"](q, 0, 0, 0);
        if (r) {
          var s = Pointer_stringify(r);
          Module._free(r)
        }
      }
      return s || p
    } finally {
      if (q) Module._free(q)
    }
  }

  function demangleAll(p) {
    return p.replace(/_Z[\w\d_]+/g, function(q) {
      var r = demangle(q);
      return r === q ? q : r + " [" + q + "]"
    })
  }

  function jsStackTrace() {
    var p = new Error;
    if (!p.stack) {
      try {
        throw new Error
      } catch (q) {
        p = q
      }
      if (!p.stack) {
        return "(no stack trace available)"
      }
    }
    return p.stack.toString()
  }

  function stackTrace() {
    var p = jsStackTrace();
    if (Module.extraStackTrace) {
      p += "\n" + Module.extraStackTrace()
    }
    return demangleAll(p)
  }
  var PAGE_SIZE = 4096;

  function alignMemory(p, q) {
    var r = p % q > 0 ? p - p % q + q : p;
    return r
  }
  var HEAP;
  var buffer;
  var HEAP8, HEAPU8, HEAP16, HEAPU16, HEAP32, HEAPU32, HEAPF32, HEAPF64;
  updateGlobalBuffer(new ArrayBuffer(16777216));
  updateGlobalBufferViews(HEAPU8);

  function callRuntimeCallbacks(p) {
    while (p.length > 0) {
      var q = p.shift();
      if (typeof q == "function") {
        q();
        continue
      }
      var r = q.func;
      if (typeof r === "number") {
        if (q.arg === undefined) {
          Module.dynCall_v(r)
        } else {
          Module.dynCall_vi(r, q.arg)
        }
      } else {
        r(q.arg === undefined ? null : q.arg)
      }
    }
  }
  var __ATPRERUN__ = [];
  var __ATINIT__ = [];
  var __ATMAIN__ = [];
  var __ATEXIT__ = [];
  var __ATPOSTRUN__ = [];
  var runtimeInitialized = false;
  var runtimeExited = false;

  function preRun() {
    if (Module.preRun) {
      if (typeof Module.preRun == "function") Module.preRun = [Module.preRun];
      while (Module.preRun.length) {
        addOnPreRun(Module.preRun.shift())
      }
    }
    callRuntimeCallbacks(__ATPRERUN__)
  }

  function initRuntime() {
    runtimeInitialized = true;
    callRuntimeCallbacks(__ATINIT__)
  }

  function postRun() {
    if (Module.postRun) {
      if (typeof Module.postRun == "function") Module.postRun = [Module.postRun];
      while (Module.postRun.length) {
        addOnPostRun(Module.postRun.shift())
      }
    }
    callRuntimeCallbacks(__ATPOSTRUN__)
  }

  function addOnPreRun(p) {
    __ATPRERUN__.unshift(p)
  }

  function addOnInit(p) {
    __ATINIT__.unshift(p)
  }

  function addOnPostRun(p) {
    __ATPOSTRUN__.unshift(p)
  }
  var runDependencies = 0;
  var runDependencyWatcher = null;
  var dependenciesFulfilled = null;

  function addDependency(p) {
    runDependencies++;
    if (Module.monitorRunDependencies) {
      Module.monitorRunDependencies(runDependencies)
    }
  }

  function removeDependency(p) {
    runDependencies--;
    if (Module.monitorRunDependencies) {
      Module.monitorRunDependencies(runDependencies)
    }
    if (runDependencies == 0) {
      if (runDependencyWatcher !== null) {
        clearInterval(runDependencyWatcher);
        runDependencyWatcher = null
      }
      if (dependenciesFulfilled) {
        var q = dependenciesFulfilled;
        dependenciesFulfilled = null;
        q()
      }
    }
  }
  Module.preloadedImages = {};
  Module.preloadedAudios = {};

  function abort(p) {
    if (Module["onAbort"]) {
      Module["onAbort"](p)
    }
    if (typeof p !== "string") {
      p = JSON.stringify(p)
    }
    var q = "Aborted(" + p + ")";
    var r = "";
    if (p) {
      var s = p.toString();
      var t = s.indexOf("\n");
      if (t !== -1) {
        r = s.slice(0, t)
      } else {
        r = s
      }
    }
    throw "Aborted(" + p + ")";
  }
  if (typeof WebAssembly !== "object") {
    Module.printErr("no wasm support found")
  }
  var wasmMemory;
  var wasmTable;
  var ABORT = false;
  var HEAP_SIZE = 16777216;

  function alignUp(p, q) {
    return p + (q - p % q) % q
  }
  vargb = 8192;
  var CodeInfo = function() {
    this.start = 0;
    this.end = 0;
    this.stack_base = 0;
    this.stack_max = 0
  };
  CodeInfo.prototype = {
    set: function(p, q, r, s) {
      this.start = p;
      this.end = q;
      this.stack_base = r;
      this.stack_max = s
    }
  };
  var ci = new CodeInfo;
  var GLOBAL_BASE = 8192;
  var STATIC_BASE = 8192,
    STATIC_TOP = STATIC_BASE + 6896,
    STATICTOP = STATIC_TOP;
  var an = false;
  Module["ALLOC_STATIC"] = 1;
  Module["memoryClass"] = WebAssembly.Memory;
  Module["wasmMemory"] = new WebAssembly.Memory({
    initial: 256
  });
  Module.asm = function(p, q, r) {
    var s = new WebAssembly.Instance(wasmBinary, {
      "global.Math": p,
      env: q,
      "global.asax-": r
    }).exports;
    return s
  };
  addDependency("wasm-instantiate");

  function receiveInstance(p, q) {
    var r = p.exports;
    Module.asm = r;
    wasmMemory = Module.asm["hb"];
    wasmTable = Module.asm["zb"];
    updateGlobalBuffer(wasmMemory.buffer);
    updateGlobalBufferViews(HEAPU8);
    Module.asm.Ab();
    removeDependency("wasm-instantiate");
    if (Module.onRuntimeInitialized) Module.onRuntimeInitialized()
  }

_free = function() {
return Module.asm.Eb.apply(null, arguments)
};
tcc_compile = function() {
return Module.asm.ub.apply(null, arguments)
};
find_symbol = function() {
return Module.asm.vb.apply(null, arguments)
};
_malloc = function() {
return Module.asm.Db.apply(null, arguments)
};
getValue = function() {
return Module.asm.yb.apply(null, arguments)
};
setValue = function() {
return Module.asm.xb.apply(null, arguments)
};
ccall = function() {
return Module.asm.wb.apply(null, arguments)
};
addFunction = function() {
return Module.asm.zb.apply(null, arguments)
};
removeFunction = function() {
return Module.asm.Bb.apply(null, arguments)
};
var calledRun;
Module["then"] = function(p) {
if(calledRun) {
p(Module);
return
}
var q = function() {
p(Module)
};
addOnPostRun(q);
return this
};
function init(p) {
p = p || {};
if (p.wasm_path) {
memoryInitializer = p.wasm_path
}
WasmPromise = new Promise(function(q, r) {
if(typeof exports === "object" && typeof module === "object") {
var s = require("fs");
var t = require("path");
wasmBinaryFile = t.join(p.wasm_path, "tcc.wasm");
wasmBinary = s.readFileSync(wasmBinaryFile);
q(new WebAssembly.Module(wasmBinary))
} else {
var u = new XMLHttpRequest;
u.open("GET", memoryInitializer, true);
u.responseType = "arraybuffer";
u.onload = function() {
q(new WebAssembly.Module(u.response))
};
u.send(null)
}
}).then(function(q) {
return WebAssembly.instantiate(q, {
"global.Math": Math,
env: {
memory: Module.wasmMemory,
table: new WebAssembly.Table({
initial: 10,
maximum: 10,
element: "anyfunc"
}),
__memory_base: STATIC_BASE,
__table_base: 0,
abort: abort,
_sbrk: function(p) {
var q = HEAPU8.length;
if (p > 0) {
if (q + p > wasmMaxMem) return -1;
var r = new ArrayBuffer(q + p);
var s = new Uint8Array(r);
s.set(HEAPU8);
HEAPU8 = s;
wasmMemory.grow(p / wasmPageSize);
updateGlobalBuffer(wasmMemory.buffer);
updateGlobalBufferViews(HEAPU8)
}
return q
},
_open: function() {
return -1
},
_close: function() {
return -1
},
_read: function() {
return -1
},
_write: function(p, q, r) {
var s = "";
for (var t = 0; t < r; t++) {
s += String.fromCharCode(HEAPU8[q + t])
}
if (p == 1) {
Module.print(s)
} else if (p == 2) {
Module.printErr(s)
}
return r
},
_lseek: function() {
return -1
},
___errno_location: function() {
return STATICTOP
},
_exit: function() {},
__exit: function() {},
_getenv: function() {
return 0
},
_time: function() {
return Date.now() / 1e3 | 0
}
}
})
}).then(function(q) {
receiveInstance(q);
return TCC
});
return WasmPromise
}
return {init:init}
})();

    