function Card({ children, className = '' }) {
  return <div className={`rounded-2xl bg-white p-5 shadow-sm ${className}`}>{children}</div>
}

export default Card
