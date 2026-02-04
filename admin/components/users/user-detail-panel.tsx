'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { AdminUserDetailDto } from '../../types/users';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '../ui/sheet';
import { Button } from '../ui/button';
import { KycStatusBadge } from './kyc-status-badge';
import { AccountStatusBadge } from './account-status-badge';
import { UpdateKycDialog } from './update-kyc-dialog';
import { LockUserDialog } from './lock-user-dialog';
import { useUpdateKyc, useLockUser, useUnlockUser } from '../../hooks/use-users';
import { Separator } from '../ui/separator';
import { Check, X, Copy } from 'lucide-react';

interface UserDetailPanelProps {
  user: AdminUserDetailDto | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isAdmin?: boolean;
}

export function UserDetailPanel({ user, open, onOpenChange, isAdmin = false }: UserDetailPanelProps) {
  const router = useRouter();
  const [showKycDialog, setShowKycDialog] = useState(false);
  const [showLockDialog, setShowLockDialog] = useState(false);

  const updateKyc = useUpdateKyc();
  const lockUser = useLockUser();
  const unlockUser = useUnlockUser();

  if (!user) return null;

  const handleUpdateKyc = (kyc_status: string, reason?: string) => {
    updateKyc.mutate(
      { id: user.id, data: { kyc_status: kyc_status as any, reason } },
      {
        onSuccess: () => {
          setShowKycDialog(false);
        },
      }
    );
  };

  const handleLockUser = (reason: string) => {
    lockUser.mutate(
      { id: user.id, data: { reason } },
      {
        onSuccess: () => {
          setShowLockDialog(false);
        },
      }
    );
  };

  const handleUnlockUser = () => {
    if (confirm('Are you sure you want to unlock this user?')) {
      unlockUser.mutate(user.id);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>User Details</SheetTitle>
            <SheetDescription>Complete user information and actions</SheetDescription>
          </SheetHeader>

          <div className="mt-6 space-y-6">
            {/* User Info */}
            <div className="space-y-3">
              <h3 className="font-semibold text-lg">User Information</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="col-span-2">
                  <span className="text-gray-500">Sui Address:</span>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="font-mono text-xs break-all">{user.sui_address}</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 shrink-0"
                      onClick={() => copyToClipboard(user.sui_address)}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <div>
                  <span className="text-gray-500">Google ID:</span>
                  <p className="font-mono text-xs mt-1">{user.google_id || '—'}</p>
                </div>
                <div>
                  <span className="text-gray-500">KYC Status:</span>
                  <div className="mt-1">
                    <KycStatusBadge status={user.kyc_status} />
                  </div>
                </div>
                <div>
                  <span className="text-gray-500">Location Verified:</span>
                  <div className="mt-1">
                    {user.location_verified ? (
                      <Check className="h-5 w-5 text-green-600" />
                    ) : (
                      <X className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                </div>
                <div>
                  <span className="text-gray-500">Account Status:</span>
                  <div className="mt-1">
                    <AccountStatusBadge isLocked={user.is_locked} />
                  </div>
                </div>
              </div>
            </div>

            {/* Lock Info */}
            {user.is_locked && user.lock_reason && (
              <>
                <Separator />
                <div className="space-y-3">
                  <h3 className="font-semibold text-lg">Lock Information</h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-500">Locked At:</span>
                      <p className="mt-1">{new Date(user.locked_at!).toLocaleString()}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Reason:</span>
                      <p className="mt-1 text-red-600">{user.lock_reason}</p>
                    </div>
                  </div>
                </div>
              </>
            )}

            <Separator />

            {/* Stats */}
            <div className="space-y-3">
              <h3 className="font-semibold text-lg">Statistics</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-500">Total Orders:</span>
                  <p className="font-medium mt-1">{user.order_count}</p>
                </div>
                <div>
                  <span className="text-gray-500">Total Volume:</span>
                  <p className="font-medium mt-1">{user.total_volume_usdc.toFixed(2)} USDC</p>
                </div>
                <div>
                  <span className="text-gray-500">Joined:</span>
                  <p className="mt-1">{new Date(user.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Bank Accounts */}
            <div className="space-y-3">
              <h3 className="font-semibold text-lg">Bank Accounts</h3>
              {user.bank_accounts.length === 0 ? (
                <p className="text-sm text-gray-500">No bank accounts</p>
              ) : (
                <div className="space-y-2">
                  {user.bank_accounts.map((account) => (
                    <div key={account.id} className="p-3 border rounded-md text-sm">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{account.account_holder}</p>
                          <p className="text-gray-500 text-xs mt-1">
                            {account.bank_code}
                          </p>
                        </div>
                        {account.is_primary && (
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                            Primary
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Separator />

            {/* Recent Orders */}
            <div className="space-y-3">
              <h3 className="font-semibold text-lg">Recent Orders</h3>
              {user.recent_orders.length === 0 ? (
                <p className="text-sm text-gray-500">No orders</p>
              ) : (
                <div className="space-y-2">
                  {user.recent_orders.map((order) => (
                    <div
                      key={order.id}
                      className="p-3 border rounded-md text-sm hover:bg-gray-50 cursor-pointer"
                      onClick={() => {
                        router.push(`/orders?orderId=${order.id}`);
                        onOpenChange(false);
                      }}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-mono text-xs text-gray-500">{order.id}</p>
                          <p className="font-medium mt-1">
                            {order.amount_usdc ? `${order.amount_usdc.toFixed(2)} USDC` : '—'}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500">{order.order_type}</p>
                          <p className="text-xs mt-1">{order.status}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Admin Actions */}
            {isAdmin && (
              <>
                <Separator />
                <div className="space-y-3">
                  <h3 className="font-semibold text-lg">Admin Actions</h3>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setShowKycDialog(true)}
                      disabled={updateKyc.isPending}
                    >
                      Update KYC
                    </Button>
                    {user.is_locked ? (
                      <Button
                        variant="outline"
                        onClick={handleUnlockUser}
                        disabled={unlockUser.isPending}
                      >
                        Unlock User
                      </Button>
                    ) : (
                      <Button
                        variant="destructive"
                        onClick={() => setShowLockDialog(true)}
                        disabled={lockUser.isPending}
                      >
                        Lock User
                      </Button>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </SheetContent>
      </Sheet>

      <UpdateKycDialog
        open={showKycDialog}
        onOpenChange={setShowKycDialog}
        currentStatus={user.kyc_status}
        onSubmit={handleUpdateKyc}
        isLoading={updateKyc.isPending}
      />

      <LockUserDialog
        open={showLockDialog}
        onOpenChange={setShowLockDialog}
        onSubmit={handleLockUser}
        isLoading={lockUser.isPending}
      />
    </>
  );
}
