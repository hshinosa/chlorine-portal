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
        Schema::create('pendaftaran_sertifikasi', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id');
            $table->unsignedBigInteger('sertifikasi_id');
            $table->unsignedBigInteger('batch_sertifikasi_id');
            $table->enum('status', ['Pending', 'Disetujui', 'Ditolak', 'Dibatalkan'])->default('Pending');
            $table->date('tanggal_pendaftaran');
            $table->text('motivasi')->nullable();
            $table->json('berkas_persyaratan')->nullable();
            $table->text('catatan_admin')->nullable();
            $table->timestamp('tanggal_diproses')->nullable();
            $table->timestamps();

            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('sertifikasi_id')->references('id')->on('sertifikasi')->onDelete('cascade');
            $table->foreign('batch_sertifikasi_id')->references('id')->on('batch_sertifikasi')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pendaftaran_sertifikasi');
    }
};
