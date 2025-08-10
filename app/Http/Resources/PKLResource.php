<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PKLResource extends JsonResource
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
            'nama_program' => $this->nama_program,
            'deskripsi' => $this->deskripsi,
            'durasi_minggu' => $this->durasi_minggu,
            'kuota' => $this->kuota,
            'peserta_terdaftar' => $this->peserta_terdaftar,
            'status' => $this->status,
            'persyaratan' => $this->persyaratan,
            'benefit' => $this->benefit,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
