<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PenilaianSertifikasi extends Model
{
    use HasFactory;

    protected $table = 'penilaian_sertifikasi';

    protected $fillable = [
        'pendaftaran_id',
        'sertifikasi_id',
        'batch_id',
        'nilai_teori',
        'nilai_praktek',
        'nilai_akhir',
        'status_kelulusan',
        'catatan_asesor',
        'tanggal_penilaian',
        'asesor_id'
    ];

    protected $casts = [
        'nilai_teori' => 'decimal:2',
        'nilai_praktek' => 'decimal:2',
        'nilai_akhir' => 'decimal:2',
        'tanggal_penilaian' => 'date'
    ];

    // Relationships
    public function pendaftaran()
    {
        return $this->belongsTo(PendaftaranSertifikasi::class, 'pendaftaran_id');
    }

    public function sertifikasi()
    {
        return $this->belongsTo(Sertifikasi::class);
    }

    public function batch()
    {
        return $this->belongsTo(BatchSertifikasi::class, 'batch_id');
    }

    public function asesor()
    {
        return $this->belongsTo(User::class, 'asesor_id');
    }

    // Scopes
    public function scopeLulus($query)
    {
        return $query->where('status_kelulusan', 'Lulus');
    }

    public function scopeTidakLulus($query)
    {
        return $query->where('status_kelulusan', 'Tidak Lulus');
    }

    // Accessors
    public function getGradeAttribute()
    {
        if ($this->nilai_akhir >= 90) return 'A';
        if ($this->nilai_akhir >= 80) return 'B';
        if ($this->nilai_akhir >= 70) return 'C';
        if ($this->nilai_akhir >= 60) return 'D';
        return 'E';
    }
}
