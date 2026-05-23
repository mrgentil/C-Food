<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->boolean('is_merchant')->default(false)->after('is_restaurant');
        });

        // Backfill from legacy flag.
        try {
            DB::statement('UPDATE users SET is_merchant = is_restaurant WHERE is_merchant = 0');
        } catch (\Throwable $e) {
            // ignore
        }
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('is_merchant');
        });
    }
};

