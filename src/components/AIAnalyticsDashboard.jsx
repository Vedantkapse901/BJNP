import { useState, useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { MessageCircle, TrendingUp, Zap, Calendar } from 'lucide-react'
import { GlassCard } from './ui/GlassCard'

const COLORS = ['#D90429', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899']

export function AIAnalyticsDashboard({ conversations = [], isLoading = false }) {
  const [dateRange, setDateRange] = useState('week') // week, month, all

  const stats = useMemo(() => {
    if (!conversations || conversations.length === 0) {
      return {
        totalChats: 0,
        totalTokens: 0,
        averageTokens: 0,
        topQueries: [],
        chatsByDay: [],
        chatsByUser: [],
        mostCommonTopics: [],
      }
    }

    // Total stats
    const totalChats = conversations.length
    const totalTokens = conversations.reduce((sum, c) => sum + (c.tokens_used || 0), 0)
    const averageTokens = totalTokens / totalChats

    // Top queries
    const topQueries = conversations
      .sort((a, b) => (b.tokens_used || 0) - (a.tokens_used || 0))
      .slice(0, 5)
      .map(c => ({
        query: c.query.substring(0, 50) + (c.query.length > 50 ? '...' : ''),
        tokens: c.tokens_used,
        date: new Date(c.created_at).toLocaleDateString(),
      }))

    // Conversations by day
    const byDay = {}
    conversations.forEach(c => {
      const date = new Date(c.created_at).toLocaleDateString()
      byDay[date] = (byDay[date] || 0) + 1
    })
    const chatsByDay = Object.entries(byDay)
      .map(([date, count]) => ({ date, chats: count }))
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(-7)

    // Conversations by user
    const byUser = {}
    conversations.forEach(c => {
      const userId = c.user_id || 'Anonymous'
      byUser[userId] = (byUser[userId] || 0) + 1
    })
    const chatsByUser = Object.entries(byUser)
      .map(([userId, count]) => ({ userId: userId.substring(0, 8), chats: count }))
      .sort((a, b) => b.chats - a.chats)
      .slice(0, 5)

    // Most common topics (based on query keywords)
    const keywords = {}
    conversations.forEach(c => {
      const query = c.query.toLowerCase()
      const topics = ['math', 'physics', 'chemistry', 'biology', 'formula', 'concept', 'problem', 'exam', 'doubt']
      topics.forEach(topic => {
        if (query.includes(topic)) {
          keywords[topic] = (keywords[topic] || 0) + 1
        }
      })
    })
    const mostCommonTopics = Object.entries(keywords)
      .map(([topic, count]) => ({ topic, count }))
      .sort((a, b) => b.count - a.count)

    return {
      totalChats,
      totalTokens,
      averageTokens: Math.round(averageTokens),
      topQueries,
      chatsByDay,
      chatsByUser,
      mostCommonTopics,
    }
  }, [conversations])

  if (isLoading) {
    return (
      <GlassCard className="p-6">
        <div className="flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#D90429] border-t-transparent"></div>
          <p className="ml-4 text-slate-600">Loading AI analytics...</p>
        </div>
      </GlassCard>
    )
  }

  if (conversations.length === 0) {
    return (
      <GlassCard className="p-12 text-center">
        <MessageCircle className="mx-auto h-12 w-12 text-slate-300 mb-4" />
        <p className="text-slate-600 font-semibold">No AI conversations yet</p>
        <p className="text-sm text-slate-500 mt-2">
          Conversations will appear here as students use the Doubt Chatbot
        </p>
      </GlassCard>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Zap className="h-6 w-6 text-[#D90429]" />
          AI Doubt Solver Analytics
        </h2>
        <select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm"
        >
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="all">All Time</option>
        </select>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <GlassCard className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-slate-600 font-semibold uppercase mb-1">Total Conversations</p>
              <p className="text-3xl font-bold text-slate-900">{stats.totalChats}</p>
            </div>
            <MessageCircle className="h-8 w-8 text-[#D90429] opacity-20" />
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <div>
            <p className="text-xs text-slate-600 font-semibold uppercase mb-1">Total Tokens Used</p>
            <p className="text-3xl font-bold text-slate-900">{stats.totalTokens.toLocaleString()}</p>
            <p className="text-xs text-slate-500 mt-1">API usage</p>
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <div>
            <p className="text-xs text-slate-600 font-semibold uppercase mb-1">Avg Tokens/Chat</p>
            <p className="text-3xl font-bold text-slate-900">{stats.averageTokens}</p>
            <p className="text-xs text-slate-500 mt-1">Per conversation</p>
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <div>
            <p className="text-xs text-slate-600 font-semibold uppercase mb-1">Estimated Cost</p>
            <p className="text-3xl font-bold text-slate-900">₹{(stats.totalTokens * 0.00001).toFixed(2)}</p>
            <p className="text-xs text-slate-500 mt-1">~₹0.001 per 1K tokens</p>
          </div>
        </GlassCard>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Conversations Over Time */}
        {stats.chatsByDay.length > 0 && (
          <GlassCard className="p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Conversations Over Time</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.chatsByDay}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#f1f5f9' }} />
                <Bar dataKey="chats" fill="#D90429" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </GlassCard>
        )}

        {/* Top Topics */}
        {stats.mostCommonTopics.length > 0 && (
          <GlassCard className="p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Top Topics Asked</h3>
            <div className="space-y-3">
              {stats.mostCommonTopics.map((topic, idx) => (
                <div key={topic.topic} className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-700">{topic.topic}</span>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-32 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#D90429] rounded-full"
                        style={{ width: `${(topic.count / stats.mostCommonTopics[0].count) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-bold text-slate-900 w-8">{topic.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        )}
      </div>

      {/* Top Queries */}
      {stats.topQueries.length > 0 && (
        <GlassCard className="p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Most Resource-Intensive Queries</h3>
          <div className="space-y-3">
            {stats.topQueries.map((query, idx) => (
              <div key={idx} className="p-4 bg-slate-50 rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <p className="text-sm text-slate-900 font-semibold">{query.query}</p>
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-[#D90429]/10 rounded text-[#D90429] text-xs font-bold">
                    {query.tokens} tokens
                  </span>
                </div>
                <p className="text-xs text-slate-500">{query.date}</p>
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      {/* Usage Summary */}
      <GlassCard className="p-6 bg-blue-50 border border-blue-200">
        <h3 className="text-lg font-bold text-blue-900 mb-2">💡 Insights</h3>
        <ul className="text-sm text-blue-800 space-y-2">
          <li>• Students have asked <strong>{stats.totalChats} questions</strong> using the AI doubt solver</li>
          <li>• Average conversation uses <strong>{stats.averageTokens} tokens</strong></li>
          <li>• Estimated API cost: <strong>₹{(stats.totalTokens * 0.00001).toFixed(2)}</strong></li>
          {stats.mostCommonTopics.length > 0 && (
            <li>• Most asked about: <strong>{stats.mostCommonTopics[0].topic}</strong></li>
          )}
        </ul>
      </GlassCard>
    </div>
  )
}
