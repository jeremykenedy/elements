import { MDAST } from '@stoplight/markdown';
import { ReactElement } from 'react';
import unified from 'unified';
import type { VFileCompatible } from 'vfile';
import { CustomComponents } from '../types';
export declare type ParseOptions = {
    remarkPlugins?: unified.PluggableList<unified.Settings>;
    rehypePlugins?: unified.PluggableList<unified.Settings>;
    components?: CustomComponents;
};
export declare const buildSanitizationSchema: () => unknown;
export declare const mdast2React: (input: MDAST.Root, opts?: Pick<ParseOptions, 'rehypePlugins' | 'components'>) => ReactElement<any, string | import("react").JSXElementConstructor<any>>;
export declare const markdown2React: (input: VFileCompatible, opts?: ParseOptions) => ReactElement<any, string | import("react").JSXElementConstructor<any>>;
export declare const parse: (markdown: VFileCompatible, opts?: Partial<import("@stoplight/markdown").ParseOptions>, processor?: unified.Processor<unified.Settings>) => MDAST.Root;
