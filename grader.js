#!/usr/bin/env node

var fs = require('fs');
var program = require('commander');
var cheerio = require('cheerio');
var HTMLFILE_DEF = 'index.html';
var CHECKSFILE_DEF = 'checks.json';

var assertFileExists = function(inFile){
    var inStr = inFile.toString();
    if(!fs.existsSync(inStr)){
        console.log('%s does not exist. Exiting!', inStr);
        // http://nodejs.org/api/process.html#process_process_exit_code
        process.exit(1);
    }
    return inStr;
}

var cheerioHtmlFile = function(htmlFile){
    return cheerio.load(fs.readFileSync(htmlFile));
}

var loadChecks = function(checksFile){
    return JSON.parse(fs.readFileSync(checksFile));
}

var checkHtmlFile = function(htmlFile, checksFile){
    $ = cheerioHtmlFile(htmlFile);
    var checks = loadChecks(checksFile).sort();
    var out = {};
    for (var ii in checks){
        var present = $(checks[ii]).length > 0;
        out[checks[ii]] = present;
    }
    return out;
}

var clone = function(fn){
    // Workaround for commander.js issue.
    // http://stackoverflow.com/a/6772648
    return fn.bind({});
}

if(require.main == module){
    program
        .option(
            '-c, --checks <check_file>', 
            'Path to checks.json', 
            clone(assertFileExists), 
            CHECKSFILE_DEF)
        .option(
            '-f, --file <html_file>', 
            'Path to index.html', 
            clone(assertFileExists), 
            HTMLFILE_DEF)
        .parse(process.argv);
    var checkJson = checkHtmlFile(program.file, program.checks);
    var outJson = JSON.stringify(checkJson, null, 4);
    console.log(outJson);
} else {
    exports.checkHtmlFile = checkHtmlFile;
}
