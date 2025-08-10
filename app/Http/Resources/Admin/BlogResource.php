<?php

namespace App\Http\Resources\Admin;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

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
            'judul' => $this->judul,
            'slug' => $this->slug,
            'konten' => $this->konten,
            'excerpt' => $this->excerpt ?? $this->getExcerpt(),
            'featured_image' => $this->featured_image ? asset('storage/' . $this->featured_image) : null,
            'kategori' => $this->kategori,
            'tags' => $this->tags ? explode(',', $this->tags) : [],
            'status' => $this->status,
            'is_featured' => $this->is_featured,
            'published_at' => $this->published_at?->format('Y-m-d H:i:s'),
            'published_at_formatted' => $this->published_at?->format('d M Y H:i'),
            'views' => $this->views ?? 0,
            'author_id' => $this->author_id,
            'meta_title' => $this->meta_title,
            'meta_description' => $this->meta_description,
            'created_at' => $this->created_at->format('Y-m-d H:i:s'),
            'updated_at' => $this->updated_at->format('Y-m-d H:i:s'),
            'created_at_human' => $this->created_at->diffForHumans(),
            'updated_at_human' => $this->updated_at->diffForHumans(),
            
            // Status computed
            'is_published' => $this->status === 'published',
            'is_draft' => $this->status === 'draft',
            'is_scheduled' => $this->status === 'scheduled',
            'reading_time' => $this->getReadingTime(),
            
            // Relationships
            'author' => $this->whenLoaded('author', function () {
                return [
                    'id' => $this->author->id,
                    'name' => $this->author->name,
                    'email' => $this->author->email,
                    'avatar_url' => $this->author->avatar_url,
                ];
            }),
        ];
    }

    /**
     * Get excerpt from content.
     */
    private function getExcerpt(): string
    {
        $text = strip_tags($this->konten);
        return strlen($text) > 150 ? substr($text, 0, 150) . '...' : $text;
    }

    /**
     * Calculate reading time.
     */
    private function getReadingTime(): string
    {
        $wordCount = str_word_count(strip_tags($this->konten));
        $minutes = max(1, ceil($wordCount / 200)); // Assuming 200 words per minute
        return $minutes . ' min read';
    }
}
