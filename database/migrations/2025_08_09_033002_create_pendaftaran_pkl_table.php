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
        Schema::create('pendaftaran_pkl', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id');
            $table->unsignedBigInteger('posisi_pkl_id');
            $table->enum('status', ['Pending', 'Disetujui', 'Ditolak', 'Dibatalkan'])->default('Pending');
            $table->date('tanggal_pendaftaran');
            $table->text('motivasi')->nullable();
            $table->json('berkas_persyaratan')->nullable();
            $table->text('catatan_admin')->nullable();
            $table->timestamp('tanggal_diproses')->nullable();
            $table->timestamps();

            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('posisi_pkl_id')->references('id')->on('posisi_pkl')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pendaftaran_pkl');
    }
};
