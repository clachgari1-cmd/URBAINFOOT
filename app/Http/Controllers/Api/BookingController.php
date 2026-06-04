<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Pitch;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class BookingController extends Controller
{
    /**
     * Display a listing of client's own bookings (for clients).
     */
    public function index(Request $request)
    {
        $bookings = $request->user()->bookings()->with('pitch.partner')->latest()->get();
        return response()->json($bookings);
    }

    /**
     * Create a new booking (for clients).
     */
    public function store(Request $request)
    {
        $request->validate([
            'pitch_id'       => 'required|exists:pitches,id',
            'start_time'     => 'required|date|after:now',
            'end_time'       => 'required|date|after:start_time',
            'customer_name'  => 'required|string|max:255',
            'customer_phone' => 'required|string|max:20',
        ]);

        $pitch = Pitch::findOrFail($request->pitch_id);

        $startTime = Carbon::parse($request->start_time);
        $endTime = Carbon::parse($request->end_time);

        // Check for overlap
        $overlapExists = Booking::where('pitch_id', $pitch->id)
            ->where('status', '!=', 'cancelled')
            ->where(function ($query) use ($startTime, $endTime) {
                $query->where('start_time', '<', $endTime)
                      ->where('end_time', '>', $startTime);
            })
            ->exists();

        if ($overlapExists) {
            throw ValidationException::withMessages([
                'start_time' => ['Ce terrain est déjà réservé sur ce créneau horaire.'],
            ]);
        }

        // Calculate total price based on pitch price_per_hour and duration in hours
        $durationInHours = $startTime->diffInMinutes($endTime) / 60;
        $totalPrice = $pitch->price_per_hour * $durationInHours;

        $booking = Booking::create([
            'user_id'        => $request->user()->id,
            'pitch_id'       => $pitch->id,
            'start_time'     => $startTime,
            'end_time'       => $endTime,
            'total_price'    => $totalPrice,
            'status'         => 'pending',
            'customer_name'  => $request->input('customer_name'),
            'customer_phone' => $request->input('customer_phone'),
        ]);

        return response()->json($booking->load('pitch.partner'), 201);
    }

    /**
     * Cancel own booking (for clients).
     */
    public function cancel(Request $request, $id)
    {
        $booking = $request->user()->bookings()->findOrFail($id);

        if ($booking->status === 'cancelled') {
            return response()->json(['message' => 'Cette réservation est déjà annulée.'], 422);
        }

        $booking->update(['status' => 'cancelled']);

        return response()->json($booking->load('pitch.partner'));
    }

    /**
     * Display a listing of bookings for pitches managed by the partner (for pitch managers).
     */
    public function partnerBookings(Request $request)
    {
        $partner = $request->user();

        if ($partner->type !== 'terrain_manager') {
            return response()->json(['message' => 'Accès refusé. Réservé aux gérants de terrain.'], 403);
        }

        // Get bookings for all pitches owned by this partner
        $pitchIds = $partner->pitches()->pluck('id');
        $bookings = Booking::whereIn('pitch_id', $pitchIds)->with('pitch', 'user')->latest()->get();

        return response()->json($bookings);
    }

    /**
     * Confirm or cancel a booking (for pitch managers).
     */
    public function updateStatus(Request $request, $id)
    {
        $partner = $request->user();

        if ($partner->type !== 'terrain_manager') {
            return response()->json(['message' => 'Accès refusé. Réservé aux gérants de terrain.'], 403);
        }

        $request->validate([
            'status' => 'required|in:pending,confirmed,cancelled',
        ]);

        // Retrieve booking and ensure the pitch belongs to this partner
        $booking = Booking::findOrFail($id);
        $pitch = $booking->pitch;

        if ($pitch->partner_id !== $partner->id) {
            return response()->json(['message' => 'Accès interdit. Ce terrain ne vous appartient pas.'], 403);
        }

        $booking->update(['status' => $request->status]);

        return response()->json($booking->load('pitch', 'user'));
    }

    /**
     * Return booked time slots for a pitch on a given date (public, for clients).
     */
    public function bookedSlots(Request $request, Pitch $pitch)
    {
        $request->validate([
            'date' => 'required|date_format:Y-m-d',
        ]);

        $date = $request->input('date');

        $slots = Booking::where('pitch_id', $pitch->id)
            ->where('status', '!=', 'cancelled')
            ->whereDate('start_time', $date)
            ->get(['id', 'start_time', 'end_time', 'status']);

        return response()->json($slots);
    }
}
