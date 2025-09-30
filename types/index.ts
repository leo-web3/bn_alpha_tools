export interface PointRecord {
  date: string;
  balanceReward: number;
  tradeReward: number;
  activityPoints: number;
  claimCost: number;
}

export interface CostRecord {
  date: string;
  fee: number;
}

export interface RevenueRecord {
  date: string;
  amount: number;
}

export interface User {
  id: string;
  name: string;
  pointRecords: PointRecord[];
  costRecords: CostRecord[];
  revenueRecords: RevenueRecord[];
}