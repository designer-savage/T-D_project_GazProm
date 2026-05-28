"use client"
import { useState, KeyboardEvent } from "react"
import { ArrowUp } from "lucide-react"

interface Props {
  onSend: (text: string) => void
  disabled?: boolean
}

export default function ChatInput({ onSend, disabled }: Props) {
  const [text, setText] = useState("")

  const handleSend = () => {
    const trimmed = text.trim()
    if (!trimmed || disabled) return
    onSend(trimmed)
    setText("")
  }

  const handleKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const canSend = !!text.trim() && !disabled

  return (
    <div className="px-4 pb-4 pt-2 flex-shrink-0">
      <div
        className={`relative bg-surface border rounded-2xl shadow-xl shadow-black/40 transition-all duration-200 ${
          canSend
            ? "border-accent/30 shadow-accent/5"
            : "border-line"
        }`}
      >
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Задайте вопрос агенту..."
          disabled={disabled}
          rows={1}
          className="w-full resize-none bg-transparent px-4 py-3.5 pr-14 text-sm text-ink
                     placeholder:text-ink-subtle focus:outline-none disabled:opacity-50
                     leading-relaxed"
          style={{ maxHeight: "160px" }}
        />
        <button
          onClick={handleSend}
          disabled={!canSend}
          className={`absolute right-3 bottom-3 w-8 h-8 rounded-xl flex items-center justify-center
                      transition-all duration-150 ${
                        canSend
                          ? "bg-accent hover:bg-accent-hover text-white shadow-md shadow-accent/30"
                          : "bg-canvas-300 text-ink-subtle cursor-not-allowed"
                      }`}
        >
          <ArrowUp size={15} />
        </button>
      </div>
      <p className="text-center text-[11px] text-ink-subtle mt-2">
        Enter — отправить · Shift+Enter — перенос строки
      </p>
    </div>
  )
}
