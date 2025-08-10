<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Str;

class BlogResource extends JsonResource
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
            'nama_artikel' => $this->nama_artikel,
            'jenis_konten' => $this->jenis_konten,
            'deskripsi' => $this->deskripsi,
            'konten' => $this->konten,
            'thumbnail' => $this->thumbnail ? asset('storage/' . $this->thumbnail) : null,
            'slug' => $this->slug,
            'status' => $this->status,
            'penulis' => $this->penulis,
            'featured' => $this->featured,
            'views' => $this->views,
            'meta_title' => $this->meta_title,
            'meta_description' => $this->meta_description,
            'excerpt' => Str::limit(strip_tags($this->konten ?? ''), 150),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
