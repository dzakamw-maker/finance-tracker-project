import { useState, useEffect } from 'react'
import { supabase } from './lib/supabaseClient'
import { useToast } from './hooks/useToast'
import ThemeToggle from './components/ThemeToggle'
import SummaryCards from './components/SummaryCards'
import ToastContainer from './components/Toast'
import TransactionForm from './components/TransactionForm'
import TransactionList from './components/TransactionList'
import TransactionChart from './components/TransactionChart'
import EditModal from './components/EditModal'
import DeleteModal from './components/DeleteModal'
import Settings from './components/Settings'

function App() {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingTransaction, setEditingTransaction] = useState(null)
  const [transactionToDelete, setTransactionToDelete] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [paymentMethods, setPaymentMethods] = useState([])
  const [categories, setCategories] = useState([])
  const [subcategories, setSubcategories] = useState([])
  const [showSettings, setShowSettings] = useState(false)
  const { toasts, showToast, dismissToast } = useToast()

  const refreshData = async () => {
    setLoading(true)
    try {
      // 1. Fetch transactions with joined data for display
      const txRes = await supabase
        .from('transactions')
        .select(`
          *,
          payment_methods(name, method_type),
          categories(name, type),
          subcategories(name)
        `)
        .order('date', { ascending: false })

      // 2. Fetch reference data for the forms
      const [pmRes, catRes, subRes] = await Promise.all([
        supabase.from('payment_methods').select('*').order('name'),
        supabase.from('categories').select('*').order('type'),
        supabase.from('subcategories').select('*').order('name')
      ])

      if (txRes.error) throw txRes.error
      if (pmRes.error) throw pmRes.error
      if (catRes.error) throw catRes.error
      if (subRes.error) throw subRes.error

      setTransactions(txRes.data || [])
      setPaymentMethods(pmRes.data || [])
      setCategories(catRes.data || [])
      setSubcategories(subRes.data || [])

    } catch (err) {
      console.error("Gagal ambil data:", err.message)
      showToast('Gagal memuat data: ' + err.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteRequest = (id) => {
    setTransactionToDelete(id)
  }

  const confirmDelete = async () => {
    if (!transactionToDelete) return
    
    setIsDeleting(true)
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', transactionToDelete)

    setIsDeleting(false)

    if (error) {
      showToast('Gagal hapus: ' + error.message, 'error')
    } else {
      showToast('Transaksi berhasil dihapus', 'success')
      setTransactionToDelete(null)
      refreshData()
    }
  }

  useEffect(() => {
    refreshData()
  }, [])

  return (
    <div className="min-h-screen transition-colors duration-300" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Edit Modal */}
      {editingTransaction && (
        <EditModal
          transaction={editingTransaction}
          onClose={() => setEditingTransaction(null)}
          onSuccess={refreshData}
          showToast={showToast}
          paymentMethods={paymentMethods}
          categories={categories}
          subcategories={subcategories}
        />
      )}

      {/* Delete Modal */}
      {transactionToDelete && (
        <DeleteModal
          onConfirm={confirmDelete}
          onCancel={() => setTransactionToDelete(null)}
          loading={isDeleting}
        />
      )}

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* ===== HEADER ===== */}
        <header className="flex items-center justify-between mb-8 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-600 text-white flex items-center justify-center text-xl shadow-md">
              💸
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
                My Money Tracker
              </h1>
              <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                Kelola keuanganmu dengan mudah
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 rounded-xl border hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer flex items-center gap-2"
              style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
              title="Pengaturan Kategori"
            >
              ⚙️ <span className="text-sm font-semibold hidden sm:inline">Pengaturan</span>
            </button>
            <ThemeToggle />
          </div>
        </header>

        {showSettings ? (
          <Settings showToast={showToast} onBack={() => { setShowSettings(false); refreshData(); }} />
        ) : (
          <>
            {/* ===== SUMMARY CARDS ===== */}
            <section className="mb-8">
              <SummaryCards transactions={transactions} />
            </section>

            {/* ===== MAIN CONTENT GRID ===== */}
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="flex flex-col items-center gap-3">
                  <svg className="animate-spin h-8 w-8 text-primary-500" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
                    Memuat data...
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                {/* Sidebar: Form */}
                <div className="lg:col-span-1 space-y-6">
                  <TransactionForm 
                    onSuccess={refreshData} 
                    showToast={showToast} 
                    paymentMethods={paymentMethods}
                    categories={categories}
                    subcategories={subcategories}
                  />
                </div>

                {/* Main: Chart + List */}
                <div className="lg:col-span-2 space-y-6">
                  <TransactionChart data={transactions} />
                  <TransactionList
                    data={transactions}
                    onDelete={handleDeleteRequest}
                    onEdit={(item) => setEditingTransaction(item)}
                  />
                </div>
              </div>
            )}

            {/* ===== FOOTER ===== */}
            <footer className="mt-12 pb-6 text-center">
              <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                © 2026 My Money Tracker · Built with ❤️
              </p>
            </footer>
          </>
        )}
      </div>
    </div>
  )
}

export default App
