<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->string('customer_name')->nullable()->after('status');
            $table->string('customer_phone')->nullable()->after('customer_name');
            $table->string('customer_address')->nullable()->after('customer_phone');
        });

        Schema::table('bookings', function (Blueprint $table) {
            $table->string('customer_name')->nullable()->after('status');
            $table->string('customer_phone')->nullable()->after('customer_name');
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn(['customer_name', 'customer_phone', 'customer_address']);
        });

        Schema::table('bookings', function (Blueprint $table) {
            $table->dropColumn(['customer_name', 'customer_phone']);
        });
    }
};
