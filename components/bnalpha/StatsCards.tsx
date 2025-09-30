import { Card, CardContent } from "@/components/ui/card";

interface StatsCardsProps {
  calculateAllUsersTotal: (type: "cost" | "revenue") => number;
  calculateAllUsersPeriodStats: (type: "cost" | "revenue", days: number) => number;
}

export function StatsCards({ calculateAllUsersTotal, calculateAllUsersPeriodStats }: StatsCardsProps) {
  return (
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
  );
}