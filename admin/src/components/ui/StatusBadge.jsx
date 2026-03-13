const styles = {
  pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-400',
  confirmed: 'bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400',
  completed: 'bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400',
  cancelled: 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400',
  available: 'bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400',
  unavailable: 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400',
}

export default function StatusBadge({ status }) {
  const key = status?.toLowerCase() || 'pending'
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${styles[key] || styles.pending}`}>
      {status}
    </span>
  )
}
