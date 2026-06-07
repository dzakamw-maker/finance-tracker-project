import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../contexts/AuthContext'
import { Plus, Trash2 } from 'lucide-react'

export default function ItineraryForm({ onSuccess, showToast }) {
  const { session } = useAuth()
  const [destination, setDestination] = useState('')
  const [plannedDate, setPlannedDate] = useState('')
  const [items, setItems] = useState([{ name: '', amount: '' }])
  const [loading, setLoading] = useState(false)

  const addItem = () => {
    setItems([...items, { name: '', amount: '' }])
  }

  const removeItem = (index) => {
    if (items.length === 1) return
    setItems(items.filter((_, i) => i !== index))
  }

  const updateItem = (index, field, value) => {
    const newItems = [...items]
    newItems[index][field] = value
    setItems(newItems)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (loading) return

    // Validation
    if (!destination) return showToast('Destinasi tidak boleh kosong', 'error')
    if (items.some(item => !item.name || !item.amount)) {
      return showToast('Semua rincian item harus diisi', 'error')
    }

    setLoading(true)
    try {
      // 1. Create itinerary
      const { data: itinerary, error: itError } = await supabase
        .from('itineraries')
        .insert([{
          user_id: session?.user?.id,
          destination,
          planned_date: plannedDate || null,
          status: 'planned'
        }])
        .select()
        .single()

      if (itError) throw itError

      // 2. Create itinerary items
      const itemsToInsert = items.map(item => ({
        itinerary_id: itinerary.id,
        name: item.name,
        estimated_amount: parseFloat(item.amount)
      }))

      const { error: itemsError } = await supabase
        .from('itinerary_items')
        .insert(itemsToInsert)

      if (itemsError) throw itemsError

      showToast('Itinerary berhasil disimpan! ✈️', 'success')
      setDestination('')
      setPlannedDate('')
      setItems([{ name: '', amount: '' }])
      onSuccess()
    } catch (err) {
      showToast('Gagal simpan: ' + err.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  const inputClass = `w-full rounded-lg border px-4 py-2 text-sm font-medium transition-all duration-200 outline-none focus:ring-2 focus:ring-purple-400/30`
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
        <span className="w-8 h-8 rounded-lg bg-purple-500 text-white flex items-center justify-center text-sm">
          ✈️
        </span>
        Buat Rencana Itinerary
      </h2>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-muted)' }}>
            Destinasi
          </label>
          <input
            type="text"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            className={inputClass}
            style={inputStyle}
            placeholder="Contoh: Liburan ke Bali"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-muted)' }}>
            Tanggal Rencana <span className="normal-case font-normal">(opsional)</span>
          </label>
          <input
            type="date"
            value={plannedDate}
            onChange={(e) => setPlannedDate(e.target.value)}
            className={inputClass}
            style={inputStyle}
          />
        </div>

        <div className="pt-2">
          <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-muted)' }}>
            Rincian Estimasi Biaya
          </label>
          <div className="space-y-2">
            {items.map((item, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  value={item.name}
                  onChange={(e) => updateItem(index, 'name', e.target.value)}
                  placeholder="Item (misal: Tiket)"
                  className="flex-1 rounded-lg border px-3 py-2 text-xs font-medium outline-none focus:ring-2 focus:ring-purple-400/30"
                  style={inputStyle}
                  required
                />
                <input
                  type="number"
                  value={item.amount}
                  onChange={(e) => updateItem(index, 'amount', e.target.value)}
                  placeholder="Rp"
                  className="w-24 sm:w-32 rounded-lg border px-3 py-2 text-xs font-medium outline-none focus:ring-2 focus:ring-purple-400/30"
                  style={inputStyle}
                  required
                />
                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  className="p-2 text-red-400 hover:text-red-500 transition-colors"
                  disabled={items.length === 1}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={addItem}
            className="mt-3 flex items-center gap-1.5 text-xs font-bold text-purple-600 hover:text-purple-700 transition-colors"
          >
            <Plus size={14} /> Tambah Item
          </button>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-purple-600 hover:bg-purple-700 active:scale-[0.98] disabled:opacity-60
            text-white py-3 rounded-xl font-bold transition-all duration-200 cursor-pointer shadow-md mt-2"
        >
          {loading ? 'Memproses...' : 'Simpan Itinerary'}
        </button>
      </div>
    </form>
  )
}
