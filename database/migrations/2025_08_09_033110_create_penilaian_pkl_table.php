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
        Schema::create('penilaian_pkl', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('pendaftaran_pkl_id');
            $table->unsignedBigInteger('penilai_id'); // supervisor/mentor
            $table->decimal('nilai_kedisiplinan', 5, 2)->nullable();
            $table->decimal('nilai_kerjasama', 5, 2)->nullable();
            $table->decimal('nilai_inisiatif', 5, 2)->nullable();
            $table->decimal('nilai_komunikasi', 5, 2)->nullable();
            $table->decimal('nilai_teknis', 5, 2)->nullable();
            $table->decimal('nilai_akhir', 5, 2)->nullable();
            $table->enum('status', ['Belum Dinilai', 'Lulus', 'Tidak Lulus'])->default('Belum Dinilai');
            $table->text('catatan_penilai')->nullable();
            $table->date('tanggal_penilaian')->nullable();
            $table->timestamps();

            $table->foreign('pendaftaran_pkl_id')->references('id')->on('pendaftaran_pkl')->onDelete('cascade');
            $table->foreign('penilai_id')->references('id')->on('users')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('penilaian_pkl');
    }
};
