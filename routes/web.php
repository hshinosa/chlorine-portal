<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', function () {
        return redirect()->route('admin.dashboard');
    })->name('dashboard');

    Route::get('admin/dashboard', function () {
        return Inertia::render('admin/dashboard');
    })->name('admin.dashboard');

    Route::get('admin/sertifikasi-kompetensi', function () {
        return Inertia::render('admin/sertifikasi-kompetensi');
    })->name('admin.sertifikasi-kompetensi');

    Route::get('admin/praktik-kerja-lapangan', function () {
        return Inertia::render('admin/praktik-kerja-lapangan');
    })->name('admin.praktik-kerja-lapangan');

    Route::get('admin/penilaian-pkl', function () {
        return Inertia::render('admin/penilaian-pkl');
    })->name('admin.penilaian-pkl');

    Route::get('admin/penilaian-pkl/{id}', function ($id) {
        return Inertia::render('admin/detail-penilaian-pkl', [
            'pesertaId' => $id
        ]);
    })->name('admin.detail-penilaian-pkl');

    Route::get('admin/penilaian-sertifikasi', function () {
        return Inertia::render('admin/penilaian-sertifikasi');
    })->name('admin.penilaian-sertifikasi');

    Route::get('admin/penilaian-sertifikasi/{id}', function ($id) {
        return Inertia::render('admin/detail-penilaian-sertifikasi', [
            'pesertaId' => $id
        ]);
    })->name('admin.detail-penilaian-sertifikasi');

    Route::get('admin/penilaian-sertifikasi/{sertifikasiId}/batch/{batchId}', function ($sertifikasiId, $batchId) {
        return Inertia::render('admin/batch-penilaian-sertifikasi', [
            'sertifikasiId' => $sertifikasiId,
            'batchId' => $batchId
        ]);
    })->name('admin.batch-penilaian-sertifikasi');

    Route::get('admin/manajemen-blog', function () {
        return Inertia::render('admin/manajemen-blog');
    })->name('admin.manajemen-blog');

    Route::get('admin/manajemen-video', function () {
        return Inertia::render('admin/manajemen-video');
    })->name('admin.manajemen-video');

    Route::get('admin/form-sertifikasi', function () {
        return Inertia::render('admin/form-sertifikasi');
    })->name('admin.form-sertifikasi');

    Route::get('admin/form-sertifikasi/{id}', function ($id) {
        // Ambil data sertifikasi berdasarkan ID dari database
        // Untuk sementara menggunakan data dummy
        $sertifikasiData = [
            'namaSertifikasi' => 'Digital Marketing',
            'jenisSertifikasi' => 'Industri',
            'deskripsi' => 'Program sertifikasi untuk digital marketing specialist',
            'namaAsesor' => 'Ahmad Jaelani',
            'jabatanAsesor' => 'Senior Digital Marketing',
            'instansiAsesor' => 'PT Digital Indonesia',
            'tipeSertifikat' => 'Sertifikat Kompetensi',
            'modul' => [
                ['id' => 1, 'judul' => 'Pengenalan Digital Marketing', 'deskripsi' => 'Dasar-dasar digital marketing'],
                ['id' => 2, 'judul' => 'SEO & SEM', 'deskripsi' => 'Search Engine Optimization dan Marketing']
            ],
            'batch' => [
                ['id' => 1, 'nama' => 'Batch 1', 'tanggalMulai' => '2025-05-21', 'tanggalSelesai' => '2025-06-21', 'status' => 'Aktif']
            ]
        ];
        
        return Inertia::render('admin/form-sertifikasi', [
            'sertifikasiId' => $id,
            'sertifikasiData' => $sertifikasiData
        ]);
    })->name('admin.form-sertifikasi.edit');

    Route::get('admin/detail-sertifikasi/{id}', function ($id) {
        // Ambil data detail sertifikasi berdasarkan ID dari database
        // Untuk sementara menggunakan data dummy
        $sertifikasiDetail = [
            'id' => (int) $id,
            'thumbnail' => '/placeholder-thumb.jpg',
            'namaSertifikasi' => 'Digital Marketing Professional',
            'jenisSertifikasi' => 'Industri',
            'jadwalSertifikasi' => '21-05-2025 sd 21-06-2025',
            'assessor' => 'Ahmad Jaelani',
            'jabatanAssessor' => 'Senior Digital Marketing Specialist',
            'instansiAssessor' => 'PT Digital Indonesia',
            'pengalamanAssessor' => '8+ Tahun',
            'deskripsi' => 'Program sertifikasi Digital Marketing Professional dirancang untuk memberikan pemahaman mendalam tentang strategi pemasaran digital modern. Peserta akan mempelajari berbagai aspek pemasaran digital mulai dari SEO, SEM, Social Media Marketing, Email Marketing, hingga Analytics dan ROI measurement.',
            'materi' => [
                [
                    'judul' => 'Introduction to Digital Marketing',
                    'deskripsi' => 'Pengenalan dasar tentang digital marketing dan ekosistemnya',
                    'poinPembelajaran' => [
                        'Konsep dasar digital marketing',
                        'Perbedaan traditional vs digital marketing',
                        'Digital marketing channels overview',
                        'Customer journey dalam digital era',
                        'ROI dan metrics dalam digital marketing'
                    ]
                ],
                [
                    'judul' => 'Search Engine Optimization (SEO)',
                    'deskripsi' => 'Teknik optimasi website untuk mesin pencari',
                    'poinPembelajaran' => [
                        'On-page SEO techniques',
                        'Off-page SEO strategies',
                        'Keyword research dan analysis',
                        'Technical SEO fundamentals',
                        'SEO tools dan measurement'
                    ]
                ],
                [
                    'judul' => 'Search Engine Marketing (SEM)',
                    'deskripsi' => 'Strategi pemasaran berbayar di mesin pencari',
                    'poinPembelajaran' => [
                        'Google Ads campaign setup',
                        'Keyword bidding strategies',
                        'Ad copywriting techniques',
                        'Landing page optimization',
                        'Campaign performance analysis'
                    ]
                ],
                [
                    'judul' => 'Social Media Marketing Strategy',
                    'deskripsi' => 'Pengembangan strategi pemasaran di media sosial',
                    'poinPembelajaran' => [
                        'Platform selection strategy',
                        'Content planning dan scheduling',
                        'Community management',
                        'Social media advertising',
                        'Influencer marketing basics'
                    ]
                ],
                [
                    'judul' => 'Content Marketing',
                    'deskripsi' => 'Pembuatan dan distribusi konten yang efektif',
                    'poinPembelajaran' => [
                        'Content strategy development',
                        'Content types dan formats',
                        'Editorial calendar management',
                        'Content distribution channels',
                        'Content performance measurement'
                    ]
                ],
                [
                    'judul' => 'Email Marketing',
                    'deskripsi' => 'Strategi pemasaran melalui email yang efektif',
                    'poinPembelajaran' => [
                        'Email list building techniques',
                        'Email design dan copywriting',
                        'Automation dan segmentation',
                        'A/B testing strategies',
                        'Email deliverability optimization'
                    ]
                ],
                [
                    'judul' => 'Digital Analytics',
                    'deskripsi' => 'Analisis data dan performance digital marketing',
                    'poinPembelajaran' => [
                        'Google Analytics setup dan configuration',
                        'Key metrics identification',
                        'Data visualization techniques',
                        'Report creation dan interpretation',
                        'Data-driven decision making'
                    ]
                ],
                [
                    'judul' => 'Conversion Rate Optimization',
                    'deskripsi' => 'Teknik meningkatkan konversi website dan campaign',
                    'poinPembelajaran' => [
                        'Conversion funnel analysis',
                        'A/B testing methodologies',
                        'User experience optimization',
                        'Landing page best practices',
                        'Conversion tracking setup'
                    ]
                ]
            ],
            'batch' => [
                [
                    'id' => 1,
                    'nama' => 'Batch 1',
                    'tanggalMulai' => '2025-05-21',
                    'tanggalSelesai' => '2025-06-21',
                    'status' => 'Aktif',
                    'kuota' => 20,
                    'terdaftar' => 12
                ],
                [
                    'id' => 2,
                    'nama' => 'Batch 2',
                    'tanggalMulai' => '2025-07-15',
                    'tanggalSelesai' => '2025-08-15',
                    'status' => 'Draf',
                    'kuota' => 15,
                    'terdaftar' => 0
                ],
                [
                    'id' => 3,
                    'nama' => 'Batch 3',
                    'tanggalMulai' => '2025-03-01',
                    'tanggalSelesai' => '2025-04-01',
                    'status' => 'Selesai',
                    'kuota' => 25,
                    'terdaftar' => 25
                ],
                [
                    'id' => 4,
                    'nama' => 'Batch 4',
                    'tanggalMulai' => '2025-09-10',
                    'tanggalSelesai' => '2025-10-10',
                    'status' => 'Draf',
                    'kuota' => 30,
                    'terdaftar' => 5
                ],
                [
                    'id' => 5,
                    'nama' => 'Batch 5',
                    'tanggalMulai' => '2025-11-01',
                    'tanggalSelesai' => '2025-12-01',
                    'status' => 'Draf',
                    'kuota' => 20,
                    'terdaftar' => 8
                ],
                [
                    'id' => 6,
                    'nama' => 'Batch 6',
                    'tanggalMulai' => '2025-01-15',
                    'tanggalSelesai' => '2025-02-15',
                    'status' => 'Selesai',
                    'kuota' => 25,
                    'terdaftar' => 20
                ]
            ],
            'kapasitas' => 30,
            'pesertaTerdaftar' => 18,
            'status' => 'Aktif',
            'createdAt' => '2024-12-01',
            'updatedAt' => '2024-12-15'
        ];
        
        return Inertia::render('admin/detail-sertifikasi', [
            'id' => $id,
            'sertifikasi' => $sertifikasiDetail
        ]);
    })->name('admin.detail-sertifikasi');

});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
require __DIR__.'/admin.php';
