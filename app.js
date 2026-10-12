        // Default initial profile data
        const initialProfile = {
            nikNip: "198507122010011005",
            namaGuru: "Ustadz H. Ahmad Dahlan, M.Pd.",
            username: "ahmaddahlan",
            password: "password123",
            namaKepsek: "Drs. H. M. Zainuddin, M.Ag.",
            nipKepsek: "197203151998031002",
            namaSekolah: "MAN 1 KOTA ADALAH",
            alamatSekolah: "Jl. Pendidikan No. 45, Kecamatan Sukamaju, Kota Kencana",
            instansi: "KEMENTERIAN AGAMA REPUBLIK INDONESIA",
            logoUrl: "https://via.placeholder.com/100x100/059669/ffffff?text=MAN+1",
            mapelList: ["Fiqih", "Akidah Akhlak", "Bahasa Indonesia", "Matematika", "IPA Terpadu"],
            kelasList: ["X-1", "X-2", "XI-IPA", "XI-IPS", "XII-MIPA"]
        };

        // Pre-loaded sample questions for instant usability
        const initialQuestions = [
            {
                id: "SQ-101",
                nikNipGuru: "198507122010011005",
                mapel: "Fiqih",
                kelas: "X-1",
                jenisSoal: "PG",
                pertanyaanHtml: "<p>Rukun Islam yang ketiga adalah menunaikan ibadah zakat. Secara bahasa, kata <b>Zakat</b> memiliki arti...</p>",
                opsi: { A: "Sucian dan kebersihan", B: "Tumbuh dan berkembang", C: "Pembersih harta dan jiwa", D: "Pengampunan dosa", E: "Pertumbuhan dan keberkahan" },
                kunciJawaban: "C",
                createdAt: "2026-03-01 08:30"
            },
            {
                id: "SQ-102",
                nikNipGuru: "198507122010011005",
                mapel: "Fiqih",
                kelas: "X-1",
                jenisSoal: "PG",
                pertanyaanHtml: "<p>Batas minimal jumlah harta kekayaan yang wajib dikeluarkan zakatnya disebut dengan...</p>",
                opsi: { A: "Haul", B: "Nisab", C: "Kadar", D: "Infaq", E: "Sedekah" },
                kunciJawaban: "B",
                createdAt: "2026-03-01 08:35"
            },
            {
                id: "SQ-103",
                nikNipGuru: "198507122010011005",
                mapel: "Fiqih",
                kelas: "X-1",
                jenisSoal: "Benar Salah",
                pertanyaanHtml: "<p>Orang yang berhak menerima zakat (Mustahiq) terdiri dari 8 asnaf sebagaimana tercantum dalam Surah At-Taubah ayat 60.</p>",
                opsi: { A: "BENAR", B: "SALAH" },
                kunciJawaban: "BENAR",
                createdAt: "2026-03-01 08:40"
            },
            {
                id: "SQ-104",
                nikNipGuru: "198507122010011005",
                mapel: "Fiqih",
                kelas: "X-1",
                jenisSoal: "Essay",
                pertanyaanHtml: "<p>Jelaskan perbedaan mendasar antara zakat fitrah dan zakat mal beserta waktu pelaksanaannya secara terperinci!</p>",
                opsi: {},
                kunciJawaban: "Zakat fitrah disyaratkan berupa makanan pokok untuk mensucikan jiwa di bulan Ramadhan sebelum shalat Idul Fitri, sedangkan Zakat Mal dikeluarkan dari harta komoditas/kekayaan yang mencapai nisab dan haul.",
                createdAt: "2026-03-01 08:45"
            },
            {
                id: "SQ-105",
                nikNipGuru: "198507122010011005",
                mapel: "Bahasa Indonesia",
                kelas: "X-1",
                jenisSoal: "PG",
                pertanyaanHtml: "<p>Struktur teks laporan hasil observasi yang berisi deskripsi mengenai manfaat atau fungsi objek yang diamati dalam kehidupan adalah...</p>",
                opsi: { A: "Pernyataan Umum", B: "Deskripsi Bagian", C: "Deskripsi Manfaat", D: "Penutup", E: "Orientasi" },
                kunciJawaban: "C",
                createdAt: "2026-03-02 10:00"
            },
            {
                id: "SQ-106",
                nikNipGuru: "198507122010011005",
                mapel: "Fiqih",
                kelas: "X-2",
                jenisSoal: "Soal Cerita",
                pertanyaanHtml: "<p>Pak Ahmad memiliki tabungan emas seberat 90 gram yang telah disimpan selama 1 tahun penuh. Jika harga emas Rp 1.000.000/gram dan nisab emas 85 gram, berapa zakat yang wajib dikeluarkan Pak Ahmad?</p>",
                opsi: { A: "Rp 2.000.000", B: "Rp 2.250.000", C: "Rp 2.500.000", D: "Rp 3.000.000", E: "Rp 1.800.000" },
                kunciJawaban: "B",
                createdAt: "2026-03-02 11:15"
            }
        ];

        function App() {
            const [activeTab, setActiveTab] = React.useState('dashboard');
            const [googleConfig, setGoogleConfig] = React.useState(() => GoogleSync.getConfig());
            const [googleIdentity, setGoogleIdentity] = React.useState(() => GoogleSync.getIdentity());
            const [syncing, setSyncing] = React.useState(false);
            const accountKey = googleIdentity?.email || 'offline';

            // Application Data States
            const [profile, setProfile] = React.useState(() => {
                const saved = localStorage.getItem('guru_profile');
                return saved ? JSON.parse(saved) : initialProfile;
            });

            const [bankSoal, setBankSoal] = React.useState(() => {
                const saved = localStorage.getItem('bank_soal_data');
                return saved ? JSON.parse(saved) : initialQuestions;
            });

            // Exam Builder State
            const [examConfig, setExamConfig] = React.useState({
                mapel: profile.mapelList[0] || 'Fiqih',
                targetKelas: [profile.kelasList[0] || 'X-1'],
                semester: 'Ganjil',
                asesmen: 'Sumatif Tengah Semester (STS)',
                durasi: '90 Menit',
                tanggalUjian: new Date().toISOString().split('T')[0],
                tahunAjaran: '2026/2027'
            });

            // Checklist Selected Question IDs
            const [selectedQuestionIds, setSelectedQuestionIds] = React.useState(['SQ-101', 'SQ-102', 'SQ-103', 'SQ-104']);

            // Export Modal
            const [exportFormat, setExportFormat] = React.useState(null);
            const [pdfOptions, setPdfOptions] = React.useState({
                includeKunci: false,
                includeKop: true,
                includeTTDKepsek: true,
                includeTTDGuru: true
            });

            // Toast Alert Notification State
            const [toast, setToast] = React.useState(null);
            const showToast = (message, type = 'success') => {
                setToast({ message, type });
                setTimeout(() => setToast(null), 3500);
            };

            // Save state to LocalStorage
            React.useEffect(() => {
                localStorage.setItem(`guru_profile_${accountKey}`, JSON.stringify(profile));
            }, [profile, accountKey]);

            React.useEffect(() => {
                localStorage.setItem(`bank_soal_data_${accountKey}`, JSON.stringify(bankSoal));
            }, [bankSoal, accountKey]);

            const fetchFromGoogleSheet = async () => {
                if (!GoogleSync.isConnected()) throw new Error('Hubungkan akun Google terlebih dahulu.');
                setSyncing(true);
                try {
                    const data = await GoogleSync.loadAll();
                    if (data.profile) setProfile(data.profile);
                    setBankSoal(data.bankSoal);
                    showToast("Data berhasil disinkronkan dari Google Sheets!");
                    return data;
                } catch (err) {
                    console.error(err);
                    showToast("Gagal membaca Google Sheets: " + err.message, "error");
                    throw err;
                } finally {
                    setSyncing(false);
                }
            };

            const pushToGoogleSheet = async (type, payload) => {
                if (!GoogleSync.isConnected() || !googleConfig.spreadsheetId) return false;
                try {
                    if (type === 'saveUser') await GoogleSync.saveProfile(payload);
                    else if (type === 'addQuestion') await GoogleSync.addQuestion(payload);
                    else throw new Error(`Jenis data Google Sheets tidak dikenal: ${type}`);
                    return true;
                } catch (e) {
                    console.error("Google Sheets sync error:", e);
                    showToast("Data tersimpan lokal, tetapi gagal dikirim ke Google Sheets: " + e.message, "error");
                    return false;
                }
            };

            const connectGoogle = async () => {
                setSyncing(true);
                try {
                    const identity = await GoogleSync.connect();
                    const accountProfile = JSON.parse(localStorage.getItem(`guru_profile_${identity.email}`) || 'null') || initialProfile;
                    const accountQuestions = JSON.parse(localStorage.getItem(`bank_soal_data_${identity.email}`) || 'null') || initialQuestions;
                    setProfile(accountProfile);
                    setBankSoal(accountQuestions);
                    setGoogleIdentity(identity);
                    showToast(`Terhubung sebagai ${identity.email || 'akun Google'}.`);
                    let currentConfig = GoogleSync.getConfig();
                    if (!currentConfig.spreadsheetId) {
                        currentConfig = await GoogleSync.findWorkspace();
                    }
                    if (!currentConfig?.spreadsheetId) {
                        currentConfig = await GoogleSync.createWorkspace();
                        await GoogleSync.saveProfile(accountProfile);
                        for (const question of accountQuestions) await GoogleSync.addQuestion(question);
                        showToast('Sheet dan folder Drive pribadi berhasil disiapkan otomatis.');
                    } else {
                        setGoogleConfig(currentConfig);
                        const data = await fetchFromGoogleSheet();
                        if (!data.profile) await GoogleSync.saveProfile(accountProfile);
                        if (!data.bankSoal.length && accountQuestions.length) {
                            for (const question of accountQuestions) await GoogleSync.addQuestion(question);
                        }
                    }
                    setGoogleConfig(GoogleSync.getConfig());
                } catch (error) {
                    showToast("Gagal menghubungkan Google: " + error.message, "error");
                    throw error;
                } finally {
                    setSyncing(false);
                }
            };

            const disconnectGoogle = () => {
                GoogleSync.disconnect();
                setGoogleIdentity(null);
                showToast("Akun Google diputus dari sesi ini.", "info");
            };

            React.useEffect(() => {
                if ('serviceWorker' in navigator && /^https?:$/.test(window.location.protocol)) {
                    navigator.serviceWorker.register('./service-worker.js').catch((error) => {
                        console.error('Pendaftaran PWA gagal:', error);
                    });
                }
            }, []);

            return (
                <div class="min-h-screen flex flex-col bg-slate-100 font-sans">
                    <header class="bg-gradient-to-r from-teal-800 via-emerald-800 to-teal-900 text-white shadow-lg sticky top-0 z-40">
                        <div class="max-w-7xl mx-auto px-4 py-3 sm:px-6 flex flex-wrap justify-between items-center gap-3">
                            <div class="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
                                <div class="w-10 h-10 rounded-xl bg-white/10 backdrop-blur border border-white/20 flex items-center justify-center font-bold text-xl text-emerald-300 shadow-inner">
                                    📚
                                </div>
                                <div>
                                    <h1 class="font-bold text-lg leading-tight tracking-wide">SOAL MADRASAH</h1>
                                    <p class="text-xs text-emerald-200 font-light">Bank & Exam Generator PWA</p>
                                </div>
                            </div>

                            <div class="flex items-center space-x-2 bg-black/20 backdrop-blur px-3 py-1.5 rounded-full text-xs border border-white/10">
                                <span class={`w-2.5 h-2.5 rounded-full ${googleIdentity ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></span>
                                <span class="hidden sm:inline text-slate-200">
                                    {googleIdentity ? googleIdentity.email || 'Google terhubung' : 'Lokal / Offline'}
                                </span>
                                {googleIdentity && (
                                    <button 
                                        onClick={() => fetchFromGoogleSheet().catch(() => {})}
                                        disabled={syncing}
                                        class="ml-2 bg-emerald-700 hover:bg-emerald-600 px-2 py-0.5 rounded text-[10px] font-semibold transition"
                                        title="Tarik Data Terbaru dari Sheet"
                                    >
                                        {syncing ? 'Syncing...' : 'Sync Now'}
                                    </button>
                                )}
                            </div>

                            <nav class="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm font-medium overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
                                <button 
                                    onClick={() => setActiveTab('dashboard')}
                                    class={`px-3 py-1.5 rounded-lg transition-all flex items-center space-x-1.5 whitespace-nowrap ${activeTab === 'dashboard' ? 'bg-white text-teal-900 font-bold shadow-md' : 'text-emerald-100 hover:bg-white/10'}`}
                                >
                                    <span>👤 Profil</span>
                                </button>
                                <button 
                                    onClick={() => setActiveTab('inputSoal')}
                                    class={`px-3 py-1.5 rounded-lg transition-all flex items-center space-x-1.5 whitespace-nowrap ${activeTab === 'inputSoal' ? 'bg-white text-teal-900 font-bold shadow-md' : 'text-emerald-100 hover:bg-white/10'}`}
                                >
                                    <span>📥 Input & Import</span>
                                </button>
                                <button 
                                    onClick={() => setActiveTab('examBuilder')}
                                    class={`px-3 py-1.5 rounded-lg transition-all flex items-center space-x-1.5 whitespace-nowrap ${activeTab === 'examBuilder' ? 'bg-white text-teal-900 font-bold shadow-md' : 'text-emerald-100 hover:bg-white/10'}`}
                                >
                                    <span>📝 Buat Ujian ({selectedQuestionIds.length})</span>
                                </button>
                                <button 
                                    onClick={() => setActiveTab('draftSoal')}
                                    class={`px-3 py-1.5 rounded-lg transition-all flex items-center space-x-1.5 whitespace-nowrap ${activeTab === 'draftSoal' ? 'bg-amber-400 text-slate-900 font-bold shadow-md' : 'text-emerald-100 hover:bg-white/10'}`}
                                >
                                    <span>🖨️ Cetak Draft</span>
                                </button>
                                <button 
                                    onClick={() => setActiveTab('setupGoogle')}
                                    class={`px-3 py-1.5 rounded-lg transition-all flex items-center space-x-1.5 whitespace-nowrap ${activeTab === 'setupGoogle' ? 'bg-white text-teal-900 font-bold shadow-md' : 'text-emerald-100 hover:bg-white/10'}`}
                                >
                                    <span>☁️ Koneksi Google</span>
                                </button>
                            </nav>
                        </div>
                    </header>

                    {toast && (
                        <div class="fixed top-16 right-4 z-50 animate-bounce">
                            <div class={`px-4 py-3 rounded-xl shadow-xl text-white text-sm font-semibold flex items-center space-x-2 border ${toast.type === 'error' ? 'bg-rose-600 border-rose-400' : toast.type === 'warning' ? 'bg-amber-600 border-amber-400' : 'bg-emerald-600 border-emerald-400'}`}>
                                <span>{toast.type === 'error' ? '❌' : toast.type === 'warning' ? '⚠️' : '✅'}</span>
                                <span>{toast.message}</span>
                            </div>
                        </div>
                    )}

                    <main class="flex-grow max-w-7xl w-full mx-auto p-4 sm:p-6">
                        {activeTab === 'dashboard' && (
                            <ProfileView 
                                profile={profile} 
                                setProfile={setProfile} 
                                bankSoal={bankSoal} 
                                pushToGoogleSheet={pushToGoogleSheet}
                                showToast={showToast}
                            />
                        )}

                        {activeTab === 'inputSoal' && (
                            <InputSoalView 
                                profile={profile} 
                                bankSoal={bankSoal} 
                                setBankSoal={setBankSoal} 
                                pushToGoogleSheet={pushToGoogleSheet}
                                showToast={showToast}
                            />
                        )}

                        {activeTab === 'examBuilder' && (
                            <ExamBuilderView 
                                profile={profile} 
                                bankSoal={bankSoal} 
                                examConfig={examConfig} 
                                setExamConfig={setExamConfig} 
                                selectedQuestionIds={selectedQuestionIds} 
                                setSelectedQuestionIds={setSelectedQuestionIds} 
                                setActiveTab={setActiveTab}
                                showToast={showToast}
                            />
                        )}

                        {activeTab === 'draftSoal' && (
                            <DraftSoalView 
                                profile={profile} 
                                examConfig={examConfig} 
                                bankSoal={bankSoal} 
                                selectedQuestionIds={selectedQuestionIds} 
                                setExportFormat={setExportFormat}
                                showToast={showToast}
                            />
                        )}

                        {activeTab === 'setupGoogle' && (
                            <SetupGoogleView
                                googleConfig={googleConfig}
                                googleIdentity={googleIdentity}
                                syncing={syncing}
                                connectGoogle={connectGoogle}
                                disconnectGoogle={disconnectGoogle}
                                fetchFromGoogleSheet={fetchFromGoogleSheet}
                            />
                        )}
                    </main>

                    {exportFormat && (
                        <ExportModal
                            format={exportFormat}
                            setExportFormat={setExportFormat}
                            pdfOptions={pdfOptions} 
                            setPdfOptions={setPdfOptions} 
                            showToast={showToast}
                            examConfig={examConfig}
                            profile={profile}
                            selectedQuestions={bankSoal.filter(q => selectedQuestionIds.includes(q.id))}
                            googleConnected={Boolean(googleIdentity)}
                            googleConfig={googleConfig}
                        />
                    )}

                    <footer class="bg-white border-t border-slate-200 py-4 px-6 text-center text-xs text-slate-500">
                        <p>© 2026 Bank & Generator Soal Madrasah/Sekolah - Standar Asesmen Kurikulum Merdeka / 2013</p>
                    </footer>
                </div>
            );
        }

        function ProfileView({ profile, setProfile, bankSoal, pushToGoogleSheet, showToast }) {
            const [formData, setFormData] = React.useState({ ...profile });
            const [newMapel, setNewMapel] = React.useState('');
            const [newKelas, setNewKelas] = React.useState('');

            const handleChange = (e) => {
                const { name, value } = e.target;
                setFormData(prev => ({ ...prev, [name]: value }));
            };

            const handleLogoUpload = (e) => {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                        setFormData(prev => ({ ...prev, logoUrl: reader.result }));
                    };
                    reader.readAsDataURL(file);
                }
            };

            const handleAddMapel = () => {
                if (!newMapel.trim()) return;
                if (formData.mapelList.includes(newMapel.trim())) {
                    showToast("Mata pelajaran sudah ada!", "warning");
                    return;
                }
                setFormData(prev => ({ ...prev, mapelList: [...prev.mapelList, newMapel.trim()] }));
                setNewMapel('');
            };

            const handleRemoveMapel = (item) => {
                setFormData(prev => ({ ...prev, mapelList: prev.mapelList.filter(m => m !== item) }));
            };

            const handleAddKelas = () => {
                if (!newKelas.trim()) return;
                if (formData.kelasList.includes(newKelas.trim())) {
                    showToast("Kelas sudah ada!", "warning");
                    return;
                }
                setFormData(prev => ({ ...prev, kelasList: [...prev.kelasList, newKelas.trim()] }));
                setNewKelas('');
            };

            const handleRemoveKelas = (item) => {
                setFormData(prev => ({ ...prev, kelasList: prev.kelasList.filter(k => k !== item) }));
            };

            const handleSubmit = (e) => {
                e.preventDefault();
                setProfile(formData);
                pushToGoogleSheet('saveUser', formData);
                showToast("Profil Guru & Pengaturan Berhasil Disimpan!");
            };

            return (
                <div class="space-y-6">
                    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
                            <div class="w-12 h-12 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-xl">
                                👨‍🏫
                            </div>
                            <div>
                                <div class="text-xs text-slate-400 font-semibold uppercase">Guru Pengampu</div>
                                <div class="font-bold text-slate-800 text-sm truncate">{profile.namaGuru}</div>
                                <div class="text-xs text-slate-500">NIP: {profile.nikNip}</div>
                            </div>
                        </div>

                        <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
                            <div class="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xl">
                                🏫
                            </div>
                            <div>
                                <div class="text-xs text-slate-400 font-semibold uppercase">Satuan Pendidikan</div>
                                <div class="font-bold text-slate-800 text-sm truncate">{profile.namaSekolah}</div>
                                <div class="text-xs text-slate-500">{profile.instansi}</div>
                            </div>
                        </div>

                        <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
                            <div class="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-xl">
                                📚
                            </div>
                            <div>
                                <div class="text-xs text-slate-400 font-semibold uppercase">Koleksi Soal</div>
                                <div class="font-bold text-slate-800 text-lg">{bankSoal.length} Soal</div>
                                <div class="text-xs text-slate-500">{profile.mapelList.length} Mata Pelajaran</div>
                            </div>
                        </div>

                        <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
                            <div class="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xl">
                                🎓
                            </div>
                            <div>
                                <div class="text-xs text-slate-400 font-semibold uppercase">Kelas Diampu</div>
                                <div class="font-bold text-slate-800 text-lg">{profile.kelasList.length} Kelas</div>
                                <div class="text-xs text-slate-500">{profile.kelasList.join(', ')}</div>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                        <div class="bg-slate-50 border-b border-slate-200 px-6 py-4 flex justify-between items-center">
                            <h2 class="font-bold text-slate-800 text-lg flex items-center gap-2">
                                ⚙️ Identitas Guru & Sekolah (Persiapan Kop Surat & Soal)
                            </h2>
                            <button type="submit" class="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-xl font-semibold text-sm shadow transition">
                                💾 Simpan Profil
                            </button>
                        </div>

                        <div class="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div class="space-y-4">
                                <h3 class="font-bold text-teal-800 text-sm border-b pb-2 uppercase tracking-wider">A. Data Guru Pengampu</h3>
                                <div>
                                    <label class="block text-xs font-semibold text-slate-600 mb-1">NIK / NIP Guru</label>
                                    <input type="text" name="nikNip" value={formData.nikNip} onChange={handleChange} required class="w-full px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none" />
                                </div>
                                <div>
                                    <label class="block text-xs font-semibold text-slate-600 mb-1">Nama Lengkap & Gelar Guru</label>
                                    <input type="text" name="namaGuru" value={formData.namaGuru} onChange={handleChange} required class="w-full px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none" />
                                </div>
                                <div class="grid grid-cols-2 gap-3">
                                    <div>
                                        <label class="block text-xs font-semibold text-slate-600 mb-1">Username Login</label>
                                        <input type="text" name="username" value={formData.username} onChange={handleChange} required class="w-full px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none" />
                                    </div>
                                    <div>
                                        <label class="block text-xs font-semibold text-slate-600 mb-1">Password</label>
                                        <input type="password" name="password" value={formData.password} onChange={handleChange} required class="w-full px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none" />
                                    </div>
                                </div>
                            </div>

                            <div class="space-y-4">
                                <h3 class="font-bold text-teal-800 text-sm border-b pb-2 uppercase tracking-wider">B. Data Lembaga & Kepala Sekolah</h3>
                                <div>
                                    <label class="block text-xs font-semibold text-slate-600 mb-1">Instansi / Naungan (Garis 1 Kop Surat)</label>
                                    <input type="text" name="instansi" value={formData.instansi} onChange={handleChange} placeholder="contoh: KEMENTERIAN AGAMA REPUBLIK INDONESIA" required class="w-full px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none" />
                                </div>
                                <div>
                                    <label class="block text-xs font-semibold text-slate-600 mb-1">Nama Sekolah / Madrasah (Garis 2 Kop Surat)</label>
                                    <input type="text" name="namaSekolah" value={formData.namaSekolah} onChange={handleChange} placeholder="contoh: MAN 1 KOTA JAKARTA" required class="w-full px-3 py-2 border rounded-xl text-sm font-bold focus:ring-2 focus:ring-emerald-500 outline-none" />
                                </div>
                                <div>
                                    <label class="block text-xs font-semibold text-slate-600 mb-1">Alamat Lengkap & Kontak (Garis 3 Kop Surat)</label>
                                    <input type="text" name="alamatSekolah" value={formData.alamatSekolah} onChange={handleChange} required class="w-full px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none" />
                                </div>
                                <div class="grid grid-cols-2 gap-3">
                                    <div>
                                        <label class="block text-xs font-semibold text-slate-600 mb-1">Nama Kepala Sekolah/Madrasah</label>
                                        <input type="text" name="namaKepsek" value={formData.namaKepsek} onChange={handleChange} required class="w-full px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none" />
                                    </div>
                                    <div>
                                        <label class="block text-xs font-semibold text-slate-600 mb-1">NIP Kepala Sekolah</label>
                                        <input type="text" name="nipKepsek" value={formData.nipKepsek} onChange={handleChange} required class="w-full px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none" />
                                    </div>
                                </div>
                            </div>

                            <div class="col-span-1 md:col-span-2 border-t pt-4">
                                <h3 class="font-bold text-teal-800 text-sm mb-3 uppercase tracking-wider">C. Logo Resmi Sekolah/Madrasah</h3>
                                <div class="flex items-center space-x-6 bg-slate-50 p-4 rounded-xl border border-dashed border-slate-300">
                                    <div class="w-20 h-20 border rounded-lg bg-white flex items-center justify-center p-1 shadow-sm overflow-hidden flex-shrink-0">
                                        {formData.logoUrl ? (
                                            <img src={formData.logoUrl} alt="Logo" class="max-h-full max-w-full object-contain" />
                                        ) : (
                                            <span class="text-xs text-slate-400">Belum ada logo</span>
                                        )}
                                    </div>
                                    <div class="flex-grow">
                                        <label class="block text-xs font-semibold text-slate-700 mb-1">Upload File Logo Baru (PNG/JPG)</label>
                                        <input type="file" accept="image/*" onChange={handleLogoUpload} class="text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100" />
                                        <p class="text-[11px] text-slate-400 mt-1">Logo akan otomatis muncul di sebelah kiri Kop Surat pada draft ujian PDF.</p>
                                    </div>
                                </div>
                            </div>

                            <div class="col-span-1 md:col-span-2 border-t pt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <h3 class="font-bold text-teal-800 text-sm mb-2 uppercase tracking-wider">D. Mata Pelajaran Yang Diampu</h3>
                                    <div class="flex space-x-2 mb-3">
                                        <input type="text" value={newMapel} onChange={e => setNewMapel(e.target.value)} placeholder="Tambah Mapel Baru..." class="flex-grow px-3 py-1.5 border rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none" />
                                        <button type="button" onClick={handleAddMapel} class="bg-teal-700 text-white px-4 py-1.5 rounded-xl text-xs font-semibold hover:bg-teal-800">+ Tambah</button>
                                    </div>
                                    <div class="flex flex-wrap gap-2">
                                        {formData.mapelList.map((m, idx) => (
                                            <span key={idx} class="bg-teal-50 text-teal-800 border border-teal-200 px-3 py-1 rounded-full text-xs font-semibold flex items-center space-x-1">
                                                <span>{m}</span>
                                                <button type="button" onClick={() => handleRemoveMapel(m)} class="text-teal-400 hover:text-rose-600 font-bold ml-1">×</button>
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <h3 class="font-bold text-teal-800 text-sm mb-2 uppercase tracking-wider">E. Daftar Kelas Yang Diampu</h3>
                                    <div class="flex space-x-2 mb-3">
                                        <input type="text" value={newKelas} onChange={e => setNewKelas(e.target.value)} placeholder="Tambah Kelas Baru (misal: X-3)..." class="flex-grow px-3 py-1.5 border rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none" />
                                        <button type="button" onClick={handleAddKelas} class="bg-emerald-700 text-white px-4 py-1.5 rounded-xl text-xs font-semibold hover:bg-emerald-800">+ Tambah</button>
                                    </div>
                                    <div class="flex flex-wrap gap-2">
                                        {formData.kelasList.map((k, idx) => (
                                            <span key={idx} class="bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1 rounded-full text-xs font-semibold flex items-center space-x-1">
                                                <span>{k}</span>
                                                <button type="button" onClick={() => handleRemoveKelas(k)} class="text-emerald-400 hover:text-rose-600 font-bold ml-1">×</button>
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            );
        }

        function InputSoalView({ profile, bankSoal, setBankSoal, pushToGoogleSheet, showToast }) {
            const [inputMethod, setInputMethod] = React.useState('docx');
            
            // Metadata State
            const [selectedMapel, setSelectedMapel] = React.useState(profile.mapelList[0] || '');
            const [selectedKelas, setSelectedKelas] = React.useState(profile.kelasList[0] || '');
            const [jenisSoal, setJenisSoal] = React.useState('PG');
            const [customJenis, setCustomJenis] = React.useState('');

            // Form Manual State
            const [manualHtml, setManualHtml] = React.useState('');
            const [opsiA, setOpsiA] = React.useState('');
            const [opsiB, setOpsiB] = React.useState('');
            const [opsiC, setOpsiC] = React.useState('');
            const [opsiD, setOpsiD] = React.useState('');
            const [opsiE, setOpsiE] = React.useState('');
            const [kunciJawaban, setKunciJawaban] = React.useState('A');

            // DOCX Parsed Items Preview State
            const [docxPreview, setDocxPreview] = React.useState([]);
            const [parsingLoading, setParsingLoading] = React.useState(false);

            // Generate Word Template for User Download
            const downloadWordTemplate = () => {
                const templateContent = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
                <head><meta charset='utf-8'><title>Template Soal Word</title>
                <style>
                    body { font-family: 'Times New Roman', serif; font-size: 12pt; line-height: 1.5; }
                    .tag { font-weight: bold; color: #0056b3; }
                    .kunci { font-weight: bold; color: #28a745; }
                </style>
                </head>
                <body>
                    <h2 style="text-align: center;">TEMPLATE IMPORT NASKAH SOAL (.DOCX)</h2>
                    <p><b>Petunjuk Guru:</b> Tuliskan naskah soal Anda di Word menggunakan tag penanda di bawah ini agar otomatis terdeteksi oleh sistem.</p>
                    <hr/>
                    <br/>
                    <p><span class="tag">[PG]</span> 1. Rukun Islam yang ketiga adalah menunaikan ibadah zakat. Secara bahasa, kata Zakat memiliki arti...</p>
                    <p>A. Sucian dan kebersihan</p>
                    <p>B. Tumbuh dan berkembang</p>
                    <p>C. Pembersih harta dan jiwa</p>
                    <p>D. Pengampunan dosa</p>
                    <p>E. Pertumbuhan dan keberkahan</p>
                    <p><span class="kunci">[KUNCI: C]</span></p>
                    <br/>
                    <p><span class="tag">[PG]</span> 2. Batas minimal jumlah harta kekayaan yang wajib dikeluarkan zakatnya disebut...</p>
                    <p>A. Haul</p>
                    <p>B. Nisab</p>
                    <p>C. Kadar</p>
                    <p>D. Sedekah</p>
                    <p><span class="kunci">[KUNCI: B]</span></p>
                    <br/>
                    <p><span class="tag">[BS]</span> 3. Orang yang berhak menerima zakat (Mustahiq) terdiri dari 8 asnaf sebagaimana tercantum dalam Surah At-Taubah ayat 60.</p>
                    <p><span class="kunci">[KUNCI: BENAR]</span></p>
                    <br/>
                    <p><span class="tag">[ESSAY]</span> 4. Jelaskan perbedaan mendasar antara zakat fitrah dan zakat mal beserta waktu pelaksanaannya!</p>
                    <p><span class="kunci">[KUNCI: Zakat fitrah disyaratkan berupa makanan pokok untuk mensucikan jiwa di bulan Ramadhan...]</span></p>
                </body>
                </html>`;

                const blob = new Blob(['\ufeff' + templateContent], { type: 'application/msword' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `Template_Import_Soal_Madrasah.doc`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                showToast("Template Word berhasil diunduh!");
            };

            // Handle DOCX Upload with Mammoth.js
            const handleDocxUpload = (e) => {
                const file = e.target.files[0];
                if (!file) return;

                setParsingLoading(true);
                const reader = new FileReader();
                reader.onload = function(event) {
                    const arrayBuffer = event.target.result;
                    mammoth.convertToHtml({ arrayBuffer: arrayBuffer })
                        .then(function(result) {
                            const rawHtml = result.value;
                            parseDocxHtmlToQuestions(rawHtml);
                            setParsingLoading(false);
                        })
                        .catch(function(err) {
                            console.error("Mammoth error:", err);
                            showToast("Gagal membaca file .docx: " + err.message, "error");
                            setParsingLoading(false);
                        });
                };
                reader.readAsArrayBuffer(file);
            };

            const parseDocxHtmlToQuestions = (htmlText) => {
                const container = document.createElement('div');
                container.innerHTML = htmlText;
                const paragraphs = Array.from(container.querySelectorAll('p, li')).map(p => p.innerText.trim()).filter(Boolean);

                const parsed = [];
                let currentItem = null;

                paragraphs.forEach((line) => {
                    const lineUpper = line.toUpperCase();

                    if (lineUpper.includes('[PG]') || lineUpper.includes('[ESSAY]') || lineUpper.includes('[BS]') || lineUpper.includes('[SOAL]')) {
                        if (currentItem) parsed.push(currentItem);
                        
                        let detectedType = 'PG';
                        if (lineUpper.includes('[ESSAY]')) detectedType = 'Essay';
                        else if (lineUpper.includes('[BS]')) detectedType = 'Benar Salah';

                        currentItem = {
                            id: 'SQ-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
                            nikNipGuru: profile.nikNip,
                            mapel: selectedMapel,
                            kelas: selectedKelas,
                            jenisSoal: detectedType,
                            pertanyaanHtml: `<p>${line.replace(/\[.*?\]/g, '').trim()}</p>`,
                            opsi: {},
                            kunciJawaban: detectedType === 'PG' ? 'A' : detectedType === 'Benar Salah' ? 'BENAR' : '',
                            createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
                        };
                    } else if (currentItem) {
                        if (line.match(/^[A-E][.\)]/i)) {
                            const key = line[0].toUpperCase();
                            const val = line.substring(2).trim();
                            currentItem.opsi[key] = val;
                        } else if (lineUpper.includes('[KUNCI:') || lineUpper.includes('KUNCI:')) {
                            const match = line.match(/KUNCI:\s*([A-E]|BENAR|SALAH|.*)/i);
                            if (match && match[1]) {
                                currentItem.kunciJawaban = match[1].trim();
                            }
                        } else {
                            currentItem.pertanyaanHtml += `<p>${line}</p>`;
                        }
                    }
                });

                if (currentItem) parsed.push(currentItem);

                if (parsed.length === 0) {
                    parsed.push({
                        id: 'SQ-' + Date.now(),
                        nikNipGuru: profile.nikNip,
                        mapel: selectedMapel,
                        kelas: selectedKelas,
                        jenisSoal: jenisSoal,
                        pertanyaanHtml: htmlText,
                        opsi: jenisSoal === 'PG' ? { A: 'Pilihan A', B: 'Pilihan B', C: 'Pilihan C', D: 'Pilihan D' } : {},
                        kunciJawaban: 'A',
                        createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
                    });
                }

                setDocxPreview(parsed);
                showToast(`Berhasil mengekstraksi ${parsed.length} soal dari file Word!`);
            };

            const handleSaveManual = (e) => {
                e.preventDefault();
                if (!manualHtml.trim()) {
                    showToast("Isi pertanyaan tidak boleh kosong!", "warning");
                    return;
                }

                const actualJenis = jenisSoal === 'Lainnya' ? customJenis || 'Lainnya' : jenisSoal;
                let opsiObj = {};
                if (actualJenis === 'PG') {
                    opsiObj = { A: opsiA, B: opsiB, C: opsiC, D: opsiD };
                    if (opsiE.trim()) opsiObj.E = opsiE;
                } else if (actualJenis === 'Benar Salah') {
                    opsiObj = { A: 'BENAR', B: 'SALAH' };
                }

                const newQuestion = {
                    id: 'SQ-' + Date.now(),
                    nikNipGuru: profile.nikNip,
                    mapel: selectedMapel,
                    kelas: selectedKelas,
                    jenisSoal: actualJenis,
                    pertanyaanHtml: manualHtml,
                    opsi: opsiObj,
                    kunciJawaban: kunciJawaban,
                    createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
                };

                const updated = [newQuestion, ...bankSoal];
                setBankSoal(updated);
                pushToGoogleSheet('addQuestion', newQuestion);
                showToast("Soal berhasil ditambahkan ke Bank Soal!");

                setManualHtml('');
                setOpsiA(''); setOpsiB(''); setOpsiC(''); setOpsiD(''); setOpsiE('');
            };

            const handleSaveAllDocx = () => {
                if (docxPreview.length === 0) return;
                const updated = [...docxPreview, ...bankSoal];
                setBankSoal(updated);
                
                docxPreview.forEach(q => pushToGoogleSheet('addQuestion', q));
                
                showToast(`Sebanyak ${docxPreview.length} soal berhasil disimpan ke Bank Soal!`);
                setDocxPreview([]);
            };

            return (
                <div class="space-y-6">
                    <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                        <h2 class="font-bold text-slate-800 text-lg mb-4 flex items-center gap-2">
                            📥 Tambah / Input Soal Baru ke Bank Soal
                        </h2>

                        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 mb-6">
                            <div>
                                <label class="block text-xs font-semibold text-slate-600 mb-1">Pilih Mata Pelajaran</label>
                                <select value={selectedMapel} onChange={e => setSelectedMapel(e.target.value)} class="w-full px-3 py-2 border rounded-xl text-sm bg-white font-medium">
                                    {profile.mapelList.map((m, idx) => (
                                        <option key={idx} value={m}>{m}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label class="block text-xs font-semibold text-slate-600 mb-1">Pilih Kelas Tujuan</label>
                                <select value={selectedKelas} onChange={e => setSelectedKelas(e.target.value)} class="w-full px-3 py-2 border rounded-xl text-sm bg-white font-medium">
                                    {profile.kelasList.map((k, idx) => (
                                        <option key={idx} value={k}>{k}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label class="block text-xs font-semibold text-slate-600 mb-1">Jenis Soal</label>
                                <select value={jenisSoal} onChange={e => setJenisSoal(e.target.value)} class="w-full px-3 py-2 border rounded-xl text-sm bg-white font-medium">
                                    <option value="PG">Pilihan Ganda (PG)</option>
                                    <option value="Essay">Essay / Uraian</option>
                                    <option value="Benar Salah">Benar Salah (BS)</option>
                                    <option value="Soal Cerita">Soal Cerita / Studi Kasus</option>
                                    <option value="Lainnya">Lainnya (Custom Teks)</option>
                                </select>
                            </div>

                            {jenisSoal === 'Lainnya' && (
                                <div class="col-span-1 sm:col-span-3">
                                    <label class="block text-xs font-semibold text-slate-600 mb-1">Nama Jenis Soal Custom</label>
                                    <input type="text" value={customJenis} onChange={e => setCustomJenis(e.target.value)} placeholder="Misal: Isian Singkat / Menjodohkan" class="w-full px-3 py-2 border rounded-xl text-sm" />
                                </div>
                            )}
                        </div>

                        <div class="flex border-b border-slate-200 space-x-6">
                            <button 
                                onClick={() => setInputMethod('docx')}
                                class={`pb-3 font-semibold text-sm transition-all border-b-2 flex items-center space-x-2 ${inputMethod === 'docx' ? 'border-teal-600 text-teal-700' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                            >
                                <span>📄 Upload Document Word (.docx)</span>
                            </button>
                            <button 
                                onClick={() => setInputMethod('manual')}
                                class={`pb-3 font-semibold text-sm transition-all border-b-2 flex items-center space-x-2 ${inputMethod === 'manual' ? 'border-teal-600 text-teal-700' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                            >
                                <span>✍️ Form Input Manual</span>
                            </button>
                        </div>
                    </div>

                    {inputMethod === 'docx' && (
                        <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-6">
                            <div class="border-2 border-dashed border-teal-300 bg-teal-50/50 p-8 rounded-2xl text-center space-y-4">
                                <div class="text-4xl">📄</div>
                                <h3 class="font-bold text-slate-800 text-base">Upload File Naskah Soal (.docx)</h3>
                                <p class="text-xs text-slate-500 max-w-lg mx-auto leading-relaxed">
                                    Sistem akan mengekstraksi teks secara otomatis. Gunakan tag format acuan pada file Word Anda: <br/>
                                    <span class="font-mono bg-white px-1.5 py-0.5 rounded border text-teal-800">[PG]</span>, <span class="font-mono bg-white px-1.5 py-0.5 rounded border text-teal-800">[ESSAY]</span>, <span class="font-mono bg-white px-1.5 py-0.5 rounded border text-teal-800">[BS]</span>, <span class="font-mono bg-white px-1.5 py-0.5 rounded border text-teal-800">[KUNCI: C]</span>
                                </p>

                                <div class="flex flex-wrap justify-center items-center gap-3 pt-2">
                                    <button 
                                        type="button" 
                                        onClick={downloadWordTemplate}
                                        class="bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold px-5 py-2.5 rounded-xl text-xs shadow transition flex items-center space-x-1.5"
                                    >
                                        <span>📥 Download Template Word (.doc)</span>
                                    </button>

                                    <input 
                                        type="file" 
                                        accept=".docx,.doc" 
                                        onChange={handleDocxUpload} 
                                        class="hidden" 
                                        id="docx-input-file" 
                                    />
                                    <label 
                                        htmlFor="docx-input-file" 
                                        class="bg-teal-700 hover:bg-teal-800 text-white font-semibold px-6 py-2.5 rounded-xl text-xs shadow cursor-pointer transition inline-block"
                                    >
                                        {parsingLoading ? 'Membaca Document...' : '📤 Upload File Soal Word'}
                                    </label>
                                </div>
                            </div>

                            {docxPreview.length > 0 && (
                                <div class="space-y-4 border-t pt-6">
                                    <div class="flex justify-between items-center">
                                        <h3 class="font-bold text-slate-800 text-sm">
                                            Preview Hasil Ekstraksi ({docxPreview.length} Soal Terdeteksi)
                                        </h3>
                                        <button 
                                            onClick={handleSaveAllDocx}
                                            class="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-xl font-bold text-xs shadow transition"
                                        >
                                            💾 Simpan Semua Soal Ini ke Bank Soal
                                        </button>
                                    </div>

                                    <div class="space-y-3 max-h-96 overflow-y-auto pr-2">
                                        {docxPreview.map((item, idx) => (
                                            <div key={idx} class="p-4 rounded-xl border border-slate-200 bg-slate-50 text-xs space-y-2">
                                                <div class="flex justify-between font-bold text-slate-700 border-b pb-1">
                                                    <span>Soal #{idx + 1} ({item.jenisSoal})</span>
                                                    <span class="text-teal-700">{item.mapel} - Kelas {item.kelas}</span>
                                                </div>
                                                <div dangerouslySetInnerHTML={{ __html: item.pertanyaanHtml }} class="text-slate-800 font-medium"></div>
                                                {Object.keys(item.opsi).length > 0 && (
                                                    <div class="grid grid-cols-2 gap-1 text-slate-600 pl-3">
                                                        {Object.entries(item.opsi).map(([k, v]) => (
                                                            <div key={k}><b>{k}.</b> {v}</div>
                                                        ))}
                                                    </div>
                                                )}
                                                <div class="text-emerald-700 font-semibold pt-1 border-t border-slate-200">
                                                    Kunci Jawaban: {item.kunciJawaban || '-'}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {inputMethod === 'manual' && (
                        <form onSubmit={handleSaveManual} class="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
                            <div>
                                <label class="block text-xs font-semibold text-slate-700 mb-1">Isi Pertanyaan / Teks Soal</label>
                                <textarea 
                                    rows="4" 
                                    value={manualHtml} 
                                    onChange={e => setManualHtml(e.target.value)} 
                                    placeholder="Tuliskan teks pertanyaan soal di sini..."
                                    required 
                                    class="w-full px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                                ></textarea>
                            </div>

                            {jenisSoal === 'PG' && (
                                <div class="space-y-3 border-t pt-3">
                                    <label class="block text-xs font-bold text-slate-700">Pilihan Jawaban Opsi A - E</label>
                                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div>
                                            <span class="text-xs font-bold text-slate-500">Opsi A:</span>
                                            <input type="text" value={opsiA} onChange={e => setOpsiA(e.target.value)} required class="w-full px-3 py-1.5 border rounded-lg text-sm" />
                                        </div>
                                        <div>
                                            <span class="text-xs font-bold text-slate-500">Opsi B:</span>
                                            <input type="text" value={opsiB} onChange={e => setOpsiB(e.target.value)} required class="w-full px-3 py-1.5 border rounded-lg text-sm" />
                                        </div>
                                        <div>
                                            <span class="text-xs font-bold text-slate-500">Opsi C:</span>
                                            <input type="text" value={opsiC} onChange={e => setOpsiC(e.target.value)} required class="w-full px-3 py-1.5 border rounded-lg text-sm" />
                                        </div>
                                        <div>
                                            <span class="text-xs font-bold text-slate-500">Opsi D:</span>
                                            <input type="text" value={opsiD} onChange={e => setOpsiD(e.target.value)} required class="w-full px-3 py-1.5 border rounded-lg text-sm" />
                                        </div>
                                        <div class="col-span-1 sm:col-span-2">
                                            <span class="text-xs font-bold text-slate-500">Opsi E (Opsional):</span>
                                            <input type="text" value={opsiE} onChange={e => setOpsiE(e.target.value)} class="w-full px-3 py-1.5 border rounded-lg text-sm" />
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div>
                                <label class="block text-xs font-semibold text-slate-700 mb-1">Kunci Jawaban / Pembahasan</label>
                                {jenisSoal === 'PG' ? (
                                    <select value={kunciJawaban} onChange={e => setKunciJawaban(e.target.value)} class="w-full px-3 py-2 border rounded-xl text-sm bg-white">
                                        <option value="A">A</option>
                                        <option value="B">B</option>
                                        <option value="C">C</option>
                                        <option value="D">D</option>
                                        {opsiE && <option value="E">E</option>}
                                    </select>
                                ) : jenisSoal === 'Benar Salah' ? (
                                    <select value={kunciJawaban} onChange={e => setKunciJawaban(e.target.value)} class="w-full px-3 py-2 border rounded-xl text-sm bg-white">
                                        <option value="BENAR">BENAR</option>
                                        <option value="SALAH">SALAH</option>
                                    </select>
                                ) : (
                                    <textarea rows="2" value={kunciJawaban} onChange={e => setKunciJawaban(e.target.value)} placeholder="Masukkan kunci jawaban atau rubrik..." class="w-full px-3 py-2 border rounded-xl text-sm"></textarea>
                                )}
                            </div>

                            <button type="submit" class="bg-teal-700 hover:bg-teal-800 text-white font-bold px-6 py-2.5 rounded-xl text-sm shadow transition">
                                ➕ Tambah Soal Ini Ke Bank
                            </button>
                        </form>
                    )}
                </div>
            );
        }

        function ExamBuilderView({ profile, bankSoal, examConfig, setExamConfig, selectedQuestionIds, setSelectedQuestionIds, setActiveTab, showToast }) {
            const [filterType, setFilterType] = React.useState('Semua');

            const handleClassToggle = (kelasName) => {
                setExamConfig(prev => {
                    const current = prev.targetKelas || [];
                    const exists = current.includes(kelasName);
                    let updated = [];
                    if (exists) {
                        if (current.length === 1) {
                            showToast("Minimal pilih 1 kelas!", "warning");
                            return prev;
                        }
                        updated = current.filter(k => k !== kelasName);
                    } else {
                        updated = [...current, kelasName];
                    }
                    return { ...prev, targetKelas: updated };
                });
            };

            const handleToggleQuestionSelect = (qId) => {
                setSelectedQuestionIds(prev => {
                    if (prev.includes(qId)) {
                        return prev.filter(id => id !== qId);
                    } else {
                        return [...prev, qId];
                    }
                });
            };

            const handleSelectAllFiltered = (filteredList) => {
                const filteredIds = filteredList.map(q => q.id);
                const combined = Array.from(new Set([...selectedQuestionIds, ...filteredIds]));
                setSelectedQuestionIds(combined);
            };

            const handleDeselectAllFiltered = (filteredList) => {
                const filteredIds = filteredList.map(q => q.id);
                setSelectedQuestionIds(prev => prev.filter(id => !filteredIds.includes(id)));
            };

            const availableQuestions = bankSoal.filter(q => {
                const matchMapel = q.mapel === examConfig.mapel;
                const matchKelas = examConfig.targetKelas.includes(q.kelas) || examConfig.targetKelas.length === 0;
                return matchMapel && matchKelas;
            });

            const displayedQuestions = availableQuestions.filter(q => {
                if (filterType === 'Semua') return true;
                if (filterType === 'PG') return q.jenisSoal === 'PG';
                if (filterType === 'Essay') return q.jenisSoal === 'Essay';
                if (filterType === 'Benar Salah') return q.jenisSoal === 'Benar Salah';
                if (filterType === 'Lainnya') return !['PG', 'Essay', 'Benar Salah'].includes(q.jenisSoal);
                return true;
            });

            return (
                <div class="space-y-6">
                    <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                        <h2 class="font-bold text-slate-800 text-lg mb-4 flex items-center gap-2">
                            📝 Form Parameter & Setting Lembar Ujian
                        </h2>

                        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                            <div>
                                <label class="block text-xs font-semibold text-slate-600 mb-1">Mata Pelajaran Ujian</label>
                                <select 
                                    value={examConfig.mapel} 
                                    onChange={e => setExamConfig({ ...examConfig, mapel: e.target.value })}
                                    class="w-full px-3 py-2 border rounded-xl text-sm bg-white font-bold text-teal-800"
                                >
                                    {profile.mapelList.map((m, idx) => (
                                        <option key={idx} value={m}>{m}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label class="block text-xs font-semibold text-slate-600 mb-1">Jenis Asesmen Ujian</label>
                                <select 
                                    value={examConfig.asesmen} 
                                    onChange={e => setExamConfig({ ...examConfig, asesmen: e.target.value })}
                                    class="w-full px-3 py-2 border rounded-xl text-sm bg-white font-medium"
                                >
                                    <option value="Sumatif Harian (PH)">Sumatif Harian (PH)</option>
                                    <option value="Sumatif Tengah Semester (STS)">Sumatif Tengah Semester (STS)</option>
                                    <option value="Sumatif Akhir Semester (SAS)">Sumatif Akhir Semester (SAS)</option>
                                    <option value="Asesmen Akhir Tahun (AAT)">Asesmen Akhir Tahun (AAT)</option>
                                </select>
                            </div>

                            <div>
                                <label class="block text-xs font-semibold text-slate-600 mb-1">Semester & Tahun Ajaran</label>
                                <div class="grid grid-cols-2 gap-2">
                                    <select 
                                        value={examConfig.semester} 
                                        onChange={e => setExamConfig({ ...examConfig, semester: e.target.value })}
                                        class="w-full px-2 py-2 border rounded-xl text-xs bg-white"
                                    >
                                        <option value="Ganjil">Ganjil</option>
                                        <option value="Genap">Genap</option>
                                    </select>
                                    <input 
                                        type="text" 
                                        value={examConfig.tahunAjaran} 
                                        onChange={e => setExamConfig({ ...examConfig, tahunAjaran: e.target.value })}
                                        placeholder="2026/2027" 
                                        class="w-full px-2 py-2 border rounded-xl text-xs" 
                                    />
                                </div>
                            </div>

                            <div>
                                <label class="block text-xs font-semibold text-slate-600 mb-1">Alokasi Waktu Durasi</label>
                                <input 
                                    type="text" 
                                    value={examConfig.durasi} 
                                    onChange={e => setExamConfig({ ...examConfig, durasi: e.target.value })}
                                    placeholder="misal: 90 Menit" 
                                    class="w-full px-3 py-2 border rounded-xl text-sm" 
                                />
                            </div>

                            <div>
                                <label class="block text-xs font-semibold text-slate-600 mb-1">Hari & Tanggal Ujian</label>
                                <input 
                                    type="date" 
                                    value={examConfig.tanggalUjian} 
                                    onChange={e => setExamConfig({ ...examConfig, tanggalUjian: e.target.value })}
                                    class="w-full px-3 py-2 border rounded-xl text-sm" 
                                />
                            </div>

                            <div class="col-span-1 sm:col-span-2 md:col-span-3 border-t border-slate-200 pt-3">
                                <label class="block text-xs font-semibold text-slate-700 mb-2">
                                    Target Kelas Ujian (Multiple Checkbox):
                                </label>
                                <div class="flex flex-wrap gap-3">
                                    {profile.kelasList.map((k, idx) => {
                                        const isChecked = examConfig.targetKelas.includes(k);
                                        return (
                                            <label key={idx} class={`px-3 py-1.5 rounded-xl border text-xs font-bold cursor-pointer transition flex items-center space-x-2 ${isChecked ? 'bg-teal-700 text-white border-teal-800 shadow-sm' : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-100'}`}>
                                                <input 
                                                    type="checkbox" 
                                                    checked={isChecked} 
                                                    onChange={() => handleClassToggle(k)}
                                                    class="rounded text-teal-600 focus:ring-0" 
                                                />
                                                <span>Kelas {k}</span>
                                            </label>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
                        <div class="flex flex-wrap justify-between items-center gap-3">
                            <div class="flex items-center space-x-1 border-b border-slate-200 overflow-x-auto pb-1">
                                {['Semua', 'PG', 'Essay', 'Benar Salah', 'Lainnya'].map((t) => (
                                    <button 
                                        key={t}
                                        onClick={() => setFilterType(t)}
                                        class={`px-4 py-2 text-xs font-bold rounded-lg transition ${filterType === t ? 'bg-teal-800 text-white shadow' : 'text-slate-600 hover:bg-slate-100'}`}
                                    >
                                        {t}
                                    </button>
                                ))}
                            </div>

                            <div class="flex items-center space-x-2">
                                <button 
                                    onClick={() => handleSelectAllFiltered(displayedQuestions)}
                                    class="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-semibold"
                                >
                                    Pilih Semua Tab Ini
                                </button>
                                <button 
                                    onClick={() => handleDeselectAllFiltered(displayedQuestions)}
                                    class="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-semibold"
                                >
                                    Batal Pilih Tab Ini
                                </button>
                            </div>
                        </div>

                        <div class="bg-amber-50 border border-amber-200 p-4 rounded-xl flex justify-between items-center">
                            <div>
                                <span class="font-bold text-amber-900 text-sm">
                                     Total Terpilih: {selectedQuestionIds.length} Soal
                                </span>
                            </div>
                            <button 
                                onClick={() => setActiveTab('draftSoal')}
                                class="bg-amber-500 hover:bg-amber-600 text-slate-900 px-5 py-2 rounded-xl font-bold text-xs shadow-md transition"
                            >
                                🖨️ Generate Draft Soal Now →
                            </button>
                        </div>

                        <div class="space-y-3">
                            {displayedQuestions.length === 0 ? (
                                <div class="text-center py-10 bg-slate-50 rounded-xl border border-dashed text-slate-400 text-sm">
                                    Belum ada soal untuk Mapel <b>{examConfig.mapel}</b> dan Kelas <b>{examConfig.targetKelas.join(', ')}</b>.
                                </div>
                            ) : (
                                displayedQuestions.map((q, idx) => {
                                    const isChecked = selectedQuestionIds.includes(q.id);
                                    return (
                                        <div 
                                            key={q.id}
                                            onClick={() => handleToggleQuestionSelect(q.id)}
                                            class={`p-4 rounded-xl border transition cursor-pointer flex items-start space-x-3 ${isChecked ? 'bg-teal-50/70 border-teal-500 shadow-sm' : 'bg-white border-slate-200 hover:border-slate-300'}`}
                                        >
                                            <input 
                                                type="checkbox" 
                                                checked={isChecked}
                                                onChange={() => {}}
                                                class="mt-1 rounded text-teal-600 focus:ring-0 w-4 h-4 cursor-pointer"
                                            />
                                            <div class="flex-grow space-y-1">
                                                <div class="flex justify-between items-center text-xs">
                                                    <span class="font-bold text-teal-800 bg-teal-100 px-2 py-0.5 rounded">
                                                        [{q.jenisSoal}] #{idx + 1}
                                                    </span>
                                                    <span class="text-slate-400">Kelas: {q.kelas}</span>
                                                </div>
                                                <div dangerouslySetInnerHTML={{ __html: q.pertanyaanHtml }} class="text-sm font-medium text-slate-800"></div>
                                                {Object.keys(q.opsi).length > 0 && (
                                                    <div class="grid grid-cols-2 gap-1 text-xs text-slate-600 pt-1 pl-2">
                                                        {Object.entries(q.opsi).map(([k, v]) => (
                                                            <div key={k}><b>{k}.</b> {v}</div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>
            );
        }

        function DraftSoalView({ profile, examConfig, bankSoal, selectedQuestionIds, setExportFormat, showToast }) {
            const selectedQuestions = bankSoal.filter(q => selectedQuestionIds.includes(q.id));

            const pgList = selectedQuestions.filter(q => q.jenisSoal === 'PG' || q.jenisSoal === 'Soal Cerita');
            const bsList = selectedQuestions.filter(q => q.jenisSoal === 'Benar Salah');
            const essayList = selectedQuestions.filter(q => q.jenisSoal === 'Essay' || !['PG', 'Soal Cerita', 'Benar Salah'].includes(q.jenisSoal));

            return (
                <div class="relative space-y-6 pb-20">
                    {/* Top Action Bar */}
                    <div class="flex flex-wrap justify-between items-center gap-3 bg-white p-4 rounded-xl border shadow-sm no-print">
                        <div>
                            <h2 class="font-bold text-slate-800 text-sm">Pratinjau Lembar Soal Cetak (Paper Preview)</h2>
                            <p class="text-xs text-slate-500">Tampilan Web: Krem Warm (`#FFFDF5`). Saat di-export ke PDF/Word: Otomatis Putih Murni (`#FFFFFF`).</p>
                        </div>
                        <div class="flex items-center space-x-2">
                            <button 
                                onClick={() => setExportFormat('word')}
                                class="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-xl text-xs shadow flex items-center space-x-1.5 transition"
                            >
                                <span>📝 Buat file Word</span>
                            </button>
                            <button 
                                onClick={() => setExportFormat('pdf')}
                                class="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-2 rounded-xl text-xs shadow flex items-center space-x-1.5 transition"
                            >
                                <span>🖨️ Cetak / Download PDF</span>
                            </button>
                        </div>
                    </div>

                    {/* CONTINUOUS PAPER CONTAINER */}
                    <div 
                        id="exam-paper-container" 
                        class="print-paper bg-[#FFFDF5] text-stone-900 border border-stone-300 shadow-xl rounded-md p-8 max-w-4xl mx-auto font-serif leading-relaxed text-sm"
                    >
                        {/* 1. KOP SURAT RESMI SEKOLAH */}
                        <div class="border-b-4 border-double border-stone-800 pb-3 mb-6 page-break-inside-avoid">
                            <div class="flex items-center space-x-4">
                                {profile.logoUrl && (
                                    <div class="w-20 h-20 flex-shrink-0 flex items-center justify-center">
                                        <img src={profile.logoUrl} alt="Logo" class="max-h-full max-w-full object-contain" />
                                    </div>
                                )}
                                <div class="flex-grow text-center font-serif">
                                    <h4 class="text-xs uppercase tracking-widest font-bold text-stone-700">{profile.instansi}</h4>
                                    <h2 class="text-lg font-extrabold uppercase tracking-wider text-stone-900">{profile.namaSekolah}</h2>
                                    <p class="text-[11px] italic text-stone-600 leading-tight">{profile.alamatSekolah}</p>
                                </div>
                            </div>
                        </div>

                        {/* 2. GRID IDENTITAS UJIAN */}
                        <div class="border border-stone-800 rounded mb-6 p-3 text-xs bg-stone-50/50 page-break-inside-avoid">
                            <div class="text-center font-bold uppercase text-stone-800 text-sm border-b border-stone-300 pb-1 mb-2 tracking-wide">
                                {examConfig.asesmen} - SEMESTER {examConfig.semester.toUpperCase()} T.A {examConfig.tahunAjaran}
                            </div>
                            <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 font-sans">
                                <div><span class="font-semibold text-stone-600">Mata Pelajaran:</span> <br/><b>{examConfig.mapel}</b></div>
                                <div><span class="font-semibold text-stone-600">Kelas:</span> <br/><b>{examConfig.targetKelas.join(', ')}</b></div>
                                <div><span class="font-semibold text-stone-600">Alokasi Waktu:</span> <br/><b>{examConfig.durasi}</b></div>
                                <div><span class="font-semibold text-stone-600">Hari / Tanggal:</span> <br/><b>{examConfig.tanggalUjian || '-'}</b></div>
                            </div>
                        </div>

                        <div class="text-[11px] font-sans italic text-stone-600 mb-6 bg-stone-100/60 p-2 rounded border border-stone-200 page-break-inside-avoid">
                            <b>Petunjuk Umum:</b> 1. Berdoalah sebelum mengerjakan. 2. Tuliskan identitas nama pada lembar jawaban. 3. Periksa dan bacalah setiap soal dengan teliti sebelum menjawab.
                        </div>

                        {/* 3. DAFTAR SOAL TERURUT */}

                        {/* BAGIAN I: PILIHAN GANDA */}
                        {pgList.length > 0 && (
                            <div class="mb-8">
                                <h3 class="font-bold border-b border-stone-400 pb-1 mb-4 text-sm tracking-wide uppercase">
                                    BAGIAN I: PILIHAN GANDA
                                </h3>
                                <div class="space-y-5">
                                    {pgList.map((q, idx) => (
                                        <div key={q.id} class="text-justify leading-relaxed page-break-inside-avoid">
                                            <div class="flex space-x-2">
                                                <span class="font-bold">{idx + 1}.</span>
                                                <div dangerouslySetInnerHTML={{ __html: q.pertanyaanHtml }} class="flex-grow"></div>
                                            </div>
                                            {Object.keys(q.opsi).length > 0 && (
                                                <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 pl-6 pt-1 text-xs">
                                                    {Object.entries(q.opsi).map(([key, val]) => (
                                                        <div key={key}><b>{key}.</b> {val}</div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* BAGIAN II: BENAR SALAH */}
                        {bsList.length > 0 && (
                            <div class="mb-8">
                                <h3 class="font-bold border-b border-stone-400 pb-1 mb-4 text-sm tracking-wide uppercase">
                                    BAGIAN II: BENAR / SALAH
                                </h3>
                                <div class="space-y-4">
                                    {bsList.map((q, idx) => (
                                        <div key={q.id} class="flex space-x-2 text-justify page-break-inside-avoid">
                                            <span class="font-bold">{idx + 1}.</span>
                                            <div class="flex-grow">
                                                <div dangerouslySetInnerHTML={{ __html: q.pertanyaanHtml }}></div>
                                                <div class="text-xs font-sans font-semibold text-stone-600 mt-1">
                                                    Lingkari Jawaban: [ BENAR ]  /  [ SALAH ]
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* BAGIAN III: ESSAY / URAN */}
                        {essayList.length > 0 && (
                            <div class="mb-8">
                                <h3 class="font-bold border-b border-stone-400 pb-1 mb-4 text-sm tracking-wide uppercase">
                                    BAGIAN III: ESSAY / URAIAN
                                </h3>
                                <div class="space-y-6">
                                    {essayList.map((q, idx) => (
                                        <div key={q.id} class="text-justify page-break-inside-avoid">
                                            <div class="flex space-x-2">
                                                <span class="font-bold">{idx + 1}.</span>
                                                <div dangerouslySetInnerHTML={{ __html: q.pertanyaanHtml }} class="flex-grow"></div>
                                            </div>
                                            <div class="h-16 border-b border-dashed border-stone-300 mt-2"></div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* 4. KUNCI JAWABAN */}
                        <div id="kunci-jawaban-section" class="border-t-2 border-dashed border-stone-400 pt-6 mt-10 text-xs font-sans page-break-inside-avoid">
                            <h4 class="font-bold text-center uppercase tracking-widest text-stone-800 mb-3">
                                *** KUNCI JAWABAN & PEDOMAN PENILAIAN GURU ***
                            </h4>
                            <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-stone-100 p-3 rounded border">
                                {selectedQuestions.map((q, idx) => (
                                    <div key={q.id} class="truncate">
                                        <b>No.{idx + 1} ({q.jenisSoal}):</b> {q.kunciJawaban || '-'}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* TANDA TANGAN */}
                        <div class="mt-12 pt-6 flex justify-between text-xs font-sans text-stone-800 text-center page-break-inside-avoid">
                            <div>
                                <p>Mengetahui,</p>
                                <p class="font-bold">Kepala {profile.namaSekolah}</p>
                                <div class="h-16"></div>
                                <p class="font-bold underline">{profile.namaKepsek}</p>
                                <p>NIP. {profile.nipKepsek}</p>
                            </div>
                            <div>
                                <p>Guru Mata Pelajaran,</p>
                                <p class="font-bold">{examConfig.mapel}</p>
                                <div class="h-16"></div>
                                <p class="font-bold underline">{profile.namaGuru}</p>
                                <p>NIP. {profile.nikNip}</p>
                            </div>
                        </div>
                    </div>

                    <button 
                        onClick={() => setExportFormat('pdf')}
                        class="fixed bottom-6 right-6 z-40 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white w-14 h-14 rounded-full shadow-2xl flex items-center justify-center font-bold text-2xl transform hover:scale-105 transition no-print"
                        title="Cetak Ujian"
                    >
                        🖨️
                    </button>
                </div>
            );
        }

        function ExportModal({ format, setExportFormat, pdfOptions, setPdfOptions, showToast, examConfig, profile, selectedQuestions, googleConnected, googleConfig }) {
            const [selectedFormat, setSelectedFormat] = React.useState(format);
            const [isExporting, setIsExporting] = React.useState(false);
            const [saveToDrive, setSaveToDrive] = React.useState(false);
            React.useEffect(() => setSelectedFormat(format), [format]);

            const setOption = (key, value) => setPdfOptions(prev => ({ ...prev, [key]: value }));
            const createExport = async () => {
                setIsExporting(true);
                showToast(`Sedang membuat file ${selectedFormat.toUpperCase()}...`, 'info');
                const safePart = value => String(value || '').replace(/[^A-Za-z0-9_-]+/g, '_').replace(/^_+|_+$/g, '') || 'Ujian';
                const extension = selectedFormat === 'pdf' ? 'pdf' : 'doc';
                const fileName = `Naskah_Soal_${safePart(examConfig.mapel)}_${safePart((examConfig.targetKelas || []).join('_'))}.${extension}`;
                let downloaded = false;
                try {
                    const data = { profile, examConfig, questions: selectedQuestions, options: { ...pdfOptions } };
                    const blob = selectedFormat === 'pdf' ? await PdfExporter.createPdf(data) : WordExporter.createWord(data);
                    const downloadUrl = URL.createObjectURL(blob);
                    const anchor = document.createElement('a');
                    anchor.href = downloadUrl;
                    anchor.download = fileName;
                    document.body.appendChild(anchor);
                    anchor.click();
                    anchor.remove();
                    window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000);
                    downloaded = true;
                    if (saveToDrive) {
                        const saved = await GoogleSync.uploadExport(blob, fileName);
                        showToast(`File diunduh dan disimpan di Google Drive: ${saved.name}`);
                    } else {
                        showToast(`File ${selectedFormat.toUpperCase()} berhasil diunduh.`);
                    }
                    setExportFormat(null);
                } catch (error) {
                    console.error('Export error:', error);
                    showToast(downloaded
                        ? `File sudah diunduh, tetapi gagal menyimpan ke Drive: ${error.message}`
                        : `Gagal membuat file: ${error.message}`, 'error');
                } finally {
                    setIsExporting(false);
                }
            };

            return (
                <div class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="export-modal-title">
                    <div class="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border">
                        <div class="bg-teal-800 text-white p-4 font-bold text-base flex justify-between items-center">
                            <span id="export-modal-title">Pengaturan Naskah Ujian</span>
                            <button onClick={() => setExportFormat(null)} disabled={isExporting} aria-label="Tutup" class="text-white hover:text-amber-300 font-bold text-xl">×</button>
                        </div>
                        <div class="p-5 sm:p-6 space-y-5 max-h-[75vh] overflow-y-auto">
                            <div>
                                <label class="block text-xs font-bold text-slate-700 uppercase mb-2">Format file</label>
                                <div class="grid grid-cols-2 gap-2">
                                    {['pdf', 'word'].map(type => (
                                        <button key={type} type="button" onClick={() => setSelectedFormat(type)} class={`px-3 py-2 rounded-lg border text-sm font-bold ${selectedFormat === type ? 'bg-teal-700 text-white border-teal-700' : 'bg-white text-slate-700 border-slate-300'}`}>
                                            {type === 'pdf' ? 'PDF' : 'Microsoft Word (.doc)'}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <fieldset class="space-y-2">
                                <legend class="block text-xs font-bold text-slate-700 uppercase mb-2">Isi naskah</legend>
                                <label class="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                                    <input type="checkbox" checked={pdfOptions.includeKunci} onChange={e => setOption('includeKunci', e.target.checked)} />
                                    <span>Sertakan kunci jawaban (bagian terpisah)</span>
                                </label>
                                <label class="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                                    <input type="checkbox" checked={pdfOptions.includeKop} onChange={e => setOption('includeKop', e.target.checked)} />
                                    <span>Sertakan kop sekolah dan logo</span>
                                </label>
                            </fieldset>
                            <fieldset class="space-y-2">
                                <legend class="block text-xs font-bold text-slate-700 uppercase mb-2">Tanda tangan</legend>
                                <label class="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                                    <input type="checkbox" checked={pdfOptions.includeTTDKepsek} onChange={e => setOption('includeTTDKepsek', e.target.checked)} />
                                    <span>Sertakan tanda tangan kepala madrasah/sekolah</span>
                                </label>
                                <label class="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                                    <input type="checkbox" checked={pdfOptions.includeTTDGuru} onChange={e => setOption('includeTTDGuru', e.target.checked)} />
                                    <span>Sertakan tanda tangan guru mata pelajaran</span>
                                </label>
                            </fieldset>
                            <fieldset class="space-y-2 border-t pt-4">
                                <legend class="block text-xs font-bold text-slate-700 uppercase mb-2">Google Drive</legend>
                                <label class={`flex items-center gap-2 text-sm ${googleConnected && googleConfig.driveFolderId ? 'text-slate-700 cursor-pointer' : 'text-slate-400'}`}>
                                    <input type="checkbox" checked={saveToDrive} disabled={!googleConnected || !googleConfig.driveFolderId} onChange={e => setSaveToDrive(e.target.checked)} />
                                    <span>Simpan salinan ke folder Drive aplikasi</span>
                                </label>
                                {!googleConfig.driveFolderId && <p class="text-xs text-amber-700">Hubungkan akun Google dan buat ruang kerja untuk mengaktifkan penyimpanan Drive.</p>}
                            </fieldset>
                        </div>
                        <div class="bg-slate-50 p-4 border-t flex justify-end gap-2">
                            <button type="button" onClick={() => setExportFormat(null)} disabled={isExporting} class="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200">Batal</button>
                            <button type="button" onClick={createExport} disabled={isExporting || !selectedQuestions.length} class="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white shadow">
                                {isExporting ? 'Memproses...' : `Unduh ${selectedFormat.toUpperCase()}`}
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        function SetupGoogleView({ googleConfig, googleIdentity, syncing, connectGoogle, disconnectGoogle, fetchFromGoogleSheet }) {
            const [busy, setBusy] = React.useState(false);

            const run = async (action) => {
                setBusy(true);
                try {
                    await action();
                } catch (error) {
                    console.error('Google workspace action failed:', error);
                } finally {
                    setBusy(false);
                }
            };

            return (
                <div class="space-y-6 max-w-4xl mx-auto">
                    <section class="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
                        <div>
                            <h2 class="font-bold text-slate-800 text-lg">Koneksi Google pribadi</h2>
                            <p class="text-sm text-slate-600 mt-1">Guru cukup masuk dengan akun Google. Aplikasi akan mencari atau menyiapkan Sheet dan folder Drive secara otomatis.</p>
                        </div>
                        <div class="flex flex-wrap gap-2">
                            <button type="button" disabled={busy || syncing} onClick={() => run(connectGoogle)} class="bg-teal-700 hover:bg-teal-800 disabled:opacity-50 text-white font-bold px-5 py-2.5 rounded-xl text-sm">
                                {googleIdentity ? `Terhubung: ${googleIdentity.email}` : 'Masuk dengan Google'}
                            </button>
                            {googleIdentity && <button type="button" disabled={busy || syncing} onClick={() => run(fetchFromGoogleSheet)} class="bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-bold px-4 py-2 rounded-xl text-sm">Sinkronkan Sheet</button>}
                            {googleIdentity && <button type="button" disabled={busy || syncing} onClick={disconnectGoogle} class="border border-slate-300 px-4 py-2 rounded-xl text-sm text-slate-700">Putuskan akun</button>}
                        </div>
                        {googleIdentity && googleConfig.spreadsheetId && (
                            <div class="space-y-2 text-sm">
                                <p class="text-emerald-800 font-semibold">Ruang kerja pribadi siap digunakan.</p>
                                {googleConfig.spreadsheetUrl && <p><a href={googleConfig.spreadsheetUrl} target="_blank" rel="noreferrer" class="text-teal-700 underline">Buka spreadsheet Bank Soal</a></p>}
                                {googleConfig.driveFolderUrl && <p><a href={googleConfig.driveFolderUrl} target="_blank" rel="noreferrer" class="text-teal-700 underline">Buka folder hasil ekspor</a></p>}
                            </div>
                        )}
                        <p class="text-xs text-slate-500">Akun harus diotorisasi kembali jika sesi browser berakhir. Token tidak disimpan sebagai teks permanen pada perangkat.</p>
                    </section>
                    <p class="text-xs text-slate-500">Koneksi Google disiapkan satu kali oleh pengelola aplikasi. Guru tidak perlu mengisi Client ID atau mencari ID Sheet/Drive.</p>
                </div>
            );
        }

        // Render Application to DOM
        const root = ReactDOM.createRoot(document.getElementById('root'));
        root.render(<App />);
    