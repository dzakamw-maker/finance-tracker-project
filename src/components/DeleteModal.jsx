export default function DeleteModal({ onConfirm, onCancel, loading }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
      onClick={!loading ? onCancel : undefined}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-2xl border p-6 text-center animate-scale-in"
        style={{
          backgroundColor: 'var(--bg-card)',
          borderColor: 'var(--border-color)',
          boxShadow: 'var(--shadow-xl)',
        }}
      >
        <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-500/15 text-red-600 dark:text-red-400 flex items-center justify-center text-3xl mx-auto mb-4">
          ⚠️
        </div>
        
        <h2 className="text-lg font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
          Hapus Transaksi?
        </h2>
        
        <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
          Apakah kamu yakin ingin menghapus transaksi ini?<br/>
          Data yang dihapus tidak dapat dikembalikan.
        </p>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl font-semibold text-sm border transition-all duration-200 cursor-pointer
              hover:brightness-95 active:scale-[0.98] disabled:opacity-60"
            style={{
              backgroundColor: 'var(--bg-secondary)',
              borderColor: 'var(--border-color)',
              color: 'var(--text-secondary)',
            }}
          >
            Batal
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 bg-red-600 hover:bg-red-700 active:scale-[0.98] disabled:opacity-60
              text-white py-2.5 rounded-xl font-bold text-sm transition-all duration-200 cursor-pointer
              shadow-md hover:shadow-lg"
          >
            {loading ? 'Menghapus...' : 'Hapus Transaksi'}
          </button>
        </div>
      </div>
    </div>
  )
}
