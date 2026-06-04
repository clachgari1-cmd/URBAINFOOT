<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class ProductController extends Controller
{
    /**
     * Display a listing of all products (for clients).
     */
    public function index()
    {
        return response()->json(Product::with('partner')->get());
    }

    /**
     * Display the specified product (for clients).
     */
    public function show(Product $product)
    {
        return response()->json($product->load('partner'));
    }

    /**
     * Display a listing of products owned by the partner.
     */
    public function partnerProducts(Request $request)
    {
        $partner = $request->user();

        if ($partner->type !== 'mark') {
            return response()->json(['message' => 'Accès refusé. Réservé aux administrateurs de marque.'], 403);
        }

        return response()->json($partner->products);
    }

    /**
     * Store a newly created product in storage.
     */
    public function store(Request $request)
    {
        $partner = $request->user();

        if ($partner->type !== 'mark') {
            return response()->json(['message' => 'Accès refusé. Réservé aux administrateurs de marque.'], 403);
        }

        $validated = $request->validate([
            'name'        => 'required|string|max:255',
            'category'    => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'price'       => 'required|numeric|min:0',
            'stock'       => 'required|integer|min:0',
            'image'       => 'required|image|mimes:jpeg,png,jpg,gif,svg,webp|max:4096',
        ]);

        if ($request->hasFile('image')) {
            $file = $request->file('image');
            $filename = time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
            $file->move(public_path('uploads/products'), $filename);
            $validated['image_path'] = '/uploads/products/' . $filename;
        }

        unset($validated['image']); // Remove file key; only image_path goes to DB

        $product = $partner->products()->create($validated);

        return response()->json($product, 201);
    }

    /**
     * Update the specified product in storage.
     */
    public function update(Request $request, Product $product)
    {
        $partner = $request->user();

        if ($partner->type !== 'mark' || $product->partner_id !== $partner->id) {
            return response()->json(['message' => 'Accès interdit ou produit non trouvé.'], 403);
        }

        $validated = $request->validate([
            'name'        => 'sometimes|required|string|max:255',
            'category'    => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'price'       => 'sometimes|required|numeric|min:0',
            'stock'       => 'sometimes|required|integer|min:0',
            'image_path'  => 'nullable|string',
        ]);

        $product->update($validated);

        return response()->json($product);
    }

    /**
     * Remove the specified product from storage.
     */
    public function destroy(Request $request, Product $product)
    {
        $partner = $request->user();

        if ($partner->type !== 'mark' || $product->partner_id !== $partner->id) {
            return response()->json(['message' => 'Accès interdit ou produit non trouvé.'], 403);
        }

        $product->delete();

        return response()->json(['message' => 'Produit supprimé avec succès.']);
    }
}
