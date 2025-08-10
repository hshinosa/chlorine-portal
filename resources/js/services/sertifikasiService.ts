import api from '../lib/api';
import { buildFormData } from '@/lib/formData';
import type { 
  Sertifikasi, 
  SertifikasiFilters, 
  ApiResponse, 
  PaginatedResponse 
} from '../types/api';

export const sertifikasiService = {
  // Get all sertifikasi with pagination and filters
  async getSertifikasi(page: number = 1, filters: SertifikasiFilters = {}): Promise<PaginatedResponse<Sertifikasi>> {
    const params = new URLSearchParams({
      page: page.toString(),
      ...Object.fromEntries(
        Object.entries(filters).filter(([_, value]) => value !== undefined && value !== '')
      )
    });
    
    const response = await api.get<ApiResponse<PaginatedResponse<Sertifikasi>>>(`/api/v1/sertifikasi?${params}`);
    return response.data.data;
  },

  // Get single sertifikasi by ID
  async getSertifikasiById(id: number): Promise<Sertifikasi> {
    const response = await api.get<ApiResponse<Sertifikasi>>(`/api/v1/sertifikasi/${id}`);
    return response.data.data;
  },

  // Get sertifikasi batches
  async getSertifikasiBatches(id: number): Promise<any[]> {
    const response = await api.get<ApiResponse<any[]>>(`/api/v1/sertifikasi/${id}/batches`);
    return response.data.data;
  },

  // (Deprecated) getAllBatches removed – no backend endpoint; keep stub for backward safety
  getAllBatches: async (): Promise<any[]> => {
    console.warn('getAllBatches() deprecated: use getSertifikasiBatches(sertifikasiId)');
    return [];
  },

  // User: Get my registrations
  async getMyRegistrations(): Promise<any[]> {
    const response = await api.get<ApiResponse<any[]>>('/api/v1/sertifikasi/my-registrations');
    return response.data.data;
  },

  // User: Register for sertifikasi
  async registerSertifikasi(sertifikasiId: number, batchId: number, data: any): Promise<any> {
    // backend expects batch_sertifikasi_id
    const response = await api.post<ApiResponse<any>>(`/api/v1/sertifikasi/${sertifikasiId}/register`, {
      batch_sertifikasi_id: batchId,
      ...data
    });
    return response.data.data;
  },

  // User: Cancel registration
  async cancelRegistration(registrationId: number): Promise<void> {
  await api.delete(`/api/v1/sertifikasi/registrations/${registrationId}/cancel`);
  },

  // Admin: Create sertifikasi
  async createSertifikasi(data: Partial<Sertifikasi> & Record<string, any>): Promise<Sertifikasi> {
    const hasFile = Object.values(data).some(v => v instanceof File);
    const payload = hasFile ? buildFormData(data) : data;
    const response = await api.post<ApiResponse<Sertifikasi>>('/api/v1/admin/sertifikasi', payload, {
      headers: hasFile ? { 'Content-Type': 'multipart/form-data' } : undefined
    });
    return response.data.data;
  },

  // Admin: Update sertifikasi
  async updateSertifikasi(id: number, data: Partial<Sertifikasi> & Record<string, any>): Promise<Sertifikasi> {
    const hasFile = Object.values(data).some(v => v instanceof File);
    const payload = hasFile ? buildFormData(data) : data;
    const method = hasFile ? 'post' : 'put';
    if (hasFile) (payload as FormData).append('_method', 'PUT');
    const response = await api[method]<ApiResponse<Sertifikasi>>(`/api/v1/admin/sertifikasi/${id}`, payload, {
      headers: hasFile ? { 'Content-Type': 'multipart/form-data' } : undefined
    });
    return response.data.data;
  },

  // Admin: Persist module ordering / updates
  async reorderModul(sertifikasiId: number, modul: { id?: number; judul: string; deskripsi: string; order: number }[]): Promise<any> {
    // Expect items with existing id; map order -> urutan
    const orders = modul
      .filter(m => m.id !== undefined)
      .map(m => ({ id: m.id as number, urutan: m.order }));
    const response = await api.post<ApiResponse<any>>(`/api/v1/admin/sertifikasi/${sertifikasiId}/modules/reorder`, { orders });
    return response.data;
  },

  // Admin: Delete sertifikasi
  async deleteSertifikasi(id: number): Promise<void> {
    await api.delete(`/api/v1/admin/sertifikasi/${id}`);
  },

  // Admin: Manage registrations
  async getRegistrations(sertifikasiId?: number): Promise<any[]> {
  if (!sertifikasiId) throw new Error('sertifikasiId required for registrations listing');
  const response = await api.get<ApiResponse<any>>(`/api/v1/admin/sertifikasi/${sertifikasiId}/registrations`);
  // backend returns paginator object; we surface whole for pagination handling
  return response.data.data;
  },

  // Admin: Update registration status
  async updateRegistrationStatus(registrationId: number, status: string, data?: any): Promise<any> {
    const response = await api.patch<ApiResponse<any>>(`/api/v1/admin/sertifikasi/registrations/${registrationId}/status`, {
      status,
      ...data
    });
    return response.data.data;
  }
  ,
  // Admin: Issue certificate for a registration
  async issueCertificate(registrationId: number): Promise<any> {
    const response = await api.post<ApiResponse<any>>(`/api/v1/admin/sertifikasi/registrations/${registrationId}/issue-certificate`);
    return response.data.data;
  },

  // Admin: Create batch for sertifikasi
  async createBatch(sertifikasiId: number, data: any): Promise<any> {
    const response = await api.post<ApiResponse<any>>(`/api/v1/admin/sertifikasi/${sertifikasiId}/batches`, data);
    return response.data.data;
  },
  // Admin: Update batch
  async updateBatch(sertifikasiId: number, batchId: number, data: any): Promise<any> {
    const response = await api.put<ApiResponse<any>>(`/api/v1/admin/sertifikasi/${sertifikasiId}/batches/${batchId}`, data);
    return response.data.data;
  },
  // Admin: Delete batch
  async deleteBatch(sertifikasiId: number, batchId: number): Promise<void> {
    await api.delete(`/api/v1/admin/sertifikasi/${sertifikasiId}/batches/${batchId}`);
  }
};
