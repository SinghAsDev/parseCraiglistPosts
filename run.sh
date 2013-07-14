#!/bin/bash

cities='houston austin columbus dallas seattle washington'
pages='0 100 200 300 400 500'
outFile='allContacts.txt'

rm -rf $outFile

for city in $cities
do
    for page in $pages
    do
        echo Running: ./parseCraiglist.js  -u 'http://'$city'.craigslist.org/search/sss?s='$page'&query=moving&srchType=A' 2>/dev/null
        ./parseCraiglist.js  -u 'http://'$city'.craigslist.org/search/sss?s='$page'&query=moving&srchType=A' 2>/dev/null
        cat contacts.log >> $outFile
    done
done
