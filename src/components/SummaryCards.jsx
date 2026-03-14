export default function SummaryCards({ transactions }) {
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0)

  const totalExpense = transactions
    .filter(t => t.type === 'outcome')
    .reduce((sum, t) => sum + t.amount, 0)

  const netBalance = totalIncome - totalExpense

  const cards = [
    {
      label: 'Total Pemasukan',
      amount: totalIncome,
      icon: '📈',
      colorClass: 'text-emerald-600 dark:text-emerald-400',
      bgClass: 'bg-emerald-50 dark:bg-emerald-500/10',
      borderClass: 'border-emerald-200 dark:border-emerald-500/20',
      prefix: '+',
    },
    {
      label: 'Total Pengeluaran',
      amount: totalExpense,
      icon: '📉',
      colorClass: 'text-red-600 dark:text-red-400',
      bgClass: 'bg-red-50 dark:bg-red-500/10',
      borderClass: 'border-red-200 dark:border-red-500/20',
      prefix: '-',
    },
    {
      label: 'Saldo Bersih',
      amount: Math.abs(netBalance),
      icon: '💰',
      colorClass: netBalance >= 0
        ? 'text-blue-600 dark:text-blue-400'
        : 'text-red-600 dark:text-red-400',
      bgClass: netBalance >= 0
        ? 'bg-blue-50 dark:bg-blue-500/10'
        : 'bg-red-50 dark:bg-red-500/10',
      borderClass: netBalance >= 0
        ? 'border-blue-200 dark:border-blue-500/20'
        : 'border-red-200 dark:border-red-500/20',
      prefix: netBalance >= 0 ? '+' : '-',
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {cards.map((card, i) => (
        <div
          key={card.label}
          className={`rounded-xl border p-5 transition-all duration-300 
            hover:-translate-y-1 hover:shadow-lg cursor-default animate-fade-in
            ${card.bgClass} ${card.borderClass}`}
          style={{ animationDelay: `${i * 100}ms`, animationFillMode: 'both' }}
        >
          <div className="flex items-center gap-3 mb-3">
            <span className="text-2xl">{card.icon}</span>
            <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
              {card.label}
            </span>
          </div>
          <p className={`text-2xl font-bold tracking-tight ${card.colorClass}`}>
            {card.prefix}Rp {card.amount.toLocaleString('id-ID')}
          </p>
        </div>
      ))}
    </div>
  )
}
