import React, { useState, createContext, useContext } from "react"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import Layout from "./components/Layout"
import Login from "./pages/Login"
import Dashboard from "./pages/Dashboard"
import Incidents from "./pages/Incidents"
import IncidentDetail from "./pages/IncidentDetail"
import Devices from "./pages/Devices"
import Alerts from "./pages/Alerts"
import Compliance from "./pages/Compliance"
import ThreatHunt from "./pages/ThreatHunt"
import AttackCoverage from "./pages/AttackCoverage"
import Rules from "./pages/Rules"
import Playbooks from "./pages/Playbooks"
import Reports from "./pages/Reports"
import Integrations from "./pages/Integrations"
import Settings from "./pages/Settings"
import HomePage from "./pages/HomePage"
import ComplianceTimers from "./pages/ComplianceTimers"
import ThreatIntel from "./pages/ThreatIntel"
import ActionsLog from "./pages/ActionsLog"
import Users from "./pages/Users"

export const AuthContext = createContext(null)
export function useAuth() { return useContext(AuthContext) }

function ProtectedRoute({ children }) {
  const { user } = useAuth()
  return children
}

export default function App() {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("k7xdr_user")) } catch { return null }
  })
  const login = (userData) => {
    localStorage.setItem("k7xdr_user", JSON.stringify(userData))
    setUser(userData)
  }
  const logout = () => {
    localStorage.removeItem("k7xdr_user")
    setUser(null)
  }
  return (
    <AuthContext.Provider value={{ user, setUser: login, logout }}>
      <BrowserRouter>
        <Routes>
          <Route path="/home" element={<HomePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route index element={<Dashboard />} />
            <Route path="incidents" element={<Incidents />} />
            <Route path="incidents/:id" element={<IncidentDetail />} />
            <Route path="devices" element={<Devices />} />
            <Route path="alerts" element={<Alerts />} />
            <Route path="compliance" element={<Compliance />} />
            <Route path="threat-hunt" element={<ThreatHunt />} />
            <Route path="attack-coverage" element={<AttackCoverage />} />
            <Route path="rules" element={<Rules />} />
            <Route path="playbooks" element={<Playbooks />} />
            <Route path="reports" element={<Reports />} />
            <Route path="integrations" element={<Integrations />} />
            <Route path="settings" element={<Settings />} />
            <Route path="compliance-timers" element={<ComplianceTimers />} />
            <Route path="threat-intel" element={<ThreatIntel />} />
            <Route path="actions-log" element={<ActionsLog />} />
            <Route path="users" element={<Users />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthContext.Provider>
  )
}