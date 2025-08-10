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
        Schema::create('posisi_pkl', function (Blueprint $table) {
            $table->id();
            $table->string('nama_posisi');
            $table->string('perusahaan');
            $table->text('deskripsi');
            $table->text('persyaratan');
            $table->string('lokasi');
            $table->enum('tipe', ['Full-time', 'Part-time', 'Remote', 'Hybrid']);
            $table->integer('durasi_bulan');
            $table->decimal('gaji', 10, 2)->nullable();
            $table->integer('kuota');
            $table->integer('jumlah_pendaftar')->default(0);
            $table->enum('status', ['Aktif', 'Non-Aktif', 'Penuh'])->default('Aktif');
            $table->date('tanggal_mulai');
            $table->date('tanggal_selesai');
            $table->string('contact_person');
            $table->string('contact_email');
            $table->string('contact_phone')->nullable();
            $table->unsignedBigInteger('created_by');
            $table->timestamps();

            $table->foreign('created_by')->references('id')->on('users')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('posisi_pkl');
    }
};
