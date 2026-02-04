'use client';

import { useState } from 'react';
import type { AdminOrderDto } from '../../types/orders';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '../ui/sheet';
import { Button } from '../ui/button';
import { OrderStatusBadge } from './order-status-badge';
import { OrderTypeBadge } from './order-type-badge';
import { UpdateStatusDialog } from './update-status-dialog';
import { useUpdateOrderStatus, useConfirmPayment, useDispenseUsdc, useDisburseVnd } from '../../hooks/use-orders';
import { Separator } from '../ui/separator';

interface OrderDetailPanelProps {
  order: AdminOrderDto | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function OrderDetailPanel({ order, open, onOpenChange }: OrderDetailPanelProps) {
  const [showStatusDialog, setShowStatusDialog] = useState(false);

  const updateStatus = useUpdateOrderStatus();
  const confirmPayment = useConfirmPayment();
  const dispenseUsdc = useDispenseUsdc();
  const disburseVnd = useDisburseVnd();

  if (!order) return null;

  const handleUpdateStatus = (status: string, reason?: string) => {
    updateStatus.mutate(
      { id: order.id, data: { status: status as any, reason } },
      {
        onSuccess: () => {
          setShowStatusDialog(false);
        },
      }
    );
  };

  const handleConfirmPayment = () => {
    if (confirm('Confirm payment for this order?')) {
      confirmPayment.mutate(order.id);
    }
  };

  const handleDispenseUsdc = () => {
    if (confirm('Dispense USDC for this order?')) {
      dispenseUsdc.mutate(order.id);
    }
  };

  const handleDisburseVnd = () => {
    if (confirm('Disburse VND for this order?')) {
      disburseVnd.mutate(order.id);
    }
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Order Details</SheetTitle>
            <SheetDescription>Complete order information and actions</SheetDescription>
          </SheetHeader>

          <div className="mt-6 space-y-6">
            {/* Order Info */}
            <div className="space-y-3">
              <h3 className="font-semibold text-lg">Order Information</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-500">Order ID:</span>
                  <p className="font-mono text-xs mt-1 break-all">{order.id}</p>
                </div>
                <div>
                  <span className="text-gray-500">Type:</span>
                  <div className="mt-1">
                    <OrderTypeBadge type={order.order_type} />
                  </div>
                </div>
                <div>
                  <span className="text-gray-500">Status:</span>
                  <div className="mt-1">
                    <OrderStatusBadge status={order.status} />
                  </div>
                </div>
                <div>
                  <span className="text-gray-500">Manual Review:</span>
                  <p className="mt-1">{order.needs_manual_review ? 'Yes' : 'No'}</p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Amounts */}
            <div className="space-y-3">
              <h3 className="font-semibold text-lg">Amounts</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-500">USDC Amount:</span>
                  <p className="font-medium mt-1">
                    {order.amount_usdc ? `${order.amount_usdc.toFixed(2)} USDC` : '—'}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500">VND Amount:</span>
                  <p className="font-medium mt-1">
                    {order.amount_vnd
                      ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.amount_vnd)
                      : '—'}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500">Rate:</span>
                  <p className="mt-1">{order.rate.toLocaleString()}</p>
                </div>
                {order.target_rate && (
                  <div>
                    <span className="text-gray-500">Target Rate:</span>
                    <p className="mt-1">{order.target_rate.toLocaleString()}</p>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* User Info */}
            <div className="space-y-3">
              <h3 className="font-semibold text-lg">User Information</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-500">Sui Address:</span>
                  <p className="font-mono text-xs mt-1 break-all">{order.user_sui_address}</p>
                </div>
                <div>
                  <span className="text-gray-500">KYC Status:</span>
                  <p className="mt-1 capitalize">{order.user_kyc_status}</p>
                </div>
              </div>
            </div>

            {/* Bank Account (for sell orders) */}
            {order.bank_account_id && (
              <>
                <Separator />
                <div className="space-y-3">
                  <h3 className="font-semibold text-lg">Bank Account</h3>
                  <div className="text-sm">
                    <span className="text-gray-500">Bank Code:</span>
                    <p className="mt-1">{order.bank_code || '—'}</p>
                  </div>
                </div>
              </>
            )}

            <Separator />

            {/* Blockchain Info */}
            <div className="space-y-3">
              <h3 className="font-semibold text-lg">Blockchain & Payment</h3>
              <div className="space-y-2 text-sm">
                {order.escrow_object_id && (
                  <div>
                    <span className="text-gray-500">Escrow Object ID:</span>
                    <p className="font-mono text-xs mt-1 break-all">{order.escrow_object_id}</p>
                  </div>
                )}
                {order.sepay_reference && (
                  <div>
                    <span className="text-gray-500">Sepay Reference:</span>
                    <p className="font-mono text-xs mt-1">{order.sepay_reference}</p>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Timestamps */}
            <div className="space-y-3">
              <h3 className="font-semibold text-lg">Timestamps</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-500">Created:</span>
                  <p className="mt-1">{new Date(order.created_at).toLocaleString()}</p>
                </div>
                <div>
                  <span className="text-gray-500">Updated:</span>
                  <p className="mt-1">{new Date(order.updated_at).toLocaleString()}</p>
                </div>
                {order.expires_at && (
                  <div className="col-span-2">
                    <span className="text-gray-500">Expires:</span>
                    <p className="mt-1">{new Date(order.expires_at).toLocaleString()}</p>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Admin Actions */}
            <div className="space-y-3">
              <h3 className="font-semibold text-lg">Admin Actions</h3>
              <div className="flex flex-col gap-2">
                <Button onClick={() => setShowStatusDialog(true)} className="w-full">
                  Update Status
                </Button>

                {order.order_type === 'buy' && order.status === 'pending' && (
                  <Button
                    onClick={handleConfirmPayment}
                    variant="outline"
                    disabled={confirmPayment.isPending}
                    className="w-full"
                  >
                    {confirmPayment.isPending ? 'Confirming...' : 'Confirm Payment'}
                  </Button>
                )}

                {order.order_type === 'buy' && order.status === 'paid' && (
                  <Button
                    onClick={handleDispenseUsdc}
                    variant="outline"
                    disabled={dispenseUsdc.isPending}
                    className="w-full"
                  >
                    {dispenseUsdc.isPending ? 'Dispensing...' : 'Dispense USDC'}
                  </Button>
                )}

                {['quick_sell', 'smart_sell'].includes(order.order_type) && order.status === 'processing' && (
                  <Button
                    onClick={handleDisburseVnd}
                    variant="outline"
                    disabled={disburseVnd.isPending}
                    className="w-full"
                  >
                    {disburseVnd.isPending ? 'Disbursing...' : 'Disburse VND'}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <UpdateStatusDialog
        open={showStatusDialog}
        onOpenChange={setShowStatusDialog}
        currentStatus={order.status}
        onConfirm={handleUpdateStatus}
        isLoading={updateStatus.isPending}
      />
    </>
  );
}
