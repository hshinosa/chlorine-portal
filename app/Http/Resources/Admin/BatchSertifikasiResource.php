<?php

namespace App\Http\Resources\Admin;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BatchSertifikasiResource extends JsonResource
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
            'sertifikasi_id' => $this->sertifikasi_id,
            'nama_batch' => $this->nama_batch,
            'tanggal_mulai' => $this->tanggal_mulai->format('Y-m-d'),
            'tanggal_selesai' => $this->tanggal_selesai->format('Y-m-d'),
            'tanggal_mulai_formatted' => $this->tanggal_mulai->format('d M Y'),
            'tanggal_selesai_formatted' => $this->tanggal_selesai->format('d M Y'),
            'jam_mulai' => $this->jam_mulai,
            'jam_selesai' => $this->jam_selesai,
            'tempat' => $this->tempat,
            'kuota' => $this->kuota,
            'jumlah_pendaftar' => $this->jumlah_pendaftar ?? 0,
            'sisa_kuota' => $this->kuota - ($this->jumlah_pendaftar ?? 0),
            'status' => $this->status,
            'instruktur' => $this->instruktur,
            'catatan' => $this->catatan,
            'created_at' => $this->created_at->format('Y-m-d H:i:s'),
            'updated_at' => $this->updated_at->format('Y-m-d H:i:s'),
            'created_at_human' => $this->created_at->diffForHumans(),
            'updated_at_human' => $this->updated_at->diffForHumans(),
            
            // Status computed
            'is_full' => ($this->jumlah_pendaftar ?? 0) >= $this->kuota,
            'is_active' => $this->status === 'active',
            'is_ongoing' => $this->tanggal_mulai <= now() && $this->tanggal_selesai >= now(),
            'is_completed' => $this->tanggal_selesai < now(),
            'is_upcoming' => $this->tanggal_mulai > now(),
            
            // Relationships
            'sertifikasi' => $this->whenLoaded('sertifikasi', function () {
                return [
                    'id' => $this->sertifikasi->id,
                    'nama_sertifikasi' => $this->sertifikasi->nama_sertifikasi,
                    'kategori' => $this->sertifikasi->kategori,
                    'level' => $this->sertifikasi->level,
                    'durasi_hari' => $this->sertifikasi->durasi_hari,
                ];
            }),
            'pendaftaran' => $this->whenLoaded('pendaftaran', function () {
                return PendaftaranSertifikasiResource::collection($this->pendaftaran);
            }),
        ];
    }
}
