
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

fs.appendFileSync(argv.out, 'Path,File Name,Test Type,Test Number,Line Number,It Statement,Describe Statement\n');    

glob(`${argv.dir}/**/*.js`, {"ignore":[`${argv.dir}/**/node_modules/**`]}, function (er, fileNames) {
 // files is an array of filenames. 
 // If the `nonull` option is set, and nothing 
 // was found, then files is ["**/*.js"] 
 // er is an error object or null. 
    
    fileNames.forEach(function(fileName) {
    const rl = readline.createInterface({
        input: fs.createReadStream(fileName)
    });

    //separate into path and filename
    var fileNameRelativePath = fileName.replace(argv.dir,'./');
    var fileNamesArray = fileNameRelativePath.split('/');
    var fileNameOnly = fileNamesArray.pop();
    var pathWithinDir = fileNamesArray.join('/');
    
    var testType = 'Unknown';
    if (fileName.match('comp.spec.js')) {
        testType = 'Component test';
    } else {
        testType = 'Unit test';
    }
    
    extractTestNames(rl, fileName, testType, pathWithinDir, fileNameOnly);
    //console.log(`Done with file ${fileName}`);
});
})

const extractTestNames = (rl, fileName, testType, pathWithinDir, fileNameOnly) => {
    var lineNumber = 0;
    var testNumber = 0;
    var describeStatement = 'Unknown';
    var itStatement = 'Unknown';
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
            testNumber++;
            try {
                quoteUsed = line.trim().match(/\"|\'/g)[0];
                itStatement = line.split(quoteUsed)[1];
            } catch (e) {
                console.log(`Error in file: ${fileName}, line # ${lineNumber}`);
                itStatement = '### Error parsing the it statement ###';
            }
            itStatement = itStatement.replace(',','');
            //console.log(`File ${fileName}, Test ${testNumber}, Line ${lineNumber}, quote ${quoteUsed}: ${shouldStatement}`);
            fs.appendFileSync(argv.out, `${pathWithinDir},${fileNameOnly},${testType},${testNumber},${lineNumber},${itStatement},${describeStatement}\n`);
        }
    });
}

//add file write error handling