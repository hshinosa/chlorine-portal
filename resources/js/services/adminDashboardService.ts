import api from '../lib/api';
import type { ApiResponse } from '../types/api';

export interface DashboardStats {
  total_users: number;
  total_sertifikasi: number;
  total_batch_aktif: number;
  total_pendaftar_sertifikasi: number;
  total_blogs: number;
  total_videos: number;
  total_posisi_pkl: number;
  total_pendaftar_pkl: number;
}

export interface RecentRegistration {
  id: number;
  user: {
    id: number;
    name: string;
    email: string;
  };
  batch_sertifikasi?: {
    id: number;
    nama_batch: string;
    sertifikasi: {
      id: number;
      nama_sertifikasi: string;
    };
  };
  posisi_pkl?: {
    id: number;
    nama_posisi: string;
  };
  status: string;
  created_at: string;
  tanggal_pendaftaran: string;
}

export interface PendingApplication extends RecentRegistration {
  type: 'sertifikasi' | 'pkl';
  submitted_date: string;
  documents_complete: boolean;
  admin_notes?: string;
}

export interface PopularBlog {
  id: number;
  nama_artikel: string;
  jenis_konten: string;
  deskripsi: string;
  status: string;
  penulis: string;
  views: number;
  featured: boolean;
  created_at: string;
  updated_at: string;
}

export interface PopularVideo {
  id: number;
  nama_video: string;
  deskripsi: string;
  video_url: string;
  durasi: number;
  views: number;
  featured: boolean;
  status: string;
  uploader: string;
  created_at: string;
  updated_at: string;
}

export interface DashboardData {
  statistics: DashboardStats;
  recent_activities: {
    sertifikasi_registrations: RecentRegistration[];
    pkl_applications: RecentRegistration[];
  };
  popular_content: {
    blogs: PopularBlog[];
    videos: PopularVideo[];
  };
}

export interface ApplicationsInboxData {
  pending_applications: PendingApplication[];
  application_counts: {
    total_pending: number;
    pending_sertifikasi: number;
    pending_pkl: number;
    approved_today: number;
    rejected_today: number;
  };
}

export const adminDashboardService = {
  // Get admin dashboard data
  async getDashboard(): Promise<DashboardData> {
    const response = await api.get<ApiResponse<DashboardData>>('/api/v1/admin/dashboard');
    return response.data.data;
  },

  // Get pending applications for admin inbox
  async getPendingApplications(filters: { type?: string; status?: string; search?: string; page?: number } = {}): Promise<ApplicationsInboxData> {
    const params = new URLSearchParams();
    if (filters.type) params.append('type', filters.type);
    if (filters.status) params.append('status', filters.status);
    if (filters.search) params.append('search', filters.search);
    if (filters.page) params.append('page', filters.page.toString());
    
    const response = await api.get<ApiResponse<ApplicationsInboxData>>(`/api/v1/admin/applications?${params}`);
    return response.data.data;
  },

  // Approve/reject applications
  async updateApplicationStatus(applicationId: number, status: 'approved' | 'rejected', notes?: string): Promise<void> {
    await api.put<ApiResponse<void>>(`/api/v1/admin/applications/${applicationId}/status`, {
      status,
      admin_notes: notes
    });
  },

  // Get reports data
  async getReports(period: string = '7days'): Promise<any> {
    const response = await api.get<ApiResponse<any>>(`/api/v1/admin/reports?period=${period}`);
    return response.data.data;
  },

  // Get users management data
  async getUsers(filters: { role?: string; search?: string; page?: number } = {}): Promise<any> {
    const params = new URLSearchParams();
    if (filters.role) params.append('role', filters.role);
    if (filters.search) params.append('search', filters.search);
    if (filters.page) params.append('page', filters.page.toString());
    
    const response = await api.get<ApiResponse<any>>(`/api/v1/admin/users?${params}`);
    return response.data.data;
  },

  // Get certifications management data
  async getCertifications(filters: { status?: string; jenis?: string; search?: string; page?: number } = {}): Promise<any> {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.jenis) params.append('jenis', filters.jenis);
    if (filters.search) params.append('search', filters.search);
    if (filters.page) params.append('page', filters.page.toString());
    
    const response = await api.get<ApiResponse<any>>(`/api/v1/admin/certifications?${params}`);
    return response.data.data;
  },

  // Get content management data
  async getContent(filters: { type?: string; status?: string; jenis_konten?: string; search?: string; page?: number } = {}): Promise<any> {
    const params = new URLSearchParams();
    if (filters.type) params.append('type', filters.type);
    if (filters.status) params.append('status', filters.status);
    if (filters.jenis_konten) params.append('jenis_konten', filters.jenis_konten);
    if (filters.search) params.append('search', filters.search);
    if (filters.page) params.append('page', filters.page.toString());
    
    const response = await api.get<ApiResponse<any>>(`/api/v1/admin/content?${params}`);
    return response.data.data;
  }
};
