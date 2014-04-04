## List of `contenteditable` Browser Inconsistencies
Playground: http://jsbin.com/iwEWUXo/2/edit?js,console,output

### `document.execCommand` commands
* Firefox: When the `contenteditable` element is a custom element, an error is
  thrown when trying to apply one of the following commands.
  As per: http://jsbin.com/etepiPOn/1/edit?html,css,js,console,output
* Chrome has some magic to re-focus the `contenteditable` when a command is
  executed and the selection is not collapsed: http://jsbin.com/papi/1/edit?html,js,output
* "`insertBrOnReturn`": http://jsbin.com/IQUraXA/1/edit?html,js,output
* "`insertHTML`":
  - http://jsbin.com/elicInov/2/edit?html,js,output
  - Chrome tries to be clever by applying inline styles/SPANs with `line-height`: http://jsbin.com/ilEmudi/4/edit?css,js,output
  - Chrome applies styling to invalid markup, Firefox allows invalid markup: http://jsbin.com/ObiBoweG/1/edit?js,console,output
  - Given an empty P element, Chrome will wrap inserted text nodes not in a P,
    whereas Firefox will not: http://jsbin.com/olEbecEM/1/edit?js,output
  - Given a non-empty P element, Chrome will merge the existing and new
    paragraph, whereas Firefox will not: http://jsbin.com/uvEdacoz/6/edit?js,output
    - TODO http://jsbin.com/uvEdacoz/4/edit
* "`formatBlock`": http://jsbin.com/UTUDaPoC/1/edit?html,js,output
* "`bold`": http://jsbin.com/IxiSeYO/4/edit?html,js,output
* "`outdent`":
  - Chrome removes BLOCKQUOTE content formatting: http://jsbin.com/okAYaHa/1/edit?html,js,output
  - Chrome removes collapsed selection formatting: http://jsbin.com/IfaRaFO/1/edit?html,js,output
* "`insertOrderedList`"/"`insertOrderedList`":
  - Chrome nests list inside of block elements: http://jsbin.com/eFiRedUc/1/edit?html,js,output
  - Chrome removes SPAN: http://jsbin.com/abOLUNU/1/edit?html,js,output
  - Chrome tries to be clever by applying inline styles/SPANs with `line-height`: http://jsbin.com/OtemujAY/10/edit?html,css,js,output
* "`indent`":
  - Chrome nests BLOCKQUOTE inside of P: http://jsbin.com/oDOriyU/3/edit?html,js,output
  - Chrome nests ULs inside of ULs:
    - http://jsbin.com/ORikUPa/3/edit?html,js,output
    - http://jsbin.com/kuvi/1/edit?js,output
  - Chrome adds redundant `style` attribute: http://jsbin.com/AkasOzu/1/edit?html,js,output
  - Chrome converts BRs to Ps: http://jsbin.com/zeti/2/edit?js,output
  - Firefox does not perform transformation upon Ps containing BRs: http://jsbin.com/yiyaq/1/edit?js,output

### `Range.insertNode`
* Chrome inserts a bogus text node: http://jsbin.com/ODapifEb/1/edit?js,console,output
  - This in turn creates several bugs when perfoming commands on selections
    that contain an empty text node (`removeFormat`, `unlink`)

### `Document.queryCommandState`
* Browser magic: Chrome and Firefox report command state to be true after
  applying a command to a collapsed selection, but why?: http://jsbin.com/eDOxacI/1/edit?js,console,output
* `superscript`: Firefox: Returns false when a whole `SUP` is selected: http://jsbin.com/marox/1/edit?js,console,output
* `subscript`: Firefox: Returns false when a whole `SUB` is selected: http://jsbin.com/marox/1/edit?js,console,output
  - True for all inline elements?

### `Element.focus`
* Firefox: Giving focus to a `contenteditable` will place the caret outside of
  any block elements. Chrome behaves correctly by placing the caret at the
  earliest point possible inside the first block element: http://jsbin.com/eLoFOku/1/edit?js,console,output

### Events
* Chrome tries to be clever by applying inline styles/SPANs with `line-height`
  on \<backspace> or \<delete> keyboard events: http://jsbin.com/isIdoKA/3/edit?html,css,js,output
* Firefox breaks out of P mode on \<backspace> or \<delete> keyboard events
  when HTML has indentation between block elements: http://jsbin.com/EyuKase/1/edit?js,output

## Other
* Chrome (<= 28(?)): `TreeWalker` does not work properly with
  `DocumentFragment`s: http://stackoverflow.com/questions/21803827/chrome-28-treewalker-not-working-with-documentfragments

### `Range.commonAncestorContainer`
* Firefox: Returns `P` when a whole `SUP` is selected: http://jsbin.com/xoqul/1/edit?js,console,output
