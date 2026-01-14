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
        Schema::create('attendances', function (Blueprint $table) {
            $table->id();
            $table->string('first_name')->nullable(); // Made nullable, use driver relationship
            $table->string('last_name')->nullable(); // Made nullable
            $table->foreignId('driver_id')->nullable()->constrained()->onDelete('set null');
            $table->string('matricule')->index();
            $table->enum('type', ['arrival', 'departure']);
            $table->decimal('latitude', 10, 8)->nullable();
            $table->decimal('longitude', 11, 8)->nullable();
            $table->text('signature_data')->nullable(); // Store dataURL or signature status
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('attendances');
    }
};
