-- ===============================================
-- SKEMA DATABASE MYSQL UNTUK SISTEM KOMPETENSIA
-- ===============================================
-- Dibuat berdasarkan analisis seluruh interface dan struktur data
-- dari sistem frontend React/TypeScript dengan Laravel backend

-- Set character set dan collation
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ===============================================
-- TABEL MASTER DATA
-- ===============================================

-- Tabel users untuk autentikasi dan manajemen pengguna
CREATE TABLE users (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    email_verified_at TIMESTAMP NULL,
    password VARCHAR(255) NOT NULL,
    avatar VARCHAR(255) NULL,
    role ENUM('admin', 'assessor', 'peserta') DEFAULT 'peserta',
    remember_token VARCHAR(100) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabel biodata peserta (detil informasi lengkap peserta)
CREATE TABLE biodata_peserta (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    nama VARCHAR(255) NOT NULL,
    tempat_tanggal_lahir VARCHAR(255) NOT NULL,
    alamat TEXT NOT NULL,
    email VARCHAR(255) NOT NULL,
    no_telepon VARCHAR(20) NOT NULL,
    instansi VARCHAR(255) NULL,
    jabatan VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===============================================
-- TABEL SERTIFIKASI KOMPETENSI
-- ===============================================

-- Tabel master sertifikasi
CREATE TABLE sertifikasi (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    thumbnail VARCHAR(255) NULL,
    nama_sertifikasi VARCHAR(255) NOT NULL,
    jenis_sertifikasi ENUM('BNSP', 'Industri') NOT NULL,
    deskripsi TEXT NULL,
    jadwal_sertifikasi VARCHAR(255) NOT NULL,
    assessor_id BIGINT UNSIGNED NOT NULL,
    nama_asesor VARCHAR(255) NOT NULL,
    jabatan_asesor VARCHAR(255) NULL,
    instansi_asesor VARCHAR(255) NULL,
    pengalaman_asesor VARCHAR(255) NULL,
    tipe_sertifikat VARCHAR(255) DEFAULT 'Sertifikat Kompetensi',
    kapasitas INT DEFAULT 30,
    peserta_terdaftar INT DEFAULT 0,
    status ENUM('Aktif', 'Draf', 'Ditutup') DEFAULT 'Draf',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (assessor_id) REFERENCES users(id) ON DELETE RESTRICT,
    INDEX idx_assessor (assessor_id),
    INDEX idx_status (status),
    INDEX idx_jenis (jenis_sertifikasi)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabel materi/modul sertifikasi
CREATE TABLE materi_sertifikasi (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    sertifikasi_id BIGINT UNSIGNED NOT NULL,
    judul VARCHAR(255) NOT NULL,
    deskripsi TEXT NOT NULL,
    urutan INT NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (sertifikasi_id) REFERENCES sertifikasi(id) ON DELETE CASCADE,
    INDEX idx_sertifikasi (sertifikasi_id),
    INDEX idx_urutan (urutan)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabel poin pembelajaran untuk setiap materi
CREATE TABLE poin_pembelajaran (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    materi_id BIGINT UNSIGNED NOT NULL,
    poin_pembelajaran TEXT NOT NULL,
    urutan INT NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (materi_id) REFERENCES materi_sertifikasi(id) ON DELETE CASCADE,
    INDEX idx_materi (materi_id),
    INDEX idx_urutan (urutan)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabel batch untuk setiap sertifikasi
CREATE TABLE batch_sertifikasi (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    sertifikasi_id BIGINT UNSIGNED NOT NULL,
    nama_batch VARCHAR(255) NOT NULL,
    penyelenggara VARCHAR(255) NOT NULL,
    tanggal_mulai DATE NOT NULL,
    tanggal_selesai DATE NOT NULL,
    kuota INT NOT NULL DEFAULT 20,
    terdaftar INT DEFAULT 0,
    status ENUM('Aktif', 'Selesai', 'Akan Datang', 'Draf', 'Ditutup') DEFAULT 'Draf',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (sertifikasi_id) REFERENCES sertifikasi(id) ON DELETE CASCADE,
    INDEX idx_sertifikasi (sertifikasi_id),
    INDEX idx_status (status),
    INDEX idx_tanggal (tanggal_mulai, tanggal_selesai)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===============================================
-- TABEL PRAKTIK KERJA LAPANGAN (PKL)
-- ===============================================

-- Tabel posisi PKL
CREATE TABLE posisi_pkl (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nama_posisi VARCHAR(255) NOT NULL,
    kategori_posisi VARCHAR(255) NOT NULL,
    durasi VARCHAR(255) NOT NULL,
    wfh_wfo_hybrid ENUM('WFH', 'WFO', 'Hybrid') NOT NULL,
    deskripsi TEXT NOT NULL,
    peserta_terdaftar INT DEFAULT 0,
    kuota INT DEFAULT 0,
    status ENUM('Aktif', 'Draf', 'Ditutup') DEFAULT 'Draf',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_kategori (kategori_posisi),
    INDEX idx_status (status),
    INDEX idx_work_type (wfh_wfo_hybrid)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabel requirements untuk posisi PKL
CREATE TABLE pkl_requirements (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    posisi_pkl_id BIGINT UNSIGNED NOT NULL,
    requirement TEXT NOT NULL,
    urutan INT NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (posisi_pkl_id) REFERENCES posisi_pkl(id) ON DELETE CASCADE,
    INDEX idx_posisi (posisi_pkl_id),
    INDEX idx_urutan (urutan)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabel benefits untuk posisi PKL
CREATE TABLE pkl_benefits (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    posisi_pkl_id BIGINT UNSIGNED NOT NULL,
    benefit TEXT NOT NULL,
    urutan INT NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (posisi_pkl_id) REFERENCES posisi_pkl(id) ON DELETE CASCADE,
    INDEX idx_posisi (posisi_pkl_id),
    INDEX idx_urutan (urutan)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===============================================
-- TABEL PENDAFTARAN DAN APPROVAL
-- ===============================================

-- Tabel pendaftaran (untuk sertifikasi dan PKL)
CREATE TABLE pendaftaran (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    jenis_pendaftaran ENUM('Sertifikasi Kompetensi', 'Praktik Kerja Lapangan') NOT NULL,
    sertifikasi_id BIGINT UNSIGNED NULL,
    batch_id BIGINT UNSIGNED NULL,
    posisi_pkl_id BIGINT UNSIGNED NULL,
    tanggal_pendaftaran DATE NOT NULL,
    status ENUM('Pengajuan', 'Disetujui', 'Ditolak') DEFAULT 'Pengajuan',
    alasan_penolakan TEXT NULL,
    approved_by BIGINT UNSIGNED NULL,
    approved_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (sertifikasi_id) REFERENCES sertifikasi(id) ON DELETE SET NULL,
    FOREIGN KEY (batch_id) REFERENCES batch_sertifikasi(id) ON DELETE SET NULL,
    FOREIGN KEY (posisi_pkl_id) REFERENCES posisi_pkl(id) ON DELETE SET NULL,
    FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user (user_id),
    INDEX idx_jenis (jenis_pendaftaran),
    INDEX idx_status (status),
    INDEX idx_tanggal (tanggal_pendaftaran),
    INDEX idx_sertifikasi (sertifikasi_id),
    INDEX idx_batch (batch_id),
    INDEX idx_pkl (posisi_pkl_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===============================================
-- TABEL PESERTA DAN PROGRESS
-- ===============================================

-- Tabel peserta batch sertifikasi (setelah approval)
CREATE TABLE peserta_batch (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    pendaftaran_id BIGINT UNSIGNED NOT NULL,
    batch_id BIGINT UNSIGNED NOT NULL,
    user_id BIGINT UNSIGNED NOT NULL,
    status_tugas_akhir ENUM('Sudah Mengumpulkan', 'Belum Mengumpulkan') DEFAULT 'Belum Mengumpulkan',
    status_penilaian ENUM('Belum Dinilai', 'Lulus', 'Tidak Lulus') DEFAULT 'Belum Dinilai',
    progress INT DEFAULT 0,
    tanggal_ujian DATE NULL,
    nilai_akhir DECIMAL(5,2) NULL,
    catatan_assessor TEXT NULL,
    sertifikat_issued BOOLEAN DEFAULT FALSE,
    sertifikat_file VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (pendaftaran_id) REFERENCES pendaftaran(id) ON DELETE CASCADE,
    FOREIGN KEY (batch_id) REFERENCES batch_sertifikasi(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_pendaftaran (pendaftaran_id),
    INDEX idx_batch (batch_id),
    INDEX idx_user (user_id),
    INDEX idx_status_tugas (status_tugas_akhir),
    INDEX idx_status_penilaian (status_penilaian)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabel peserta PKL (setelah approval)
CREATE TABLE peserta_pkl (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    pendaftaran_id BIGINT UNSIGNED NOT NULL,
    posisi_pkl_id BIGINT UNSIGNED NOT NULL,
    user_id BIGINT UNSIGNED NOT NULL,
    tanggal_mulai DATE NULL,
    tanggal_selesai DATE NULL,
    status_pkl ENUM('Belum Mulai', 'Sedang Berlangsung', 'Selesai', 'Dibatalkan') DEFAULT 'Belum Mulai',
    status_tugas_akhir ENUM('Sudah Mengumpulkan', 'Belum Mengumpulkan') DEFAULT 'Belum Mengumpulkan',
    status_penilaian ENUM('Belum Dinilai', 'Lulus', 'Tidak Lulus') DEFAULT 'Belum Dinilai',
    progress INT DEFAULT 0,
    nilai_akhir DECIMAL(5,2) NULL,
    catatan_mentor TEXT NULL,
    mentor_id BIGINT UNSIGNED NULL,
    sertifikat_issued BOOLEAN DEFAULT FALSE,
    sertifikat_file VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (pendaftaran_id) REFERENCES pendaftaran(id) ON DELETE CASCADE,
    FOREIGN KEY (posisi_pkl_id) REFERENCES posisi_pkl(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (mentor_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_pendaftaran (pendaftaran_id),
    INDEX idx_posisi (posisi_pkl_id),
    INDEX idx_user (user_id),
    INDEX idx_mentor (mentor_id),
    INDEX idx_status_pkl (status_pkl),
    INDEX idx_status_tugas (status_tugas_akhir),
    INDEX idx_status_penilaian (status_penilaian)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===============================================
-- TABEL PENILAIAN DAN TUGAS
-- ===============================================

-- Tabel tugas akhir (untuk sertifikasi dan PKL)
CREATE TABLE tugas_akhir (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    peserta_batch_id BIGINT UNSIGNED NULL,
    peserta_pkl_id BIGINT UNSIGNED NULL,
    judul_tugas VARCHAR(255) NOT NULL,
    deskripsi_tugas TEXT NULL,
    file_tugas VARCHAR(255) NULL,
    tanggal_upload TIMESTAMP NULL,
    tanggal_deadline DATE NOT NULL,
    status ENUM('Belum Upload', 'Sudah Upload', 'Dinilai') DEFAULT 'Belum Upload',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (peserta_batch_id) REFERENCES peserta_batch(id) ON DELETE CASCADE,
    FOREIGN KEY (peserta_pkl_id) REFERENCES peserta_pkl(id) ON DELETE CASCADE,
    INDEX idx_peserta_batch (peserta_batch_id),
    INDEX idx_peserta_pkl (peserta_pkl_id),
    INDEX idx_status (status),
    INDEX idx_deadline (tanggal_deadline)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabel penilaian (dari assessor/mentor)
CREATE TABLE penilaian (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    tugas_akhir_id BIGINT UNSIGNED NOT NULL,
    penilai_id BIGINT UNSIGNED NOT NULL,
    nilai_teori DECIMAL(5,2) NULL,
    nilai_praktik DECIMAL(5,2) NULL,
    nilai_akhir DECIMAL(5,2) NOT NULL,
    status_kelulusan ENUM('Lulus', 'Tidak Lulus') NOT NULL,
    catatan TEXT NULL,
    feedback TEXT NULL,
    tanggal_penilaian TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (tugas_akhir_id) REFERENCES tugas_akhir(id) ON DELETE CASCADE,
    FOREIGN KEY (penilai_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_tugas (tugas_akhir_id),
    INDEX idx_penilai (penilai_id),
    INDEX idx_status (status_kelulusan),
    INDEX idx_tanggal (tanggal_penilaian)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===============================================
-- TABEL MANAJEMEN KONTEN
-- ===============================================

-- Tabel blog
CREATE TABLE blog (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nama_artikel VARCHAR(255) NOT NULL,
    jenis_konten ENUM('Blog') DEFAULT 'Blog',
    deskripsi TEXT NOT NULL,
    konten LONGTEXT NULL,
    thumbnail VARCHAR(255) NULL,
    status ENUM('Publish', 'Draf') DEFAULT 'Draf',
    penulis VARCHAR(255) NOT NULL,
    views INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    published_at TIMESTAMP NULL,
    INDEX idx_status (status),
    INDEX idx_penulis (penulis),
    INDEX idx_published (published_at),
    FULLTEXT idx_content (nama_artikel, deskripsi, konten)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabel video
CREATE TABLE video (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nama_artikel VARCHAR(255) NOT NULL,
    jenis_konten ENUM('Video') DEFAULT 'Video',
    deskripsi TEXT NOT NULL,
    link_video VARCHAR(500) NULL,
    thumbnail VARCHAR(255) NULL,
    durasi VARCHAR(20) NULL,
    status ENUM('Publish', 'Draf') DEFAULT 'Draf',
    penulis VARCHAR(255) NOT NULL,
    views INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    published_at TIMESTAMP NULL,
    INDEX idx_status (status),
    INDEX idx_penulis (penulis),
    INDEX idx_published (published_at),
    FULLTEXT idx_content (nama_artikel, deskripsi)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===============================================
-- TABEL FILTERING DAN RIWAYAT
-- ===============================================

-- Tabel untuk menyimpan log aktivitas sistem
CREATE TABLE activity_logs (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NULL,
    action VARCHAR(255) NOT NULL,
    description TEXT NULL,
    model_type VARCHAR(255) NULL,
    model_id BIGINT UNSIGNED NULL,
    ip_address VARCHAR(45) NULL,
    user_agent TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user (user_id),
    INDEX idx_action (action),
    INDEX idx_model (model_type, model_id),
    INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabel untuk notifikasi sistem
CREATE TABLE notifications (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type ENUM('info', 'success', 'warning', 'error') DEFAULT 'info',
    is_read BOOLEAN DEFAULT FALSE,
    action_url VARCHAR(500) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user (user_id),
    INDEX idx_read (is_read),
    INDEX idx_type (type),
    INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===============================================
-- TABEL SETTING SISTEM
-- ===============================================

-- Tabel untuk pengaturan sistem
CREATE TABLE system_settings (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    key_name VARCHAR(255) UNIQUE NOT NULL,
    value TEXT NULL,
    description TEXT NULL,
    type ENUM('string', 'number', 'boolean', 'json') DEFAULT 'string',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_key (key_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===============================================
-- INSERT DATA DEFAULT/SEED
-- ===============================================

-- Insert default admin user
INSERT INTO users (name, email, password, role, email_verified_at) VALUES
('Administrator', 'admin@kompetensia.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', NOW()),
('Ahmad Jaelani', 'ahmad.jaelani@kompetensia.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'assessor', NOW()),
('Dr. Rahman', 'rahman@kompetensia.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'assessor', NOW());

-- Insert default system settings
INSERT INTO system_settings (key_name, value, description, type) VALUES
('site_name', 'Kompetensia', 'Nama website sistem', 'string'),
('max_upload_size', '10485760', 'Maksimal ukuran upload file dalam bytes (10MB)', 'number'),
('enable_notifications', 'true', 'Aktifkan sistem notifikasi', 'boolean'),
('default_batch_quota', '20', 'Kuota default untuk batch sertifikasi', 'number'),
('email_verification_required', 'true', 'Wajib verifikasi email untuk registrasi', 'boolean');

-- ===============================================
-- VIEWS UNTUK LAPORAN DAN DASHBOARD
-- ===============================================

-- View untuk dashboard statistik
CREATE VIEW dashboard_stats AS
SELECT 
    (SELECT COUNT(*) FROM users WHERE role = 'peserta') as total_peserta,
    (SELECT COUNT(*) FROM users WHERE role = 'assessor') as total_assessor,
    (SELECT COUNT(*) FROM sertifikasi WHERE status = 'Aktif') as total_sertifikasi_aktif,
    (SELECT COUNT(*) FROM posisi_pkl WHERE status = 'Aktif') as total_pkl_aktif,
    (SELECT COUNT(*) FROM pendaftaran WHERE status = 'Pengajuan') as pending_approvals,
    (SELECT COUNT(*) FROM peserta_batch WHERE status_penilaian = 'Lulus') as total_lulus_sertifikasi,
    (SELECT COUNT(*) FROM peserta_pkl WHERE status_penilaian = 'Lulus') as total_lulus_pkl;

-- View untuk laporan peserta per batch
CREATE VIEW laporan_peserta_batch AS
SELECT 
    bs.id as batch_id,
    bs.nama_batch,
    s.nama_sertifikasi,
    s.assessor_id,
    u_assessor.name as nama_assessor,
    bs.tanggal_mulai,
    bs.tanggal_selesai,
    bs.kuota,
    bs.terdaftar,
    COUNT(pb.id) as jumlah_peserta_aktif,
    COUNT(CASE WHEN pb.status_penilaian = 'Lulus' THEN 1 END) as jumlah_lulus,
    COUNT(CASE WHEN pb.status_penilaian = 'Tidak Lulus' THEN 1 END) as jumlah_tidak_lulus,
    COUNT(CASE WHEN pb.status_penilaian = 'Belum Dinilai' THEN 1 END) as belum_dinilai
FROM batch_sertifikasi bs
LEFT JOIN sertifikasi s ON bs.sertifikasi_id = s.id
LEFT JOIN users u_assessor ON s.assessor_id = u_assessor.id
LEFT JOIN peserta_batch pb ON bs.id = pb.batch_id
GROUP BY bs.id, bs.nama_batch, s.nama_sertifikasi, s.assessor_id, u_assessor.name, 
         bs.tanggal_mulai, bs.tanggal_selesai, bs.kuota, bs.terdaftar;

-- View untuk laporan konten
CREATE VIEW laporan_konten AS
SELECT 
    'Blog' as jenis_konten,
    COUNT(*) as total_konten,
    COUNT(CASE WHEN status = 'Publish' THEN 1 END) as publish,
    COUNT(CASE WHEN status = 'Draf' THEN 1 END) as draf,
    SUM(views) as total_views
FROM blog
UNION ALL
SELECT 
    'Video' as jenis_konten,
    COUNT(*) as total_konten,
    COUNT(CASE WHEN status = 'Publish' THEN 1 END) as publish,
    COUNT(CASE WHEN status = 'Draf' THEN 1 END) as draf,
    SUM(views) as total_views
FROM video;

-- ===============================================
-- TRIGGERS UNTUK AUTO UPDATE
-- ===============================================

-- Trigger untuk update jumlah terdaftar di batch_sertifikasi
DELIMITER $$
CREATE TRIGGER update_batch_terdaftar AFTER INSERT ON peserta_batch
FOR EACH ROW
BEGIN
    UPDATE batch_sertifikasi 
    SET terdaftar = (
        SELECT COUNT(*) FROM peserta_batch WHERE batch_id = NEW.batch_id
    ) 
    WHERE id = NEW.batch_id;
END$$

CREATE TRIGGER update_batch_terdaftar_delete AFTER DELETE ON peserta_batch
FOR EACH ROW
BEGIN
    UPDATE batch_sertifikasi 
    SET terdaftar = (
        SELECT COUNT(*) FROM peserta_batch WHERE batch_id = OLD.batch_id
    ) 
    WHERE id = OLD.batch_id;
END$$

-- Trigger untuk update jumlah terdaftar di posisi_pkl
CREATE TRIGGER update_pkl_terdaftar AFTER INSERT ON peserta_pkl
FOR EACH ROW
BEGIN
    UPDATE posisi_pkl 
    SET peserta_terdaftar = (
        SELECT COUNT(*) FROM peserta_pkl WHERE posisi_pkl_id = NEW.posisi_pkl_id
    ) 
    WHERE id = NEW.posisi_pkl_id;
END$$

CREATE TRIGGER update_pkl_terdaftar_delete AFTER DELETE ON peserta_pkl
FOR EACH ROW
BEGIN
    UPDATE posisi_pkl 
    SET peserta_terdaftar = (
        SELECT COUNT(*) FROM peserta_pkl WHERE posisi_pkl_id = OLD.posisi_pkl_id
    ) 
    WHERE id = OLD.posisi_pkl_id;
END$$

-- Trigger untuk auto update published_at saat status blog/video menjadi Publish
CREATE TRIGGER blog_published_at BEFORE UPDATE ON blog
FOR EACH ROW
BEGIN
    IF NEW.status = 'Publish' AND OLD.status != 'Publish' THEN
        SET NEW.published_at = NOW();
    END IF;
END$$

CREATE TRIGGER video_published_at BEFORE UPDATE ON video
FOR EACH ROW
BEGIN
    IF NEW.status = 'Publish' AND OLD.status != 'Publish' THEN
        SET NEW.published_at = NOW();
    END IF;
END$$

DELIMITER ;

-- Reset foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- ===============================================
-- KOMENTAR DOKUMENTASI SKEMA
-- ===============================================

/*
DOKUMENTASI SKEMA DATABASE KOMPETENSIA:

1. TABEL MASTER DATA:
   - users: Data pengguna dengan role (admin, assessor, peserta)
   - biodata_peserta: Informasi lengkap peserta

2. SERTIFIKASI KOMPETENSI:
   - sertifikasi: Master data sertifikasi
   - materi_sertifikasi: Materi/modul per sertifikasi
   - poin_pembelajaran: Detail pembelajaran per materi
   - batch_sertifikasi: Batch pelaksanaan sertifikasi

3. PRAKTIK KERJA LAPANGAN:
   - posisi_pkl: Posisi PKL yang tersedia
   - pkl_requirements: Persyaratan per posisi
   - pkl_benefits: Benefit per posisi

4. PENDAFTARAN & PESERTA:
   - pendaftaran: Data pendaftaran (sertifikasi/PKL)
   - peserta_batch: Peserta sertifikasi per batch
   - peserta_pkl: Peserta PKL per posisi

5. PENILAIAN:
   - tugas_akhir: Data tugas akhir peserta
   - penilaian: Hasil penilaian dari assessor/mentor

6. KONTEN MANAGEMENT:
   - blog: Artikel blog
   - video: Konten video

7. SISTEM:
   - activity_logs: Log aktivitas sistem
   - notifications: Notifikasi pengguna
   - system_settings: Pengaturan sistem

8. VIEWS & TRIGGERS:
   - dashboard_stats: Statistik untuk dashboard
   - laporan_peserta_batch: Laporan per batch
   - laporan_konten: Statistik konten
   - Auto-update triggers untuk counters

RELASI UTAMA:
- users -> biodata_peserta (1:1)
- sertifikasi -> batch_sertifikasi (1:n)
- sertifikasi -> materi_sertifikasi (1:n)
- pendaftaran -> peserta_batch/peserta_pkl (1:1)
- peserta -> tugas_akhir -> penilaian (1:1:1)

INDEX OPTIMIZATIONS:
- Foreign keys semua ter-index
- Search fields (email, nama, status) ter-index
- Date fields untuk filtering ter-index
- Fulltext search untuk konten blog/video

FEATURES:
- Soft deletes via status fields
- Audit trail via activity_logs
- Auto-increment counters via triggers
- Flexible content management
- Comprehensive filtering support
- Dashboard statistics
*/
