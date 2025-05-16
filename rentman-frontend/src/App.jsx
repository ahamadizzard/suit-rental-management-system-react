import './App.css'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import HomePage from './pages/home.jsx'
import LoginPage from './pages/login.jsx'
import RegisterPage from './pages/register.jsx'
import AdminPage from './pages/adminPage.jsx'
import ManagerPage from './pages/managerPage.jsx'
import CashierPage from './pages/cashierPage.jsx'
import { Toaster } from 'react-hot-toast'

function App() {

  return (
    <BrowserRouter position="top-right">
      <div>
        <Toaster />
        <Routes path="/*">
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/admin/*" element={<AdminPage />} />
          <Route path="/manager/*" element={<ManagerPage />} />
          <Route path="/cashier/*" element={<CashierPage />} />
        </Routes>

      </div>
    </BrowserRouter>
  )
}

export default App
