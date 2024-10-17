import PdfPrinter from "pdfmake";
import { fonts } from "./fonts";
export const generatePDFStream = async (
    documentDefinition: any,
): Promise<Buffer> => {
    const printer = new PdfPrinter(fonts);
    const doc = printer.createPdfKitDocument(documentDefinition);

    return new Promise((resolve, reject) => {
        try {
            var chunks = [];
            doc.on("data", (chunk) => chunks.push(chunk));
            doc.on("end", () => resolve(Buffer.concat(chunks)));
            doc.end();
        } catch (err) {
            reject(err);
        }
    });
};
