
var TCC = (function() {
    'use strict';

    var Module = {};

    function get_tcc() {
        var stdout_buffer = "";
        var stderr_buffer = "";
        var TCC_RELOCATE_AUTO = 1;

        var tcc = {
            add_library_path: Module.cwrap('tcc_add_library_path', 'number', ['number', 'string']),
            add_include_path: Module.cwrap('tcc_add_include_path', 'number', ['number', 'string']),
            add_sysinclude_path: Module.cwrap('tcc_add_sysinclude_path', 'number', ['number', 'string']),
            define_symbol: Module.cwrap('tcc_define_symbol', 'number', ['number', 'string', 'string']),
            undefine_symbol: Module.cwrap('tcc_undefine_symbol', 'number', ['number', 'string']),
            set_output_type: Module.cwrap('tcc_set_output_type', 'number', ['number', 'number']),
            get_output_type: function(state) {
                return Module.ccall("tcc_get_output_type", 'number', ['number'], [state]);
            },

            compile: function(code, options) {
                stdout_buffer = "";
                stderr_buffer = "";
                var state = Module.ccall("tcc_new", 'number');
                if (!state) {
                    throw "Could not create TCC compilation state";
                }
                if (options) {
                    for (var i = 0; i < options.length; i++) {
                        Module.ccall("tcc_add_argument", null, ['number', 'string'], [state, options[i]]);
                    }
                }
                this.set_output_type(state, 0); // TCC_OUTPUT_MEMORY
                var ret = Module.ccall("tcc_compile_string", 'number', ['number', 'string'], [state, code]);
                if (ret === -1) {
                    Module.ccall("tcc_delete", null, ['number'], [state]);
                    return ret;
                }
                var size = Module.ccall("tcc_relocate", 'number', ['number', TCC_RELOCATE_AUTO], [state]);
                if (size === -1) {
                    Module.ccall("tcc_delete", null, ['number'], [state]);
                    return size;
                }
                tcc.state = state;
                return 0;
            },
            run: function(args) {
                if (!tcc.state) {
                    throw "Compile something first";
                }
                var ret = Module.ccall("tcc_run", 'number', ['number', 'number', 'number'], [tcc.state, (args||[]).length, 0]);
                Module.ccall("tcc_delete", null, ['number'], [tcc.state]);
                delete tcc.state;
                return ret;
            },
            getStdout: function() {
                return stdout_buffer;
            },
            getStderr: function() {
                return stderr_buffer;
            }
        };

        var TCC_MESSAGE_BUFFER_SIZE = 1024;
        var tcc_message_buffer = Module._malloc(TCC_MESSAGE_BUFFER_SIZE);

        var tcc_callback = function(ptr, data) {
            var msg = Module.UTF8ToString(data);
            stderr_buffer += msg + "\n";
        };

        var tcc_callback_ptr = Module.addFunction(tcc_callback, 'vi');
        
        var stdout_callback = function(char) {
            if (char === null || char === 10) {
                // on newline, flush buffer
            } else {
                stdout_buffer += String.fromCharCode(char);
            }
        };

        var stdout_callback_ptr = Module.addFunction(stdout_callback, 'vi');
        Module.ccall("set_stdout", null, ["number"], [stdout_callback_ptr]);

        var _tcc_new = Module.cwrap('tcc_new', 'number');
        var tcc_set_error_func = Module.cwrap('tcc_set_error_func', null, ['number', 'number', 'number']);
        
        var tcc_new_wrapped = function() {
            var state = _tcc_new();
            tcc_set_error_func(state, tcc_message_buffer, tcc_callback_ptr);
            return state;
        };
        Module.tcc_new = tcc_new_wrapped;
        
        return tcc;
    }

    return new Promise(function(resolve, reject) {
        Module.onRuntimeInitialized = function() {
            resolve(get_tcc());
        };
        
        // Fetch and load the wasm file
        fetch('/tcc/tcc.wasm').then(response =>
            response.arrayBuffer()
        ).then(bytes => {
            Module.wasmBinary = bytes;
            var script = document.createElement('script');
            script.src = '/tcc/tcc.js';
            script.onload = function() {
                // TCC Module is now loaded
            };
            document.body.appendChild(script);
        }).catch(err => reject(err));
    });
})();
