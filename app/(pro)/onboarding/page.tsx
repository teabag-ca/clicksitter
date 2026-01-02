'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function OnboardingPage() {
  const router = useRouter()
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([
    {
      role: 'assistant',
      content: "Hi! I'm here to help you create your ClickSitter profile. Let's start with your name - what should we call you?",
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [isComplete, setIsComplete] = useState(false)

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || loading) return

    const userMessage = input.trim()
    setInput('')
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }])
    setLoading(true)

    try {
      const response = await fetch('/api/ai/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          conversationHistory: [...messages, { role: 'user', content: userMessage }],
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: data.response },
        ])
        
        if (data.isComplete) {
          setIsComplete(true)
          setTimeout(() => {
            router.push('/(pro)/verify')
          }, 2000)
        }
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to process message')
      }
    } catch (error) {
      console.error('Error sending message:', error)
      alert('Error sending message')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">Create Your Profile</h1>

      <div className="bg-white rounded-lg shadow-lg p-6 mb-4 h-96 overflow-y-auto">
        <div className="space-y-4">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${
                msg.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  msg.role === 'user'
                    ? 'bg-red-600 text-white'
                    : 'bg-slate-100 text-slate-800'
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-slate-100 rounded-lg p-3">Thinking...</div>
            </div>
          )}
        </div>
      </div>

      {isComplete ? (
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 text-center">
          <p className="text-emerald-700 font-semibold">
            Profile complete! Redirecting to identity verification...
          </p>
        </div>
      ) : (
        <form onSubmit={handleSend} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your response..."
            className="flex-1 border border-slate-300 rounded-lg px-4 py-2 text-slate-900 placeholder-slate-400 focus:border-red-600 focus:ring-2 focus:ring-red-600/20"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 active:bg-red-800 disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2"
          >
            Send
          </button>
        </form>
      )}
    </div>
  )
}

