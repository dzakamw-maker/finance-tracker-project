import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../contexts/AuthContext'

export default function DebtForm({ onSuccess, showToast }) {
  const { session } = useAuth()
  const [amount, setAmount] = useState('')
  const [type, setType] = useState('debt') // 'debt' or 'receivable'
  const [dueDate, setDueDate] = useState('')
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (loading) return

    setLoading(true)
    const { error } = await supabase
      .from('debts')
      .insert([
        {
          user_id: session?.user?.id,
          amount: parseFloat(amount),
          type,
          due_date: dueDate || null,
          note: note.trim() || null,
          status: 'unpaid'
        }
      ])

    setLoading(false)

    if (error) {
      showToast('Gagal simpan: ' + error.message, 'error')
    } else {
      onSuccess()
      showToast(`${type === 'debt' ? 'Utang' : 'Piutang'} berhasil dicatat!`, 'success')
      setAmount('')
      setNote('')
      setDueDate('')
    }
  }

  const inputClass = `w-full rounded-lg border px-4 py-2.5 text-sm font-medium transition-all duration-200
    outline-none focus:ring-2 focus:ring-amber-400/30`

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
      <h2 className="text-lg font-bold mb-5 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
        <span className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center text-sm">
          🤝
        </span>
        Catat Utang/Piutang
      </h2>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-muted)' }}>
            Jenis
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setType('debt')}
              className={`py-2.5 rounded-lg text-sm font-semibold border-2 transition-all duration-200 cursor-pointer
                ${type === 'debt'
                  ? 'bg-amber-50 border-amber-300 text-amber-700 dark:bg-amber-500/15 dark:border-amber-500/40 dark:text-amber-400'
                  : 'border-transparent hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              style={type !== 'debt' ? inputStyle : {}}
            >
              💸 Saya Berhutang
            </button>
            <button
              type="button"
              onClick={() => setType('receivable')}
              className={`py-2.5 rounded-lg text-sm font-semibold border-2 transition-all duration-200 cursor-pointer
                ${type === 'receivable'
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-700 dark:bg-emerald-500/15 dark:border-emerald-500/40 dark:text-emerald-400'
                  : 'border-transparent hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              style={type !== 'receivable' ? inputStyle : {}}
            >
              💰 Orang Piutang
            </button>
          </div>
        </div>

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
            placeholder="Contoh: 100000"
            required
            min="1"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-muted)' }}>
            Jatuh Tempo <span className="normal-case font-normal">(opsional)</span>
          </label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className={inputClass}
            style={inputStyle}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-muted)' }}>
            Catatan
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className={`${inputClass} resize-none`}
            style={inputStyle}
            rows={2}
            placeholder="Keterangan utang/piutang..."
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-amber-600 hover:bg-amber-700 active:scale-[0.98] disabled:opacity-60
            text-white py-3 rounded-xl font-bold transition-all duration-200 cursor-pointer shadow-md mt-2"
        >
          {loading ? 'Menyimpan...' : 'Simpan Catatan'}
        </button>
      </div>
    </form>
  )
}
