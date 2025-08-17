
window.TCC = (() => {
    var Module = {};
    function b64ToByteArray(base64) {
        var binary_string = window.atob(base64);
        var len = binary_string.length;
        var bytes = new Uint8Array(len);
        for (var i = 0; i < len; i++) {
            bytes[i] = binary_string.charCodeAt(i);
        }
        return bytes;
    }
    Module.init = (wasm_b64_string) => {
        return new Promise(resolve => {
            const wasm_binary = b64ToByteArray(wasm_b64_string);
            WebAssembly.compile(wasm_binary).then(WasmModule => {
                var TCC = {
                    module: WasmModule,
                    stdout_lines: [],
                    stdin_queue: [],
                    on_stdout: function (c) {
                        if (c === 10) {
                            this.stdout_lines.push('');
                        } else {
                            if (this.stdout_lines.length == 0) this.stdout_lines.push('');
                            this.stdout_lines[this.stdout_lines.length-1] += String.fromCharCode(c);
                        }
                    },
                    set_stdout: function (callback) {
                        this.on_stdout = callback;
                    },
                    on_stderr: function (c) { this.on_stdout(c) },
                    set_stderr: function (callback) {
                        this.on_stderr = callback;
                    },
                    on_stdin: function () {
                        if(this.stdin_queue.length > 0)
                            return this.stdin_queue.shift();
                        return null;
                    },
                    set_stdin: function (callback) {
                        this.on_stdin = callback;
                    },
                    compile: function (source) {
                        this.stdout_lines = [];
                        var memory = new WebAssembly.Memory({ initial: 256 });
                        var HEAP8 = new Int8Array(memory.buffer);
                        var HEAPU8 = new Uint8Array(memory.buffer);
                        var HEAP16 = new Int16Array(memory.buffer);
                        var HEAPU16 = new Uint16Array(memory.buffer);
                        var HEAP32 = new Int32Array(memory.buffer);
                        var HEAPU32 = new Uint32Array(memory.buffer);
                        var HEAPF32 = new Float32Array(memory.buffer);
                        var HEAPF64 = new Float64Array(memory.buffer);
                        var STACKTOP = 0;
                        var STACK_MAX = memory.buffer.byteLength;
                        var instance = new WebAssembly.Instance(this.module, {
                            env: {
                                memory: memory,
                                __memory_base: 0,
                                __table_base: 0,
                                stackSave: (label) => STACKTOP,
                                stackRestore: (label) => { },
                                _sbrk: (len) => {
                                    var old_top = STACKTOP;
                                    STACKTOP += len;
                                    return old_top;
                                },
                                ___seterrno: (a) => { },
                                _write: (fd, buf, len) => {
                                    for (var i = 0; i < len; ++i) {
                                        this.on_stdout(HEAPU8[buf + i]);
                                    }
                                    return len;
                                },
                                _read: (fd, buf, len) => {
                                    var ret = 0;
                                    for (var i = 0; i < len; ++i) {
                                        var c = this.on_stdin();
                                        if (c === null) break;
                                        HEAPU8[buf + i] = c;
                                        ret = i;
                                    }
                                    return ret;
                                },
                                _close: (fd) => 0,
                                _lseek: (fd, a, b) => 0,
                                _fstat: (fd, a) => 0,
                            }
                        });
                        var source_ptr = instance.exports.malloc(source.length + 1);
                        for (var i = 0; i < source.length; i++) {
                            HEAPU8[source_ptr + i] = source.charCodeAt(i);
                        }
                        HEAPU8[source_ptr + source.length] = 0;
                        var argv_ptr = instance.exports.malloc(4 * 4);
                        var argv0_ptr = instance.exports.malloc(4);
                        HEAPU8[argv0_ptr] = 0;
                        var argv1_ptr = instance.exports.malloc(3);
                        HEAPU8[argv1_ptr] = 45;
                        HEAPU8[argv1_ptr + 1] = 114;
                        HEAPU8[argv1_ptr + 2] = 0;
                        var argv2_ptr = instance.exports.malloc(3);
                        HEAPU8[argv2_ptr] = 45;
                        HEAPU8[argv2_ptr + 1] = 111;
                        HEAPU8[argv2_ptr + 2] = 0;
                        HEAP32[(argv_ptr >> 2)] = argv0_ptr;
                        HEAP32[(argv_ptr >> 2) + 1] = argv1_ptr;
                        HEAP32[(argv_ptr >> 2) + 2] = argv2_ptr;
                        HEAP32[(argv_ptr >> 2) + 3] = source_ptr;
                        instance.exports.tcc_main(4, argv_ptr);
                        var mem_ptr = HEAPU32[2];
                        var mem_len = HEAPU32[3];
                        var reloc_ptr = HEAPU32[4];
                        var reloc_len = HEAPU32[5];
                        var new_mem = new Uint8Array(mem_len);
                        for(var i=0; i<mem_len; ++i) {
                            new_mem[i] = HEAPU8[mem_ptr + i];
                        }
                        var relocs = [];
                        for(var i=0; i<reloc_len/4; ++i) {
                            relocs.push(HEAPU32[reloc_ptr/4 + i]);
                        }
                        this.reloc_ptr = reloc_ptr;
                        this.relocs = relocs;
                        this.mem = new_mem;
                        this.mem_len = mem_len;
                    },
                    run: function(args) {
                        this.stdout_lines = [];
                        this.stdin_queue = [];
                        var memory = new WebAssembly.Memory({ initial: 256 });
                        var HEAP8 = new Int8Array(memory.buffer);
                        var HEAPU8 = new Uint8Array(memory.buffer);
                        var HEAP16 = new Int16Array(memory.buffer);
                        var HEAPU16 = new Uint16Array(memory.buffer);
                        var HEAP32 = new Int32Array(memory.buffer);
                        var HEAPU32 = new Uint32Array(memory.buffer);
                        var HEAPF32 = new Float32Array(memory.buffer);
                        var HEAPF64 = new Float64Array(memory.buffer);
                        var DYNAMICTOP = 0;
                        for(var i=0; i<this.mem_len; ++i) {
                            HEAPU8[i] = this.mem[i];
                        }
                        for(var i=0; i<this.relocs.length; ++i) {
                            var reloc = this.relocs[i];
                            var type = reloc & 0xff;
                            var offset = reloc >> 8;
                            var sym_index = HEAPU32[offset/4];
                            if(sym_index == 1) { // __global_base
                                HEAPU32[offset/4] = 0;
                            } else if (sym_index == 2) { // HEAP_BASE
                                HEAPU32[offset/4] = 0;
                            }
                        }
                        var instance = new WebAssembly.Instance(this.module, {
                            env: {
                                memory: memory,
                                __memory_base: 0,
                                __table_base: 0,
                                _exit: (code) => { throw 'exit'; },
                                ___seterrno: (a) => { },
                                _sbrk: (len) => {
                                    var old_top = DYNAMICTOP;
                                    DYNAMICTOP += len;
                                    return old_top;
                                },
                                _write: (fd, buf, len) => {
                                    for (var i = 0; i < len; ++i) {
                                        this.on_stdout(HEAPU8[buf + i]);
                                    }
                                    return len;
                                },
                                _read: (fd, buf, len) => {
                                    var ret = 0;
                                    for (var i = 0; i < len; ++i) {
                                        var c = this.on_stdin();
                                        if (c === null) break;
                                        HEAPU8[buf + i] = c;
                                        ret = i;
                                    }
                                    return ret;
                                },
                                _close: (fd) => 0,
                                _lseek: (fd, a, b) => 0,
                                _fstat: (fd, a) => 0,
                            }
                        });
                        try {
                            instance.exports.main(0, 0);
                        } catch(e) {
                            if(e !== 'exit') throw e;
                        }
                    }
                };
                resolve(TCC);
            });
        });
    }
    return Module;
})();
