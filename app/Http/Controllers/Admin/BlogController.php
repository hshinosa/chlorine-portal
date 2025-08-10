<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Blog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;

class BlogController extends Controller
{
    public function index()
    {
        $blogs = Blog::latest()->paginate(10);

        return Inertia::render('admin/manajemen-blog', [
            'blogs' => $blogs
        ]);
    }

    public function create()
    {
        return Inertia::render('admin/form-blog');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nama_artikel' => 'required|string|max:255',
            'jenis_konten' => 'required|in:Blog,News,Tutorial',
            'deskripsi' => 'required|string|max:500',
            'thumbnail' => 'nullable|image|max:2048',
            'konten' => 'required|string',
            'status' => 'required|in:Draf,Publish',
            'penulis' => 'required|string|max:255',
            'featured' => 'boolean',
            'meta_title' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string|max:500'
        ]);

        // Generate slug
        $validated['slug'] = Str::slug($validated['nama_artikel']);
        
        // Ensure unique slug
        $originalSlug = $validated['slug'];
        $counter = 1;
        while (Blog::where('slug', $validated['slug'])->exists()) {
            $validated['slug'] = $originalSlug . '-' . $counter++;
        }

        // Upload thumbnail
        if ($request->hasFile('thumbnail')) {
            $validated['thumbnail'] = $request->file('thumbnail')->store('blog/thumbnails', 'public');
        }

        $validated['featured'] = $request->boolean('featured');

        Blog::create($validated);

        return redirect()->route('admin.manajemen-blog')
            ->with('success', 'Artikel berhasil dibuat');
    }

    public function show($id)
    {
        $blog = Blog::findOrFail($id);
        return response()->json($blog);
    }

    public function edit($id)
    {
        $blog = Blog::findOrFail($id);

        return Inertia::render('admin/form-blog', [
            'blog' => $blog,
            'isEdit' => true
        ]);
    }

    public function update(Request $request, $id)
    {
        $blog = Blog::findOrFail($id);

        $validated = $request->validate([
            'nama_artikel' => 'required|string|max:255',
            'jenis_konten' => 'required|in:Blog,News,Tutorial',
            'deskripsi' => 'required|string|max:500',
            'thumbnail' => 'nullable|image|max:2048',
            'konten' => 'required|string',
            'status' => 'required|in:Draf,Publish',
            'penulis' => 'required|string|max:255',
            'featured' => 'boolean',
            'meta_title' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string|max:500'
        ]);

        // Update slug if title changed
        if ($blog->nama_artikel !== $validated['nama_artikel']) {
            $validated['slug'] = Str::slug($validated['nama_artikel']);
            
            // Ensure unique slug
            $originalSlug = $validated['slug'];
            $counter = 1;
            while (Blog::where('slug', $validated['slug'])->where('id', '!=', $id)->exists()) {
                $validated['slug'] = $originalSlug . '-' . $counter++;
            }
        }

        // Handle thumbnail upload
        if ($request->hasFile('thumbnail')) {
            if ($blog->thumbnail) {
                Storage::disk('public')->delete($blog->thumbnail);
            }
            $validated['thumbnail'] = $request->file('thumbnail')->store('blog/thumbnails', 'public');
        }

        $validated['featured'] = $request->boolean('featured');

        $blog->update($validated);

        return redirect()->route('admin.manajemen-blog')
            ->with('success', 'Artikel berhasil diperbarui');
    }

    public function destroy($id)
    {
        $blog = Blog::findOrFail($id);

        // Delete thumbnail
        if ($blog->thumbnail) {
            Storage::disk('public')->delete($blog->thumbnail);
        }

        $blog->delete();

        return redirect()->route('admin.manajemen-blog')
            ->with('success', 'Artikel berhasil dihapus');
    }

    // API Methods
    public function apiIndex(Request $request)
    {
        $query = Blog::query();

        // Search
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('nama_artikel', 'like', '%' . $search . '%')
                  ->orWhere('deskripsi', 'like', '%' . $search . '%')
                  ->orWhere('penulis', 'like', '%' . $search . '%');
            });
        }

        // Filter by jenis konten
        if ($request->has('jenis_konten')) {
            $query->where('jenis_konten', $request->jenis_konten);
        }

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Filter by featured
        if ($request->has('featured')) {
            $query->where('featured', $request->boolean('featured'));
        }

        // Sort
        $sortBy = $request->get('sort_by', 'created_at');
        $sortDirection = $request->get('sort_direction', 'desc');
        $query->orderBy($sortBy, $sortDirection);

        $blogs = $query->paginate($request->get('per_page', 10));

        return response()->json($blogs);
    }

    public function apiStore(Request $request)
    {
        $validated = $request->validate([
            'nama_artikel' => 'required|string|max:255',
            'jenis_konten' => 'required|in:Blog,News,Tutorial',
            'deskripsi' => 'required|string|max:500',
            'konten' => 'required|string',
            'status' => 'required|in:Draf,Publish',
            'penulis' => 'required|string|max:255',
            'featured' => 'boolean'
        ]);

        $validated['slug'] = Str::slug($validated['nama_artikel']);
        $validated['featured'] = $request->boolean('featured');

        $blog = Blog::create($validated);

        return response()->json([
            'message' => 'Artikel berhasil dibuat',
            'data' => $blog
        ], 201);
    }

    public function apiUpdate(Request $request, $id)
    {
        $blog = Blog::findOrFail($id);

        $validated = $request->validate([
            'nama_artikel' => 'required|string|max:255',
            'jenis_konten' => 'required|in:Blog,News,Tutorial',
            'deskripsi' => 'required|string|max:500',
            'konten' => 'required|string',
            'status' => 'required|in:Draf,Publish',
            'penulis' => 'required|string|max:255',
            'featured' => 'boolean'
        ]);

        if ($blog->nama_artikel !== $validated['nama_artikel']) {
            $validated['slug'] = Str::slug($validated['nama_artikel']);
        }

        $validated['featured'] = $request->boolean('featured');

        $blog->update($validated);

        return response()->json([
            'message' => 'Artikel berhasil diperbarui',
            'data' => $blog
        ]);
    }

    public function apiDestroy($id)
    {
        $blog = Blog::findOrFail($id);
        
        if ($blog->thumbnail) {
            Storage::disk('public')->delete($blog->thumbnail);
        }
        
        $blog->delete();

        return response()->json([
            'message' => 'Artikel berhasil dihapus'
        ]);
    }
}
