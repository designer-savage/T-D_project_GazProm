import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { Message } from "@/lib/types"
import AgentBadge from "./AgentBadge"

const glassBase: React.CSSProperties = {
  background: "var(--glass-bg)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  border: "1px solid var(--glass-border)",
  boxShadow: "var(--glass-shadow), inset 0 1px 0 0 var(--glass-inset)",
  transition: "all 0.25s ease",
}

interface Props {
  message: Message
  isStreaming?: boolean
}

export default function MessageBubble({ message, isStreaming }: Props) {
  const isUser = message.role === "user"

  return (
    <div style={{ display: "flex", justifyContent: isUser ? "flex-end" : "flex-start", marginBottom: 16, animation: "fadeInUp 0.3s ease both" }}>
      <div style={{ maxWidth: "78%" }}>
        {!isUser && message.agent && (
          <div style={{ marginBottom: 6, marginLeft: 4 }}>
            <AgentBadge agent={message.agent} />
          </div>
        )}
        <div style={{
          padding: "12px 16px", fontSize: 14, lineHeight: 1.6, color: "var(--text-1)",
          borderRadius: 18,
          ...(isUser ? {
            borderBottomRightRadius: 6,
            background: "var(--user-bubble)",
            border: "1px solid var(--user-border)",
          } : {
            ...glassBase,
            borderBottomLeftRadius: 6,
          }),
        }}>
          {isUser ? (
            <span style={{ whiteSpace: "pre-wrap" }}>{message.content}</span>
          ) : (
            <>
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  p:      ({ children }) => <p style={{ marginBottom: 8 }}>{children}</p>,
                  strong: ({ children }) => <strong style={{ fontWeight: 600, color: "var(--text-1)" }}>{children}</strong>,
                  em:     ({ children }) => <em style={{ fontStyle: "italic" }}>{children}</em>,
                  h1:     ({ children }) => <h1 style={{ fontSize: 15, fontWeight: 600, marginTop: 12, marginBottom: 6, color: "var(--text-1)" }}>{children}</h1>,
                  h2:     ({ children }) => <h2 style={{ fontSize: 14, fontWeight: 600, marginTop: 10, marginBottom: 4, color: "var(--text-1)" }}>{children}</h2>,
                  h3:     ({ children }) => <h3 style={{ fontSize: 14, fontWeight: 600, marginTop: 8, marginBottom: 4, color: "var(--text-1)" }}>{children}</h3>,
                  ul:     ({ children }) => <ul style={{ paddingLeft: 16, marginBottom: 8 }}>{children}</ul>,
                  ol:     ({ children }) => <ol style={{ paddingLeft: 16, marginBottom: 8 }}>{children}</ol>,
                  li:     ({ children }) => <li style={{ lineHeight: 1.65, marginBottom: 2 }}>{children}</li>,
                  code:   ({ className, children, ...props }) => {
                    const isBlock = className?.includes("language-")
                    return isBlock ? (
                      <code style={{ display: "block", background: "var(--glass-bg-elevated)", border: "1px solid var(--glass-border)", borderRadius: 10, padding: "10px 14px", margin: "8px 0", overflowX: "auto", fontSize: 12, fontFamily: "monospace" }}>
                        {children}
                      </code>
                    ) : (
                      <code style={{ background: "var(--glass-bg-elevated)", padding: "1px 5px", borderRadius: 4, fontSize: "0.85em" }} {...props}>
                        {children}
                      </code>
                    )
                  },
                  pre:        ({ children }) => <pre style={{ margin: "8px 0" }}>{children}</pre>,
                  blockquote: ({ children }) => <blockquote style={{ borderLeft: "2px solid var(--accent-soft)", paddingLeft: 12, fontStyle: "italic", color: "var(--text-2)", margin: "8px 0" }}>{children}</blockquote>,
                  a:          ({ href, children }) => <a href={href} style={{ color: "var(--accent)", textDecoration: "underline", textUnderlineOffset: 2 }} target="_blank" rel="noreferrer">{children}</a>,
                  hr:         () => <hr style={{ borderColor: "var(--glass-border)", margin: "12px 0" }} />,
                  table:      ({ children }) => <div style={{ overflowX: "auto", margin: "8px 0" }}><table style={{ borderCollapse: "collapse", width: "100%", fontSize: 12 }}>{children}</table></div>,
                  th:         ({ children }) => <th style={{ border: "1px solid var(--glass-border)", padding: "6px 10px", background: "var(--glass-bg-elevated)", fontWeight: 600, textAlign: "left" }}>{children}</th>,
                  td:         ({ children }) => <td style={{ border: "1px solid var(--glass-border)", padding: "6px 10px", color: "var(--text-2)" }}>{children}</td>,
                }}
              >
                {message.content}
              </ReactMarkdown>
              {isStreaming && (
                <span style={{ display: "inline-block", width: 2, height: 16, background: "var(--accent)", opacity: 0.7, marginLeft: 2, verticalAlign: "middle", borderRadius: 1, animation: "pulse-opacity 1s ease-in-out infinite" }} />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
