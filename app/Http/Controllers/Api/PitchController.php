<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Pitch;
use Illuminate\Http\Request;

class PitchController extends Controller
{
    /**
     * Display a listing of all pitches (for clients).
     */
    public function index()
    {
        return response()->json(Pitch::with('partner')->get());
    }

    /**
     * Display the specified pitch (for clients).
     */
    public function show(Pitch $pitch)
    {
        return response()->json($pitch->load('partner'));
    }

    /**
     * Display a listing of pitches owned by the partner.
     */
    public function partnerPitches(Request $request)
    {
        $partner = $request->user();

        if ($partner->type !== 'terrain_manager') {
            return response()->json(['message' => 'Accès refusé. Réservé aux gérants de terrain.'], 403);
        }

        return response()->json($partner->pitches);
    }

    /**
     * Store a newly created pitch in storage.
     */
    public function store(Request $request)
    {
        $partner = $request->user();

        if ($partner->type !== 'terrain_manager') {
            return response()->json(['message' => 'Accès refusé. Réservé aux gérants de terrain.'], 403);
        }

        $validated = $request->validate([
            'name'           => 'required|string|max:255',
            'type'           => 'required|in:5,7,9,11',
            'price_per_hour' => 'required|numeric|min:0',
            'city'           => 'nullable|string|max:255',
            'features'       => 'nullable|array',
            'description'    => 'nullable|string',
            'image'          => 'required|image|mimes:jpeg,png,jpg,gif,svg,webp|max:4096',
        ]);

        if ($request->hasFile('image')) {
            $file = $request->file('image');
            $filename = time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
            $file->move(public_path('uploads/pitches'), $filename);
            $validated['image_path'] = '/uploads/pitches/' . $filename;
        }

        unset($validated['image']); // Remove file key; only image_path goes to DB

        $pitch = $partner->pitches()->create($validated);

        return response()->json($pitch, 201);
    }

    /**
     * Update the specified pitch in storage.
     */
    public function update(Request $request, Pitch $pitch)
    {
        $partner = $request->user();

        if ($partner->type !== 'terrain_manager' || $pitch->partner_id !== $partner->id) {
            return response()->json(['message' => 'Accès interdit ou terrain non trouvé.'], 403);
        }

        $validated = $request->validate([
            'name'           => 'sometimes|required|string|max:255',
            'type'           => 'sometimes|required|in:5,7,9,11',
            'price_per_hour' => 'sometimes|required|numeric|min:0',
            'city'           => 'nullable|string|max:255',
            'features'       => 'nullable|array',
            'description'    => 'nullable|string',
            'image_path'     => 'nullable|string',
        ]);

        $pitch->update($validated);

        return response()->json($pitch);
    }

    /**
     * Remove the specified pitch from storage.
     */
    public function destroy(Request $request, Pitch $pitch)
    {
        $partner = $request->user();

        if ($partner->type !== 'terrain_manager' || $pitch->partner_id !== $partner->id) {
            return response()->json(['message' => 'Accès interdit ou terrain non trouvé.'], 403);
        }

        $pitch->delete();

        return response()->json(['message' => 'Terrain supprimé avec succès.']);
    }
}
