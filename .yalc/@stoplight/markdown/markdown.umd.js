(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@stoplight/types'), require('@stoplight/yaml'), require('lodash/get'), require('lodash/pullAt'), require('lodash/set'), require('lodash/toPath'), require('lodash/unset'), require('remark-frontmatter'), require('remark-gfm'), require('remark-parse'), require('remark-slug'), require('unified'), require('tslib'), require('unist-util-visit'), require('remark-stringify'), require('mdast-util-to-string'), require('unist-util-select'), require('lodash/truncate')) :
  typeof define === 'function' && define.amd ? define(['exports', '@stoplight/types', '@stoplight/yaml', 'lodash/get', 'lodash/pullAt', 'lodash/set', 'lodash/toPath', 'lodash/unset', 'remark-frontmatter', 'remark-gfm', 'remark-parse', 'remark-slug', 'unified', 'tslib', 'unist-util-visit', 'remark-stringify', 'mdast-util-to-string', 'unist-util-select', 'lodash/truncate'], factory) :
  (global = global || self, factory(global.Markdown = {}, global.types, global.yaml, global.get, global.pullAt, global.set, global.toPath, global.unset, global.remarkFrontmatter, global.remarkGFM, global.remarkParse, global.remarkSlug, global.unified, global.tslib, global.unistUtilVisit, global.remarkStringify, global.mdastUtilToString, global.unistUtilSelect, global.truncate));
}(this, (function (exports, types, yaml, get, pullAt, set, toPath, unset, remarkFrontmatter, remarkGFM, remarkParse, remarkSlug, unified, tslib, unistUtilVisit, remarkStringify, mdastUtilToString, unistUtilSelect, truncate) { 'use strict';

  get = get && get.hasOwnProperty('default') ? get['default'] : get;
  pullAt = pullAt && pullAt.hasOwnProperty('default') ? pullAt['default'] : pullAt;
  set = set && set.hasOwnProperty('default') ? set['default'] : set;
  toPath = toPath && toPath.hasOwnProperty('default') ? toPath['default'] : toPath;
  unset = unset && unset.hasOwnProperty('default') ? unset['default'] : unset;
  remarkFrontmatter = remarkFrontmatter && remarkFrontmatter.hasOwnProperty('default') ? remarkFrontmatter['default'] : remarkFrontmatter;
  remarkGFM = remarkGFM && remarkGFM.hasOwnProperty('default') ? remarkGFM['default'] : remarkGFM;
  remarkParse = remarkParse && remarkParse.hasOwnProperty('default') ? remarkParse['default'] : remarkParse;
  remarkSlug = remarkSlug && remarkSlug.hasOwnProperty('default') ? remarkSlug['default'] : remarkSlug;
  unified = unified && unified.hasOwnProperty('default') ? unified['default'] : unified;
  remarkStringify = remarkStringify && remarkStringify.hasOwnProperty('default') ? remarkStringify['default'] : remarkStringify;
  truncate = truncate && truncate.hasOwnProperty('default') ? truncate['default'] : truncate;



  var hast = /*#__PURE__*/Object.freeze({
    __proto__: null
  });



  var mdast = /*#__PURE__*/Object.freeze({
    __proto__: null
  });

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
            var children = tabPlaceholder.children;

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

      return tslib.__assign(tslib.__assign({}, root), {
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
        var contents = yaml.parse(raw);

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
      var raw = node.value.substr('<!--'.length, node.value.length - '-->'.length - '<!--'.length).trim(); // load contents of annotation into yaml

      try {
        var contents = yaml.parse(raw);

        if (typeof contents === 'object') {
          // annotations must be objects, otherwise it's just a regular ol html comment
          return contents;
        }
      } catch (error) {// ignore invalid YAML
      }
    }

    return {};
  }

  function processNode(node, annotations) {
    if (annotations) {
      return tslib.__assign(tslib.__assign({}, node), {
        annotations: annotations
      });
    }

    return node;
  }

  function blockquoteMdast2Hast() {
    return function transform(root) {
      unistUtilVisit.visit(root, 'blockquote', function (node) {
        var data = node.data || (node.data = {});
        var annotations = node.annotations || {};
        data.hProperties = annotations;
      });
    };
  }

  function inlineCodeMdast2Hast() {
    return function transform(root) {
      unistUtilVisit.visit(root, 'inlineCode', function (node) {
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
    var e_1, _a;

    var props = {};
    if (!metastring) return props;
    var metaWithoutKeyValPairs = metastring;
    var keyValPair;

    while ((keyValPair = metaKeyValPairMatcher.exec(metastring)) !== null) {
      props[keyValPair[1]] = keyValPair[3];
      metaWithoutKeyValPairs = metaWithoutKeyValPairs.replace(keyValPair[0], '');
    }

    var booleanProps = metaWithoutKeyValPairs.split(' ');

    try {
      for (var booleanProps_1 = tslib.__values(booleanProps), booleanProps_1_1 = booleanProps_1.next(); !booleanProps_1_1.done; booleanProps_1_1 = booleanProps_1.next()) {
        var booleanProp = booleanProps_1_1.value;
        var highlightLinesMatch = booleanProp.match(highlightLinesRangeRegex);

        if (highlightLinesMatch) {
          props.highlightLines = highlightLinesMatch[1];
        } else if (booleanProp) {
          props[booleanProp] = 'true';
        }
      }
    } catch (e_1_1) {
      e_1 = {
        error: e_1_1
      };
    } finally {
      try {
        if (booleanProps_1_1 && !booleanProps_1_1.done && (_a = booleanProps_1["return"])) _a.call(booleanProps_1);
      } finally {
        if (e_1) throw e_1.error;
      }
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
      var e_2, _a;

      var sequentialCodeBlocks = [];
      var lastIndex = -1;
      var lastParent;
      var groupings = [];
      unistUtilVisit.visit(root, 'code', function (node, index, parent) {
        var _a = parseMeta(node.meta),
            metaTitle = _a.title,
            metaProps = tslib.__rest(_a, ["title"]);
        /**
         * Annotation processing
         */


        var annotations = Object.assign({}, metaProps, node.annotations);
        var title = annotations.title || metaTitle;

        if (title) {
          annotations = tslib.__assign({
            // title first
            title: title
          }, annotations);
        }

        node.annotations = annotations;
        var data = node.data || (node.data = {});
        data.hProperties = tslib.__assign(tslib.__assign({
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

      try {
        for (var groupings_1 = tslib.__values(groupings), groupings_1_1 = groupings_1.next(); !groupings_1_1.done; groupings_1_1 = groupings_1.next()) {
          var group = groupings_1_1.value;

          if (!removed.get(group.parent)) {
            removed.set(group.parent, 0);
          }

          var removeCount = removed.get(group.parent);
          group.parent.children.splice(group.startIndex - removeCount, group.numCodeBlocks, group.codeGroup);
          removed.set(group.parent, removeCount + group.numCodeBlocks - 1);
        }
      } catch (e_2_1) {
        e_2 = {
          error: e_2_1
        };
      } finally {
        try {
          if (groupings_1_1 && !groupings_1_1.done && (_a = groupings_1["return"])) _a.call(groupings_1);
        } finally {
          if (e_2) throw e_2.error;
        }
      }
    };
  }

  var remarkParsePreset = {
    plugins: [[remarkFrontmatter, ['yaml']], remarkGFM, remarkSlug, smdAnnotations, smdCode, inlineCodeMdast2Hast, blockquoteMdast2Hast],
    settings: {}
  };
  var defaultProcessor = unified().use(remarkParse).use(remarkParsePreset);
  var parse = function parse(markdown, opts, processor) {
    if (opts === void 0) {
      opts = {};
    }

    if (processor === void 0) {
      processor = defaultProcessor;
    }

    var processorInstance = processor().data('settings', Object.assign({}, remarkParsePreset.settings, opts.settings)).use(opts.remarkPlugins || []); // return the parsed remark ast

    return processorInstance.runSync(processorInstance.parse(markdown));
  };

  var parseWithPointers = function parseWithPointers(markdown, opts) {
    if (opts === void 0) {
      opts = {};
    }

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
      return "<!-- " + yaml.safeStringify(annotations).trim() + " -->\n\n" + value;
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
    var e_1, _a;

    var _b;

    var _c = ((_b = node.data) === null || _b === void 0 ? void 0 : _b.hProperties) || {},
        lang = _c.lang,
        _meta = _c.meta,
        annotations = tslib.__rest(_c, ["lang", "meta"]);

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

            try {
              for (var annotationVal_1 = (e_1 = void 0, tslib.__values(annotationVal)), annotationVal_1_1 = annotationVal_1.next(); !annotationVal_1_1.done; annotationVal_1_1 = annotationVal_1.next()) {
                var val = annotationVal_1_1.value;

                if (Array.isArray(val)) {
                  rangeVals.push(val[0] + "-" + val[1]);
                } else {
                  rangeVals.push(val);
                }
              }
            } catch (e_1_1) {
              e_1 = {
                error: e_1_1
              };
            } finally {
              try {
                if (annotationVal_1_1 && !annotationVal_1_1.done && (_a = annotationVal_1["return"])) _a.call(annotationVal_1);
              } finally {
                if (e_1) throw e_1.error;
              }
            }

            if (rangeVals.length) {
              metaProps.push("{" + rangeVals.join(',') + "}");
            }
          } else {
            // else we're dealing with the new {1,3} style highlightLines
            metaProps.push("{" + annotationVal + "}");
          }
        } else {
          metaProps.push(key + "=\"" + annotationVal + "\"");
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
    return value + "\n\n<!-- type: tab-end -->";
  };
  var tabHandler = function tabHandler(node, _, context) {
    var _a;

    var exit = context.enter('tab');

    var _b = ((_a = node.data) === null || _a === void 0 ? void 0 : _a.hProperties) || {},
        type = _b.type,
        annotations = tslib.__rest(_b, ["type"]);

    var value = containerFlow(node, context);
    exit();
    return "<!--\ntype: tab\n" + yaml.safeStringify(annotations).trim() + "\n-->\n\n" + value;
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
  var stringify = function stringify(tree, opts, processor) {
    if (opts === void 0) {
      opts = {};
    }

    if (processor === void 0) {
      processor = defaultProcessor$1;
    }

    var processorInstance = processor().data('settings', Object.assign({}, remarkStringifyPreset.settings, opts.settings)).use(opts.remarkPlugins || []);
    return processorInstance.stringify(processorInstance.runSync(tree));
  };

  var isError = function isError(_a) {
    var severity = _a.severity;
    return severity === types.DiagnosticSeverity.Error;
  };

  var safeParse = function safeParse(value) {
    try {
      var _a = yaml.parseWithPointers(String(value)),
          data = _a.data,
          diagnostics = _a.diagnostics;

      if (data === void 0 || diagnostics.length > 0 && diagnostics.some(isError)) {
        return {};
      }

      return data;
    } catch (_b) {
      return {};
    }
  };

  var Frontmatter =
  /** @class */
  function () {
    function Frontmatter(data, mutate) {
      if (mutate === void 0) {
        mutate = false;
      }

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

    Object.defineProperty(Frontmatter.prototype, "isEmpty", {
      get: function get() {
        for (var _ in this.properties) {
          if (Object.hasOwnProperty.call(this.properties, _)) {
            return false;
          }
        }

        return true;
      },
      enumerable: false,
      configurable: true
    });

    Frontmatter.prototype.getAll = function () {
      if (this.properties !== null) {
        return this.properties;
      }
    };

    Frontmatter.prototype.get = function (prop) {
      if (this.properties !== null) {
        return get(this.properties, prop);
      }
    };

    Frontmatter.prototype.set = function (prop, value) {
      if (this.properties === null) {
        this.properties = {};
      }

      set(this.properties, prop, value);
      this.updateDocument();
    };

    Frontmatter.prototype.unset = function (prop) {
      if (this.properties !== null) {
        var path = toPath(prop);
        var lastSegment = Number(path[path.length - 1]);

        if (!Number.isNaN(lastSegment)) {
          var baseObj = path.length > 1 ? this.get(path.slice(0, path.length - 1)) : this.getAll();

          if (Array.isArray(baseObj)) {
            if (baseObj.length < lastSegment) return;
            pullAt(baseObj, lastSegment);
          } else {
            unset(this.properties, prop);
          }
        } else {
          unset(this.properties, prop);
        }

        this.updateDocument();
      }
    };

    Frontmatter.prototype.stringify = function () {
      return stringify(this.document);
    };

    Frontmatter.getFrontmatterBlock = function (value) {
      var match = value.match(/^(\s*\n)?---(?:.|[\n\r\u2028\u2029])*?\n---/);
      return match === null ? void 0 : match[0];
    };

    Frontmatter.prototype.updateDocument = function () {
      var children = this.document.children;
      if (!children) return;
      var index = children.indexOf(this.node);
      this.node.value = this.isEmpty ? '' : yaml.safeStringify(this.properties, {
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
    };

    return Frontmatter;
  }();

  var getJsonPathForPosition = function getJsonPathForPosition(_a, position) {
    var ast = _a.ast;
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

  var getLocationForJsonPath = function getLocationForJsonPath(_a, path) {
    var ast = _a.ast;
    var data = path.length === 0 ? ast : get(ast, path);
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
          var elem = unistUtilSelect.select(element, data);

          if (elem) {
            target = mdastUtilToString.toString(elem);
          }
        }
      } catch (e) {
        console.warn("Error getting " + propName + " from markdown document", e);
      }
    }

    return target;
  };

  var getSummary = function getSummary(data, opts) {
    if (opts === void 0) {
      opts = {};
    }

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

  var Reader =
  /** @class */
  function () {
    function Reader() {}

    Reader.prototype.fromLang = function (raw) {
      return parse(raw);
    };

    Reader.prototype.toLang = function (data) {
      return stringify(data);
    };

    return Reader;
  }();

  exports.Frontmatter = Frontmatter;
  exports.HAST = hast;
  exports.MDAST = mdast;
  exports.Reader = Reader;
  exports.getJsonPathForPosition = getJsonPathForPosition;
  exports.getLocationForJsonPath = getLocationForJsonPath;
  exports.getProperty = getProperty;
  exports.getSummary = getSummary;
  exports.getTags = getTags;
  exports.getTitle = getTitle;
  exports.parse = parse;
  exports.remarkParsePreset = remarkParsePreset;
  exports.stringify = stringify;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
