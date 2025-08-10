<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SertifikasiResource extends JsonResource
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
            'nama_sertifikasi' => $this->nama_sertifikasi,
            'jenis_sertifikasi' => $this->jenis_sertifikasi,
            'deskripsi' => $this->deskripsi,
            'thumbnail' => $this->thumbnail ? asset('storage/' . $this->thumbnail) : null,
            'nama_asesor' => $this->nama_asesor,
            'jabatan_asesor' => $this->jabatan_asesor,
            'instansi_asesor' => $this->instansi_asesor,
            'pengalaman_asesor' => $this->pengalaman_asesor,
            'foto_asesor' => $this->foto_asesor ? asset('storage/' . $this->foto_asesor) : null,
            'tipe_sertifikat' => $this->tipe_sertifikat,
            'kapasitas_peserta' => $this->kapasitas_peserta,
            'status' => $this->status,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
