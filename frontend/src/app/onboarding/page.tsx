"use client"
import { useState } from "react"
import Sidebar from "@/components/layout/Sidebar"
import Header from "@/components/layout/Header"
import ChatWindow from "@/components/chat/ChatWindow"
import { useStream } from "@/hooks/useStream"

const STEPS = [
  { title: "Получить доступы", desc: "Заявка в ServiceDesk на рабочие системы", done: true },
  { title: "Инструктаж ИБ", desc: "Обязательный курс по информационной безопасности", done: true },
  { title: "Знакомство с командой", desc: "1-on-1 с руководителем и коллегами", done: false },
  { title: "Изучить архитектуру", desc: "Confluence: раздел Architecture Overview", done: false },
  { title: "Первые задачи", desc: "Взять задачи из бэклога под руководством ментора", done: false },
]

const EMPLOYEE_ID = process.env.NEXT_PUBLIC_DEMO_EMPLOYEE_ID || "emp_001"

export default function OnboardingPage() {
  const [activeStep, setActiveStep] = useState(2)
  const { messages, isStreaming, sendMessage } = useStream()

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header employee={null} />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-5 gap-6 h-full">
            <div className="col-span-2 space-y-4">
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h3 className="font-semibold text-gray-900 mb-4">Шаги адаптации</h3>
                <div className="space-y-3">
                  {STEPS.map((step, i) => (
                    <div
                      key={i}
                      onClick={() => setActiveStep(i)}
                      className={`flex gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                        activeStep === i ? "bg-blue-50 border border-blue-200" : "hover:bg-gray-50"
                      }`}
                    >
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                          step.done
                            ? "bg-green-500 text-white"
                            : i === activeStep
                            ? "bg-blue-600 text-white"
                            : "bg-gray-200 text-gray-500"
                        }`}
                      >
                        {step.done ? "✓" : i + 1}
                      </div>
                      <div>
                        <div className={`text-sm font-medium ${step.done ? "text-gray-400 line-through" : "text-gray-900"}`}>
                          {step.title}
                        </div>
                        <div className="text-xs text-gray-500">{step.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-blue-50 rounded-xl border border-blue-200 p-4">
                <p className="text-sm text-blue-800 font-medium mb-1">Ваш ментор</p>
                <p className="text-sm text-blue-700">Павел Соколов (Lead)</p>
                <p className="text-xs text-blue-500 mt-1">Встречи: каждый вторник 11:00</p>
              </div>
            </div>

            <div className="col-span-3 bg-white rounded-xl border border-gray-200 overflow-hidden flex flex-col">
              <div className="px-5 py-3 border-b border-gray-100">
                <p className="text-sm font-medium text-gray-700">Задайте вопрос по онбордингу</p>
                <p className="text-xs text-gray-400">Например: «Как получить доступ к GitLab?»</p>
              </div>
              <div className="flex-1 overflow-hidden">
                <ChatWindow
                  messages={messages}
                  isStreaming={isStreaming}
                  onSend={(text) => sendMessage(text, EMPLOYEE_ID)}
                />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
