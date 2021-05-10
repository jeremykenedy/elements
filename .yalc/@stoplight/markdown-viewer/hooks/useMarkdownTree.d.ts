import { MDAST } from '@stoplight/markdown';
import * as React from 'react';
import { CustomComponentMapping } from '../types';
export declare const useMarkdownTree: (markdownOrTree: string | MDAST.Root, components?: CustomComponentMapping) => React.ReactElement<any, string | React.JSXElementConstructor<any>>;
