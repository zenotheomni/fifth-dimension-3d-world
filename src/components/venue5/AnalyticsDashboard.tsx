import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Clock, 
  MessageSquare, 
  Eye, 
  Heart,
  Share2,
  Download,
  Calendar,
  Filter,
  RefreshCw
} from 'lucide-react';

interface AnalyticsData {
  overview: {
    totalViewers: number;
    peakViewers: number;
    totalRevenue: number;
    totalMessages: number;
    averageWatchTime: number;
    engagementRate: number;
  };
  viewerMetrics: {
    hourly: Array<{ hour: string; viewers: number }>;
    demographics: Array<{ ageGroup: string; percentage: number }>;
    retention: Array<{ minute: number; percentage: number }>;
  };
  revenueMetrics: {
    totalRevenue: number;
    ticketSales: number;
    donations: number;
    merchandise: number;
    dailyRevenue: Array<{ date: string; revenue: number }>;
    ticketTypes: Array<{ type: string; count: number; revenue: number }>;
  };
  engagementMetrics: {
    chatActivity: Array<{ hour: string; messages: number }>;
    reactions: Array<{ type: string; count: number }>;
    shares: number;
    downloads: number;
  };
}

interface AnalyticsDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  eventId: string;
  currentUser: any;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  isOpen,
  onClose,
  eventId,
  currentUser
}) => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d' | 'all'>('24h');
  const [activeTab, setActiveTab] = useState<'overview' | 'viewers' | 'revenue' | 'engagement'>('overview');

  useEffect(() => {
    if (isOpen) {
      fetchAnalytics();
    }
  }, [isOpen, timeRange]);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`http://localhost:4000/api/events/${eventId}/analytics?range=${timeRange}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('theatre_token')}`
        }
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to fetch analytics');
      }

      const data = await response.json();
      setAnalyticsData(data);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch analytics');
      // Use mock data for demonstration
      setAnalyticsData(generateMockAnalytics());
    } finally {
      setIsLoading(false);
    }
  };

  const generateMockAnalytics = (): AnalyticsData => {
    const now = new Date();
    const hours = Array.from({ length: 24 }, (_, i) => {
      const hour = new Date(now.getTime() - (23 - i) * 60 * 60 * 1000);
      return {
        hour: hour.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        viewers: Math.floor(Math.random() * 500) + 100,
        messages: Math.floor(Math.random() * 200) + 50
      };
    });

    return {
      overview: {
        totalViewers: 2847,
        peakViewers: 1243,
        totalRevenue: 45670,
        totalMessages: 3421,
        averageWatchTime: 47.3,
        engagementRate: 23.7
      },
      viewerMetrics: {
        hourly: hours.map(h => ({ hour: h.hour, viewers: h.viewers })),
        demographics: [
          { ageGroup: '18-24', percentage: 35 },
          { ageGroup: '25-34', percentage: 28 },
          { ageGroup: '35-44', percentage: 20 },
          { ageGroup: '45-54', percentage: 12 },
          { ageGroup: '55+', percentage: 5 }
        ],
        retention: Array.from({ length: 60 }, (_, i) => ({
          minute: i + 1,
          percentage: Math.max(0, 100 - (i * 1.2) + Math.random() * 10)
        }))
      },
      revenueMetrics: {
        totalRevenue: 45670,
        ticketSales: 38920,
        donations: 4200,
        merchandise: 2550,
        dailyRevenue: Array.from({ length: 7 }, (_, i) => ({
          date: new Date(now.getTime() - (6 - i) * 24 * 60 * 60 * 1000).toLocaleDateString(),
          revenue: Math.floor(Math.random() * 8000) + 2000
        })),
        ticketTypes: [
          { type: 'General', count: 1247, revenue: 31175 },
          { type: 'VIP', count: 89, revenue: 6675 },
          { type: 'Backstage', count: 23, revenue: 3450 }
        ]
      },
      engagementMetrics: {
        chatActivity: hours.map(h => ({ hour: h.hour, messages: h.messages })),
        reactions: [
          { type: '❤️', count: 1247 },
          { type: '🔥', count: 892 },
          { type: '👏', count: 634 },
          { type: '🎉', count: 423 },
          { type: '😍', count: 298 }
        ],
        shares: 156,
        downloads: 89
      }
    };
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const formatPercentage = (num: number) => {
    return `${num.toFixed(1)}%`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg shadow-xl w-full max-w-7xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-2xl font-bold text-white flex items-center">
            <BarChart3 className="w-6 h-6 mr-2" />
            Analytics Dashboard
          </h2>
          <div className="flex items-center space-x-4">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as any)}
              className="px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="all">All Time</option>
            </select>
            <button
              onClick={fetchAnalytics}
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg flex items-center transition-colors"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-700">
          {[
            { id: 'overview', label: 'Overview', icon: TrendingUp },
            { id: 'viewers', label: 'Viewers', icon: Users },
            { id: 'revenue', label: 'Revenue', icon: DollarSign },
            { id: 'engagement', label: 'Engagement', icon: MessageSquare }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={`flex items-center px-6 py-3 text-sm font-medium transition-colors ${
                activeTab === id
                  ? 'text-blue-400 border-b-2 border-blue-400 bg-blue-900/20'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4 mr-2" />
              {label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-lg mb-6 flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2" />
              {error}
            </div>
          )}

          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : analyticsData ? (
            <>
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* Key Metrics */}
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    <div className="bg-gray-800 p-4 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-400">Total Viewers</p>
                          <p className="text-2xl font-bold text-white">{formatNumber(analyticsData.overview.totalViewers)}</p>
                        </div>
                        <Users className="w-8 h-8 text-blue-400" />
                      </div>
                    </div>
                    <div className="bg-gray-800 p-4 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-400">Peak Viewers</p>
                          <p className="text-2xl font-bold text-white">{formatNumber(analyticsData.overview.peakViewers)}</p>
                        </div>
                        <TrendingUp className="w-8 h-8 text-green-400" />
                      </div>
                    </div>
                    <div className="bg-gray-800 p-4 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-400">Total Revenue</p>
                          <p className="text-2xl font-bold text-white">{formatCurrency(analyticsData.overview.totalRevenue)}</p>
                        </div>
                        <DollarSign className="w-8 h-8 text-yellow-400" />
                      </div>
                    </div>
                    <div className="bg-gray-800 p-4 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-400">Messages</p>
                          <p className="text-2xl font-bold text-white">{formatNumber(analyticsData.overview.totalMessages)}</p>
                        </div>
                        <MessageSquare className="w-8 h-8 text-purple-400" />
                      </div>
                    </div>
                    <div className="bg-gray-800 p-4 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-400">Avg Watch Time</p>
                          <p className="text-2xl font-bold text-white">{analyticsData.overview.averageWatchTime}m</p>
                        </div>
                        <Clock className="w-8 h-8 text-orange-400" />
                      </div>
                    </div>
                    <div className="bg-gray-800 p-4 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-400">Engagement</p>
                          <p className="text-2xl font-bold text-white">{formatPercentage(analyticsData.overview.engagementRate)}</p>
                        </div>
                        <Heart className="w-8 h-8 text-red-400" />
                      </div>
                    </div>
                  </div>

                  {/* Charts Row */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Viewer Trend */}
                    <div className="bg-gray-800 p-6 rounded-lg">
                      <h3 className="text-lg font-semibold text-white mb-4">Viewer Trend (24h)</h3>
                      <div className="h-64 flex items-end justify-between space-x-1">
                        {analyticsData.viewerMetrics.hourly.slice(-12).map((data, index) => (
                          <div key={index} className="flex flex-col items-center">
                            <div
                              className="bg-blue-500 rounded-t w-8 transition-all duration-300"
                              style={{ height: `${(data.viewers / 500) * 200}px` }}
                            />
                            <span className="text-xs text-gray-400 mt-2 transform -rotate-45 origin-left">
                              {data.hour}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Revenue Breakdown */}
                    <div className="bg-gray-800 p-6 rounded-lg">
                      <h3 className="text-lg font-semibold text-white mb-4">Revenue Breakdown</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-300">Ticket Sales</span>
                          <span className="text-white font-semibold">{formatCurrency(analyticsData.revenueMetrics.ticketSales)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-300">Donations</span>
                          <span className="text-white font-semibold">{formatCurrency(analyticsData.revenueMetrics.donations)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-300">Merchandise</span>
                          <span className="text-white font-semibold">{formatCurrency(analyticsData.revenueMetrics.merchandise)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Viewers Tab */}
              {activeTab === 'viewers' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Demographics */}
                    <div className="bg-gray-800 p-6 rounded-lg">
                      <h3 className="text-lg font-semibold text-white mb-4">Age Demographics</h3>
                      <div className="space-y-3">
                        {analyticsData.viewerMetrics.demographics.map((demo, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <span className="text-gray-300">{demo.ageGroup}</span>
                            <div className="flex items-center space-x-3">
                              <div className="w-32 bg-gray-700 rounded-full h-2">
                                <div
                                  className="bg-blue-500 h-2 rounded-full"
                                  style={{ width: `${demo.percentage}%` }}
                                />
                              </div>
                              <span className="text-white font-semibold w-12 text-right">{formatPercentage(demo.percentage)}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Retention */}
                    <div className="bg-gray-800 p-6 rounded-lg">
                      <h3 className="text-lg font-semibold text-white mb-4">Viewer Retention</h3>
                      <div className="h-64 flex items-end justify-between space-x-1">
                        {analyticsData.viewerMetrics.retention.slice(0, 20).map((data, index) => (
                          <div key={index} className="flex flex-col items-center">
                            <div
                              className="bg-green-500 rounded-t w-3 transition-all duration-300"
                              style={{ height: `${(data.percentage / 100) * 200}px` }}
                            />
                            <span className="text-xs text-gray-400 mt-2">{data.minute}m</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Revenue Tab */}
              {activeTab === 'revenue' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Ticket Types */}
                    <div className="bg-gray-800 p-6 rounded-lg">
                      <h3 className="text-lg font-semibold text-white mb-4">Ticket Sales</h3>
                      <div className="space-y-4">
                        {analyticsData.revenueMetrics.ticketTypes.map((ticket, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                            <div>
                              <p className="text-white font-semibold">{ticket.type}</p>
                              <p className="text-sm text-gray-400">{ticket.count} tickets</p>
                            </div>
                            <span className="text-white font-semibold">{formatCurrency(ticket.revenue)}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Daily Revenue */}
                    <div className="bg-gray-800 p-6 rounded-lg">
                      <h3 className="text-lg font-semibold text-white mb-4">Daily Revenue (7 days)</h3>
                      <div className="h-64 flex items-end justify-between space-x-2">
                        {analyticsData.revenueMetrics.dailyRevenue.map((data, index) => (
                          <div key={index} className="flex flex-col items-center">
                            <div
                              className="bg-yellow-500 rounded-t w-8 transition-all duration-300"
                              style={{ height: `${(data.revenue / 10000) * 200}px` }}
                            />
                            <span className="text-xs text-gray-400 mt-2 transform -rotate-45 origin-left">
                              {new Date(data.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Engagement Tab */}
              {activeTab === 'engagement' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Chat Activity */}
                    <div className="bg-gray-800 p-6 rounded-lg">
                      <h3 className="text-lg font-semibold text-white mb-4">Chat Activity (24h)</h3>
                      <div className="h-64 flex items-end justify-between space-x-1">
                        {analyticsData.engagementMetrics.chatActivity.slice(-12).map((data, index) => (
                          <div key={index} className="flex flex-col items-center">
                            <div
                              className="bg-purple-500 rounded-t w-8 transition-all duration-300"
                              style={{ height: `${(data.messages / 200) * 200}px` }}
                            />
                            <span className="text-xs text-gray-400 mt-2 transform -rotate-45 origin-left">
                              {data.hour}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Reactions */}
                    <div className="bg-gray-800 p-6 rounded-lg">
                      <h3 className="text-lg font-semibold text-white mb-4">Top Reactions</h3>
                      <div className="space-y-3">
                        {analyticsData.engagementMetrics.reactions.map((reaction, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <span className="text-2xl">{reaction.type}</span>
                            <div className="flex items-center space-x-3">
                              <div className="w-32 bg-gray-700 rounded-full h-2">
                                <div
                                  className="bg-purple-500 h-2 rounded-full"
                                  style={{ width: `${(reaction.count / 1247) * 100}%` }}
                                />
                              </div>
                              <span className="text-white font-semibold w-12 text-right">{formatNumber(reaction.count)}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Additional Metrics */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gray-800 p-4 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-400">Shares</p>
                          <p className="text-2xl font-bold text-white">{formatNumber(analyticsData.engagementMetrics.shares)}</p>
                        </div>
                        <Share2 className="w-8 h-8 text-blue-400" />
                      </div>
                    </div>
                    <div className="bg-gray-800 p-4 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-400">Downloads</p>
                          <p className="text-2xl font-bold text-white">{formatNumber(analyticsData.engagementMetrics.downloads)}</p>
                        </div>
                        <Download className="w-8 h-8 text-green-400" />
                      </div>
                    </div>
                    <div className="bg-gray-800 p-4 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-400">Engagement Rate</p>
                          <p className="text-2xl font-bold text-white">{formatPercentage(analyticsData.overview.engagementRate)}</p>
                        </div>
                        <Heart className="w-8 h-8 text-red-400" />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
};
