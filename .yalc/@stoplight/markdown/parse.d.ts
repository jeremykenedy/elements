import { RemarkParseOptions } from 'remark-parse';
import unified from 'unified';
import type { VFileCompatible } from 'vfile';
import { MDAST } from './ast-types';
export declare type ParseSettings = RemarkParseOptions;
export declare type ParseOptions = {
    remarkPlugins?: unified.PluggableList<unified.Settings>;
    settings?: ParseSettings;
};
export declare const remarkParsePreset: unified.Preset<ParseSettings>;
export declare const parse: (markdown: VFileCompatible, opts?: Partial<ParseOptions>, processor?: unified.Processor) => MDAST.Root;
