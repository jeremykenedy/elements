import * as UNIST from 'unist';
import { MDAST } from '../../ast-types';
export declare function inlineCodeMdast2Hast(): (root: MDAST.Root) => void;
export declare function smdCode(): (root: UNIST.Node) => void;
