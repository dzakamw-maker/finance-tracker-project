import { useState, useMemo } from 'react'

export default function TransactionList({ data, onDelete, onEdit }) {
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [isExporting, setIsExporting] = useState(false)

  const filteredData = useMemo(() => {
    if (!data) return []
    return data.filter(item => {
      const searchLower = search.toLowerCase()
      // Create a massive string to search against
      const searchTarget = [
        item.categories?.name,
        item.subcategories?.name,
        item.payment_methods?.name,
        item.note
      ].filter(Boolean).join(' ').toLowerCase()

      const matchSearch = searchTarget.includes(searchLower)
      const matchType = filterType === 'all' || item.type === filterType
      return matchSearch && matchType
    })
  }, [data, search, filterType])

  const inputStyle = {
    backgroundColor: 'var(--input-bg)',
    borderColor: 'var(--input-border)',
    color: 'var(--text-primary)',
  }

  const handleExport = async () => {
    setIsExporting(true)
    try {
      const ExcelJS = (await import('exceljs')).default || await import('exceljs')
      const { saveAs } = (await import('file-saver')).default || await import('file-saver')

      const workbook = new ExcelJS.Workbook()
      const worksheet = workbook.addWorksheet('Riwayat Transaksi')

      // 1. Setup Header Kolom
      worksheet.columns = [
        { header: 'Tanggal', key: 'date', width: 15 },
        { header: 'Metode Pembayaran', key: 'payment', width: 25 },
        { header: 'Kategori', key: 'category', width: 20 },
        { header: 'Sub-Kategori', key: 'subcategory', width: 20 },
        { header: 'Catatan', key: 'note', width: 35 },
        { header: 'Tipe', key: 'type', width: 15 },
        { header: 'Jumlah (Rp)', key: 'amount', width: 20 },
      ]

      // 2. Styling Header (Tebal & Warna Latar)
      const headerRow = worksheet.getRow(1)
      headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } }
      headerRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF0284C7' } // Blue 600
      }
      headerRow.alignment = { vertical: 'middle', horizontal: 'center' }

      // 3. Masukkan Data ke Excel
      filteredData.forEach((item) => {
        const row = worksheet.addRow({
          date: new Date(item.date).toLocaleDateString('id-ID'),
          payment: item.payment_methods?.name || '-',
          category: item.categories?.name || '-',
          subcategory: item.subcategories?.name || '-',
          note: item.note || '-',
          type: item.type === 'income' ? 'Pemasukan' : 'Pengeluaran',
          amount: item.amount
        })

        // 4. Custom Styling per baris data
        const typeCell = row.getCell('type')
        const amountCell = row.getCell('amount')
        
        amountCell.numFmt = '#,##0' // Format angka ribuan

        if (item.type === 'income') {
          typeCell.font = { color: { argb: 'FF059669' }, bold: true } // Emerald
          amountCell.font = { color: { argb: 'FF059669' }, bold: true }
        } else {
          typeCell.font = { color: { argb: 'FFDC2626' }, bold: true } // Red
          amountCell.font = { color: { argb: 'FFDC2626' }, bold: true }
        }
      })

      // 5. Tambahkan Border di semua cell
      worksheet.eachRow((row) => {
        row.eachCell((cell) => {
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
          }
          cell.alignment = { vertical: 'middle', wrapText: true }
        })
      })

      // Generate dan Download File
      const buffer = await workbook.xlsx.writeBuffer()
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
      saveAs(blob, `Data_Keuangan_${new Date().getTime()}.xlsx`)

    } catch (error) {
      console.error("Export Error:", error)
      alert("Gagal export excel. Pastikan proses installasi NPM selesai.")
    } finally {
      setIsExporting(false)
    }
  }

  if (!data || data.length === 0) {
    return (
      <div
        className="rounded-2xl border p-12 text-center animate-fade-in"
        style={{
          backgroundColor: 'var(--bg-card)',
          borderColor: 'var(--border-color)',
          boxShadow: 'var(--shadow-md)',
        }}
      >
        <span className="text-5xl mb-4 block">📝</span>
        <p className="text-base font-medium" style={{ color: 'var(--text-secondary)' }}>
          Belum ada transaksi.
        </p>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
          Yuk, mulai catat pengeluaranmu!
        </p>
      </div>
    )
  }

  return (
    <div
      className="rounded-2xl border overflow-hidden animate-fade-in"
      style={{
        backgroundColor: 'var(--bg-card)',
        borderColor: 'var(--border-color)',
        boxShadow: 'var(--shadow-md)',
      }}
    >
      {/* Header with filters */}
      <div className="p-5 space-y-4" style={{ borderBottom: '1px solid var(--border-color)' }}>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <span className="w-8 h-8 rounded-lg bg-primary-500 text-white flex items-center justify-center text-sm">📋</span>
            Riwayat Transaksi
          </h2>
          <button
            onClick={handleExport}
            disabled={isExporting || filteredData.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 transition-all text-white text-sm font-semibold rounded-lg shadow disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isExporting ? '⏳ Mengekspor...' : '📊 Export Excel'}
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: 'var(--text-muted)' }}>
              🔍
            </span>
            <input
              type="text"
              placeholder="Cari transaksi..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-lg border text-sm font-medium outline-none
                focus:ring-2 focus:ring-primary-400/30 transition-all duration-200"
              style={inputStyle}
            />
          </div>

          {/* Filter Type */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 rounded-lg border text-sm font-medium outline-none cursor-pointer
              focus:ring-2 focus:ring-primary-400/30 transition-all duration-200"
            style={inputStyle}
          >
            <option value="all">Semua Tipe</option>
            <option value="income">📈 Pemasukan</option>
            <option value="outcome">📉 Pengeluaran</option>
          </select>
        </div>
      </div>

      {/* Table */}
      {filteredData.length === 0 ? (
        <div className="p-8 text-center">
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Tidak ada transaksi yang cocok dengan filter.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ backgroundColor: 'var(--bg-secondary)' }}>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider min-w-[120px]"
                    style={{ color: 'var(--text-muted)' }}>
                  Tanggal & Metode
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                    style={{ color: 'var(--text-muted)' }}>
                  Kategori
                </th>
                <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider"
                    style={{ color: 'var(--text-muted)' }}>
                  Jumlah
                </th>
                <th className="px-5 py-3 text-center text-xs font-semibold uppercase tracking-wider"
                    style={{ color: 'var(--text-muted)' }}>
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: 'var(--border-color)' }}>
              {filteredData.map((item, i) => {
                const pmLabel = item.payment_methods?.name || 'Unknown'
                const isCash = item.payment_methods?.method_type === 'cash'
                const catLabel = item.categories?.name || 'Unknown'
                const subLabel = item.subcategories?.name || ''
                
                return (
                  <tr
                    key={item.id}
                    className="transition-colors duration-150 hover:brightness-95 dark:hover:brightness-110"
                    style={{
                      backgroundColor: 'var(--bg-card)',
                      animationDelay: `${i * 40}ms`,
                    }}
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                          {new Date(item.date).toLocaleDateString('id-ID', {
                            day: 'numeric', month: 'short', year: 'numeric'
                          })}
                        </span>
                        <span className="text-xs font-semibold mt-1 inline-flex items-center gap-1 w-fit px-2 py-0.5 rounded-md" style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-muted)' }}>
                          {isCash ? '💵' : '📱'} {pmLabel}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                           {subLabel ? subLabel : catLabel}
                        </span>
                        {subLabel && (
                          <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                            {catLabel}
                          </span>
                        )}
                        {item.note && (
                          <p className="text-xs mt-1 truncate max-w-[200px]" style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>
                            "{item.note}"
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-right align-top">
                      <span className={`text-sm font-bold ${
                        item.type === 'income'
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-red-600 dark:text-red-400'
                      }`}>
                        {item.type === 'income' ? '+' : '-'} Rp {item.amount.toLocaleString('id-ID')}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-center align-top">
                      <div className="flex items-center justify-center gap-1">
                        {/* Edit button */}
                        <button
                          onClick={() => onEdit(item)}
                          className="p-1.5 rounded-lg transition-all duration-200 cursor-pointer
                            hover:bg-blue-50 dark:hover:bg-blue-500/10 text-gray-400 hover:text-blue-500
                            active:scale-90"
                          title="Edit transaksi"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                          </svg>
                        </button>
                        {/* Delete button */}
                        <button
                          onClick={() => onDelete(item.id)}
                          className="p-1.5 rounded-lg transition-all duration-200 cursor-pointer
                            hover:bg-red-50 dark:hover:bg-red-500/10 text-gray-400 hover:text-red-500
                            active:scale-90"
                          title="Hapus transaksi"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Footer with count */}
      <div className="px-5 py-3 text-xs font-medium" style={{ color: 'var(--text-muted)', backgroundColor: 'var(--bg-secondary)' }}>
        Menampilkan {filteredData.length} dari {data.length} transaksi
      </div>
    </div>
  )
}