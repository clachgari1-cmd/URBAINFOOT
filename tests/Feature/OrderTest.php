<?php

namespace Tests\Feature;

use App\Models\Partner;
use App\Models\Product;
use App\Models\User;
use App\Models\Order;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class OrderTest extends TestCase
{
    use RefreshDatabase;

    public function test_client_can_place_order()
    {
        $user = User::factory()->create();
        $partner = Partner::create([
            'name'        => 'Nike',
            'email'       => 'nike@example.com',
            'password'    => bcrypt('password'),
            'access_code' => bcrypt('1234'),
            'type'        => 'mark',
        ]);
        
        $product = Product::create([
            'partner_id' => $partner->id,
            'name'       => 'Nike Air Max',
            'price'      => 120.00,
            'stock'      => 10,
        ]);

        Sanctum::actingAs($user, ['*']);

        $response = $this->postJson('/api/orders', [
            'partner_id' => $partner->id,
            'items'      => [
                [
                    'product_id' => $product->id,
                    'quantity'   => 2,
                ]
            ]
        ]);

        $response->assertStatus(201);
        $response->assertJsonPath('total_amount', 240);
        $response->assertJsonPath('status', 'pending');

        $this->assertDatabaseHas('orders', [
            'user_id'      => $user->id,
            'partner_id'   => $partner->id,
            'total_amount' => 240.00,
            'status'       => 'pending',
        ]);

        // Check stock deducted
        $this->assertEquals(8, $product->fresh()->stock);
    }

    public function test_client_cannot_order_with_insufficient_stock()
    {
        $user = User::factory()->create();
        $partner = Partner::create([
            'name'        => 'Nike',
            'email'       => 'nike@example.com',
            'password'    => bcrypt('password'),
            'access_code' => bcrypt('1234'),
            'type'        => 'mark',
        ]);
        
        $product = Product::create([
            'partner_id' => $partner->id,
            'name'       => 'Nike Air Max',
            'price'      => 120.00,
            'stock'      => 1,
        ]);

        Sanctum::actingAs($user, ['*']);

        $response = $this->postJson('/api/orders', [
            'partner_id' => $partner->id,
            'items'      => [
                [
                    'product_id' => $product->id,
                    'quantity'   => 2,
                ]
            ]
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors('items');
        $this->assertEquals(1, $product->fresh()->stock);
    }

    public function test_client_cannot_order_product_from_another_brand()
    {
        $user = User::factory()->create();
        $partner1 = Partner::create([
            'name'        => 'Nike',
            'email'       => 'nike@example.com',
            'password'    => bcrypt('password'),
            'access_code' => bcrypt('1234'),
            'type'        => 'mark',
        ]);
        $partner2 = Partner::create([
            'name'        => 'Adidas',
            'email'       => 'adidas@example.com',
            'password'    => bcrypt('password'),
            'access_code' => bcrypt('1234'),
            'type'        => 'mark',
        ]);
        
        $product2 = Product::create([
            'partner_id' => $partner2->id,
            'name'       => 'Stan Smith',
            'price'      => 100.00,
            'stock'      => 5,
        ]);

        Sanctum::actingAs($user, ['*']);

        // Order is placed for partner1 (Nike) but includes Adidas product
        $response = $this->postJson('/api/orders', [
            'partner_id' => $partner1->id,
            'items'      => [
                [
                    'product_id' => $product2->id,
                    'quantity'   => 1,
                ]
            ]
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors('items');
    }

    public function test_partner_can_view_and_update_assigned_orders()
    {
        $user = User::factory()->create();
        $partner = Partner::create([
            'name'        => 'Nike',
            'email'       => 'nike@example.com',
            'password'    => bcrypt('password'),
            'access_code' => bcrypt('1234'),
            'type'        => 'mark',
        ]);
        
        $order = Order::create([
            'user_id'      => $user->id,
            'partner_id'   => $partner->id,
            'total_amount' => 150.00,
            'status'       => 'pending',
        ]);

        Sanctum::actingAs($partner, ['partner-token']);

        // View orders
        $response = $this->getJson('/api/partner/orders');
        $response->assertStatus(200);
        $response->assertJsonCount(1);

        // Update status
        $updateResponse = $this->patchJson("/api/partner/orders/{$order->id}/status", [
            'status' => 'delivered'
        ]);
        $updateResponse->assertStatus(200);
        $this->assertEquals('delivered', $order->fresh()->status);
    }
}
