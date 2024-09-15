import { readFile } from "fs/promises";
import { render } from "ejs";
export const enum EmailTemplates {
    registration = "registration.html",
}
export const readEmailTemplate = async (template: EmailTemplates) => {
    return await readFile(
        `src/lib/email/templates/${template.toString()}`,
        "utf-8",
    );
};

export const renderTemplateString = (templateString: string, data: object) => {
    return render(templateString, data);
};

export const renderEmailTemplate = async (
    template: EmailTemplates,
    data: object,
) => {
    const templateString = await readEmailTemplate(template);
    return renderTemplateString(templateString, data);
};
