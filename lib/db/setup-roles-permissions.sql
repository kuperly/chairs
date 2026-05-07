-- Setup Roles and Permissions
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/YOUR_PROJECT/sql/new

-- 1. Create Permissions
INSERT INTO permissions (name, description, resource, action)
VALUES
  -- Event permissions
  ('event.create', 'Create live events', 'event', 'create'),
  ('event.read', 'View live events', 'event', 'read'),
  ('event.update', 'Update live events', 'event', 'update'),
  ('event.delete', 'Delete live events', 'event', 'delete'),
  ('event.broadcast', 'Broadcast live events', 'event', 'broadcast'),

  -- Product permissions
  ('product.create', 'Create products', 'product', 'create'),
  ('product.read', 'View products', 'product', 'read'),
  ('product.update', 'Update any product', 'product', 'update'),
  ('product.update.own', 'Update own products only', 'product', 'update.own'),
  ('product.delete', 'Delete products', 'product', 'delete'),
  ('product.import', 'Bulk import products via CSV', 'product', 'import'),

  -- Order permissions
  ('order.create', 'Create orders', 'order', 'create'),
  ('order.read.own', 'View own orders', 'order', 'read.own'),
  ('order.read.all', 'View all orders', 'order', 'read.all'),
  ('order.update', 'Update order status', 'order', 'update'),

  -- Manufacturer permissions
  ('manufacturer.create', 'Create manufacturers', 'manufacturer', 'create'),
  ('manufacturer.read', 'View manufacturers', 'manufacturer', 'read'),
  ('manufacturer.update.own', 'Update own manufacturer', 'manufacturer', 'update.own'),
  ('manufacturer.update.all', 'Update any manufacturer', 'manufacturer', 'update.all'),
  ('manufacturer.approve', 'Approve manufacturers', 'manufacturer', 'approve'),

  -- User permissions
  ('user.read', 'View users', 'user', 'read'),
  ('user.update', 'Update users', 'user', 'update'),
  ('user.delete', 'Delete users', 'user', 'delete'),

  -- Analytics permissions
  ('analytics.view.own', 'View own analytics', 'analytics', 'view.own'),
  ('analytics.view.all', 'View all analytics', 'analytics', 'view.all')
ON CONFLICT (name) DO NOTHING;

-- 2. Create Roles
INSERT INTO roles (name, description)
VALUES
  ('admin', 'Platform administrator with full access'),
  ('manufacturer_owner', 'Manufacturer company owner - can manage own products'),
  ('customer', 'Customer - can browse and purchase products'),
  ('guest', 'Guest user - can only browse')
ON CONFLICT (name) DO NOTHING;

-- 3. Create Role-Permission Mappings

-- Admin permissions (full access)
INSERT INTO role_permissions ("roleId", "permissionId")
SELECT
  (SELECT id FROM roles WHERE name = 'admin'),
  id
FROM permissions
WHERE name IN (
  'event.create', 'event.read', 'event.update', 'event.delete', 'event.broadcast',
  'product.create', 'product.read', 'product.update', 'product.delete', 'product.import',
  'order.read.all', 'order.update',
  'manufacturer.read', 'manufacturer.update.all', 'manufacturer.approve',
  'user.read', 'user.update', 'user.delete',
  'analytics.view.all'
)
ON CONFLICT DO NOTHING;

-- Manufacturer Owner permissions
INSERT INTO role_permissions ("roleId", "permissionId")
SELECT
  (SELECT id FROM roles WHERE name = 'manufacturer_owner'),
  id
FROM permissions
WHERE name IN (
  'event.read',
  'product.create', 'product.read', 'product.update.own', 'product.delete', 'product.import',
  'order.read.own',
  'manufacturer.update.own',
  'analytics.view.own'
)
ON CONFLICT DO NOTHING;

-- Customer permissions
INSERT INTO role_permissions ("roleId", "permissionId")
SELECT
  (SELECT id FROM roles WHERE name = 'customer'),
  id
FROM permissions
WHERE name IN (
  'event.read',
  'product.read',
  'order.create', 'order.read.own'
)
ON CONFLICT DO NOTHING;

-- Guest permissions
INSERT INTO role_permissions ("roleId", "permissionId")
SELECT
  (SELECT id FROM roles WHERE name = 'guest'),
  id
FROM permissions
WHERE name IN (
  'event.read',
  'product.read'
)
ON CONFLICT DO NOTHING;

-- 4. Update your current user to admin role
UPDATE users
SET "roleId" = (SELECT id FROM roles WHERE name = 'admin')
WHERE email = 'admin+@admin.com';

-- 5. Verify everything is set up correctly
SELECT
  r.name as role,
  COUNT(rp."permissionId") as permission_count
FROM roles r
LEFT JOIN role_permissions rp ON r.id = rp."roleId"
GROUP BY r.id, r.name
ORDER BY r.name;

-- 6. Verify your user has admin role
SELECT
  u.email,
  u."fullName",
  r.name as role,
  COUNT(rp."permissionId") as permissions
FROM users u
JOIN roles r ON u."roleId" = r.id
LEFT JOIN role_permissions rp ON r.id = rp."roleId"
WHERE u.email = 'admin+@admin.com'
GROUP BY u.id, u.email, u."fullName", r.name;
