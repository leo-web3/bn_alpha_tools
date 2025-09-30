import { PointRecord, User, CostRecord, RevenueRecord } from "@/types";

export function getCurrentCyclePoints(records: PointRecord[]): number {
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
}

export function getTomorrowPreviewPoints(records: PointRecord[]): number | null {
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
}

export function calculatePeriodStats(
  records: { date: string; fee?: number; amount?: number }[],
  days: number
): number {
  const now = new Date();
  const startDate = new Date(now);
  startDate.setDate(now.getDate() - days);

  return records
    .filter((r) => new Date(r.date) >= startDate)
    .reduce((sum, r) => sum + (r.fee || r.amount || 0), 0);
}

export function calculateAllUsersPeriodStats(
  users: User[],
  type: "cost" | "revenue",
  days: number
): number {
  return users.reduce((total, user) => {
    const records = type === "cost" ? user.costRecords : user.revenueRecords;
    return total + calculatePeriodStats(records, days);
  }, 0);
}

export function calculateAllUsersTotal(users: User[], type: "cost" | "revenue"): number {
  return users.reduce((total, user) => {
    const records = type === "cost" ? user.costRecords : user.revenueRecords;
    return total + records.reduce((sum, r) => sum + ("fee" in r ? r.fee : r.amount), 0);
  }, 0);
}

export function formatDate(dateStr: string): string {
  const [, month, day] = dateStr.split("-");
  return `${month}-${day}`;
}

export function getAllDates(users: User[]): string[] {
  const datesSet = new Set<string>();
  users.forEach((user) => {
    user.pointRecords.forEach((r) => datesSet.add(r.date));
    user.costRecords.forEach((r) => datesSet.add(r.date));
    user.revenueRecords.forEach((r) => datesSet.add(r.date));
  });
  return Array.from(datesSet).sort();
}

export function exportToCSV(users: User[], allDates: string[]): void {
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
}