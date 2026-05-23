<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('promo_codes', function (Blueprint $table) {
            $table->uuid('restaurant_id')->nullable()->after('code');
            $table->index(['restaurant_id', 'code']);
        });
    }

    public function down(): void
    {
        Schema::table('promo_codes', function (Blueprint $table) {
            $table->dropIndex(['restaurant_id', 'code']);
            $table->dropColumn('restaurant_id');
        });
    }
};

