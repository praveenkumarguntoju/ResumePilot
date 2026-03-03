'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Send } from 'lucide-react'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export function ChatBox({ slug }: { slug: string }) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hi! 👋 I'm here to answer questions about my skills, experience, and background. Feel free to ask me anything!"
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, loading])

  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const wrapper = wrapperRef.current
    const chatEl = chatContainerRef.current
    if (!wrapper || !chatEl) return

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault()
      e.stopPropagation()
    }

    const handleFocus = (e: FocusEvent) => {
      e.stopPropagation()
    }

    const handleClick = (e: MouseEvent) => {
      e.stopPropagation()
    }

    wrapper.addEventListener('wheel', handleWheel, { passive: false })
    wrapper.addEventListener('focus', handleFocus, true)
    wrapper.addEventListener('click', handleClick, true)
    
    return () => {
      wrapper.removeEventListener('wheel', handleWheel)
      wrapper.removeEventListener('focus', handleFocus, true)
      wrapper.removeEventListener('click', handleClick, true)
    }
  }, [])

  async function sendMessage() {
    if (!input.trim()) return

    const userMessage = input.trim()
    setInput('')
    setLoading(true)

    setMessages(prev => [...prev, { role: 'user', content: userMessage }])

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, question: userMessage }),
      })

      const data = await res.json()

      setMessages(prev => [...prev, { role: 'assistant', content: data.answer }])
    } catch (error) {
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div ref={wrapperRef} className="sticky top-4 rounded-xl overflow-hidden shadow-xl overscroll-contain">
      {/* Navy gradient strip header */}
      <div className="bg-gradient-to-r from-[#1a237e] to-[#283593] dark:from-[#0d1442] dark:to-[#162058] px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
            <Send className="h-4 w-4 text-white" />
          </div>
          <div>
            <h3 className="text-white font-semibold text-base">Chat with Me</h3>
            <p className="text-blue-200/70 text-xs">Ask about skills, experience, or projects</p>
          </div>
        </div>
      </div>

      {/* Frosted glass body */}
      <div className="bg-white/70 dark:bg-zinc-900/80 backdrop-blur-xl border border-white/50 dark:border-zinc-800 border-t-0 rounded-b-xl p-4">
        <div 
          ref={chatContainerRef}
          className="h-72 overflow-y-auto rounded-lg p-3 mb-3 space-y-3 bg-zinc-50/80 dark:bg-zinc-800/50 border border-zinc-200/60 dark:border-zinc-700/50 overscroll-none"
        >
          {messages.map((m, i) => (
            <div
              key={i}
              className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${
                  m.role === 'user'
                    ? 'bg-[#1a237e] text-white shadow-sm'
                    : 'bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 shadow-sm'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap leading-relaxed">{m.content}</p>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl px-4 py-2.5 shadow-sm">
                <Loader2 className="h-4 w-4 animate-spin text-[#1a237e]" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="flex gap-2">
          <input
            className="flex-1 rounded-full px-4 py-2.5 text-sm bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#1a237e]/30 focus:border-[#1a237e]/50"
            placeholder="Ask about skills, experience, or projects..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !loading && !e.shiftKey) {
                e.preventDefault()
                sendMessage()
              }
            }}
            disabled={loading}
          />
          <Button 
            onClick={sendMessage} 
            disabled={loading || !input.trim()}
            className="rounded-full bg-[#1a237e] hover:bg-[#283593] text-white shadow-md h-10 w-10 p-0"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
