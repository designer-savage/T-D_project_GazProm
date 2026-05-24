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
      <div className={`max-w-[75%] ${isUser ? "order-2" : "order-1"}`}>
        {!isUser && message.agent && (
          <div className="mb-1.5">
            <AgentBadge agent={message.agent} />
          </div>
        )}
        <div
          className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
            isUser
              ? "bg-accent text-accent-ink rounded-br-sm whitespace-pre-wrap"
              : "bg-surface border border-line text-ink rounded-bl-sm shadow-sm"
          }`}
        >
          {isUser ? (
            message.content
          ) : (
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                em: ({ children }) => <em className="italic">{children}</em>,
                h1: ({ children }) => <h1 className="text-base font-semibold mt-3 mb-1 first:mt-0">{children}</h1>,
                h2: ({ children }) => <h2 className="text-sm font-semibold mt-3 mb-1 first:mt-0">{children}</h2>,
                h3: ({ children }) => <h3 className="text-sm font-semibold mt-2 mb-1 first:mt-0">{children}</h3>,
                ul: ({ children }) => <ul className="list-disc pl-4 mb-2 space-y-0.5">{children}</ul>,
                ol: ({ children }) => <ol className="list-decimal pl-4 mb-2 space-y-0.5">{children}</ol>,
                li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                code: ({ className, children, ...props }) => {
                  const isBlock = className?.includes("language-")
                  return isBlock ? (
                    <code className="block bg-gray-100 rounded-lg p-3 my-2 overflow-x-auto text-xs font-mono whitespace-pre">
                      {children}
                    </code>
                  ) : (
                    <code className="bg-gray-100 px-1 py-0.5 rounded text-xs font-mono" {...props}>
                      {children}
                    </code>
                  )
                },
                pre: ({ children }) => <pre className="my-2">{children}</pre>,
                blockquote: ({ children }) => (
                  <blockquote className="border-l-2 border-gray-300 pl-3 italic text-gray-600 my-2">
                    {children}
                  </blockquote>
                ),
                a: ({ href, children }) => (
                  <a href={href} className="text-blue-600 underline" target="_blank" rel="noreferrer">
                    {children}
                  </a>
                ),
                hr: () => <hr className="border-gray-200 my-2" />,
                table: ({ children }) => (
                  <div className="overflow-x-auto my-2">
                    <table className="text-xs border-collapse w-full">{children}</table>
                  </div>
                ),
                th: ({ children }) => (
                  <th className="border border-gray-200 px-2 py-1 bg-gray-50 font-semibold text-left">
                    {children}
                  </th>
                ),
                td: ({ children }) => (
                  <td className="border border-gray-200 px-2 py-1">{children}</td>
                ),
              }}
            >
              {message.content}
            </ReactMarkdown>
          )}
          {isStreaming && !isUser && (
            <span className="inline-block w-1 h-4 bg-gray-400 animate-pulse ml-0.5 align-middle" />
          )}
        </div>
      </div>
    </div>
  )
}
