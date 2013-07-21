#!/usr/bin/env node

var fs = require('fs');
var program = require('commander');
var cheerio = require('cheerio');
var rest = require('restler');
var HTML_DEF = 'index.html';
var CHECKS_DEF = 'checks.json';

var assertFileExists = function(inFile){
    var inStr = inFile.toString();
    /*jslint node: true, stupid: true */
    if(!fs.existsSync(inStr)){
        console.log('%s does not exist. Exiting!', inStr);
        // http://nodejs.org/api/process.html#process_process_exit_code
        process.exit(1);
    }
    return inStr;
};

var loadChecks = function(checksFile){
    /*jslint node: true, stupid: true */
    return JSON.parse(fs.readFileSync(checksFile));
};

var checkHtmlFile = function(htmlFile, checksFile){
    $ = cheerio.load(htmlFile);
    var checks = loadChecks(checksFile).sort();
    var out = {};
    var ii = null;
    for (ii in checks){
        var present = $(checks[ii]).length > 0;
        out[checks[ii]] = present;
    }
    return out;
};

var clone = function(fn){
    // Workaround for commander.js issue.
    // http://stackoverflow.com/a/6772648
    return fn.bind({});
};

function checkHtml(err, html){
    if (err){
        console.log('Error : ' + err);
        process.exit(1);
    }
    var checkJson = checkHtmlFile(html, program.checks);
    var outJson = JSON.stringify(checkJson, null, 4);
    console.log(outJson);
}

if(require.main === module){

    program
        .option('-c, --checks <check_file>',
                'Check path',
                clone(assertFileExists),
                CHECKS_DEF)
        .option('-f, --file <html_file>',
                'File path',
                clone(assertFileExists),
                HTML_DEF)
        .option('-u, --url <url_pointer>', 'Url link that needs to be graded')
        .parse(process.argv);

    if (program.url){
        rest.get(program.url)
            .on('complete', function(result){
                checkHtml((result instanceof Error), result);
            });
    } else {
        fs.readFile(program.file, checkHtml);
    }
} else {
    exports.checkHtmlFile = checkHtmlFile;
}
