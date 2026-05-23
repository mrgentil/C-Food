<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'city')) {
                $table->string('city', 80)->nullable()->after('phone');
            }
            if (!Schema::hasColumn('users', 'vehicle_type')) {
                $table->string('vehicle_type', 20)->nullable()->after('city'); // moto|car|bike
            }
            if (!Schema::hasColumn('users', 'plate_number')) {
                $table->string('plate_number', 40)->nullable()->after('vehicle_type');
            }
            if (!Schema::hasColumn('users', 'is_online')) {
                $table->boolean('is_online')->default(false)->after('is_driver');
            }
            if (!Schema::hasColumn('users', 'driver_rating')) {
                $table->decimal('driver_rating', 3, 2)->default(5.00)->after('is_online');
            }
            if (!Schema::hasColumn('users', 'total_deliveries')) {
                $table->unsignedInteger('total_deliveries')->default(0)->after('driver_rating');
            }
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            foreach (['total_deliveries', 'driver_rating', 'is_online', 'plate_number', 'vehicle_type', 'city'] as $col) {
                if (Schema::hasColumn('users', $col)) {
                    $table->dropColumn($col);
                }
            }
        });
    }
};

