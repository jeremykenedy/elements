import { MDAST } from '../ast-types';
export interface IGetSummaryOpts {
    truncate?: number;
}
export declare const getSummary: (data?: MDAST.Root, opts?: IGetSummaryOpts) => string | void;
