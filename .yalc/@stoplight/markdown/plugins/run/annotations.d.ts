import { MDAST } from '../../ast-types';
export declare function smdAnnotations(): (root: MDAST.Root) => {
    children: MDAST.Content[];
    type: "root";
    data?: import("unist").Data;
    position?: import("unist").Position;
};
