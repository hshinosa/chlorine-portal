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
        Schema::create('blog', function (Blueprint $table) {
            $table->id();
            $table->string('nama_artikel');
            $table->enum('jenis_konten', ['Blog', 'Tutorial', 'News']);
            $table->text('deskripsi');
            $table->longText('konten');
            $table->enum('status', ['Draft', 'Publish', 'Archived'])->default('Draft');
            $table->string('penulis');
            $table->integer('views')->default(0);
            $table->boolean('featured')->default(false);
            $table->string('meta_title')->nullable();
            $table->text('meta_description')->nullable();
            $table->string('slug')->unique();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('blog');
    }
};
