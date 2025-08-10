<?php

namespace App\Http\Resources\Admin;

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
            'deskripsi' => $this->deskripsi,
            'kategori' => $this->kategori,
            'level' => $this->level,
            'durasi_hari' => $this->durasi_hari,
            'kapasitas_per_batch' => $this->kapasitas_per_batch,
            'syarat_kelulusan' => $this->syarat_kelulusan,
            'biaya' => $this->biaya,
            'biaya_formatted' => 'Rp ' . number_format($this->biaya, 0, ',', '.'),
            'status' => $this->status,
            'logo' => $this->logo ? asset('storage/' . $this->logo) : null,
            'brosur' => $this->brosur ? asset('storage/' . $this->brosur) : null,
            'created_by' => $this->created_by,
            'updated_by' => $this->updated_by,
            'created_at' => $this->created_at->format('Y-m-d H:i:s'),
            'updated_at' => $this->updated_at->format('Y-m-d H:i:s'),
            'created_at_human' => $this->created_at->diffForHumans(),
            'updated_at_human' => $this->updated_at->diffForHumans(),
            
            // Relationships
            'creator' => $this->whenLoaded('creator', function () {
                return [
                    'id' => $this->creator->id,
                    'name' => $this->creator->name,
                    'email' => $this->creator->email,
                ];
            }),
            'updater' => $this->whenLoaded('updater', function () {
                return [
                    'id' => $this->updater->id,
                    'name' => $this->updater->name,
                    'email' => $this->updater->email,
                ];
            }),
            'modul_sertifikasi' => $this->whenLoaded('modulSertifikasi', function () {
                return ModulSertifikasiResource::collection($this->modulSertifikasi);
            }),
            'batch_sertifikasi' => $this->whenLoaded('batchSertifikasi', function () {
                return BatchSertifikasiResource::collection($this->batchSertifikasi);
            }),
            'pendaftaran_count' => $this->when(isset($this->pendaftaran_count), $this->pendaftaran_count),
            'batch_count' => $this->when(isset($this->batch_count), $this->batch_count),
        ];
    }
}
