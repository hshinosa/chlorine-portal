<?php

namespace App\Http\Resources\Admin;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PenilaianSertifikasiResource extends JsonResource
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
            'pendaftaran_id' => $this->pendaftaran_id,
            'sertifikasi_id' => $this->sertifikasi_id,
            'batch_id' => $this->batch_id,
            'asesor_id' => $this->asesor_id,
            'nilai_teori' => $this->nilai_teori,
            'nilai_praktek' => $this->nilai_praktek,
            'nilai_akhir' => $this->nilai_akhir,
            'status_kelulusan' => $this->status_kelulusan,
            'catatan_asesor' => $this->catatan_asesor,
            'tanggal_penilaian' => $this->tanggal_penilaian->format('Y-m-d H:i:s'),
            'tanggal_penilaian_formatted' => $this->tanggal_penilaian->format('d M Y H:i'),
            'created_at' => $this->created_at->format('Y-m-d H:i:s'),
            'updated_at' => $this->updated_at->format('Y-m-d H:i:s'),
            'created_at_human' => $this->created_at->diffForHumans(),
            'updated_at_human' => $this->updated_at->diffForHumans(),
            
            // Status computed
            'is_lulus' => $this->status_kelulusan === 'Lulus',
            'is_tidak_lulus' => $this->status_kelulusan === 'Tidak Lulus',
            'grade' => $this->getGrade(),
            
            // Relationships
            'pendaftaran' => $this->whenLoaded('pendaftaran', function () {
                return [
                    'id' => $this->pendaftaran->id,
                    'tanggal_daftar' => $this->pendaftaran->tanggal_daftar->format('Y-m-d'),
                    'status_pendaftaran' => $this->pendaftaran->status_pendaftaran,
                ];
            }),
            'user' => $this->whenLoaded('pendaftaran.user', function () {
                return [
                    'id' => $this->pendaftaran->user->id,
                    'name' => $this->pendaftaran->user->name,
                    'email' => $this->pendaftaran->user->email,
                    'phone' => $this->pendaftaran->user->phone,
                    'institution' => $this->pendaftaran->user->institution,
                ];
            }),
            'sertifikasi' => $this->whenLoaded('sertifikasi', function () {
                return [
                    'id' => $this->sertifikasi->id,
                    'nama_sertifikasi' => $this->sertifikasi->nama_sertifikasi,
                    'kategori' => $this->sertifikasi->kategori,
                    'level' => $this->sertifikasi->level,
                ];
            }),
            'batch' => $this->whenLoaded('batch', function () {
                return [
                    'id' => $this->batch->id,
                    'nama_batch' => $this->batch->nama_batch,
                    'tanggal_mulai' => $this->batch->tanggal_mulai->format('Y-m-d'),
                    'tanggal_selesai' => $this->batch->tanggal_selesai->format('Y-m-d'),
                ];
            }),
            'asesor' => $this->whenLoaded('asesor', function () {
                return [
                    'id' => $this->asesor->id,
                    'name' => $this->asesor->name,
                    'email' => $this->asesor->email,
                ];
            }),
        ];
    }

    /**
     * Get grade based on nilai_akhir.
     */
    private function getGrade(): string
    {
        if ($this->nilai_akhir >= 90) return 'A';
        if ($this->nilai_akhir >= 80) return 'B';
        if ($this->nilai_akhir >= 70) return 'C';
        if ($this->nilai_akhir >= 60) return 'D';
        return 'E';
    }
}
