const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const Validator = require('./Validator');

module.exports = class extends Validator {
    constructor(...validators) {
        super();
        this.validators = validators;
    }

    validate(dirOrFile) {
        const exists = fs.existsSync(dirOrFile);

        // if input doesn't exist stop program
        if (!exists) {
            console.log(chalk.red(`\r\nFile or directory "${dirOrFile}" does not exist.`));
            return;
        }

        const stat = fs.lstatSync(dirOrFile);
        if (stat.isFile()) {
            // find correct validator for file or stop program
            const validator = this.validators.find(validator => path.parse(dirOrFile).ext === validator.ext);
            if (!validator) return console.log(chalk.red(`Error: No validator found to validate file "${dirOrFile}".`));

            // validate file
            validator.validate(dirOrFile);
        } else {
            Promise.all(this.validators.map(validator => {
                // every validator gets his files to validate
                const files = validator.getFilesToValidate(dirOrFile);

                // validator fetches und parses files and returns data
                return Promise.all(files.map(file => validator.fetchDOM(file).then(doc => validator.parseDocument(doc, file))));
            }))
                // data from all validators gets logged
                .then(data => [].concat(...data))
                .then(data => this.logTotalStats(data));
        }
    }
}