<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class DashboardController extends Controller
{
    public function index()
    {
        $user = Auth::user();

        // If admin, fetch ALL drivers. Otherwise, only own drivers.
        $query = \App\Models\Driver::query();
        
        if (!$user->is_admin) {
            $query->where('user_id', $user->id);
        } else {
            // Include manager name for admin
            $query->with('user');
        }
        
        $drivers = $query->with(['attendances' => function($query) {
                // We only need the latest attendance to determine status
                $query->whereDate('created_at', now())->latest();
            }])
            ->get()
            ->map(function ($driver) {
                // Determine current status based on LAST attendance today
                $lastAttendance = $driver->attendances->first();
                
                // If last record is 'arrival', they are Present.
                // If 'departure' or null, they are Absent.
                $isPresent = $lastAttendance && $lastAttendance->type === 'arrival';

                return [
                    'id' => $driver->id,
                    'name' => $driver->name,
                    'matricule' => $driver->matricule,
                    'phone' => $driver->phone,
                    'isPresent' => $isPresent,
                    'lastActionTime' => $lastAttendance ? $lastAttendance->created_at->format('H:i') : null,
                    'managerName' => $driver->user ? $driver->user->name : 'N/A', // Added for Admin
                ];
            });

        // Simplified Stats: Only Total Drivers
        $stats = [
            'totalDrivers' => $drivers->count(),
        ];

        return Inertia::render('Dashboard', [
            'drivers' => $drivers,
            'stats' => $stats,
            'auth' => [
                'user' => $user,
            ]
        ]);
    }
}
