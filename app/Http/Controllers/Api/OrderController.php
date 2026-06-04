<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Partner;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class OrderController extends Controller
{
    /**
     * Display a listing of client's own orders (for clients).
     */
    public function index(Request $request)
    {
        $orders = $request->user()->orders()->with('items.product', 'partner')->latest()->get();
        return response()->json($orders);
    }

    /**
     * Display client's specific order (for clients).
     */
    public function show(Request $request, $id)
    {
        $order = $request->user()->orders()->with('items.product', 'partner')->findOrFail($id);
        return response()->json($order);
    }

    /**
     * Place a new order (for clients).
     */
    public function store(Request $request)
    {
        $request->validate([
            'partner_id'       => 'required|exists:partners,id',
            'items'            => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity'   => 'required|integer|min:1',
            'customer_name'    => 'required|string|max:255',
            'customer_phone'   => 'required|string|max:20',
            'customer_address' => 'nullable|string|max:500',
        ]);

        $partner = Partner::findOrFail($request->partner_id);

        if ($partner->type !== 'mark') {
            return response()->json(['message' => 'Le partenaire sélectionné n\'est pas un administrateur de marque.'], 422);
        }

        $itemsInput = $request->input('items');

        try {
            $order = DB::transaction(function () use ($request, $partner, $itemsInput) {
                $totalAmount = 0;
                $itemsData = [];

                foreach ($itemsInput as $item) {
                    $product = Product::findOrFail($item['product_id']);

                    // Verify product belongs to the selected brand (partner)
                    if ($product->partner_id !== $partner->id) {
                        throw ValidationException::withMessages([
                            'items' => ["Le produit {$product->name} n'appartient pas à la marque sélectionnée."],
                        ]);
                    }

                    // Check stock
                    if ($product->stock < $item['quantity']) {
                        throw ValidationException::withMessages([
                            'items' => ["Stock insuffisant pour le produit {$product->name}. Stock disponible: {$product->stock}."],
                        ]);
                    }

                    // Deduct stock
                    $product->decrement('stock', $item['quantity']);

                    $subtotal = $product->price * $item['quantity'];
                    $totalAmount += $subtotal;

                    $itemsData[] = [
                        'product_id' => $product->id,
                        'quantity'   => $item['quantity'],
                        'price'      => $product->price,
                    ];
                }

                // Create the order
                $order = Order::create([
                    'user_id'          => $request->user()->id,
                    'partner_id'       => $partner->id,
                    'total_amount'     => $totalAmount,
                    'status'           => 'pending',
                    'customer_name'    => $request->input('customer_name'),
                    'customer_phone'   => $request->input('customer_phone'),
                    'customer_address' => $request->input('customer_address'),
                ]);

                // Create order items
                foreach ($itemsData as $itemData) {
                    $order->items()->create($itemData);
                }

                return $order;
            });

            return response()->json($order->load('items.product', 'partner'), 201);

        } catch (ValidationException $e) {
            return response()->json(['errors' => $e->errors()], 422);
        }
    }

    /**
     * Display a listing of orders assigned to the partner (for brand admins).
     */
    public function partnerOrders(Request $request)
    {
        $partner = $request->user();

        if ($partner->type !== 'mark') {
            return response()->json(['message' => 'Accès refusé. Réservé aux administrateurs de marque.'], 403);
        }

        $orders = $partner->orders()->with('items.product', 'user')->latest()->get();
        return response()->json($orders);
    }

    /**
     * Update order status (for brand admins).
     */
    public function updateStatus(Request $request, $id)
    {
        $partner = $request->user();

        if ($partner->type !== 'mark') {
            return response()->json(['message' => 'Accès refusé. Réservé aux administrateurs de marque.'], 403);
        }

        $request->validate([
            'status' => 'required|in:pending,paid,delivered',
        ]);

        $order = $partner->orders()->findOrFail($id);
        $order->update(['status' => $request->status]);

        return response()->json($order->load('items.product', 'user'));
    }
}
