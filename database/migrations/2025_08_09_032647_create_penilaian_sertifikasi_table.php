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
        Schema::create('penilaian_sertifikasi', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('pendaftaran_sertifikasi_id');
            $table->unsignedBigInteger('asesor_id');
            $table->decimal('nilai_teori', 5, 2)->nullable();
            $table->decimal('nilai_praktek', 5, 2)->nullable();
            $table->decimal('nilai_akhir', 5, 2)->nullable();
            $table->enum('status', ['Belum Dinilai', 'Lulus', 'Tidak Lulus'])->default('Belum Dinilai');
            $table->text('catatan_asesor')->nullable();
            $table->date('tanggal_penilaian')->nullable();
            $table->timestamps();

            $table->foreign('pendaftaran_sertifikasi_id')->references('id')->on('pendaftaran_sertifikasi')->onDelete('cascade');
            $table->foreign('asesor_id')->references('id')->on('users')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('penilaian_sertifikasi');
    }
};
