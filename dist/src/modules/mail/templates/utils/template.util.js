"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TemplateUtil = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const handlebars_1 = __importDefault(require("handlebars"));
class TemplateUtil {
    static compile(templateName, data) {
        const mainDir = path_1.default.join(process.cwd());
        const templateHtml = fs_1.default.readFileSync(`${mainDir}/src/modules/mail/templates/${templateName}.hbs`, "utf-8");
        const compiledTemplateHtml = handlebars_1.default.compile(templateHtml);
        return compiledTemplateHtml(data);
    }
}
exports.TemplateUtil = TemplateUtil;
//# sourceMappingURL=template.util.js.map