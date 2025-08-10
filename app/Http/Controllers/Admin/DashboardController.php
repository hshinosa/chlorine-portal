<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Sertifikasi;
use App\Models\PKL;
use App\Models\PendaftaranSertifikasi;
use App\Models\PendaftaranPKL;
use App\Models\Blog;
use App\Models\Video;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function index()
    {
        // Get statistics
        $stats = [
            'peserta_sertifikasi' => PendaftaranSertifikasi::approved()->count(),
            'siswa_pkl' => PendaftaranPKL::approved()->count(),
            'assessor' => User::asesor()->count(),
            'jumlah_sertifikasi' => Sertifikasi::active()->count(),
            'total_blog' => Blog::published()->count(),
            'total_video' => Video::published()->count()
        ];

        // Get recent registrations
        $pendaftaranTerbaru = collect()
            ->merge(
                PendaftaranSertifikasi::with(['user', 'sertifikasi', 'batch'])
                    ->latest()
                    ->limit(10)
                    ->get()
                    ->map(function ($item) {
                        return [
                            'id' => $item->id,
                            'nama' => $item->user->name,
                            'jenis_pendaftaran' => 'Sertifikasi Kompetensi',
                            'program' => $item->sertifikasi->nama_sertifikasi,
                            'batch' => $item->batch->nama_batch ?? null,
                            'tanggal_pendaftaran' => $item->tanggal_pendaftaran->format('d-m-Y'),
                            'status' => $item->status,
                            'type' => 'sertifikasi'
                        ];
                    })
            )
            ->merge(
                PendaftaranPKL::with(['user', 'pkl'])
                    ->latest()
                    ->limit(10)
                    ->get()
                    ->map(function ($item) {
                        return [
                            'id' => $item->id,
                            'nama' => $item->user->name,
                            'jenis_pendaftaran' => 'Praktik Kerja Lapangan',
                            'program' => $item->pkl->nama_program,
                            'batch' => null,
                            'tanggal_pendaftaran' => $item->tanggal_pendaftaran->format('d-m-Y'),
                            'status' => $item->status,
                            'type' => 'pkl'
                        ];
                    })
            )
            ->sortByDesc('tanggal_pendaftaran')
            ->take(15)
            ->values();

        return Inertia::render('admin/dashboard', [
            'stats' => $stats,
            'pendaftaran_terbaru' => $pendaftaranTerbaru
        ]);
    }

    public function pendaftaranDetail($type, $id)
    {
        if ($type === 'sertifikasi') {
            $pendaftaran = PendaftaranSertifikasi::with(['user', 'sertifikasi', 'batch'])
                ->findOrFail($id);
        } else {
            $pendaftaran = PendaftaranPKL::with(['user', 'pkl'])
                ->findOrFail($id);
        }

        return response()->json($pendaftaran);
    }

    public function approvePendaftaran(Request $request, $type, $id)
    {
        $validated = $request->validate([
            'status' => 'required|in:Disetujui,Ditolak',
            'catatan_admin' => 'nullable|string'
        ]);

        if ($type === 'sertifikasi') {
            $pendaftaran = PendaftaranSertifikasi::findOrFail($id);
            
            if ($validated['status'] === 'Disetujui') {
                // Increment peserta terdaftar di batch
                $pendaftaran->batch->increment('peserta_terdaftar');
                $pendaftaran->sertifikasi->increment('peserta_terdaftar');
            }
        } else {
            $pendaftaran = PendaftaranPKL::findOrFail($id);
            
            if ($validated['status'] === 'Disetujui') {
                // Increment peserta terdaftar di PKL
                $pendaftaran->pkl->increment('peserta_terdaftar');
            }
        }

        $pendaftaran->update($validated);

        return response()->json([
            'message' => 'Status pendaftaran berhasil diperbarui'
        ]);
    }

    // API untuk statistik real-time
    public function apiStats()
    {
        $stats = [
            'peserta_sertifikasi' => PendaftaranSertifikasi::approved()->count(),
            'siswa_pkl' => PendaftaranPKL::approved()->count(),
            'assessor' => User::asesor()->count(),
            'jumlah_sertifikasi' => Sertifikasi::active()->count(),
            'total_blog' => Blog::published()->count(),
            'total_video' => Video::published()->count(),
            'pendaftaran_pending' => PendaftaranSertifikasi::pending()->count() + 
                                   PendaftaranPKL::pending()->count()
        ];

        return response()->json($stats);
    }

    // API untuk chart data
    public function apiChartData(Request $request)
    {
        $period = $request->get('period', '7days');
        
        $startDate = match($period) {
            '7days' => Carbon::now()->subDays(7),
            '30days' => Carbon::now()->subDays(30),
            '3months' => Carbon::now()->subMonths(3),
            '1year' => Carbon::now()->subYear(),
            default => Carbon::now()->subDays(7)
        };

        // Pendaftaran per hari
        $pendaftaranChart = [];
        $current = $startDate->copy();
        
        while ($current <= Carbon::now()) {
            $date = $current->format('Y-m-d');
            
            $sertifikasiCount = PendaftaranSertifikasi::whereDate('tanggal_pendaftaran', $date)->count();
            $pklCount = PendaftaranPKL::whereDate('tanggal_pendaftaran', $date)->count();
            
            $pendaftaranChart[] = [
                'date' => $date,
                'sertifikasi' => $sertifikasiCount,
                'pkl' => $pklCount,
                'total' => $sertifikasiCount + $pklCount
            ];
            
            $current->addDay();
        }

        return response()->json([
            'pendaftaran_chart' => $pendaftaranChart
        ]);
    }
}
