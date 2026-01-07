import { useSelector } from 'react-redux'
import type { RootState } from '@/lib/redux/store'

// Hook to get current user data
export function useUser() {
  return useSelector((state: RootState) => state.session.user)
}

// Hook to get current shop data
export function useShop() {
  return useSelector((state: RootState) => state.session.shop)
}

// Hook to get menus data
export function useMenus() {
  return useSelector((state: RootState) => state.session.menus)
}

// Hook to get modules data
export function useModules() {
  return useSelector((state: RootState) => state.session.modules)
}

// Hook to get permissions data
export function usePermissions() {
  return useSelector((state: RootState) => state.session.permissions)
}

// Hook to check if user has specific permission
export function useHasPermission(permissionCode: string) {
  const permissions = useSelector((state: RootState) => state.session.permissions)
  return permissions.some(permission => permission.code === permissionCode)
}

// Hook to check if user has access to specific module
export function useHasModule(moduleCode: string) {
  const modules = useSelector((state: RootState) => state.session.modules)
  return modules.some(module => module.code === moduleCode)
}

// Hook to get session loading state
export function useSessionLoading() {
  return useSelector((state: RootState) => state.session.isSessionLoaded)
}

// Hook to get all session data at once
export function useSessionData() {
  return useSelector((state: RootState) => state.session)
}

// Hook to check if user is authenticated
export function useIsAuthenticated() {
  const user = useSelector((state: RootState) => state.session.user)
  const isSessionLoaded = useSelector((state: RootState) => state.session.isSessionLoaded)
  return isSessionLoaded && !!user
}
