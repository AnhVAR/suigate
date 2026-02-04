'use client';

import { useState } from 'react';
import type { KycStatus } from '../../types/database.types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Label } from '../ui/label';

interface UpdateKycDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentStatus: KycStatus;
  onSubmit: (status: KycStatus, reason?: string) => void;
  isLoading?: boolean;
}

export function UpdateKycDialog({
  open,
  onOpenChange,
  currentStatus,
  onSubmit,
  isLoading,
}: UpdateKycDialogProps) {
  const [kycStatus, setKycStatus] = useState<KycStatus>(currentStatus);
  const [reason, setReason] = useState('');

  const handleSubmit = () => {
    onSubmit(kycStatus, reason || undefined);
    setReason('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update KYC Status</DialogTitle>
          <DialogDescription>
            Change the user's KYC status. This action will be logged.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>KYC Status</Label>
            <Select value={kycStatus} onValueChange={(value) => setKycStatus(value as KycStatus)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Reason (optional)</Label>
            <textarea
              id="reason"
              className="w-full min-h-[100px] rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter reason for KYC status change..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading || kycStatus === currentStatus}>
            {isLoading ? 'Updating...' : 'Update KYC'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
