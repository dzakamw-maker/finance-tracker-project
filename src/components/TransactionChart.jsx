import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import { Doughnut } from 'react-chartjs-2'

ChartJS.register(ArcElement, Tooltip, Legend)

export default function TransactionChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div
        className="rounded-2xl border p-8 text-center animate-fade-in flex flex-col items-center justify-center h-full min-h-[300px]"
        style={{
          backgroundColor: 'var(--bg-card)',
          borderColor: 'var(--border-color)',
          boxShadow: 'var(--shadow-md)',
        }}
      >
        <span className="text-4xl mb-3 block opacity-50">📊</span>
        <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
          Belum ada data untuk chart.
        </p>
      </div>
    )
  }

  const outcomes = data.filter(d => d.type === 'outcome')

  // Group by the nested category name
  const categoryTotals = outcomes.reduce((acc, curr) => {
    const catName = curr.categories?.name || 'Lainnya'
    acc[catName] = (acc[catName] || 0) + curr.amount
    return acc
  }, {})

  // Keep a vibrant palette for dynamic categories
  const vibrantColors = [
    '#F59E0B', '#3B82F6', '#8B5CF6', '#EC4899', '#F97316', '#06B6D4', '#E11D48', '#6366F1'
  ]

  const chartData = {
    labels: Object.keys(categoryTotals),
    datasets: [
      {
        data: Object.values(categoryTotals),
        backgroundColor: vibrantColors,
        borderColor: 'var(--bg-card)',
        borderWidth: 2,
        hoverOffset: 8,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '70%',
    plugins: {
      legend: {
        position: 'right',
        labels: {
          color: 'var(--text-secondary)',
          font: { family: 'Inter, sans-serif', size: 12, weight: '500' },
          usePointStyle: true,
          padding: 20,
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleFont: { family: 'Inter', size: 13, weight: '600' },
        bodyFont: { family: 'Inter', size: 13 },
        padding: 12,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          label: (context) => {
            const label = context.label || ''
            const value = context.raw
            return ` ${label}: Rp ${value.toLocaleString('id-ID')}`
          }
        }
      },
    },
  }

  return (
    <div
      className="rounded-2xl border p-6 animate-fade-in"
      style={{
        backgroundColor: 'var(--bg-card)',
        borderColor: 'var(--border-color)',
        boxShadow: 'var(--shadow-md)',
      }}
    >
      <h2 className="text-lg font-bold mb-6 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
        <span className="w-8 h-8 rounded-lg bg-primary-500 text-white flex items-center justify-center text-sm">
          📊
        </span>
        Analisis Pengeluaran
      </h2>
      <div className="h-64 sm:h-72 w-full flex justify-center">
        {outcomes.length === 0 ? (
          <div className="flex items-center justify-center h-full text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
            Belum ada pengeluaran.
          </div>
        ) : (
          <Doughnut data={chartData} options={options} />
        )}
      </div>
    </div>
  )
}