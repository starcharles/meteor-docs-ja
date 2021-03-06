/*
  Copyright (C) 2015, Daishi Kato <daishi@axlight.com>
  All rights reserved.

  Redistribution and use in source and binary forms, with or without
  modification, are permitted provided that the following conditions are met:

    * Redistributions of source code must retain the above copyright
      notice, this list of conditions and the following disclaimer.
    * Redistributions in binary form must reproduce the above copyright
      notice, this list of conditions and the following disclaimer in the
      documentation and/or other materials provided with the distribution.

  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
  "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
  LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
  A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
  HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
  SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
  LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
  DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
  THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
  (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
  OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

/* jshint undef: true, unused: true, latedef: true */
/* jshint quotmark: single, eqeqeq: true */
/* jshint node: true */

var fs = require('fs');
var path = require('path');
var Nightmare = require('nightmare');
var cheerio = require('cheerio');

function processResult(type, result) {
  var $ = cheerio.load(result);
  var version = /\d\.(?:\d\.){1,2}\d/.exec($('h1').text());
  $('link').each(function() {
    $(this).attr('href', 'http://docs.meteor.com' + $(this).attr('href'));
  });
  $('img[src="/logo.png"]').attr('src', 'http://docs.meteor.com/logo.png');
  $('h2, h3, h4').each(function() {
    var oldId = $(this).attr('id');
    if (oldId) {
      $(this).attr('id', '/' + type + '/' + oldId);
    }
  });
  $('script').remove();
  $('.hidden').remove();
  $('.basic-or-full option[value!="' + type + '"]').remove();
  fs.writeFileSync(path.join('sources', type + '-' + version + '.html'), $.html(), 'utf8');
}

function processBasicResult(result) {
  processResult('basic', result);
}

function processFullResult(result) {
  processResult('full', result);
}

Nightmare()
  .goto('http://docs.meteor.com/')
  .wait(1000)
  .evaluate(function() {
    return document.documentElement.outerHTML; //jshint ignore:line
  }, processBasicResult)
  .select('.basic-or-full', 'full')
  .evaluate(function() {
    return document.documentElement.outerHTML; //jshint ignore:line
  }, processFullResult)
  .run();
