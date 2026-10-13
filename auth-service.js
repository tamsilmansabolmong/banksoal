(function () {
    const SESSION_KEY = 'bank_soal_auth_session';
    const USERNAME_KEY = 'bank_soal_last_username';
    const ENDPOINT = (window.BANK_SOAL_AUTH_ENDPOINT || '').trim();

    async function request(action, payload = {}) {
        if (!ENDPOINT) {
            throw new Error('Pendaftaran/login belum diaktifkan. Pengelola perlu memasang URL Google Apps Script di google-config.js.');
        }
        let response;
        try {
            response = await fetch(ENDPOINT, {
                method: 'POST',
                headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                body: JSON.stringify({ action, ...payload })
            });
        } catch (error) {
            throw new Error(`Tidak dapat menghubungi layanan akun: ${error.message}`);
        }
        let result;
        try {
            result = await response.json();
        } catch {
            throw new Error(`Layanan akun gagal merespons (${response.status}).`);
        }
        if (!response.ok && !result.error) {
            throw new Error(`Layanan akun gagal merespons (${response.status}).`);
        }
        if (!result.ok) throw new Error(result.error || 'Permintaan akun gagal.');
        return result;
    }

    function saveSession(token, remember) {
        sessionStorage.removeItem(SESSION_KEY);
        localStorage.removeItem(SESSION_KEY);
        (remember ? localStorage : sessionStorage).setItem(SESSION_KEY, token);
    }

    function getSession() {
        return localStorage.getItem(SESSION_KEY) || sessionStorage.getItem(SESSION_KEY) || '';
    }

    async function authenticate(action, fields, remember) {
        const result = await request(action, { ...fields, remember });
        saveSession(result.token, remember);
        localStorage.setItem(USERNAME_KEY, result.user.username);
        return result.user;
    }

    async function restore() {
        const token = getSession();
        if (!token) return null;
        try {
            return (await request('validate', { token })).user;
        } catch (error) {
            clearSession();
            throw error;
        }
    }

    async function logout() {
        const token = getSession();
        clearSession();
        if (token) await request('logout', { token });
    }

    function clearSession() {
        localStorage.removeItem(SESSION_KEY);
        sessionStorage.removeItem(SESSION_KEY);
    }

    window.AuthService = { authenticate, restore, logout };
})();
