export default function DebtList({ data, onSuccess, showToast, paymentMethods = [], categories = [], subcategories = [] }) {
  
  const handleLunas = async (debt) => {
    if (!confirm('Tandai sebagai lunas? Record ini akan berpindah ke Pengeluaran/Pemasukan.')) return;

    // We need these to satisfy DB constraints if any
    const type = debt.type === 'debt' ? 'outcome' : 'income';
    const defaultPM = paymentMethods[0]?.id;
    const defaultCat = categories.find(c => c.type === type)?.id;
    const defaultSub = subcategories.find(s => s.category_id === defaultCat)?.id;

    if (!defaultPM || !defaultCat || !defaultSub) {
      showToast('Gagal lunas: Mohon pastikan Kategori dan Metode Pembayaran sudah diatur di Pengaturan.', 'error')
      return;
    }

    try {
      // 1. Create transaction record
      const { error: txError } = await supabase
        .from('transactions')
        .insert([{
          user_id: debt.user_id,
          amount: debt.amount,
          type: type,
          payment_method_id: defaultPM,
          category_id: defaultCat,
          subcategory_id: defaultSub,
          date: new Date().toISOString().slice(0, 10),
          note: `Lunas: ${debt.note || (debt.type === 'debt' ? 'Utang' : 'Piutang')}`,
        }])

      if (txError) throw txError;

      // 2. Delete the debt record
      const { error: delError } = await supabase
        .from('debts')
        .delete()
        .eq('id', debt.id)

      if (delError) throw delError;

      showToast('Berhasil dilunasi!', 'success')
      onSuccess()
    } catch (err) {
      showToast('Gagal lunas: ' + err.message, 'error')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Hapus catatan ini? Tindakan ini tidak akan merubah statistik keuangan.')) return;

    const { error } = await supabase
      .from('debts')
      .delete()
      .eq('id', id)

    if (error) {
      showToast('Gagal hapus: ' + error.message, 'error')
    } else {
      showToast('Catatan dihapus', 'success')
      onSuccess()
    }
  }

  if (!data || data.length === 0) {
    return (
      <div className="rounded-2xl border p-12 text-center" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
        <span className="text-5xl mb-4 block">🤝</span>
        <p style={{ color: 'var(--text-secondary)' }}>Tidak ada catatan utang/piutang.</p>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border overflow-hidden" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
      <div className="p-5 border-b" style={{ borderColor: 'var(--border-color)' }}>
        <h2 className="text-lg font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
          <span className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center text-sm">📋</span>
          Daftar Utang & Piutang
        </h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr style={{ backgroundColor: 'var(--bg-secondary)' }}>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase" style={{ color: 'var(--text-muted)' }}>Tipe & Tanggal</th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase" style={{ color: 'var(--text-muted)' }}>Catatan</th>
              <th className="px-5 py-3 text-right text-xs font-semibold uppercase" style={{ color: 'var(--text-muted)' }}>Nominal</th>
              <th className="px-5 py-3 text-center text-xs font-semibold uppercase" style={{ color: 'var(--text-muted)' }}>Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y" style={{ borderColor: 'var(--border-color)' }}>
            {data.map((item) => (
              <tr key={item.id} className="hover:brightness-95 dark:hover:brightness-110 transition-all">
                <td className="px-5 py-4">
                  <div className="flex flex-col">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-md w-fit mb-1 ${
                      item.type === 'debt' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      {item.type === 'debt' ? 'Utang' : 'Piutang'}
                    </span>
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      Deadline: {item.due_date ? new Date(item.due_date).toLocaleDateString('id-ID') : '-'}
                    </span>
                  </div>
                </td>
                <td className="px-5 py-4">
                  <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{item.note || '-'}</p>
                </td>
                <td className="px-5 py-4 text-right">
                  <span className={`text-sm font-bold ${item.type === 'debt' ? 'text-amber-600' : 'text-emerald-600'}`}>
                    Rp {item.amount.toLocaleString('id-ID')}
                  </span>
                </td>
                <td className="px-5 py-4 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => handleLunas(item)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold transition-all cursor-pointer shadow-sm"
                    >
                      Lunas
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-1.5 rounded-lg border hover:bg-red-50 text-gray-400 hover:text-red-500 transition-all cursor-pointer"
                      style={{ borderColor: 'var(--border-color)' }}
                    >
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
