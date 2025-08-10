<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Blog extends Model
{
    use HasFactory;

    protected $table = 'blog';

    protected $fillable = [
        'nama_artikel',
        'jenis_konten',
        'deskripsi',
        'thumbnail',
        'konten',
        'status',
        'penulis',
        'views',
        'featured',
        'meta_title',
        'meta_description',
        'slug'
    ];

    protected $casts = [
        'views' => 'integer',
        'featured' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime'
    ];

    // Relationships
    public function tags()
    {
        return $this->belongsToMany(Tag::class, 'blog_tag');
    }

    public function kategori()
    {
        return $this->belongsToMany(Kategori::class, 'blog_kategori');
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

    public function scopeByJenis($query, $jenis)
    {
        return $query->where('jenis_konten', $jenis);
    }

    // Accessors
    public function getThumbnailUrlAttribute()
    {
        return $this->thumbnail ? asset('storage/' . $this->thumbnail) : null;
    }

    public function getExcerptAttribute()
    {
        return str_limit(strip_tags($this->konten), 150);
    }

    public function getRouteKeyName()
    {
        return 'slug';
    }

    // Methods
    public function incrementViews()
    {
        $this->increment('views');
    }
}
