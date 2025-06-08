
import { api } from "../libs/api"
import { Alert } from "./Alert"
import { LoadingSpinner } from "./LoadingSpinner"
import { useState, useEffect } from "react"
import {
  Users,
  Calendar,
  FileText,
  Shield,
  Stethoscope,
  DollarSign,
  FlaskConical,
  Boxes,
  Bed,
  AlarmClock,
  Scissors,
  Plus,
  TrendingUp,
  Activity,
  Clock,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
} from "lucide-react"

export const Dashboard = ({ onNavigate }) => {
  const [stats, setStats] = useState({})
  const [recentActivities, setRecentActivities] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)

        // Fetch all dashboard data
        const [statsData, appointmentsData, emergenciesData, blockchainData] = await Promise.all([
          api.get("/stats"),
          api.get("/appointments"),
          api.get("/emergencies"),
          api.get("/blockchain"),
        ])

        setStats(statsData)

        // Create recent activities from various sources
        const activities = [
          ...appointmentsData.slice(-5).map((apt) => ({
            id: apt.id,
            type: "appointment",
            title: `Appointment scheduled`,
            description: `${apt.patientName} with ${apt.doctorName}`,
            time: apt.createdAt,
            icon: Calendar,
            color: "text-blue-400",
          })),
          ...emergenciesData
            .filter((e) => e.status === "active")
            .slice(-3)
            .map((emergency) => ({
              id: emergency.id,
              type: "emergency",
              title: "Emergency case",
              description: `${emergency.patientName} - ${emergency.severity}`,
              time: emergency.createdAt,
              icon: AlertTriangle,
              color: "text-red-400",
            })),
          ...blockchainData.slice(-3).map((block) => ({
            id: block.index,
            type: "blockchain",
            title: "Blockchain transaction",
            description: block.data.type || "New block added",
            time: new Date(block.timestamp).toISOString(),
            icon: Shield,
            color: "text-purple-400",
          })),
        ]
          .sort((a, b) => new Date(b.time) - new Date(a.time))
          .slice(0, 8)

        setRecentActivities(activities)
        setError(null)
      } catch (error) {
        setError("Failed to load dashboard data")
        console.error("Error fetching dashboard data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()

    // Refresh data every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000)
    return () => clearInterval(interval)
  }, [])

  if (loading) return <LoadingSpinner message="Loading dashboard..." />

  const statCards = [
    {
      label: "Total Patients",
      value: stats.totalPatients,
      icon: Users,
      color: "from-blue-500 to-blue-600",
      change: "+12%",
      trend: "up",
    },
    {
      label: "Active Doctors",
      value: stats.totalDoctors,
      icon: Stethoscope,
      color: "from-emerald-500 to-emerald-600",
      change: "+3%",
      trend: "up",
    },
    {
      label: "Today's Appointments",
      value: stats.totalAppointments,
      icon: Calendar,
      color: "from-amber-500 to-amber-600",
      change: "+8%",
      trend: "up",
    },
    {
      label: "Medical Records",
      value: stats.totalMedicalRecords,
      icon: FileText,
      color: "from-purple-500 to-purple-600",
      change: "+15%",
      trend: "up",
    },
    {
      label: "Lab Tests",
      value: stats.totalLabTests,
      icon: FlaskConical,
      color: "from-cyan-500 to-cyan-600",
      change: "+5%",
      trend: "up",
    },
    {
      label: "Active Surgeries",
      value: stats.totalSurgeries,
      icon: Scissors,
      color: "from-pink-500 to-pink-600",
      change: "-2%",
      trend: "down",
    },
    {
      label: "Current Admissions",
      value: stats.totalAdmissions,
      icon: Plus,
      color: "from-indigo-500 to-indigo-600",
      change: "+7%",
      trend: "up",
    },
    {
      label: "Pending Bills",
      value: stats.pendingBills,
      icon: DollarSign,
      color: "from-rose-500 to-rose-600",
      change: "-10%",
      trend: "down",
    },
    {
      label: "Inventory Items",
      value: stats.totalInventoryItems,
      icon: Boxes,
      color: "from-orange-500 to-orange-600",
      change: "+4%",
      trend: "up",
    },
    {
      label: "Active Emergencies",
      value: stats.activeEmergencies,
      icon: AlarmClock,
      color: "from-red-500 to-red-600",
      change: "0%",
      trend: "neutral",
    },
    {
      label: "Available Rooms",
      value: stats.availableRooms,
      icon: Bed,
      color: "from-green-500 to-green-600",
      change: "+2%",
      trend: "up",
    },
    {
      label: "Blockchain Blocks",
      value: stats.blockchainBlocks,
      icon: Shield,
      color: "from-violet-500 to-violet-600",
      change: "+25%",
      trend: "up",
    },
  ]

  const quickActions = [
    { label: "Add Patient", action: () => onNavigate("patients"), icon: Users, color: "from-black to-blue-800" },
    {
      label: "Schedule Appointment",
      action: () => onNavigate("appointments"),
      icon: Calendar,
      color: "from-black to-green-800",
    },
    {
      label: "Emergency Alert",
      action: () => onNavigate("emergencies"),
      icon: AlertTriangle,
      color: "from-black to-red-800",
    },
    {
      label: "View Records",
      action: () => onNavigate("records"),
      icon: FileText,
      color: "from-black to-purple-800",
    },
  ]

  return (
    <div className="space-y-8 animate-fadeIn">
      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-black to-black backdrop-blur-xl rounded-3xl border border-white p-8 hover:border-gray-600/50 transition-all duration-500 hover:scale-10 hover:shadow-2xl hover:shadow-blue-500/10">
        <div className="absolute inset-0 bg-gradient-to-r from-black to-black border-white"></div>
        <div className="relative z-10">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-black to-purple-800 rounded-2xl  flex items-center border-purple-500 justify-center">
              <Activity className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-purple-400 to-purple-950 bg-clip-text text-transparent">
                Elevate Your
              </h1>
              <h2 className="text-4xl font-bold bg-gradient-to-r from-white via-purple-400 to-purple-950 bg-clip-text text-transparent">
                Healthcare Vision
              </h2>
            </div>
          </div>
          <p className="text-gray-300 text-lg max-w-2xl">
            Crafting exceptional healthcare experiences through innovative technology and cutting-edge blockchain
            solutions.
          </p>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 ">
            <div className="bg-black backdrop-blur-sm rounded-xl p-4 border border-gray-300 hover:border-gray-600/50 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/10">
              <div className="flex items-center space-x-2 ">
                <TrendingUp className="h-5 w-5 text-green-200" />
                <span className="text-sm text-gray-300">System Health</span>
              </div>
              <p className="text-2xl font-bold text-green-200 mt-1">98.5%</p>
            </div>
            <div className="bg-black backdrop-blur-sm rounded-xl p-4 border border-gray-300 hover:border-gray-600/50 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/10">
              <div className="flex items-center space-x-2">
                <Zap className="h-5 w-5 text-yellow-200" />
                <span className="text-sm text-gray-300">Response Time</span>
              </div>
              <p className="text-2xl font-bold text-yellow-200 mt-1">0.8s</p>
            </div>
            <div className="bg-black backdrop-blur-sm rounded-xl p-4 border border-gray-300 hover:border-gray-600/50 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/10">
              <div className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-blue-200" />
                <span className="text-sm text-gray-300">Security</span>
              </div>
              <p className="text-2xl font-bold text-blue-200 mt-1">100%</p>
            </div>
            <div className="bg-black backdrop-blur-sm rounded-xl p-4 border border-gray-300 hover:border-gray-600/50 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/10">
              <div className="flex items-center space-x-2">
                <Activity className="h-5 w-5 text-purple-200" />
                <span className="text-sm text-gray-300">Active Users</span>
              </div>
              <p className="text-2xl font-bold text-purple-200 mt-1">{stats.totalDoctors + stats.totalPatients}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {statCards.map(({ label, value, icon: Icon, color, change, trend }, idx) => (
          <div
            key={idx}
            className="group relative bg-gradient-to-br from-black to-black backdrop-blur-xl rounded-2xl border border-gray-700 p-6 hover:border-black transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-black"
            style={{ animationDelay: `${idx * 100}ms` }}
          >
            <div
              className={`absolute inset-0 bg-gradient-to-br ${color} opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity duration-500`}
            ></div>

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div
                  className={`w-12 h-12 bg-gradient-to-br ${color} rounded-xl flex items-center justify-center shadow-lg`}
                >
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <div
                  className={`flex items-center space-x-1 text-sm ${
                    trend === "up" ? "text-green-400" : trend === "down" ? "text-red-400" : "text-gray-400"
                  }`}
                >
                  {trend === "up" ? (
                    <ArrowUpRight className="h-4 w-4" />
                  ) : trend === "down" ? (
                    <ArrowDownRight className="h-4 w-4" />
                  ) : null}
                  <span>{change}</span>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-400 mb-1">{label}</p>
                <p className="text-3xl font-bold text-white">{value || 0}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions & Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Actions */}
        <div className="bg-gradient-to-br from-black to-gray backdrop-blur-xl rounded-2xl border border-gray-700 p-6">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center">
            <Zap className="h-5 w-5 mr-2 text-yellow-400" />
            Quick Actions
          </h3>
          <div className="space-y-3 ">
            {quickActions.map((action, idx) => (
              <button
                key={idx}
                onClick={action.action}
                className={`w-full flex items-center space-x-3 p-4 bg-gradient-to-r ${action.color} rounded-xl text-white  font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg`}
              >
                <action.icon className="h-5 w-5" />
                <span>{action.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Recent Activities */}
        <div className="lg:col-span-2 bg-gradient-to-br from-black to-black backdrop-blur-xl rounded-2xl border border-gray-700/50 p-6">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center">
            <Clock className="h-5 w-5 mr-2 text-blue-400" />
            Recent Activities
          </h3>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {recentActivities.map((activity, idx) => (
              <div
                key={activity.id}
                className="flex items-center space-x-4 p-4 bg-black backdrop-blur-sm rounded-xl border border-gray-700 hover:bg-black transition-all duration-300"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                <div className={`w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center ${activity.color}`}>
                  <activity.icon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="text-white font-medium">{activity.title}</p>
                  <p className="text-gray-400 text-sm">{activity.description}</p>
                </div>
                <div className="text-xs text-gray-500">{new Date(activity.time).toLocaleTimeString()}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
