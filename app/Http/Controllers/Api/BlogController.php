<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Blog;
use App\Http\Resources\BlogResource;

class BlogController extends Controller
{
    /**
     * Display a listing of blogs.
     */
    public function index(Request $request)
    {
        try {
            $query = Blog::query();

            // Filter by status (for public, only show published)
            if (auth()->check() && auth()->user()->role === 'admin') {
                // Admin can see all statuses
                if ($request->has('status') && $request->status !== 'all') {
                    $query->where('status', $request->status);
                }
            } else {
                // Public users only see published content
                $query->where('status', 'Publish');
            }

            // Filter by content type
            if ($request->has('jenis_konten') && $request->jenis_konten !== 'all') {
                $query->where('jenis_konten', $request->jenis_konten);
            }

            // Search functionality
            if ($request->has('search') && !empty($request->search)) {
                $query->where(function($q) use ($request) {
                    $q->where('nama_artikel', 'like', '%' . $request->search . '%')
                      ->orWhere('deskripsi', 'like', '%' . $request->search . '%')
                      ->orWhere('penulis', 'like', '%' . $request->search . '%');
                });
            }

            // Featured content first, then by creation date
            $query->orderBy('featured', 'desc')
                  ->orderBy('created_at', 'desc');

            $blogs = $query->paginate(12);

            return response()->json([
                'success' => true,
                'data' => BlogResource::collection($blogs)->response()->getData()
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve blogs',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified blog.
     */
    public function show($slug)
    {
        try {
            $query = Blog::where('slug', $slug);

            // Only show published content for non-admin users
            if (!auth()->check() || auth()->user()->role !== 'admin') {
                $query->where('status', 'Publish');
            }

            $blog = $query->firstOrFail();

            // Increment view count
            $blog->increment('views');

            return response()->json([
                'success' => true,
                'data' => new BlogResource($blog)
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Blog not found',
                'error' => $e->getMessage()
            ], 404);
        }
    }

    /**
     * Store a newly created blog (Admin only).
     */
    public function store(Request $request)
    {
        $request->validate([
            'nama_artikel' => 'required|string|max:255',
            'jenis_konten' => 'required|in:Blog,Tutorial,News',
            'deskripsi' => 'required|string',
            'konten' => 'required|string',
            'penulis' => 'required|string|max:255',
            'featured' => 'boolean',
            'meta_title' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string',
            'status' => 'in:Draft,Publish,Archived'
        ]);

        try {
            // Generate slug from title
            $slug = $this->generateSlug($request->nama_artikel);

            $blog = Blog::create([
                'nama_artikel' => $request->nama_artikel,
                'jenis_konten' => $request->jenis_konten,
                'deskripsi' => $request->deskripsi,
                'konten' => $request->konten,
                'status' => $request->status ?? 'Draft',
                'penulis' => $request->penulis,
                'featured' => $request->featured ?? false,
                'meta_title' => $request->meta_title ?? $request->nama_artikel,
                'meta_description' => $request->meta_description ?? $request->deskripsi,
                'slug' => $slug,
                'views' => 0
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Blog created successfully',
                'data' => new BlogResource($blog)
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create blog',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update the specified blog (Admin only).
     */
    public function update(Request $request, $id)
    {
        $request->validate([
            'nama_artikel' => 'required|string|max:255',
            'jenis_konten' => 'required|in:Blog,Tutorial,News',
            'deskripsi' => 'required|string',
            'konten' => 'required|string',
            'penulis' => 'required|string|max:255',
            'featured' => 'boolean',
            'meta_title' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string',
            'status' => 'in:Draft,Publish,Archived'
        ]);

        try {
            $blog = Blog::findOrFail($id);

            // Generate new slug if title changed
            $slug = $blog->slug;
            if ($blog->nama_artikel !== $request->nama_artikel) {
                $slug = $this->generateSlug($request->nama_artikel, $id);
            }

            $blog->update([
                'nama_artikel' => $request->nama_artikel,
                'jenis_konten' => $request->jenis_konten,
                'deskripsi' => $request->deskripsi,
                'konten' => $request->konten,
                'status' => $request->status ?? $blog->status,
                'penulis' => $request->penulis,
                'featured' => $request->featured ?? false,
                'meta_title' => $request->meta_title ?? $request->nama_artikel,
                'meta_description' => $request->meta_description ?? $request->deskripsi,
                'slug' => $slug
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Blog updated successfully',
                'data' => new BlogResource($blog)
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update blog',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified blog (Admin only).
     */
    public function destroy($id)
    {
        try {
            $blog = Blog::findOrFail($id);
            $blog->delete();

            return response()->json([
                'success' => true,
                'message' => 'Blog deleted successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete blog',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get featured blogs.
     */
    public function featured()
    {
        try {
            $blogs = Blog::where('status', 'Publish')
                        ->where('featured', true)
                        ->orderBy('created_at', 'desc')
                        ->limit(6)
                        ->get();

            return response()->json([
                'success' => true,
                'data' => BlogResource::collection($blogs)
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve featured blogs',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get popular blogs (most viewed).
     */
    public function popular()
    {
        try {
            $blogs = Blog::where('status', 'Publish')
                        ->orderBy('views', 'desc')
                        ->limit(6)
                        ->get();

            return response()->json([
                'success' => true,
                'data' => BlogResource::collection($blogs)
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve popular blogs',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Toggle blog featured status (Admin only).
     */
    public function toggleFeatured($id)
    {
        try {
            $blog = Blog::findOrFail($id);
            $blog->update(['featured' => !$blog->featured]);

            return response()->json([
                'success' => true,
                'message' => 'Blog featured status updated',
                'data' => new BlogResource($blog)
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to toggle featured status',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Generate unique slug from title.
     */
    private function generateSlug($title, $excludeId = null)
    {
        $slug = \Str::slug($title);
        $originalSlug = $slug;
        $counter = 1;

        while (true) {
            $query = Blog::where('slug', $slug);
            
            if ($excludeId) {
                $query->where('id', '!=', $excludeId);
            }

            if (!$query->exists()) {
                break;
            }

            $slug = $originalSlug . '-' . $counter;
            $counter++;
        }

        return $slug;
    }
}
