import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User } from "@/types";

interface BatchUpdateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  users: User[];
  batchDate: string;
  setBatchDate: (date: string) => void;
  selectedUserIds: string[];
  toggleUserSelection: (userId: string) => void;
  toggleAllUsers: () => void;
  batchValues: {
    balanceReward: number;
    tradeReward: number;
    activityPoints: number;
    claimCost: number;
    cost: number;
    revenue: number;
  };
  setBatchValues: (values: any) => void;
  onApply: () => void;
}

export function BatchUpdateDialog({
  open,
  onOpenChange,
  users,
  batchDate,
  setBatchDate,
  selectedUserIds,
  toggleUserSelection,
  toggleAllUsers,
  batchValues,
  setBatchValues,
  onApply,
}: BatchUpdateDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle>批量添加数据</AlertDialogTitle>
          <AlertDialogDescription>为所有用户添加相同的数据</AlertDialogDescription>
        </AlertDialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1 block">日期</label>
            <Input
              type="text"
              placeholder="YYYY-MM-DD"
              value={batchDate}
              onChange={(e) => setBatchDate(e.target.value)}
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium">选择用户</label>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleAllUsers}
                className="h-auto py-1 px-2"
              >
                {selectedUserIds.length === users.length ? "取消全选" : "全选"}
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto border rounded p-2">
              {users.map((user) => (
                <label
                  key={user.id}
                  className="flex items-center gap-2 cursor-pointer hover:bg-muted/50 p-1 rounded"
                >
                  <input
                    type="checkbox"
                    checked={selectedUserIds.includes(user.id)}
                    onChange={() => toggleUserSelection(user.id)}
                    className="cursor-pointer"
                  />
                  <span className="text-sm">{user.name}</span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">积分数据</label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">余额</label>
                <Input
                  type="number"
                  value={batchValues.balanceReward}
                  onChange={(e) =>
                    setBatchValues({ ...batchValues, balanceReward: Number(e.target.value) })
                  }
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">交易</label>
                <Input
                  type="number"
                  value={batchValues.tradeReward}
                  onChange={(e) =>
                    setBatchValues({ ...batchValues, tradeReward: Number(e.target.value) })
                  }
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">活动</label>
                <Input
                  type="number"
                  value={batchValues.activityPoints}
                  onChange={(e) =>
                    setBatchValues({ ...batchValues, activityPoints: Number(e.target.value) })
                  }
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">消耗</label>
                <Input
                  type="number"
                  value={batchValues.claimCost}
                  onChange={(e) =>
                    setBatchValues({ ...batchValues, claimCost: Number(e.target.value) })
                  }
                />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">磨损 (USD)</label>
              <Input
                type="number"
                step="0.01"
                value={batchValues.cost}
                onChange={(e) =>
                  setBatchValues({ ...batchValues, cost: Number(e.target.value) })
                }
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">收益 (USD)</label>
              <Input
                type="number"
                step="0.01"
                value={batchValues.revenue}
                onChange={(e) =>
                  setBatchValues({ ...batchValues, revenue: Number(e.target.value) })
                }
              />
            </div>
          </div>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel>取消</AlertDialogCancel>
          <AlertDialogAction onClick={onApply} disabled={selectedUserIds.length === 0}>
            应用到选中用户 ({selectedUserIds.length})
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}