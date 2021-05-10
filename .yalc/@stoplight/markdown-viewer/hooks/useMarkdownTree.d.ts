import { MDAST } from '@stoplight/markdown';
import * as React from 'react';
import { ParseOptions } from '../utils';
export declare const useMarkdownTree: (markdownOrTree: string | MDAST.Root, opts?: ParseOptions) => React.ReactElement<any, string | React.JSXElementConstructor<any>>;
