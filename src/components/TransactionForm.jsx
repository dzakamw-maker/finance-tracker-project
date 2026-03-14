import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function TransactionForm({ onSuccess, showToast, paymentMethods, categories, subcategories }) {
  const [amount, setAmount] = useState('')
  const [type, setType] = useState('outcome')

  // New dynamic states
  const [paymentMethodId, setPaymentMethodId] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [subcategoryId, setSubcategoryId] = useState('')

  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)

  // Filter options based on selections
  const availableCategories = categories.filter(c => c.type === type)
  const availableSubcategories = subcategories.filter(s => s.category_id === categoryId)

  // Reset dependents when selections change to prevent invalid states
  useEffect(() => {
    setCategoryId('')
    setSubcategoryId('')
  }, [type])

  useEffect(() => {
    setSubcategoryId('')
  }, [categoryId])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (loading) return

    if (!paymentMethodId || !categoryId || !subcategoryId) {
      showToast('Mohon pastikan Metode Pembayaran, Kategori, dan Subkategori sudah dipilih. Jika kosong, tambahkan di Pengaturan.', 'error')
      return;
    }

    setLoading(true)

    const { error } = await supabase
      .from('transactions')
      .insert([
        {
          amount: parseFloat(amount),
          type,
          payment_method_id: paymentMethodId,
          category_id: categoryId,
          subcategory_id: subcategoryId,
          date,
          note: note.trim() || null,
        }
      ])

    setLoading(false)

    if (error) {
      showToast('Gagal simpan: ' + error.message, 'error')
    } else {
      onSuccess()
      showToast('Transaksi berhasil disimpan! 🎉', 'success')
      setAmount('')
      setNote('')
      setDate(new Date().toISOString().slice(0, 10))
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
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border p-6 animate-fade-in"
      style={{
        backgroundColor: 'var(--bg-card)',
        borderColor: 'var(--border-color)',
        boxShadow: 'var(--shadow-md)',
      }}
    >
      <h2
        className="text-lg font-bold mb-5 flex items-center gap-2"
        style={{ color: 'var(--text-primary)' }}
      >
        <span className="w-8 h-8 rounded-lg bg-primary-500 text-white flex items-center justify-center text-sm">
          +
        </span>
        Catat Transaksi
      </h2>

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
            placeholder="Contoh: 50000"
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
              onClick={() => setType('outcome')}
              className={`py-2.5 rounded-lg text-sm font-semibold border-2 transition-all duration-200 cursor-pointer
                ${type === 'outcome'
                  ? 'bg-red-50 border-red-300 text-red-700 dark:bg-red-500/15 dark:border-red-500/40 dark:text-red-400'
                  : 'border-transparent hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              style={type !== 'outcome' ? {
                color: 'var(--text-secondary)',
                backgroundColor: 'var(--input-bg)',
                borderColor: 'var(--input-border)',
              } : {}}
            >
              📉 Pengeluaran
            </button>
            <button
              type="button"
              onClick={() => setType('income')}
              className={`py-2.5 rounded-lg text-sm font-semibold border-2 transition-all duration-200 cursor-pointer
                ${type === 'income'
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-700 dark:bg-emerald-500/15 dark:border-emerald-500/40 dark:text-emerald-400'
                  : 'border-transparent hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              style={type !== 'income' ? {
                color: 'var(--text-secondary)',
                backgroundColor: 'var(--input-bg)',
                borderColor: 'var(--input-border)',
              } : {}}
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
            {paymentMethods.length === 0 && <option value="">Belum ada metode</option>}
            {paymentMethods.length > 0 && <option value="" disabled hidden>Pilih Metode Pembayaran</option>}
            {paymentMethods.map(pm => (
              <option key={pm.id} value={pm.id}>
                {pm.method_type === 'cash' ? '💵' : '📱'} {pm.name}
              </option>
            ))}
          </select>
        </div>

        {/* Kategori Induk */}
        {paymentMethodId && (
          <div className="animate-fade-in">
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
              {availableCategories.length === 0 && <option value="">Tidak ada kategori</option>}
              {availableCategories.length > 0 && <option value="" disabled hidden>Pilih Kategori Utama</option>}
              {availableCategories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
        )}

        {/* Sub-Kategori */}
        {paymentMethodId && categoryId && (
          <div className="animate-fade-in">
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
              {availableSubcategories.length === 0 && <option value="">Tidak ada subkategori</option>}
              {availableSubcategories.length > 0 && <option value="" disabled hidden>Pilih Sub-Kategori</option>}
              {availableSubcategories.map(sub => (
                <option key={sub.id} value={sub.id}>{sub.name}</option>
              ))}
            </select>
          </div>
        )}

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

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary-600 hover:bg-primary-700 active:scale-[0.98] disabled:opacity-60
            text-white py-3 rounded-xl font-bold transition-all duration-200 cursor-pointer
            shadow-md hover:shadow-lg mt-2"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Menyimpan...
            </span>
          ) : (
            'Simpan Transaksi'
          )}
        </button>
      </div>
    </form>
  )
}