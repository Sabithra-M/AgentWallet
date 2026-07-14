function SectionHeader({ title, action }) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <h2 className="text-base font-semibold text-slate-800">{title}</h2>
      {action}
    </div>
  )
}

export default SectionHeader
