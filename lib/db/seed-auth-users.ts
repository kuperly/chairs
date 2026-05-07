/**
 * Seed Supabase Auth Users
 * Run with: npm run seed:auth
 */

// Load environment variables FIRST
import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(process.cwd(), '.env.local') });

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('Please make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

interface TestUser {
  email: string;
  password: string;
  fullName: string;
  roleName: string;
}

const testUsers: TestUser[] = [
  {
    email: 'admin@test.com',
    password: 'admin123',
    fullName: 'Admin User',
    roleName: 'admin'
  },
  {
    email: 'manufacturer@test.com',
    password: 'manu123',
    fullName: 'Manufacturer User',
    roleName: 'manufacturer_owner'
  },
  {
    email: 'customer@test.com',
    password: 'customer123',
    fullName: 'Customer User',
    roleName: 'customer'
  }
];

async function seedAuthUsers() {
  console.log('🌱 Starting to seed auth users...\n');

  for (const user of testUsers) {
    console.log(`📧 Creating user: ${user.email}`);

    try {
      // Check if user already exists in auth
      const { data: existingAuthUsers } = await supabase.auth.admin.listUsers();
      const existingAuth = existingAuthUsers?.users.find(u => u.email === user.email);

      let userId: string;

      if (existingAuth) {
        console.log(`   ℹ️  Auth user already exists: ${existingAuth.id}`);
        userId = existingAuth.id;
      } else {
        // Create auth user
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
          email: user.email,
          password: user.password,
          email_confirm: true, // Auto-confirm email
        });

        if (authError) {
          console.error(`   ❌ Error creating auth user: ${authError.message}`);
          continue;
        }

        if (!authData.user) {
          console.error(`   ❌ Auth user creation failed`);
          continue;
        }

        userId = authData.user.id;
        console.log(`   ✅ Auth user created: ${userId}`);
      }

      // Get role ID
      const { data: role, error: roleError } = await supabase
        .from('roles')
        .select('id')
        .eq('name', user.roleName)
        .single();

      if (roleError || !role) {
        console.error(`   ❌ Error finding role "${user.roleName}": ${roleError?.message}`);
        console.error(`   ⚠️  Please run the database seed script first to create roles`);
        continue;
      }

      // Check if database user already exists
      const { data: existingDbUser } = await supabase
        .from('users')
        .select('id')
        .eq('id', userId)
        .single();

      if (existingDbUser) {
        console.log(`   ℹ️  Database user already exists`);
      } else {
        // Create database user record
        const { error: userError } = await supabase.from('users').insert({
          id: userId,
          email: user.email,
          fullName: user.fullName,
          roleId: role.id,
          isActive: true,
        });

        if (userError) {
          console.error(`   ❌ Error creating database user: ${userError.message}`);
          // Try to clean up auth user if database insert fails
          await supabase.auth.admin.deleteUser(userId);
          continue;
        }

        console.log(`   ✅ Database user created`);
      }

      console.log(`   ✅ User complete: ${user.email} / ${user.password}\n`);

    } catch (error) {
      console.error(`   ❌ Unexpected error:`, error);
      continue;
    }
  }

  console.log('✨ Auth users seeded successfully!\n');
  console.log('📝 Test Users:');
  console.log('   Admin:        admin@test.com / admin123');
  console.log('   Manufacturer: manufacturer@test.com / manu123');
  console.log('   Customer:     customer@test.com / customer123\n');
  console.log('🎉 You can now login at http://localhost:3002/login');

  process.exit(0);
}

seedAuthUsers().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
