<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (! Schema::hasColumn('users', 'driver_verification_status')) {
                $table->string('driver_verification_status', 20)
                    ->default('pending')
                    ->after('is_driver');
            }
            if (! Schema::hasColumn('users', 'driver_license_url')) {
                $table->string('driver_license_url', 500)->nullable()->after('driver_verification_status');
            }
            if (! Schema::hasColumn('users', 'driver_insurance_url')) {
                $table->string('driver_insurance_url', 500)->nullable()->after('driver_license_url');
            }
            if (! Schema::hasColumn('users', 'driver_id_url')) {
                $table->string('driver_id_url', 500)->nullable()->after('driver_insurance_url');
            }
            if (! Schema::hasColumn('users', 'driver_verification_note')) {
                $table->text('driver_verification_note')->nullable()->after('driver_id_url');
            }
            if (! Schema::hasColumn('users', 'driver_verified_at')) {
                $table->timestamp('driver_verified_at')->nullable()->after('driver_verification_note');
            }
            if (! Schema::hasColumn('users', 'driver_verified_by')) {
                $table->unsignedBigInteger('driver_verified_by')->nullable()->after('driver_verified_at');
            }
        });

        // Livreurs déjà en service : approuvés pour ne pas bloquer l'existant
        if (Schema::hasColumn('users', 'driver_verification_status')) {
            DB::table('users')
                ->where('is_driver', true)
                ->update([
                    'driver_verification_status' => 'approved',
                    'driver_verified_at' => now(),
                ]);
        }
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            foreach ([
                'driver_verified_by',
                'driver_verified_at',
                'driver_verification_note',
                'driver_id_url',
                'driver_insurance_url',
                'driver_license_url',
                'driver_verification_status',
            ] as $col) {
                if (Schema::hasColumn('users', $col)) {
                    $table->dropColumn($col);
                }
            }
        });
    }
};
