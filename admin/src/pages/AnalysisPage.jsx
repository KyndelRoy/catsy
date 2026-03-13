import { useState } from 'react'
import { BarChart3, TrendingUp, Package, Lightbulb } from 'lucide-react'

export default function AnalysisPage() {
  const [range, setRange] = useState('week')

  const sections = [
    {
      title: 'Demand Forecast',
      description: 'Predicted top-selling products for the selected period',
      icon: BarChart3,
    },
    {
      title: 'Revenue Forecast',
      description: 'Actual vs predicted revenue trends',
      icon: TrendingUp,
    },
    {
      title: 'Stock Depletion',
      description: 'Estimated days until materials run out',
      icon: Package,
    },
    {
      title: 'Recommended Actions',
      description: 'AI-generated suggestions based on sales and stock data',
      icon: Lightbulb,
    },
  ]

  return (
    <div className="space-y-4 pb-20 lg:pb-0">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Analysis & Predictions</h1>
        <select
          value={range}
          onChange={(e) => setRange(e.target.value)}
          className="px-3 py-2 rounded-lg border text-sm outline-none"
          style={{
            backgroundColor: 'var(--bg-surface)',
            borderColor: 'var(--border-color)',
            color: 'var(--text-primary)',
          }}
        >
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="custom">Custom Range</option>
        </select>
      </div>

      {/* Chart placeholders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {sections.map(({ title, description, icon: Icon }) => (
          <div
            key={title}
            className="rounded-xl border p-6"
            style={{
              backgroundColor: 'var(--bg-surface)',
              borderColor: 'var(--border-color)',
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <Icon size={18} style={{ color: 'var(--text-secondary)' }} />
              <h3 className="font-semibold">{title}</h3>
            </div>
            <p className="text-xs mb-6" style={{ color: 'var(--text-secondary)' }}>
              {description}
            </p>
            <div
              className="h-48 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: 'var(--bg-primary)' }}
            >
              <div className="text-center" style={{ color: 'var(--text-secondary)' }}>
                <BarChart3 size={32} className="mx-auto mb-2 opacity-20" />
                <p className="text-sm">Coming in Phase 4</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
