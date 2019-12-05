#!/usr/bin/env node

const FormData = require('form-data');
const fetch = require('node-fetch');
const fs = require('fs');
const JSDOM = require('jsdom').JSDOM;
const chalk = require('chalk');
const path = require('path');
const validatorURL = 'https://validator.w3.org/nu/#file';

// read input
const dirOrFile = process.argv[2] || './';
const exists = fs.existsSync(dirOrFile);

// if input doesn't exist stop program
if (!exists) {
    console.log(`File or directory "${dirOrFile}" does not exist.`);
    return;
}

// parse either file or folder
const stat = fs.lstatSync(dirOrFile);
if (stat.isFile()) {
    parseFile(dirOrFile);
} else {
    parseFiles(dirOrFile);
}

/**
 * Validates all the files in directory and logs total stats at the end.
 * @param dir 
 */
function parseFiles(dir) {
    // read all files in directory and validate them
    const dirData = fs.readdirSync(dir);
    const parsedFiles = Promise.all(dirData
        .map(name => path.join(dir, name))
        .filter(p => path.parse(p).ext === '.html')
        .map(p => parseFile(p))
    );

    // log the total stats of the validation
    parsedFiles.then(data => {
        if (!data.length) {
            console.log(chalk.red('\r\nError: No Files to validate found.'));
            return;
        } 

        console.log(chalk.bold(`\r\n${data.length} files validated.`));
        
        if (data.every(d => d.success)) {
            // All files validated successfully
            console.log(chalk.bold(`Validation ${chalk.green('succeded')} for all files.`));
        } else {
            // Some files failed validation
            console.log(chalk.bold(`Validation ${chalk.red('failed')} for the following files:`));
            data
                .filter(d => !d.success)
                .forEach(d => console.log(`- ${d.file} (${d.errors} Errors, ${d.warnings} Warnings)`));
        }
    });
}

/**
 * Validates file and logs warnings & errors
 * @param file 
 */
function parseFile(file) {
    // create formdata with file
    const data = new FormData();
    data.append('uploaded_file', fs.createReadStream(file));
    
    // upload file to validator
    return fetch(validatorURL, {
        method: 'POST',
        body: data
    })
    .then(response => response.text())
    .then(response => {
        // get data from response
        const dom = new JSDOM(response);
        const doc = dom.window.document;
        const results = doc.querySelector('#results');
        const success = results.querySelector('.success');
        const errors = results.querySelectorAll('.error');
        const warnings = results.querySelectorAll('.warning');
    
        // log validation results
        logResult(file, success, errors, warnings);
        
        // return validation results data
        return {
            file,
            success: !!success,
            warnings: warnings.length,
            errors: errors.length,
        }
    });
}

/**
 * Logs the results of file validation.
 * @param file 
 * @param success 
 * @param errors 
 * @param warnings 
 */
function logResult(file, success, errors, warnings) {
    // Validation successfull but warnings occured
    if (!!success && warnings.length > 0) {
        console.log(`\r\nThe validation for file ${file} ${chalk.green('succeded')} with ${chalk.yellow('warnings')}.`);
        logList(warnings, chalk.yellow);
        return;
    }

    // Validation successfull
    if (!!success && warnings.length === 0) {
        console.log(`\r\nThe validation for file ${file} ${chalk.green('succeded')}.`);
        return;
    }

    // Validation failed and errors occured    
    if (!success && errors.length > 0) {
        console.log(`\r\nThe validation for file ${file} ${chalk.red('failed')}.`);
        logList(warnings, chalk.yellow);
        logList(errors, chalk.red);
        return;
    }
}

/**
 * Logs all items in a list with specific color.
 * @param list 
 * @param color 
 */
function logList(list, color) {
    list.forEach(item => {
        const text = chalk.gray(item.querySelector('span').textContent);
        console.log(color('Warning: ') + text);
    });
}