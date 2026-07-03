import fs from "fs";
import path from "path";
import Handlebars from "handlebars";

export class TemplateUtil {
  static compile(templateName: string, data: any) {
    const mainDir = path.join(process.cwd());

    const templateHtml = fs.readFileSync(
      `${mainDir}/src/modules/mail/templates/${templateName}.hbs`,
      "utf-8",
    );

    const compiledTemplateHtml = Handlebars.compile(templateHtml);

    return compiledTemplateHtml(data);
  }
}