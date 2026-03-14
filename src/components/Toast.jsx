const typeConfig = {
  success: {
    bg: 'bg-emerald-50 dark:bg-emerald-500/15',
    border: 'border-emerald-200 dark:border-emerald-500/30',
    text: 'text-emerald-800 dark:text-emerald-300',
    icon: '✅',
  },
  error: {
    bg: 'bg-red-50 dark:bg-red-500/15',
    border: 'border-red-200 dark:border-red-500/30',
    text: 'text-red-800 dark:text-red-300',
    icon: '❌',
  },
  info: {
    bg: 'bg-blue-50 dark:bg-blue-500/15',
    border: 'border-blue-200 dark:border-blue-500/30',
    text: 'text-blue-800 dark:text-blue-300',
    icon: 'ℹ️',
  },
}

export default function ToastContainer({ toasts, onDismiss }) {
  if (!toasts.length) return null

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      {toasts.map(toast => {
        const config = typeConfig[toast.type] || typeConfig.info
        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-xl border shadow-lg backdrop-blur-sm
              ${config.bg} ${config.border}
              ${toast.exiting ? 'animate-slide-out-right' : 'animate-slide-in-right'}`}
          >
            <span className="text-lg mt-0.5 shrink-0">{config.icon}</span>
            <p className={`text-sm font-medium flex-1 ${config.text}`}>
              {toast.message}
            </p>
            <button
              onClick={() => onDismiss(toast.id)}
              className="text-lg opacity-50 hover:opacity-100 transition-opacity shrink-0 cursor-pointer"
              style={{ color: 'var(--text-secondary)' }}
            >
              ×
            </button>
          </div>
        )
      })}
    </div>
  )
}
