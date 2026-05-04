export const PERMISSIONS = {
  // Event permissions
  EVENT_CREATE: 'event.create',
  EVENT_READ: 'event.read',
  EVENT_UPDATE: 'event.update',
  EVENT_DELETE: 'event.delete',
  EVENT_BROADCAST: 'event.broadcast',

  // Product permissions
  PRODUCT_CREATE: 'product.create',
  PRODUCT_READ: 'product.read',
  PRODUCT_UPDATE: 'product.update',
  PRODUCT_UPDATE_OWN: 'product.update.own',
  PRODUCT_DELETE: 'product.delete',
  PRODUCT_IMPORT: 'product.import',

  // Order permissions
  ORDER_CREATE: 'order.create',
  ORDER_READ_OWN: 'order.read.own',
  ORDER_READ_ALL: 'order.read.all',
  ORDER_UPDATE: 'order.update',

  // Manufacturer permissions
  MANUFACTURER_CREATE: 'manufacturer.create',
  MANUFACTURER_READ: 'manufacturer.read',
  MANUFACTURER_UPDATE_OWN: 'manufacturer.update.own',
  MANUFACTURER_UPDATE_ALL: 'manufacturer.update.all',
  MANUFACTURER_APPROVE: 'manufacturer.approve',

  // User permissions
  USER_READ: 'user.read',
  USER_UPDATE: 'user.update',
  USER_DELETE: 'user.delete',

  // Analytics permissions
  ANALYTICS_VIEW_OWN: 'analytics.view.own',
  ANALYTICS_VIEW_ALL: 'analytics.view.all',
} as const;

export type PermissionKey = keyof typeof PERMISSIONS;
export type PermissionValue = typeof PERMISSIONS[PermissionKey];

// Permission metadata for seeding
export const PERMISSION_METADATA: Record<PermissionValue, { resource: string; action: string; description: string }> = {
  // Events
  'event.create': { resource: 'event', action: 'create', description: 'Create live events' },
  'event.read': { resource: 'event', action: 'read', description: 'View live events' },
  'event.update': { resource: 'event', action: 'update', description: 'Update live events' },
  'event.delete': { resource: 'event', action: 'delete', description: 'Delete live events' },
  'event.broadcast': { resource: 'event', action: 'broadcast', description: 'Broadcast live events' },

  // Products
  'product.create': { resource: 'product', action: 'create', description: 'Create products' },
  'product.read': { resource: 'product', action: 'read', description: 'View products' },
  'product.update': { resource: 'product', action: 'update', description: 'Update any product' },
  'product.update.own': { resource: 'product', action: 'update.own', description: 'Update own products only' },
  'product.delete': { resource: 'product', action: 'delete', description: 'Delete products' },
  'product.import': { resource: 'product', action: 'import', description: 'Bulk import products via CSV' },

  // Orders
  'order.create': { resource: 'order', action: 'create', description: 'Create orders' },
  'order.read.own': { resource: 'order', action: 'read.own', description: 'View own orders' },
  'order.read.all': { resource: 'order', action: 'read.all', description: 'View all orders' },
  'order.update': { resource: 'order', action: 'update', description: 'Update order status' },

  // Manufacturers
  'manufacturer.create': { resource: 'manufacturer', action: 'create', description: 'Create manufacturers' },
  'manufacturer.read': { resource: 'manufacturer', action: 'read', description: 'View manufacturers' },
  'manufacturer.update.own': { resource: 'manufacturer', action: 'update.own', description: 'Update own manufacturer' },
  'manufacturer.update.all': { resource: 'manufacturer', action: 'update.all', description: 'Update any manufacturer' },
  'manufacturer.approve': { resource: 'manufacturer', action: 'approve', description: 'Approve manufacturers' },

  // Users
  'user.read': { resource: 'user', action: 'read', description: 'View users' },
  'user.update': { resource: 'user', action: 'update', description: 'Update users' },
  'user.delete': { resource: 'user', action: 'delete', description: 'Delete users' },

  // Analytics
  'analytics.view.own': { resource: 'analytics', action: 'view.own', description: 'View own analytics' },
  'analytics.view.all': { resource: 'analytics', action: 'view.all', description: 'View all analytics' },
};

// Role-Permission mapping
export const ROLE_PERMISSIONS: Record<string, PermissionValue[]> = {
  admin: [
    PERMISSIONS.EVENT_CREATE,
    PERMISSIONS.EVENT_READ,
    PERMISSIONS.EVENT_UPDATE,
    PERMISSIONS.EVENT_DELETE,
    PERMISSIONS.EVENT_BROADCAST,
    PERMISSIONS.PRODUCT_CREATE,
    PERMISSIONS.PRODUCT_READ,
    PERMISSIONS.PRODUCT_UPDATE,
    PERMISSIONS.PRODUCT_DELETE,
    PERMISSIONS.PRODUCT_IMPORT,
    PERMISSIONS.ORDER_READ_ALL,
    PERMISSIONS.ORDER_UPDATE,
    PERMISSIONS.MANUFACTURER_READ,
    PERMISSIONS.MANUFACTURER_UPDATE_ALL,
    PERMISSIONS.MANUFACTURER_APPROVE,
    PERMISSIONS.USER_READ,
    PERMISSIONS.USER_UPDATE,
    PERMISSIONS.USER_DELETE,
    PERMISSIONS.ANALYTICS_VIEW_ALL,
  ],

  manufacturer_owner: [
    PERMISSIONS.EVENT_READ,
    PERMISSIONS.PRODUCT_CREATE,
    PERMISSIONS.PRODUCT_READ,
    PERMISSIONS.PRODUCT_UPDATE_OWN,
    PERMISSIONS.PRODUCT_DELETE,
    PERMISSIONS.PRODUCT_IMPORT,
    PERMISSIONS.ORDER_READ_OWN,
    PERMISSIONS.MANUFACTURER_UPDATE_OWN,
    PERMISSIONS.ANALYTICS_VIEW_OWN,
  ],

  customer: [
    PERMISSIONS.EVENT_READ,
    PERMISSIONS.PRODUCT_READ,
    PERMISSIONS.ORDER_CREATE,
    PERMISSIONS.ORDER_READ_OWN,
  ],

  guest: [
    PERMISSIONS.EVENT_READ,
    PERMISSIONS.PRODUCT_READ,
  ],
};

// Role descriptions
export const ROLE_DESCRIPTIONS: Record<string, string> = {
  admin: 'Platform administrator with full access',
  manufacturer_owner: 'Manufacturer company owner - can manage own products',
  customer: 'Customer - can browse and purchase products',
  guest: 'Guest user - can only browse',
};
