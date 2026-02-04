'use client';

import { useAdminSession } from '@/hooks/use-admin-session';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, role, logout, isLoading } = useAdminSession();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200">
        <div className="flex items-center h-16 px-6 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-900">SuiGate Admin</h1>
        </div>
        <nav className="p-4 space-y-2">
          <a
            href="/orders"
            className="block px-4 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100"
          >
            Orders
          </a>
          <a
            href="/users"
            className="block px-4 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100"
          >
            Users
          </a>
          <a
            href="/analytics"
            className="block px-4 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100"
          >
            Analytics
          </a>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="pl-64">
        {/* Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
          <div className="flex items-center space-x-4">
            <h2 className="text-lg font-semibold text-gray-900">Admin Dashboard</h2>
          </div>
          <div className="flex items-center space-x-4">
            {user && (
              <>
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-medium">
                    {role === 'admin' ? 'A' : 'S'}
                  </div>
                  <div className="text-sm">
                    <p className="font-medium text-gray-900">
                      {role === 'admin' ? 'Admin' : 'Support'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {user.suiAddress.slice(0, 6)}...{user.suiAddress.slice(-4)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={logout}
                  className="px-3 py-1.5 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
