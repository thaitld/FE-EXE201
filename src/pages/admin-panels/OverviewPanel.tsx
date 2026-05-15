import { DollarSign, ShoppingCart, TrendingUp, Activity } from 'lucide-react'

interface RecentSale {
  name: string
  email: string
  amount: string
  avatar: string
}

export const OverviewPanel = ({ recentSales }: { recentSales: RecentSale[] }) => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {[
        { label: 'Total Revenue', value: '$45,231.89', change: '+20.1% from last month', icon: DollarSign, color: 'text-slate-600' },
        { label: 'Subscriptions', value: '+2350', change: '+180.1% from last month', icon: ShoppingCart, color: 'text-blue-600' },
        { label: 'Sales', value: '+12,234', change: '+19% from last month', icon: TrendingUp, color: 'text-green-600' },
        { label: 'Active Now', value: '+573', change: '+201 since last hour', icon: Activity, color: 'text-purple-600' },
      ].map((stat, idx) => {
        const Icon = stat.icon
        return (
          <div key={idx} className="bg-white rounded-lg border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium text-slate-600">{stat.label}</p>
              <Icon className={`${stat.color} opacity-70`} size={18} />
            </div>
            <p className="text-2xl font-bold text-slate-900 mb-2">{stat.value}</p>
            <p className="text-xs text-slate-500">{stat.change}</p>
          </div>
        )
      })}
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 bg-white rounded-lg border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Overview</h3>

        <div className="flex items-end justify-between h-64 gap-2">
          {[
            { month: 'Jan', value: 40 },
            { month: 'Feb', value: 50 },
            { month: 'Mar', value: 45 },
            { month: 'Apr', value: 60 },
            { month: 'May', value: 65 },
            { month: 'Jun', value: 35 },
            { month: 'Jul', value: 40 },
            { month: 'Aug', value: 50 },
            { month: 'Sep', value: 45 },
            { month: 'Oct', value: 60 },
            { month: 'Nov', value: 70 },
            { month: 'Dec', value: 65 },
          ].map((data, idx) => (
            <div key={idx} className="flex-1 flex flex-col items-center gap-2">
              <div
                className="w-full bg-slate-900 rounded-t transition hover:bg-slate-800"
                style={{ height: `${(data.value / 70) * 100}%` }}
              />
              <span className="text-xs text-slate-500">{data.month}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Recent Sales</h3>
        <p className="text-sm text-slate-600 mb-4">You made 265 sales this month.</p>

        <div className="space-y-4">
          {recentSales.map((sale, idx) => (
            <div key={idx} className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-slate-300 to-slate-400 flex items-center justify-center text-xs font-bold text-slate-900">
                {sale.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900">{sale.name}</p>
                <p className="text-xs text-slate-500 truncate">{sale.email}</p>
              </div>
              <p className="text-sm font-semibold text-slate-900">{sale.amount}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
)
