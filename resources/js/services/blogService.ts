import api from '../lib/api';
import type { Blog, BlogFilters, ApiResponse, PaginatedResponse } from '../types/api';

export const blogService = {
  // Get all blogs with pagination and filters
  async getBlogs(page: number = 1, filters: BlogFilters = {}): Promise<PaginatedResponse<Blog>> {
    const params = new URLSearchParams({
      page: page.toString(),
      ...Object.fromEntries(
        Object.entries(filters).filter(([_, value]) => value !== undefined && value !== '')
      )
    });
    
    const response = await api.get<ApiResponse<PaginatedResponse<Blog>>>(`/api/v1/blog?${params}`);
    return response.data.data;
  },

  // Get single blog by ID
  async getBlog(id: number): Promise<Blog> {
    const response = await api.get<ApiResponse<Blog>>(`/api/v1/blog/${id}`);
    return response.data.data;
  },

  // Get featured blogs
  async getFeaturedBlogs(): Promise<Blog[]> {
    const response = await api.get<ApiResponse<Blog[]>>('/api/v1/blog/featured');
    return response.data.data;
  },

  // Get popular blogs
  async getPopularBlogs(): Promise<Blog[]> {
    const response = await api.get<ApiResponse<Blog[]>>('/api/v1/blog/popular');
    return response.data.data;
  },

  // Search blogs
  async searchBlogs(query: string): Promise<Blog[]> {
    const response = await api.get<ApiResponse<Blog[]>>(`/api/v1/blog?search=${encodeURIComponent(query)}`);
    return response.data.data;
  },

  // Admin: Create blog
  async createBlog(data: Partial<Blog> & { thumbnail_file?: File }): Promise<Blog> {
    if (data.thumbnail_file) {
      const form = new FormData();
      Object.entries(data).forEach(([k,v])=>{ if(v===undefined||v===null) return; if(k==='thumbnail_file' && v instanceof File) form.append('thumbnail', v); else if(k!=='thumbnail_file') form.append(k, String(v)); });
  const response = await api.post<ApiResponse<Blog>>('/api/v1/admin/blogs', form, { headers:{'Content-Type':'multipart/form-data'} });
      return response.data.data;
    }
    const clone = { ...data } as any; delete clone.thumbnail_file;
  const response = await api.post<ApiResponse<Blog>>('/api/v1/admin/blogs', clone);
    return response.data.data;
  },

  // Admin: Update blog
  async updateBlog(id: number, data: Partial<Blog> & { thumbnail_file?: File }): Promise<Blog> {
    if (data.thumbnail_file) {
      const form = new FormData();
      form.append('_method','PUT');
      Object.entries(data).forEach(([k,v])=>{ if(v===undefined||v===null) return; if(k==='thumbnail_file' && v instanceof File) form.append('thumbnail', v); else if(k!=='thumbnail_file') form.append(k, String(v)); });
  const response = await api.post<ApiResponse<Blog>>(`/api/v1/admin/blogs/${id}`, form, { headers:{'Content-Type':'multipart/form-data'} });
      return response.data.data;
    }
    const clone = { ...data } as any; delete clone.thumbnail_file;
  const response = await api.put<ApiResponse<Blog>>(`/api/v1/admin/blogs/${id}`, clone);
    return response.data.data;
  },

  // Admin: Delete blog
  async deleteBlog(id: number): Promise<void> {
  await api.delete(`/api/v1/admin/blogs/${id}`);
  },

  // Admin: Toggle featured status
  async toggleFeatured(id: number): Promise<Blog> {
  const response = await api.post<ApiResponse<Blog>>(`/api/v1/admin/blogs/${id}/toggle-featured`);
    return response.data.data;
  }
};
