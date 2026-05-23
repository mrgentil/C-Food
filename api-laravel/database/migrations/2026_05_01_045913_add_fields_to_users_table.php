<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('phone')->nullable()->after('email');
            $table->string('photo')->nullable()->after('phone');
            $table->boolean('dash_pass')->default(false)->after('photo');
            $table->string('dash_pass_expires_at')->nullable()->after('dash_pass');
            $table->boolean('is_admin')->default(false)->after('dash_pass_expires_at');
            $table->boolean('is_restaurant')->default(false)->after('is_admin');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['phone', 'photo', 'dash_pass', 'dash_pass_expires_at', 'is_admin', 'is_restaurant']);
        });
    }
};
