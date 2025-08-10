<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Sertifikasi;
use App\Models\ModulSertifikasi;
use App\Models\BatchSertifikasi;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;

class SertifikasiController extends Controller
{
    public function index()
    {
        $sertifikasi = Sertifikasi::with(['modul', 'batch'])
            ->latest()
            ->paginate(10);

        return Inertia::render('admin/sertifikasi-kompetensi', [
            'sertifikasi' => $sertifikasi
        ]);
    }

    public function show($id)
    {
        $sertifikasi = Sertifikasi::with(['modul.ordered', 'batch'])
            ->findOrFail($id);

        return Inertia::render('admin/detail-sertifikasi', [
            'sertifikasi' => $sertifikasi
        ]);
    }

    public function create()
    {
        return Inertia::render('admin/form-sertifikasi');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nama_sertifikasi' => 'required|string|max:255',
            'jenis_sertifikasi' => 'required|string',
            'deskripsi' => 'required|string',
            'thumbnail' => 'nullable|image|max:2048',
            'nama_asesor' => 'required|string|max:255',
            'jabatan_asesor' => 'required|string|max:255',
            'instansi_asesor' => 'required|string|max:255',
            'foto_asesor' => 'nullable|image|max:2048',
            'tipe_sertifikat' => 'required|string',
            'kapasitas' => 'required|integer|min:1',
            'modul' => 'required|array|min:1',
            'modul.*.judul' => 'required|string|max:255',
            'modul.*.deskripsi' => 'required|string',
            'modul.*.poin_pembelajaran' => 'nullable|array',
            'batch' => 'required|array|min:1',
            'batch.*.nama_batch' => 'required|string|max:255',
            'batch.*.tanggal_mulai' => 'required|date',
            'batch.*.tanggal_selesai' => 'required|date|after:batch.*.tanggal_mulai',
            'batch.*.kuota' => 'required|integer|min:1',
            'batch.*.status' => 'required|in:Draf,Aktif,Selesai'
        ]);

        // Upload thumbnail
        if ($request->hasFile('thumbnail')) {
            $validated['thumbnail'] = $request->file('thumbnail')->store('sertifikasi/thumbnails', 'public');
        }

        // Upload foto asesor
        if ($request->hasFile('foto_asesor')) {
            $validated['foto_asesor'] = $request->file('foto_asesor')->store('sertifikasi/asesor', 'public');
        }

        $validated['created_by'] = auth()->id();
        $validated['status'] = 'Aktif';

        $sertifikasi = Sertifikasi::create($validated);

        // Create modul
        foreach ($validated['modul'] as $index => $modulData) {
            $sertifikasi->modul()->create([
                'judul' => $modulData['judul'],
                'deskripsi' => $modulData['deskripsi'],
                'poin_pembelajaran' => $modulData['poin_pembelajaran'] ?? [],
                'urutan' => $index
            ]);
        }

        // Create batch
        foreach ($validated['batch'] as $batchData) {
            $sertifikasi->batch()->create($batchData);
        }

        return redirect()->route('admin.sertifikasi-kompetensi')
            ->with('success', 'Sertifikasi berhasil dibuat');
    }

    public function edit($id)
    {
        $sertifikasi = Sertifikasi::with(['modul.ordered', 'batch'])
            ->findOrFail($id);

        return Inertia::render('admin/form-sertifikasi', [
            'sertifikasi' => $sertifikasi,
            'isEdit' => true
        ]);
    }

    public function update(Request $request, $id)
    {
        $sertifikasi = Sertifikasi::findOrFail($id);

        $validated = $request->validate([
            'nama_sertifikasi' => 'required|string|max:255',
            'jenis_sertifikasi' => 'required|string',
            'deskripsi' => 'required|string',
            'thumbnail' => 'nullable|image|max:2048',
            'nama_asesor' => 'required|string|max:255',
            'jabatan_asesor' => 'required|string|max:255',
            'instansi_asesor' => 'required|string|max:255',
            'foto_asesor' => 'nullable|image|max:2048',
            'tipe_sertifikat' => 'required|string',
            'kapasitas' => 'required|integer|min:1',
            'modul' => 'required|array|min:1',
            'batch' => 'required|array|min:1'
        ]);

        // Handle thumbnail upload
        if ($request->hasFile('thumbnail')) {
            if ($sertifikasi->thumbnail) {
                Storage::disk('public')->delete($sertifikasi->thumbnail);
            }
            $validated['thumbnail'] = $request->file('thumbnail')->store('sertifikasi/thumbnails', 'public');
        }

        // Handle foto asesor upload
        if ($request->hasFile('foto_asesor')) {
            if ($sertifikasi->foto_asesor) {
                Storage::disk('public')->delete($sertifikasi->foto_asesor);
            }
            $validated['foto_asesor'] = $request->file('foto_asesor')->store('sertifikasi/asesor', 'public');
        }

        $validated['updated_by'] = auth()->id();

        $sertifikasi->update($validated);

        // Update modul
        $sertifikasi->modul()->delete();
        foreach ($validated['modul'] as $index => $modulData) {
            $sertifikasi->modul()->create([
                'judul' => $modulData['judul'],
                'deskripsi' => $modulData['deskripsi'],
                'poin_pembelajaran' => $modulData['poin_pembelajaran'] ?? [],
                'urutan' => $index
            ]);
        }

        // Update batch
        $sertifikasi->batch()->delete();
        foreach ($validated['batch'] as $batchData) {
            $sertifikasi->batch()->create($batchData);
        }

        return redirect()->route('admin.sertifikasi-kompetensi')
            ->with('success', 'Sertifikasi berhasil diperbarui');
    }

    public function destroy($id)
    {
        $sertifikasi = Sertifikasi::findOrFail($id);

        // Delete files
        if ($sertifikasi->thumbnail) {
            Storage::disk('public')->delete($sertifikasi->thumbnail);
        }
        if ($sertifikasi->foto_asesor) {
            Storage::disk('public')->delete($sertifikasi->foto_asesor);
        }

        $sertifikasi->delete();

        return redirect()->route('admin.sertifikasi-kompetensi')
            ->with('success', 'Sertifikasi berhasil dihapus');
    }

    // API Methods for frontend
    public function apiIndex(Request $request)
    {
        $query = Sertifikasi::with(['modul', 'batch']);

        // Search
        if ($request->has('search')) {
            $query->where('nama_sertifikasi', 'like', '%' . $request->search . '%');
        }

        // Filter by jenis
        if ($request->has('jenis')) {
            $query->where('jenis_sertifikasi', $request->jenis);
        }

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $sertifikasi = $query->paginate($request->get('per_page', 10));

        return response()->json($sertifikasi);
    }

    public function apiShow($id)
    {
        $sertifikasi = Sertifikasi::with(['modul.ordered', 'batch'])
            ->findOrFail($id);

        return response()->json($sertifikasi);
    }
}
