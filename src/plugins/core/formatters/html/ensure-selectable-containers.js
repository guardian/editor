define(function () {

  /**
   * Chrome and Firefox: All elements need to contain either text or a `<br>` to
   * remain selectable. (Unless they have a width and height explicitly set with
   * CSS(?), as per: http://jsbin.com/gulob/2/edit?html,css,js,output)
   */

  'use strict';

  return function () {
    return function (scribe) {
      var nodeHelpers = scribe.node;

      // http://www.w3.org/TR/html-markup/syntax.html#syntax-elements
      var html5VoidElements = ['AREA', 'BASE', 'BR', 'COL', 'COMMAND', 'EMBED', 'HR', 'IMG', 'INPUT', 'KEYGEN', 'LINK', 'META', 'PARAM', 'SOURCE', 'TRACK', 'WBR'];

      function parentHasNoTextContent(node) {
        if (nodeHelpers.isSelectionMarkerElement(node)) {
          return true;
        } else {
          return node.parentNode.textContent.trim() === '';
        }
      }


      function traverse(parentNode) {
        // Instead of TreeWalker, which gets confused when the BR is added to the dom,
        // we recursively traverse the tree to look for an empty node that can have childNodes

        var node = parentNode.firstElementChild;

        function isEmpty(node) {
          if ((node.children.length === 0 && nodeHelpers.isBlockElement(node))
            || (node.children.length === 1 && nodeHelpers.isSelectionMarkerElement(node.children[0]))) {
             return true;
          }

          // Do not insert BR in empty non block elements with parent containing text
          if (!nodeHelpers.isBlockElement(node)) {
            return parentHasNoTextContent(node);
          }

          return false;
        }

        while (node) {
          if (!nodeHelpers.isSelectionMarkerElement(node)) {
            // Find any node that contains no child *elements*, or just contains
            // whitespace, and is not self-closing
            if (isEmpty(node) &&
              node.textContent.trim() === '' &&
              html5VoidElements.indexOf(node.nodeName) === -1) {
              node.appendChild(document.createElement('br'));
            } else if (node.children.length > 0) {
              traverse(node);
            }
          }
          node = node.nextElementSibling;
        }
      }

      scribe.registerHTMLFormatter('normalize', function (html) {
        var bin = document.createElement('div');
        bin.innerHTML = html;
        traverse(bin);
        return bin.innerHTML;
      });

    };
  };

});
