<?php

use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\SertifikasiController;
use App\Http\Controllers\Admin\BlogController;
use App\Http\Controllers\Admin\VideoController;
use App\Http\Controllers\Admin\PKLController;
use App\Http\Controllers\Admin\PenilaianSertifikasiController;
use Illuminate\Support\Facades\Route;

// Admin Routes (Web)
Route::middleware(['auth', 'verified'])->prefix('admin')->name('admin.')->group(function () {
    
    // Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::get('/pendaftaran/{type}/{id}', [DashboardController::class, 'pendaftaranDetail'])->name('pendaftaran.detail');
    Route::patch('/pendaftaran/{type}/{id}/approve', [DashboardController::class, 'approvePendaftaran'])->name('pendaftaran.approve');

    // Sertifikasi Management
    Route::get('/sertifikasi-kompetensi', [SertifikasiController::class, 'index'])->name('sertifikasi-kompetensi');
    Route::get('/sertifikasi/create', [SertifikasiController::class, 'create'])->name('sertifikasi.create');
    Route::post('/sertifikasi', [SertifikasiController::class, 'store'])->name('sertifikasi.store');
    Route::get('/sertifikasi/{id}', [SertifikasiController::class, 'show'])->name('sertifikasi.show');
    Route::get('/sertifikasi/{id}/edit', [SertifikasiController::class, 'edit'])->name('sertifikasi.edit');
    Route::put('/sertifikasi/{id}', [SertifikasiController::class, 'update'])->name('sertifikasi.update');
    Route::delete('/sertifikasi/{id}', [SertifikasiController::class, 'destroy'])->name('sertifikasi.destroy');

    // Form Sertifikasi
    Route::get('/form-sertifikasi', [SertifikasiController::class, 'create'])->name('form-sertifikasi');
    Route::get('/form-sertifikasi/{id}', [SertifikasiController::class, 'edit'])->name('form-sertifikasi.edit');
    Route::get('/detail-sertifikasi/{id}', [SertifikasiController::class, 'show'])->name('detail-sertifikasi');

    // Blog Management
    Route::get('/manajemen-blog', [BlogController::class, 'index'])->name('manajemen-blog');
    Route::get('/blog/create', [BlogController::class, 'create'])->name('blog.create');
    Route::post('/blog', [BlogController::class, 'store'])->name('blog.store');
    Route::get('/blog/{id}', [BlogController::class, 'show'])->name('blog.show');
    Route::get('/blog/{id}/edit', [BlogController::class, 'edit'])->name('blog.edit');
    Route::put('/blog/{id}', [BlogController::class, 'update'])->name('blog.update');
    Route::delete('/blog/{id}', [BlogController::class, 'destroy'])->name('blog.destroy');

    // Video Management
    Route::get('/manajemen-video', [VideoController::class, 'index'])->name('manajemen-video');
    Route::get('/video/create', [VideoController::class, 'create'])->name('video.create');
    Route::post('/video', [VideoController::class, 'store'])->name('video.store');
    Route::get('/video/{id}', [VideoController::class, 'show'])->name('video.show');
    Route::get('/video/{id}/edit', [VideoController::class, 'edit'])->name('video.edit');
    Route::put('/video/{id}', [VideoController::class, 'update'])->name('video.update');
    Route::delete('/video/{id}', [VideoController::class, 'destroy'])->name('video.destroy');

    // PKL Management
    Route::get('/praktik-kerja-lapangan', [PKLController::class, 'index'])->name('praktik-kerja-lapangan');
    Route::get('/pkl/create', [PKLController::class, 'create'])->name('pkl.create');
    Route::post('/pkl', [PKLController::class, 'store'])->name('pkl.store');
    Route::get('/pkl/{id}', [PKLController::class, 'show'])->name('pkl.show');
    Route::get('/pkl/{id}/edit', [PKLController::class, 'edit'])->name('pkl.edit');
    Route::put('/pkl/{id}', [PKLController::class, 'update'])->name('pkl.update');
    Route::delete('/pkl/{id}', [PKLController::class, 'destroy'])->name('pkl.destroy');

    // Penilaian PKL
    Route::get('/penilaian-pkl', [PKLController::class, 'penilaianIndex'])->name('penilaian-pkl');
    Route::get('/penilaian-pkl/{id}', [PKLController::class, 'penilaianShow'])->name('detail-penilaian-pkl');
    Route::post('/penilaian-pkl/{pendaftaranId}', [PKLController::class, 'penilaianStore'])->name('penilaian-pkl.store');

    // Penilaian Sertifikasi
    Route::get('/penilaian-sertifikasi', [PenilaianSertifikasiController::class, 'index'])->name('penilaian-sertifikasi');
    Route::get('/penilaian-sertifikasi/{id}', [PenilaianSertifikasiController::class, 'show'])->name('detail-penilaian-sertifikasi');
    Route::post('/penilaian-sertifikasi/{pendaftaranId}', [PenilaianSertifikasiController::class, 'store'])->name('penilaian-sertifikasi.store');
    
    // Batch Penilaian Sertifikasi
    Route::get('/penilaian-sertifikasi/{sertifikasiId}/batch/{batchId}', [PenilaianSertifikasiController::class, 'batchPenilaian'])->name('batch-penilaian-sertifikasi');
    Route::post('/penilaian-sertifikasi/{sertifikasiId}/batch/{batchId}', [PenilaianSertifikasiController::class, 'batchStore'])->name('batch-penilaian-sertifikasi.store');

});

// API Routes
Route::prefix('api/admin')->middleware(['auth:sanctum'])->name('api.admin.')->group(function () {
    
    // Dashboard API
    Route::get('/stats', [DashboardController::class, 'apiStats'])->name('stats');
    Route::get('/chart-data', [DashboardController::class, 'apiChartData'])->name('chart-data');

    // Sertifikasi API
    Route::get('/sertifikasi', [SertifikasiController::class, 'apiIndex'])->name('sertifikasi.index');
    Route::post('/sertifikasi', [SertifikasiController::class, 'store'])->name('sertifikasi.store');
    Route::get('/sertifikasi/{id}', [SertifikasiController::class, 'apiShow'])->name('sertifikasi.show');
    Route::put('/sertifikasi/{id}', [SertifikasiController::class, 'update'])->name('sertifikasi.update');
    Route::delete('/sertifikasi/{id}', [SertifikasiController::class, 'destroy'])->name('sertifikasi.destroy');

    // Blog API
    Route::get('/blog', [BlogController::class, 'apiIndex'])->name('blog.index');
    Route::post('/blog', [BlogController::class, 'apiStore'])->name('blog.store');
    Route::get('/blog/{id}', [BlogController::class, 'show'])->name('blog.show');
    Route::put('/blog/{id}', [BlogController::class, 'apiUpdate'])->name('blog.update');
    Route::delete('/blog/{id}', [BlogController::class, 'apiDestroy'])->name('blog.destroy');

    // Video API
    Route::get('/video', [VideoController::class, 'apiIndex'])->name('video.index');
    Route::post('/video', [VideoController::class, 'apiStore'])->name('video.store');
    Route::get('/video/{id}', [VideoController::class, 'show'])->name('video.show');
    Route::put('/video/{id}', [VideoController::class, 'apiUpdate'])->name('video.update');
    Route::delete('/video/{id}', [VideoController::class, 'apiDestroy'])->name('video.destroy');

    // PKL API
    Route::get('/pkl', [PKLController::class, 'apiIndex'])->name('pkl.index');
    Route::post('/pkl', [PKLController::class, 'apiStore'])->name('pkl.store');
    Route::get('/pkl/{id}', [PKLController::class, 'show'])->name('pkl.show');
    Route::put('/pkl/{id}', [PKLController::class, 'apiUpdate'])->name('pkl.update');
    Route::delete('/pkl/{id}', [PKLController::class, 'destroy'])->name('pkl.destroy');

    // Penilaian Sertifikasi API
    Route::get('/penilaian-sertifikasi', [PenilaianSertifikasiController::class, 'apiIndex'])->name('penilaian-sertifikasi.index');
    Route::post('/penilaian-sertifikasi', [PenilaianSertifikasiController::class, 'apiStore'])->name('penilaian-sertifikasi.store');
    Route::put('/penilaian-sertifikasi/{id}', [PenilaianSertifikasiController::class, 'apiUpdate'])->name('penilaian-sertifikasi.update');

});
