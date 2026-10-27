'use client';

import { useState, useEffect } from 'react';
import api from '@/utils/api';
import toast from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';
import {
  HiOutlineClipboardList,
  HiOutlineTruck,
  HiOutlineCheck,
  HiOutlineCurrencyRupee,
  HiOutlineUserGroup,
  HiOutlineCube,
} from 'react-icons/hi';

const PERIOD_OPTIONS = [
  { label: 'Weekly', value: 'weekly' },
  { label: 'Monthly', value: 'monthly' },
  { label: 'Quarterly', value: 'quarterly' },
  { label: 'Yearly', value: 'yearly' },
];

const PIE_COLORS = ['#94a3b8', '#3b82f6', '#f59e0b', '#10b981'];

export default function DashboardPage() {
  const { user } = useAuth();
  const [period, setPeriod] = useState('monthly');
  const [summary, setSummary] = useState(null);
  const [ordersByContact, setOrdersByContact] = useState([]);
  const [spendingTrend, setSpendingTrend] = useState([]);
  const [topMedicines, setTopMedicines] = useState([]);
  const [statusBreakdown, setStatusBreakdown] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, [period]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [summaryRes, contactsRes, trendRes, medsRes, statusRes] =
        await Promise.all([
          api.get('/dashboard/summary'),
          api.get(`/dashboard/orders-by-contact?period=${period}`),
          api.get(`/dashboard/spending-trend?period=${period}`),
          api.get(`/dashboard/top-medicines?period=${period}`),
          api.get('/dashboard/status-breakdown'),
        ]);

      setSummary(summaryRes.data.data);
      setOrdersByContact(contactsRes.data.data || []);
      setSpendingTrend(trendRes.data.data || []);
      setTopMedicines(medsRes.data.data || []);
      setStatusBreakdown(statusRes.data.data || []);
    } catch (error) {
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto" />
          <p className="mt-3 text-surface-500 text-sm">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const statusLabels = {
    drafted: 'Drafted',
    ordered: 'Ordered',
    partially_arrived: 'Partial',
    arrived: 'Arrived',
  };

  const pieData = statusBreakdown.map((s) => ({
    name: statusLabels[s._id] || s._id,
    value: s.count,
  }));

  return (
    <div>
      <div className="page-header flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-title">
            Welcome back, {user?.name} 👋
          </h1>
          <p className="page-subtitle">{user?.shopName} — Dashboard</p>
        </div>

        {/* Period Selector */}
        <div className="flex gap-1 bg-surface-100 rounded-xl p-1">
          {PERIOD_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setPeriod(opt.value)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${period === opt.value
                  ? 'bg-white text-primary-700 shadow-sm'
                  : 'text-surface-500 hover:text-surface-700'
                }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stat Cards */}
      {summary && (
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
          <div className="stat-card">
            <div className="flex items-center gap-2 text-surface-400">
              <HiOutlineClipboardList size={18} />
              <span className="text-xs font-medium">Total Orders</span>
            </div>
            <p className="stat-value mt-2">{summary.totalOrders}</p>
          </div>

          <div className="stat-card">
            <div className="flex items-center gap-2 text-amber-500">
              <HiOutlineTruck size={18} />
              <span className="text-xs font-medium">Pending</span>
            </div>
            <p className="stat-value mt-2">{summary.pendingArrivals}</p>
          </div>

          <div className="stat-card">
            <div className="flex items-center gap-2 text-emerald-500">
              <HiOutlineCheck size={18} />
              <span className="text-xs font-medium">Arrived</span>
            </div>
            <p className="stat-value mt-2">{summary.arrivedOrders}</p>
          </div>

          <div className="stat-card">
            <div className="flex items-center gap-2 text-primary-500">
              <HiOutlineCurrencyRupee size={18} />
              <span className="text-xs font-medium">Spending</span>
            </div>
            <p className="stat-value mt-2">
              ₹{(summary.totalSpending || 0).toLocaleString()}
            </p>
          </div>

          <div className="stat-card">
            <div className="flex items-center gap-2 text-surface-400">
              <HiOutlineUserGroup size={18} />
              <span className="text-xs font-medium">Contacts</span>
            </div>
            <p className="stat-value mt-2">{summary.totalContacts}</p>
          </div>

          <div className="stat-card">
            <div className="flex items-center gap-2 text-surface-400">
              <HiOutlineCube size={18} />
              <span className="text-xs font-medium">Medicines</span>
            </div>
            <p className="stat-value mt-2">{summary.totalMedicines}</p>
          </div>
        </div>
      )}

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Orders by Contact */}
        <div className="card lg:col-span-2">
          <h3 className="text-sm font-semibold text-surface-500 uppercase tracking-wider mb-4">
            Orders by Contact ({period})
          </h3>
          {ordersByContact.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={ordersByContact}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  dataKey="_id"
                  tick={{ fontSize: 12, fill: '#64748b' }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{
                    background: '#1e293b',
                    border: 'none',
                    borderRadius: '12px',
                    color: '#f8fafc',
                    fontSize: '13px',
                  }}
                />
                <Bar
                  dataKey="orderCount"
                  fill="#3b82f6"
                  radius={[6, 6, 0, 0]}
                  name="Orders"
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-surface-400 text-sm">
              No data for this period
            </div>
          )}
        </div>

        {/* Status Breakdown */}
        <div className="card">
          <h3 className="text-sm font-semibold text-surface-500 uppercase tracking-wider mb-4">
            Order Status
          </h3>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell
                      key={entry.name}
                      fill={PIE_COLORS[index % PIE_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: '#1e293b',
                    border: 'none',
                    borderRadius: '12px',
                    color: '#f8fafc',
                    fontSize: '13px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-surface-400 text-sm">
              No data
            </div>
          )}
          {/* Legend */}
          <div className="flex flex-wrap gap-3 mt-2 justify-center">
            {pieData.map((item, index) => (
              <div key={item.name} className="flex items-center gap-1.5">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{
                    background: PIE_COLORS[index % PIE_COLORS.length],
                  }}
                />
                <span className="text-xs text-surface-500">
                  {item.name} ({item.value})
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Spending Trend */}
        <div className="card">
          <h3 className="text-sm font-semibold text-surface-500 uppercase tracking-wider mb-4">
            Spending Trend ({period})
          </h3>
          {spendingTrend.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={spendingTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  dataKey="_id"
                  tick={{ fontSize: 11, fill: '#64748b' }}
                />
                <YAxis tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{
                    background: '#1e293b',
                    border: 'none',
                    borderRadius: '12px',
                    color: '#f8fafc',
                    fontSize: '13px',
                  }}
                  formatter={(value) => [`₹${value.toLocaleString()}`, 'Spent']}
                />
                <Line
                  type="monotone"
                  dataKey="totalSpent"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ fill: '#3b82f6', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-surface-400 text-sm">
              No data for this period
            </div>
          )}
        </div>

        {/* Top Medicines */}
        <div className="card">
          <h3 className="text-sm font-semibold text-surface-500 uppercase tracking-wider mb-4">
            Top Ordered Medicines ({period})
          </h3>
          {topMedicines.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topMedicines} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis type="number" tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis
                  dataKey="label"
                  type="category"
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  width={150}
                />
                <Tooltip
                  contentStyle={{
                    background: '#1e293b',
                    border: 'none',
                    borderRadius: '12px',
                    color: '#f8fafc',
                    fontSize: '13px',
                  }}
                />
                <Bar
                  dataKey="totalQuantity"
                  fill="#10b981"
                  radius={[0, 6, 6, 0]}
                  name="Quantity"
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-surface-400 text-sm">
              No data for this period
            </div>
          )}
        </div>
      </div>
    </div>
  );
}