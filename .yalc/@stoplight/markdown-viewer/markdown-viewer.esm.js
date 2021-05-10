import { __rest } from 'tslib';
import { Heading, LinkHeading, Code, InvertTheme, Tabs, TabList, Tab, TabPanels, TabPanel, Box, Flex, Icon, Prose } from '@stoplight/mosaic';
import { ErrorBoundary } from '@stoplight/react-error-boundary';
import { createElement, Children, Fragment, useMemo } from 'react';
import { CodeViewer } from '@stoplight/mosaic-code-viewer';
import { remarkParsePreset, parse as parse$1 } from '@stoplight/markdown';
import deepmerge from 'deepmerge';
import { sanitize as sanitize$1, defaultSchema } from 'hast-util-sanitize';
import raw from 'rehype-raw';
import rehype2react from 'rehype-react';
import remarkParse from 'remark-parse';
import remark2rehype from 'remark-rehype';
import unified from 'unified';

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
        props = __rest(_a, ["href"]);

    if (!href) return null; // If it's relative, regular link

    if (href.startsWith('/')) {
      return createElement("a", Object.assign({
        href: href
      }, props));
    } // Otherwise open in a new tab


    return createElement("a", Object.assign({
      href: href,
      target: "_blank",
      rel: "noopener noreferrer"
    }, props));
  },
  h1: function h1(_a) {
    var color = _a.color,
        props = __rest(_a, ["color"]);

    return createElement(Heading, Object.assign({
      size: 1
    }, props));
  },
  h2: function h2(_a) {
    var color = _a.color,
        props = __rest(_a, ["color"]);

    return createElement(LinkHeading, Object.assign({
      size: 2
    }, props));
  },
  h3: function h3(_a) {
    var color = _a.color,
        props = __rest(_a, ["color"]);

    return createElement(LinkHeading, Object.assign({
      size: 3
    }, props));
  },
  h4: function h4(_a) {
    var color = _a.color,
        props = __rest(_a, ["color"]);

    return createElement(LinkHeading, Object.assign({
      size: 4
    }, props));
  },
  h5: function h5(_a) {
    var color = _a.color,
        props = __rest(_a, ["color"]);

    return createElement(Heading, Object.assign({
      size: 4
    }, props));
  },
  h6: function h6(_a) {
    var color = _a.color,
        props = __rest(_a, ["color"]);

    return createElement(Heading, Object.assign({
      size: 4
    }, props));
  },
  blockquote: function blockquote(_ref) {
    var theme = _ref.theme,
        children = _ref.children;
    return createElement("blockquote", {
      className: "sl-blockquote--".concat(theme || 'default')
    }, children);
  },
  code: function code(_ref2) {
    var children = _ref2.children,
        inline = _ref2.inline,
        lineNumbers = _ref2.lineNumbers,
        title = _ref2.title,
        lang = _ref2.lang,
        json_schema = _ref2.json_schema;

    if (inline !== void 0) {
      return createElement(Code, null, children);
    }

    var elem;

    if (!elem) {
      elem = createElement(InvertTheme, null, createElement(CodeViewer, {
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

    return createElement(ErrorBoundary, null, elem);
  },
  // TODO a nice pretty image component
  // img: props => <img {...props} />,

  /**
   * Tabs
   */
  tabs: function tabs(props) {
    return createElement(Tabs, {
      appearance: "line"
    }, createElement(TabList, null, Children.map(props.children, function (child, i) {
      return createElement(Tab, {
        key: i
      }, child.props.title);
    })), createElement(TabPanels, null, Children.map(props.children, function (child, i) {
      return createElement(TabPanel, {
        key: i
      }, child);
    })));
  },
  tab: function tab(_ref3) {
    var children = _ref3.children;
    return createElement(Fragment, null, children);
  },

  /**
   * Code Groups
   */
  codegroup: function codegroup(props) {
    return createElement(Box, {
      className: "sl-code-group"
    }, createElement(Tabs, null, createElement(Flex, {
      alignItems: "center"
    }, createElement(Box, {
      mr: 4,
      ml: 1
    }, createElement(Icon, {
      icon: ['far', 'code'],
      size: "sm"
    })), createElement(TabList, {
      fontSize: "lg",
      density: "compact"
    }, Children.map(props.children, function (child, i) {
      var _a, _b;

      var children = (_a = child.props) === null || _a === void 0 ? void 0 : _a.children; // this is array when in rehype context, and object in mdx context

      children = Array.isArray(children) ? children[0] : children;
      return createElement(Tab, {
        key: i
      }, ((_b = children === null || children === void 0 ? void 0 : children.props) === null || _b === void 0 ? void 0 : _b.lang) || 'untitled');
    }))), createElement(TabPanels, {
      p: 1
    }, Children.map(props.children, function (child, i) {
      return createElement(TabPanel, {
        key: i
      }, child);
    }))));
  }
};

function sanitize(schema) {
  return function transformer(tree) {
    return sanitize$1(tree, schema);
  };
}

var sanitizationSchema = null;
var buildSanitizationSchema = function buildSanitizationSchema() {
  // do this once at runtime so that end lib is still tree-shakeable
  if (!sanitizationSchema) {
    sanitizationSchema = deepmerge(defaultSchema, {
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
var mdast2React = function mdast2React(input) {
  var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var processorInstance = createMdastToHastProcessor(opts).use(rehype2react, {
    createElement: createElement,
    Fragment: Fragment,
    components: opts.components
  }); // return the react tree
  // @ts-expect-error rehype2react is special and returns a react tree instead of string

  return processorInstance.stringify(processorInstance.runSync(input));
};
var markdown2React = function markdown2React(input) {
  var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var processed = createHastProcessor(opts).use(rehype2react, {
    createElement: createElement,
    Fragment: Fragment,
    components: opts.components
  }).processSync(input); // return the parsed remark ast

  return processed.result;
};
var parse = parse$1;

var createHastProcessor = function createHastProcessor() {
  var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  return unified().use(remarkParse).use(remarkParsePreset).use(opts.remarkPlugins || []).use(remark2rehype, {
    allowDangerousHtml: true
  }).use(raw).use(sanitize, buildSanitizationSchema()).use(opts.rehypePlugins || []);
};

var createMdastToHastProcessor = function createMdastToHastProcessor() {
  var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  return unified().use(remark2rehype, {
    allowDangerousHtml: true
  }).use(raw).use(sanitize, buildSanitizationSchema()).use(opts.rehypePlugins || []);
};

var useMarkdownTree = function useMarkdownTree(markdownOrTree) {
  var components = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  return useMemo(function () {
    return typeof markdownOrTree === 'string' ? markdown2React(markdownOrTree, {
      components: components
    }) : mdast2React(markdownOrTree, {
      components: components
    });
  }, [markdownOrTree, components]);
};

var MarkdownViewer = function MarkdownViewer(_a) {
  var onError = _a.onError,
      _a$FallbackComponent = _a.FallbackComponent,
      FallbackComponent = _a$FallbackComponent === void 0 ? MarkdownViewerFallbackComponent : _a$FallbackComponent,
      props = __rest(_a, ["onError", "FallbackComponent"]);

  return createElement(ErrorBoundary, {
    onError: onError,
    FallbackComponent: FallbackComponent
  }, createElement(MarkdownViewerComponent, Object.assign({}, props)));
};
MarkdownViewer.displayName = 'MarkdownViewer';

var MarkdownViewerComponent = function MarkdownViewerComponent(_a) {
  var markdownOrTree = _a.markdown,
      components = _a.components,
      color = _a.color,
      props = __rest(_a, ["markdown", "components", "color"]);

  var componentMapping = useMemo(function () {
    return Object.assign(Object.assign({}, DefaultSMDComponents), components);
  }, [components]);
  var tree = useMarkdownTree(markdownOrTree, componentMapping);
  return createElement(Prose, Object.assign({
    className: "sl-markdown-viewer"
  }, props), tree);
};

MarkdownViewerComponent.displayName = 'MarkdownViewer.Component';

var MarkdownViewerFallbackComponent = function MarkdownViewerFallbackComponent(_ref) {
  var error = _ref.error;
  return createElement(Box, {
    p: 4
  }, createElement("b", null, "Error"), error && ": ".concat(error.message));
};

export { DefaultSMDComponents, MarkdownViewer, buildSanitizationSchema, markdown2React, mdast2React, parse, useMarkdownTree };
