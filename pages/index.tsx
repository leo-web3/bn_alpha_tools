import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Pencil, Trash2 } from "lucide-react";
import React, { useEffect, useState } from "react";

interface PointRecord {
  date: string;
  balanceReward: number;
  tradeReward: number;
  activityPoints: number;
  claimCost: number;
}

interface CostRecord {
  date: string;
  fee: number;
}

interface RevenueRecord {
  date: string;
  amount: number;
}

interface User {
  id: string;
  name: string;
  pointRecords: PointRecord[];
  costRecords: CostRecord[];
  revenueRecords: RevenueRecord[];
}

export default function Home() {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [newUserName, setNewUserName] = useState("");
  const [editingUserId, setEditingUserId] = useState<string>("");
  const [editingUserName, setEditingUserName] = useState("");

  useEffect(() => {
    const savedUsers = localStorage.getItem("bnAlphaUsers");
    if (savedUsers) {
      setUsers(JSON.parse(savedUsers));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("bnAlphaUsers", JSON.stringify(users));
  }, [users]);

  const addUser = () => {
    if (newUserName.trim()) {
      const today = new Date();
      const pointRecords: PointRecord[] = [];

      for (let i = 15; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        pointRecords.push({
          date: date.toISOString().split("T")[0],
          balanceReward: 0,
          tradeReward: 0,
          activityPoints: 0,
          claimCost: 0,
        });
      }

      const newUser: User = {
        id: Date.now().toString(),
        name: newUserName,
        pointRecords,
        costRecords: [],
        revenueRecords: [],
      };
      setUsers([...users, newUser]);
      setNewUserName("");
    }
  };

  const deleteUser = (userId: string) => {
    setUsers(users.filter((u) => u.id !== userId));
    if (selectedUserId === userId) {
      setSelectedUserId("");
    }
  };

  const startEditUser = (userId: string, userName: string) => {
    setEditingUserId(userId);
    setEditingUserName(userName);
  };

  const saveEditUser = () => {
    if (editingUserName.trim() && editingUserId) {
      setUsers(
        users.map((u) => (u.id === editingUserId ? { ...u, name: editingUserName.trim() } : u))
      );
      setEditingUserId("");
      setEditingUserName("");
    }
  };

  const cancelEditUser = () => {
    setEditingUserId("");
    setEditingUserName("");
  };

  const getCurrentCyclePoints = (records: PointRecord[]) => {
    const today = new Date().toISOString().split("T")[0];
    const todayDate = new Date(today);
    const fifteenDaysAgo = new Date(todayDate);
    fifteenDaysAgo.setDate(todayDate.getDate() - 15);
    const cutoffDate = fifteenDaysAgo.toISOString().split("T")[0];

    const cycleRecords = records.filter((r) => r.date >= cutoffDate && r.date < today);

    const totalBalance = cycleRecords.reduce((sum, r) => sum + r.balanceReward, 0);
    const totalTrade = cycleRecords.reduce((sum, r) => sum + r.tradeReward, 0);
    const totalActivity = cycleRecords.reduce((sum, r) => sum + r.activityPoints, 0);
    const totalClaim = cycleRecords.reduce((sum, r) => sum + r.claimCost, 0);

    return totalBalance + totalTrade + totalActivity - totalClaim;
  };

  const getTomorrowPreviewPoints = (records: PointRecord[]) => {
    const today = new Date();
    const todayDate = today.toISOString().split("T")[0];

    const todayRecord = records.find((r) => r.date === todayDate);
    if (!todayRecord) return null;

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const fifteenDaysFromTomorrow = new Date(tomorrow);
    fifteenDaysFromTomorrow.setDate(tomorrow.getDate() - 15);
    const cutoffDate = fifteenDaysFromTomorrow.toISOString().split("T")[0];

    const cycleRecords = records.filter((r) => r.date >= cutoffDate && r.date <= todayDate);

    const totalBalance = cycleRecords.reduce((sum, r) => sum + r.balanceReward, 0);
    const totalTrade = cycleRecords.reduce((sum, r) => sum + r.tradeReward, 0);
    const totalActivity = cycleRecords.reduce((sum, r) => sum + r.activityPoints, 0);
    const totalClaim = cycleRecords.reduce((sum, r) => sum + r.claimCost, 0);

    return totalBalance + totalTrade + totalActivity - totalClaim;
  };

  const calculatePeriodStats = (
    records: { date: string; fee?: number; amount?: number }[],
    days: number
  ) => {
    const now = new Date();
    const startDate = new Date(now);
    startDate.setDate(now.getDate() - days);

    return records
      .filter((r) => new Date(r.date) >= startDate)
      .reduce((sum, r) => sum + (r.fee || r.amount || 0), 0);
  };

  const calculateAllUsersPeriodStats = (type: "cost" | "revenue", days: number) => {
    return users.reduce((total, user) => {
      const records = type === "cost" ? user.costRecords : user.revenueRecords;
      return total + calculatePeriodStats(records, days);
    }, 0);
  };

  const formatDate = (dateStr: string) => {
    const [, month, day] = dateStr.split("-");
    return `${month}-${day}`;
  };

  const getAllDates = () => {
    const datesSet = new Set<string>();
    users.forEach((user) => {
      user.pointRecords.forEach((r) => datesSet.add(r.date));
      user.costRecords.forEach((r) => datesSet.add(r.date));
      user.revenueRecords.forEach((r) => datesSet.add(r.date));
    });
    return Array.from(datesSet).sort((a, b) => b.localeCompare(a));
  };

  const updatePointCell = (
    userId: string,
    date: string,
    field: keyof PointRecord,
    value: number
  ) => {
    setUsers(
      users.map((u) => {
        if (u.id === userId) {
          const existingIndex = u.pointRecords.findIndex((r) => r.date === date);
          if (existingIndex >= 0) {
            const updated = [...u.pointRecords];
            updated[existingIndex] = { ...updated[existingIndex], [field]: value };
            return { ...u, pointRecords: updated };
          } else {
            const newRecord: PointRecord = {
              date,
              balanceReward: 0,
              tradeReward: 0,
              activityPoints: 0,
              claimCost: 0,
              [field]: value,
            };
            return { ...u, pointRecords: [...u.pointRecords, newRecord] };
          }
        }
        return u;
      })
    );
  };

  const updateCostCell = (userId: string, date: string, value: number) => {
    setUsers(
      users.map((u) => {
        if (u.id === userId) {
          const existingIndex = u.costRecords.findIndex((r) => r.date === date);
          if (existingIndex >= 0) {
            const updated = [...u.costRecords];
            updated[existingIndex] = { date, fee: value };
            return { ...u, costRecords: updated };
          } else {
            return { ...u, costRecords: [...u.costRecords, { date, fee: value }] };
          }
        }
        return u;
      })
    );
  };

  const updateRevenueCell = (userId: string, date: string, value: number) => {
    setUsers(
      users.map((u) => {
        if (u.id === userId) {
          const existingIndex = u.revenueRecords.findIndex((r) => r.date === date);
          if (existingIndex >= 0) {
            const updated = [...u.revenueRecords];
            updated[existingIndex] = { date, amount: value };
            return { ...u, revenueRecords: updated };
          } else {
            return { ...u, revenueRecords: [...u.revenueRecords, { date, amount: value }] };
          }
        }
        return u;
      })
    );
  };

  const [newDate, setNewDate] = useState(new Date().toISOString().split("T")[0]);

  const exportData = () => {
    const allDates = getAllDates();
    let csvContent = "\uFEFF";

    csvContent += "日期,";
    users.forEach((user) => {
      csvContent += `${user.name}-余额,${user.name}-交易,${user.name}-活动,${user.name}-消耗,${user.name}-积分合计,${user.name}-磨损,${user.name}-收益,`;
    });
    csvContent += "\n";

    allDates.forEach((date) => {
      csvContent += `${date},`;
      users.forEach((user) => {
        const pointRecord = user.pointRecords.find((r) => r.date === date);
        const costRecord = user.costRecords.find((r) => r.date === date);
        const revenueRecord = user.revenueRecords.find((r) => r.date === date);
        const total = pointRecord
          ? pointRecord.balanceReward +
            pointRecord.tradeReward +
            pointRecord.activityPoints -
            pointRecord.claimCost
          : 0;

        csvContent += `${pointRecord?.balanceReward || 0},`;
        csvContent += `${pointRecord?.tradeReward || 0},`;
        csvContent += `${pointRecord?.activityPoints || 0},`;
        csvContent += `${pointRecord?.claimCost || 0},`;
        csvContent += `${total},`;
        csvContent += `${costRecord?.fee || 0},`;
        csvContent += `${revenueRecord?.amount || 0},`;
      });
      csvContent += "\n";
    });

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `bn_alpha_data_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedUsers = JSON.parse(e.target?.result as string);
        if (Array.isArray(importedUsers)) {
          setUsers(importedUsers);
        } else {
          alert("导入文件格式不正确");
        }
      } catch {
        alert("导入失败，请检查文件格式");
      }
    };
    reader.readAsText(file);
  };

  const calculateAllUsersTotal = (type: "cost" | "revenue") => {
    return users.reduce((total, user) => {
      const records = type === "cost" ? user.costRecords : user.revenueRecords;
      return total + records.reduce((sum, r) => sum + ("fee" in r ? r.fee : r.amount), 0);
    }, 0);
  };

  return (
    <div
      className="min-h-screen w-screen p-4 md:p-8"
      style={{ backgroundColor: "hsl(var(--background))", color: "hsl(var(--foreground))" }}
    >
      <div className="w-full max-w-full mx-auto space-y-6">
        <h1 className="text-3xl font-bold mb-8">BN Alpha 多用户数据预览工具</h1>
        {users.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border-l-4 border-l-red-500 shadow-lg">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">总磨损</p>
                    <p className="text-3xl font-bold text-red-600">
                      ${calculateAllUsersTotal("cost").toFixed(2)}
                    </p>
                  </div>
                  <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
                    <span className="text-2xl">💸</span>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-2 pt-4 border-t">
                  <div className="text-center">
                    <p className="text-[10px] text-muted-foreground mb-1">15天</p>
                    <p className="text-sm font-semibold text-red-600">
                      ${calculateAllUsersPeriodStats("cost", 15).toFixed(0)}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] text-muted-foreground mb-1">30天</p>
                    <p className="text-sm font-semibold text-red-600">
                      ${calculateAllUsersPeriodStats("cost", 30).toFixed(0)}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] text-muted-foreground mb-1">90天</p>
                    <p className="text-sm font-semibold text-red-600">
                      ${calculateAllUsersPeriodStats("cost", 90).toFixed(0)}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] text-muted-foreground mb-1">365天</p>
                    <p className="text-sm font-semibold text-red-600">
                      ${calculateAllUsersPeriodStats("cost", 365).toFixed(0)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-green-500 shadow-lg">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">总收益</p>
                    <p className="text-3xl font-bold text-green-600">
                      ${calculateAllUsersTotal("revenue").toFixed(2)}
                    </p>
                  </div>
                  <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                    <span className="text-2xl">💰</span>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-2 pt-4 border-t">
                  <div className="text-center">
                    <p className="text-[10px] text-muted-foreground mb-1">15天</p>
                    <p className="text-sm font-semibold text-green-600">
                      ${calculateAllUsersPeriodStats("revenue", 15).toFixed(0)}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] text-muted-foreground mb-1">30天</p>
                    <p className="text-sm font-semibold text-green-600">
                      ${calculateAllUsersPeriodStats("revenue", 30).toFixed(0)}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] text-muted-foreground mb-1">90天</p>
                    <p className="text-sm font-semibold text-green-600">
                      ${calculateAllUsersPeriodStats("revenue", 90).toFixed(0)}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] text-muted-foreground mb-1">365天</p>
                    <p className="text-sm font-semibold text-green-600">
                      ${calculateAllUsersPeriodStats("revenue", 365).toFixed(0)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
        <div className="flex gap-2 items-end">
          <div className="flex-1">
            <label className="text-sm font-medium mb-1 block">添加新用户</label>
            <Input
              value={newUserName}
              onChange={(e) => setNewUserName(e.target.value)}
              placeholder="输入用户名"
              onKeyPress={(e) => e.key === "Enter" && addUser()}
            />
          </div>
          <Button onClick={addUser}>添加用户</Button>
        </div>

        <AlertDialog open={!!editingUserId} onOpenChange={(open) => !open && cancelEditUser()}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>编辑用户名</AlertDialogTitle>
              <AlertDialogDescription>修改用户名称</AlertDialogDescription>
            </AlertDialogHeader>
            <Input
              value={editingUserName}
              onChange={(e) => setEditingUserName(e.target.value)}
              placeholder="输入新用户名"
              onKeyPress={(e) => e.key === "Enter" && saveEditUser()}
            />
            <AlertDialogFooter>
              <AlertDialogCancel onClick={cancelEditUser}>取消</AlertDialogCancel>
              <AlertDialogAction onClick={saveEditUser}>保存</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <div className="mb-4 flex flex-col w-full gap-2">
          <label className="text-sm font-medium mb-1 block">添加新日期</label>

          <div className="flex-1 flex gap-2 flex-col lg:flex-row">
            <div className="flex gap-2 w-full">
              <Input
                type="text"
                placeholder="YYYY-MM-DD"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
              />
              <Button
                onClick={() => {
                  if (newDate && !getAllDates().includes(newDate)) {
                    setUsers(
                      users.map((user) => ({
                        ...user,
                        pointRecords: [
                          ...user.pointRecords,
                          {
                            date: newDate,
                            balanceReward: 0,
                            tradeReward: 0,
                            activityPoints: 0,
                            claimCost: 0,
                          },
                        ],
                      }))
                    );
                    setNewDate(new Date().toISOString().split("T")[0]);
                  }
                }}
              >
                添加日期
              </Button>
            </div>
            <div className="flex gap-2 w-full lg:w-auto">
              <Button onClick={exportData} variant="outline">
                导出数据
              </Button>
              <Button variant="outline">
                <label className="cursor-pointer">
                  导入数据
                  <input type="file" accept=".json" className="hidden" onChange={importData} />
                </label>
              </Button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto max-h-[70vh] overflow-y-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="border-b">
                <th className="p-2 text-left sticky left-0 bg-white border-r font-medium shadow-[2px_0_5px_rgba(0,0,0,0.1)] z-10">
                  日期
                </th>
                {users.map((user) => (
                  <th key={user.id} colSpan={7} className="p-2 text-center border-r">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <span className="font-medium">{user.name}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          startEditUser(user.id, user.name);
                        }}
                        className="h-5 w-5"
                      >
                        <Pencil className="h-3 w-3" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => e.stopPropagation()}
                            className="h-5 w-5"
                          >
                            <Trash2 className="h-3 w-3 text-destructive" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>确认删除</AlertDialogTitle>
                            <AlertDialogDescription>
                              确定要删除用户 &quot;{user.name}&quot;
                              吗？此操作将删除该用户的所有数据且无法恢复。
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>取消</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteUser(user.id);
                              }}
                            >
                              删除
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                    <div className="text-xs font-semibold flex flex-col gap-0.5">
                      <div>
                        <span className="text-blue-600">
                          积分: {getCurrentCyclePoints(user.pointRecords)}
                        </span>
                        {getTomorrowPreviewPoints(user.pointRecords) !== null && (
                          <span className="text-green-600 ml-2">
                            明天: {getTomorrowPreviewPoints(user.pointRecords)}
                          </span>
                        )}
                      </div>
                      <div className="flex gap-2 justify-center">
                        <span className="text-red-600">
                          磨损: ${user.costRecords.reduce((sum, r) => sum + r.fee, 0).toFixed(2)}
                        </span>
                        <span className="text-green-600">
                          收益: $
                          {user.revenueRecords.reduce((sum, r) => sum + r.amount, 0).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </th>
                ))}
              </tr>
              <tr className="border-b bg-muted/30">
                <th className="p-2 sticky left-0 bg-white shadow-[2px_0_5px_rgba(0,0,0,0.1)] z-10"></th>
                {users.map((user) => (
                  <React.Fragment key={user.id}>
                    <th className="p-1 text-center text-[10px]">余额</th>
                    <th className="p-1 text-center text-[10px]">交易</th>
                    <th className="p-1 text-center text-[10px]">活动</th>
                    <th className="p-1 text-center text-[10px]">消耗</th>
                    <th className="p-1 text-center text-[10px] bg-blue-50">合计</th>
                    <th className="p-1 text-center text-[10px] bg-red-50">磨损</th>
                    <th className="p-1 text-center text-[10px] border-r bg-green-50">收益</th>
                  </React.Fragment>
                ))}
              </tr>
            </thead>
            <tbody>
              {getAllDates().map((date) => (
                <tr key={date} className="border-b hover:bg-muted/20">
                  <td className="p-2 sticky left-0 bg-white border-r font-medium whitespace-nowrap shadow-[2px_0_5px_rgba(0,0,0,0.1)] z-10">
                    {formatDate(date)}
                  </td>
                  {users.map((user) => {
                    const record = user.pointRecords.find((r) => r.date === date);
                    const costRecord = user.costRecords.find((r) => r.date === date);
                    const revenueRecord = user.revenueRecords.find((r) => r.date === date);
                    const total = record
                      ? record.balanceReward +
                        record.tradeReward +
                        record.activityPoints -
                        record.claimCost
                      : 0;
                    return (
                      <React.Fragment key={user.id}>
                        <td className="p-0">
                          <input
                            type="number"
                            className="min-w-10 w-full h-8 px-1 text-center border-0 bg-transparent focus:bg-yellow-50"
                            value={record?.balanceReward || ""}
                            onChange={(e) =>
                              updatePointCell(
                                user.id,
                                date,
                                "balanceReward",
                                Number(e.target.value) || 0
                              )
                            }
                            placeholder="0"
                          />
                        </td>
                        <td className="p-0">
                          <input
                            type="number"
                            className="min-w-10 w-full h-8 px-1 text-center border-0 bg-transparent focus:bg-yellow-50"
                            value={record?.tradeReward || ""}
                            onChange={(e) =>
                              updatePointCell(
                                user.id,
                                date,
                                "tradeReward",
                                Number(e.target.value) || 0
                              )
                            }
                            placeholder="0"
                          />
                        </td>
                        <td className="p-0">
                          <input
                            type="number"
                            className="min-w-10 w-full h-8 px-1 text-center border-0 bg-transparent focus:bg-yellow-50"
                            value={record?.activityPoints || ""}
                            onChange={(e) =>
                              updatePointCell(
                                user.id,
                                date,
                                "activityPoints",
                                Number(e.target.value) || 0
                              )
                            }
                            placeholder="0"
                          />
                        </td>
                        <td className="p-0">
                          <input
                            type="number"
                            className="min-w-10 w-full h-8 px-1 text-center border-0 bg-transparent focus:bg-yellow-50"
                            value={record?.claimCost || ""}
                            onChange={(e) =>
                              updatePointCell(
                                user.id,
                                date,
                                "claimCost",
                                Number(e.target.value) || 0
                              )
                            }
                            placeholder="0"
                          />
                        </td>
                        <td className="p-0 text-center bg-blue-50 font-semibold">
                          <div className="min-w-10 w-full h-8 flex items-center justify-center">
                            <span
                              className={
                                total > 0 ? "text-green-600" : total < 0 ? "text-red-600" : ""
                              }
                            >
                              {total}
                            </span>
                          </div>
                        </td>
                        <td className="p-0 bg-red-50/30">
                          <input
                            type="number"
                            step="0.01"
                            className="min-w-10 w-full h-8 px-1 text-center border-0 bg-transparent focus:bg-yellow-50"
                            value={costRecord?.fee || ""}
                            onChange={(e) =>
                              updateCostCell(user.id, date, Number(e.target.value) || 0)
                            }
                            placeholder="0.00"
                          />
                        </td>
                        <td className="p-0 border-r bg-green-50/30">
                          <input
                            type="number"
                            step="0.01"
                            className="min-w-10 w-full h-8 px-1 text-center border-0 bg-transparent focus:bg-yellow-50"
                            value={revenueRecord?.amount || ""}
                            onChange={(e) =>
                              updateRevenueCell(user.id, date, Number(e.target.value) || 0)
                            }
                            placeholder="0.00"
                          />
                        </td>
                      </React.Fragment>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
