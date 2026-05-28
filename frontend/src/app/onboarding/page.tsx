"use client"
import { useState } from "react"
import Sidebar from "@/components/layout/Sidebar"
import Header from "@/components/layout/Header"
import ChatWindow from "@/components/chat/ChatWindow"
import { useStream } from "@/hooks/useStream"
import { useProfile } from "@/context/ProfileContext"

const STEPS_EMPLOYEE = [
  { title: "Получить доступы",      desc: "Заявка в ServiceDesk на рабочие системы",                    done: true },
  { title: "Инструктаж ИБ",         desc: "Обязательный курс по информационной безопасности",            done: true },
  { title: "Знакомство с командой", desc: "1-on-1 с руководителем и коллегами",                          done: false },
  { title: "Изучить архитектуру",   desc: "Confluence: раздел Architecture Overview",                    done: false },
  { title: "Первые задачи",         desc: "Взять задачи из бэклога под руководством ментора",             done: false },
]

const STEPS_MANAGER = [
  { title: "Настроить доступы",         desc: "Доступ к управленческим системам и дашбордам команды",    done: true },
  { title: "Онбординг лида",            desc: "Roadmap лида в корпоративной базе знаний",                done: true },
  { title: "1-on-1 с командой",         desc: "Индивидуальные встречи с каждым из разработчиков",        done: false },
  { title: "План развития команды",     desc: "Сформировать IDP для каждого сотрудника",                 done: false },
  { title: "Синхронизация со смежными", desc: "Встречи с лидами соседних команд",                        done: false },
]

export default function OnboardingPage() {
  const { isManager, currentId } = useProfile()
  const STEPS = isManager ? STEPS_MANAGER : STEPS_EMPLOYEE
  const [activeStep, setActiveStep] = useState(2)
  const { messages, isStreaming, sendMessage } = useStream()

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header employee={null} />
        <main className="flex-1 overflow-y-auto p-6 bg-canvas-100">
          <div className="grid grid-cols-5 gap-6 h-full">
            <div className="col-span-2 space-y-4">
              <div className="bg-surface rounded-xl border border-line p-5">
                <h3 className="font-semibold text-ink mb-4">Шаги адаптации</h3>
                <div className="space-y-2">
                  {STEPS.map((step, i) => (
                    <div
                      key={i}
                      onClick={() => setActiveStep(i)}
                      className={`flex gap-3 p-3 rounded-xl cursor-pointer transition-all duration-150 ${
                        activeStep === i
                          ? "bg-accent/10 border border-accent/25"
                          : "hover:bg-canvas-300 border border-transparent"
                      }`}
                    >
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                          step.done
                            ? "bg-state-success/20 text-state-success"
                            : i === activeStep
                            ? "bg-accent text-white"
                            : "bg-canvas-300 text-ink-muted"
                        }`}
                      >
                        {step.done ? "✓" : i + 1}
                      </div>
                      <div>
                        <div className={`text-sm font-medium ${step.done ? "text-ink-subtle line-through" : "text-ink"}`}>
                          {step.title}
                        </div>
                        <div className="text-xs text-ink-muted mt-0.5">{step.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {isManager ? (
                <div className="bg-accent/10 rounded-xl border border-accent/20 p-4">
                  <p className="text-sm text-accent font-medium mb-1">Product Owner</p>
                  <p className="text-sm text-ink">Алексей Громов</p>
                  <p className="text-xs text-ink-muted mt-1">Sync: каждый понедельник 10:00</p>
                </div>
              ) : (
                <div className="bg-accent/10 rounded-xl border border-accent/20 p-4">
                  <p className="text-sm text-accent font-medium mb-1">Ваш ментор</p>
                  <p className="text-sm text-ink">Павел Соколов (Lead)</p>
                  <p className="text-xs text-ink-muted mt-1">Встречи: каждый вторник 11:00</p>
                </div>
              )}
            </div>

            <div className="col-span-3 bg-surface rounded-xl border border-line overflow-hidden flex flex-col">
              <div className="px-5 py-3.5 border-b border-line">
                <p className="text-sm font-medium text-ink">Задайте вопрос по онбордингу</p>
                <p className="text-xs text-ink-muted mt-0.5">
                  {isManager
                    ? "Например: «Как выстроить первые 1-on-1 с командой?»"
                    : "Например: «Как получить доступ к GitLab?»"}
                </p>
              </div>
              <div className="flex-1 overflow-hidden">
                <ChatWindow
                  messages={messages}
                  isStreaming={isStreaming}
                  onSend={(text) => sendMessage(text, currentId)}
                />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
