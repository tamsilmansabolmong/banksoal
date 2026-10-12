(function () {
    const createWord = (data) => {
        if (!window.ExamDocument) throw new Error('Komponen dokumen ujian belum tersedia.');
        const html = `<!doctype html><html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word">
            <head><meta charset="utf-8"><title>Naskah Ujian</title><style>
                @page { size: A4; margin: 15mm; }
                body { color: #111; background: #fff; font-family: "Times New Roman", serif; }
                ${ExamDocument.documentStyles}
            </style></head><body>${ExamDocument.buildExamHtml(data)}</body></html>`;
        const blob = new Blob(['\ufeff', html], { type: 'application/msword' });
        if (!blob.size) throw new Error('Dokumen Word tidak terbentuk.');
        return blob;
    };

    window.WordExporter = { createWord };
})();
