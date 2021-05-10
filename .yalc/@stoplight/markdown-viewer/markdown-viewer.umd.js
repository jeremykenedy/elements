(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('tslib'), require('@stoplight/mosaic'), require('@stoplight/react-error-boundary'), require('react'), require('@stoplight/mosaic-code-viewer'), require('@stoplight/markdown'), require('deepmerge'), require('hast-util-sanitize'), require('rehype-raw'), require('rehype-react'), require('remark-parse'), require('remark-rehype'), require('unified')) :
  typeof define === 'function' && define.amd ? define(['exports', 'tslib', '@stoplight/mosaic', '@stoplight/react-error-boundary', 'react', '@stoplight/mosaic-code-viewer', '@stoplight/markdown', 'deepmerge', 'hast-util-sanitize', 'rehype-raw', 'rehype-react', 'remark-parse', 'remark-rehype', 'unified'], factory) :
  (global = global || self, factory(global.MarkdownViewer = {}, global.tslib, global.mosaic, global.reactErrorBoundary, global.React, global.mosaicCodeViewer, global.markdown, global.deepmerge, global.hastUtilSanitize, global.raw, global.rehype2react, global.remarkParse, global.remark2rehype, global.unified));
}(this, (function (exports, tslib, mosaic, reactErrorBoundary, React, mosaicCodeViewer, markdown, deepmerge, hastUtilSanitize, raw, rehype2react, remarkParse, remark2rehype, unified) { 'use strict';

  deepmerge = deepmerge && deepmerge.hasOwnProperty('default') ? deepmerge['default'] : deepmerge;
  raw = raw && raw.hasOwnProperty('default') ? raw['default'] : raw;
  rehype2react = rehype2react && rehype2react.hasOwnProperty('default') ? rehype2react['default'] : rehype2react;
  remarkParse = remarkParse && remarkParse.hasOwnProperty('default') ? remarkParse['default'] : remarkParse;
  remark2rehype = remark2rehype && remark2rehype.hasOwnProperty('default') ? remark2rehype['default'] : remark2rehype;
  unified = unified && unified.hasOwnProperty('default') ? unified['default'] : unified;

  var getCodeLanguage = function getCodeLanguage(lang) {
    switch (lang) {
      case 'http':
        return 'yaml';

      default:
        return lang;
    }
  };

  var DefaultSMDComponents = {
    /**
     * Native element overrides
     */
    a: function a(_a) {
      var href = _a.href,
          props = tslib.__rest(_a, ["href"]);

      if (!href) return null; // If it's relative, regular link

      if (href.startsWith('/')) {
        return React.createElement("a", tslib.__assign({
          href: href
        }, props));
      } // Otherwise open in a new tab


      return React.createElement("a", tslib.__assign({
        href: href,
        target: "_blank",
        rel: "noopener noreferrer"
      }, props));
    },
    h1: function h1(_a) {
      var color = _a.color,
          props = tslib.__rest(_a, ["color"]);

      return React.createElement(mosaic.Heading, tslib.__assign({
        size: 1
      }, props));
    },
    h2: function h2(_a) {
      var color = _a.color,
          props = tslib.__rest(_a, ["color"]);

      return React.createElement(mosaic.LinkHeading, tslib.__assign({
        size: 2
      }, props));
    },
    h3: function h3(_a) {
      var color = _a.color,
          props = tslib.__rest(_a, ["color"]);

      return React.createElement(mosaic.LinkHeading, tslib.__assign({
        size: 3
      }, props));
    },
    h4: function h4(_a) {
      var color = _a.color,
          props = tslib.__rest(_a, ["color"]);

      return React.createElement(mosaic.LinkHeading, tslib.__assign({
        size: 4
      }, props));
    },
    h5: function h5(_a) {
      var color = _a.color,
          props = tslib.__rest(_a, ["color"]);

      return React.createElement(mosaic.Heading, tslib.__assign({
        size: 4
      }, props));
    },
    h6: function h6(_a) {
      var color = _a.color,
          props = tslib.__rest(_a, ["color"]);

      return React.createElement(mosaic.Heading, tslib.__assign({
        size: 4
      }, props));
    },
    blockquote: function blockquote(_a) {
      var theme = _a.theme,
          children = _a.children;
      return React.createElement("blockquote", {
        className: "sl-blockquote--" + (theme || 'default')
      }, children);
    },
    code: function code(_a) {
      var children = _a.children,
          inline = _a.inline,
          lineNumbers = _a.lineNumbers,
          title = _a.title,
          lang = _a.lang,
          json_schema = _a.json_schema;

      if (inline !== void 0) {
        return React.createElement(mosaic.Code, null, children);
      }

      var elem;

      if (!elem) {
        elem = React.createElement(mosaic.InvertTheme, null, React.createElement(mosaicCodeViewer.CodeViewer, {
          bg: "canvas",
          value: String(children),
          language: getCodeLanguage(String(lang)),
          rounded: "lg",
          ring: {
            focus: true
          },
          ringColor: "primary",
          ringOpacity: 50,
          showLineNumbers: lineNumbers !== void 0,
          title: title
        }));
      }

      return React.createElement(reactErrorBoundary.ErrorBoundary, null, elem);
    },
    // TODO a nice pretty image component
    // img: props => <img {...props} />,

    /**
     * Tabs
     */
    tabs: function tabs(props) {
      return React.createElement(mosaic.Tabs, {
        appearance: "line"
      }, React.createElement(mosaic.TabList, null, React.Children.map(props.children, function (child, i) {
        return React.createElement(mosaic.Tab, {
          key: i
        }, child.props.title);
      })), React.createElement(mosaic.TabPanels, null, React.Children.map(props.children, function (child, i) {
        return React.createElement(mosaic.TabPanel, {
          key: i
        }, child);
      })));
    },
    tab: function tab(_a) {
      var children = _a.children;
      return React.createElement(React.Fragment, null, children);
    },

    /**
     * Code Groups
     */
    codegroup: function codegroup(props) {
      return React.createElement(mosaic.Box, {
        className: "sl-code-group"
      }, React.createElement(mosaic.Tabs, null, React.createElement(mosaic.Flex, {
        alignItems: "center"
      }, React.createElement(mosaic.Box, {
        mr: 4,
        ml: 1
      }, React.createElement(mosaic.Icon, {
        icon: ['far', 'code'],
        size: "sm"
      })), React.createElement(mosaic.TabList, {
        fontSize: "lg",
        density: "compact"
      }, React.Children.map(props.children, function (child, i) {
        var _a, _b;

        var children = (_a = child.props) === null || _a === void 0 ? void 0 : _a.children; // this is array when in rehype context, and object in mdx context

        children = Array.isArray(children) ? children[0] : children;
        return React.createElement(mosaic.Tab, {
          key: i
        }, ((_b = children === null || children === void 0 ? void 0 : children.props) === null || _b === void 0 ? void 0 : _b.lang) || 'untitled');
      }))), React.createElement(mosaic.TabPanels, {
        p: 1
      }, React.Children.map(props.children, function (child, i) {
        return React.createElement(mosaic.TabPanel, {
          key: i
        }, child);
      }))));
    }
  };

  function sanitize(schema) {
    return function transformer(tree) {
      return hastUtilSanitize.sanitize(tree, schema);
    };
  }

  var sanitizationSchema = null;
  var buildSanitizationSchema = function buildSanitizationSchema() {
    // do this once at runtime so that end lib is still tree-shakeable
    if (!sanitizationSchema) {
      sanitizationSchema = deepmerge(hastUtilSanitize.defaultSchema, {
        tagNames: ['tabs', 'tab', 'codegroup', 'button'],
        attributes: {
          '*': ['className', 'style'],
          code: ['title', 'lineNumbers', 'inline', 'highlightLines', 'lang', 'url', 'live', 'json_schema', 'http'],
          blockquote: ['theme']
        }
      });
    }

    return sanitizationSchema;
  };
  var mdast2React = function mdast2React(input, opts) {
    if (opts === void 0) {
      opts = {};
    }

    var processorInstance = createMdastToHastProcessor(opts).use(rehype2react, {
      createElement: React.createElement,
      Fragment: React.Fragment,
      components: opts.components
    }); // return the react tree
    // @ts-expect-error rehype2react is special and returns a react tree instead of string

    return processorInstance.stringify(processorInstance.runSync(input));
  };
  var markdown2React = function markdown2React(input, opts) {
    if (opts === void 0) {
      opts = {};
    }

    var processed = createHastProcessor(opts).use(rehype2react, {
      createElement: React.createElement,
      Fragment: React.Fragment,
      components: opts.components
    }).processSync(input); // return the parsed remark ast

    return processed.result;
  };
  var parse = markdown.parse;

  var createHastProcessor = function createHastProcessor(opts) {
    if (opts === void 0) {
      opts = {};
    }

    return unified().use(remarkParse).use(markdown.remarkParsePreset).use(opts.remarkPlugins || []).use(remark2rehype, {
      allowDangerousHtml: true
    }).use(raw).use(sanitize, buildSanitizationSchema()).use(opts.rehypePlugins || []);
  };

  var createMdastToHastProcessor = function createMdastToHastProcessor(opts) {
    if (opts === void 0) {
      opts = {};
    }

    return unified().use(remark2rehype, {
      allowDangerousHtml: true
    }).use(raw).use(sanitize, buildSanitizationSchema()).use(opts.rehypePlugins || []);
  };

  var useMarkdownTree = function useMarkdownTree(markdownOrTree, components) {
    if (components === void 0) {
      components = {};
    }

    return React.useMemo(function () {
      return typeof markdownOrTree === 'string' ? markdown2React(markdownOrTree, {
        components: components
      }) : mdast2React(markdownOrTree, {
        components: components
      });
    }, [markdownOrTree, components]);
  };

  var MarkdownViewer = function MarkdownViewer(_a) {
    var onError = _a.onError,
        _b = _a.FallbackComponent,
        FallbackComponent = _b === void 0 ? MarkdownViewerFallbackComponent : _b,
        props = tslib.__rest(_a, ["onError", "FallbackComponent"]);

    return React.createElement(reactErrorBoundary.ErrorBoundary, {
      onError: onError,
      FallbackComponent: FallbackComponent
    }, React.createElement(MarkdownViewerComponent, tslib.__assign({}, props)));
  };
  MarkdownViewer.displayName = 'MarkdownViewer';

  var MarkdownViewerComponent = function MarkdownViewerComponent(_a) {
    var markdownOrTree = _a.markdown,
        components = _a.components,
        color = _a.color,
        props = tslib.__rest(_a, ["markdown", "components", "color"]);

    var componentMapping = React.useMemo(function () {
      return tslib.__assign(tslib.__assign({}, DefaultSMDComponents), components);
    }, [components]);
    var tree = useMarkdownTree(markdownOrTree, componentMapping);
    return React.createElement(mosaic.Prose, tslib.__assign({
      className: "sl-markdown-viewer"
    }, props), tree);
  };

  MarkdownViewerComponent.displayName = 'MarkdownViewer.Component';

  var MarkdownViewerFallbackComponent = function MarkdownViewerFallbackComponent(_a) {
    var error = _a.error;
    return React.createElement(mosaic.Box, {
      p: 4
    }, React.createElement("b", null, "Error"), error && ": " + error.message);
  };

  exports.DefaultSMDComponents = DefaultSMDComponents;
  exports.MarkdownViewer = MarkdownViewer;
  exports.buildSanitizationSchema = buildSanitizationSchema;
  exports.markdown2React = markdown2React;
  exports.mdast2React = mdast2React;
  exports.parse = parse;
  exports.useMarkdownTree = useMarkdownTree;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
