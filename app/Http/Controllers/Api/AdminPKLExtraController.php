<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PendaftaranPKL;
use Illuminate\Http\Request;

class AdminPKLExtraController extends Controller
{
    public function listRegistrations(Request $request, $posisiId)
    {
        $query = PendaftaranPKL::with(['user', 'pkl'])
            ->where('posisi_pkl_id', $posisiId);

        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        $registrations = $query->orderBy('created_at', 'desc')->paginate(15);

        return response()->json([
            'success' => true,
            'data' => $registrations
        ]);
    }

    public function updateRegistrationStatus(Request $request, $registrationId)
    {
        $validated = $request->validate([
            'status' => 'required|in:Disetujui,Ditolak',
            'catatan_admin' => 'nullable|string'
        ]);

        $pendaftaran = PendaftaranPKL::findOrFail($registrationId);
        $pendaftaran->update([
            'status' => $validated['status'],
            'catatan_admin' => $validated['catatan_admin'] ?? null,
            'tanggal_diproses' => now()
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Status pendaftaran PKL diperbarui',
            'data' => $pendaftaran
        ]);
    }

    public function issueCertificate($registrationId)
    {
        $pendaftaran = PendaftaranPKL::with(['user','pkl'])->findOrFail($registrationId);

        if ($pendaftaran->status !== 'Disetujui') {
            return response()->json([
                'success' => false,
                'message' => 'Tidak dapat menerbitkan sertifikat untuk status ini'
            ], 422);
        }

        $certificate = [
            'registration_id' => $pendaftaran->id,
            'user' => $pendaftaran->user->only(['id','name','email']),
            'pkl' => [
                'id' => $pendaftaran->pkl->id ?? null,
                'nama' => $pendaftaran->pkl->nama ?? null,
            ],
            'issued_at' => now()->toDateTimeString(),
            'certificate_number' => 'PKL-' . str_pad($pendaftaran->id, 6, '0', STR_PAD_LEFT)
        ];

        return response()->json([
            'success' => true,
            'message' => 'Sertifikat PKL diterbitkan (stub)',
            'data' => $certificate
        ]);
    }
}
