<?php

namespace App\Http\Resources\Admin;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PendaftaranSertifikasiResource extends JsonResource
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
            'sertifikasi_id' => $this->sertifikasi_id,
            'batch_id' => $this->batch_id,
            'tanggal_daftar' => $this->tanggal_daftar->format('Y-m-d H:i:s'),
            'tanggal_daftar_formatted' => $this->tanggal_daftar->format('d M Y H:i'),
            'status_pendaftaran' => $this->status_pendaftaran,
            'catatan_admin' => $this->catatan_admin,
            'bukti_pembayaran' => $this->bukti_pembayaran ? asset('storage/' . $this->bukti_pembayaran) : null,
            'tanggal_pembayaran' => $this->tanggal_pembayaran?->format('Y-m-d H:i:s'),
            'tanggal_pembayaran_formatted' => $this->tanggal_pembayaran?->format('d M Y H:i'),
            'status_pembayaran' => $this->status_pembayaran,
            'created_at' => $this->created_at->format('Y-m-d H:i:s'),
            'updated_at' => $this->updated_at->format('Y-m-d H:i:s'),
            'created_at_human' => $this->created_at->diffForHumans(),
            'updated_at_human' => $this->updated_at->diffForHumans(),
            
            // Status computed
            'is_pending' => $this->status_pendaftaran === 'pending',
            'is_approved' => $this->status_pendaftaran === 'approved',
            'is_rejected' => $this->status_pendaftaran === 'rejected',
            'is_paid' => $this->status_pembayaran === 'paid',
            'is_unpaid' => $this->status_pembayaran === 'unpaid',
            
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
                ];
            }),
            'sertifikasi' => $this->whenLoaded('sertifikasi', function () {
                return [
                    'id' => $this->sertifikasi->id,
                    'nama_sertifikasi' => $this->sertifikasi->nama_sertifikasi,
                    'kategori' => $this->sertifikasi->kategori,
                    'level' => $this->sertifikasi->level,
                    'biaya' => $this->sertifikasi->biaya,
                    'biaya_formatted' => 'Rp ' . number_format($this->sertifikasi->biaya, 0, ',', '.'),
                ];
            }),
            'batch' => $this->whenLoaded('batch', function () {
                return [
                    'id' => $this->batch->id,
                    'nama_batch' => $this->batch->nama_batch,
                    'tanggal_mulai' => $this->batch->tanggal_mulai->format('Y-m-d'),
                    'tanggal_selesai' => $this->batch->tanggal_selesai->format('Y-m-d'),
                    'tanggal_mulai_formatted' => $this->batch->tanggal_mulai->format('d M Y'),
                    'tanggal_selesai_formatted' => $this->batch->tanggal_selesai->format('d M Y'),
                    'tempat' => $this->batch->tempat,
                ];
            }),
            'penilaian' => $this->whenLoaded('penilaian', function () {
                return new PenilaianSertifikasiResource($this->penilaian);
            }),
        ];
    }
}
