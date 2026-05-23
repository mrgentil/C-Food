<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('shop_types', function (Blueprint $table) {
            $table->string('category')->default('shop_type')->after('name');
        });

        Schema::table('brands', function (Blueprint $table) {
            $table->string('type')->default('restaurant')->after('name');
        });
    }

    public function down(): void
    {
        Schema::table('shop_types', function (Blueprint $table) {
            $table->dropColumn('category');
        });

        Schema::table('brands', function (Blueprint $table) {
            $table->dropColumn('type');
        });
    }
};
