#!/usr/bin/env node

// create validator
const HtmlValidator = require('../src/HtmlValidator');
const CssValidator = require('../src/CssValidator');
const htmlval = new HtmlValidator('https://validator.w3.org/nu/#file');
const cssval = new CssValidator('https://jigsaw.w3.org/css-validator/validator');

// read input
const dirOrFile = process.argv[2] || './';

// validate
htmlval.validate(dirOrFile);
cssval.validate(dirOrFile);