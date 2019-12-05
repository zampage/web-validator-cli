# Web Validator CLI

Validate web pages (currently .html and .css files) on command line.

The official Validators of W3C are used for this process.

## Usage

```sh
# validate single file
wvc file.css

# validate single file in directory
wvc example/file.html

# validate all files in directory
wvc example
```

## Currently supported Types

- HTML: https://validator.w3.org
- CSS: https://jigsaw.w3.org/css-validator/validator

## Extension

This github repo may be forked and extended using your own Validator. Simply extend the original Validator and add your own validation.

```js
const Validator = require('./validator');

module.exports = class CssValidator extends Validator {
    constructor(url) {
        super(url); // url from which to fetch validation results
        this.ext = '.your-file-extension';
        this.formFieldName = 'name-of-file-field-in-your-form';
    }

    parseDocument(doc, file) {
        // get data from response
        const success = /* ... */;
        const errors = /* ... */;
        const warnings = /* ... */;
        
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
```