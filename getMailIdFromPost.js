#!/usr/bin/env node

var program = require('commander');
var cheerio = require('cheerio');
var restler = require('restler');
var fs = require('fs');

var OUT_FILE = 'contacts.log';

var logToFile = function(contact, outFile){
    fs.appendFileSync(outFile, contact + '\n');
};

var getMailId = function(url, outFile){
    console.log('==>Called for url: ' + url);
    if(url === null) return;

    restler.get(url).on('complete', function(result){
        if(result instanceof Error){
            console.log('%s is not accessible. \n Exiting.', url);
            process.exit(1);
        }

        $ = cheerio.load(result);
        var mailToLink = $('.dateReplyBar a').attr('href');
        try{
            mailId = mailToLink.split(':')[1].split('?')[0];
            logToFile(mailId, outFile);
        } 
        catch (e){
            console.log('***********');
            console.log('Failed parsing href: ' + mailToLink);
            console.log('***********');
        }
    });
};

var getAllMailIds = function(urls, outFile){
   // urls = JSON.parse(urlsJson);
    for(var i in urls)
    {
        getMailId(urls[i], outFile);
    }
};

if(require.main == module){
    program
        .option('-p, --postUrl <Url for craiglist post>',
                null, null)
        .option('-o, --out <Output file>',
                null, OUT_FILE)
        .parse(process.argv);
   if(program.postUrl === null){
       console.log('Specify post\'s URL with -p. \nExiting');
       process.exit(1);
   }

   getMailId(program.postUrl, program.out);
} else {
    exports.getMailId = getMailId;
    exports.getAllMailIds = getAllMailIds;
}
