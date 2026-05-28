import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { Message } from "@/lib/types"
import AgentBadge from "./AgentBadge"

interface Props {
  message: Message
  isStreaming?: boolean
}

export default function MessageBubble({ message, isStreaming }: Props) {
  const isUser = message.role === "user"

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4`}>
      <div className={`max-w-[78%] ${isUser ? "order-2" : "order-1"}`}>
        {!isUser && message.agent && (
          <div className="mb-1.5 ml-1">
            <AgentBadge agent={message.agent} />
          </div>
        )}
        <div
          className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
            isUser
              ? "bg-accent/20 border border-accent/25 text-ink rounded-br-sm"
              : "bg-surface border border-line text-ink rounded-bl-sm"
          }`}
        >
          {isUser ? (
            <span className="whitespace-pre-wrap">{message.content}</span>
          ) : (
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                p:          ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                strong:     ({ children }) => <strong className="font-semibold text-ink">{children}</strong>,
                em:         ({ children }) => <em className="italic">{children}</em>,
                h1:         ({ children }) => <h1 className="text-base font-semibold mt-3 mb-1.5 first:mt-0 text-ink">{children}</h1>,
                h2:         ({ children }) => <h2 className="text-sm font-semibold mt-3 mb-1 first:mt-0 text-ink">{children}</h2>,
                h3:         ({ children }) => <h3 className="text-sm font-semibold mt-2 mb-1 first:mt-0 text-ink">{children}</h3>,
                ul:         ({ children }) => <ul className="list-disc pl-4 mb-2 space-y-0.5">{children}</ul>,
                ol:         ({ children }) => <ol className="list-decimal pl-4 mb-2 space-y-0.5">{children}</ol>,
                li:         ({ children }) => <li className="leading-relaxed">{children}</li>,
                code:       ({ className, children, ...props }) => {
                  const isBlock = className?.includes("language-")
                  return isBlock ? (
                    <code className="block bg-canvas-300 border border-line rounded-xl p-3 my-2.5 overflow-x-auto text-xs font-mono whitespace-pre text-ink-soft">
                      {children}
                    </code>
                  ) : (
                    <code className="bg-canvas-300 border border-line px-1.5 py-0.5 rounded text-xs font-mono text-ink-soft" {...props}>
                      {children}
                    </code>
                  )
                },
                pre:        ({ children }) => <pre className="my-2">{children}</pre>,
                blockquote: ({ children }) => (
                  <blockquote className="border-l-2 border-accent/40 pl-3 italic text-ink-muted my-2">
                    {children}
                  </blockquote>
                ),
                a:          ({ href, children }) => (
                  <a href={href} className="text-accent underline underline-offset-2 hover:text-accent-hover" target="_blank" rel="noreferrer">
                    {children}
                  </a>
                ),
                hr:         () => <hr className="border-line my-3" />,
                table:      ({ children }) => (
                  <div className="overflow-x-auto my-2">
                    <table className="text-xs border-collapse w-full">{children}</table>
                  </div>
                ),
                th:         ({ children }) => (
                  <th className="border border-line px-2.5 py-1.5 bg-canvas-300 font-semibold text-left text-ink-soft">
                    {children}
                  </th>
                ),
                td:         ({ children }) => (
                  <td className="border border-line px-2.5 py-1.5 text-ink-muted">{children}</td>
                ),
              }}
            >
              {message.content}
            </ReactMarkdown>
          )}
          {isStreaming && !isUser && (
            <span className="inline-block w-0.5 h-4 bg-accent/70 animate-pulse ml-0.5 align-middle rounded-full" />
          )}
        </div>
      </div>
    </div>
  )
}
