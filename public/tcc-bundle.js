
// This file is a self-contained bundle for the TCC compiler in WASM.
// It's designed to be loaded via a <script> tag.
// It will expose a `TCC` object on the `window`.
var TCC = (function() {
    'use strict';
    var Module = {};

    Module.locateFile = function(path, prefix) {
        // Correctly locate the .wasm file relative to the public directory
        return prefix + path;
    }

    Module.env = {
        write: function(s) {
            if (Module.on_stdout) Module.on_stdout(s);
        },
        writeErr: function(s) {
            if (Module.on_stderr) Module.on_stderr(s);
        },
        exit: function(code) {
            if (Module.on_exit) Module.on_exit(code);
        }
    };
    
    var tcc_main;

    Module.onRuntimeInitialized = function() {
        tcc_main = Module.cwrap('tcc_main', 'number', ['number', 'number']);
    };
    
    function compile(source) {
        var exit_code;
        var stdout_buffer = "";
        var stderr_buffer = "";

        Module.on_stdout = function(s) { stdout_buffer += s + "\n"; };
        Module.on_stderr = function(s) { stderr_buffer += s + "\n"; };
        Module.on_exit = function(code) { exit_code = code; };
        
        var args = ["tcc", "-run", "-"];
        var argc = args.length;
        var argv = Module._malloc(argc * 4);
        for (var i = 0; i < argc; i++) {
            var s = Module._malloc(args[i].length + 1);
            Module.stringToUTF8(args[i], s, args[i].length + 1);
            Module.setValue(argv + i * 4, s, 'i32');
        }

        var stdin_stream = FS.open('/dev/stdin', 'w');
        FS.write(stdin_stream, source, 0, source.length, 0);
        FS.close(stdin_stream);

        tcc_main(argc, argv);
        
        for (var i = 0; i < argc; i++) {
            Module._free(Module.getValue(argv + i * 4, 'i32'));
        }
        Module._free(argv);

        return {
            exit_code: exit_code,
            stdout: stdout_buffer,
            stderr: stderr_buffer
        };
    }
    
    Module.compile = compile;

    return new Promise((resolve) => {
        if (Module.calledRun) {
            resolve(Module);
        } else {
            const oldInit = Module.onRuntimeInitialized;
            Module.onRuntimeInitialized = () => {
                oldInit();
                resolve(Module);