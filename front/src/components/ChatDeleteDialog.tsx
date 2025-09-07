import { AlertTriangle, Archive, Trash2 } from 'lucide-react';
import React from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface ChatDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  chatTitle: string;
  onConfirm: (type: 'archive' | 'hard') => Promise<void>;
  isDeleting: boolean;
}

export function ChatDeleteDialog({
  open,
  onOpenChange,
  chatTitle,
  onConfirm,
  isDeleting,
}: ChatDeleteDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            チャットを削除
          </DialogTitle>
          <DialogDescription>「{chatTitle}」をどのように削除しますか？</DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="border rounded-lg p-4">
            <div className="flex items-center gap-3 mb-2">
              <Archive className="h-4 w-4 text-blue-500" />
              <span className="font-medium">アーカイブ（推奨）</span>
            </div>
            <p className="text-sm text-muted-foreground">
              チャットをアーカイブします。後で復元することができます。
            </p>
          </div>

          <div className="border rounded-lg p-4 border-red-200">
            <div className="flex items-center gap-3 mb-2">
              <Trash2 className="h-4 w-4 text-red-500" />
              <span className="font-medium text-red-700">完全削除</span>
            </div>
            <p className="text-sm text-muted-foreground">
              チャットとすべてのメッセージを完全に削除します。この操作は取り消せません。
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isDeleting}>
            キャンセル
          </Button>
          <Button
            variant="outline"
            onClick={() => onConfirm('archive')}
            disabled={isDeleting}
            data-delete-action="archive"
            className="border-blue-200 text-blue-700 hover:bg-blue-50"
          >
            {isDeleting ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
                処理中...
              </>
            ) : (
              <>
                <Archive className="mr-2 h-4 w-4" />
                アーカイブ
              </>
            )}
          </Button>
          <Button variant="destructive" onClick={() => onConfirm('hard')} disabled={isDeleting}>
            {isDeleting ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-red-300 border-t-red-600" />
                削除中...
              </>
            ) : (
              <>
                <Trash2 className="mr-2 h-4 w-4" />
                完全削除
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
