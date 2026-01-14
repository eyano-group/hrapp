<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;
use Illuminate\Support\Facades\Auth;

use App\Http\Controllers\AttendanceController;

Route::get('/', function () {
    return Auth::check() 
        ? redirect()->route('dashboard') 
        : redirect()->route('login');
});

Route::post('/attendance', [AttendanceController::class, 'store'])->name('attendance.store');
Route::post('/attendance/mark-present', [AttendanceController::class, 'markPresent'])->name('attendance.mark-present');
Route::get('/attendance/export', [AttendanceController::class, 'export'])->name('attendance.export');
Route::post('/attendance/manual', [AttendanceController::class, 'storeManual'])->name('attendance.storeManual');
Route::put('/attendance/{attendance}', [AttendanceController::class, 'update'])->name('attendance.update');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [\App\Http\Controllers\DashboardController::class, 'index'])->name('dashboard');
    Route::resource('drivers', \App\Http\Controllers\DriverController::class)->only(['store', 'update', 'destroy', 'show']);
});

require __DIR__.'/settings.php';
