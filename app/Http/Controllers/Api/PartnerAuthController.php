<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Partner;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class PartnerAuthController extends Controller
{
    /**
     * Register a new partner.
     * Partners must choose an access_code (4-8 chars) at registration.
     * This acts as a secondary password for dashboard access.
     */
    public function register(Request $request)
    {
        $request->validate([
            'name'        => 'required|string|max:255',
            'email'       => 'required|string|email|max:255|unique:partners|unique:users',
            'password'    => 'required|string|min:8|confirmed',
            'access_code' => 'required|string|min:4|max:8',
            'type'        => 'required|in:mark,terrain_manager',
        ]);

        $partner = Partner::create([
            'name'        => $request->name,
            'email'       => $request->email,
            'password'    => Hash::make($request->password),
            'access_code' => Hash::make($request->access_code),
            'type'        => $request->type,
        ]);

        $token = $partner->createToken('partner-token')->plainTextToken;

        return response()->json([
            'partner' => $partner,
            'token'   => $token,
        ], 201);
    }

    /**
     * Login — requires email, password AND access_code.
     */
    public function login(Request $request)
    {
        $request->validate([
            'email'       => 'required|email',
            'password'    => 'required',
            'access_code' => 'required|string',
        ]);

        $partner = Partner::where('email', $request->email)->first();

        // Check both password AND access_code
        if (
            ! $partner ||
            ! Hash::check($request->password, $partner->password) ||
            ! Hash::check($request->access_code, $partner->access_code)
        ) {
            throw ValidationException::withMessages([
                'email' => ['Identifiants ou code d\'accès incorrects.'],
            ]);
        }

        $token = $partner->createToken('partner-token')->plainTextToken;

        return response()->json([
            'partner' => $partner,
            'token'   => $token,
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Déconnecté avec succès.']);
    }
}
