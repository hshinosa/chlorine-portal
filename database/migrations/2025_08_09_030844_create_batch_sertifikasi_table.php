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
        Schema::create('batch_sertifikasi', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sertifikasi_id')->constrained('sertifikasi')->onDelete('cascade');
            $table->string('nama_batch');
            $table->date('tanggal_mulai');
            $table->date('tanggal_selesai');
            $table->time('jam_mulai')->nullable();
            $table->time('jam_selesai')->nullable();
            $table->string('tempat')->nullable();
            $table->integer('kuota');
            $table->integer('jumlah_pendaftar')->default(0);
            $table->enum('status', ['Draf', 'Aktif', 'Selesai', 'Ditutup'])->default('Draf');
            $table->string('instruktur')->nullable();
            $table->text('catatan')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('batch_sertifikasi');
    }
};
