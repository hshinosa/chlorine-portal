<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sertifikasis', function (Blueprint $table) {
            $table->id();
            $table->string('nama');
            $table->enum('jenis', ['LSP', 'Industri', 'Internal']);
            $table->text('deskripsi');
            $table->string('thumbnail')->nullable();
            $table->string('nama_asesor');
            $table->string('jabatan_asesor');
            $table->string('instansi_asesor');
            $table->string('pengalaman_asesor')->nullable();
            $table->enum('tipe_sertifikat', ['Sertifikat Kompetensi', 'Sertifikat Keahlian', 'Sertifikat Profesi']);
            $table->integer('kapasitas')->default(0);
            $table->enum('status', ['Aktif', 'Tidak Aktif', 'Draf'])->default('Draf');
            $table->timestamps();
            $table->softDeletes();
            
            $table->foreignId('created_by')->nullable()->constrained('users')->onDelete('set null');
            $table->foreignId('updated_by')->nullable()->constrained('users')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sertifikasis');
    }
};
