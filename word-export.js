(function () {
    const embedImage = async (source) => {
        if (!source) return '';
        const image = new Image();
        const imageUrl = source.startsWith('data:') ? source : new URL(source, document.baseURI).href;
        if (!imageUrl.startsWith('data:')) {
            const url = new URL(imageUrl);
            if (url.origin !== window.location.origin) image.crossOrigin = 'anonymous';
        }

        await new Promise((resolve, reject) => {
            image.onload = resolve;
            image.onerror = () => reject(new Error('Logo tidak dapat dimuat untuk disematkan ke dokumen Word.'));
            image.src = imageUrl;
        });
        if (!image.naturalWidth || !image.naturalHeight) {
            throw new Error('Berkas logo tidak memiliki ukuran gambar yang valid.');
        }

        const scale = Math.min(1, 512 / Math.max(image.naturalWidth, image.naturalHeight));
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(image.naturalWidth * scale);
        canvas.height = Math.round(image.naturalHeight * scale);
        const context = canvas.getContext('2d');
        if (!context) throw new Error('Logo tidak dapat diproses untuk dokumen Word.');
        context.drawImage(image, 0, 0, canvas.width, canvas.height);

        try {
            return canvas.toDataURL('image/png');
        } catch (error) {
            throw new Error(`Logo tidak dapat disematkan ke dokumen Word: ${error.message}`);
        }
    };

    const createWord = async (data) => {
        if (!window.ExamDocument) throw new Error('Komponen dokumen ujian belum tersedia.');
        const profile = {
            ...data.profile,
            logoUrl: data.options.includeKop ? await embedImage(data.profile.logoUrl) : ''
        };
        const documentContent = document.createElement('div');
        documentContent.innerHTML = ExamDocument.buildExamHtml({ ...data, profile });
        documentContent.querySelectorAll('.exam-document, .exam-document *').forEach((element) => {
            element.style.setProperty('font-size', '12pt', 'important');
        });
        documentContent.querySelectorAll('img.school-logo').forEach((logo) => {
            logo.setAttribute('width', '76');
            logo.setAttribute('height', '76');
            logo.style.setProperty('width', '56.7pt', 'important');
            logo.style.setProperty('height', '56.7pt', 'important');
        });
        const html = `<!doctype html><html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word">
            <head><meta charset="utf-8"><title>Naskah Ujian</title><style>
                @page { size: A4; margin: 8mm 12mm 12mm; }
                body { color: #111; background: #fff; font-family: "Times New Roman", serif; }
                ${ExamDocument.documentStyles}
                .school-logo { width: 56.7pt !important; height: 56.7pt !important; }
            </style></head><body>${documentContent.innerHTML}</body></html>`;
        const blob = new Blob(['\ufeff', html], { type: 'application/msword' });
        if (!blob.size) throw new Error('Dokumen Word tidak terbentuk.');
        return blob;
    };

    window.WordExporter = { createWord };
})();
