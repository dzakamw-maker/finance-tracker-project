import { supabase } from '../lib/supabaseClient'
import { Trash2, MapPin, Calendar } from 'lucide-react'

export default function ItineraryList({ data, onSuccess, showToast }) {
  
  const handleDelete = async (id) => {
    if (!confirm('Hapus itinerary ini? Produk terkait juga akan dihapus.')) return;

    const { error } = await supabase
      .from('itineraries')
      .delete()
      .eq('id', id)

    if (error) {
      showToast('Gagal hapus: ' + error.message, 'error')
    } else {
      showToast('Itinerary dihapus', 'success')
      onSuccess()
    }
  }

  if (!data || data.length === 0) {
    return (
      <div className="rounded-2xl border p-12 text-center" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
        <span className="text-5xl mb-4 block">✈️</span>
        <p style={{ color: 'var(--text-secondary)' }}>Belum ada rencana itinerary.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4 animate-fade-in">
      {data.map((it) => {
        const total = it.itinerary_items?.reduce((sum, item) => sum + Number(item.estimated_amount), 0) || 0
        
        return (
          <div 
            key={it.id} 
            className="rounded-2xl border overflow-hidden p-5 transition-all hover:shadow-md"
            style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
          >
            <div className="flex justify-between items-start mb-4">
              <div className="space-y-1">
                <h3 className="text-lg font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                  <MapPin size={18} className="text-purple-500" /> {it.destination}
                </h3>
                <div className="flex items-center gap-4 text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
                  <span className="flex items-center gap-1">
                    <Calendar size={14} /> 
                    {it.planned_date ? new Date(it.planned_date).toLocaleDateString('id-ID') : 'Tanpa Tanggal'}
                  </span>
                  <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded-md">
                    {it.itinerary_items?.length || 0} Item
                  </span>
                </div>
              </div>
              <button
                onClick={() => handleDelete(it.id)}
                className="p-2 text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
              >
                <Trash2 size={18} />
              </button>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 space-y-2">
              {it.itinerary_items?.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span style={{ color: 'var(--text-secondary)' }}>{item.name}</span>
                  <span className="font-bold" style={{ color: 'var(--text-primary)' }}>
                    Rp {Number(item.estimated_amount).toLocaleString('id-ID')}
                  </span>
                </div>
              ))}
              <div className="border-t pt-2 mt-2 flex justify-between items-center" style={{ borderColor: 'var(--border-color)' }}>
                <span className="text-xs font-bold uppercase" style={{ color: 'var(--text-muted)' }}>Estimasi Total</span>
                <span className="text-lg font-black text-purple-600 dark:text-purple-400">
                  Rp {total.toLocaleString('id-ID')}
                </span>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
