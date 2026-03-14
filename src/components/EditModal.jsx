import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function EditModal({ transaction, onClose, onSuccess, showToast, paymentMethods, categories, subcategories }) {
  const [amount, setAmount] = useState(transaction.amount.toString())
  const [type, setType] = useState(transaction.type)
  const [paymentMethodId, setPaymentMethodId] = useState(transaction.payment_method_id || '')
  const [categoryId, setCategoryId] = useState(transaction.category_id || '')
  const [subcategoryId, setSubcategoryId] = useState(transaction.subcategory_id || '')

  const [date, setDate] = useState(transaction.date?.slice(0, 10) || '')
  const [note, setNote] = useState(transaction.note || '')
  const [loading, setLoading] = useState(false)

  // Filter options based on selections
  const availableCategories = categories.filter(c => c.type === type)
  const availableSubcategories = subcategories.filter(s => s.category_id === categoryId)

  const handleTypeChange = (newType) => {
    setType(newType)
    const newCats = categories.filter(c => c.type === newType)
    if (newCats.length > 0) {
      setCategoryId(newCats[0].id)
    } else {
      setCategoryId('')
    }
  }

  // Update subcategory options automatically when category changes
  useEffect(() => {
    // If current subcategory doesn't belong to the newly selected category, reset it
    const isValidSub = availableSubcategories.find(s => s.id === subcategoryId)
    if (!isValidSub) {
      if (availableSubcategories.length > 0) {
        setSubcategoryId(availableSubcategories[0].id)
      } else {
        setSubcategoryId('')
      }
    }
  }, [categoryId, availableSubcategories, subcategoryId])

  const handleSave = async (e) => {
    e.preventDefault()
    if (loading) return

    if (!paymentMethodId || !categoryId || !subcategoryId) {
      showToast('Mohon lengkapi Metode Pembayaran, Kategori, dan Subkategori.', 'error')
      return;
    }

    setLoading(true)

    const { data, error } = await supabase
      .from('transactions')
      .update({
        amount: parseFloat(amount),
        type,
        payment_method_id: paymentMethodId,
        category_id: categoryId,
        subcategory_id: subcategoryId,
        date,
        note: note.trim() || null,
      })
      .eq('id', transaction.id)
      .select()

    setLoading(false)

    if (error) {
      showToast('Gagal update: ' + error.message, 'error')
    } else if (!data || data.length === 0) {
      showToast('Update gagal — cek RLS policy di Supabase (perlu policy UPDATE)', 'error')
    } else {
      showToast('Transaksi berhasil diupdate! ✏️', 'success')
      onSuccess()
      onClose()
    }
  }

  const inputClass = `w-full rounded-lg border px-4 py-2.5 text-sm font-medium transition-all duration-200
    outline-none focus:ring-2 focus:ring-primary-400/30`

  const inputStyle = {
    backgroundColor: 'var(--input-bg)',
    borderColor: 'var(--input-border)',
    color: 'var(--text-primary)',
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSave}
        className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl border p-6 animate-scale-in"
        style={{
          backgroundColor: 'var(--bg-card)',
          borderColor: 'var(--border-color)',
          boxShadow: 'var(--shadow-xl)',
        }}
      >
        <div className="flex items-center justify-between mb-5 sticky top-0 bg-white dark:bg-gray-900 pb-2 z-10" style={{ backgroundColor: 'var(--bg-card)' }}>
          <h2 className="text-lg font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <span className="w-8 h-8 rounded-lg bg-primary-500 text-white flex items-center justify-center text-sm">
              ✏️
            </span>
            Edit Transaksi
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg transition-all duration-200 cursor-pointer
              hover:bg-gray-100 dark:hover:bg-gray-700 active:scale-90"
            style={{ color: 'var(--text-muted)' }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          {/* Nominal */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-muted)' }}>
              Nominal (Rp)
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className={inputClass}
              style={inputStyle}
              required
              min="1"
            />
          </div>

          {/* Tipe */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-muted)' }}>
              Arus Kas
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleTypeChange('outcome')}
                className={`py-2.5 rounded-lg text-sm font-semibold border-2 transition-all duration-200 cursor-pointer
                  ${type === 'outcome'
                    ? 'bg-red-50 border-red-300 text-red-700 dark:bg-red-500/15 dark:border-red-500/40 dark:text-red-400'
                    : 'border-transparent hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                style={type !== 'outcome' ? { color: 'var(--text-secondary)', backgroundColor: 'var(--input-bg)', borderColor: 'var(--input-border)' } : {}}
              >
                📉 Pengeluaran
              </button>
              <button
                type="button"
                onClick={() => handleTypeChange('income')}
                className={`py-2.5 rounded-lg text-sm font-semibold border-2 transition-all duration-200 cursor-pointer
                  ${type === 'income'
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-700 dark:bg-emerald-500/15 dark:border-emerald-500/40 dark:text-emerald-400'
                    : 'border-transparent hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                style={type !== 'income' ? { color: 'var(--text-secondary)', backgroundColor: 'var(--input-bg)', borderColor: 'var(--input-border)' } : {}}
              >
                📈 Pemasukan
              </button>
            </div>
          </div>

          {/* Metode Pembayaran */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-muted)' }}>
              Metode Pembayaran
            </label>
            <select
              value={paymentMethodId}
              onChange={(e) => setPaymentMethodId(e.target.value)}
              className={`${inputClass} cursor-pointer`}
              style={inputStyle}
              required
            >
              <option value="" disabled>-- Pilih Metode --</option>
              {paymentMethods.map(pm => (
                <option key={pm.id} value={pm.id}>
                  {pm.method_type === 'cash' ? '💵' : '📱'} {pm.name}
                </option>
              ))}
            </select>
          </div>

          {/* Kategori */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-muted)' }}>
              Kategori Utama
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className={`${inputClass} cursor-pointer`}
              style={inputStyle}
              required
            >
              <option value="" disabled>-- Pilih Kategori --</option>
              {availableCategories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          {/* Subkategori */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-muted)' }}>
              Sub-Kategori
            </label>
            <select
              value={subcategoryId}
              onChange={(e) => setSubcategoryId(e.target.value)}
              className={`${inputClass} cursor-pointer`}
              style={inputStyle}
              required
            >
              <option value="" disabled>-- Pilih Subkategori --</option>
              {availableSubcategories.map(sub => (
                <option key={sub.id} value={sub.id}>{sub.name}</option>
              ))}
            </select>
          </div>

          {/* Tanggal */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-muted)' }}>
              Tanggal
            </label>
            <input
              type="date"
              value={date}
              max={new Date().toISOString().slice(0, 10)}
              onChange={(e) => setDate(e.target.value)}
              className={`${inputClass} cursor-pointer`}
              style={inputStyle}
              required
            />
          </div>

          {/* Note */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-muted)' }}>
              Catatan <span className="normal-case font-normal">(opsional)</span>
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className={`${inputClass} resize-none`}
              style={inputStyle}
              rows={2}
              placeholder="Tambahkan catatan..."
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl font-semibold text-sm border transition-all duration-200 cursor-pointer
                hover:brightness-95 active:scale-[0.98]"
              style={{
                backgroundColor: 'var(--bg-secondary)',
                borderColor: 'var(--border-color)',
                color: 'var(--text-secondary)',
              }}
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-primary-600 hover:bg-primary-700 active:scale-[0.98] disabled:opacity-60
                text-white py-2.5 rounded-xl font-bold text-sm transition-all duration-200 cursor-pointer
                shadow-md hover:shadow-lg"
            >
              {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}

