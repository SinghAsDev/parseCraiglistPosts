#!/usr/bin/env node

var program      = require('commander');
var cheerio      = require('cheerio');
var restler      = require('restler');
var fs           = require('fs');
var eventEmitter = require('events').EventEmitter,
    emitter      = new eventEmitter();

var OUT_FILE     = 'contacts.log';
var QUEUED_EVENT = 'queued';

var logToFile = function(contact, outFile){
    fs.appendFileSync(outFile, contact + '\n');
};

var parserIsBusy = false;

var getMailId = function(url, outFile){
    parserIsBusy = true;
    if(url === null) return;

    restler.get(url).once('complete', function(result){
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
        catch (e){ //No replyTo link found
        }
        finally{
            parserIsBusy = false;
            emitter.emit(QUEUED_EVENT);
        }
    });
};

var popQ = function(){
    if(urlQ.length > 0 && !parserIsBusy){
        var url = urlQ.shift();
        getMailId(url, OUT_FILE);
    }
};

var urlQ = [];

var parsePost = function(url, outFile){
    urlQ.push(url);
    emitter.emit(QUEUED_EVENT);
};

emitter.on(QUEUED_EVENT, popQ);

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
    exports.parsePost = parsePost;
}
