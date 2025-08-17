
window.TCC = (function() {
    "use strict";

    function b64_to_uint8(b64) {
        var str = atob(b64.trim()); // Trim whitespace
        var len = str.length;
        var bytes = new Uint8Array(len);
        for (var i = 0; i < len; i++) {
            bytes[i] = str.charCodeAt(i);
        }
        return bytes;
    }

    var TCC = function() {
        this.exports = {};
    };

    TCC.prototype.init = function(b64_string) {
        var self = this;
        var bytes = b64_to_uint8(b64_string);
        return WebAssembly.instantiate(bytes, {
            env: {
                __eqsf2: function() {},
                __eqdf2: function() {},
                __addsf3: function() {},
                __adddf3: "adddf3",
                __subsf3: function() {},
                __subdf3: function() {},
                __extendsfdf2: function() {},
                __truncdfsf2: function() {},
                __fixsfsi: function() {},
                __fixdfsi: function() {},
                __fixunssfsi: function() {},
                __fixunsdfsi: function() {},
                __floatsisf: function() {},
                __floatsidf: function() {},
                __floatunsisf: function() {},
                __floatunsidf: function() {},
                __mulsf3: function() {},
                __muldf3: function() {},
                __divsf3: function() {},
                __divdf3: function() {},
                __gesf2: function() {},
                __gedf2: function() {},
                __ltsf2: function() {},
                __ltdf2: function() {},
                emscripten_asm_const_int: function() {},
                emscripten_asm_const_double: function() {},
            },
        }).then(function(result) {
            self.exports = result.instance.exports;
            self.memory = self.exports.memory;
            return self;
        });
    }

    TCC.prototype.compile = function(prog) {
        var exit_code;
        this.exports.main();
        exit_code = this.exports.tcc_compile_string(prog);
        return exit_code;
    }

    TCC.prototype.run = function() {
        var exit_code;
        this.exports.main();
        exit_code = this.exports.tcc_run_string();
        return exit_code;
    }

    TCC.prototype.set_stdout = function(func) {
        this.exports.set_stdout(func);
    }
    TCC.prototype.set_stderr = function(func) {
        this.exports.set_stderr(func);
    }
    
    return new TCC();
})();
