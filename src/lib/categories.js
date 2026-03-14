// Shared category definitions by transaction type

export const outcomeCategories = [
  { value: 'Makanan', label: '🍔 Makanan', icon: '🍔' },
  { value: 'Transport', label: '🚗 Transport', icon: '🚗' },
  { value: 'Hiburan', label: '🎮 Hiburan', icon: '🎮' },
  { value: 'Sedekah', label: '🤲 Sedekah', icon: '🤲' },
  { value: 'Tagihan', label: '🏠 Tagihan', icon: '🏠' },
  { value: 'Belanja', label: '🛒 Belanja', icon: '🛒' },
  { value: 'Kesehatan', label: '🏥 Kesehatan', icon: '🏥' },
  { value: 'Pendidikan', label: '📚 Pendidikan', icon: '📚' },
]

export const incomeCategories = [
  { value: 'Gaji', label: '💼 Gaji', icon: '💼' },
  { value: 'Freelance', label: '💻 Freelance', icon: '💻' },
  { value: 'Investasi', label: '📈 Investasi', icon: '📈' },
  { value: 'Hadiah', label: '🎁 Hadiah', icon: '🎁' },
  { value: 'Lainnya', label: '📦 Lainnya', icon: '📦' },
]

export function getCategoriesByType(type) {
  return type === 'income' ? incomeCategories : outcomeCategories
}

// Color map for display in table
export const categoryColors = {
  Makanan:    { bg: 'bg-amber-100 dark:bg-amber-500/15', text: 'text-amber-700 dark:text-amber-400', icon: '🍔' },
  Transport:  { bg: 'bg-blue-100 dark:bg-blue-500/15', text: 'text-blue-700 dark:text-blue-400', icon: '🚗' },
  Hiburan:    { bg: 'bg-purple-100 dark:bg-purple-500/15', text: 'text-purple-700 dark:text-purple-400', icon: '🎮' },
  Sedekah:    { bg: 'bg-pink-100 dark:bg-pink-500/15', text: 'text-pink-700 dark:text-pink-400', icon: '🤲' },
  Tagihan:    { bg: 'bg-orange-100 dark:bg-orange-500/15', text: 'text-orange-700 dark:text-orange-400', icon: '🏠' },
  Belanja:    { bg: 'bg-cyan-100 dark:bg-cyan-500/15', text: 'text-cyan-700 dark:text-cyan-400', icon: '🛒' },
  Kesehatan:  { bg: 'bg-rose-100 dark:bg-rose-500/15', text: 'text-rose-700 dark:text-rose-400', icon: '🏥' },
  Pendidikan: { bg: 'bg-indigo-100 dark:bg-indigo-500/15', text: 'text-indigo-700 dark:text-indigo-400', icon: '📚' },
  Gaji:       { bg: 'bg-emerald-100 dark:bg-emerald-500/15', text: 'text-emerald-700 dark:text-emerald-400', icon: '💼' },
  Freelance:  { bg: 'bg-teal-100 dark:bg-teal-500/15', text: 'text-teal-700 dark:text-teal-400', icon: '💻' },
  Investasi:  { bg: 'bg-sky-100 dark:bg-sky-500/15', text: 'text-sky-700 dark:text-sky-400', icon: '📈' },
  Hadiah:     { bg: 'bg-fuchsia-100 dark:bg-fuchsia-500/15', text: 'text-fuchsia-700 dark:text-fuchsia-400', icon: '🎁' },
  Lainnya:    { bg: 'bg-gray-100 dark:bg-gray-500/15', text: 'text-gray-700 dark:text-gray-400', icon: '📦' },
}

export const defaultCategoryColor = { bg: 'bg-gray-100 dark:bg-gray-500/15', text: 'text-gray-700 dark:text-gray-400', icon: '📌' }
