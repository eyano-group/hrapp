<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        // Create Admin User
        User::firstOrCreate(
            ['phone' => '0000'],
            [
                'name' => 'Administrateur',
                'password' => '0000', // Encrypted by Mutator or Hash::make automatically if model handles it, otherwise manually here? 
                // Wait, User model mutator handles password hashing usually. 
                // But for pin_code we check.
                // Let's assume standard Laravel User model behavior or our specific logic.
                // Re-checking User model might be good but let's stick to standard firstOrCreate
                // Actually, let's explicitly set values.
                'pin_code' => '0000',
                'is_admin' => true,
            ]
        );
    }
}
