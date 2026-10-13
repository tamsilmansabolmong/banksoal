(function () {
    const createPdf = async (data) => {
        if (typeof html2pdf !== 'function') throw new Error('Library pembuat PDF belum tersedia.');
        const wrapper = document.createElement('div');
        wrapper.className = 'pdf-export-root';
        wrapper.style.cssText = 'display:block;width:186mm;background:#fff;';
        wrapper.innerHTML = `<style>${ExamDocument.documentStyles}</style>${ExamDocument.buildExamHtml(data)}`;
        document.body.appendChild(wrapper);
        try {
            await Promise.all(Array.from(wrapper.querySelectorAll('img')).map((image) => {
                if (image.complete) return Promise.resolve();
                return new Promise((resolve) => {
                    image.onload = resolve;
                    image.onerror = resolve;
                });
            }));
            if (document.fonts?.ready) await document.fonts.ready;
            const options = {
                margin: [8, 12, 12, 12],
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2, useCORS: true, allowTaint: false, backgroundColor: '#ffffff', scrollY: 0 },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
                pagebreak: { mode: ['css', 'legacy'], avoid: ['.question'] }
            };
            const worker = html2pdf().set(options).from(wrapper);
            const canvas = await worker.toCanvas().get('canvas');
            const context = canvas.getContext('2d');
            if (!canvas.width || !canvas.height || !context) {
                throw new Error('Isi dokumen tidak berhasil dirender. Coba kembali membuat PDF.');
            }
            const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
            let hasVisibleContent = false;
            for (let index = 0; index < pixels.length; index += 16) {
                if (pixels[index] < 245 || pixels[index + 1] < 245 || pixels[index + 2] < 245) {
                    hasVisibleContent = true;
                    break;
                }
            }
            if (!hasVisibleContent) throw new Error('Hasil dokumen kosong. Periksa kembali isi ujian sebelum membuat PDF.');

            const blob = await worker.toPdf().outputPdf('blob');
            if (!(blob instanceof Blob) || !blob.size) throw new Error('PDF tidak terbentuk. Coba kembali setelah halaman selesai dimuat.');
            return blob;
        } finally {
            wrapper.remove();
        }
    };

    window.PdfExporter = { createPdf };
})();
