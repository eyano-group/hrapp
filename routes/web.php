<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

use App\Http\Controllers\AttendanceController;

Route::get('/', function () {
    return Inertia::render('Index', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

Route::post('/attendance', [AttendanceController::class, 'store'])->name('attendance.store');
Route::get('/attendance/export', [AttendanceController::class, 'exportCsv'])->name('attendance.export');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
});

require __DIR__.'/settings.php';
