import React, { useState, useEffect } from 'react';
import { 
  Ticket, 
  Clock, 
  Users, 
  DollarSign, 
  Calendar, 
  Bell, 
  Mail, 
  MessageSquare,
  CheckCircle,
  AlertCircle,
  X,
  Loader2,
  CreditCard,
  QrCode,
  Download,
  Share2
} from 'lucide-react';

interface TicketTier {
  name: string;
  code: string;
  price_cents: number;
  on_sale_start_iso?: string;
  on_sale_end_iso?: string;
  on_sale_start_relative?: {
    hours_before_event: number;
  };
  on_sale_end_relative?: {
    minutes_before_event: number;
  };
  quantity_cap: number;
  per_user_limit: number;
  visible: boolean;
  enabled?: boolean;
  sold_count?: number;
}

interface Event {
  id: string;
  title: string;
  start_at: string;
  end_at: string;
  access_mode: string;
  max_capacity: number;
}

interface AdvancedTicketingSystemProps {
  event: Event;
  onTicketPurchased: (ticket: any) => void;
  onClose: () => void;
  currentUser?: any;
}

interface NotificationPreferences {
  email: boolean;
  sms: boolean;
  email_address?: string;
  phone_number?: string;
}

export const AdvancedTicketingSystem: React.FC<AdvancedTicketingSystemProps> = ({
  event,
  onTicketPurchased,
  onClose,
  currentUser
}) => {
  const [ticketTiers, setTicketTiers] = useState<TicketTier[]>([]);
  const [selectedTier, setSelectedTier] = useState<TicketTier | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [purchaseStep, setPurchaseStep] = useState<'select' | 'notifications' | 'payment' | 'confirmation'>('select');
  const [notificationPrefs, setNotificationPrefs] = useState<NotificationPreferences>({
    email: true,
    sms: false
  });

  useEffect(() => {
    fetchTicketTiers();
  }, [event.id]);

  const fetchTicketTiers = async () => {
    try {
      const response = await fetch(`http://localhost:4000/api/events/${event.id}/ticket-tiers`);
      const data = await response.json();
      setTicketTiers(data.tiers || []);
    } catch (err) {
      console.error('Failed to fetch ticket tiers:', err);
      // Use mock data for demonstration
      setTicketTiers([
        {
          name: "Early Bird",
          code: "early_bird",
          price_cents: 1500,
          on_sale_start_iso: "2025-10-01T12:00:00Z",
          on_sale_end_iso: "2025-11-01T00:00:00Z",
          quantity_cap: 200,
          per_user_limit: 2,
          visible: true,
          sold_count: 45
        },
        {
          name: "General Admission",
          code: "ga",
          price_cents: 2500,
          on_sale_start_iso: "2025-11-01T00:00:00Z",
          on_sale_end_iso: "2025-12-12T23:59:59Z",
          quantity_cap: 1000,
          per_user_limit: 4,
          visible: true,
          sold_count: 234
        },
        {
          name: "Day Of (Gate)",
          code: "day_of",
          price_cents: 3500,
          on_sale_start_relative: {
            hours_before_event: 12
          },
          on_sale_end_relative: {
            minutes_before_event: 0
          },
          quantity_cap: 300,
          per_user_limit: 2,
          visible: true,
          enabled: true,
          sold_count: 12
        }
      ]);
    }
  };

  const isTierAvailable = (tier: TicketTier): boolean => {
    const now = new Date();
    const eventStart = new Date(event.start_at);

    // Check if tier is enabled
    if (tier.enabled === false) return false;

    // Check on-sale start time
    if (tier.on_sale_start_iso) {
      const startTime = new Date(tier.on_sale_start_iso);
      if (now < startTime) return false;
    } else if (tier.on_sale_start_relative) {
      const startTime = new Date(eventStart.getTime() - tier.on_sale_start_relative.hours_before_event * 60 * 60 * 1000);
      if (now < startTime) return false;
    }

    // Check on-sale end time
    if (tier.on_sale_end_iso) {
      const endTime = new Date(tier.on_sale_end_iso);
      if (now > endTime) return false;
    } else if (tier.on_sale_end_relative) {
      const endTime = new Date(eventStart.getTime() - tier.on_sale_end_relative.minutes_before_event * 60 * 1000);
      if (now > endTime) return false;
    }

    // Check quantity cap
    if (tier.sold_count && tier.sold_count >= tier.quantity_cap) return false;

    return true;
  };

  const getTierStatus = (tier: TicketTier): string => {
    const now = new Date();
    const eventStart = new Date(event.start_at);

    if (!tier.visible) return 'hidden';
    if (tier.enabled === false) return 'disabled';
    if (tier.sold_count && tier.sold_count >= tier.quantity_cap) return 'sold_out';

    // Check if not yet on sale
    if (tier.on_sale_start_iso) {
      const startTime = new Date(tier.on_sale_start_iso);
      if (now < startTime) return 'not_on_sale';
    } else if (tier.on_sale_start_relative) {
      const startTime = new Date(eventStart.getTime() - tier.on_sale_start_relative.hours_before_event * 60 * 60 * 1000);
      if (now < startTime) return 'not_on_sale';
    }

    // Check if sale has ended
    if (tier.on_sale_end_iso) {
      const endTime = new Date(tier.on_sale_end_iso);
      if (now > endTime) return 'sale_ended';
    } else if (tier.on_sale_end_relative) {
      const endTime = new Date(eventStart.getTime() - tier.on_sale_end_relative.minutes_before_event * 60 * 1000);
      if (now > endTime) return 'sale_ended';
    }

    return 'available';
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'available': return 'text-green-400 bg-green-900/30';
      case 'sold_out': return 'text-red-400 bg-red-900/30';
      case 'not_on_sale': return 'text-yellow-400 bg-yellow-900/30';
      case 'sale_ended': return 'text-gray-400 bg-gray-900/30';
      case 'disabled': return 'text-gray-500 bg-gray-800/30';
      default: return 'text-gray-400 bg-gray-900/30';
    }
  };

  const getStatusText = (status: string): string => {
    switch (status) {
      case 'available': return 'Available';
      case 'sold_out': return 'Sold Out';
      case 'not_on_sale': return 'Not On Sale Yet';
      case 'sale_ended': return 'Sale Ended';
      case 'disabled': return 'Disabled';
      default: return 'Unknown';
    }
  };

  const formatCurrency = (cents: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(cents / 100);
  };

  const formatTimeUntil = (isoString: string): string => {
    const date = new Date(isoString);
    const now = new Date();
    const diff = date.getTime() - now.getTime();

    if (diff <= 0) return 'Now available';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `In ${days}d ${hours}h`;
    if (hours > 0) return `In ${hours}h ${minutes}m`;
    return `In ${minutes}m`;
  };

  const handleTierSelect = (tier: TicketTier) => {
    if (!isTierAvailable(tier)) return;
    
    setSelectedTier(tier);
    setQuantity(1);
    setError('');
  };

  const handleQuantityChange = (newQuantity: number) => {
    if (!selectedTier) return;
    
    const maxQuantity = Math.min(selectedTier.per_user_limit, selectedTier.quantity_cap - (selectedTier.sold_count || 0));
    setQuantity(Math.max(1, Math.min(newQuantity, maxQuantity)));
  };

  const handleNotificationPrefChange = (type: 'email' | 'sms', value: boolean) => {
    setNotificationPrefs(prev => ({ ...prev, [type]: value }));
  };

  const handlePurchase = async () => {
    if (!selectedTier) return;

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`http://localhost:4000/api/events/${event.id}/tickets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('theatre_token')}`
        },
        body: JSON.stringify({
          tier_code: selectedTier.code,
          quantity: quantity,
          notification_preferences: notificationPrefs
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to purchase tickets');
      }

      setSuccess('Tickets purchased successfully!');
      setPurchaseStep('confirmation');
      onTicketPurchased(data.ticket);

      // Schedule notifications if user opted in
      if (notificationPrefs.email || notificationPrefs.sms) {
        await scheduleNotifications(data.ticket.id);
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to purchase tickets');
    } finally {
      setIsLoading(false);
    }
  };

  const scheduleNotifications = async (ticketId: string) => {
    try {
      await fetch(`http://localhost:4000/api/events/${event.id}/notifications/schedule`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('theatre_token')}`
        },
        body: JSON.stringify({
          ticket_id: ticketId,
          preferences: notificationPrefs
        })
      });
    } catch (err) {
      console.error('Failed to schedule notifications:', err);
    }
  };

  const renderTierCard = (tier: TicketTier) => {
    const status = getTierStatus(tier);
    const isAvailable = isTierAvailable(tier);
    const isSelected = selectedTier?.code === tier.code;

    return (
      <div
        key={tier.code}
        className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
          isSelected 
            ? 'border-blue-500 bg-blue-900/20' 
            : isAvailable 
            ? 'border-gray-600 bg-gray-800 hover:border-gray-500' 
            : 'border-gray-700 bg-gray-800/50 opacity-60'
        }`}
        onClick={() => handleTierSelect(tier)}
      >
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="text-lg font-semibold text-white">{tier.name}</h3>
            <p className="text-2xl font-bold text-blue-400">{formatCurrency(tier.price_cents)}</p>
          </div>
          <span className={`px-2 py-1 rounded text-xs ${getStatusColor(status)}`}>
            {getStatusText(status)}
          </span>
        </div>

        <div className="space-y-2 text-sm text-gray-300">
          <div className="flex items-center justify-between">
            <span>Available:</span>
            <span>{tier.quantity_cap - (tier.sold_count || 0)} / {tier.quantity_cap}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Per user limit:</span>
            <span>{tier.per_user_limit}</span>
          </div>
          
          {tier.on_sale_start_iso && (
            <div className="flex items-center justify-between">
              <span>On sale:</span>
              <span className="text-xs">{formatTimeUntil(tier.on_sale_start_iso)}</span>
            </div>
          )}
          
          {tier.on_sale_start_relative && (
            <div className="flex items-center justify-between">
              <span>Available:</span>
              <span className="text-xs">{tier.on_sale_start_relative.hours_before_event}h before event</span>
            </div>
          )}
        </div>

        {tier.sold_count && tier.sold_count > 0 && (
          <div className="mt-3">
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full"
                style={{ width: `${(tier.sold_count / tier.quantity_cap) * 100}%` }}
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">{tier.sold_count} sold</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-2xl font-bold text-white flex items-center">
            <Ticket className="w-6 h-6 mr-2" />
            Advanced Ticketing
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {error && (
            <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-lg mb-6 flex items-center">
              <AlertCircle className="w-5 h-5 mr-2" />
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-900/50 border border-green-500 text-green-200 px-4 py-3 rounded-lg mb-6 flex items-center">
              <CheckCircle className="w-5 h-5 mr-2" />
              {success}
            </div>
          )}

          {/* Step 1: Select Ticket Tier */}
          {purchaseStep === 'select' && (
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Select Your Tickets</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {ticketTiers.map(renderTierCard)}
              </div>

              {selectedTier && (
                <div className="bg-gray-800 p-4 rounded-lg mb-6">
                  <h4 className="text-lg font-semibold text-white mb-3">Order Summary</h4>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-white">{selectedTier.name}</p>
                      <p className="text-sm text-gray-400">{formatCurrency(selectedTier.price_cents)} each</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => handleQuantityChange(quantity - 1)}
                        disabled={quantity <= 1}
                        className="w-8 h-8 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:cursor-not-allowed text-white rounded flex items-center justify-center"
                      >
                        -
                      </button>
                      <span className="text-white font-semibold w-8 text-center">{quantity}</span>
                      <button
                        onClick={() => handleQuantityChange(quantity + 1)}
                        disabled={quantity >= selectedTier.per_user_limit}
                        className="w-8 h-8 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:cursor-not-allowed text-white rounded flex items-center justify-center"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-lg font-semibold">
                    <span className="text-white">Total:</span>
                    <span className="text-blue-400">{formatCurrency(selectedTier.price_cents * quantity)}</span>
                  </div>
                </div>
              )}

              <div className="flex justify-end">
                <button
                  onClick={() => setPurchaseStep('notifications')}
                  disabled={!selectedTier}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg flex items-center transition-colors"
                >
                  Continue
                  <Calendar className="w-4 h-4 ml-2" />
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Notification Preferences */}
          {purchaseStep === 'notifications' && (
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Notification Preferences</h3>
              <p className="text-gray-300 mb-6">Get reminders about your event and important updates.</p>

              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                  <div className="flex items-center">
                    <Mail className="w-5 h-5 text-blue-400 mr-3" />
                    <div>
                      <p className="text-white font-medium">Email Notifications</p>
                      <p className="text-sm text-gray-400">Get reminders and updates via email</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notificationPrefs.email}
                      onChange={(e) => handleNotificationPrefChange('email', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                  <div className="flex items-center">
                    <MessageSquare className="w-5 h-5 text-green-400 mr-3" />
                    <div>
                      <p className="text-white font-medium">SMS Notifications</p>
                      <p className="text-sm text-gray-400">Get text message reminders</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notificationPrefs.sms}
                      onChange={(e) => handleNotificationPrefChange('sms', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>

              {notificationPrefs.email && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={notificationPrefs.email_address || ''}
                    onChange={(e) => setNotificationPrefs(prev => ({ ...prev, email_address: e.target.value }))}
                    placeholder="your@email.com"
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}

              {notificationPrefs.sms && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={notificationPrefs.phone_number || ''}
                    onChange={(e) => setNotificationPrefs(prev => ({ ...prev, phone_number: e.target.value }))}
                    placeholder="+1 (555) 123-4567"
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}

              <div className="flex justify-between">
                <button
                  onClick={() => setPurchaseStep('select')}
                  className="px-6 py-3 text-gray-400 hover:text-white transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={() => setPurchaseStep('payment')}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center transition-colors"
                >
                  Continue to Payment
                  <CreditCard className="w-4 h-4 ml-2" />
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Payment */}
          {purchaseStep === 'payment' && selectedTier && (
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Payment</h3>
              
              <div className="bg-gray-800 p-4 rounded-lg mb-6">
                <h4 className="text-lg font-semibold text-white mb-3">Order Summary</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-300">{selectedTier.name} × {quantity}</span>
                    <span className="text-white">{formatCurrency(selectedTier.price_cents * quantity)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Processing fee</span>
                    <span className="text-white">$0.00</span>
                  </div>
                  <div className="border-t border-gray-600 pt-2 flex justify-between text-lg font-semibold">
                    <span className="text-white">Total</span>
                    <span className="text-blue-400">{formatCurrency(selectedTier.price_cents * quantity)}</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800 p-4 rounded-lg mb-6">
                <h4 className="text-lg font-semibold text-white mb-3">Payment Method</h4>
                <div className="space-y-3">
                  <div className="flex items-center p-3 border border-gray-600 rounded-lg">
                    <CreditCard className="w-5 h-5 text-blue-400 mr-3" />
                    <div>
                      <p className="text-white font-medium">Credit/Debit Card</p>
                      <p className="text-sm text-gray-400">Visa, Mastercard, American Express</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between">
                <button
                  onClick={() => setPurchaseStep('notifications')}
                  className="px-6 py-3 text-gray-400 hover:text-white transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handlePurchase}
                  disabled={isLoading}
                  className="bg-green-600 hover:bg-green-700 disabled:bg-green-800 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg flex items-center transition-colors"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      Complete Purchase
                      <CheckCircle className="w-4 h-4 ml-2" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Confirmation */}
          {purchaseStep === 'confirmation' && (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Purchase Successful!</h3>
              <p className="text-gray-300 mb-6">Your tickets have been purchased and notifications have been scheduled.</p>

              <div className="bg-gray-800 p-4 rounded-lg mb-6">
                <h4 className="text-lg font-semibold text-white mb-3">What's Next?</h4>
                <div className="space-y-2 text-sm text-gray-300">
                  <p>• Check your email for confirmation</p>
                  <p>• You'll receive reminders before the event</p>
                  <p>• QR codes will be available 24 hours before the event</p>
                  <p>• Join the event using the link in your confirmation</p>
                </div>
              </div>

              <div className="flex justify-center space-x-4">
                <button
                  onClick={onClose}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    // In a real app, this would download the ticket
                    console.log('Download ticket');
                  }}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg flex items-center transition-colors"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Ticket
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
