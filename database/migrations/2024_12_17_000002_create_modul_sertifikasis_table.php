<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('modul_sertifikasis', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sertifikasi_id')->constrained('sertifikasis')->onDelete('cascade');
            $table->string('judul');
            $table->text('deskripsi');
            $table->json('poin_pembelajaran')->nullable();
            $table->integer('urutan')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('modul_sertifikasis');
    }
};
