<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Sertifikasi;
use App\Models\BatchSertifikasi;
use App\Models\PendaftaranSertifikasi;
use App\Models\Blog;
use App\Models\Video;
use App\Models\PosisiPKL;
use App\Models\PendaftaranPKL;
use Illuminate\Support\Facades\DB;

class AdminController extends Controller
{
    /**
     * Display admin dashboard statistics
     */
    public function dashboard()
    {
        try {
            $stats = [
                'total_users' => User::where('role', 'user')->count(),
                'total_sertifikasi' => Sertifikasi::count(),
                'total_batch_aktif' => BatchSertifikasi::where('status', 'Aktif')->count(),
                'total_pendaftar_sertifikasi' => PendaftaranSertifikasi::count(),
                'total_blogs' => Blog::where('status', 'Publish')->count(),
                'total_videos' => Video::where('status', 'Publish')->count(),
                'total_posisi_pkl' => PosisiPKL::where('status', 'Aktif')->count(),
                'total_pendaftar_pkl' => PendaftaranPKL::count(),
            ];

            // Recent activities
            $recent_registrations = PendaftaranSertifikasi::with(['user', 'batchSertifikasi.sertifikasi'])
                ->latest()
                ->limit(5)
                ->get();

            $recent_pkl_applications = PendaftaranPKL::with(['user', 'posisiPKL'])
                ->latest()
                ->limit(5)
                ->get();

            // Popular content
            $popular_blogs = Blog::where('status', 'Publish')
                ->orderBy('views', 'desc')
                ->limit(5)
                ->get();

            $popular_videos = Video::where('status', 'Publish')
                ->orderBy('views', 'desc')
                ->limit(5)
                ->get();

            return response()->json([
                'success' => true,
                'data' => [
                    'statistics' => $stats,
                    'recent_activities' => [
                        'sertifikasi_registrations' => $recent_registrations,
                        'pkl_applications' => $recent_pkl_applications,
                    ],
                    'popular_content' => [
                        'blogs' => $popular_blogs,
                        'videos' => $popular_videos,
                    ]
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to load dashboard data',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get user management data
     */
    public function users(Request $request)
    {
        try {
            $query = User::query();

            // Filter by role
            if ($request->has('role') && $request->role !== 'all') {
                $query->where('role', $request->role);
            }

            // Search functionality
            if ($request->has('search') && !empty($request->search)) {
                $query->where(function($q) use ($request) {
                    $q->where('name', 'like', '%' . $request->search . '%')
                      ->orWhere('email', 'like', '%' . $request->search . '%')
                      ->orWhere('institution', 'like', '%' . $request->search . '%');
                });
            }

            $users = $query->orderBy('created_at', 'desc')
                          ->paginate(15);

            return response()->json([
                'success' => true,
                'data' => $users
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to load users data',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get certification management data
     */
    public function certifications(Request $request)
    {
        try {
            $query = Sertifikasi::with(['modulSertifikasi', 'batchSertifikasi']);

            // Filter by status
            if ($request->has('status') && $request->status !== 'all') {
                $query->where('status', $request->status);
            }

            // Filter by type
            if ($request->has('jenis') && $request->jenis !== 'all') {
                $query->where('jenis_sertifikasi', $request->jenis);
            }

            // Search functionality
            if ($request->has('search') && !empty($request->search)) {
                $query->where(function($q) use ($request) {
                    $q->where('nama_sertifikasi', 'like', '%' . $request->search . '%')
                      ->orWhere('deskripsi', 'like', '%' . $request->search . '%')
                      ->orWhere('nama_asesor', 'like', '%' . $request->search . '%');
                });
            }

            $certifications = $query->orderBy('created_at', 'desc')
                                   ->paginate(10);

            return response()->json([
                'success' => true,
                'data' => $certifications
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to load certifications data',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get content management data (blogs and videos)
     */
    public function content(Request $request)
    {
        try {
            $type = $request->get('type', 'blog');

            if ($type === 'blog') {
                $query = Blog::query();
                
                // Filter by status
                if ($request->has('status') && $request->status !== 'all') {
                    $query->where('status', $request->status);
                }

                // Filter by content type
                if ($request->has('jenis_konten') && $request->jenis_konten !== 'all') {
                    $query->where('jenis_konten', $request->jenis_konten);
                }

                // Search functionality
                if ($request->has('search') && !empty($request->search)) {
                    $query->where(function($q) use ($request) {
                        $q->where('nama_artikel', 'like', '%' . $request->search . '%')
                          ->orWhere('deskripsi', 'like', '%' . $request->search . '%')
                          ->orWhere('penulis', 'like', '%' . $request->search . '%');
                    });
                }

                $content = $query->orderBy('created_at', 'desc')->paginate(10);

            } else {
                $query = Video::query();
                
                // Filter by status
                if ($request->has('status') && $request->status !== 'all') {
                    $query->where('status', $request->status);
                }

                // Search functionality
                if ($request->has('search') && !empty($request->search)) {
                    $query->where(function($q) use ($request) {
                        $q->where('nama_video', 'like', '%' . $request->search . '%')
                          ->orWhere('deskripsi', 'like', '%' . $request->search . '%')
                          ->orWhere('uploader', 'like', '%' . $request->search . '%');
                    });
                }

                $content = $query->orderBy('created_at', 'desc')->paginate(10);
            }

            return response()->json([
                'success' => true,
                'data' => $content
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to load content data',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get reports and analytics
     */
    public function reports(Request $request)
    {
        try {
            $period = $request->get('period', '7days');
            
            $dates = $this->getDateRange($period);

            // Registration trends
            $sertifikasiTrend = PendaftaranSertifikasi::whereBetween('created_at', $dates)
                ->selectRaw('DATE(created_at) as date, COUNT(*) as count')
                ->groupBy('date')
                ->orderBy('date')
                ->get();

            $pklTrend = PendaftaranPKL::whereBetween('created_at', $dates)
                ->selectRaw('DATE(created_at) as date, COUNT(*) as count')
                ->groupBy('date')
                ->orderBy('date')
                ->get();

            // Content performance
            $blogPerformance = Blog::where('status', 'Publish')
                ->orderBy('views', 'desc')
                ->limit(10)
                ->get(['nama_artikel', 'views', 'created_at']);

            $videoPerformance = Video::where('status', 'Publish')
                ->orderBy('views', 'desc')
                ->limit(10)
                ->get(['nama_video', 'views', 'durasi', 'created_at']);

            // Certification completion rates
            $certificationStats = Sertifikasi::withCount([
                'batchSertifikasi',
                'batchSertifikasi as total_registrations' => function($query) {
                    $query->join('pendaftaran_sertifikasi', 'batch_sertifikasi.id', '=', 'pendaftaran_sertifikasi.batch_sertifikasi_id');
                }
            ])->get();

            return response()->json([
                'success' => true,
                'data' => [
                    'trends' => [
                        'sertifikasi_registrations' => $sertifikasiTrend,
                        'pkl_applications' => $pklTrend,
                    ],
                    'content_performance' => [
                        'blogs' => $blogPerformance,
                        'videos' => $videoPerformance,
                    ],
                    'certification_stats' => $certificationStats,
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to load reports data',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Helper method to get date range based on period
     */
    private function getDateRange($period)
    {
        $end = now();
        
        switch ($period) {
            case '7days':
                $start = now()->subDays(7);
                break;
            case '30days':
                $start = now()->subDays(30);
                break;
            case '3months':
                $start = now()->subMonths(3);
                break;
            case '6months':
                $start = now()->subMonths(6);
                break;
            case '1year':
                $start = now()->subYear();
                break;
            default:
                $start = now()->subDays(7);
        }

        return [$start, $end];
    }
}
