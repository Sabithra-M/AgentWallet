function ChatBubble({ message }) {
  const isUser = message.sender === 'user'

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[80%] break-words rounded-2xl px-4 py-2.5 text-sm ${
          isUser ? 'rounded-br-sm bg-indigo-600 text-white' : 'rounded-bl-sm bg-slate-100 text-slate-700'
        }`}
      >
        <p className="whitespace-pre-line">{message.text}</p>
        <p className={`mt-1 text-[11px] ${isUser ? 'text-indigo-200' : 'text-slate-400'}`}>
          {message.timestamp}
        </p>
      </div>
    </div>
  )
}

export default ChatBubble
