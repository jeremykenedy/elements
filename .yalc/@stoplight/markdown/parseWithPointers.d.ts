import type { VFileCompatible } from 'vfile';
import { ParseOptions } from './parse';
import { MarkdownParserResult } from './types';
export declare const parseWithPointers: (markdown: VFileCompatible, opts?: Partial<ParseOptions>) => MarkdownParserResult;
