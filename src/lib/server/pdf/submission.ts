export interface submissionPDFTemplateData {
    submission: {
        title: string;
        localId: number;
        status: string;
        createdAt: string;
        abstract: string;
        keywords: string;
        authors: string[];
    };
    conference: {
        short_name: string;
    };
    topic: {
        name: string;
    };
}
