<?php

namespace App\Http\Resources\Admin;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ModulSertifikasiResource extends JsonResource
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
            'nama_modul' => $this->nama_modul,
            'deskripsi' => $this->deskripsi,
            'materi' => $this->materi,
            'durasi_jam' => $this->durasi_jam,
            'urutan' => $this->urutan,
            'status' => $this->status,
            'file_materi' => $this->file_materi ? asset('storage/' . $this->file_materi) : null,
            'created_at' => $this->created_at->format('Y-m-d H:i:s'),
            'updated_at' => $this->updated_at->format('Y-m-d H:i:s'),
            'created_at_human' => $this->created_at->diffForHumans(),
            'updated_at_human' => $this->updated_at->diffForHumans(),
            
            // Relationships
            'sertifikasi' => $this->whenLoaded('sertifikasi', function () {
                return [
                    'id' => $this->sertifikasi->id,
                    'nama_sertifikasi' => $this->sertifikasi->nama_sertifikasi,
                    'kategori' => $this->sertifikasi->kategori,
                    'level' => $this->sertifikasi->level,
                ];
            }),
        ];
    }
}
