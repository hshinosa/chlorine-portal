<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\Sertifikasi;
use App\Models\ModulSertifikasi;
use App\Models\BatchSertifikasi;
use App\Models\Blog;
use App\Models\Video;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create Admin User
        $admin = User::create([
            'name' => 'Administrator',
            'email' => 'admin@chlorine-portal.com',
            'password' => Hash::make('password'),
            'role' => 'admin',
            'phone' => '+62812345678',
            'email_verified_at' => now(),
        ]);

        // Create Asesor Users
        $asesor1 = User::create([
            'name' => 'Dr. Ahmad Wijaya',
            'email' => 'ahmad.wijaya@chlorine-portal.com',
            'password' => Hash::make('password'),
            'role' => 'asesor',
            'phone' => '+62812345679',
            'email_verified_at' => now(),
        ]);

        $asesor2 = User::create([
            'name' => 'Prof. Siti Nurhaliza',
            'email' => 'siti.nurhaliza@chlorine-portal.com',
            'password' => Hash::make('password'),
            'role' => 'asesor',
            'phone' => '+62812345680',
            'email_verified_at' => now(),
        ]);

        // Create Sample Users
        $user1 = User::create([
            'name' => 'John Doe',
            'email' => 'john.doe@example.com',
            'password' => Hash::make('password'),
            'role' => 'user',
            'phone' => '+62812345681',
            'institution' => 'Universitas Indonesia',
            'major' => 'Teknik Informatika',
            'semester' => 6,
            'gpa' => 3.75,
            'email_verified_at' => now(),
        ]);

        $user2 = User::create([
            'name' => 'Jane Smith',
            'email' => 'jane.smith@example.com',
            'password' => Hash::make('password'),
            'role' => 'user',
            'phone' => '+62812345682',
            'institution' => 'Institut Teknologi Bandung',
            'major' => 'Sistem Informasi',
            'semester' => 4,
            'gpa' => 3.85,
            'email_verified_at' => now(),
        ]);

        // Create Sample Sertifikasi
        $sertifikasi1 = Sertifikasi::create([
            'nama_sertifikasi' => 'Web Developer Professional',
            'jenis_sertifikasi' => 'Industri',
            'deskripsi' => 'Sertifikasi komprehensif untuk pengembang web profesional yang mencakup frontend, backend, dan database.',
            'nama_asesor' => 'Dr. Ahmad Wijaya',
            'jabatan_asesor' => 'Senior Web Developer',
            'instansi_asesor' => 'PT Tech Indonesia',
            'pengalaman_asesor' => '10+ tahun pengalaman dalam pengembangan web dan aplikasi enterprise.',
            'tipe_sertifikat' => 'Sertifikat Kompetensi',
            'kapasitas_peserta' => 25,
            'status' => 'Aktif',
            'created_by' => $admin->id,
        ]);

        $sertifikasi2 = Sertifikasi::create([
            'nama_sertifikasi' => 'Digital Marketing Specialist',
            'jenis_sertifikasi' => 'Industri',
            'deskripsi' => 'Program sertifikasi untuk menjadi spesialis digital marketing dengan fokus pada SEO, SEM, dan social media marketing.',
            'nama_asesor' => 'Prof. Siti Nurhaliza',
            'jabatan_asesor' => 'Digital Marketing Consultant',
            'instansi_asesor' => 'Digital Agency Indonesia',
            'pengalaman_asesor' => '8+ tahun dalam strategi digital marketing dan brand management.',
            'tipe_sertifikat' => 'Sertifikat Keahlian',
            'kapasitas_peserta' => 20,
            'status' => 'Aktif',
            'created_by' => $admin->id,
        ]);

        // Create Modul Sertifikasi
        ModulSertifikasi::create([
            'sertifikasi_id' => $sertifikasi1->id,
            'judul' => 'HTML & CSS Fundamentals',
            'deskripsi' => 'Dasar-dasar HTML dan CSS untuk membangun struktur dan styling web.',
            'poin_pembelajaran' => [
                'Semantic HTML',
                'CSS Grid & Flexbox',
                'Responsive Design',
                'CSS Preprocessing'
            ],
            'urutan' => 1
        ]);

        ModulSertifikasi::create([
            'sertifikasi_id' => $sertifikasi1->id,
            'judul' => 'JavaScript & Frontend Frameworks',
            'deskripsi' => 'JavaScript modern dan framework frontend seperti React atau Vue.js.',
            'poin_pembelajaran' => [
                'ES6+ JavaScript',
                'DOM Manipulation',
                'API Integration',
                'React/Vue.js Basics'
            ],
            'urutan' => 2
        ]);

        ModulSertifikasi::create([
            'sertifikasi_id' => $sertifikasi2->id,
            'judul' => 'Digital Marketing Strategy',
            'deskripsi' => 'Strategi pemasaran digital yang efektif untuk berbagai industri.',
            'poin_pembelajaran' => [
                'Market Research',
                'Target Audience Analysis',
                'Content Strategy',
                'ROI Measurement'
            ],
            'urutan' => 1
        ]);

        // Create Batch Sertifikasi
        BatchSertifikasi::create([
            'sertifikasi_id' => $sertifikasi1->id,
            'nama_batch' => 'Batch 1 - 2025',
            'tanggal_mulai' => '2025-09-01',
            'tanggal_selesai' => '2025-10-15',
            'jam_mulai' => '09:00',
            'jam_selesai' => '16:00',
            'tempat' => 'Jakarta Training Center',
            'kuota' => 25,
            'jumlah_pendaftar' => 0,
            'status' => 'Aktif',
            'instruktur' => 'Dr. Ahmad Wijaya',
            'catatan' => 'Batch pertama untuk tahun 2025 dengan fasilitas lengkap.'
        ]);

        BatchSertifikasi::create([
            'sertifikasi_id' => $sertifikasi2->id,
            'nama_batch' => 'Batch 1 - 2025',
            'tanggal_mulai' => '2025-09-15',
            'tanggal_selesai' => '2025-10-30',
            'jam_mulai' => '13:00',
            'jam_selesai' => '17:00',
            'tempat' => 'Bandung Training Center',
            'kuota' => 20,
            'jumlah_pendaftar' => 0,
            'status' => 'Aktif',
            'instruktur' => 'Prof. Siti Nurhaliza',
            'catatan' => 'Intensive program dengan case study real project.'
        ]);

        // Create Sample Blog Posts
        Blog::create([
            'nama_artikel' => 'Tren Teknologi 2025: Yang Perlu Diketahui Developer',
            'jenis_konten' => 'Blog',
            'deskripsi' => 'Eksplorasi tren teknologi terbaru yang akan mempengaruhi dunia pengembangan software di tahun 2025.',
            'konten' => '<p>Tahun 2025 membawa berbagai inovasi teknologi yang mengubah lanskap pengembangan software...</p>',
            'status' => 'Publish',
            'penulis' => 'Tim Editorial Chlorine',
            'views' => 1250,
            'featured' => true,
            'meta_title' => 'Tren Teknologi 2025 untuk Developer',
            'meta_description' => 'Pelajari tren teknologi terbaru yang akan mempengaruhi developer di tahun 2025.',
            'slug' => 'tren-teknologi-2025-developer'
        ]);

        Blog::create([
            'nama_artikel' => 'Panduan Lengkap Memulai Karir di Digital Marketing',
            'jenis_konten' => 'Tutorial',
            'deskripsi' => 'Step-by-step guide untuk membangun karir yang sukses di bidang digital marketing.',
            'konten' => '<p>Digital marketing menjadi salah satu bidang yang paling menjanjikan saat ini...</p>',
            'status' => 'Publish',
            'penulis' => 'Marketing Team',
            'views' => 890,
            'featured' => false,
            'meta_title' => 'Panduan Karir Digital Marketing',
            'meta_description' => 'Cara memulai dan membangun karir sukses di digital marketing.',
            'slug' => 'panduan-karir-digital-marketing'
        ]);

        // Create Sample Videos
        Video::create([
            'nama_video' => 'Introduction to React.js for Beginners',
            'deskripsi' => 'Video tutorial komprehensif untuk memulai belajar React.js dari nol hingga mahir.',
            'video_url' => 'https://www.youtube.com/watch?v=example1',
            'durasi' => 3600, // 1 hour in seconds
            'views' => 2500,
            'featured' => true,
            'status' => 'Publish',
            'uploader' => 'Tech Education Team'
        ]);

        Video::create([
            'nama_video' => 'SEO Strategy 2025: Complete Guide',
            'deskripsi' => 'Strategi SEO terbaru dan paling efektif untuk meningkatkan ranking website di tahun 2025.',
            'video_url' => 'https://www.youtube.com/watch?v=example2',
            'durasi' => 2700, // 45 minutes in seconds
            'views' => 1800,
            'featured' => false,
            'status' => 'Publish',
            'uploader' => 'Digital Marketing Team'
        ]);

        echo "Database seeded successfully!\n";
        echo "Admin Login:\n";
        echo "Email: admin@chlorine-portal.com\n";
        echo "Password: password\n\n";
        echo "Test User Login:\n";
        echo "Email: john.doe@example.com\n";
        echo "Password: password\n";
    }
}
