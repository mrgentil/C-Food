<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->timestamp('cash_collected_at')->nullable()->after('paid_at');
        });

        // Commandes cash déjà livrées : considérer l'encaissement confirmé à la livraison
        DB::table('orders')
            ->where('payment_method', 'cash')
            ->where('status', 'delivered')
            ->whereNull('cash_collected_at')
            ->update([
                'cash_collected_at' => DB::raw('COALESCE(delivered_at, paid_at, updated_at, created_at)'),
            ]);
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn('cash_collected_at');
        });
    }
};
