"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = validate;
function validate(schema, data, useSafeParse = false) {
    if (useSafeParse) {
        const result = schema.safeParse(data);
        if (!result.success) {
            throw result.error;
        }
        return result.data;
    }
    return schema.parse(data);
}
//# sourceMappingURL=validation.js.map