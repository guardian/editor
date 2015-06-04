define([
  '../element',
  '../node'
],
function (elementHelper, nodeHelper) {

  'use strict';

  return function (scribe) {
    /**
     * Wrapper for object holding currently selected text.
     */
    function Selection() {
      var rootDoc = scribe.el.ownerDocument;

      // find the parent document or document fragment
      if( rootDoc.compareDocumentPosition(scribe.el) & Node.DOCUMENT_POSITION_DISCONNECTED ) {
        var currentElement = nodeHelper.getAncestor(scribe.el, nodeHelper.isFragment);
        // if we found a document fragment and it has a getSelection method, set it to the root doc
        if (currentElement.getSelection) {
          rootDoc = currentElement;
        }
      }

      this.selection = rootDoc.getSelection();
      if (this.selection.rangeCount && this.selection.anchorNode) {
        // create the range to avoid chrome bug from getRangeAt / window.getSelection()
        // https://code.google.com/p/chromium/issues/detail?id=380690
        this.range = document.createRange();

        if( nodeHelper.isBefore(this.selection.anchorNode, this.selection.focusNode) ) {
          this.range.setStart(this.selection.anchorNode, this.selection.anchorOffset);
          this.range.setEnd(this.selection.focusNode, this.selection.focusOffset);
        } else {
          this.range.setStart(this.selection.focusNode, this.selection.focusOffset);
          this.range.setEnd(this.selection.anchorNode, this.selection.anchorOffset);
        }
      }
    }

    /**
     * @returns Closest ancestor Node satisfying nodeFilter. Undefined if none exist before reaching Scribe container.
     */
    Selection.prototype.getContaining = function (nodeFilter) {
      if (!this.range) { return; }

      var ancestor = this.range.commonAncestorContainer;
      if (scribe.el === ancestor || !nodeFilter(ancestor)) {
        ancestor = nodeHelper.getAncestor(ancestor, nodeFilter);
      }

      return ancestor;
    }

    Selection.prototype.placeMarkers = function () {
      var range = this.range;
      if (!range) { return; }

      //we need to ensure that the scribe's element lives within the current document
      //to avoid errors with the range comparison (see below)
      if (!document.contains(scribe.el)) {
        return;
      }

      //we want to ensure that the current selection is within the current scribe node
      //if this isn't true scribe will place markers within the selections parent
      //we want to ensure that scribe ONLY places markers within it's own element
      if (nodeHelper.isBefore(scribe.el, range.startContainer) &&
        scribe.el.contains(range.endContainer)) {

        var startMarker = document.createElement('em');
        startMarker.classList.add('scribe-marker');
        var endMarker = document.createElement('em');
        endMarker.classList.add('scribe-marker');

        // End marker
        var rangeEnd = range.cloneRange();
        rangeEnd.collapse(false);
        rangeEnd.insertNode(endMarker);

        /**
         * Chrome and Firefox: `Range.insertNode` inserts a bogus text node after
         * the inserted element. We just remove it. This in turn creates several
         * bugs when perfoming commands on selections that contain an empty text
         * node (`removeFormat`, `unlink`).
         * As per: http://jsbin.com/hajim/5/edit?js,console,output
         */
        // TODO: abstract into polyfill for `Range.insertNode`
        if (endMarker.nextSibling && nodeHelper.isEmptyTextNode(endMarker.nextSibling)) {
          nodeHelper.removeNode(endMarker.nextSibling);
        }

        /**
         * Chrome and Firefox: `Range.insertNode` inserts a bogus text node before
         * the inserted element when the child element is at the start of a block
         * element. We just remove it.
         * FIXME: Document why we need to remove this
         * As per: http://jsbin.com/sifez/1/edit?js,console,output
         */
        if (endMarker.previousSibling && nodeHelper.isEmptyTextNode(endMarker.previousSibling)) {
          nodeHelper.removeNode(endMarker.previousSibling);
        }


        /**
         * This is meant to test Chrome inserting erroneous text blocks into
         * the scribe el when focus switches from a scribe.el to a button to
         * the scribe.el. However, this is impossible to simlulate correctly
         * in a test.
         *
         * This behaviour does not happen in Firefox.
         *
         * See http://jsbin.com/quhin/2/edit?js,output,console
         *
         * To reproduce the bug, follow the following steps:
         *    1. Select text and create H2
         *    2. Move cursor to front of text.
         *    3. Remove the H2 by clicking the button
         *    4. Observe that you are left with an empty H2
         *        after the element.
         *
         * The problem is caused by the Range being different, depending on
         * the position of the marker.
         *
         * Consider the following two scenarios.
         *
         * A)
         *   1. scribe.el contains: ["1", <em>scribe-marker</em>]
         *   2. Click button and click the right of to scribe.el
         *   3. scribe.el contains: ["1", <em>scribe-marker</em>. #text]
         *
         *   This is wrong but does not cause the problem.
         *
         * B)
         *   1. scribe.el contains: ["1", <em>scribe-marker</em>]
         *   2. Click button and click to left of scribe.el
         *   3. scribe.el contains: [#text, <em>scribe-marker</em>, "1"]
         *
         * The second example sets the range in the wrong place, meaning
         * that in the second case the formatBlock is executed on the wrong
         * element [the text node] leaving the empty H2 behind.
         **/

        // using range.collapsed vs selection.isCollapsed - https://code.google.com/p/chromium/issues/detail?id=447523
        if (! range.collapsed) {
          // Start marker
          var rangeStart = range.cloneRange();
          rangeStart.collapse(true);
          rangeStart.insertNode(startMarker);

          /**
           * Chrome and Firefox: `Range.insertNode` inserts a bogus text node after
           * the inserted element. We just remove it. This in turn creates several
           * bugs when perfoming commands on selections that contain an empty text
           * node (`removeFormat`, `unlink`).
           * As per: http://jsbin.com/hajim/5/edit?js,console,output
           */
          // TODO: abstract into polyfill for `Range.insertNode`
          if (startMarker.nextSibling && nodeHelper.isEmptyTextNode(startMarker.nextSibling)) {
            nodeHelper.removeNode(startMarker.nextSibling);
          }

          /**
           * Chrome and Firefox: `Range.insertNode` inserts a bogus text node
           * before the inserted element when the child element is at the start of
           * a block element. We just remove it.
           * FIXME: Document why we need to remove this
           * As per: http://jsbin.com/sifez/1/edit?js,console,output
           */
          if (startMarker.previousSibling && nodeHelper.isEmptyTextNode(startMarker.previousSibling)) {
            nodeHelper.removeNode(startMarker.previousSibling);
          }
        }


        this.selection.removeAllRanges();
        this.selection.addRange(range);
      }
    };

    Selection.prototype.getMarkers = function () {
      return scribe.el.querySelectorAll('em.scribe-marker');
    };

    Selection.prototype.removeMarkers = function () {
      Array.prototype.forEach.call(this.getMarkers(), function (marker) {
        nodeHelper.removeNode(marker);
      });
    };

    // This will select markers if there are any. You will need to focus the
    // Scribe instance’s element if it is not already for the selection to
    // become active.
    Selection.prototype.selectMarkers = function (keepMarkers) {
      var markers = this.getMarkers();
      if (!markers.length) {
        return;
      }

      var newRange = document.createRange();

      newRange.setStartBefore(markers[0]);
      // We always reset the end marker because otherwise it will just
      // use the current range’s end marker.
      newRange.setEndAfter(markers.length >= 2 ? markers[1] : markers[0])

      if (! keepMarkers) {
        this.removeMarkers();
      }

      this.selection.removeAllRanges();
      this.selection.addRange(newRange);
    };

    Selection.prototype.isCaretOnNewLine = function () {
      // return true if nested inline tags ultimately just contain <br> or ""
      function isEmptyInlineElement(node) {

        var treeWalker = document.createTreeWalker(node, NodeFilter.SHOW_ELEMENT, null, false);

        var currentNode = treeWalker.root;

        while(currentNode) {
          var numberOfChildren = currentNode.childNodes.length;

          // forks in the tree or text mean no new line
          if (numberOfChildren > 1 ||
              (numberOfChildren === 1 && currentNode.textContent.trim() !== ''))
            return false;

          if (numberOfChildren === 0) {
            return currentNode.textContent.trim() === '';
          }

          currentNode = treeWalker.nextNode();
        };
      };

      var containerPElement = this.getContaining(function (node) {
        return node.nodeName === 'P';
      });
      if (containerPElement) {
        return isEmptyInlineElement(containerPElement);
      } else {
        return false;
      }
    };

    return Selection;
  };

});
