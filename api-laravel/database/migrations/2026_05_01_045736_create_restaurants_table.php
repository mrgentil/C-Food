<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('restaurants', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('name');
            $table->string('image')->nullable();
            $table->string('logo')->nullable();
            $table->decimal('rating', 3, 1)->default(0);
            $table->integer('review_count')->default(0);
            $table->string('delivery_time')->default('30-40 min');
            $table->integer('delivery_fee')->default(0);
            $table->decimal('distance', 5, 1)->nullable();
            $table->integer('min_order')->default(0);
            $table->boolean('is_open')->default(true);
            $table->boolean('is_featured')->default(false);
            $table->boolean('is_new')->default(false);
            $table->boolean('is_promoted')->default(false);
            $table->string('discount')->nullable();
            $table->string('type')->default('restaurant'); // restaurant, grocery, alcohol, flowers, pharmacy, pet
            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('restaurants');
    }
};
