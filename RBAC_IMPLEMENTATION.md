# Role-Based Access Control (RBAC) Implementation

## Overview

This project now implements a comprehensive Role-Based Access Control (RBAC) system with three distinct user roles:

- **User** (default): Regular customers who can browse products, place orders, and manage their profile
- **Sub Admin**: Limited admin access - can add, update, and view products but cannot delete
- **Super Admin**: Full admin access - can perform all operations including delete

## User Roles & Permissions

### User (role: 'user')
- Browse products
- Place orders
- Manage profile
- View own orders
- Add to wishlist/cart

### Sub Admin (role: 'sub_admin')
- All user permissions
- Add new products
- Update existing products
- View all products (including deleted)
- View all orders
- **Cannot delete products**
- **Cannot un-delete products**

### Super Admin (role: 'super_admin')
- All sub admin permissions
- Delete products (soft delete)
- Un-delete products
- Full system access

## Database Schema Changes

### User Model Updates
```javascript
// Old schema
{
  isAdmin: Boolean
}

// New schema
{
  role: {
    type: String,
    enum: ['user', 'sub_admin', 'super_admin'],
    default: 'user'
  }
}
```

## Backend Implementation

### Middleware Functions

#### `verifyToken`
- Verifies JWT token and attaches user to request
- Required for all protected routes

#### `verifyIsAdmin` (Legacy)
- Backward compatibility for old `isAdmin` checks
- Allows both `super_admin` and `sub_admin` roles

#### `verifyIsSuperAdmin`
- Restricts access to `super_admin` only
- Used for delete/un-delete operations

#### `verifyIsAdminRole`
- Allows both `super_admin` and `sub_admin` roles
- Used for general admin operations

#### `hasPermission(permission)`
- Granular permission checking
- Supports future permission extensions

### Product Routes Protection

```javascript
// Public routes (no auth required)
router.get("/", productController.getAll)
router.get("/:id", productController.getById)

// Admin routes (require authentication and appropriate permissions)
router.post("/", verifyToken, hasPermission('create_product'), productController.create)
router.patch("/:id", verifyToken, hasPermission('update_product'), productController.updateById)
router.patch("/undelete/:id", verifyToken, verifyIsSuperAdmin, productController.undeleteById)
router.delete("/:id", verifyToken, verifyIsSuperAdmin, productController.deleteById)
```

## Frontend Implementation

### Role Utility Functions

```javascript
// Check if user has admin role (super_admin or sub_admin)
isAdmin(user)

// Check if user is super admin
isSuperAdmin(user)

// Check if user is sub admin
isSubAdmin(user)

// Check if user can delete products (only super admin)
canDeleteProducts(user)

// Check if user can manage products (add, update)
canManageProducts(user)

// Get user role display name
getRoleDisplayName(user)
```

### UI Changes

#### Navbar
- Shows role-specific buttons (Super Admin, Sub Admin)
- Search bar only visible to admins
- Menu items change based on role

#### Admin Dashboard
- Delete/Un-delete buttons only visible to Super Admins
- Update buttons visible to all admins
- Product management accessible to both admin roles

## Migration Guide

### Step 1: Run Database Migration

```bash
cd backend
npm run migrate:roles
```

This script will:
- Find all users with the old `isAdmin` field
- Convert `isAdmin: true` → `role: 'super_admin'`
- Convert `isAdmin: false` → `role: 'user'`
- Remove the old `isAdmin` field

### Step 2: Update Seed Data

The seed data now includes test users for all roles:

```javascript
// Super Admin
{
  email: "superadmin@example.com",
  password: "password",
  role: "super_admin"
}

// Sub Admin
{
  email: "subadmin@example.com", 
  password: "password",
  role: "sub_admin"
}
```

### Step 3: Test Different Roles

1. **Login as Super Admin**:
   - Can see all admin features
   - Can delete/un-delete products
   - Full system access

2. **Login as Sub Admin**:
   - Can add/update products
   - Cannot see delete buttons
   - Limited admin access

3. **Login as User**:
   - Regular customer experience
   - No admin features visible

## API Response Codes

### Success Codes
- `200`: Operation successful
- `201`: Resource created successfully

### Error Codes
- `401`: Unauthorized (missing or invalid token)
- `403`: Forbidden (insufficient permissions)
- `404`: Resource not found
- `500`: Internal server error

### Example Error Responses

```json
// 401 - Unauthorized
{
  "message": "Token missing, please login again"
}

// 403 - Insufficient permissions
{
  "message": "Access denied. Super Admin only."
}

// 403 - Missing permission
{
  "message": "Access denied. Permission 'delete_product' required."
}
```

## Extending the System

### Adding New Roles

1. Update User model enum:
```javascript
role: {
  type: String,
  enum: ['user', 'sub_admin', 'super_admin', 'new_role'],
  default: 'user'
}
```

2. Add permissions in middleware:
```javascript
const permissions = {
  'super_admin': ['all'],
  'sub_admin': ['create_product', 'update_product', 'read_products'],
  'new_role': ['read_products', 'custom_permission'],
  'user': ['read_products', 'create_order']
}
```

3. Update frontend utility functions:
```javascript
export const isNewRole = (user) => {
  return user?.role === 'new_role';
};
```

### Adding New Permissions

1. Define permission in middleware
2. Use `hasPermission('new_permission')` in routes
3. Update frontend utility functions as needed

## Security Considerations

1. **Token-based Authentication**: All admin operations require valid JWT tokens
2. **Role Validation**: Server-side role checking prevents unauthorized access
3. **Permission Granularity**: Fine-grained permissions for different operations
4. **Backward Compatibility**: Old `isAdmin` checks still work during transition

## Testing Checklist

- [ ] Super Admin can perform all operations
- [ ] Sub Admin can add/update but not delete
- [ ] Regular users cannot access admin features
- [ ] Migration script works correctly
- [ ] Frontend shows appropriate UI based on role
- [ ] API returns proper error codes for unauthorized actions
- [ ] Backward compatibility maintained during transition

## Troubleshooting

### Common Issues

1. **Migration fails**: Ensure MongoDB connection is working
2. **Frontend not updating**: Clear browser cache and localStorage
3. **Permission errors**: Check if user role is correctly set in database
4. **Token issues**: Ensure cookies are being sent with requests

### Debug Commands

```bash
# Check user roles in database
db.users.find({}, {email: 1, role: 1, isAdmin: 1})

# Run migration manually
node migrations/updateUserRoles.js

# Check server logs for permission errors
npm run dev
```
