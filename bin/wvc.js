#!/usr/bin/env node

// create validator
const HtmlValidator = require('../src/HtmlValidator');
const htmlval = new HtmlValidator('https://validator.w3.org/nu/#file');

// read input
const dirOrFile = process.argv[2] || './';

// validate
htmlval.validate(dirOrFile);
