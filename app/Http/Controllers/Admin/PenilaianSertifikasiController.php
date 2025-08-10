<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\PendaftaranSertifikasi;
use App\Models\PenilaianSertifikasi;
use App\Models\BatchSertifikasi;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PenilaianSertifikasiController extends Controller
{
    public function index()
    {
        $pendaftaran = PendaftaranSertifikasi::with(['user', 'sertifikasi', 'batch', 'penilaian'])
            ->approved()
            ->latest()
            ->paginate(10);

        return Inertia::render('admin/penilaian-sertifikasi', [
            'pendaftaran' => $pendaftaran
        ]);
    }

    public function show($id)
    {
        $pendaftaran = PendaftaranSertifikasi::with(['user', 'sertifikasi', 'batch', 'penilaian'])
            ->findOrFail($id);

        return Inertia::render('admin/detail-penilaian-sertifikasi', [
            'pendaftaran' => $pendaftaran
        ]);
    }

    public function batchPenilaian($sertifikasiId, $batchId)
    {
        $batch = BatchSertifikasi::with(['sertifikasi', 'pendaftaran.user', 'pendaftaran.penilaian'])
            ->where('sertifikasi_id', $sertifikasiId)
            ->findOrFail($batchId);

        return Inertia::render('admin/batch-penilaian-sertifikasi', [
            'batch' => $batch,
            'sertifikasi_id' => $sertifikasiId,
            'batch_id' => $batchId
        ]);
    }

    public function store(Request $request, $pendaftaranId)
    {
        $pendaftaran = PendaftaranSertifikasi::findOrFail($pendaftaranId);

        $validated = $request->validate([
            'nilai_teori' => 'required|numeric|min:0|max:100',
            'nilai_praktek' => 'required|numeric|min:0|max:100',
            'catatan_asesor' => 'nullable|string'
        ]);

        // Calculate nilai akhir (weighted average: 40% teori, 60% praktek)
        $nilaiAkhir = ($validated['nilai_teori'] * 0.4) + ($validated['nilai_praktek'] * 0.6);
        
        $validated['nilai_akhir'] = $nilaiAkhir;
        $validated['status_kelulusan'] = $nilaiAkhir >= 70 ? 'Lulus' : 'Tidak Lulus';
        $validated['tanggal_penilaian'] = now();
        $validated['asesor_id'] = auth()->id();
        $validated['pendaftaran_id'] = $pendaftaranId;
        $validated['sertifikasi_id'] = $pendaftaran->sertifikasi_id;
        $validated['batch_id'] = $pendaftaran->batch_id;

        PenilaianSertifikasi::updateOrCreate(
            ['pendaftaran_id' => $pendaftaranId],
            $validated
        );

        return redirect()->route('admin.penilaian-sertifikasi')
            ->with('success', 'Penilaian sertifikasi berhasil disimpan');
    }

    public function batchStore(Request $request, $sertifikasiId, $batchId)
    {
        $validated = $request->validate([
            'penilaian' => 'required|array',
            'penilaian.*.pendaftaran_id' => 'required|exists:pendaftaran_sertifikasi,id',
            'penilaian.*.nilai_teori' => 'required|numeric|min:0|max:100',
            'penilaian.*.nilai_praktek' => 'required|numeric|min:0|max:100',
            'penilaian.*.catatan_asesor' => 'nullable|string'
        ]);

        foreach ($validated['penilaian'] as $penilaianData) {
            $pendaftaran = PendaftaranSertifikasi::findOrFail($penilaianData['pendaftaran_id']);
            
            // Calculate nilai akhir
            $nilaiAkhir = ($penilaianData['nilai_teori'] * 0.4) + ($penilaianData['nilai_praktek'] * 0.6);
            
            $data = [
                'nilai_teori' => $penilaianData['nilai_teori'],
                'nilai_praktek' => $penilaianData['nilai_praktek'],
                'nilai_akhir' => $nilaiAkhir,
                'status_kelulusan' => $nilaiAkhir >= 70 ? 'Lulus' : 'Tidak Lulus',
                'catatan_asesor' => $penilaianData['catatan_asesor'] ?? null,
                'tanggal_penilaian' => now(),
                'asesor_id' => auth()->id(),
                'pendaftaran_id' => $penilaianData['pendaftaran_id'],
                'sertifikasi_id' => $sertifikasiId,
                'batch_id' => $batchId
            ];

            PenilaianSertifikasi::updateOrCreate(
                ['pendaftaran_id' => $penilaianData['pendaftaran_id']],
                $data
            );
        }

        return redirect()->route('admin.batch-penilaian-sertifikasi', [
            'sertifikasiId' => $sertifikasiId,
            'batchId' => $batchId
        ])->with('success', 'Penilaian batch berhasil disimpan');
    }

    // API Methods
    public function apiIndex(Request $request)
    {
        $query = PendaftaranSertifikasi::with(['user', 'sertifikasi', 'batch', 'penilaian'])
            ->approved();

        // Search
        if ($request->has('search')) {
            $search = $request->search;
            $query->whereHas('user', function($q) use ($search) {
                $q->where('name', 'like', '%' . $search . '%');
            })->orWhereHas('sertifikasi', function($q) use ($search) {
                $q->where('nama_sertifikasi', 'like', '%' . $search . '%');
            });
        }

        // Filter by sertifikasi
        if ($request->has('sertifikasi_id')) {
            $query->where('sertifikasi_id', $request->sertifikasi_id);
        }

        // Filter by batch
        if ($request->has('batch_id')) {
            $query->where('batch_id', $request->batch_id);
        }

        // Filter by status kelulusan
        if ($request->has('status_kelulusan')) {
            $query->whereHas('penilaian', function($q) use ($request) {
                $q->where('status_kelulusan', $request->status_kelulusan);
            });
        }

        $pendaftaran = $query->paginate($request->get('per_page', 10));

        return response()->json($pendaftaran);
    }

    public function apiStore(Request $request)
    {
        $validated = $request->validate([
            'pendaftaran_id' => 'required|exists:pendaftaran_sertifikasi,id',
            'nilai_teori' => 'required|numeric|min:0|max:100',
            'nilai_praktek' => 'required|numeric|min:0|max:100',
            'catatan_asesor' => 'nullable|string'
        ]);

        $pendaftaran = PendaftaranSertifikasi::findOrFail($validated['pendaftaran_id']);
        
        $nilaiAkhir = ($validated['nilai_teori'] * 0.4) + ($validated['nilai_praktek'] * 0.6);
        
        $validated['nilai_akhir'] = $nilaiAkhir;
        $validated['status_kelulusan'] = $nilaiAkhir >= 70 ? 'Lulus' : 'Tidak Lulus';
        $validated['tanggal_penilaian'] = now();
        $validated['asesor_id'] = auth()->id();
        $validated['sertifikasi_id'] = $pendaftaran->sertifikasi_id;
        $validated['batch_id'] = $pendaftaran->batch_id;

        $penilaian = PenilaianSertifikasi::updateOrCreate(
            ['pendaftaran_id' => $validated['pendaftaran_id']],
            $validated
        );

        return response()->json([
            'message' => 'Penilaian berhasil disimpan',
            'data' => $penilaian
        ], 201);
    }

    public function apiUpdate(Request $request, $id)
    {
        $penilaian = PenilaianSertifikasi::findOrFail($id);

        $validated = $request->validate([
            'nilai_teori' => 'required|numeric|min:0|max:100',
            'nilai_praktek' => 'required|numeric|min:0|max:100',
            'catatan_asesor' => 'nullable|string'
        ]);

        $nilaiAkhir = ($validated['nilai_teori'] * 0.4) + ($validated['nilai_praktek'] * 0.6);
        
        $validated['nilai_akhir'] = $nilaiAkhir;
        $validated['status_kelulusan'] = $nilaiAkhir >= 70 ? 'Lulus' : 'Tidak Lulus';

        $penilaian->update($validated);

        return response()->json([
            'message' => 'Penilaian berhasil diperbarui',
            'data' => $penilaian
        ]);
    }
}
