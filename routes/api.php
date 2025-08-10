<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\SertifikasiController;
use App\Http\Controllers\Api\PKLController;
use App\Http\Controllers\Api\BlogController;
use App\Http\Controllers\Api\VideoController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Public API Routes
Route::prefix('v1')->group(function () {
    
    // Authentication Routes
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);

    // Public Content Routes
    Route::prefix('blog')->group(function () {
        Route::get('/', [BlogController::class, 'index']);
        Route::get('/featured', [BlogController::class, 'featured']);
        Route::get('/popular', [BlogController::class, 'popular']);
        Route::get('/{slug}', [BlogController::class, 'show']);
    });

    Route::prefix('video')->group(function () {
        Route::get('/', [VideoController::class, 'index']);
        Route::get('/featured', [VideoController::class, 'featured']);
        Route::get('/popular', [VideoController::class, 'popular']);
        Route::get('/{id}', [VideoController::class, 'show']);
    });

    // Public Sertifikasi Routes (for browsing)
    Route::prefix('sertifikasi')->group(function () {
        Route::get('/', [SertifikasiController::class, 'index']);
        Route::get('/{id}', [SertifikasiController::class, 'show']);
        Route::get('/{id}/batches', [SertifikasiController::class, 'getBatches']);
    });

    // Public PKL Routes (for browsing)
    Route::prefix('pkl')->group(function () {
        Route::get('/', [PKLController::class, 'index']);
        Route::get('/{id}', [PKLController::class, 'show']);
    });

});

// Protected API Routes
Route::prefix('v1')->middleware(['auth:sanctum'])->group(function () {
    
    // Authentication Routes
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);
    Route::put('/profile', [AuthController::class, 'updateProfile']);
    Route::put('/change-password', [AuthController::class, 'changePassword']);

    // User Sertifikasi Routes
    Route::prefix('sertifikasi')->group(function () {
        Route::post('/{id}/register', [SertifikasiController::class, 'register']);
        Route::get('/my-registrations', [SertifikasiController::class, 'myRegistrations']);
        Route::delete('/registrations/{id}/cancel', [SertifikasiController::class, 'cancelRegistration']);
    });

    // User PKL Routes
    Route::prefix('pkl')->group(function () {
        Route::post('/{id}/register', [PKLController::class, 'register']);
        Route::get('/my-registrations', [PKLController::class, 'myRegistrations']);
        Route::delete('/registrations/{id}/cancel', [PKLController::class, 'cancelRegistration']);
    });

    // Admin routes
    Route::middleware(['role:admin'])->prefix('admin')->group(function () {
        // Dashboard
        Route::get('/dashboard', [AdminController::class, 'dashboard']);
        Route::get('/users', [AdminController::class, 'users']);
        Route::get('/certifications', [AdminController::class, 'certifications']);
        Route::get('/content', [AdminController::class, 'content']);
        Route::get('/reports', [AdminController::class, 'reports']);
        
        // Sertifikasi management
        Route::apiResource('/sertifikasi', SertifikasiController::class)->except(['index', 'show']);
        Route::post('/sertifikasi/{id}/toggle-status', [SertifikasiController::class, 'toggleStatus']);
        // Extra sertifikasi endpoints
        Route::post('/sertifikasi/{sertifikasi}/modules/reorder', [\App\Http\Controllers\Api\AdminSertifikasiExtraController::class, 'reorderModules']);
        Route::get('/sertifikasi/{sertifikasi}/batches', [\App\Http\Controllers\Api\AdminSertifikasiExtraController::class, 'listBatches']);
        Route::post('/sertifikasi/{sertifikasi}/batches', [\App\Http\Controllers\Api\AdminSertifikasiExtraController::class, 'createBatch']);
        Route::put('/sertifikasi/{sertifikasi}/batches/{batch}', [\App\Http\Controllers\Api\AdminSertifikasiExtraController::class, 'updateBatch']);
        Route::delete('/sertifikasi/{sertifikasi}/batches/{batch}', [\App\Http\Controllers\Api\AdminSertifikasiExtraController::class, 'deleteBatch']);
        Route::get('/sertifikasi/{sertifikasi}/registrations', [\App\Http\Controllers\Api\AdminSertifikasiExtraController::class, 'listRegistrations']);
        Route::patch('/sertifikasi/registrations/{registration}/status', [\App\Http\Controllers\Api\AdminSertifikasiExtraController::class, 'updateRegistrationStatus']);
        Route::post('/sertifikasi/registrations/{registration}/issue-certificate', [\App\Http\Controllers\Api\AdminSertifikasiExtraController::class, 'issueCertificate']);
        
        // Blog management
        Route::apiResource('/blogs', BlogController::class)->except(['index', 'show']);
        Route::post('/blogs/{id}/toggle-featured', [BlogController::class, 'toggleFeatured']);
        
        // Video management
        Route::apiResource('/videos', VideoController::class)->except(['index', 'show']);
        Route::post('/videos/{id}/toggle-featured', [VideoController::class, 'toggleFeatured']);
        
        // PKL management
        Route::apiResource('/pkl', PKLController::class)->except(['index', 'show']);
        Route::get('/pkl/{posisi}/registrations', [\App\Http\Controllers\Api\AdminPKLExtraController::class, 'listRegistrations']);
        Route::patch('/pkl/registrations/{registration}/status', [\App\Http\Controllers\Api\AdminPKLExtraController::class, 'updateRegistrationStatus']);
        Route::post('/pkl/registrations/{registration}/issue-certificate', [\App\Http\Controllers\Api\AdminPKLExtraController::class, 'issueCertificate']);
    });
    
    // Asesor routes
    Route::middleware(['role:asesor'])->prefix('asesor')->group(function () {
        // Assessment related routes would go here
        // Route::get('/assessments', [AsesorController::class, 'assessments']);
        // Route::post('/assessments/{id}/grade', [AsesorController::class, 'grade']);
    });

});

// Default route for API user (legacy support)
Route::middleware(['auth:sanctum'])->get('/user', function (Request $request) {
    return $request->user();
});
