function getInitials(name) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

function Avatar({ name, size = 40, className = '' }) {
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full bg-indigo-600 font-semibold text-white ${className}`}
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      {getInitials(name)}
    </div>
  )
}

export default Avatar
