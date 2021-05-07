import { Dictionary } from '@stoplight/types';
export declare type AnnotationType = 'tab' | 'tab-end';
export declare type ThemeType = 'info' | 'warning' | 'danger' | 'success';
export interface IAnnotations<T extends Dictionary<any> = {}> {
    annotations?: T;
}
export declare type CodeAnnotations = {
    title?: string;
    resolved?: null | object;
    lineNumbers?: boolean;
    highlightLines?: number[] | number[][];
    json_schema?: boolean;
    http?: boolean;
};
