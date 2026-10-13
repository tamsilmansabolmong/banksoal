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
        if (!value) return '....................................';
        const parts = value.split('-');
        return parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : escapeHtml(value);
    };

    const renderQuestions = (questions, kinds, heading, showOptions) => {
        const group = questions.filter((question) => kinds.includes(question.jenisSoal));
        if (!group.length) return '';

        return `<section class="question-section">
            <h2 class="section-heading">${heading}</h2>
            <ol>${group.map((question) => `<li class="question">
                <div class="question-text">${safeQuestionHtml(question.pertanyaanHtml)}</div>${showOptions && question.opsi && Object.keys(question.opsi).length
                    ? `<div class="options">${Object.entries(question.opsi).map(([key, value]) => `<div class="option-item"><span class="option-key">${escapeHtml(key)}.</span><span class="option-val">${escapeHtml(value)}</span></div>`).join('')}</div>`
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
                ${options.includeTTDKepsek ? `<td><p>Mengetahui,</p><p>Kepala ${escapeHtml(profile.namaSekolah)}</p><div class="signature-space"></div><strong>${escapeHtml(profile.namaKepsek)}</strong><p>NIP.${escapeHtml(profile.nipKepsek)}</p></td>` : ''}
                ${options.includeTTDGuru ? `<td><p>${escapeHtml(examConfig.mapel)},</p><p>Guru Mata Pelajaran</p><div class="signature-space"></div><strong>${escapeHtml(profile.namaGuru)}</strong><p>NIP.${escapeHtml(profile.nikNip)}</p></td>` : ''}
            </tr></tbody></table>`
            : '';

        const examTitle = `SOAL ${escapeHtml(String(examConfig.asesmen ?? '').toUpperCase())} ${examConfig.semester ? 'SEMESTER ' + escapeHtml(String(examConfig.semester ?? '').toUpperCase()) : ''} T.P. ${escapeHtml(examConfig.tahunAjaran)}`;

        return `<article class="exam-document">
            ${options.includeKop ? `<header class="letterhead${profile.logoUrl ? '' : ' no-logo'}">
                <table><tbody><tr>
                    ${profile.logoUrl ? `<td class="logo-cell"><img class="school-logo" src="${escapeHtml(profile.logoUrl)}" alt="Logo sekolah" width="76" height="76" style="width:56.7pt;height:56.7pt;"></td>` : ''}
                    <td class="school-heading">
                        <div class="institution">${escapeHtml(profile.instansi)}</div>
                        <div class="school-name">${escapeHtml(profile.namaSekolah)}</div>${profile.alamatSekolah ? `<div class="school-address">${escapeHtml(profile.alamatSekolah)}</div>` : ''}
                        <div class="exam-title">${examTitle}</div>
                    </td>
                </tr></tbody></table>
            </header>` : `<h1 class="standalone-exam-title">${examTitle}</h1>`}
            <section class="exam-identity">
                <table><tbody>
                    <tr>
                        <td class="lbl">Nama</td><td class="col">:</td><td class="val">....................................</td>
                        <td class="lbl">Mata Pelajaran</td><td class="col">:</td><td class="val">${escapeHtml(examConfig.mapel)}</td>
                    </tr>
                    <tr>
                        <td class="lbl">Hari / Tanggal</td><td class="col">:</td><td class="val">${dateLabel(examConfig.tanggalUjian)}</td>
                        <td class="lbl">Waktu</td><td class="col">:</td><td class="val">${escapeHtml(examConfig.durasi || '')}</td>
                    </tr>
                    <tr>
                        <td class="lbl">Kelas</td><td class="col">:</td><td class="val">${escapeHtml((examConfig.targetKelas || []).join(', '))}</td>
                        <td class="lbl"></td><td class="col"></td><td class="val"></td>
                    </tr>
                </tbody></table>
            </section>
            <section class="instructions">
                <div class="instructions-title">PETUNJUK PENGERJAAN</div>
                <ol>
                    <li>Isikan identitas anda dalam format lembar jawaban dengan teliti dan benar</li>
                    <li>Periksalah naskah soal yang anda terima, apabila halamannya tidak lengkap minta ganti pada pengawas ruang ujian</li>
                    <li>Baca dan pahamilah dengan baik pernyataan atau soal sebelum anda menjawab</li>
                    <li>Periksalah pekerjaan anda sebelum diserahkan Kepada pengawas ujian</li>
                </ol>
            </section>
            ${renderQuestions(selected, ['PG', 'Soal Cerita'], 'I. &nbsp;&nbsp;&nbsp;&nbsp; Jawablah soal - soal dengan benar, dengan memberi lingkaran pada pilihan jawaban anda!', true)}
            ${renderQuestions(selected, ['Benar Salah'], 'II. &nbsp;&nbsp;&nbsp;&nbsp; BENAR / SALAH', false)}
            ${renderQuestions(selected, selected.filter((question) => !['PG', 'Soal Cerita', 'Benar Salah'].includes(question.jenisSoal)).map((question) => question.jenisSoal), 'III. &nbsp;&nbsp;&nbsp;&nbsp; URAIAN', false)}
            ${answers}
            ${signatures}
        </article>`;
    };

    const documentStyles = `
        * { box-sizing: border-box; }
        .exam-document, .exam-document * { font-size: 11.5pt; }
        .exam-document { width: 100%; max-width: 210mm; margin: 0 auto; color: #000; background: #fff; font-family: "Times New Roman", Times, serif; line-height: 1.3; padding: 0; }
        .exam-document p { margin: 0 0 3pt; }
        .exam-document table { width: 100%; border-collapse: collapse; }
        
        /* Kop Surat */
        .letterhead { border-bottom: 1.5px solid #000; padding-bottom: 6pt; margin-bottom: 8pt; }
        .letterhead td { border: 0; padding: 0; vertical-align: middle; }
        .letterhead .logo-cell { width: 70pt; vertical-align: middle; }
        .school-logo { display: block; width: 56.7pt; height: 56.7pt; object-fit: contain; }
        .school-heading { text-align: center; }
        .institution { font-weight: bold; text-transform: uppercase; font-size: 11.5pt; }
        .school-name { font-weight: bold; text-transform: uppercase; margin: 1pt 0; font-size: 12pt; }
        .school-address { margin-bottom: 2pt; font-size: 10.5pt; }
        .exam-title { font-weight: bold; text-transform: uppercase; font-size: 11.5pt; }
        .standalone-exam-title { margin: 0 0 8pt; text-align: center; font-weight: bold; }
        
        /* Identitas Ujian */
        .exam-identity { margin: 0 0 6pt; padding: 0 0 4pt; border-bottom: none; }
        .exam-identity table { width: 100%; table-layout: fixed; }
        .exam-identity td { padding: 1.5pt 0; vertical-align: middle; }
        .exam-identity td.lbl { width: 16%; font-weight: normal; white-space: nowrap; }
        .exam-identity td.col { width: 2%; text-align: center; }
        .exam-identity td.val { width: 32%; overflow-wrap: anywhere; }
        
        /* Petunjuk Pengerjaan */
        .instructions { border-bottom: 1.5px solid #000; padding-bottom: 8pt; margin-bottom: 10pt; }
        .instructions-title { font-weight: bold; margin-bottom: 4pt; text-transform: uppercase; }
        .instructions ol { margin: 0 0 0 20pt; padding: 0; }
        .instructions li { padding-left: 2pt; margin-bottom: 1.5pt; line-height: 1.25; }
        
        /* Soal */
        .question-section { margin-bottom: 12pt; }
        .question-section h2.section-heading { font-weight: bold; border-bottom: none; padding: 0; margin: 0 0 8pt 0; text-align: left; text-transform: none; font-size: 11.5pt; }
        .question-section ol { margin: 0 0 0 20pt; padding: 0; }
        .question { padding: 0 0 6pt 0; page-break-inside: avoid; break-inside: avoid; text-align: justify; }
        .question-text { display: block; margin-bottom: 3pt; }
        
        /* Opsi Jawaban */
        .options { margin: 2pt 0 4pt 0; }
        .option-item { margin-bottom: 2pt; display: flex; align-items: flex-start; }
        .option-key { display: inline-block; font-weight: normal; flex-shrink: 0; margin-right: 2pt; }
        .option-val { flex: 1; }
        
        .true-false { margin: 5pt 0 0 0 !important; font-weight: bold; }
        .answer-lines { height: 38pt; border-bottom: 1px dotted #888; margin-top: 5pt; }
        
        /* Kunci Jawaban & TTD */
        .answer-key { page-break-before: always; break-before: page; margin-top: 18pt; }
        .answer-key h2 { text-align: center; border-bottom: none; margin-bottom: 8pt; }
        .answer-key td, .answer-key th { border: 1px solid #333; padding: 5pt 6pt; text-align: left; vertical-align: top; }
        .answer-key td:first-child, .answer-key th:first-child { width: 9%; text-align: center; }
        .signatures { margin-top: 28pt; page-break-inside: avoid; break-inside: avoid; }
        .signatures td { width: 50%; border: 0; padding: 0 10pt; text-align: center; vertical-align: top; }
        .signature-space { height: 54pt; }
        .signatures strong { text-decoration: underline; }
        
        @media print {
            .exam-document { padding: 0; width: 100%; }
        }
    `;

    window.ExamDocument = { buildExamHtml, documentStyles };
})();