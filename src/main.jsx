import React, { useState, useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Layout from '../Layout'
import Home from '../Pages/Home'
import Tags from '../Pages/Tags'
import About from '../Pages/About'
import Archive from '../Pages/Archive'
import CreatePost from '../Pages/CreatePost'
import ViewPost from '../Pages/ViewPost'
import AuthModal from '../Components/AuthModal'
import { getUserMode } from '../utils/auth'
import '../src/main.css'

const queryClient = new QueryClient()

function App() {
  const [userMode, setUserMode] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    const mode = getUserMode();
    if (!mode) {
      setShowAuthModal(true);
    } else {
      setUserMode(mode);
    }
  }, []);

  const handleAuthSelect = (mode) => {
    setUserMode(mode);
    setShowAuthModal(false);
  };

  if (showAuthModal) {
    return <AuthModal onSelect={handleAuthSelect} />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/tags" element={<Tags />} />
            <Route path="/about" element={<About />} />
            <Route path="/archive" element={<Archive />} />
            <Route path="/create-post" element={<CreatePost />} />
            <Route path="/view-post" element={<ViewPost />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)

