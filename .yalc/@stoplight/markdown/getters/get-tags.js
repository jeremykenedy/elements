"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTags = void 0;
const frontmatter_1 = require("../frontmatter");
const getTags = (data) => {
    const tags = [];
    if (data) {
        try {
            const frontmatter = new frontmatter_1.Frontmatter(data, true);
            const dataTags = frontmatter.get('tags');
            if (dataTags && Array.isArray(dataTags)) {
                return dataTags.reduce((filteredTags, tag) => {
                    if (tag && typeof tag === 'string' && tag !== 'undefined' && tag !== 'null') {
                        filteredTags.push(String(tag));
                    }
                    return filteredTags;
                }, []);
            }
        }
        catch (e) {
            console.warn('Error getting tags from markdown document', e);
        }
    }
    return tags;
};
exports.getTags = getTags;
//# sourceMappingURL=get-tags.js.map