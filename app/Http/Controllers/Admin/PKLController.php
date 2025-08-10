<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\PKL;
use App\Models\PendaftaranPKL;
use App\Models\PenilaianPKL;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PKLController extends Controller
{
    public function index()
    {
        $pkl = PKL::withCount('pendaftaran')->latest()->paginate(10);

        return Inertia::render('admin/praktik-kerja-lapangan', [
            'pkl' => $pkl
        ]);
    }

    public function create()
    {
        return Inertia::render('admin/form-pkl');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nama_program' => 'required|string|max:255',
            'deskripsi' => 'required|string',
            'durasi_minggu' => 'required|integer|min:1',
            'kuota' => 'required|integer|min:1',
            'status' => 'required|in:Draf,Aktif,Selesai',
            'persyaratan' => 'required|array',
            'benefit' => 'required|array'
        ]);

        $validated['peserta_terdaftar'] = 0;

        PKL::create($validated);

        return redirect()->route('admin.praktik-kerja-lapangan')
            ->with('success', 'Program PKL berhasil dibuat');
    }

    public function show($id)
    {
        $pkl = PKL::with(['pendaftaran.user'])->findOrFail($id);
        return response()->json($pkl);
    }

    public function edit($id)
    {
        $pkl = PKL::findOrFail($id);

        return Inertia::render('admin/form-pkl', [
            'pkl' => $pkl,
            'isEdit' => true
        ]);
    }

    public function update(Request $request, $id)
    {
        $pkl = PKL::findOrFail($id);

        $validated = $request->validate([
            'nama_program' => 'required|string|max:255',
            'deskripsi' => 'required|string',
            'durasi_minggu' => 'required|integer|min:1',
            'kuota' => 'required|integer|min:1',
            'status' => 'required|in:Draf,Aktif,Selesai',
            'persyaratan' => 'required|array',
            'benefit' => 'required|array'
        ]);

        $pkl->update($validated);

        return redirect()->route('admin.praktik-kerja-lapangan')
            ->with('success', 'Program PKL berhasil diperbarui');
    }

    public function destroy($id)
    {
        $pkl = PKL::findOrFail($id);
        $pkl->delete();

        return redirect()->route('admin.praktik-kerja-lapangan')
            ->with('success', 'Program PKL berhasil dihapus');
    }

    // Penilaian PKL
    public function penilaianIndex()
    {
        $pendaftaran = PendaftaranPKL::with(['user', 'pkl', 'penilaian'])
            ->approved()
            ->latest()
            ->paginate(10);

        return Inertia::render('admin/penilaian-pkl', [
            'pendaftaran' => $pendaftaran
        ]);
    }

    public function penilaianShow($id)
    {
        $pendaftaran = PendaftaranPKL::with(['user', 'pkl', 'penilaian'])
            ->findOrFail($id);

        return Inertia::render('admin/detail-penilaian-pkl', [
            'pendaftaran' => $pendaftaran
        ]);
    }

    public function penilaianStore(Request $request, $pendaftaranId)
    {
        $pendaftaran = PendaftaranPKL::findOrFail($pendaftaranId);

        $validated = $request->validate([
            'nilai_sikap' => 'required|numeric|min:0|max:100',
            'nilai_keterampilan' => 'required|numeric|min:0|max:100',
            'nilai_pengetahuan' => 'required|numeric|min:0|max:100',
            'catatan_pembimbing' => 'nullable|string'
        ]);

        // Calculate nilai akhir (average)
        $nilaiAkhir = ($validated['nilai_sikap'] + $validated['nilai_keterampilan'] + $validated['nilai_pengetahuan']) / 3;
        
        $validated['nilai_akhir'] = $nilaiAkhir;
        $validated['status_kelulusan'] = $nilaiAkhir >= 70 ? 'Lulus' : 'Tidak Lulus';
        $validated['tanggal_penilaian'] = now();
        $validated['pembimbing_id'] = auth()->id();
        $validated['pendaftaran_id'] = $pendaftaranId;
        $validated['pkl_id'] = $pendaftaran->pkl_id;

        PenilaianPKL::updateOrCreate(
            ['pendaftaran_id' => $pendaftaranId],
            $validated
        );

        return redirect()->route('admin.penilaian-pkl')
            ->with('success', 'Penilaian PKL berhasil disimpan');
    }

    // API Methods
    public function apiIndex(Request $request)
    {
        $query = PKL::withCount('pendaftaran');

        if ($request->has('search')) {
            $query->where('nama_program', 'like', '%' . $request->search . '%');
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $pkl = $query->paginate($request->get('per_page', 10));

        return response()->json($pkl);
    }

    public function apiStore(Request $request)
    {
        $validated = $request->validate([
            'nama_program' => 'required|string|max:255',
            'deskripsi' => 'required|string',
            'durasi_minggu' => 'required|integer|min:1',
            'kuota' => 'required|integer|min:1',
            'status' => 'required|in:Draf,Aktif,Selesai',
            'persyaratan' => 'required|array',
            'benefit' => 'required|array'
        ]);

        $validated['peserta_terdaftar'] = 0;
        $pkl = PKL::create($validated);

        return response()->json([
            'message' => 'Program PKL berhasil dibuat',
            'data' => $pkl
        ], 201);
    }

    public function apiUpdate(Request $request, $id)
    {
        $pkl = PKL::findOrFail($id);

        $validated = $request->validate([
            'nama_program' => 'required|string|max:255',
            'deskripsi' => 'required|string',
            'durasi_minggu' => 'required|integer|min:1',
            'kuota' => 'required|integer|min:1',
            'status' => 'required|in:Draf,Aktif,Selesai',
            'persyaratan' => 'required|array',
            'benefit' => 'required|array'
        ]);

        $pkl->update($validated);

        return response()->json([
            'message' => 'Program PKL berhasil diperbarui',
            'data' => $pkl
        ]);
    }
}
