var chai = require('chai');
var expect = chai.expect;

var helpers = require('scribe-test-harness/helpers');
helpers.registerChai(chai);
var when = helpers.when;
var given = helpers.given;
var givenContentOf = helpers.givenContentOf;
var whenInsertingHTMLOf = helpers.whenInsertingHTMLOf;
var initializeScribe = helpers.initializeScribe.bind(null, '../../src/scribe');

// Get new referenceS each time a new instance is created
var driver;
before(function () {
  driver = helpers.driver;
});

var scribeNode;
beforeEach(function () {
  scribeNode = helpers.scribeNode;
});

// TODO: These should be unit tests of the formatter functions, not
// integration tests.
describe('formatters', function () {
  beforeEach(function () {
    return initializeScribe();
  });

  describe('plain text', function () {
    // TODO: Abstract plugin tests
    describe('escape HTML characters', function () {
      givenContentOf('', function () {
        when('content of "&" is inserted', function () {
          beforeEach(function () {
            // Focus it before-hand
            scribeNode.click();

            return driver.executeScript(function () {
              window.scribe.insertPlainText('&');
            });
          });

          it.skip('should convert the "&" character to the corresponding HTML entity', function () {
            return scribeNode.getInnerHTML().then(function (innerHTML) {
              expect(innerHTML).to.have.html('<p>&amp;</p>');
            });
          });
        });
      });

      givenContentOf('', function () {
        when('content of "<" is inserted', function () {
          beforeEach(function () {
            // Focus it before-hand
            scribeNode.click();

            return driver.executeScript(function () {
              window.scribe.insertPlainText('<');
            });
          });

          it('should convert the "<" character to the corresponding HTML entity', function () {
            return scribeNode.getInnerHTML().then(function (innerHTML) {
              expect(innerHTML).to.have.html('<p>&lt;</p>');
            });
          });
        });
      });

      givenContentOf('', function () {
        when('content of ">" is inserted', function () {
          beforeEach(function () {
            // Focus it before-hand
            scribeNode.click();

            return driver.executeScript(function () {
              window.scribe.insertPlainText('>');
            });
          });

          it('should convert the ">" character to the corresponding HTML entity', function () {
            return scribeNode.getInnerHTML().then(function (innerHTML) {
              expect(innerHTML).to.have.html('<p>&gt;</p>');
            });
          });
        });
      });

      when('content of "\\"" is inserted', function () {
        beforeEach(function () {
          // Focus it before-hand
          scribeNode.click();

          return driver.executeScript(function () {
            window.scribe.insertPlainText('"');
          });
        });

        /**
         * FIXME: Fails because `element.insertHTML = '<p>&quot;</p>'` unescapes
         * the HTML entity (for double and single quotes). This can be fixed by
         * replacing these tests with unit tests.
         */
        it.skip('should convert the "\\"" character to the corresponding HTML entity', function () {
          return scribeNode.getInnerHTML().then(function (innerHTML) {
            expect(innerHTML).to.have.html('<p>&quot;</p>');
          });
        });
      });

      when('content of "\'" is inserted', function () {
        beforeEach(function () {
          // Focus it before-hand
          scribeNode.click();

          return driver.executeScript(function () {
            window.scribe.insertPlainText('\'');
          });
        });

        /**
         * FIXME: Fails because `element.insertHTML = '<p>&#39;</p>'` unescapes
         * the HTML entity (for double and single quotes). This can be fixed by
         * replacing these tests with unit tests.
         */
        it.skip('should convert the "\'" character to the corresponding HTML entity', function () {
          return scribeNode.getInnerHTML().then(function (innerHTML) {
            expect(innerHTML).to.have.html('<p>&#39;</p>');
          });
        });
      });

      givenContentOf('', function () {
        when('content of "<p>1</p>" is inserted', function () {
          beforeEach(function () {
            // Focus it before-hand
            scribeNode.click();

            return driver.executeScript(function () {
              window.scribe.insertPlainText('<p>1</p>');
            });
          });

          /**
           * FIXME: "&", "<" and ">" are escaped natively when you set
           * `Element.innerHTML`. Thus, those tests would pass with or without
           * the formatter. This test brings everything together to make sure
           * it really works.
           *
           * This could be fixed by having unit tests.
           */
          it('should convert HTML characters to their corresponding HTML entities', function () {
            return scribeNode.getInnerHTML().then(function (innerHTML) {
              expect(innerHTML).to.have.html('<p>&lt;p&gt;1&lt;/p&gt;</p>');
            });
          });
        });
      });
    });

    describe('convert new lines to HTML', function () {
      beforeEach(function () {
        return driver.executeAsyncScript(function (done) {
          require(['../../bower_components/scribe-plugin-formatter-plain-text-convert-new-lines-to-html/src/scribe-plugin-formatter-plain-text-convert-new-lines-to-html'], function (convertNewLinesToHtmlFormatter) {
            window.scribe.use(convertNewLinesToHtmlFormatter());
            done();
          });
        });
      });

      when('content of "1\\n2" is inserted', function () {
        beforeEach(function () {
          // Focus it before-hand
          scribeNode.click();

          return driver.executeScript(function () {
            window.scribe.insertPlainText('1\n2');
          });
        });

        it('should replace the new line character with a BR element', function () {
          return scribeNode.getInnerHTML().then(function (innerHTML) {
            expect(innerHTML).to.have.html('<p>1<br>2</p>');
          });
        });
      });

      when('content of "1\\n\\n2" is inserted', function () {
        beforeEach(function () {
          // Focus it before-hand
          scribeNode.click();

          return driver.executeScript(function () {
            window.scribe.insertPlainText('1\n\n2');
          });
        });

        it('should replace the new line characters with a closing P tag and an opening P tag', function () {
          return scribeNode.getInnerHTML().then(function (innerHTML) {
            expect(innerHTML).to.have.html('<p>1</p><p>2</p>');
          });
        });
      });
    });
  });

  describe('HTML', function () {
    describe('non-breaking space characters', function () {
      givenContentOf('', function () {
        it('should keep the non-breaking space character when typing', function () {
          scribeNode.sendKeys('1\xa02');
          return scribeNode.getInnerHTML().then(function(innerHtml) {
            // Convert the &nbsp; code back into a space because .to.have.html() does it.
            innerHtml = innerHtml.replace(/&nbsp;/g, ' ');
            expect(innerHtml).to.have.html('<p>1 2<firefox-bogus-br></p>');
          });
        });

        it('should keep multiple space characters of different types when typing', function () {
          scribeNode.sendKeys('1 \xa0\x20\xa0 2');
          return scribeNode.getInnerHTML().then(function(innerHtml) {
            // Convert the &nbsp; code back into a space because .to.have.html() does it.
            innerHtml = innerHtml.replace(/&nbsp;/g, ' ');
            expect(innerHtml).to.have.html('<p>1     2<firefox-bogus-br></p>');
          });
        });
      });

      givenContentOf('<p>1 &nbsp; &nbsp; 2</p>', function () {
        it('should replace the non-breaking space characters with a normal space on export', function () {
          return scribeNode.getContent().then(function (content) {
            expect(content).to.have.html('<p>1 2</p>');
          });
        });
      });
    });

    describe('setting the content', function() {
      // Integration tests to ensure the formatters do not incorrectly alter
      // the content when set.
      givenContentOf('<h1>1</h1>', function () {
        it('should not modify the HTML', function () {
          return scribeNode.getInnerHTML().then(function (innerHTML) {
            expect(innerHTML).to.have.html('<h1>1</h1>');
          });
        });
      });

      when('the sanitizer plugin is enabled', function () {
        beforeEach(function () {
          return driver.executeAsyncScript(function (done) {
            require(['../../bower_components/scribe-plugin-sanitizer/src/scribe-plugin-sanitizer'], function (scribePluginSanitizer) {
              window.scribe.use(scribePluginSanitizer({ tags: { p: {} } }));
              done();
            });
          });
        });

        // Integration tests to ensure the formatters apply the correct
        // transformation when the content is set.
        givenContentOf('<h1>1</h1>', function () {
          it('should not modify the HTML', function () {
            return scribeNode.getInnerHTML().then(function (innerHTML) {
              expect(innerHTML).to.have.html('<p>1</p>');
            });
          });
        });

        // Integration tests to ensure the formatters apply the correct
        // transformation when the content is set.
        // TODO: This should be a unit test against the `enforcePElements`
        // formatter.
        // TODO: Allow `enforcePElements` formatter to have configurable
        // definition of block elements.
        givenContentOf('<foo></foo><h1>1</h1>', function () {
          it('should not modify the HTML', function () {
            return scribeNode.getInnerHTML().then(function (innerHTML) {
              expect(innerHTML).to.have.html('<p>1</p>');
            });
          });
        });
      });
    });

    // This isn’t a unit test for the sanitizer plugin, but rather an
    // integration test to check the formatter phases happen in the correct
    // order.
    describe('normalization phase', function () {
      beforeEach(function () {
        return driver.executeAsyncScript(function (done) {
          require(['../../bower_components/scribe-plugin-sanitizer/src/scribe-plugin-sanitizer'], function (scribePluginSanitizer) {
            window.scribe.use(scribePluginSanitizer({
              tags: {
                p: {}
              }
            }));
            done();
          });
        });
      });

      when('content of "<foo><h1>1</h1>" is set', function () {
        beforeEach(function () {
          return driver.executeScript(function () {
            window.scribe.setContent('<foo><h1>1</h1>');
          });
        });

        it('should strip non-whitelisted elements and then wrap any text nodes in a P element', function () {
          return scribeNode.getInnerHTML().then(function (innerHTML) {
            expect(innerHTML).to.have.html('<p>1</p>');
          });
        });
      });
    });

    describe('trim whitespace', function () {
      beforeEach(function () {
        return driver.executeAsyncScript(function (done) {
          require(['../../bower_components/scribe-plugin-sanitizer/src/scribe-plugin-sanitizer'], function (scribePluginSanitizer) {
            window.scribe.use(scribePluginSanitizer({
              tags: {
                p: {}
              }
            }));
            done();
          });
        });
      });

      whenInsertingHTMLOf('<p>1</p>\n<p>2</p>', function () {
        it.skip('should strip the whitespace in-between the P elements and remove the HTML comment', function () {
          // Chrome and Firefox: '<p>1</p><p>\n</p><p>2</p>'
          return scribeNode.getInnerHTML().then(function (innerHTML) {
            expect(innerHTML).to.have.html('<p>1</p> <p>2</p>');
          });
        });
      });
    });


    /**
     * Tags in form <p><b></p> etc. should
     * be removed
     **/
    describe('remove invalid B tags wrapping block elements', function () {

      beforeEach(function () {
        return driver.executeAsyncScript(function (done) {
          /**
           * The file below contains the formatter which corrects invalid HTML,
           * ideally it should live in core and we wouldn't need to require it
           **/
          require(['../../bower_components/scribe-plugin-sanitizer/src/scribe-plugin-sanitizer'], function (scribePluginSanitizer) {
            window.scribe.use(scribePluginSanitizer({
              tags: { p: {}, b: {}  }}));
            done();
          });
        });
      });

      whenInsertingHTMLOf('<b><p>1</p></b>', function() {
        it("should delete the wrapping B", function() {
          return scribeNode.getInnerHTML().then(function (innerHTML) {
            expect(innerHTML).to.have.html('<p>1</p>');
          });
        });
      });

      whenInsertingHTMLOf('<b><p>1</p>2</b>', function () {
        it('should delete invalid B and wrap second text node in a P', function () {
          return scribeNode.getInnerHTML().then(function (innerHTML) {
            expect(innerHTML).to.have.html('<p>1</p><p>2</p>');
          });
        });
      });
    });

    describe('ensure selectable container', function() {
      givenContentOf('<p></p>', function () {
        it('should insert a BR inside the P', function() {
          return scribeNode.getInnerHTML().then(function (innerHTML) {
            expect(innerHTML).to.have.html('<p><br></p>');
          });
        })
      });

      givenContentOf('<p><b></b></p>', function() {
        it('should insert a BR inside the B', function() {
          return scribeNode.getInnerHTML().then(function (innerHTML) {
            expect(innerHTML).to.have.html('<p><b><br></b></p>');
          });
        })
      });

      givenContentOf('<p><b><i></i></b></p>', function() {
        it('should insert a BR inside the I', function() {
          return scribeNode.getInnerHTML().then(function (innerHTML) {
            expect(innerHTML).to.have.html('<p><b><i><br></i></b></p>');
          });
        })
      });

      givenContentOf('<p><b><i><strike></strike></i></b></p>', function() {
        it('should insert a BR inside the STRIKE', function() {
          return scribeNode.getInnerHTML().then(function (innerHTML) {
            expect(innerHTML).to.have.html('<p><b><i><strike><br></strike></i></b></p>');
          });
        })
      });

      givenContentOf('<p><i><strike></strike></i><b></b></p>', function () {
        it('should insert a BR into all empty nodes', function() {
          return scribeNode.getInnerHTML().then(function (innerHTML) {
            expect(innerHTML).to.have.html('<p><i><strike><br></strike></i><b><br></b></p>');
          });
        })
      });

      givenContentOf('<div></div><p></p>', function () {
        it('should insert a BR into both nodes', function() {
          return scribeNode.getInnerHTML().then(function (innerHTML) {
            expect(innerHTML).to.have.html('<div><br></div><p><br></p>');
          });
        })
      });

      givenContentOf('<p><img></p>', function () {
        it('should not insert a BR into the IMG', function() {
          return scribeNode.getInnerHTML().then(function (innerHTML) {
            expect(innerHTML).to.have.html('<p><img></p>');
          });
        })
      });

      givenContentOf('<p><br></p>', function () {
        it('should not insert a BR into the IMG', function() {
          return scribeNode.getInnerHTML().then(function (innerHTML) {
            expect(innerHTML).to.have.html('<p><br></p>');
          });
        })
      });

      givenContentOf('<p> </p>', function () {
        it('should insert a BR into the node with only spaces', function() {
          return scribeNode.getInnerHTML().then(function (innerHTML) {
            expect(innerHTML).to.have.html('<p> <br></p>');
          });
        })
      });

      givenContentOf('<p>\n</p>', function () {
        it('should insert a BR into the node with only a hidden character', function() {
          return scribeNode.getInnerHTML().then(function (innerHTML) {
            expect(innerHTML).to.have.html('<p>\n<br></p>');
          });
        })
      });

      givenContentOf('<p> \n \n \n </p>', function () {
        it('should insert a BR into the node with only hidden characters', function() {
          return scribeNode.getInnerHTML().then(function (innerHTML) {
            expect(innerHTML).to.have.html('<p> \n \n \n <br></p>');
          });
        })
      });
    });
  });
});
