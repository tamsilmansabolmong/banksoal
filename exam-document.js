(function () {
    const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (character) => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    })[character]);

    const safeQuestionHtml = (html) => {
        const container = document.createElement('div');
        container.innerHTML = html || '';
        container.querySelectorAll('script, iframe, object, embed, form').forEach((element) => element.remove());
        container.querySelectorAll('*').forEach((element) => {
            Array.from(element.attributes).forEach((attribute) => {
                if (/^on/i.test(attribute.name) || (/^(href|src)$/i.test(attribute.name) && /^\s*javascript:/i.test(attribute.value))) {
                    element.removeAttribute(attribute.name);
                }
            });
        });
        return container.innerHTML;
    };

    const dateLabel = (value) => {
        if (!value) return '-';
        const parts = value.split('-');
        return parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : escapeHtml(value);
    };

    const renderQuestions = (questions, kinds, heading, showOptions) => {
        const group = questions.filter((question) => kinds.includes(question.jenisSoal));
        if (!group.length) return '';

        return `<section class="question-section">
            <h2>${heading}</h2>
            <ol>${group.map((question) => `<li class="question">
                <div class="question-text">${safeQuestionHtml(question.pertanyaanHtml)}</div>
                ${showOptions && question.opsi && Object.keys(question.opsi).length
                    ? `<div class="options">${Object.entries(question.opsi).map(([key, value]) => `<div><b>${escapeHtml(key)}.</b> ${escapeHtml(value)}</div>`).join('')}</div>`
                    : ''}
                ${question.jenisSoal === 'Benar Salah' ? '<p class="true-false">Lingkari jawaban: &nbsp; [ BENAR ] &nbsp; / &nbsp; [ SALAH ]</p>' : ''}
                ${question.jenisSoal !== 'PG' && question.jenisSoal !== 'Soal Cerita' && question.jenisSoal !== 'Benar Salah'
                    ? '<div class="answer-lines"></div>'
                    : ''}
            </li>`).join('')}</ol>
        </section>`;
    };

    const buildExamHtml = ({ profile, examConfig, questions, options }) => {
        const selected = questions || [];
        const answers = options.includeKunci
            ? `<section class="answer-key">
                <h2>KUNCI JAWABAN DAN PEDOMAN PENILAIAN</h2>
                <table><thead><tr><th>No.</th><th>Jenis Soal</th><th>Kunci / Pedoman</th></tr></thead><tbody>
                    ${selected.map((question, index) => `<tr><td>${index + 1}</td><td>${escapeHtml(question.jenisSoal)}</td><td>${escapeHtml(question.kunciJawaban || '-')}</td></tr>`).join('')}
                </tbody></table>
            </section>`
            : '';

        const signatures = options.includeTTDKepsek || options.includeTTDGuru
            ? `<table class="signatures"><tbody><tr>
                ${options.includeTTDKepsek ? `<td><p>Mengetahui,</p><p>Kepala ${escapeHtml(profile.namaSekolah)}</p><div class="signature-space"></div><strong>${escapeHtml(profile.namaKepsek)}</strong><p>NIP. ${escapeHtml(profile.nipKepsek)}</p></td>` : ''}
                ${options.includeTTDGuru ? `<td><p>${escapeHtml(examConfig.mapel)},</p><p>Guru Mata Pelajaran</p><div class="signature-space"></div><strong>${escapeHtml(profile.namaGuru)}</strong><p>NIP. ${escapeHtml(profile.nikNip)}</p></td>` : ''}
            </tr></tbody></table>`
            : '';

        return `<article class="exam-document">
            ${options.includeKop ? `<header class="letterhead">
                ${profile.logoUrl ? `<img class="school-logo" src="${escapeHtml(profile.logoUrl)}" alt="Logo sekolah">` : ''}
                <div class="school-heading">
                    <div class="institution">${escapeHtml(profile.instansi)}</div>
                    <div class="school-name">${escapeHtml(profile.namaSekolah)}</div>
                    <div class="school-address">${escapeHtml(profile.alamatSekolah)}</div>
                </div>
            </header>` : ''}
            <section class="exam-identity">
                <h1>${escapeHtml(examConfig.asesmen)}<br>SEMESTER ${escapeHtml(examConfig.semester).toUpperCase()} TAHUN AJARAN ${escapeHtml(examConfig.tahunAjaran)}</h1>
                <table><tbody>
                    <tr><th>Mata Pelajaran</th><td>${escapeHtml(examConfig.mapel)}</td><th>Kelas</th><td>${escapeHtml((examConfig.targetKelas || []).join(', '))}</td></tr>
                    <tr><th>Hari / Tanggal</th><td>${dateLabel(examConfig.tanggalUjian)}</td><th>Waktu</th><td>${escapeHtml(examConfig.durasi)}</td></tr>
                    <tr><th>Nama Peserta</th><td colspan="3">....................................................................................................</td></tr>
                    <tr><th>Nomor Peserta</th><td colspan="3">....................................................................................................</td></tr>
                </tbody></table>
            </section>
            <section class="instructions"><strong>Petunjuk Umum</strong>
                <ol><li>Berdoalah sebelum mengerjakan.</li><li>Tuliskan identitas pada tempat yang telah disediakan.</li><li>Bacalah setiap soal dengan teliti sebelum menjawab.</li></ol>
            </section>
            ${renderQuestions(selected, ['PG', 'Soal Cerita'], 'I. PILIHAN GANDA', true)}
            ${renderQuestions(selected, ['Benar Salah'], 'II. BENAR / SALAH', false)}
            ${renderQuestions(selected, selected.filter((question) => !['PG', 'Soal Cerita', 'Benar Salah'].includes(question.jenisSoal)).map((question) => question.jenisSoal), 'III. URAIAN', false)}
            ${answers}
            ${signatures}
        </article>`;
    };

    const documentStyles = `
        * { box-sizing: border-box; }
        .exam-document { width: 180mm; margin: 0 auto; color: #111; background: #fff; font-family: "Times New Roman", serif; font-size: 11pt; line-height: 1.38; }
        .exam-document p { margin: 0 0 4pt; }
        .letterhead { display: table; width: 100%; border-bottom: 3px double #111; padding: 0 0 9pt; margin: 0 0 15pt; }
        .school-logo { display: table-cell; width: 62pt; height: 62pt; object-fit: contain; vertical-align: middle; }
        .school-heading { display: table-cell; width: 100%; text-align: center; vertical-align: middle; padding: 0 8pt; }
        .institution { font-size: 10pt; font-weight: bold; letter-spacing: .4pt; text-transform: uppercase; }
        .school-name { font-size: 16pt; font-weight: bold; text-transform: uppercase; margin: 3pt 0; }
        .school-address { font-size: 9pt; }
        .exam-identity { margin: 0 0 12pt; }
        .exam-identity h1 { margin: 0; padding: 7pt; border: 1px solid #111; border-bottom: 0; text-align: center; font-size: 12pt; line-height: 1.35; }
        .exam-document table { width: 100%; border-collapse: collapse; }
        .exam-identity th, .exam-identity td, .answer-key th, .answer-key td { border: 1px solid #333; padding: 5pt 6pt; text-align: left; vertical-align: top; }
        .exam-identity th { width: 18%; white-space: nowrap; }
        .instructions { border: 1px solid #999; padding: 7pt 9pt; margin: 0 0 15pt; font-size: 10pt; }
        .instructions ol { margin: 3pt 0 0 16pt; padding: 0; }
        .question-section { margin: 0 0 15pt; }
        .question-section h2, .answer-key h2 { font-size: 11pt; border-bottom: 1px solid #555; padding: 0 0 4pt; margin: 0 0 9pt; }
        .question-section ol { margin: 0 0 0 22pt; padding: 0; }
        .question { padding: 0 0 8pt 3pt; page-break-inside: avoid; break-inside: avoid; text-align: justify; }
        .question-text p { margin: 0 0 3pt; }
        .options { display: grid; grid-template-columns: 1fr 1fr; gap: 2pt 14pt; margin: 4pt 0 0 14pt; font-size: 10.5pt; }
        .true-false { margin: 5pt 0 0 14pt !important; font-size: 10pt; font-weight: bold; }
        .answer-lines { height: 38pt; border-bottom: 1px dotted #888; margin: 5pt 0 0; }
        .answer-key { page-break-before: always; margin-top: 18pt; font-size: 10pt; }
        .answer-key h2 { text-align: center; }
        .answer-key td:first-child, .answer-key th:first-child { width: 9%; text-align: center; }
        .signatures { margin: 28pt 0 0; page-break-inside: avoid; }
        .signatures td { width: 50%; border: 0; padding: 0 10pt; text-align: center; vertical-align: top; }
        .signature-space { height: 54pt; }
        .signatures strong { text-decoration: underline; }
        @media screen { .exam-document { padding: 0; } }
    `;

    window.ExamDocument = { buildExamHtml, documentStyles };
})();
