const Validator = require('./Validator');

module.exports = class HtmlValidator extends Validator {
    constructor(url) {
        super(url);
        this.ext = '.html';
    }

    parseDocument(doc, file) {
        // get data from response
        const results = doc.querySelector('#results');
        const success = !!results.querySelector('.success');
        let errors = results.querySelectorAll('.error');
        let warnings = results.querySelectorAll('.warning');

        if (errors) errors = [...errors].map(err => err.querySelector('span').textContent);
        if (warnings) warnings = [...warnings].map(warn => warn.querySelector('span').textContent);
        
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
}