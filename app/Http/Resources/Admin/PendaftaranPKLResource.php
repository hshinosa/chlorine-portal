<?php

namespace App\Http\Resources\Admin;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PendaftaranPKLResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'posisi_pkl_id' => $this->posisi_pkl_id,
            'tanggal_daftar' => $this->tanggal_daftar->format('Y-m-d H:i:s'),
            'tanggal_daftar_formatted' => $this->tanggal_daftar->format('d M Y H:i'),
            'status_pendaftaran' => $this->status_pendaftaran,
            'catatan_admin' => $this->catatan_admin,
            'cv_file' => $this->cv_file ? asset('storage/' . $this->cv_file) : null,
            'portofolio_file' => $this->portofolio_file ? asset('storage/' . $this->portofolio_file) : null,
            'surat_lamaran' => $this->surat_lamaran ? asset('storage/' . $this->surat_lamaran) : null,
            'motivasi' => $this->motivasi,
            'pengalaman_relevan' => $this->pengalaman_relevan,
            'keahlian_khusus' => $this->keahlian_khusus ? explode(',', $this->keahlian_khusus) : [],
            'expected_outcome' => $this->expected_outcome,
            'created_at' => $this->created_at->format('Y-m-d H:i:s'),
            'updated_at' => $this->updated_at->format('Y-m-d H:i:s'),
            'created_at_human' => $this->created_at->diffForHumans(),
            'updated_at_human' => $this->updated_at->diffForHumans(),
            
            // Status computed
            'is_pending' => $this->status_pendaftaran === 'pending',
            'is_approved' => $this->status_pendaftaran === 'approved',
            'is_rejected' => $this->status_pendaftaran === 'rejected',
            'is_in_progress' => $this->status_pendaftaran === 'in_progress',
            'is_completed' => $this->status_pendaftaran === 'completed',
            
            // Relationships
            'user' => $this->whenLoaded('user', function () {
                return [
                    'id' => $this->user->id,
                    'name' => $this->user->name,
                    'email' => $this->user->email,
                    'phone' => $this->user->phone,
                    'institution' => $this->user->institution,
                    'major' => $this->user->major,
                    'semester' => $this->user->semester,
                    'gpa' => $this->user->gpa,
                ];
            }),
            'posisi_pkl' => $this->whenLoaded('posisiPKL', function () {
                return [
                    'id' => $this->posisiPKL->id,
                    'nama_posisi' => $this->posisiPKL->nama_posisi,
                    'divisi' => $this->posisiPKL->divisi,
                    'lokasi' => $this->posisiPKL->lokasi,
                    'tipe_lokasi' => $this->posisiPKL->tipe_lokasi,
                    'durasi_bulan' => $this->posisiPKL->durasi_bulan,
                    'level_kesulitan' => $this->posisiPKL->level_kesulitan,
                ];
            }),
            'penilaian' => $this->whenLoaded('penilaian', function () {
                return new PenilaianPKLResource($this->penilaian);
            }),
        ];
    }
}
