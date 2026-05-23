<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('restaurant_id');
            $table->foreign('restaurant_id')->references('id')->on('restaurants')->onDelete('cascade');
            $table->foreignId('driver_id')->nullable()->constrained('users')->onDelete('set null');
            $table->foreignId('address_id')->constrained('addresses')->onDelete('cascade');
            $table->integer('subtotal');
            $table->integer('delivery_fee');
            $table->integer('service_fee')->default(0);
            $table->integer('tax')->default(0);
            $table->integer('tip')->default(0);
            $table->integer('total');
            $table->string('status')->default('pending'); // pending, preparing, picked_up, delivering, delivered, cancelled
            $table->string('payment_method')->default('cash');
            $table->string('transaction_id')->nullable();
            $table->string('promo_code')->nullable();
            $table->text('delivery_instructions')->nullable();
            $table->boolean('is_group_order')->default(false);
            $table->timestamp('scheduled_for')->nullable();
            $table->timestamp('estimated_delivery')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
