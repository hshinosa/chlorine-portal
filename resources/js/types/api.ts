// Base types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  total: number;
  per_page: number;
  last_page: number;
  from: number;
  to: number;
}

// User types
export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'asesor' | 'user';
  email_verified_at?: string;
  created_at: string;
  updated_at: string;
}

// Blog types
export interface Blog {
  id: number;
  nama_artikel: string;
  jenis_konten: string;
  deskripsi: string;
  konten: string;
  thumbnail?: string;
  slug: string;
  status: string;
  penulis: string;
  featured: boolean;
  views: number;
  meta_title?: string;
  meta_description?: string;
  excerpt: string;
  created_at: string;
  updated_at: string;
}

// Video types
export interface Video {
  id: number;
  nama_video: string;
  deskripsi: string;
  thumbnail?: string;
  video_url: string;
  durasi: number;
  views: number;
  featured: boolean;
  status: string;
  uploader: string;
  created_at: string;
  updated_at: string;
}

// Sertifikasi types
export interface Sertifikasi {
  id: number;
  nama_sertifikasi: string;
  jenis_sertifikasi: string;
  deskripsi: string;
  thumbnail?: string;
  nama_asesor: string;
  jabatan_asesor: string;
  instansi_asesor: string;
  pengalaman_asesor: string;
  foto_asesor?: string;
  tipe_sertifikat: string;
  kapasitas_peserta: number;
  status: string;
  created_at: string;
  updated_at: string;
}

// Shared nested data for Sertifikasi
export interface ModulSertifikasiItem {
  id?: number;
  judul: string;
  deskripsi: string;
  order: number;
  poin_pembelajaran?: string[];
}

export interface BatchSertifikasiItem {
  id?: number;
  nama: string;
  tanggal_mulai: string; // ISO date
  tanggal_selesai: string; // ISO date
  status: string; // Draft | Aktif | Selesai (lowercase upstream?)
  peserta_terdaftar?: number;
}

// PKL types
export interface PosisiPKL {
  id: number;
  nama_posisi: string;
  perusahaan: string;
  deskripsi: string;
  persyaratan: string;
  lokasi: string;
  tipe: 'Full-time' | 'Part-time' | 'Remote' | 'Hybrid';
  durasi_bulan: number;
  gaji?: number;
  kuota: number;
  jumlah_pendaftar: number;
  status: 'Aktif' | 'Non-Aktif' | 'Penuh';
  tanggal_mulai: string;
  tanggal_selesai: string;
  contact_person: string;
  contact_email: string;
  contact_phone?: string;
  created_at: string;
  updated_at: string;
}

// Authentication types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

// Filter types
export interface BlogFilters {
  status?: string;
  jenis_konten?: string;
  search?: string;
  featured?: boolean;
}

export interface VideoFilters {
  status?: string;
  search?: string;
  featured?: boolean;
}

export interface SertifikasiFilters {
  status?: string;
  jenis_sertifikasi?: string;
  search?: string;
}

export interface PKLFilters {
  status?: string;
  tipe?: string;
  perusahaan?: string;
  lokasi?: string;
  search?: string;
}
