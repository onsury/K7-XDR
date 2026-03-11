import React, { useState, useEffect } from "react"
import { api } from "../lib/api"

export default function ThreatIntel() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api("/api/threat-intel/feeds")
      .then(d => setData(d.feeds || d || []))
      .catch(() => setData([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Threat Intelligence</h1>
      {loading ? (
        <div className="text-gray-500">Loading threat feeds...</div>
      ) : (
        <div className="grid gap-4">
          {data.length === 0 ? (
            <div className="bg-white rounded-lg border p-8 text-center text-gray-400">No threat intel data available</div>
          ) : data.map((item, i) => (
            <div key={i} className="bg-white rounded-lg border p-4 flex items-start gap-4">
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                item.severity === "critical" ? "bg-red-100 text-red-700" :
                item.severity === "high" ? "bg-orange-100 text-orange-700" :
                item.severity === "medium" ? "bg-yellow-100 text-yellow-700" :
                "bg-gray-100 text-gray-700"}`}>{item.severity || "info"}</span>
              <div className="flex-1">
                <div className="font-medium text-gray-900">{item.title || item.indicator || item.name}</div>
                <div className="text-sm text-gray-500 mt-1">{item.description || item.type}</div>
              </div>
              <div className="text-xs text-gray-400">{item.source || "K7 Threat Lab"}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
