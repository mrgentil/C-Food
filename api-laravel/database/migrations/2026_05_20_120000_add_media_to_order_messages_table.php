<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('order_messages', function (Blueprint $table) {
            $table->string('type', 20)->default('text')->after('sender_role');
            $table->string('media_url', 2048)->nullable()->after('message');
            $table->json('media_meta')->nullable()->after('media_url');
        });

        Schema::table('order_messages', function (Blueprint $table) {
            $table->text('message')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('order_messages', function (Blueprint $table) {
            $table->dropColumn(['type', 'media_url', 'media_meta']);
        });
    }
};
