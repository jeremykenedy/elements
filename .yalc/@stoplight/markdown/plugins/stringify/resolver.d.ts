import { Dictionary } from '@stoplight/types';
import * as unified from 'unified';
import { MDAST } from '../../ast-types';
declare type Resolver = (node: MDAST.Code, data: Dictionary<unknown>) => Promise<object>;
export default function resolve(this: unified.Processor, opts?: {
    resolver: Resolver;
}): unified.Transformer | void;
export {};
