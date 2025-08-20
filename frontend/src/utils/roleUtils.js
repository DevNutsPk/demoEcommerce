// Role-based utility functions for frontend

// Check if user has admin role (super_admin or sub_admin)
export const isAdmin = (user) => {
  if (!user) return false;
  return user.role === 'super_admin' || user.role === 'sub_admin';
};

// Check if user is super admin
export const isSuperAdmin = (user) => {
  if (!user) return false;
  return user.role === 'super_admin';
};

// Check if user is sub admin
export const isSubAdmin = (user) => {
  if (!user) return false;
  return user.role === 'sub_admin';
};

// Check if user can delete products (only super admin)
export const canDeleteProducts = (user) => {
  return isSuperAdmin(user);
};

// Check if user can manage products (add, update)
export const canManageProducts = (user) => {
  return isAdmin(user);
};

// Check if user can manage orders
export const canManageOrders = (user) => {
  return isAdmin(user);
};

// Get user role display name
export const getRoleDisplayName = (user) => {
  if (!user) return 'User';
  
  switch (user.role) {
    case 'super_admin':
      return 'Super Admin';
    case 'sub_admin':
      return 'Sub Admin';
    default:
      return 'User';
  }
};

// Backward compatibility - check if user has admin access (legacy isAdmin field)
export const hasAdminAccess = (user) => {
  if (!user) return false;
  // Support both old isAdmin boolean and new role system
  return user.isAdmin === true || isAdmin(user);
};
