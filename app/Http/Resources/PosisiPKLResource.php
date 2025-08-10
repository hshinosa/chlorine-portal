<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PosisiPKLResource extends JsonResource
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
            'nama_posisi' => $this->nama_posisi,
            'perusahaan' => $this->perusahaan,
            'deskripsi' => $this->deskripsi,
            'persyaratan' => $this->persyaratan,
            'lokasi' => $this->lokasi,
            'tipe' => $this->tipe,
            'durasi_bulan' => $this->durasi_bulan,
            'gaji' => $this->gaji,
            'kuota' => $this->kuota,
            'jumlah_pendaftar' => $this->jumlah_pendaftar,
            'status' => $this->status,
            'tanggal_mulai' => $this->tanggal_mulai,
            'tanggal_selesai' => $this->tanggal_selesai,
            'contact_person' => $this->contact_person,
            'contact_email' => $this->contact_email,
            'contact_phone' => $this->contact_phone,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
