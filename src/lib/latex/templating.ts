import { readFile, mkdir, writeFile } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { randomBytes } from "crypto";
import { execSync } from "child_process";

export const enum latexTemplates {
    submission = "submission.tex",
}
export const readLatexTemplate = async (template: latexTemplates) => {
    return await readFile(`latex/templates/${template}`, "utf-8");
};
interface IIgnorableCharacters {
    "[": boolean;
    "]": boolean;
    "&": boolean;
    "%": boolean;
    $: boolean;
    "#": boolean;
    _: boolean;
    "{": boolean;
    "}": boolean;
    "~": boolean;
    "^": boolean;
}
const ignoreCharacters: IIgnorableCharacters = {
    "[": false,
    "]": false,
    "&": false,
    "%": false,
    $: false,
    "#": false,
    _: false,
    "{": false,
    "}": false,
    "~": false,
    "^": false,
};
function cleanValue(
    value: string,
    ignore: IIgnorableCharacters = ignoreCharacters,
) {
    ignore = { ...ignoreCharacters, ...ignore };
    Object.entries(ignore).forEach(([character, ignore]) => {
        if (!ignore) {
            value = value.replaceAll(character, `\\${character}`);
        }
    });
    return value;
}
function replaceSingleValue(
    content: string,
    key: string,
    value: string | number,
    clean: boolean = true,
) {
    const regex = new RegExp(`<!=\\s*${key}\\s*=>`, "g");
    value = String(value);
    return content.replaceAll(regex, clean ? cleanValue(value) : value);
}
function recursiveFormArray(array: Array<any>) {
    array.forEach((element, i) => {
        if (!Array.isArray(element)) array[i] = `{${cleanValue(element)}}`;
        else array[i] = recursiveFormArray(element);
    });
    // array = array.map((element) => `{${cleanValue(element)}}`);
    return `{${array.join(", ")}}`;
}
export const recursiveReplace = (
    content: string,
    data: object,
    context: Array<string> = [],
) => {
    Object.keys(data).forEach((key) => {
        if (Array.isArray(data[key])) {
            content = replaceSingleValue(
                content,
                context.length ? context.join(".") + "." + key : key,
                recursiveFormArray(data[key]),
                false,
            );
        } else if (typeof data[key] == "object") {
            content = recursiveReplace(
                content,
                data[key],
                context.concat([key]),
            );
        } else {
            content = replaceSingleValue(
                content,
                context.length ? context.join(".") + "." + key : key,
                data[key],
            );
        }
    });

    return content;
};
const generatePDFFile = async () => {};
const generatePDFBytes = async (data: object, template: latexTemplates) => {
    const templateContent = await readLatexTemplate(template);
    const name = randomBytes(16).toString("hex");
    if (!existsSync("latex/temp")) await mkdir("latex/temp");
    await mkdir(`latex/temp/${name}`);
    const content = recursiveReplace(templateContent, data);
    await writeFile(`latex/temp/${name}/${name}.tex`, content);

    execSync(
        `latexmk --quiet -f --pdf latex/temp/${name}/${name}.tex -outdir=latex/temp/${name}`,
    );

    let output: Buffer;
    try {
        console.log(path.join("latex", "temp", name, `${name}.pdf`));
        output = await readFile(
            path.join("latex/temp/", name, String(name) + ".pdf"),
        );
    } catch (error) {
        console.log(error);
        execSync(`rm -rf latex/temp/${name}`);
        return null;
    }
    execSync(`rm -rf latex/temp/${name}`);
    return output;
};
export interface submissionPDFData {
    submission: {
        title: string;
        localId: number;
        status: string;
        createdAt: string;
        abstract: string;
        keywords: string[];
        authors: string[];
    };
    topic: {
        name: string;
    };
}
export const generateSubmissionPDFBytes = async (data: submissionPDFData) => {
    return generatePDFBytes(data, latexTemplates.submission);
};
