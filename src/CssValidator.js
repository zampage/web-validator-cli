const Validator = require('./validator');

module.exports = class CssValidator extends Validator {
    constructor(url) {
        super(url);
        this.ext = '.css';
        this.formFieldName = 'file';
    }

    parseDocument(doc, file) {
        // get data from response
        const success = !!doc.querySelector('#congrats');
        let errors = doc.querySelectorAll('#errors .parse-error');
        let warnings = doc.querySelectorAll('#warnings .warning');

        if (errors) errors = [...errors].map(err => this.beautifyText(err.textContent));
        if (warnings) warnings = [...warnings].map(warn => this.beautifyText(warn.textContent));
        
        // log validation results
        this.logResult(file, success, errors, warnings);

        // return validation results data
        return {
            file,
            success: success,
            warnings: warnings.length,
            errors: errors.length,
        }
    }

    beautifyText(text) {
        return text
            .replace(/\r?\n|\r/g, ' ')
            .replace(/\s+/g,' ')
            .trim();
    }

    
}