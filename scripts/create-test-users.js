#!/usr/bin/env node

/**
 * Script to create test users in Supabase Auth
 * Run with: node scripts/create-test-users.js
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xtroyzuawpvpjzzpdkfs.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
  console.error('ERROR: SUPABASE_SERVICE_ROLE_KEY environment variable is required');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const testUsers = [
  {
    email: 'admin@test.com',
    password: 'admin123',
    fullName: 'Admin User',
    roleId: '5c2fe124-7238-420b-a435-c8e4da5a31fd', // admin role
  },
  {
    email: 'manufacturer@test.com',
    password: 'manu123',
    fullName: 'Manufacturer User',
    roleId: '8312a869-dff4-4377-abbf-efc3bcb0d049', // manufacturer_owner role
  },
  {
    email: 'customer@test.com',
    password: 'customer123',
    fullName: 'Customer User',
    roleId: '5e9c55e4-07dc-40a5-9bdb-375b2be92753', // customer role
  },
];

async function createTestUsers() {
  console.log('Creating test users in Supabase Auth...\n');

  for (const user of testUsers) {
    try {
      // Create auth user with admin API
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true, // Auto-confirm email
      });

      if (authError) {
        if (authError.message.includes('already registered')) {
          console.log(`✓ User ${user.email} already exists in auth`);

          // Update the users table with correct user ID
          const { data: existingUser } = await supabase.auth.admin.listUsers();
          const authUser = existingUser?.users?.find(u => u.email === user.email);

          if (authUser) {
            // Update users table
            const { error: updateError } = await supabase
              .from('users')
              .update({
                fullName: user.fullName,
                roleId: user.roleId,
                isActive: true,
              })
              .eq('id', authUser.id);

            if (!updateError) {
              console.log(`  → Updated users table for ${user.email}`);
            }
          }
        } else {
          console.error(`✗ Error creating ${user.email}:`, authError.message);
        }
        continue;
      }

      console.log(`✓ Created auth user: ${user.email}`);

      // Update the existing users table record
      const { error: updateError } = await supabase
        .from('users')
        .update({
          fullName: user.fullName,
          roleId: user.roleId,
          isActive: true,
        })
        .eq('id', authData.user.id);

      if (updateError) {
        console.error(`  → Warning: Could not update users table for ${user.email}`);
      } else {
        console.log(`  → Updated users table for ${user.email}`);
      }
    } catch (error) {
      console.error(`✗ Unexpected error for ${user.email}:`, error);
    }
  }

  console.log('\n✅ Test users setup complete!');
  console.log('\nYou can now log in with:');
  console.log('  Admin: admin@test.com / admin123');
  console.log('  Manufacturer: manufacturer@test.com / manu123');
  console.log('  Customer: customer@test.com / customer123');
}

createTestUsers().catch(console.error);
