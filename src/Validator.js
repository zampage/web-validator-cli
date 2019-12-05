const chalk = require('chalk');
const fs = require('fs');
const path = require('path');
const JSDOM = require('jsdom').JSDOM;
const FormData = require('form-data');
const fetch = require('node-fetch');

module.exports = class Validator {
    constructor(url) {
        this.url = url;
    }

    /**
     * Validates directory or file
     * @param dirOrFile
     */
    validate(dirOrFile) {
        const exists = fs.existsSync(dirOrFile);

        // if input doesn't exist stop program
        if (!exists) {
            console.log(chalk.red(`\r\nFile or directory "${dirOrFile}" does not exist.`));
            return;
        }

        const stat = fs.lstatSync(dirOrFile);
        if (stat.isFile()) {
            this.fetchDOM(dirOrFile)
                .then(doc => this.parseDocument(doc, dirOrFile))
                .catch(err => console.log(chalk.red('\r\n', err)));
        } else {
            const files = this.getFilesToValidate(dirOrFile)
            Promise.all(files.map(file => this.fetchDOM(file).then(doc => this.parseDocument(doc))))
                .then(data => this.logTotalStats(data))
                .catch(err => console.log(chalk.red('\r\n', err)));
        }
    }

    /**
     * Fetch validation DOM from fileupload.
     * @param file 
     */
    async fetchDOM(file) {
        // create formdata with file
        const data = new FormData();
        data.append('uploaded_file', fs.createReadStream(file));
        
        // upload file to validator
        return fetch(this.url, {
            method: 'POST',
            body: data
        })
        .then(response => response.text())
        .then(htmlResponse => new JSDOM(htmlResponse))
        .then(dom => dom.window.document);
    }

    /**
     * Get all files from directory which should be validated.
     * @param dir
     */
    getFilesToValidate(dir) {
        return fs.readdirSync(dir)
            .map(name => path.join(dir, name))
            .filter(p => path.parse(p).ext === this.ext);
    }

    /**
     * Logs stats of the validation from all files.
     * @param data 
     */
    logTotalStats(data) {
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
    }

    /**
     * Logs all items in a list with specific color.
     * @param list
     * @param prefix
     * @param prefixColor
     */
    logList(list, prefix, prefixColor) {
        list.forEach(item => {
            const text = chalk.gray(item);
            console.log(prefixColor(prefix + ': ') + text);
        });
    }

    /**
     * Logs the results of file validation.
     * @param file 
     * @param success 
     * @param errors 
     * @param warnings 
     */
    logResult(file, success, errors, warnings) {
        // Validation successfull but warnings occured
        if (success && warnings.length > 0) {
            console.log(`\r\nThe validation for file ${file} ${chalk.green('succeded')} with ${chalk.yellow('warnings')}.`);
            this.logList(warnings, 'Warning', chalk.yellow);
            return;
        }
    
        // Validation successfull
        if (success && warnings.length === 0) {
            console.log(`\r\nThe validation for file ${file} ${chalk.green('succeded')}.`);
            return;
        }
    
        // Validation failed and errors occured    
        if (!success && errors.length > 0) {
            console.log(`\r\nThe validation for file ${file} ${chalk.red('failed')}.`);
            this.logList(warnings, 'Warning', chalk.yellow);
            this.logList(errors, 'Error', chalk.red);
            return;
        }
    }
}