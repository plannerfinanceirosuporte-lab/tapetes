import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Package, ShoppingCart, DollarSign, Users, TrendingUp, Calendar, Filter, Eye, ArrowUp, ArrowDown } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';

interface DashboardMetrics {
  totalOrders: number;
  paidOrders: number;
  monthSales: number;
  periodSales: number;
  pendingOrders: number;
  totalProducts: number;
}

type PeriodFilter = 'today' | 'yesterday' | 'week' | 'month' | 'custom';

export const AdminDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalOrders: 0,
    paidOrders: 0,
    monthSales: 0,
    periodSales: 0,
    pendingOrders: 0,
    totalProducts: 0,
  });
  const [salesData, setSalesData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>('today');
  const [customDateRange, setCustomDateRange] = useState({
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    fetchMetrics();
    fetchSalesData();
  }, [periodFilter, customDateRange]);

  const getDateRange = () => {
    const now = new Date();
    let startDate: Date;
    let endDate: Date = new Date(now);

    switch (periodFilter) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'yesterday':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
        endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 23, 59, 59);
        break;
      case 'week':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'custom':
        if (customDateRange.startDate && customDateRange.endDate) {
          startDate = new Date(customDateRange.startDate);
          endDate = new Date(customDateRange.endDate + 'T23:59:59');
        } else {
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        }
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    }

    return { startDate, endDate };
  };

  const fetchMetrics = async () => {
    if (!isSupabaseConfigured()) {
      console.warn('Supabase not configured. Using default metrics.');
      setLoading(false);
      return;
    }

    try {
      const { startDate, endDate } = getDateRange();

      const { count: totalOrders } = await supabase!
        .from('orders')
        .select('*', { count: 'exact', head: true });

      const { count: paidOrders } = await supabase!
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .in('status', ['confirmed', 'shipped', 'delivered']);

      const firstDayOfMonth = new Date();
      firstDayOfMonth.setDate(1);
      const { data: monthSalesData } = await supabase!
        .from('orders')
        .select('total_amount')
        .in('status', ['confirmed', 'shipped', 'delivered'])
        .gte('created_at', firstDayOfMonth.toISOString());

      const monthSales = monthSalesData?.reduce((acc, order) => acc + Number(order.total_amount), 0) || 0;

      const { data: periodSalesData } = await supabase!
        .from('orders')
        .select('total_amount')
        .in('status', ['confirmed', 'shipped', 'delivered'])
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

      const periodSales = periodSalesData?.reduce((acc, order) => acc + Number(order.total_amount), 0) || 0;

      const { count: pendingOrders } = await supabase!
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      const { count: totalProducts } = await supabase!
        .from('products')
        .select('*', { count: 'exact', head: true });

      setMetrics({
        totalOrders: totalOrders || 0,
        paidOrders: paidOrders || 0,
        monthSales,
        periodSales,
        pendingOrders: pendingOrders || 0,
        totalProducts: totalProducts || 0,
      });
    } catch (error) {
      console.error('Erro ao buscar métricas:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSalesData = async () => {
    if (!isSupabaseConfigured()) {
      console.warn('Supabase not configured. Using empty sales data.');
      return;
    }

    try {
      const { data } = await supabase!
        .from('orders')
        .select('created_at, total_amount')
        .in('status', ['confirmed', 'shipped', 'delivered'])
        .order('created_at', { ascending: true })
        .limit(30);

      if (data) {
        const salesByDay = data.reduce((acc: any, order) => {
          const date = new Date(order.created_at).toLocaleDateString('pt-BR');
          if (!acc[date]) {
            acc[date] = 0;
          }
          acc[date] += Number(order.total_amount);
          return acc;
        }, {});

        const chartData = Object.entries(salesByDay).map(([date, amount]) => ({
          date,
          vendas: amount,
        }));

        setSalesData(chartData);
      }
    } catch (error) {
      console.error('Erro ao buscar dados de vendas:', error);
    }
  };

  const getPeriodLabel = () => {
    switch (periodFilter) {
      case 'today': return 'Hoje';
      case 'yesterday': return 'Ontem';
      case 'week': return 'Últimos 7 dias';
      case 'month': return 'Este mês';
      case 'custom': return 'Período personalizado';
      default: return 'Hoje';
    }
  };

  const metricCards = [
    {
      title: 'Total de Pedidos',
      value: metrics.totalOrders,
      icon: ShoppingCart,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      trend: '+12%',
      trendUp: true,
    },
    {
      title: 'Pedidos Confirmados',
      value: metrics.paidOrders,
      icon: Package,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      trend: '+8%',
      trendUp: true,
    },
    {
      title: 'Receita do Mês',
      value: `R$ ${metrics.monthSales.toFixed(2).replace('.', ',')}`,
      icon: DollarSign,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      trend: '+15%',
      trendUp: true,
    },
    {
      title: `Receita ${getPeriodLabel()}`,
      value: `R$ ${metrics.periodSales.toFixed(2).replace('.', ',')}`,
      icon: TrendingUp,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
      trend: '+5%',
      trendUp: true,
    },
    {
      title: 'Pedidos Pendentes',
      value: metrics.pendingOrders,
      icon: Calendar,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      trend: '-3%',
      trendUp: false,
    },
    {
      title: 'Total de Produtos',
      value: metrics.totalProducts,
      icon: Package,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100',
      trend: '+2%',
      trendUp: true,
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loading-skeleton w-32 h-32 rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">📊 Dashboard</h1>
          <p className="text-gray-600 mt-2">Visão geral das métricas da sua loja</p>
        </div>
        <div className="flex items-center gap-2">
          <Eye className="h-5 w-5 text-gray-400" />
          <span className="text-sm text-gray-600">Atualizado agora</span>
        </div>
      </div>

      {/* Filtros de Período */}
      <div className="modern-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Filtrar por Período</h3>
        </div>
        
        <div className="flex flex-wrap gap-3 mb-4">
          {[
            { key: 'today', label: 'Hoje' },
            { key: 'yesterday', label: 'Ontem' },
            { key: 'week', label: 'Últimos 7 dias' },
            { key: 'month', label: 'Este mês' },
            { key: 'custom', label: 'Personalizado' }
          ].map((period) => (
            <button
              key={period.key}
              onClick={() => setPeriodFilter(period.key as PeriodFilter)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                periodFilter === period.key
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {period.label}
            </button>
          ))}
        </div>

        {periodFilter === 'custom' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="form-label">Data Inicial</label>
              <input
                type="date"
                value={customDateRange.startDate}
                onChange={(e) => setCustomDateRange({ ...customDateRange, startDate: e.target.value })}
                className="form-input"
              />
            </div>
            <div>
              <label className="form-label">Data Final</label>
              <input
                type="date"
                value={customDateRange.endDate}
                onChange={(e) => setCustomDateRange({ ...customDateRange, endDate: e.target.value })}
                className="form-input"
              />
            </div>
          </div>
        )}
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {metricCards.map((metric) => {
          const Icon = metric.icon;
          return (
            <div key={metric.title} className="modern-card p-6 hover-lift">
              <div className="flex items-center justify-between mb-4">
                <div className={`${metric.bgColor} p-3 rounded-xl`}>
                  <Icon className={`h-6 w-6 ${metric.color}`} />
                </div>
                <div className={`flex items-center gap-1 text-sm font-medium ${
                  metric.trendUp ? 'text-green-600' : 'text-red-600'
                }`}>
                  {metric.trendUp ? (
                    <ArrowUp className="h-4 w-4" />
                  ) : (
                    <ArrowDown className="h-4 w-4" />
                  )}
                  {metric.trend}
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">{metric.title}</p>
                <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Gráfico de Vendas */}
        <div className="modern-card p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">📈 Vendas Recentes</h3>
          {salesData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12, fill: '#64748b' }}
                  axisLine={{ stroke: '#e2e8f0' }}
                />
                <YAxis 
                  tick={{ fontSize: 12, fill: '#64748b' }}
                  axisLine={{ stroke: '#e2e8f0' }}
                />
                <Tooltip
                  formatter={(value: number) => [`R$ ${value.toFixed(2).replace('.', ',')}`, 'Vendas']}
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="vendas" 
                  stroke="#4f46e5" 
                  strokeWidth={3}
                  dot={{ fill: '#4f46e5', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: '#4f46e5', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              <div className="text-center">
                <TrendingUp className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p>Nenhum dado de vendas disponível</p>
              </div>
            </div>
          )}
        </div>

        {/* Status dos Pedidos */}
        <div className="modern-card p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">📦 Status dos Pedidos</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="font-medium text-green-800">Confirmados</span>
              </div>
              <span className="text-xl font-bold text-green-600">{metrics.paidOrders}</span>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span className="font-medium text-yellow-800">Pendentes</span>
              </div>
              <span className="text-xl font-bold text-yellow-600">{metrics.pendingOrders}</span>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="font-medium text-blue-800">Total</span>
              </div>
              <span className="text-xl font-bold text-blue-600">{metrics.totalOrders}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Ações Rápidas */}
      <div className="modern-card p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">⚡ Ações Rápidas</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <button className="btn-primary p-4 text-center">
            <Package className="h-6 w-6 mx-auto mb-2" />
            <span className="text-sm">Adicionar Produto</span>
          </button>
          
          <button className="btn-secondary p-4 text-center">
            <ShoppingCart className="h-6 w-6 mx-auto mb-2" />
            <span className="text-sm">Ver Pedidos</span>
          </button>
          
          <button className="btn-secondary p-4 text-center">
            <Users className="h-6 w-6 mx-auto mb-2" />
            <span className="text-sm">Gerenciar Usuários</span>
          </button>
          
          <button className="btn-secondary p-4 text-center">
            <TrendingUp className="h-6 w-6 mx-auto mb-2" />
            <span className="text-sm">Relatórios</span>
          </button>
        </div>
      </div>
    </div>
  );
};