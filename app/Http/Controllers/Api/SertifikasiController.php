<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Http\Requests\SertifikasiRequest;
use App\Models\Sertifikasi;
use App\Models\ModulSertifikasi;
use App\Models\BatchSertifikasi;
use App\Models\PendaftaranSertifikasi;
use App\Http\Resources\SertifikasiResource;
use App\Http\Resources\BatchSertifikasiResource;
use App\Http\Resources\ModulSertifikasiResource;

class SertifikasiController extends Controller
{
    /**
     * Display a listing of the certifications.
     */
    public function index(Request $request)
    {
        try {
            $query = Sertifikasi::with(['modul', 'batch']);

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

            $certifications = $query->orderBy('created_at', 'desc')->paginate(10);

            return response()->json([
                'success' => true,
                'data' => SertifikasiResource::collection($certifications)->response()->getData()
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve certifications',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified certification.
     */
    public function show($id)
    {
        try {
            $sertifikasi = Sertifikasi::with(['modulSertifikasi', 'batchSertifikasi'])
                                    ->findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => new SertifikasiResource($sertifikasi)
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Certification not found',
                'error' => $e->getMessage()
            ], 404);
        }
    }

    /**
     * Store a newly created certification (Admin only).
     */
    public function store(SertifikasiRequest $request)
    {
        try {
            $sertifikasi = Sertifikasi::create([
                ...$request->validated(),
                'created_by' => auth()->id()
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Certification created successfully',
                'data' => new SertifikasiResource($sertifikasi)
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create certification',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update the specified certification (Admin only).
     */
    public function update(SertifikasiRequest $request, $id)
    {
        try {
            $sertifikasi = Sertifikasi::findOrFail($id);
            $sertifikasi->update($request->validated());

            return response()->json([
                'success' => true,
                'message' => 'Certification updated successfully',
                'data' => new SertifikasiResource($sertifikasi)
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update certification',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified certification (Admin only).
     */
    public function destroy($id)
    {
        try {
            $sertifikasi = Sertifikasi::findOrFail($id);
            $sertifikasi->delete();

            return response()->json([
                'success' => true,
                'message' => 'Certification deleted successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete certification',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get available batches for a certification
     */
    public function getBatches($id)
    {
        try {
            $sertifikasi = Sertifikasi::findOrFail($id);
            $batches = $sertifikasi->batchSertifikasi()
                                 ->where('status', 'Aktif')
                                 ->where('tanggal_mulai', '>', now())
                                 ->orderBy('tanggal_mulai')
                                 ->get();

            return response()->json([
                'success' => true,
                'data' => BatchSertifikasiResource::collection($batches)
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve batches',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Register for a certification batch
     */
    public function register(Request $request, $id)
    {
        $request->validate([
            'batch_sertifikasi_id' => 'required|exists:batch_sertifikasi,id',
            'motivasi' => 'nullable|string'
        ]);

        try {
            $user = auth()->user();
            $sertifikasi = Sertifikasi::findOrFail($id);
            $batch = BatchSertifikasi::findOrFail($request->batch_sertifikasi_id);

            // Check if batch belongs to this certification
            if ($batch->sertifikasi_id != $sertifikasi->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Batch tidak sesuai dengan sertifikasi'
                ], 400);
            }

            // Check if batch is full
            if ($batch->jumlah_pendaftar >= $batch->kuota) {
                return response()->json([
                    'success' => false,
                    'message' => 'Batch sudah penuh'
                ], 400);
            }

            // Check if user already registered
            $existingRegistration = PendaftaranSertifikasi::where('user_id', $user->id)
                ->where('sertifikasi_id', $sertifikasi->id)
                ->where('batch_sertifikasi_id', $request->batch_sertifikasi_id)
                ->first();

            if ($existingRegistration) {
                return response()->json([
                    'success' => false,
                    'message' => 'Anda sudah terdaftar di batch ini'
                ], 400);
            }

            $pendaftaran = PendaftaranSertifikasi::create([
                'user_id' => $user->id,
                'sertifikasi_id' => $sertifikasi->id,
                'batch_sertifikasi_id' => $request->batch_sertifikasi_id,
                'status' => 'Pending',
                'tanggal_pendaftaran' => now(),
                'motivasi' => $request->motivasi
            ]);

            // Update batch participant count
            $batch->increment('jumlah_pendaftar');

            return response()->json([
                'success' => true,
                'message' => 'Pendaftaran berhasil diajukan',
                'data' => $pendaftaran->load(['user', 'sertifikasi', 'batchSertifikasi'])
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to register for certification',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get user's certification registrations
     */
    public function myRegistrations(Request $request)
    {
        try {
            $user = auth()->user();
            
            $registrations = PendaftaranSertifikasi::with(['sertifikasi', 'batchSertifikasi'])
                ->where('user_id', $user->id)
                ->orderBy('created_at', 'desc')
                ->paginate(10);

            return response()->json([
                'success' => true,
                'data' => $registrations
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve registrations',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Cancel a certification registration
     */
    public function cancelRegistration($registrationId)
    {
        try {
            $user = auth()->user();
            
            $registration = PendaftaranSertifikasi::where('user_id', $user->id)
                ->where('id', $registrationId)
                ->where('status', 'Pending')
                ->firstOrFail();

            $registration->update(['status' => 'Dibatalkan']);

            // Decrease batch participant count
            $registration->batchSertifikasi()->decrement('jumlah_pendaftar');

            return response()->json([
                'success' => true,
                'message' => 'Pendaftaran berhasil dibatalkan'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to cancel registration',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Toggle status (Aktif <-> Ditutup) for admin usage.
     */
    public function toggleStatus($id)
    {
        try {
            $sertifikasi = Sertifikasi::findOrFail($id);
            $current = $sertifikasi->status;
            // Simple toggle between Aktif and Ditutup; if other status keep logic minimal
            $newStatus = $current === 'Aktif' ? 'Ditutup' : 'Aktif';
            $sertifikasi->update(['status' => $newStatus]);

            return response()->json([
                'success' => true,
                'message' => 'Status sertifikasi diperbarui',
                'data' => [
                    'id' => $sertifikasi->id,
                    'status' => $sertifikasi->status
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal memperbarui status',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
