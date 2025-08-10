<?php

namespace App\Http\Resources\Admin;

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
            'deskripsi' => $this->deskripsi,
            'persyaratan' => $this->persyaratan,
            'benefit' => $this->benefit,
            'lokasi' => $this->lokasi,
            'tipe_lokasi' => $this->tipe_lokasi,
            'durasi_bulan' => $this->durasi_bulan,
            'kuota' => $this->kuota,
            'jumlah_pendaftar' => $this->jumlah_pendaftar ?? 0,
            'sisa_kuota' => $this->kuota - ($this->jumlah_pendaftar ?? 0),
            'tanggal_mulai' => $this->tanggal_mulai->format('Y-m-d'),
            'tanggal_selesai' => $this->tanggal_selesai->format('Y-m-d'),
            'tanggal_mulai_formatted' => $this->tanggal_mulai->format('d M Y'),
            'tanggal_selesai_formatted' => $this->tanggal_selesai->format('d M Y'),
            'batas_pendaftaran' => $this->batas_pendaftaran->format('Y-m-d'),
            'batas_pendaftaran_formatted' => $this->batas_pendaftaran->format('d M Y'),
            'status' => $this->status,
            'pembimbing_id' => $this->pembimbing_id,
            'divisi' => $this->divisi,
            'level_kesulitan' => $this->level_kesulitan,
            'skill_required' => $this->skill_required ? explode(',', $this->skill_required) : [],
            'created_at' => $this->created_at->format('Y-m-d H:i:s'),
            'updated_at' => $this->updated_at->format('Y-m-d H:i:s'),
            'created_at_human' => $this->created_at->diffForHumans(),
            'updated_at_human' => $this->updated_at->diffForHumans(),
            
            // Status computed
            'is_full' => ($this->jumlah_pendaftar ?? 0) >= $this->kuota,
            'is_active' => $this->status === 'active',
            'is_remote' => $this->tipe_lokasi === 'remote',
            'is_onsite' => $this->tipe_lokasi === 'onsite',
            'is_hybrid' => $this->tipe_lokasi === 'hybrid',
            'is_open_for_registration' => $this->batas_pendaftaran >= now() && $this->status === 'active',
            'is_ongoing' => $this->tanggal_mulai <= now() && $this->tanggal_selesai >= now(),
            'is_completed' => $this->tanggal_selesai < now(),
            'is_upcoming' => $this->tanggal_mulai > now(),
            'days_until_deadline' => max(0, now()->diffInDays($this->batas_pendaftaran, false)),
            
            // Relationships
            'pembimbing' => $this->whenLoaded('pembimbing', function () {
                return [
                    'id' => $this->pembimbing->id,
                    'name' => $this->pembimbing->name,
                    'email' => $this->pembimbing->email,
                    'phone' => $this->pembimbing->phone,
                ];
            }),
            'pendaftaran' => $this->whenLoaded('pendaftaran', function () {
                return PendaftaranPKLResource::collection($this->pendaftaran);
            }),
        ];
    }
}
