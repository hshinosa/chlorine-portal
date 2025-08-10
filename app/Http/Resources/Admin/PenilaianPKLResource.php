<?php

namespace App\Http\Resources\Admin;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PenilaianPKLResource extends JsonResource
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
            'pendaftaran_pkl_id' => $this->pendaftaran_pkl_id,
            'posisi_pkl_id' => $this->posisi_pkl_id,
            'pembimbing_id' => $this->pembimbing_id,
            'nilai_technical_skill' => $this->nilai_technical_skill,
            'nilai_soft_skill' => $this->nilai_soft_skill,
            'nilai_komunikasi' => $this->nilai_komunikasi,
            'nilai_problem_solving' => $this->nilai_problem_solving,
            'nilai_teamwork' => $this->nilai_teamwork,
            'nilai_adaptability' => $this->nilai_adaptability,
            'nilai_initiative' => $this->nilai_initiative,
            'nilai_akhir' => $this->nilai_akhir,
            'grade' => $this->grade,
            'feedback_pembimbing' => $this->feedback_pembimbing,
            'pencapaian_utama' => $this->pencapaian_utama,
            'area_improvement' => $this->area_improvement,
            'rekomendasi' => $this->rekomendasi,
            'status_kelulusan' => $this->status_kelulusan,
            'tanggal_penilaian' => $this->tanggal_penilaian->format('Y-m-d H:i:s'),
            'tanggal_penilaian_formatted' => $this->tanggal_penilaian->format('d M Y H:i'),
            'created_at' => $this->created_at->format('Y-m-d H:i:s'),
            'updated_at' => $this->updated_at->format('Y-m-d H:i:s'),
            'created_at_human' => $this->created_at->diffForHumans(),
            'updated_at_human' => $this->updated_at->diffForHumans(),
            
            // Status computed
            'is_lulus' => $this->status_kelulusan === 'Lulus',
            'is_tidak_lulus' => $this->status_kelulusan === 'Tidak Lulus',
            'nilai_breakdown' => [
                'technical_skill' => $this->nilai_technical_skill,
                'soft_skill' => $this->nilai_soft_skill,
                'komunikasi' => $this->nilai_komunikasi,
                'problem_solving' => $this->nilai_problem_solving,
                'teamwork' => $this->nilai_teamwork,
                'adaptability' => $this->nilai_adaptability,
                'initiative' => $this->nilai_initiative,
            ],
            'performance_level' => $this->getPerformanceLevel(),
            
            // Relationships
            'pendaftaran_pkl' => $this->whenLoaded('pendaftaranPKL', function () {
                return [
                    'id' => $this->pendaftaranPKL->id,
                    'tanggal_daftar' => $this->pendaftaranPKL->tanggal_daftar->format('Y-m-d'),
                    'status_pendaftaran' => $this->pendaftaranPKL->status_pendaftaran,
                ];
            }),
            'user' => $this->whenLoaded('pendaftaranPKL.user', function () {
                return [
                    'id' => $this->pendaftaranPKL->user->id,
                    'name' => $this->pendaftaranPKL->user->name,
                    'email' => $this->pendaftaranPKL->user->email,
                    'phone' => $this->pendaftaranPKL->user->phone,
                    'institution' => $this->pendaftaranPKL->user->institution,
                    'major' => $this->pendaftaranPKL->user->major,
                ];
            }),
            'posisi_pkl' => $this->whenLoaded('posisiPKL', function () {
                return [
                    'id' => $this->posisiPKL->id,
                    'nama_posisi' => $this->posisiPKL->nama_posisi,
                    'divisi' => $this->posisiPKL->divisi,
                    'lokasi' => $this->posisiPKL->lokasi,
                ];
            }),
            'pembimbing' => $this->whenLoaded('pembimbing', function () {
                return [
                    'id' => $this->pembimbing->id,
                    'name' => $this->pembimbing->name,
                    'email' => $this->pembimbing->email,
                ];
            }),
        ];
    }

    /**
     * Get performance level based on nilai_akhir.
     */
    private function getPerformanceLevel(): string
    {
        if ($this->nilai_akhir >= 90) return 'Excellent';
        if ($this->nilai_akhir >= 80) return 'Good';
        if ($this->nilai_akhir >= 70) return 'Satisfactory';
        if ($this->nilai_akhir >= 60) return 'Needs Improvement';
        return 'Unsatisfactory';
    }
}
