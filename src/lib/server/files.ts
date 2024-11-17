import { mkdir, readFile, writeFile } from "fs/promises";
import prisma from "../database/prisma";
import { existsSync } from "node:fs";
import { basename, extname, join, parse } from "path";

export const uploadFile = async (
    buffer: ArrayBuffer,
    directory: string,
    originalName: string,
    uploadedBy?: number,
    options: {
        createDirs: boolean;
    } = {
        createDirs: false,
    },
) => {
    if (!existsSync(directory)) {
        await mkdir(directory, { recursive: true });
    }
    const fileId = crypto.randomUUID();
    const fileName = `${fileId}${extname(originalName)}`;
    const filePath = join(directory, fileName);

    await writeFile(filePath, Buffer.from(buffer));
    const file = await prisma.uploadedFile.create({
        data: {
            id: fileId,
            path: filePath,
            file_name: parse(originalName).name,
            original_name: basename(originalName),
            uploaded_by_id: uploadedBy,
        },
    });
    return file;
};

export const getUploadedFile = async (fileId: string) => {
    const file = await prisma.uploadedFile.findFirst({
        where: {
            id: fileId,
        },
    });
    if (!existsSync(join(file.path))) {
        return null;
    }
    const outputFile = {
        ...file,
        buffer: await readFile(file.path),
    };
    return outputFile;
};
