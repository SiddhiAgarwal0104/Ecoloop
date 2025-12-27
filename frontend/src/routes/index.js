/**
 * Routes Index
 * Central export for all route components
 */

export { default as AdminRoutes } from './AdminRoutes';
export { default as ProtectedRoute, PublicRoute } from './ProtectedRoute';

/**
 * Route Paths Constants
 * Centralized route path definitions
 */
export const ROUTES = {
  // Admin Routes
  ADMIN: {
    BASE: '/admin',
    DASHBOARD: '/admin/dashboard',
    LOCALITIES: '/admin/localities',
    SUSTAINABILITY: '/admin/sustainability',
    NGOS: '/admin/ngos',
    RECYCLERS: '/admin/recyclers',
    REPORTS: '/admin/reports',
  },

  // Auth Routes (for future integration)
  AUTH: {
    LOGIN: '/login',
    LOGOUT: '/logout',
  },

  // Root
  ROOT: '/',
};

/**
 * Navigation Helper
 * Usage: navigateTo(ROUTES.ADMIN.DASHBOARD)
 */
export const navigateTo = (path) => {
  window.location.href = path;
};

export default ROUTES;