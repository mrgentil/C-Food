<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('restaurants', function (Blueprint $table) {
            $table->foreignId('owner_user_id')
                ->nullable()
                ->after('user_id')
                ->constrained('users')
                ->nullOnDelete();
        });

        // Backfill from legacy column when present.
        try {
            DB::statement('UPDATE restaurants SET owner_user_id = user_id WHERE owner_user_id IS NULL AND user_id IS NOT NULL');
        } catch (\Throwable $e) {
            // ignore: different drivers or missing column in edge cases
        }
    }

    public function down(): void
    {
        Schema::table('restaurants', function (Blueprint $table) {
            $table->dropConstrainedForeignId('owner_user_id');
        });
    }
};

