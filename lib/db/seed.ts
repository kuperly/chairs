import { PERMISSIONS, PERMISSION_METADATA, ROLE_PERMISSIONS, ROLE_DESCRIPTIONS } from '../permissions/definitions';

/**
 * Database Seed Script
 *
 * Run with: npm run seed
 * Clear and re-seed: npm run seed:clear
 *
 * This script seeds the database with:
 * - Permissions
 * - Roles
 * - Role-Permission mappings
 * - Test users
 * - Sample manufacturers (optional)
 * - Sample products (optional)
 */

// Check for --clear flag
const shouldClear = process.argv.includes('--clear');

async function seed() {
  console.log('🌱 Starting database seed...\n');

  if (shouldClear) {
    console.log('⚠️  Clearing existing data...');
    await clearDatabase();
    console.log('✅ Database cleared\n');
  }

  // Seed in order due to foreign key constraints
  await seedPermissions();
  await seedRoles();
  await seedRolePermissions();
  await seedTestUsers();
  await seedSampleData();

  console.log('\n✨ Database seed complete!');
  console.log('\n📝 Test Users:');
  console.log('   Admin:        admin@test.com / admin123');
  console.log('   Manufacturer: manufacturer@test.com / manu123');
  console.log('   Customer:     customer@test.com / customer123');
}

async function clearDatabase() {
  // Note: This generates SQL - you'll execute via Supabase API
  const clearSQL = `
    TRUNCATE TABLE
      order_items,
      orders,
      event_featured_products,
      live_events,
      products,
      users,
      manufacturers,
      role_permissions,
      roles,
      permissions
    CASCADE;
  `;

  console.log('Generated clear SQL - execute via Supabase API:');
  console.log(clearSQL);
}

async function seedPermissions() {
  console.log('📋 Seeding permissions...');

  const permissionInserts: string[] = [];

  Object.values(PERMISSIONS).forEach((permissionName) => {
    const metadata = PERMISSION_METADATA[permissionName];
    permissionInserts.push(`
      ('${permissionName}', '${metadata.description}', '${metadata.resource}', '${metadata.action}')
    `);
  });

  const sql = `
    INSERT INTO permissions (name, description, resource, action)
    VALUES ${permissionInserts.join(',\n')}
    ON CONFLICT (name) DO NOTHING;
  `;

  console.log(sql);
  console.log(`✅ Generated SQL for ${Object.keys(PERMISSIONS).length} permissions`);
}

async function seedRoles() {
  console.log('\n👥 Seeding roles...');

  const roleInserts: string[] = [];

  Object.entries(ROLE_DESCRIPTIONS).forEach(([roleName, description]) => {
    roleInserts.push(`
      ('${roleName}', '${description}')
    `);
  });

  const sql = `
    INSERT INTO roles (name, description)
    VALUES ${roleInserts.join(',\n')}
    ON CONFLICT (name) DO NOTHING;
  `;

  console.log(sql);
  console.log(`✅ Generated SQL for ${Object.keys(ROLE_DESCRIPTIONS).length} roles`);
}

async function seedRolePermissions() {
  console.log('\n🔗 Seeding role-permission mappings...');

  let totalMappings = 0;
  const mappingInserts: string[] = [];

  Object.entries(ROLE_PERMISSIONS).forEach(([roleName, permissions]) => {
    permissions.forEach((permissionName) => {
      mappingInserts.push(`
        ((SELECT id FROM roles WHERE name = '${roleName}'),
         (SELECT id FROM permissions WHERE name = '${permissionName}'))
      `);
      totalMappings++;
    });
  });

  const sql = `
    INSERT INTO role_permissions ("roleId", "permissionId")
    VALUES ${mappingInserts.join(',\n')}
    ON CONFLICT DO NOTHING;
  `;

  console.log(sql);
  console.log(`✅ Generated SQL for ${totalMappings} role-permission mappings`);
}

async function seedTestUsers() {
  console.log('\n👤 Seeding test users...');

  const sql = `
    -- Admin user
    INSERT INTO users (email, "fullName", "roleId")
    VALUES (
      'admin@test.com',
      'Admin User',
      (SELECT id FROM roles WHERE name = 'admin')
    )
    ON CONFLICT (email) DO NOTHING;

    -- Manufacturer user
    INSERT INTO users (email, "fullName", "roleId")
    VALUES (
      'manufacturer@test.com',
      'Manufacturer User',
      (SELECT id FROM roles WHERE name = 'manufacturer_owner')
    )
    ON CONFLICT (email) DO NOTHING;

    -- Customer user
    INSERT INTO users (email, "fullName", "roleId")
    VALUES (
      'customer@test.com',
      'Customer User',
      (SELECT id FROM roles WHERE name = 'customer')
    )
    ON CONFLICT (email) DO NOTHING;
  `;

  console.log(sql);
  console.log('✅ Generated SQL for 3 test users');
  console.log('   Note: Passwords will be set up via Supabase Auth');
}

async function seedSampleData() {
  console.log('\n📦 Seeding sample data...');

  const sql = `
    -- Sample manufacturer
    INSERT INTO manufacturers ("companyName", description, "isApproved", "isHidden")
    VALUES (
      'LiveChairs Factory',
      'Premium office furniture manufacturer based in China',
      true,
      false
    )
    ON CONFLICT DO NOTHING;

    -- Sample products
    INSERT INTO products (name, description, price, "compareAtPrice", category, "stockQuantity", "imageUrls", "manufacturerId")
    VALUES
      (
        'Executive Office Chair',
        'Premium ergonomic office chair with lumbar support',
        299.99,
        399.99,
        'Office Chairs',
        50,
        ARRAY['https://res.cloudinary.com/demo/image/upload/office-chair-1.jpg'],
        (SELECT id FROM manufacturers WHERE "companyName" = 'LiveChairs Factory' LIMIT 1)
      ),
      (
        'Standing Desk',
        'Height-adjustable standing desk with electric motor',
        499.99,
        699.99,
        'Desks',
        30,
        ARRAY['https://res.cloudinary.com/demo/image/upload/standing-desk-1.jpg'],
        (SELECT id FROM manufacturers WHERE "companyName" = 'LiveChairs Factory' LIMIT 1)
      ),
      (
        'Mesh Task Chair',
        'Breathable mesh back chair for all-day comfort',
        149.99,
        199.99,
        'Office Chairs',
        100,
        ARRAY['https://res.cloudinary.com/demo/image/upload/task-chair-1.jpg'],
        (SELECT id FROM manufacturers WHERE "companyName" = 'LiveChairs Factory' LIMIT 1)
      )
    ON CONFLICT DO NOTHING;
  `;

  console.log(sql);
  console.log('✅ Generated SQL for sample manufacturer and products');
}

// Run seed
seed().catch((error) => {
  console.error('❌ Seed failed:', error);
  process.exit(1);
});
