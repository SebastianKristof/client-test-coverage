
/*
* tool to extract should statements from all files
*/

const readline = require('readline');
const fs = require('fs');
const glob = require("glob");
const argv = require('yargs')
    .usage('Usage: $0 --dir [starting directory] --out [output file prefix]')
    //.demandOption(['dir','out'])
    .default ('dir', '.') ///Users/cem/GitHub/sense-client/web/assets/hldm/')
    .default ('out', 'tests_')
    .argv;

//argv.dir = ".";
//argv.out = "test9.csv";
console.log(argv.dir);
console.log(argv.out);
const workingDir = argv.dir;
const outFileTests = argv.out + 'tests.csv';
const outFileStats = argv.out + 'stats.csv';

//improve: if file exists, ask to overwite; for now, just overwrite
fs.writeFile(outFileTests, 'Path,File_Name,Test_Type,Test_Number_In_File,Line_Number,Implemented_Status,Should,Describe\n', function (err) {
    if (err) {
        return console.log("Error writing file: " + err);
    }
});
fs.writeFile(outFileStats, 'Path,File_Name,Implemented,Necessary,Percentage\n', function (err) {
    if (err) {
        return console.log("Error writing file: " + err);
    }
});    

var percentImplemented = 0, fileFullyImp = 0, filePartiallyImp = 0, fileNotReady = 0, fileWeird = 0;
var fileNamesArray = [];

glob(`${workingDir}/**/*spec.js`, {"ignore":[`${workingDir}/**/node_modules/**`]}, function (er, fileNames) {
    
    fileNamesArray = fileNames;

}).on('end', () => {
    console.log(`Glob finished`);
    iterateOverFiles(fileNamesArray, function () {
    console.log(`Processed ${fileNamesArray.length} files`);
    //count members of percentImplArray here (100, <100, NaN)
    console.log(`of which \n Fully implemented: ${fileFullyImp}\n Partially implemented: ${filePartiallyImp}\n Not ready: ${fileNotReady}\n Weird: ${fileWeird}`);
});
    //these guys are not in scope because they are modified from within extractTests()
    //console.log(`of which \n Fully implemented: ${fileFullyImp}\n Partially implemented: ${filePartiallyImp}\n Not ready: ${fileNotReady}\n Weird: ${fileWeird}`);
});

//console.log(`of which \n Fully implemented: ${fileFullyImp}\n Partially implemented: ${filePartiallyImp}\n Not ready: ${fileNotReady}\n Weird: ${fileWeird}`);



const iterateOverFiles = (fileNamesArray, callback) => {
    fileNamesArray.forEach(function(fileName) {
        const rl = readline.createInterface({
            input: fs.createReadStream(fileName)
        });

        //separate into path and filename
        var fileNameRelativePath = fileName.replace(workingDir,'./');
        var fileNamesSplit = fileNameRelativePath.split('/');
        var fileNameOnly = fileNamesSplit.pop();
        var pathWithinDir = fileNamesSplit.join('/');
    
        //determine test type
        var testType = 'Unknown';
        if (fileName.match('comp.spec.js')) {
            testType = 'Component test';
        } else {
            testType = 'Unit test';
        }
        //var percentImplArray = [];
        extractTests(rl, fileName, testType, pathWithinDir, fileNameOnly, function (testsInFile){
            //console.log(`${testsInFile.itCount} its and ${testsInFile.ntCount} nts in file ${fileName}`);
            
            //put some counters in here so we get counts of 100%, <100%, and not ready
            // var percentImplemented, fileFullyImp, filePartiallyImp, fileNotReady, fileWeird = 0;
            if (testsInFile.ntCount === 0 || testsInFile.ntCount < testsInFile.itCount) {
                percentImplemented = 'not ready';
                fileNotReady++;
                console.log(fileNotReady + ' not ready file')
            } else if (testsInFile.ntCount === testsInFile.itCount) {
                percentImplemented = 100;
                fileFullyImp++;
            } else if (testsInFile.ntCount > testsInFile.itCount) {
                percentImplemented = testsInFile.itCount/testsInFile.ntCount*100; 
                filePartiallyImp++;
            } else {
                percentImplemented = 'something weird';
                fileWeird++;
            }
             
            //percentImplArray.push(testsInFile.itCount/testsInFile.ntCount*100);
            fs.appendFile(outFileStats, `${pathWithinDir},${fileNameOnly},${testsInFile.itCount},${testsInFile.ntCount},${percentImplemented}\n`, function (err) {
                if (err) {
                    return console.log("Error appending file: " + err);
                }
            });
        });
    });
    callback();
}


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
            try {
                quoteUsed = line.trim().match(/\"|\'/g)[0];
                describeStatement = line.split(quoteUsed)[1];
            } catch (e) {
                console.log(`Error in file: ${fileName}, line # ${lineNumber}`);
                describeStatement = '### Error parsing the describe statement ###';
            }
            describeStatement = describeStatement.replace(',','');
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
            fs.appendFile(outFileTests, `${pathWithinDir},${fileNameOnly},${testType},${itCounter},${lineNumber},Implemented,${itStatement},${describeStatement}\n`, function (err) {
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
            fs.appendFile(outFileTests, `${pathWithinDir},${fileNameOnly},${testType},${ntCounter},${lineNumber},Necessary,${ntStatement},${describeStatement}\n`, function (err) {
                if (err) {
                    return console.log("Error appending file: " + err);
                }
            });
        }
    }).on('close', () => {
        var testsInFile = {
            itCount: itCounter,
            ntCount: ntCounter
        };
        callback(testsInFile);
      });
}

//add file write error handling - Done