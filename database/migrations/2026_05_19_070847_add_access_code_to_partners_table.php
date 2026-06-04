<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Add a secondary access_code column to partners.
     * This is a 4-digit PIN or short code that partners set at registration
     * and must supply when logging in to the partner dashboard.
     */
    public function up(): void
    {
        Schema::table('partners', function (Blueprint $table) {
            // Store the code hashed, nullable so existing rows don't break
            $table->string('access_code')->nullable()->after('password');
        });
    }

    public function down(): void
    {
        Schema::table('partners', function (Blueprint $table) {
            $table->dropColumn('access_code');
        });
    }
};
