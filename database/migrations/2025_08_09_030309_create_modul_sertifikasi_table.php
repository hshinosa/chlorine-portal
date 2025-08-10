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
        Schema::create('modul_sertifikasi', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('sertifikasi_id');
            $table->string('judul');
            $table->text('deskripsi');
            $table->json('poin_pembelajaran'); // Array of learning points
            $table->integer('urutan'); // Order/sequence
            $table->timestamps();

            $table->foreign('sertifikasi_id')->references('id')->on('sertifikasi')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('modul_sertifikasi');
    }
};
