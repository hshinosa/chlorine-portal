<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Video extends Model
{
    use HasFactory;

    protected $table = 'video';

    protected $fillable = [
        'nama_video',
        'deskripsi',
        'thumbnail',
        'video_url',
        'durasi',
        'views',
        'featured',
        'status',
        'uploader'
    ];

    protected $casts = [
        'durasi' => 'integer', // dalam detik
        'views' => 'integer',
        'featured' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime'
    ];

    // Relationships
    public function tags()
    {
        return $this->belongsToMany(Tag::class, 'video_tag');
    }

    public function kategori()
    {
        return $this->belongsToMany(Kategori::class, 'video_kategori');
    }

    // Scopes
    public function scopePublished($query)
    {
        return $query->where('status', 'Publish');
    }

    public function scopeFeatured($query)
    {
        return $query->where('featured', true);
    }

    // Accessors
    public function getThumbnailUrlAttribute()
    {
        return $this->thumbnail ? asset('storage/' . $this->thumbnail) : null;
    }

    public function getDurasiFormattedAttribute()
    {
        $minutes = floor($this->durasi / 60);
        $seconds = $this->durasi % 60;
        return sprintf('%02d:%02d', $minutes, $seconds);
    }

    // Methods
    public function incrementViews()
    {
        $this->increment('views');
    }
}
