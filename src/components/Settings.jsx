import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function Settings({ showToast, onBack }) {
  const [activeTab, setActiveTab] = useState('payment_methods') // 'payment_methods', 'categories', 'subcategories'
  const [loading, setLoading] = useState(true)
  const [paymentMethods, setPaymentMethods] = useState([])
  const [categories, setCategories] = useState([])
  const [subcategories, setSubcategories] = useState([])

  // Form states for adding new items
  const [newMethodName, setNewMethodName] = useState('')
  const [newMethodType, setNewMethodType] = useState('cashless')

  const [newCategoryName, setNewCategoryName] = useState('')
  const [newCategoryType, setNewCategoryType] = useState('outcome')

  const [newSubcategoryName, setNewSubcategoryName] = useState('')
  const [selectedCategoryId, setSelectedCategoryId] = useState('')

  const loadData = async () => {
    setLoading(true)
    try {
      // Fetch concurrently
      const [pmRes, catRes, subRes] = await Promise.all([
        supabase.from('payment_methods').select('*').order('name'),
        supabase.from('categories').select('*').order('type'), // group by income/outcome
        supabase.from('subcategories').select('*, categories(name, type)').order('name')
      ])

      if (pmRes.error) throw pmRes.error
      if (catRes.error) throw catRes.error
      if (subRes.error) throw subRes.error

      setPaymentMethods(pmRes.data)
      setCategories(catRes.data)
      setSubcategories(subRes.data)
    } catch (err) {
      showToast('Gagal memuat pengaturan: ' + err.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // HANDLERS (Add)
  const handleAddPaymentMethod = async (e) => {
    e.preventDefault()
    if (!newMethodName.trim()) return
    
    const { error } = await supabase.from('payment_methods').insert([
      { name: newMethodName.trim(), method_type: newMethodType }
    ])

    if (error) showToast('Gagal: ' + error.message, 'error')
    else {
      showToast('Metode pembayaran ditambahkan', 'success')
      setNewMethodName('')
      loadData()
    }
  }

  const handleAddCategory = async (e) => {
    e.preventDefault()
    if (!newCategoryName.trim()) return

    const { error } = await supabase.from('categories').insert([
      { name: newCategoryName.trim(), type: newCategoryType }
    ])

    if (error) showToast('Gagal: ' + error.message, 'error')
    else {
      showToast('Kategori utama ditambahkan', 'success')
      setNewCategoryName('')
      loadData()
    }
  }

  const handleAddSubcategory = async (e) => {
    e.preventDefault()
    if (!newSubcategoryName.trim() || !selectedCategoryId) {
      showToast('Harap isi nama dan pilih parent kategori', 'error')
      return
    }

    const { error } = await supabase.from('subcategories').insert([
      { name: newSubcategoryName.trim(), category_id: selectedCategoryId }
    ])

    if (error) showToast('Gagal: ' + error.message, 'error')
    else {
      showToast('Sub-kategori ditambahkan', 'success')
      setNewSubcategoryName('')
      loadData()
    }
  }

  // HANDLERS (Delete)
  const handleDelete = async (table, id) => {
    if (!window.confirm("Yakin ingin menghapus item ini? Transaksi lama yang terkait mungkin kehilangan data referensinya.")) return

    const { error } = await supabase.from(table).delete().eq('id', id)
    if (error) showToast('Gagal hapus: ' + error.message, 'error')
    else {
      showToast('Berhasil dihapus', 'info')
      loadData()
    }
  }

  // UI Helpers
  const inputClass = `w-full rounded-lg border px-4 py-2 text-sm font-medium transition-all duration-200 outline-none focus:ring-2 focus:ring-primary-400/30`
  const inputStyle = { backgroundColor: 'var(--input-bg)', borderColor: 'var(--input-border)', color: 'var(--text-primary)' }

  return (
    <div className="animate-fade-in">
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={onBack}
          className="p-2 rounded-xl border hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
        </button>
        <div>
          <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Pengaturan Data</h2>
          <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>Kelola Metode Pembayaran & Kategori</p>
        </div>
      </div>

      <div className="flex gap-2 mb-6 border-b" style={{ borderColor: 'var(--border-color)' }}>
        {['payment_methods', 'categories', 'subcategories'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors duration-200 ${
              activeTab === tab 
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent hover:text-primary-500'
            }`}
             style={activeTab !== tab ? { color: 'var(--text-muted)' } : {}}
          >
            {tab === 'payment_methods' ? '💳 Pembayaran' : tab === 'categories' ? '📁 Kategori Utama' : '📂 Sub-Kategori'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="py-20 text-center text-sm font-medium" style={{ color: 'var(--text-muted)' }}>Memuat pengaturan...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Left Col: ADD Form */}
          <div className="md:col-span-1 border rounded-2xl p-5 h-fit shadow-sm" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
            
            {/* ADD PAYMENT METHOD */}
            {activeTab === 'payment_methods' && (
              <form onSubmit={handleAddPaymentMethod} className="space-y-4">
                <h3 className="font-bold text-lg mb-2" style={{ color: 'var(--text-primary)' }}>Tambah Jenis Uang</h3>
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-muted)' }}>Nama (Contoh: BNI, Gopay)</label>
                  <input type="text" value={newMethodName} onChange={(e) => setNewMethodName(e.target.value)} required className={inputClass} style={inputStyle} />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-muted)' }}>Tipe Fisik</label>
                  <select value={newMethodType} onChange={(e) => setNewMethodType(e.target.value)} className={inputClass} style={inputStyle}>
                    <option value="cash">💵 Cash / Uang Fisik</option>
                    <option value="cashless">📱 Cashless / Digital</option>
                  </select>
                </div>
                <button type="submit" className="w-full bg-primary-600 hover:bg-primary-700 text-white py-2 rounded-lg font-bold text-sm transition-all shadow-md">
                  Simpan Metode
                </button>
              </form>
            )}

            {/* ADD CATEGORY */}
            {activeTab === 'categories' && (
              <form onSubmit={handleAddCategory} className="space-y-4">
                <h3 className="font-bold text-lg mb-2" style={{ color: 'var(--text-primary)' }}>Tambah Kategori Utama</h3>
                 <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>Grup besar pengeluaran/pemasukan. (Misal: Me Time, Sekolah).</p>
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-muted)' }}>Nama Kategori</label>
                  <input type="text" value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} required className={inputClass} style={inputStyle} />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-muted)' }}>Arus Uang</label>
                  <select value={newCategoryType} onChange={(e) => setNewCategoryType(e.target.value)} className={inputClass} style={inputStyle}>
                    <option value="outcome">📉 Pengeluaran</option>
                    <option value="income">📈 Pemasukan</option>
                  </select>
                </div>
                <button type="submit" className="w-full bg-primary-600 hover:bg-primary-700 text-white py-2 rounded-lg font-bold text-sm transition-all shadow-md">
                  Simpan Kategori
                </button>
              </form>
            )}

            {/* ADD SUBCATEGORY */}
            {activeTab === 'subcategories' && (
              <form onSubmit={handleAddSubcategory} className="space-y-4">
                <h3 className="font-bold text-lg mb-2" style={{ color: 'var(--text-primary)' }}>Tambah Sub-Kategori</h3>
                <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>Rincian dari kategori utama. (Misal: Uang jajan, Beli Skincare).</p>
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-muted)' }}>Kategori Induk</label>
                  <select value={selectedCategoryId} onChange={(e) => setSelectedCategoryId(e.target.value)} required className={inputClass} style={inputStyle}>
                    <option value="">-- Pilih Induk --</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.type === 'income' ? '📈' : '📉'} {c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-muted)' }}>Nama Sub-Kategori</label>
                  <input type="text" value={newSubcategoryName} onChange={(e) => setNewSubcategoryName(e.target.value)} required className={inputClass} style={inputStyle} />
                </div>
                <button type="submit" className="w-full bg-primary-600 hover:bg-primary-700 text-white py-2 rounded-lg font-bold text-sm transition-all shadow-md">
                  Simpan Sub-Kategori
                </button>
              </form>
            )}

          </div>

          {/* Right Col: LIST View */}
          <div className="md:col-span-2">
            <div className="border rounded-2xl overflow-hidden shadow-sm" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
              
              {/* LIST PAYMENT METHODS */}
              {activeTab === 'payment_methods' && (
                <ul className="divide-y" style={{ borderColor: 'var(--border-color)' }}>
                  {paymentMethods.length === 0 && <li className="p-4 text-center text-sm" style={{ color: 'var(--text-muted)' }}>Belum ada data</li>}
                  {paymentMethods.map(item => (
                    <li key={item.id} className="p-4 flex justify-between items-center hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <div>
                        <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{item.name}</p>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                          {item.method_type === 'cash' ? '💵 Fisik' : '📱 Digital'}
                        </p>
                      </div>
                      <button onClick={() => handleDelete('payment_methods', item.id)} className="text-red-500 hover:text-red-700 p-2">🗑️</button>
                    </li>
                  ))}
                </ul>
              )}

              {/* LIST CATEGORIES */}
              {activeTab === 'categories' && (
                <ul className="divide-y" style={{ borderColor: 'var(--border-color)' }}>
                  {categories.length === 0 && <li className="p-4 text-center text-sm" style={{ color: 'var(--text-muted)' }}>Belum ada data</li>}
                  {categories.map(item => (
                    <li key={item.id} className="p-4 flex justify-between items-center hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <div>
                        <p className="font-semibold text-sm flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                          {item.type === 'income' ? <span className="text-emerald-500 text-xs font-bold">IN</span> : <span className="text-red-500 text-xs font-bold">OUT</span>}
                          {item.name}
                        </p>
                      </div>
                      <button onClick={() => handleDelete('categories', item.id)} className="text-red-500 hover:text-red-700 p-2">🗑️</button>
                    </li>
                  ))}
                </ul>
              )}

              {/* LIST SUBCATEGORIES */}
              {activeTab === 'subcategories' && (
                <ul className="divide-y" style={{ borderColor: 'var(--border-color)' }}>
                  {subcategories.length === 0 && <li className="p-4 text-center text-sm" style={{ color: 'var(--text-muted)' }}>Belum ada data</li>}
                  {subcategories.map(item => (
                    <li key={item.id} className="p-4 flex justify-between items-center hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <div>
                        <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{item.name}</p>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                          Induk: {item.categories?.name} ({item.categories?.type === 'income' ? '📈' : '📉'})
                        </p>
                      </div>
                      <button onClick={() => handleDelete('subcategories', item.id)} className="text-red-500 hover:text-red-700 p-2">🗑️</button>
                    </li>
                  ))}
                </ul>
              )}

            </div>
          </div>
        </div>
      )}
    </div>
  )
}
