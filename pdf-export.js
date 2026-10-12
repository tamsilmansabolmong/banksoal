(function () {
    const createPdf = async (data) => {
        if (typeof html2pdf !== 'function') throw new Error('Library pembuat PDF belum tersedia.');
        const wrapper = document.createElement('div');
        wrapper.className = 'pdf-export-root';
        wrapper.style.cssText = 'position:fixed;left:-10000px;top:0;width:180mm;background:#fff;z-index:-1;';
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
                margin: [12, 0, 12, 0],
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2, useCORS: true, allowTaint: false, backgroundColor: '#ffffff', scrollY: 0 },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
                pagebreak: { mode: ['css', 'legacy'], avoid: ['.question'] }
            };
            const blob = await html2pdf().set(options).from(wrapper).outputPdf('blob');
            if (!(blob instanceof Blob) || !blob.size) throw new Error('PDF tidak terbentuk. Coba kembali setelah halaman selesai dimuat.');
            return blob;
        } finally {
            wrapper.remove();
        }
    };

    window.PdfExporter = { createPdf };
})();
