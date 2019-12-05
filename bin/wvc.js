#!/usr/bin/env node

// create validator
const HtmlValidator = require('../src/HtmlValidator');
const CssValidator = require('../src/CssValidator');
const CombinatorValidator = require('../src/CombinatorValidator');
const htmlval = new HtmlValidator('https://validator.w3.org/nu/#file');
const cssval = new CssValidator('https://jigsaw.w3.org/css-validator/validator');
const combval = new CombinatorValidator(htmlval, cssval);

// read input
const dirOrFile = process.argv[2] || './';

// validate
combval.validate(dirOrFile);