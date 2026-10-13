const CONFIG = {
  SPREADSHEET_ID: 'ISI_DENGAN_ID_SPREADSHEET_ADMIN',
  ACCOUNT_SHEET: 'AkunGuru',
  SESSION_SHEET: 'Sesi'
};

const ACCOUNT_HEADERS = ['NIK_NIP', 'Nama_Guru', 'Asal_Madrasah', 'Username', 'Salt', 'Password_Hash', 'Dibuat_Pada'];
const SESSION_HEADERS = ['Token_Hash', 'Username', 'Kedaluwarsa'];
const SESSION_DAYS = 30;
const HASH_ROUNDS = 12000;

function doPost(event) {
  try {
    const request = JSON.parse(event.postData.contents || '{}');
    let result;
    switch (request.action) {
      case 'register': result = register(request); break;
      case 'login': result = login(request); break;
      case 'validate': result = validateSession(request.token); break;
      case 'logout': result = logoutSession(request.token); break;
      default: throw new Error('Jenis permintaan tidak dikenal.');
    }
    return jsonResponse({ ok: true, ...result });
  } catch (error) {
    return jsonResponse({ ok: false, error: error.message || 'Permintaan gagal.' });
  }
}

function register(request) {
  const nikNip = required(request.nikNip, 'NIK/NIP');
  const namaGuru = required(request.namaGuru, 'Nama Guru');
  const asalMadrasah = required(request.asalMadrasah, 'Asal Madrasah');
  const username = normalizeUsername(request.username);
  const password = requiredPassword(request.password);
  if (!/^[a-z0-9._-]{4,30}$/.test(username)) throw new Error('Username harus 4-30 karakter: huruf kecil, angka, titik, garis bawah, atau tanda hubung.');
  if (password.length < 8) throw new Error('Password minimal 8 karakter.');

  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const sheet = getSheet(CONFIG.ACCOUNT_SHEET, ACCOUNT_HEADERS);
    const rows = sheet.getDataRange().getValues();
    const duplicate = rows.slice(1).some(row =>
      String(row[0]) === nikNip || normalizeUsername(row[3]) === username
    );
    if (duplicate) throw new Error('NIK/NIP atau username sudah terdaftar.');

    const salt = Utilities.getUuid() + Utilities.getUuid();
    const hash = passwordHash(password, salt);
    sheet.appendRow([safeCell(nikNip), safeCell(namaGuru), safeCell(asalMadrasah), safeCell(username), salt, hash, new Date()]);
    return createSession({ nikNip, namaGuru, asalMadrasah, username }, request.remember);
  } finally {
    lock.releaseLock();
  }
}

function login(request) {
  const username = normalizeUsername(request.username);
  const password = requiredPassword(request.password);
  const cache = CacheService.getScriptCache();
  const attemptKey = 'login_failures_' + digest(username);
  const failures = Number(cache.get(attemptKey)) || 0;
  if (failures >= 6) throw new Error('Terlalu banyak percobaan. Coba lagi dalam 15 menit.');
  const sheet = getSheet(CONFIG.ACCOUNT_SHEET, ACCOUNT_HEADERS);
  const row = sheet.getDataRange().getValues().slice(1)
    .find(item => normalizeUsername(item[3]) === username);
  if (!row || passwordHash(password, String(row[4])) !== String(row[5])) {
    cache.put(attemptKey, String(failures + 1), 900);
    throw new Error('Username atau password tidak sesuai.');
  }
  cache.remove(attemptKey);
  return createSession(userFromRow(row), request.remember);
}

function validateSession(token) {
  if (!token) throw new Error('Sesi login tidak ditemukan.');
  const sheet = getSheet(CONFIG.SESSION_SHEET, SESSION_HEADERS);
  const rows = sheet.getDataRange().getValues();
  const hash = digest(String(token));
  const now = Date.now();
  for (let index = 1; index < rows.length; index++) {
    if (String(rows[index][0]) !== hash) continue;
    if (new Date(rows[index][2]).getTime() <= now) {
      sheet.deleteRow(index + 1);
      throw new Error('Sesi login kedaluwarsa. Silakan login kembali.');
    }
    const account = findAccount(String(rows[index][1]));
    if (!account) throw new Error('Akun tidak ditemukan.');
    return { user: userFromRow(account) };
  }
  throw new Error('Sesi login tidak berlaku. Silakan login kembali.');
}

function logoutSession(token) {
  if (!token) return {};
  const sheet = getSheet(CONFIG.SESSION_SHEET, SESSION_HEADERS);
  const hash = digest(String(token));
  const rows = sheet.getDataRange().getValues();
  for (let index = rows.length - 1; index >= 1; index--) {
    if (String(rows[index][0]) === hash) sheet.deleteRow(index + 1);
  }
  return {};
}

function createSession(user, remember) {
  const token = Utilities.getUuid() + Utilities.getUuid();
  const lifetime = remember ? SESSION_DAYS * 24 * 60 * 60 * 1000 : 12 * 60 * 60 * 1000;
  const expiry = new Date(Date.now() + lifetime);
  getSheet(CONFIG.SESSION_SHEET, SESSION_HEADERS).appendRow([digest(token), user.username, expiry]);
  return { token, user };
}

function findAccount(username) {
  return getSheet(CONFIG.ACCOUNT_SHEET, ACCOUNT_HEADERS).getDataRange().getValues()
    .slice(1).find(row => normalizeUsername(row[3]) === username) || null;
}

function userFromRow(row) {
  return { nikNip: String(row[0]), namaGuru: String(row[1]), asalMadrasah: String(row[2]), username: String(row[3]) };
}

function getSheet(name, headers) {
  if (!CONFIG.SPREADSHEET_ID || CONFIG.SPREADSHEET_ID.indexOf('ISI_DENGAN_') === 0) {
    throw new Error('ID spreadsheet admin belum diatur pada Apps Script.');
  }
  const spreadsheet = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  let sheet = spreadsheet.getSheetByName(name);
  if (!sheet) sheet = spreadsheet.insertSheet(name);
  if (sheet.getLastRow() === 0) sheet.appendRow(headers);
  return sheet;
}

function passwordHash(password, salt) {
  let value = salt + password;
  for (let index = 0; index < HASH_ROUNDS; index++) value = digest(value + salt);
  return value;
}

function digest(value) {
  return Utilities.base64EncodeWebSafe(
    Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, value, Utilities.Charset.UTF_8)
  );
}

function normalizeUsername(value) {
  return String(value || '').trim().toLowerCase();
}

function required(value, label) {
  const result = String(value || '').trim();
  if (!result) throw new Error(label + ' wajib diisi.');
  return result;
}

function requiredPassword(value) {
  const password = String(value || '');
  if (!password) throw new Error('Password wajib diisi.');
  return password;
}

function safeCell(value) {
  const text = String(value);
  return /^[=+\-@]/.test(text) ? "'" + text : text;
}

function jsonResponse(value) {
  return ContentService.createTextOutput(JSON.stringify(value))
    .setMimeType(ContentService.MimeType.JSON);
}
