<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            if (!Schema::hasColumn('orders', 'driver_latitude')) {
                $table->decimal('driver_latitude', 10, 7)->nullable()->after('driver_id');
            }
            if (!Schema::hasColumn('orders', 'driver_longitude')) {
                $table->decimal('driver_longitude', 10, 7)->nullable()->after('driver_latitude');
            }
            if (!Schema::hasColumn('orders', 'last_location_update')) {
                $table->timestamp('last_location_update')->nullable()->after('driver_longitude');
            }
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            if (Schema::hasColumn('orders', 'last_location_update')) {
                $table->dropColumn('last_location_update');
            }
            if (Schema::hasColumn('orders', 'driver_longitude')) {
                $table->dropColumn('driver_longitude');
            }
            if (Schema::hasColumn('orders', 'driver_latitude')) {
                $table->dropColumn('driver_latitude');
            }
        });
    }
};

