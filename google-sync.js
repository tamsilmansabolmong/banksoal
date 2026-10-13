(function () {
    const STORAGE_KEY = 'google_workspace_accounts';
    const CLIENT_ID_KEY = 'google_oauth_client_id';
    const SHEET_HEADERS = {
        profile: ['NIK_NIP', 'Nama_Guru', 'Username', 'Password_Tidak_Digunakan', 'Nama_Kepsek', 'NIP_Kepsek', 'Nama_Sekolah', 'Alamat_Sekolah', 'Instansi', 'Logo_URL', 'Mapel_JSON', 'Kelas_JSON'],
        questions: ['ID_Soal', 'NIK_NIP_Guru', 'Mapel', 'Kelas', 'Jenis_Soal', 'Pertanyaan_HTML', 'Opsi_JSON', 'Kunci_Jawaban', 'Created_At']
    };
    const SCOPES = 'openid email profile https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive.file';
    let accountConfigs = loadAccountConfigs();
    let clientId = window.BANK_SOAL_GOOGLE_CLIENT_ID || localStorage.getItem(CLIENT_ID_KEY) || '';
    let config = emptyConfig();
    let accessToken = null;
    let tokenClient = null;
    let identity = null;

    function emptyConfig() {
        return { clientId, spreadsheetId: '', driveFolderId: '', spreadsheetUrl: '', driveFolderUrl: '' };
    }

    function loadAccountConfigs() {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
        } catch (error) {
            console.error('Konfigurasi akun Google rusak:', error);
            return {};
        }
    }

    function saveConfig(nextConfig) {
        config = { ...config, ...nextConfig };
        if (nextConfig.clientId) {
            clientId = nextConfig.clientId;
            localStorage.setItem(CLIENT_ID_KEY, clientId);
        }
        if (identity?.email) {
            accountConfigs[identity.email] = {
                spreadsheetId: config.spreadsheetId,
                driveFolderId: config.driveFolderId,
                spreadsheetUrl: config.spreadsheetUrl,
                driveFolderUrl: config.driveFolderUrl
            };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(accountConfigs));
        }
        return { ...config };
    }

    function waitForGoogleIdentity() {
        return new Promise((resolve, reject) => {
            const startedAt = Date.now();
            const check = () => {
                if (window.google?.accounts?.oauth2) return resolve(window.google.accounts.oauth2);
                if (Date.now() - startedAt > 10000) return reject(new Error('Layanan Google Identity belum termuat. Periksa koneksi internet lalu muat ulang aplikasi.'));
                window.setTimeout(check, 100);
            };
            check();
        });
    }

    async function connect({ loginHint = '' } = {}) {
        const selectedClientId = (window.BANK_SOAL_GOOGLE_CLIENT_ID || clientId || '').trim();
        if (!selectedClientId) throw new Error('Login Google belum dikonfigurasi. Hubungi pengelola aplikasi.');
        clientId = selectedClientId;
        localStorage.setItem(CLIENT_ID_KEY, selectedClientId);
        const oauth = await waitForGoogleIdentity();

        return new Promise((resolve, reject) => {
            let settled = false;
            const finish = (callback, value) => {
                if (settled) return;
                settled = true;
                callback(value);
            };
            tokenClient = oauth.initTokenClient({
                client_id: selectedClientId,
                scope: SCOPES,
                callback: async (response) => {
                    if (response.error) return finish(reject, new Error(response.error_description || response.error));
                    accessToken = response.access_token;
                    try {
                        const user = await api('https://www.googleapis.com/oauth2/v3/userinfo');
                        identity = { email: user.email || '', name: user.name || '' };
                        config = {
                            ...emptyConfig(),
                            ...(accountConfigs[identity.email] || {})
                        };
                        finish(resolve, identity);
                    } catch (error) {
                        finish(reject, error);
                    }
                },
                error_callback: (error) => finish(reject, new Error(error.message || 'Login Google dibatalkan.'))
            });
            tokenClient.requestAccessToken({ prompt: '', ...(loginHint ? { hint: loginHint } : {}) });
        });
    }

    function disconnect() {
        if (accessToken && window.google?.accounts?.oauth2) {
            window.google.accounts.oauth2.revoke(accessToken);
        }
        accessToken = null;
        identity = null;
    }

    function endSession() {
        accessToken = null;
        identity = null;
        tokenClient = null;
    }

    function requireToken() {
        if (!accessToken) throw new Error('Hubungkan akun Google terlebih dahulu.');
        return accessToken;
    }

    async function api(url, options = {}) {
        const token = requireToken();
        const response = await fetch(url, {
            ...options,
            headers: { Authorization: `Bearer ${token}`, ...(options.headers || {}) }
        });
        const body = await response.text();
        let data = {};
        if (body) {
            try {
                data = JSON.parse(body);
            } catch {
                throw new Error(`Google API mengembalikan respons yang tidak valid (${response.status}).`);
            }
        }
        if (!response.ok) {
            throw new Error(data.error?.message || `Permintaan Google gagal (${response.status}).`);
        }
        return data;
    }

    async function createWorkspace() {
        requireToken();
        const spreadsheet = await api('https://sheets.googleapis.com/v4/spreadsheets', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                properties: { title: 'Bank Soal Madrasah' },
                sheets: [{ properties: { title: 'Profil' } }, { properties: { title: 'BankSoal' } }]
            })
        });
        saveConfig({
            spreadsheetId: spreadsheet.spreadsheetId,
            spreadsheetUrl: spreadsheet.spreadsheetUrl
        });

        try {
            await api(`https://www.googleapis.com/drive/v3/files`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: 'Dokumen Bank Soal',
                    mimeType: 'application/vnd.google-apps.folder'
                })
            }).then((folder) => saveConfig({
                driveFolderId: folder.id,
                driveFolderUrl: `https://drive.google.com/drive/folders/${folder.id}`
            }));

            await api(`https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(spreadsheet.spreadsheetId)}/values:batchUpdate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    valueInputOption: 'RAW',
                    data: [
                        { range: 'Profil!A1:L1', values: [SHEET_HEADERS.profile] },
                        { range: 'BankSoal!A1:I1', values: [SHEET_HEADERS.questions] }
                    ]
                })
            });
        } catch (error) {
            throw new Error(`Spreadsheet berhasil dibuat, tetapi penyiapan folder/kolom gagal: ${error.message}`);
        }
        return { ...config };
    }

    async function findWorkspace() {
        requireToken();
        const params = new URLSearchParams({
            q: "trashed = false and name = 'Bank Soal Madrasah' and mimeType = 'application/vnd.google-apps.spreadsheet'",
            orderBy: 'createdTime desc',
            pageSize: '10',
            fields: 'files(id,name,webViewLink,createdTime)'
        });
        const files = await api(`https://www.googleapis.com/drive/v3/files?${params}`);
        const spreadsheet = files.files?.[0];
        if (!spreadsheet) return null;

        const foldersQuery = new URLSearchParams({
            q: "trashed = false and name = 'Dokumen Bank Soal' and mimeType = 'application/vnd.google-apps.folder'",
            orderBy: 'createdTime desc',
            pageSize: '10',
            fields: 'files(id,name,webViewLink,createdTime)'
        });
        const folders = await api(`https://www.googleapis.com/drive/v3/files?${foldersQuery}`);
        const folder = folders.files?.[0];
        saveConfig({
            spreadsheetId: spreadsheet.id,
            spreadsheetUrl: spreadsheet.webViewLink || `https://docs.google.com/spreadsheets/d/${spreadsheet.id}/edit`,
            driveFolderId: folder?.id || '',
            driveFolderUrl: folder?.webViewLink || (folder ? `https://drive.google.com/drive/folders/${folder.id}` : '')
        });
        return { ...config };
    }

    function spreadsheetUrl(id, range) {
        if (!id) throw new Error('Spreadsheet belum dibuat. Buat ruang kerja Google terlebih dahulu.');
        const path = `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(id)}/values/${encodeURIComponent(range)}`;
        return path;
    }

    async function loadAll() {
        requireToken();
        if (!config.spreadsheetId) throw new Error('Spreadsheet belum ditemukan untuk akun ini.');
        const params = new URLSearchParams();
        params.append('ranges', 'Profil!A2:L2');
        params.append('ranges', 'BankSoal!A2:I');
        const response = await api(`https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(config.spreadsheetId)}/values:batchGet?${params}`);
        const profileRow = response.valueRanges?.[0]?.values?.[0];
        const questionRows = response.valueRanges?.[1]?.values || [];
        const profile = profileRow ? {
            nikNip: profileRow[0] || '',
            namaGuru: profileRow[1] || '',
            username: profileRow[2] || '',
            namaKepsek: profileRow[4] || '',
            nipKepsek: profileRow[5] || '',
            namaSekolah: profileRow[6] || '',
            alamatSekolah: profileRow[7] || '',
            instansi: profileRow[8] || '',
            logoUrl: profileRow[9] || '',
            mapelList: parseJsonCell(profileRow[10], []),
            kelasList: parseJsonCell(profileRow[11], [])
        } : null;
        const bankSoal = questionRows.filter((row) => row[0]).map((row) => ({
            id: row[0],
            nikNipGuru: row[1] || '',
            mapel: row[2] || '',
            kelas: row[3] || '',
            jenisSoal: row[4] || '',
            pertanyaanHtml: row[5] || '',
            opsi: parseJsonCell(row[6], {}),
            kunciJawaban: row[7] || '',
            createdAt: row[8] || ''
        }));
        return { profile, bankSoal };
    }

    function parseJsonCell(value, fallback) {
        if (!value) return fallback;
        try {
            return JSON.parse(value);
        } catch (error) {
            throw new Error(`Data Google Sheet tidak valid: ${error.message}`);
        }
    }

    async function updateValues(range, values) {
        const url = `${spreadsheetUrl(config.spreadsheetId, range)}?valueInputOption=RAW`;
        return api(url, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ range, majorDimension: 'ROWS', values })
        });
    }

    async function saveProfile(profile) {
        const row = [
            profile.nikNip, profile.namaGuru, profile.username, '',
            profile.namaKepsek, profile.nipKepsek, profile.namaSekolah, profile.alamatSekolah,
            profile.instansi, profile.logoUrl, JSON.stringify(profile.mapelList || []), JSON.stringify(profile.kelasList || [])
        ];
        return updateValues('Profil!A2:L2', [row]);
    }

    async function addQuestion(question) {
        const url = `${spreadsheetUrl(config.spreadsheetId, 'BankSoal!A:I')}:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`;
        return api(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                majorDimension: 'ROWS',
                values: [[question.id, question.nikNipGuru, question.mapel, question.kelas, question.jenisSoal, question.pertanyaanHtml, JSON.stringify(question.opsi || {}), question.kunciJawaban, question.createdAt]]
            })
        });
    }

    async function uploadExport(blob, fileName) {
        requireToken();
        if (!config.driveFolderId) throw new Error('Folder Drive belum tersedia. Buat ruang kerja Google terlebih dahulu.');
        const boundary = `-------bank-soal-${Date.now()}`;
        const metadata = JSON.stringify({
            name: fileName,
            mimeType: blob.type || 'application/octet-stream',
            parents: [config.driveFolderId]
        });
        const body = new Blob([
            `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${metadata}\r\n`,
            `--${boundary}\r\nContent-Type: ${blob.type || 'application/octet-stream'}\r\n\r\n`,
            blob,
            `\r\n--${boundary}--`
        ]);
        return api('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink', {
            method: 'POST',
            headers: { 'Content-Type': `multipart/related; boundary=${boundary}` },
            body
        });
    }

    window.GoogleSync = {
        getConfig: () => ({ ...config }),
        getIdentity: () => identity,
        isConnected: () => Boolean(accessToken),
        saveConfig,
        connect,
        disconnect,
        endSession,
        findWorkspace,
        createWorkspace,
        loadAll,
        saveProfile,
        addQuestion,
        uploadExport
    };
})();
