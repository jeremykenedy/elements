import { DiagnosticSeverity } from '@stoplight/types';
import { parse as parse$1, safeStringify, parseWithPointers as parseWithPointers$1 } from '@stoplight/yaml';
import _get from 'lodash/get';
import pullAt from 'lodash/pullAt';
import _set from 'lodash/set';
import toPath from 'lodash/toPath';
import _unset from 'lodash/unset';
import remarkFrontmatter from 'remark-frontmatter';
import remarkGFM from 'remark-gfm';
import remarkParse from 'remark-parse';
import remarkSlug from 'remark-slug';
import unified from 'unified';
import { visit } from 'unist-util-visit';
import { __rest } from 'tslib';
import remarkStringify from 'remark-stringify';
import { toString } from 'mdast-util-to-string';
import { select } from 'unist-util-select';
import truncate from 'lodash/truncate';



var hast = /*#__PURE__*/Object.freeze({
  __proto__: null
});



var mdast = /*#__PURE__*/Object.freeze({
  __proto__: null
});

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}

function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  return Constructor;
}

function _unsupportedIterableToArray(o, minLen) {
  if (!o) return;
  if (typeof o === "string") return _arrayLikeToArray(o, minLen);
  var n = Object.prototype.toString.call(o).slice(8, -1);
  if (n === "Object" && o.constructor) n = o.constructor.name;
  if (n === "Map" || n === "Set") return Array.from(o);
  if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
}

function _arrayLikeToArray(arr, len) {
  if (len == null || len > arr.length) len = arr.length;

  for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];

  return arr2;
}

function _createForOfIteratorHelper(o, allowArrayLike) {
  var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"];

  if (!it) {
    if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") {
      if (it) o = it;
      var i = 0;

      var F = function () {};

      return {
        s: F,
        n: function () {
          if (i >= o.length) return {
            done: true
          };
          return {
            done: false,
            value: o[i++]
          };
        },
        e: function (e) {
          throw e;
        },
        f: F
      };
    }

    throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }

  var normalCompletion = true,
      didErr = false,
      err;
  return {
    s: function () {
      it = it.call(o);
    },
    n: function () {
      var step = it.next();
      normalCompletion = step.done;
      return step;
    },
    e: function (e) {
      didErr = true;
      err = e;
    },
    f: function () {
      try {
        if (!normalCompletion && it.return != null) it.return();
      } finally {
        if (didErr) throw err;
      }
    }
  };
}

// Example in the gfm plugin - https://github.com/remarkjs/remark-gfm/blob/main/index.js#L30-L32

function smdAnnotations() {
  return function transform(root) {
    var nodes = root.children;
    var processed = [];
    var inTab = false;
    var skipNext = false; // temporary variable for storing current tabContainer

    var tabPlaceholder = {
      type: 'tabs',
      data: {
        hName: 'tabs'
      },
      children: [{
        type: 'tab',
        data: {
          hName: 'tab'
        },
        children: []
      }]
    };

    for (var i in nodes) {
      if (!nodes[i]) continue;

      if (skipNext) {
        skipNext = false;
        continue;
      } // this node


      var node = nodes[i]; // next node

      var next = nodes[+i + 1] ? nodes[+i + 1] : null; // collect annotations, if this is an html node

      var anno = captureAnnotations(node);

      if ('type' in anno) {
        var type = anno.type;

        if (type === 'tab') {
          var _tabPlaceholder = tabPlaceholder,
              children = _tabPlaceholder.children;

          if (inTab && tabPlaceholder) {
            // already inside of a tab, so this is a new one
            children.push({
              type: 'tab',
              data: {
                hName: 'tab'
              },
              children: []
            });
          } else {
            // not inside a tab already
            inTab = true;
          } // set annotations if present


          if (Object.keys(anno).length > 0) {
            Object.assign(children[children.length - 1].data, {
              hProperties: anno
            });
          }

          tabPlaceholder.children = children;
          continue;
        } else if (type === 'tab-end') {
          // finalize tabContainer
          processed.push(tabPlaceholder); // reset tabPlaceholder

          inTab = false;
          tabPlaceholder = {
            type: 'tabs',
            data: {
              hName: 'tabs'
            },
            children: [{
              type: 'tab',
              data: {
                hName: 'tab'
              },
              children: []
            }]
          };
          continue;
        }
      }

      if (inTab) {
        // if we're in a tab, push this node as a child of the last tab
        var size = tabPlaceholder.children.length;

        if (tabPlaceholder.children[size - 1]) {
          tabPlaceholder.children[size - 1].children.push(processNode(node, anno));
        }
      } else if (Object.keys(anno).length > 0 && next) {
        // annotations apply to next node, process next node now and skip next iteration
        processed.push(processNode(next, anno));
        skipNext = true;
      } else {
        processed.push(processNode(node));
      }
    }

    return Object.assign(Object.assign({}, root), {
      children: processed
    });
  };
}

function captureAnnotations(node) {
  if (!node || !node.value) {
    return {};
  }

  if ( // @ts-expect-error
  node.type === 'mdxFlowExpression' && // @ts-expect-error
  node.value.startsWith('/*') && // @ts-expect-error
  node.value.endsWith('*/')) {
    // remove comments and whitespace
    // @ts-expect-error
    var raw = node.value // @ts-expect-error
    .substr('/*'.length, node.value.length - '*/'.length - '/*'.length).trim(); // load contents of annotation into yaml

    try {
      var contents = parse$1(raw);

      if (typeof contents === 'object') {
        for (var key in contents) {
          if (typeof contents[key] === 'string') {
            // babel will crap out if certain characters, like ", are not escaped
            var escapedContent = contents[key].replace('"', '%22');
            contents[key] = escapedContent;
          }
        } // annotations must be objects, otherwise it's just a regular ol html comment


        return contents;
      }
    } catch (error) {// ignore invalid YAML
    }
  } else if (node.type === 'html' && node.value.startsWith('<!--') && node.value.endsWith('-->')) {
    // remove comments and whitespace
    var _raw = node.value.substr('<!--'.length, node.value.length - '-->'.length - '<!--'.length).trim(); // load contents of annotation into yaml


    try {
      var _contents = parse$1(_raw);

      if (typeof _contents === 'object') {
        // annotations must be objects, otherwise it's just a regular ol html comment
        return _contents;
      }
    } catch (error) {// ignore invalid YAML
    }
  }

  return {};
}

function processNode(node, annotations) {
  if (annotations) {
    return Object.assign(Object.assign({}, node), {
      annotations: annotations
    });
  }

  return node;
}

function blockquoteMdast2Hast() {
  return function transform(root) {
    visit(root, 'blockquote', function (node) {
      var data = node.data || (node.data = {});
      var annotations = node.annotations || {};
      data.hProperties = annotations;
    });
  };
}

function inlineCodeMdast2Hast() {
  return function transform(root) {
    visit(root, 'inlineCode', function (node) {
      var data = node.data || (node.data = {}); // mark inline code blocks with a property so that we can distinguish during rendering later

      data.hProperties = {
        inline: 'true'
      };
    });
  };
}
var highlightLinesRangeRegex = /{([\d,-]+)}/;
var metaKeyValPairMatcher = /(\S+)\s*=\s*(\"?)([^"]*)(\2|\s|$)/g;

function parseMeta(metastring) {
  var props = {};
  if (!metastring) return props;
  var metaWithoutKeyValPairs = metastring;
  var keyValPair;

  while ((keyValPair = metaKeyValPairMatcher.exec(metastring)) !== null) {
    props[keyValPair[1]] = keyValPair[3];
    metaWithoutKeyValPairs = metaWithoutKeyValPairs.replace(keyValPair[0], '');
  }

  var booleanProps = metaWithoutKeyValPairs.split(' ');

  var _iterator = _createForOfIteratorHelper(booleanProps),
      _step;

  try {
    for (_iterator.s(); !(_step = _iterator.n()).done;) {
      var booleanProp = _step.value;
      var highlightLinesMatch = booleanProp.match(highlightLinesRangeRegex);

      if (highlightLinesMatch) {
        props.highlightLines = highlightLinesMatch[1];
      } else if (booleanProp) {
        props[booleanProp] = 'true';
      }
    }
  } catch (err) {
    _iterator.e(err);
  } finally {
    _iterator.f();
  }

  return props;
}

function addCodeGrouping(groupings, parent, lastIndex, children) {
  // if only one code block.. don't group
  if (children.length <= 1) return;
  var numCodeBlocks = children.length;
  var codeGroup = {
    type: 'codegroup',
    data: {
      hName: 'codegroup'
    },
    children: children
  };
  groupings.push({
    codeGroup: codeGroup,
    parent: parent,
    startIndex: lastIndex - (numCodeBlocks - 1),
    numCodeBlocks: numCodeBlocks
  });
}

function smdCode() {
  return function transform(root) {
    var sequentialCodeBlocks = [];
    var lastIndex = -1;
    var lastParent;
    var groupings = [];
    visit(root, 'code', function (node, index, parent) {
      var _a = parseMeta(node.meta),
          metaTitle = _a.title,
          metaProps = __rest(_a, ["title"]);
      /**
       * Annotation processing
       */


      var annotations = Object.assign({}, metaProps, node.annotations);
      var title = annotations.title || metaTitle;

      if (title) {
        annotations = Object.assign({
          // title first
          title: title
        }, annotations);
      }

      node.annotations = annotations;
      var data = node.data || (node.data = {});
      data.hProperties = Object.assign(Object.assign({
        lang: node.lang,
        meta: node.meta
      }, data.hProperties || {}), node.annotations);
      /**
       * Code groupings
       */
      // if it's a sequential code block with same parent, add it to the list to later group

      var lastCodeBlock = sequentialCodeBlocks[sequentialCodeBlocks.length - 1];

      if (!lastCodeBlock || lastIndex === index - 1 && lastParent === parent) {
        lastIndex = index; // @ts-expect-error

        lastParent = parent;
        sequentialCodeBlocks.push(node);
      } else {
        addCodeGrouping(groupings, lastParent, lastIndex, sequentialCodeBlocks);
        lastIndex = index; // @ts-expect-error

        lastParent = parent;
        sequentialCodeBlocks = [node];
      }
    }); // add any grouping that might be at end of document

    addCodeGrouping(groupings, lastParent, lastIndex, sequentialCodeBlocks); // splice the code groupings in!
    // keep track of how many we're splicing out in each parent, so that indexes don't get mis-aligned

    var removed = new Map();

    for (var _i = 0, _groupings = groupings; _i < _groupings.length; _i++) {
      var group = _groupings[_i];

      if (!removed.get(group.parent)) {
        removed.set(group.parent, 0);
      }

      var removeCount = removed.get(group.parent);
      group.parent.children.splice(group.startIndex - removeCount, group.numCodeBlocks, group.codeGroup);
      removed.set(group.parent, removeCount + group.numCodeBlocks - 1);
    }
  };
}

var remarkParsePreset = {
  plugins: [[remarkFrontmatter, ['yaml']], remarkGFM, remarkSlug, smdAnnotations, smdCode, inlineCodeMdast2Hast, blockquoteMdast2Hast],
  settings: {}
};
var defaultProcessor = unified().use(remarkParse).use(remarkParsePreset);
var parse = function parse(markdown) {
  var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var processor = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : defaultProcessor;
  var processorInstance = processor().data('settings', Object.assign({}, remarkParsePreset.settings, opts.settings)).use(opts.remarkPlugins || []); // return the parsed remark ast

  return processorInstance.runSync(processorInstance.parse(markdown));
};

var parseWithPointers = function parseWithPointers(markdown) {
  var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var tree = parse(markdown, opts);
  return {
    data: tree,
    diagnostics: [],
    ast: tree,
    lineMap: undefined
  };
};

/*!
 * repeat-string <https://github.com/jonschlinkert/repeat-string>
 *
 * Copyright (c) 2014-2015, Jon Schlinkert.
 * Licensed under the MIT License.
 */

/**
 * Results cache
 */

var res = '';
var cache;

/**
 * Expose `repeat`
 */

var repeatString = repeat;

/**
 * Repeat the given `string` the specified `number`
 * of times.
 *
 * **Example:**
 *
 * ```js
 * var repeat = require('repeat-string');
 * repeat('A', 5);
 * //=> AAAAA
 * ```
 *
 * @param {String} `string` The string to repeat
 * @param {Number} `number` The number of times to repeat the string
 * @return {String} Repeated string
 * @api public
 */

function repeat(str, num) {
  if (typeof str !== 'string') {
    throw new TypeError('expected a string');
  }

  // cover common, quick use cases
  if (num === 1) return str;
  if (num === 2) return str + str;

  var max = str.length * num;
  if (cache !== str || typeof cache === 'undefined') {
    cache = str;
    res = '';
  } else if (res.length >= max) {
    return res.substr(0, max);
  }

  while (max > res.length && num > 1) {
    if (num & 1) {
      res += str;
    }

    num >>= 1;
    str += str;
  }

  res += str;
  res = res.substr(0, max);
  return res;
}

var containerFlow = flow;



function flow(parent, context) {
  var children = parent.children || [];
  var results = [];
  var index = -1;
  var child;

  while (++index < children.length) {
    child = children[index];

    results.push(
      context.handle(child, parent, context, {before: '\n', after: '\n'})
    );

    if (index + 1 < children.length) {
      results.push(between(child, children[index + 1]));
    }
  }

  return results.join('')

  function between(left, right) {
    var index = -1;
    var result;

    while (++index < context.join.length) {
      result = context.join[index](left, right, parent, context);

      if (result === true || result === 1) {
        break
      }

      if (typeof result === 'number') {
        return repeatString('\n', 1 + Number(result))
      }

      if (result === false) {
        return '\n\n<!---->\n\n'
      }
    }

    return '\n\n'
  }
}

var indentLines_1 = indentLines;

var eol = /\r?\n|\r/g;

function indentLines(value, map) {
  var result = [];
  var start = 0;
  var line = 0;
  var match;

  while ((match = eol.exec(value))) {
    one(value.slice(start, match.index));
    result.push(match[0]);
    start = match.index + match[0].length;
    line++;
  }

  one(value.slice(start));

  return result.join('')

  function one(value) {
    result.push(map(value, line, !value));
  }
}

var blockquote_1 = blockquote;




function blockquote(node, _, context) {
  var exit = context.enter('blockquote');
  var value = indentLines_1(containerFlow(node, context), map);
  exit();
  return value
}

function map(line, index, blank) {
  return '>' + (blank ? '' : ' ') + line
}

var blockquoteHandler = function blockquoteHandler(node, _, context) {
  var _a;

  var annotations = ((_a = node.data) === null || _a === void 0 ? void 0 : _a.hProperties) || {};
  var value = blockquote_1(node, _, context);

  if (Object.keys(annotations).length) {
    return "<!-- ".concat(safeStringify(annotations).trim(), " -->\n\n").concat(value);
  } else {
    return value;
  }
};

var longestStreak_1 = longestStreak;

// Get the count of the longest repeating streak of `character` in `value`.
function longestStreak(value, character) {
  var count = 0;
  var maximum = 0;
  var expected;
  var index;

  if (typeof character !== 'string' || character.length !== 1) {
    throw new Error('Expected character')
  }

  value = String(value);
  index = value.indexOf(character);
  expected = index;

  while (index !== -1) {
    count++;

    if (index === expected) {
      if (count > maximum) {
        maximum = count;
      }
    } else {
      count = 1;
    }

    expected = index + 1;
    index = value.indexOf(character, expected);
  }

  return maximum
}

var formatCodeAsIndented_1 = formatCodeAsIndented;

function formatCodeAsIndented(node, context) {
  return (
    !context.options.fences &&
    node.value &&
    // If there’s no info…
    !node.lang &&
    // And there’s a non-whitespace character…
    /[^ \r\n]/.test(node.value) &&
    // And the value doesn’t start or end in a blank…
    !/^[\t ]*(?:[\r\n]|$)|(?:^|[\r\n])[\t ]*$/.test(node.value)
  )
}

var checkFence_1 = checkFence;

function checkFence(context) {
  var marker = context.options.fence || '`';

  if (marker !== '`' && marker !== '~') {
    throw new Error(
      'Cannot serialize code with `' +
        marker +
        '` for `options.fence`, expected `` ` `` or `~`'
    )
  }

  return marker
}

var patternCompile_1 = patternCompile;

function patternCompile(pattern) {
  var before;
  var after;

  if (!pattern._compiled) {
    before = pattern.before ? '(?:' + pattern.before + ')' : '';
    after = pattern.after ? '(?:' + pattern.after + ')' : '';

    if (pattern.atBreak) {
      before = '[\\r\\n][\\t ]*' + before;
    }

    pattern._compiled = new RegExp(
      (before ? '(' + before + ')' : '') +
        (/[|\\{}()[\]^$+*?.-]/.test(pattern.character) ? '\\' : '') +
        pattern.character +
        (after || ''),
      'g'
    );
  }

  return pattern._compiled
}

var patternInScope_1 = patternInScope;

function patternInScope(stack, pattern) {
  return (
    listInScope(stack, pattern.inConstruct, true) &&
    !listInScope(stack, pattern.notInConstruct)
  )
}

function listInScope(stack, list, none) {
  var index;

  if (!list) {
    return none
  }

  if (typeof list === 'string') {
    list = [list];
  }

  index = -1;

  while (++index < list.length) {
    if (stack.indexOf(list[index]) !== -1) {
      return true
    }
  }

  return false
}

var safe_1 = safe;




function safe(context, input, config) {
  var value = (config.before || '') + (input || '') + (config.after || '');
  var positions = [];
  var result = [];
  var infos = {};
  var index = -1;
  var before;
  var after;
  var position;
  var pattern;
  var expression;
  var match;
  var start;
  var end;

  while (++index < context.unsafe.length) {
    pattern = context.unsafe[index];

    if (!patternInScope_1(context.stack, pattern)) {
      continue
    }

    expression = patternCompile_1(pattern);

    while ((match = expression.exec(value))) {
      before = 'before' in pattern || pattern.atBreak;
      after = 'after' in pattern;

      position = match.index + (before ? match[1].length : 0);

      if (positions.indexOf(position) === -1) {
        positions.push(position);
        infos[position] = {before: before, after: after};
      } else {
        if (infos[position].before && !before) {
          infos[position].before = false;
        }

        if (infos[position].after && !after) {
          infos[position].after = false;
        }
      }
    }
  }

  positions.sort(numerical);

  start = config.before ? config.before.length : 0;
  end = value.length - (config.after ? config.after.length : 0);
  index = -1;

  while (++index < positions.length) {
    position = positions[index];

    if (
      // Character before or after matched:
      position < start ||
      position >= end
    ) {
      continue
    }

    // If this character is supposed to be escaped because it has a condition on
    // the next character, and the next character is definitly being escaped,
    // then skip this escape.
    if (
      position + 1 < end &&
      positions[index + 1] === position + 1 &&
      infos[position].after &&
      !infos[position + 1].before &&
      !infos[position + 1].after
    ) {
      continue
    }

    if (start !== position) {
      // If we have to use a character reference, an ampersand would be more
      // correct, but as backslashes only care about punctuation, either will
      // do the trick
      result.push(escapeBackslashes(value.slice(start, position), '\\'));
    }

    start = position;

    if (
      /[!-/:-@[-`{-~]/.test(value.charAt(position)) &&
      (!config.encode || config.encode.indexOf(value.charAt(position)) === -1)
    ) {
      // Character escape.
      result.push('\\');
    } else {
      // Character reference.
      result.push(
        '&#x' + value.charCodeAt(position).toString(16).toUpperCase() + ';'
      );
      start++;
    }
  }

  result.push(escapeBackslashes(value.slice(start, end), config.after));

  return result.join('')
}

function numerical(a, b) {
  return a - b
}

function escapeBackslashes(value, after) {
  var expression = /\\(?=[!-/:-@[-`{-~])/g;
  var positions = [];
  var results = [];
  var index = -1;
  var start = 0;
  var whole = value + after;
  var match;

  while ((match = expression.exec(whole))) {
    positions.push(match.index);
  }

  while (++index < positions.length) {
    if (start !== positions[index]) {
      results.push(value.slice(start, positions[index]));
    }

    results.push('\\');
    start = positions[index];
  }

  results.push(value.slice(start));

  return results.join('')
}

var code_1 = code;








function code(node, _, context) {
  var marker = checkFence_1(context);
  var raw = node.value || '';
  var suffix = marker === '`' ? 'GraveAccent' : 'Tilde';
  var value;
  var sequence;
  var exit;
  var subexit;

  if (formatCodeAsIndented_1(node, context)) {
    exit = context.enter('codeIndented');
    value = indentLines_1(raw, map$1);
  } else {
    sequence = repeatString(marker, Math.max(longestStreak_1(raw, marker) + 1, 3));
    exit = context.enter('codeFenced');
    value = sequence;

    if (node.lang) {
      subexit = context.enter('codeFencedLang' + suffix);
      value += safe_1(context, node.lang, {
        before: '`',
        after: ' ',
        encode: ['`']
      });
      subexit();
    }

    if (node.lang && node.meta) {
      subexit = context.enter('codeFencedMeta' + suffix);
      value +=
        ' ' +
        safe_1(context, node.meta, {
          before: ' ',
          after: '\n',
          encode: ['`']
        });
      subexit();
    }

    value += '\n';

    if (raw) {
      value += raw + '\n';
    }

    value += sequence;
  }

  exit();
  return value
}

function map$1(line, _, blank) {
  return (blank ? '' : '    ') + line
}

var codeHandler = function codeHandler(node, _, context) {
  var _a;

  var _b = ((_a = node.data) === null || _a === void 0 ? void 0 : _a.hProperties) || {},
      lang = _b.lang,
      _meta = _b.meta,
      annotations = __rest(_b, ["lang", "meta"]);

  var metaProps = [];

  if (Object.keys(annotations).length) {
    for (var key in annotations) {
      var annotationVal = annotations[key];

      if (typeof annotationVal === 'boolean' || annotationVal === 'true' || annotationVal === 'false') {
        if (annotationVal || annotationVal === 'true') {
          metaProps.push(key);
        } // don't add falsey val to meta string


        continue;
      } else if (key === 'type') {
        // this is the only old val we support
        if (annotationVal === 'json_schema') {
          // camelCase to be consistent with rest of annotation props
          metaProps.push('jsonSchema');
        }
      } else if (key === 'highlightLines') {
        // handle deprecated way of adding highlightLines via array annotation
        if (Array.isArray(annotationVal)) {
          var rangeVals = [];

          var _iterator = _createForOfIteratorHelper(annotationVal),
              _step;

          try {
            for (_iterator.s(); !(_step = _iterator.n()).done;) {
              var val = _step.value;

              if (Array.isArray(val)) {
                rangeVals.push("".concat(val[0], "-").concat(val[1]));
              } else {
                rangeVals.push(val);
              }
            }
          } catch (err) {
            _iterator.e(err);
          } finally {
            _iterator.f();
          }

          if (rangeVals.length) {
            metaProps.push("{".concat(rangeVals.join(','), "}"));
          }
        } else {
          // else we're dealing with the new {1,3} style highlightLines
          metaProps.push("{".concat(annotationVal, "}"));
        }
      } else {
        metaProps.push("".concat(key, "=\"").concat(annotationVal, "\""));
      }
    }
  }

  if (metaProps.length) {
    node.meta = metaProps.join(' ');
  }

  return code_1(node, _, context);
};

var tabsHandler = function tabsHandler(node, _, context) {
  var exit = context.enter('tabs');
  var value = containerFlow(node, context);
  exit();
  return "".concat(value, "\n\n<!-- type: tab-end -->");
};
var tabHandler = function tabHandler(node, _, context) {
  var _a;

  var exit = context.enter('tab');

  var _b = ((_a = node.data) === null || _a === void 0 ? void 0 : _a.hProperties) || {},
      type = _b.type,
      annotations = __rest(_b, ["type"]);

  var value = containerFlow(node, context);
  exit();
  return "<!--\ntype: tab\n".concat(safeStringify(annotations).trim(), "\n-->\n\n").concat(value);
};

var remarkStringifyPreset = {
  plugins: [[remarkFrontmatter, ['yaml']], remarkGFM // resolver
  ],
  settings: {
    bullet: '-',
    emphasis: '_',
    fences: true,
    incrementListMarker: true,
    listItemIndent: 'one',
    rule: '-',
    handlers: {
      blockquote: blockquoteHandler,
      code: codeHandler,
      tabs: tabsHandler,
      tab: tabHandler
    }
  }
};
var defaultProcessor$1 = unified().use(remarkStringify).use(remarkStringifyPreset);
var stringify = function stringify(tree) {
  var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var processor = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : defaultProcessor$1;
  var processorInstance = processor().data('settings', Object.assign({}, remarkStringifyPreset.settings, opts.settings)).use(opts.remarkPlugins || []);
  return processorInstance.stringify(processorInstance.runSync(tree));
};

var isError = function isError(_ref) {
  var severity = _ref.severity;
  return severity === DiagnosticSeverity.Error;
};

var safeParse = function safeParse(value) {
  try {
    var _parseYaml = parseWithPointers$1(String(value)),
        data = _parseYaml.data,
        diagnostics = _parseYaml.diagnostics;

    if (data === void 0 || diagnostics.length > 0 && diagnostics.some(isError)) {
      return {};
    }

    return data;
  } catch (_a) {
    return {};
  }
};

var Frontmatter = /*#__PURE__*/function () {
  function Frontmatter(data) {
    var mutate = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

    _classCallCheck(this, Frontmatter);

    var root = typeof data === 'string' ? parseWithPointers(data).data : mutate ? data : JSON.parse(JSON.stringify(data));

    if (root.type !== 'root') {
      throw new TypeError('Malformed yaml was provided');
    }

    this.document = root;

    if (root.children.length > 0 && root.children[0].type === 'yaml') {
      this.node = root.children[0]; // typings are a bit tricked, but let's move the burden of validation to consumer

      this.properties = safeParse(this.node.value);
    } else {
      this.node = {
        type: 'yaml',
        value: ''
      };
      this.properties = null;
    }
  }

  _createClass(Frontmatter, [{
    key: "isEmpty",
    get: function get() {
      for (var _ in this.properties) {
        if (Object.hasOwnProperty.call(this.properties, _)) {
          return false;
        }
      }

      return true;
    }
  }, {
    key: "getAll",
    value: function getAll() {
      if (this.properties !== null) {
        return this.properties;
      }
    }
  }, {
    key: "get",
    value: function get(prop) {
      if (this.properties !== null) {
        return _get(this.properties, prop);
      }
    }
  }, {
    key: "set",
    value: function set(prop, value) {
      if (this.properties === null) {
        this.properties = {};
      }

      _set(this.properties, prop, value);

      this.updateDocument();
    }
  }, {
    key: "unset",
    value: function unset(prop) {
      if (this.properties !== null) {
        var path = toPath(prop);
        var lastSegment = Number(path[path.length - 1]);

        if (!Number.isNaN(lastSegment)) {
          var baseObj = path.length > 1 ? this.get(path.slice(0, path.length - 1)) : this.getAll();

          if (Array.isArray(baseObj)) {
            if (baseObj.length < lastSegment) return;
            pullAt(baseObj, lastSegment);
          } else {
            _unset(this.properties, prop);
          }
        } else {
          _unset(this.properties, prop);
        }

        this.updateDocument();
      }
    }
  }, {
    key: "stringify",
    value: function stringify$1() {
      return stringify(this.document);
    }
  }, {
    key: "updateDocument",
    value: function updateDocument() {
      var children = this.document.children;
      if (!children) return;
      var index = children.indexOf(this.node);
      this.node.value = this.isEmpty ? '' : safeStringify(this.properties, {
        flowLevel: 1,
        indent: 2
      }).trim();

      if (this.isEmpty) {
        if (index !== -1) {
          children.splice(index, 1);
        }
      } else if (index === -1) {
        children.unshift(this.node);
      }
    }
  }], [{
    key: "getFrontmatterBlock",
    value: function getFrontmatterBlock(value) {
      var match = value.match(/^(\s*\n)?---(?:.|[\n\r\u2028\u2029])*?\n---/);
      return match === null ? void 0 : match[0];
    }
  }]);

  return Frontmatter;
}();

var getJsonPathForPosition = function getJsonPathForPosition(_ref, position) {
  var ast = _ref.ast;
  var path = [];
  findNodeAtPosition(ast, position, path);
  return path;
};

function findNodeAtPosition(node, position, path) {
  if (position.line >= node.position.start.line - 1 && position.line <= node.position.end.line - 1) {
    var children = node.children;

    if (Array.isArray(children)) {
      for (var i = children.length - 1; i >= 0; i--) {
        var item = findNodeAtPosition(children[i], position, path);

        if (item && (item.position.start.line !== item.position.end.line || position.character >= item.position.start.column - 1 && position.character <= item.position.end.column - 1)) {
          path.unshift('children', i);
          return findNodeAtPosition(item, position, path);
        }
      }
    }

    return node;
  }

  return;
}

var getLocationForJsonPath = function getLocationForJsonPath(_ref, path) {
  var ast = _ref.ast;
  var data = path.length === 0 ? ast : _get(ast, path);
  if (data === void 0) return;
  return {
    range: {
      start: {
        character: data.position.start.column - 1,
        line: data.position.start.line - 1
      },
      end: {
        character: data.position.end.column - 1,
        line: data.position.end.line - 1
      }
    }
  };
};

var getProperty = function getProperty(propName, element, data) {
  var target;

  if (data) {
    try {
      var frontmatter = new Frontmatter(data, true);
      target = frontmatter.get(propName);

      if (element && !target) {
        var elem = select(element, data);

        if (elem) {
          target = toString(elem);
        }
      }
    } catch (e) {
      console.warn("Error getting ".concat(propName, " from markdown document"), e);
    }
  }

  return target;
};

var getSummary = function getSummary(data) {
  var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var summary = getProperty('summary', 'paragraph', data);

  if (summary && opts.truncate) {
    // +3 to account for ellipsis
    summary = truncate(summary, {
      length: opts.truncate + 3
    });
  }

  return summary;
};

var getTags = function getTags(data) {
  var tags = [];

  if (data) {
    try {
      var frontmatter = new Frontmatter(data, true);
      var dataTags = frontmatter.get('tags');

      if (dataTags && Array.isArray(dataTags)) {
        return dataTags.reduce(function (filteredTags, tag) {
          if (tag && typeof tag === 'string' && tag !== 'undefined' && tag !== 'null') {
            filteredTags.push(String(tag));
          }

          return filteredTags;
        }, []);
      }
    } catch (e) {
      console.warn('Error getting tags from markdown document', e);
    }
  }

  return tags;
};

var getTitle = function getTitle(data) {
  return getProperty('title', 'heading', data);
};

var Reader = /*#__PURE__*/function () {
  function Reader() {
    _classCallCheck(this, Reader);
  }

  _createClass(Reader, [{
    key: "fromLang",
    value: function fromLang(raw) {
      return parse(raw);
    }
  }, {
    key: "toLang",
    value: function toLang(data) {
      return stringify(data);
    }
  }]);

  return Reader;
}();

export { Frontmatter, hast as HAST, mdast as MDAST, Reader, getJsonPathForPosition, getLocationForJsonPath, getProperty, getSummary, getTags, getTitle, parse, remarkParsePreset, stringify };
