<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Sertifikasi;
use App\Models\ModulSertifikasi;
use App\Models\BatchSertifikasi;
use App\Models\PendaftaranSertifikasi;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminSertifikasiExtraController extends Controller
{
    /**
     * Reorder modules for a certification.
     */
    public function reorderModules(Request $request, $sertifikasiId)
    {
        $validated = $request->validate([
            'orders' => 'required|array|min:1',
            'orders.*.id' => 'required|integer|exists:modul_sertifikasi,id',
            'orders.*.urutan' => 'required|integer|min:0'
        ]);

        DB::transaction(function () use ($validated, $sertifikasiId) {
            foreach ($validated['orders'] as $item) {
                ModulSertifikasi::where('id', $item['id'])
                    ->where('sertifikasi_id', $sertifikasiId)
                    ->update(['urutan' => $item['urutan']]);
            }
        });

        return response()->json([
            'success' => true,
            'message' => 'Urutan modul berhasil diperbarui'
        ]);
    }

    /**
     * List batches for a certification (admin view, including all statuses)
     */
    public function listBatches($sertifikasiId)
    {
        $sertifikasi = Sertifikasi::findOrFail($sertifikasiId);
        $batches = $sertifikasi->batch()->orderBy('tanggal_mulai')->get();

        return response()->json([
            'success' => true,
            'data' => $batches
        ]);
    }

    /**
     * Create a batch for certification.
     */
    public function createBatch(Request $request, $sertifikasiId)
    {
        $sertifikasi = Sertifikasi::findOrFail($sertifikasiId);

        $validated = $request->validate([
            'nama_batch' => 'required|string|max:255',
            'tanggal_mulai' => 'required|date',
            'tanggal_selesai' => 'required|date|after:tanggal_mulai',
            'jam_mulai' => 'nullable|date_format:H:i',
            'jam_selesai' => 'nullable|date_format:H:i',
            'tempat' => 'nullable|string|max:255',
            'kuota' => 'required|integer|min:1',
            'status' => 'required|in:Draf,Aktif,Selesai,Ditutup',
            'instruktur' => 'nullable|string|max:255',
            'catatan' => 'nullable|string'
        ]);

        $validated['sertifikasi_id'] = $sertifikasi->id;
        $validated['jumlah_pendaftar'] = 0;

        $batch = BatchSertifikasi::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Batch berhasil dibuat',
            'data' => $batch
        ], 201);
    }

    /**
     * Update batch
     */
    public function updateBatch(Request $request, $sertifikasiId, $batchId)
    {
        $batch = BatchSertifikasi::where('sertifikasi_id', $sertifikasiId)->findOrFail($batchId);

        $validated = $request->validate([
            'nama_batch' => 'sometimes|required|string|max:255',
            'tanggal_mulai' => 'sometimes|required|date',
            'tanggal_selesai' => 'sometimes|required|date|after:tanggal_mulai',
            'jam_mulai' => 'nullable|date_format:H:i',
            'jam_selesai' => 'nullable|date_format:H:i',
            'tempat' => 'nullable|string|max:255',
            'kuota' => 'nullable|integer|min:1',
            'status' => 'nullable|in:Draf,Aktif,Selesai,Ditutup',
            'instruktur' => 'nullable|string|max:255',
            'catatan' => 'nullable|string'
        ]);

        $batch->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Batch berhasil diperbarui',
            'data' => $batch
        ]);
    }

    /**
     * Delete batch
     */
    public function deleteBatch($sertifikasiId, $batchId)
    {
        $batch = BatchSertifikasi::where('sertifikasi_id', $sertifikasiId)->findOrFail($batchId);

        if ($batch->pendaftaran()->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Batch tidak dapat dihapus karena sudah ada pendaftar'
            ], 422);
        }

        $batch->delete();

        return response()->json([
            'success' => true,
            'message' => 'Batch berhasil dihapus'
        ]);
    }

    /**
     * Update registration status (approve / reject) with optional note.
     */
    public function updateRegistrationStatus(Request $request, $registrationId)
    {
        $validated = $request->validate([
            'status' => 'required|in:Disetujui,Ditolak',
            'catatan_admin' => 'nullable|string'
        ]);

        $pendaftaran = PendaftaranSertifikasi::findOrFail($registrationId);
        $pendaftaran->update([
            'status' => $validated['status'],
            'catatan_admin' => $validated['catatan_admin'] ?? null,
            'tanggal_diproses' => now()
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Status pendaftaran diperbarui',
            'data' => $pendaftaran
        ]);
    }

    /**
     * List registrations (filter by status optional)
     */
    public function listRegistrations(Request $request, $sertifikasiId)
    {
        $query = PendaftaranSertifikasi::with(['user', 'batch'])
            ->where('sertifikasi_id', $sertifikasiId);

        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        $registrations = $query->orderBy('created_at', 'desc')->paginate(15);

        return response()->json([
            'success' => true,
            'data' => $registrations
        ]);
    }

    /**
     * Issue certificate placeholder (sets flag / returns stub).
     */
    public function issueCertificate($registrationId)
    {
        $pendaftaran = PendaftaranSertifikasi::with(['user','sertifikasi'])->findOrFail($registrationId);

        if ($pendaftaran->status !== 'Disetujui') {
            return response()->json([
                'success' => false,
                'message' => 'Tidak dapat menerbitkan sertifikat untuk status ini'
            ], 422);
        }

        // For now just return stub data (extend later with real PDF / number generation)
        $certificateData = [
            'registration_id' => $pendaftaran->id,
            'user' => $pendaftaran->user->only(['id','name','email']),
            'sertifikasi' => [
                'id' => $pendaftaran->sertifikasi->id,
                'nama' => $pendaftaran->sertifikasi->nama_sertifikasi,
            ],
            'issued_at' => now()->toDateTimeString(),
            'certificate_number' => 'CERT-' . str_pad($pendaftaran->id, 6, '0', STR_PAD_LEFT)
        ];

        return response()->json([
            'success' => true,
            'message' => 'Sertifikat berhasil diterbitkan (stub)',
            'data' => $certificateData
        ]);
    }
}
