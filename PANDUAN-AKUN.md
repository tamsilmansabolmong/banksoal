# Menyiapkan pendaftaran dan login guru

Pendaftaran/login memakai Google Apps Script. Password tidak dikirim ke Google Sheets sebagai teks biasa: Apps Script menyimpan salt dan hash password. Sheet `AkunGuru` berisi NIK/NIP, nama guru, asal madrasah, username, salt, hash, dan tanggal pendaftaran; Sheet `Sesi` berisi hash token sesi dan masa berlaku. Sesi berlaku 30 hari. Opsi **Tetap masuk di perangkat ini** menyimpan token sesi (bukan password) di perangkat; jangan gunakan pada komputer bersama.

## Koneksi Google

Setelah guru menyambungkan Google sekali pada browser/perangkatnya, aplikasi menyimpan email akun Google yang ditautkan pada penyimpanan lokal browser. Keluar dari aplikasi hanya mengakhiri sesi aplikasi dan tidak mencabut izin Google. Saat guru login lagi, aplikasi meminta akses Google secara senyap menggunakan sesi/izin Google yang masih berlaku. Tombol **Putuskan akun** menghapus tautan lokal dan mencabut izin Google.

Token akses Google tidak disimpan di spreadsheet admin. Token yang diberikan oleh alur OAuth browser hanya berlaku sementara; aplikasi meminta token baru secara senyap ketika dibuka kembali. Google dapat meminta guru menyambungkan ulang jika sesi Google berakhir, izin dicabut dari pengaturan akun Google, atau kebijakan browser/Google memblokir otorisasi senyap. Tautan lokal berlaku per browser/perangkat, bukan lintas perangkat. Menyimpan refresh token lintas perangkat memerlukan backend OAuth khusus dan penyimpanan rahasia yang aman; jangan simpan token Google sebagai teks di Sheet.

## Menyiapkan endpoint admin

1. Buat atau pilih spreadsheet khusus admin, lalu salin ID di antara `/d/` dan `/edit` pada URL spreadsheet.
2. Buka [script.google.com](https://script.google.com), buat project Apps Script, lalu salin isi `apps-script-auth.gs` ke editor.
3. Ganti `ISI_DENGAN_ID_SPREADSHEET_ADMIN` pada `CONFIG.SPREADSHEET_ID` dengan ID spreadsheet.
4. Pilih **Deploy → New deployment → Web app**. Atur **Execute as: Me** dan **Who has access: Anyone**, lalu deploy dan berikan izin akses yang diminta.
5. Salin URL Web app berakhiran `/exec`, lalu isi `window.BANK_SOAL_AUTH_ENDPOINT` pada `google-config.js`.
6. Publikasikan ulang/unggah aplikasi web, buka ulang aplikasinya, lalu uji satu pendaftaran dan login.

Batasi akses spreadsheet admin kepada pengelola. URL endpoint dapat dilihat publik pada aplikasi; endpoint hanya menyediakan pendaftaran, login, validasi, dan logout, bukan akses langsung ke seluruh spreadsheet.

> Untuk aplikasi produksi, Apps Script bukan pengganti backend autentikasi penuh: endpoint publik memerlukan pemantauan kuota dan penyalahgunaan. Jangan gunakan sesi “Tetap masuk” pada perangkat bersama.
