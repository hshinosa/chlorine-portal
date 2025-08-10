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
        Schema::create('video', function (Blueprint $table) {
            $table->id();
            $table->string('nama_video');
            $table->text('deskripsi');
            $table->string('video_url');
            $table->integer('durasi'); // in seconds
            $table->integer('views')->default(0);
            $table->boolean('featured')->default(false);
            $table->enum('status', ['Draft', 'Publish', 'Archived'])->default('Draft');
            $table->string('uploader');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('video');
    }
};
