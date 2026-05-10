import { BrowserRouter, Routes, Route } from 'react-router-dom'
import AppLayout from '@/components/layout/AppLayout'
import Dashboard from '@/pages/Dashboard'
import QuestionLog from '@/pages/QuestionLog'
import Planner from '@/pages/Planner'
import CheatSheets from '@/pages/CheatSheets'
import AIChat from '@/pages/AIChat'
import Settings from '@/pages/Settings'
import Companies from '@/pages/Companies'
import CompanyDetail from '@/pages/CompanyDetail'
import Data from '@/pages/Data'
import Snippets from '@/pages/Snippets'
import Flashcards from '@/pages/Flashcards'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="log" element={<QuestionLog />} />
          <Route path="planner" element={<Planner />} />
          <Route path="data" element={<Data />} />
          <Route path="snippets" element={<Snippets />} />
          <Route path="flashcards" element={<Flashcards />} />
          <Route path="cheatsheets" element={<CheatSheets />} />
          <Route path="chat" element={<AIChat />} />
          <Route path="companies" element={<Companies />} />
          <Route path="companies/:slug" element={<CompanyDetail />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
