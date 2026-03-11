import React from 'react'
import { useAuth } from '../App'

export default function Settings() {
  const { user } = useAuth()

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 mt-1">Platform configuration</p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h3 className="font-semibold text-gray-900 mb-3">Current User</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between"><span className="text-gray-500">Name</span><span className="text-gray-900">{user?.name}</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Email</span><span className="text-gray-900">{user?.email}</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Role</span><span className="text-gray-900">{user?.role}</span></div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h3 className="font-semibold text-gray-900 mb-3">Platform Info</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between"><span className="text-gray-500">Platform</span><span className="text-gray-900">K7 XDR</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Version</span><span className="text-gray-900">1.0.0-mvp</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Backend</span><span className="text-gray-900">FastAPI + Firebase</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Frontend</span><span className="text-gray-900">React + Vite + Tailwind</span></div>
          <div className="flex justify-between"><span className="text-gray-500">K7 Engine</span><span className="text-gray-900">v25.2.1 (Connected)</span></div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h3 className="font-semibold text-gray-900 mb-3">K7 Integration Keys</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between"><span className="text-gray-500">Scan Engine API</span><span className="font-mono text-gray-400">••••••••••••k7se</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Threat Intel API</span><span className="font-mono text-gray-400">••••••••••••k7ti</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Deception Tech API</span><span className="font-mono text-gray-400">••••••••••••k7dt</span></div>
        </div>
      </div>
    </div>
  )
}