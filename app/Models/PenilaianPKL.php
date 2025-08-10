<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PenilaianPKL extends Model
{
    use HasFactory;

    protected $table = 'penilaian_pkl';

    protected $fillable = [
        'pendaftaran_id',
        'pkl_id',
        'nilai_sikap',
        'nilai_keterampilan',
        'nilai_pengetahuan',
        'nilai_akhir',
        'status_kelulusan',
        'catatan_pembimbing',
        'tanggal_penilaian',
        'pembimbing_id'
    ];

    protected $casts = [
        'nilai_sikap' => 'decimal:2',
        'nilai_keterampilan' => 'decimal:2',
        'nilai_pengetahuan' => 'decimal:2',
        'nilai_akhir' => 'decimal:2',
        'tanggal_penilaian' => 'date'
    ];

    // Relationships
    public function pendaftaran()
    {
        return $this->belongsTo(PendaftaranPKL::class, 'pendaftaran_id');
    }

    public function pkl()
    {
        return $this->belongsTo(PKL::class);
    }

    public function pembimbing()
    {
        return $this->belongsTo(User::class, 'pembimbing_id');
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
