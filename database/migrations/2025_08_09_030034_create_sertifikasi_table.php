<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('sertifikasi', function (Blueprint $table) {
            $table->id();
            $table->string('nama_sertifikasi');
            $table->enum('jenis_sertifikasi', ['LSP', 'Industri', 'Internal']);
            $table->text('deskripsi');
            $table->string('thumbnail')->nullable();
            $table->string('nama_asesor');
            $table->string('jabatan_asesor');
            $table->string('instansi_asesor');
            $table->text('pengalaman_asesor')->nullable();
            $table->string('foto_asesor')->nullable();
            $table->enum('tipe_sertifikat', ['Sertifikat Kompetensi', 'Sertifikat Keahlian', 'Sertifikat Profesi']);
            $table->integer('kapasitas_peserta')->default(0);
            $table->enum('status', ['Aktif', 'Tidak Aktif', 'Draf'])->default('Draf');
            $table->foreignId('created_by')->nullable()->constrained('users')->onDelete('set null');
            $table->foreignId('updated_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sertifikasi');
    }
};
