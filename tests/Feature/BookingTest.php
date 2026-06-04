<?php

namespace Tests\Feature;

use App\Models\Partner;
use App\Models\Pitch;
use App\Models\User;
use App\Models\Booking;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class BookingTest extends TestCase
{
    use RefreshDatabase;

    public function test_client_can_book_pitch_successfully()
    {
        $user = User::factory()->create();
        $partner = Partner::create([
            'name'        => 'Pitch Owner',
            'email'       => 'owner@example.com',
            'password'    => bcrypt('password'),
            'access_code' => bcrypt('1234'),
            'type'        => 'terrain_manager',
        ]);

        $pitch = Pitch::create([
            'partner_id'     => $partner->id,
            'name'           => 'Pitch Wembley',
            'type'           => '5',
            'price_per_hour' => 50.00,
        ]);

        Sanctum::actingAs($user, ['*']);

        $startTime = Carbon::now()->addDay()->setHour(14)->setMinute(0)->setSecond(0);
        $endTime = (clone $startTime)->addHours(2); // 2 hours booking -> price = 100.00

        $response = $this->postJson('/api/bookings', [
            'pitch_id'   => $pitch->id,
            'start_time' => $startTime->toDateTimeString(),
            'end_time'   => $endTime->toDateTimeString(),
        ]);

        $response->assertStatus(201);
        $response->assertJsonPath('total_price', 100);
        $response->assertJsonPath('status', 'pending');

        $this->assertDatabaseHas('bookings', [
            'user_id'     => $user->id,
            'pitch_id'    => $pitch->id,
            'total_price' => 100.00,
            'status'      => 'pending',
        ]);
    }

    public function test_client_cannot_book_overlapping_timeslot()
    {
        $user = User::factory()->create();
        $partner = Partner::create([
            'name'        => 'Pitch Owner',
            'email'       => 'owner@example.com',
            'password'    => bcrypt('password'),
            'access_code' => bcrypt('1234'),
            'type'        => 'terrain_manager',
        ]);

        $pitch = Pitch::create([
            'partner_id'     => $partner->id,
            'name'           => 'Pitch Wembley',
            'type'           => '5',
            'price_per_hour' => 50.00,
        ]);

        $startTime = Carbon::now()->addDay()->setHour(14)->setMinute(0)->setSecond(0);
        $endTime = (clone $startTime)->addHours(2);

        // Pre-create a confirmed booking
        Booking::create([
            'user_id'     => $user->id,
            'pitch_id'    => $pitch->id,
            'start_time'  => $startTime,
            'end_time'    => $endTime,
            'total_price' => 100.00,
            'status'      => 'confirmed',
        ]);

        Sanctum::actingAs($user, ['*']);

        // Try booking overlapping slot (15:00 to 17:00, which overlaps with 14:00 to 16:00)
        $response = $this->postJson('/api/bookings', [
            'pitch_id'   => $pitch->id,
            'start_time' => (clone $startTime)->addHour()->toDateTimeString(),
            'end_time'   => (clone $endTime)->addHour()->toDateTimeString(),
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors('start_time');
    }

    public function test_client_can_cancel_own_booking()
    {
        $user = User::factory()->create();
        $partner = Partner::create([
            'name'        => 'Pitch Owner',
            'email'       => 'owner@example.com',
            'password'    => bcrypt('password'),
            'access_code' => bcrypt('1234'),
            'type'        => 'terrain_manager',
        ]);

        $pitch = Pitch::create([
            'partner_id'     => $partner->id,
            'name'           => 'Pitch Wembley',
            'type'           => '5',
            'price_per_hour' => 50.00,
        ]);

        $booking = Booking::create([
            'user_id'     => $user->id,
            'pitch_id'    => $pitch->id,
            'start_time'  => Carbon::now()->addDay(),
            'end_time'    => Carbon::now()->addDay()->addHour(),
            'total_price' => 50.00,
            'status'      => 'pending',
        ]);

        Sanctum::actingAs($user, ['*']);

        $response = $this->postJson("/api/bookings/{$booking->id}/cancel");
        $response->assertStatus(200);
        $this->assertEquals('cancelled', $booking->fresh()->status);
    }

    public function test_pitch_manager_can_view_and_update_booking_status()
    {
        $user = User::factory()->create();
        $partner = Partner::create([
            'name'        => 'Pitch Owner',
            'email'       => 'owner@example.com',
            'password'    => bcrypt('password'),
            'access_code' => bcrypt('1234'),
            'type'        => 'terrain_manager',
        ]);

        $pitch = Pitch::create([
            'partner_id'     => $partner->id,
            'name'           => 'Pitch Wembley',
            'type'           => '5',
            'price_per_hour' => 50.00,
        ]);

        $booking = Booking::create([
            'user_id'     => $user->id,
            'pitch_id'    => $pitch->id,
            'start_time'  => Carbon::now()->addDay(),
            'end_time'    => Carbon::now()->addDay()->addHour(),
            'total_price' => 50.00,
            'status'      => 'pending',
        ]);

        Sanctum::actingAs($partner, ['partner-token']);

        // View bookings for managed pitches
        $response = $this->getJson('/api/partner/bookings');
        $response->assertStatus(200);
        $response->assertJsonCount(1);

        // Confirm booking
        $updateResponse = $this->patchJson("/api/partner/bookings/{$booking->id}/status", [
            'status' => 'confirmed'
        ]);
        $updateResponse->assertStatus(200);
        $this->assertEquals('confirmed', $booking->fresh()->status);
    }
}
