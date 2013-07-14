#!/usr/bin/env node

var program = require('commander');
var cheerio = require('cheerio');
var restler = require('restler');
var fs = require('fs');
var getMailIdFromPost = require('./getMailIdFromPost');

var URL_DEFAULT = 'http://houston.craigslist.org/search/?areaID=23&subAreaID=&query=moving&catAbb=sss';
var TAG_DEFAULT = '.row a';
var ATTR_DEFAULT = 'href';
var CREATE_URL_FROM_PARENT = true;
var OUT_FILE = 'contacts.log';

var cheerioHtmlFile = function(htmlFile){
    return cheerio.load(fs.readFileSync(htmlFile));
};

var createFullChildUrl = function(parentUrl, childUrl){
    if(childUrl.toString().indexOf('http://') > -1)
    {
        return childUrl;
    }
    return 'http://' + parentUrl.split('/')[2] + childUrl;
};

var displayOnConsole = function(array){
    console.log(JSON.stringify(array, null, 4));
};

var logToFile = function(array){
    fs.writeFileSync('postsList.log', JSON.stringify(array, null, 4));
};

var parseHtmlForTag = function(url, htmlFile, tag, attrib, 
                                createUrlFromParent, outFile){
    $ = cheerioHtmlFile(htmlFile);

    var out = [];
    $(tag).each(function(i, elem){
        if(true === createUrlFromParent)
        {
            var postUrl = createFullChildUrl(url, $(this).attr(attrib));
            if(postUrl.toString().indexOf('.html') > -1 && 
                out[out.length - 1] !== postUrl)
            {
                out.push(postUrl);
                new getMailIdFromPost.getMailId(postUrl, outFile);
            }
        } 
        else 
        {
            out.push($(this).attr(attrib));
        }
    });

    //getMailIdFromPost.getAllMailIds(out, outFile);
    //displayOnConsole(out);
    //logToFile(out);
};

var parseURL = function(url, tag, attrib, createUrlFromParent, out){
   restler.get(url).on('complete', function(result){
       if(result instanceof Error)
       {
           console.log('Error accessing %s. Exiting.', url);
           process.exit(1);
       }

       var sourceHtml = 'sourceHtml.html';
       fs.writeFileSync(sourceHtml, result);

       parseHtmlForTag(url, sourceHtml, tag, attrib, 
                       createUrlFromParent, out);
   });
};

if(require.main == module)
{
    program
        .option('-u, --url <URL of page to parse>',
                null, URL_DEFAULT)
        .option('-t, --tag <Tag to catch>',
                null, TAG_DEFAULT)
        .option('-a, --attrib <Attribute of tag to catch>',
                null, ATTR_DEFAULT)
        .option('-c --createUrlFromParent <Create Url From Parent>',
                null, CREATE_URL_FROM_PARENT)
        .option('-o, --out <Output file>',
                null, OUT_FILE)
        .parse(process.argv);
    
    if(fs.existsSync(program.out))
    {
        var newName = program.out.toString() + '_old';
        fs.renameSync(program.out, newName);
        console.log('%s already exists in current directory.', program.out);
        console.log('%s moved to %s', program.out, newName);
    }

    parseURL(program.url, program.tag, program.attrib, program.createUrlFromParent, program.out);
}
