<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PosisiPKL;
use App\Models\PendaftaranPKL;
use App\Http\Resources\PosisiPKLResource;
use App\Http\Resources\PendaftaranPKLResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class PKLController extends Controller
{
    /**
     * Display a listing of PKL positions.
     */
    public function index(Request $request)
    {
        try {
            $query = PosisiPKL::query();

            // Filter by status (for public, only show active)
            if (auth()->check() && auth()->user()->role === 'admin') {
                // Admin can see all statuses
                if ($request->has('status') && $request->status !== 'all') {
                    $query->where('status', $request->status);
                }
            } else {
                // Public users only see active positions
                $query->where('status', 'Aktif');
            }

            // Filter by company
            if ($request->has('perusahaan') && !empty($request->perusahaan)) {
                $query->where('perusahaan', 'like', '%' . $request->perusahaan . '%');
            }

            // Filter by location
            if ($request->has('lokasi') && !empty($request->lokasi)) {
                $query->where('lokasi', 'like', '%' . $request->lokasi . '%');
            }

            // Filter by type
            if ($request->has('tipe') && $request->tipe !== 'all') {
                $query->where('tipe', $request->tipe);
            }

            // Search functionality
            if ($request->has('search') && !empty($request->search)) {
                $query->where(function($q) use ($request) {
                    $q->where('nama_posisi', 'like', '%' . $request->search . '%')
                      ->orWhere('deskripsi', 'like', '%' . $request->search . '%')
                      ->orWhere('perusahaan', 'like', '%' . $request->search . '%');
                });
            }

            // Order by creation date
            $query->orderBy('created_at', 'desc');

            $positions = $query->paginate(10);

            return response()->json([
                'success' => true,
                'data' => PosisiPKLResource::collection($positions)->response()->getData()
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve PKL positions',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified PKL position.
     */
    public function show($id)
    {
        try {
            $query = PosisiPKL::where('id', $id);

            // Only show active positions for non-admin users
            if (!auth()->check() || auth()->user()->role !== 'admin') {
                $query->where('status', 'Aktif');
            }

            $position = $query->firstOrFail();

            return response()->json([
                'success' => true,
                'data' => new PosisiPKLResource($position)
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'PKL position not found',
                'error' => $e->getMessage()
            ], 404);
        }
    }

    /**
     * Store a newly created PKL position (Admin only).
     */
    public function store(Request $request)
    {
        $request->validate([
            'nama_posisi' => 'required|string|max:255',
            'perusahaan' => 'required|string|max:255',
            'deskripsi' => 'required|string',
            'persyaratan' => 'required|string',
            'lokasi' => 'required|string|max:255',
            'tipe' => 'required|in:Full-time,Part-time,Remote,Hybrid',
            'durasi_bulan' => 'required|integer|min:1|max:12',
            'gaji' => 'nullable|numeric|min:0',
            'kuota' => 'required|integer|min:1',
            'tanggal_mulai' => 'required|date',
            'tanggal_selesai' => 'required|date|after:tanggal_mulai',
            'contact_person' => 'required|string|max:255',
            'contact_email' => 'required|email',
            'contact_phone' => 'nullable|string|max:20'
        ]);

        try {
            $position = PosisiPKL::create([
                ...$request->validated(),
                'created_by' => auth()->id(),
                'jumlah_pendaftar' => 0,
                'status' => 'Aktif'
            ]);

            return response()->json([
                'success' => true,
                'message' => 'PKL position created successfully',
                'data' => new PosisiPKLResource($position)
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create PKL position',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Register for a PKL position
     */
    public function register(Request $request, $id)
    {
        $request->validate([
            'motivasi' => 'nullable|string'
        ]);

        try {
            $user = auth()->user();
            $position = PosisiPKL::where('status', 'Aktif')->findOrFail($id);

            // Check if position is full
            if ($position->jumlah_pendaftar >= $position->kuota) {
                return response()->json([
                    'success' => false,
                    'message' => 'Posisi PKL sudah penuh'
                ], 400);
            }

            // Check if user already registered
            $existingRegistration = PendaftaranPKL::where('user_id', $user->id)
                ->where('posisi_pkl_id', $position->id)
                ->whereIn('status', ['Pending', 'Disetujui'])
                ->first();

            if ($existingRegistration) {
                return response()->json([
                    'success' => false,
                    'message' => 'Anda sudah terdaftar di posisi PKL ini'
                ], 400);
            }

            $pendaftaran = PendaftaranPKL::create([
                'user_id' => $user->id,
                'posisi_pkl_id' => $position->id,
                'status' => 'Pending',
                'tanggal_pendaftaran' => now(),
                'motivasi' => $request->motivasi
            ]);

            // Update position participant count
            $position->increment('jumlah_pendaftar');

            return response()->json([
                'success' => true,
                'message' => 'Pendaftaran PKL berhasil diajukan',
                'data' => new PendaftaranPKLResource($pendaftaran->load(['user', 'posisiPKL']))
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to register for PKL position',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get user's PKL registrations
     */
    public function myRegistrations(Request $request)
    {
        try {
            $user = auth()->user();
            
            $registrations = PendaftaranPKL::with(['posisiPKL'])
                ->where('user_id', $user->id)
                ->orderBy('created_at', 'desc')
                ->paginate(10);

            return response()->json([
                'success' => true,
                'data' => PendaftaranPKLResource::collection($registrations)->response()->getData()
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve PKL registrations',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Cancel a PKL registration
     */
    public function cancelRegistration($registrationId)
    {
        try {
            $user = auth()->user();
            
            $registration = PendaftaranPKL::where('user_id', $user->id)
                ->where('id', $registrationId)
                ->where('status', 'Pending')
                ->firstOrFail();

            $registration->update(['status' => 'Dibatalkan']);

            // Decrease position participant count
            $registration->posisiPKL()->decrement('jumlah_pendaftar');

            return response()->json([
                'success' => true,
                'message' => 'Pendaftaran PKL berhasil dibatalkan'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to cancel PKL registration',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
