
/*
* tool to extract should statements from all files
*/

const readline = require('readline');
const fs = require('fs');
const glob = require("glob");
const argv = require('yargs')
    .usage('Usage: $0 --dir [starting directory] --out [output file name]')
    .demandOption(['dir','out'])
    //.default ('dir', '')
    .argv;

//argv.dir = ".";
//argv.out = "test9.csv";
console.log(argv.dir);
console.log(argv.out);

//if file exists, ask to overwite; for now, just overwrite

fs.writeFile(argv.out, 'Path,"File Name","Test Type","Test Number In File","Line Number",Implemented,Should,Describe\n', function (err) {
    if (err) {
        return console.log("Error writing file: " + err);
    }
});    

glob(`${argv.dir}/**/*spec.js`, {"ignore":[`${argv.dir}/**/node_modules/**`]}, function (er, fileNames) {
    
    fileNames.forEach(function(fileName) {
    const rl = readline.createInterface({
        input: fs.createReadStream(fileName)
    });

    //separate into path and filename
    var fileNameRelativePath = fileName.replace(argv.dir,'./');
    var fileNamesArray = fileNameRelativePath.split('/');
    var fileNameOnly = fileNamesArray.pop();
    var pathWithinDir = fileNamesArray.join('/');
    
    //determie test type
    var testType = 'Unknown';
    if (fileName.match('comp.spec.js')) {
        testType = 'Component test';
    } else {
        testType = 'Unit test';
    }
    
    extractTests(rl, fileName, testType, pathWithinDir, fileNameOnly, function (testsInFile){
        console.log(`${testsInFile.itCount} its and ${testsInFile.ntCount} nts in file ${fileName}`);
    });
    //console.log(`${testsInFile.itCount} its and ${testsInFile.ntCount} nts in file ${fileName}`);
});
})

const extractTests = (rl, fileName, testType, pathWithinDir, fileNameOnly, callback) => {
    var lineNumber = 0;
    var itCounter = 0;
    var ntCounter = 0;
    var describeStatement = 'Unknown';
    var itStatement = 'Unknown';
    var ntStatement = 'Unknown';
    var quoteUsed = '';
    
    rl.on('line', (line) => {
        lineNumber++;
        if (line.trim().startsWith("describe(")) {
            //console.log("Found a describe statement!");
            try {
                quoteUsed = line.trim().match(/\"|\'/g)[0];
                describeStatement = line.split(quoteUsed)[1];
            } catch (e) {
                console.log(`Error in file: ${fileName}, line # ${lineNumber}`);
                describeStatement = '### Error parsing the describe statement ###';
            }
            describeStatement = describeStatement.replace(',','');
            //console.log(describeStatement);
        }
        if (line.trim().startsWith("it(")) {
            itCounter++;
            try {
                quoteUsed = line.trim().match(/\"|\'/g)[0];
                itStatement = line.split(quoteUsed)[1];
            } catch (e) {
                console.log(`Error in file: ${fileName}, line # ${lineNumber}`);
                itStatement = '### Error parsing the it statement ###';
            }
            itStatement = itStatement.replace(',','');
            //console.log(`File ${fileName}, Test ${testNumber}, Line ${lineNumber}, quote ${quoteUsed}: ${shouldStatement}`);
            fs.appendFile(argv.out, `${pathWithinDir},${fileNameOnly},${testType},${itCounter},${lineNumber},Implemented,${itStatement},${describeStatement}\n`, function (err) {
                if (err) {
                    return console.log("Error appending file: " + err);
                }
            });
        }
        if (line.trim().startsWith("nt(")) {
            ntCounter++;
            try {
                quoteUsed = line.trim().match(/\"|\'/g)[0];
                ntStatement = line.split(quoteUsed)[1];
            } catch (e) {
                console.log(`Error in file: ${fileName}, line # ${lineNumber}`);
                ntStatement = '### Error parsing the nt statement ###';
            }
            ntStatement = ntStatement.replace(',','');
            //console.log(`File ${fileName}, Test ${testNumber}, Line ${lineNumber}, quote ${quoteUsed}: ${shouldStatement}`);
            fs.appendFile(argv.out, `${pathWithinDir},${fileNameOnly},${testType},${ntCounter},${lineNumber},Necessary,${ntStatement},${describeStatement}\n`, function (err) {
                if (err) {
                    return console.log("Error appending file: " + err);
                }
            });
        }
    }).on('close', () => {
        //console.log('Have a great day!');
        //function () {
        //console.log(itCounter, ntCounter);
        var testsInFile = {
            itCount: itCounter,
            ntCount: ntCounter
        };
        //console.log(`tests in file before return: ${testsInFile.itCount}, ${testsInFile.ntCount}`);
        callback(testsInFile);
        //return testsInFile;
        //process.exit(0);
      });
}

//add file write error handling - Done