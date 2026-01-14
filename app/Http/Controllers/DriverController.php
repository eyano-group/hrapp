<?php

namespace App\Http\Controllers;

use App\Models\Driver;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

class DriverController extends Controller
{
    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'matricule' => 'required|string|unique:drivers,matricule|max:50',
            'phone' => 'nullable|string|max:20',
        ]);

        $driver = new Driver($validated);
        $driver->user_id = Auth::id(); // Assign to current manager
        $driver->save();

        return back()->with('success', 'Chauffeur ajouté avec succès.');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Driver $driver)
    {
        // Ensure user owns the driver
        if ($driver->user_id !== Auth::id()) {
            abort(403);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'matricule' => [
                'required',
                'string',
                'max:50',
                Rule::unique('drivers')->ignore($driver->id),
            ],
            'phone' => 'nullable|string|max:20',
        ]);

        $driver->update($validated);

        return back()->with('success', 'Chauffeur mis à jour avec succès.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Driver $driver)
    {
        if ($driver->user_id !== Auth::id()) {
            abort(403);
        }

        $driver->delete();

        return back()->with('success', 'Chauffeur supprimé avec succès.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Driver $driver)
    {
        if ($driver->user_id !== Auth::id() && !Auth::user()->is_admin) {
            abort(403);
        }

        $driver->load(['attendances' => function ($query) {
            $query->orderBy('created_at', 'desc');
        }]);

        $history = $driver->attendances->map(function ($att) {
            return [
                'id' => $att->id,
                'type' => $att->type,
                'date' => $att->created_at->format('Y-m-d'),
                'time' => $att->created_at->format('H:i'),
                'isToday' => $att->created_at->isToday(),
                'daysAgo' => $att->created_at->diffInDays(now()),
            ];
        });

        return \Inertia\Inertia::render('Driver/Show', [
            'driver' => [
                'id' => $driver->id,
                'name' => $driver->name,
                'matricule' => $driver->matricule,
                'phone' => $driver->phone,
            ],
            'history' => $history,
        ]);
    }
}
