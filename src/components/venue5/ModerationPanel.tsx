import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  MessageSquare, 
  UserX, 
  AlertTriangle, 
  Ban, 
  VolumeX, 
  Volume2,
  Trash2,
  Eye,
  EyeOff,
  Filter,
  Clock,
  CheckCircle,
  XCircle,
  Search,
  MoreVertical
} from 'lucide-react';

interface ChatMessage {
  id: string;
  user_id: string;
  username: string;
  message: string;
  timestamp: string;
  replied_to?: string;
  is_deleted?: boolean;
  toxicity_score?: number;
  moderation_status?: 'clean' | 'flagged' | 'hidden' | 'deleted';
}

interface Ban {
  id: string;
  user_id: string;
  username: string;
  reason: string;
  banned_by: string;
  banned_at: string;
  expires_at?: string;
  is_permanent: boolean;
}

interface ModerationAction {
  id: string;
  moderator_id: string;
  target_user_id: string;
  action_type: 'delete_message' | 'mute_user' | 'ban_user' | 'unmute_user' | 'unban_user';
  reason: string;
  target_message_id?: string;
  duration_minutes?: number;
  created_at: string;
}

interface ModerationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  eventId: string;
  currentUser: any;
  chatMessages: ChatMessage[];
  onMessageDeleted: (messageId: string) => void;
  onUserMuted: (userId: string, duration: number) => void;
  onUserBanned: (userId: string, reason: string, isPermanent: boolean) => void;
}

export const ModerationPanel: React.FC<ModerationPanelProps> = ({
  isOpen,
  onClose,
  eventId,
  currentUser,
  chatMessages,
  onMessageDeleted,
  onUserMuted,
  onUserBanned
}) => {
  const [activeTab, setActiveTab] = useState<'messages' | 'users' | 'bans' | 'actions'>('messages');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMessage, setSelectedMessage] = useState<ChatMessage | null>(null);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Moderation actions
  const [muteDuration, setMuteDuration] = useState(30);
  const [banReason, setBanReason] = useState('');
  const [isPermanentBan, setIsPermanentBan] = useState(false);
  const [moderationReason, setModerationReason] = useState('');

  // Mock data for demonstration
  const [bans, setBans] = useState<Ban[]>([
    {
      id: 'ban_1',
      user_id: 'user_123',
      username: 'spammer123',
      reason: 'Spam and harassment',
      banned_by: 'moderator_1',
      banned_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      is_permanent: false
    }
  ]);

  const [moderationActions, setModerationActions] = useState<ModerationAction[]>([
    {
      id: 'action_1',
      moderator_id: 'moderator_1',
      target_user_id: 'user_123',
      action_type: 'ban_user',
      reason: 'Spam and harassment',
      duration_minutes: 1440,
      created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
    }
  ]);

  // Filter messages based on search and moderation status
  const filteredMessages = chatMessages.filter(message => {
    const matchesSearch = message.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         message.username.toLowerCase().includes(searchTerm.toLowerCase());
    const isFlagged = message.toxicity_score && message.toxicity_score > 0.7;
    const isDeleted = message.is_deleted;
    
    return matchesSearch && (isFlagged || isDeleted || message.moderation_status === 'flagged');
  });

  // Get unique users from messages
  const users = Array.from(new Set(chatMessages.map(msg => msg.user_id))).map(userId => {
    const userMessages = chatMessages.filter(msg => msg.user_id === userId);
    const latestMessage = userMessages[userMessages.length - 1];
    const flaggedMessages = userMessages.filter(msg => msg.toxicity_score && msg.toxicity_score > 0.7);
    
    return {
      id: userId,
      username: latestMessage.username,
      messageCount: userMessages.length,
      flaggedCount: flaggedMessages.length,
      lastActivity: latestMessage.timestamp,
      isBanned: bans.some(ban => ban.user_id === userId && (!ban.expires_at || new Date(ban.expires_at) > new Date()))
    };
  });

  const handleDeleteMessage = async (messageId: string) => {
    if (!moderationReason.trim()) {
      setError('Please provide a reason for deleting this message');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`http://localhost:4000/api/events/${eventId}/chat/moderate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('theatre_token')}`
        },
        body: JSON.stringify({
          action: 'delete_message',
          message_id: messageId,
          reason: moderationReason
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete message');
      }

      setSuccess('Message deleted successfully');
      onMessageDeleted(messageId);
      setModerationReason('');
      setSelectedMessage(null);

      // Add to moderation actions
      const action: ModerationAction = {
        id: 'action_' + Date.now(),
        moderator_id: currentUser.id,
        target_user_id: selectedMessage?.user_id || '',
        action_type: 'delete_message',
        reason: moderationReason,
        target_message_id: messageId,
        created_at: new Date().toISOString()
      };
      setModerationActions(prev => [action, ...prev]);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete message');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMuteUser = async (userId: string) => {
    if (!moderationReason.trim()) {
      setError('Please provide a reason for muting this user');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`http://localhost:4000/api/events/${eventId}/chat/moderate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('theatre_token')}`
        },
        body: JSON.stringify({
          action: 'mute_user',
          user_id: userId,
          reason: moderationReason,
          duration_minutes: muteDuration
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to mute user');
      }

      setSuccess(`User muted for ${muteDuration} minutes`);
      onUserMuted(userId, muteDuration);
      setModerationReason('');
      setSelectedUser(null);

      // Add to moderation actions
      const action: ModerationAction = {
        id: 'action_' + Date.now(),
        moderator_id: currentUser.id,
        target_user_id: userId,
        action_type: 'mute_user',
        reason: moderationReason,
        duration_minutes: muteDuration,
        created_at: new Date().toISOString()
      };
      setModerationActions(prev => [action, ...prev]);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mute user');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBanUser = async (userId: string) => {
    if (!banReason.trim()) {
      setError('Please provide a reason for banning this user');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`http://localhost:4000/api/events/${eventId}/chat/moderate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('theatre_token')}`
        },
        body: JSON.stringify({
          action: 'ban_user',
          user_id: userId,
          reason: banReason,
          is_permanent: isPermanentBan
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to ban user');
      }

      setSuccess(isPermanentBan ? 'User permanently banned' : 'User banned for 24 hours');
      onUserBanned(userId, banReason, isPermanentBan);
      setBanReason('');
      setSelectedUser(null);

      // Add to bans list
      const ban: Ban = {
        id: 'ban_' + Date.now(),
        user_id: userId,
        username: users.find(u => u.id === userId)?.username || 'Unknown',
        reason: banReason,
        banned_by: currentUser.id,
        banned_at: new Date().toISOString(),
        expires_at: isPermanentBan ? undefined : new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        is_permanent: isPermanentBan
      };
      setBans(prev => [ban, ...prev]);

      // Add to moderation actions
      const action: ModerationAction = {
        id: 'action_' + Date.now(),
        moderator_id: currentUser.id,
        target_user_id: userId,
        action_type: 'ban_user',
        reason: banReason,
        created_at: new Date().toISOString()
      };
      setModerationActions(prev => [action, ...prev]);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to ban user');
    } finally {
      setIsLoading(false);
    }
  };

  const getToxicityColor = (score?: number) => {
    if (!score) return 'text-gray-400';
    if (score > 0.8) return 'text-red-400';
    if (score > 0.6) return 'text-orange-400';
    if (score > 0.4) return 'text-yellow-400';
    return 'text-green-400';
  };

  const getToxicityLabel = (score?: number) => {
    if (!score) return 'Clean';
    if (score > 0.8) return 'High Risk';
    if (score > 0.6) return 'Moderate Risk';
    if (score > 0.4) return 'Low Risk';
    return 'Clean';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg shadow-xl w-full max-w-6xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-2xl font-bold text-white flex items-center">
            <Shield className="w-6 h-6 mr-2" />
            Moderation Panel
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <XCircle className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-700">
          {[
            { id: 'messages', label: 'Flagged Messages', icon: MessageSquare },
            { id: 'users', label: 'Users', icon: UserX },
            { id: 'bans', label: 'Bans', icon: Ban },
            { id: 'actions', label: 'Actions', icon: Clock }
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
        <div className="flex-1 overflow-hidden">
          {success && (
            <div className="bg-green-900/50 border border-green-500 text-green-200 px-4 py-3 m-4 rounded-lg flex items-center">
              <CheckCircle className="w-5 h-5 mr-2" />
              {success}
            </div>
          )}

          {error && (
            <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 m-4 rounded-lg flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2" />
              {error}
            </div>
          )}

          {/* Messages Tab */}
          {activeTab === 'messages' && (
            <div className="h-full flex flex-col">
              <div className="p-4 border-b border-gray-700">
                <div className="flex items-center space-x-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search messages or users..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Filter className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-400">
                      {filteredMessages.length} flagged messages
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4">
                {filteredMessages.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No flagged messages found</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredMessages.map((message) => (
                      <div
                        key={message.id}
                        className={`p-4 rounded-lg border ${
                          message.is_deleted 
                            ? 'border-red-500 bg-red-900/20' 
                            : message.toxicity_score && message.toxicity_score > 0.7
                            ? 'border-orange-500 bg-orange-900/20'
                            : 'border-gray-700 bg-gray-800'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <span className="font-semibold text-white">{message.username}</span>
                              <span className="text-xs text-gray-400">
                                {new Date(message.timestamp).toLocaleString()}
                              </span>
                              {message.toxicity_score && (
                                <span className={`text-xs px-2 py-1 rounded ${getToxicityColor(message.toxicity_score)} bg-gray-800`}>
                                  {getToxicityLabel(message.toxicity_score)} ({Math.round(message.toxicity_score * 100)}%)
                                </span>
                              )}
                            </div>
                            <p className={`text-sm ${message.is_deleted ? 'line-through text-gray-500' : 'text-gray-300'}`}>
                              {message.is_deleted ? '[Message deleted]' : message.message}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => setSelectedMessage(message)}
                              className="text-gray-400 hover:text-blue-400 transition-colors"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <div className="h-full flex flex-col">
              <div className="p-4 border-b border-gray-700">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white">Active Users</h3>
                  <span className="text-sm text-gray-400">{users.length} users</span>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4">
                <div className="space-y-3">
                  {users.map((user) => (
                    <div
                      key={user.id}
                      className={`p-4 rounded-lg border ${
                        user.isBanned 
                          ? 'border-red-500 bg-red-900/20' 
                          : user.flaggedCount > 0
                          ? 'border-orange-500 bg-orange-900/20'
                          : 'border-gray-700 bg-gray-800'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <span className="font-semibold text-white">{user.username}</span>
                            {user.isBanned && (
                              <span className="text-xs px-2 py-1 rounded text-red-400 bg-red-900/30">
                                Banned
                              </span>
                            )}
                            {user.flaggedCount > 0 && !user.isBanned && (
                              <span className="text-xs px-2 py-1 rounded text-orange-400 bg-orange-900/30">
                                {user.flaggedCount} flagged messages
                              </span>
                            )}
                          </div>
                          <div className="flex items-center space-x-4 text-xs text-gray-400">
                            <span>{user.messageCount} messages</span>
                            <span>Last active: {new Date(user.lastActivity).toLocaleString()}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => setSelectedUser(user.id)}
                            className="text-gray-400 hover:text-blue-400 transition-colors"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Bans Tab */}
          {activeTab === 'bans' && (
            <div className="h-full flex flex-col">
              <div className="p-4 border-b border-gray-700">
                <h3 className="text-lg font-semibold text-white">Active Bans</h3>
              </div>

              <div className="flex-1 overflow-y-auto p-4">
                {bans.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <Ban className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No active bans</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {bans.map((ban) => (
                      <div key={ban.id} className="p-4 rounded-lg border border-red-500 bg-red-900/20">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <span className="font-semibold text-white">{ban.username}</span>
                              <span className={`text-xs px-2 py-1 rounded ${
                                ban.is_permanent 
                                  ? 'text-red-400 bg-red-900/30' 
                                  : 'text-orange-400 bg-orange-900/30'
                              }`}>
                                {ban.is_permanent ? 'Permanent' : 'Temporary'}
                              </span>
                            </div>
                            <p className="text-sm text-gray-300 mb-2">{ban.reason}</p>
                            <div className="flex items-center space-x-4 text-xs text-gray-400">
                              <span>Banned: {new Date(ban.banned_at).toLocaleString()}</span>
                              {ban.expires_at && (
                                <span>Expires: {new Date(ban.expires_at).toLocaleString()}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Actions Tab */}
          {activeTab === 'actions' && (
            <div className="h-full flex flex-col">
              <div className="p-4 border-b border-gray-700">
                <h3 className="text-lg font-semibold text-white">Recent Actions</h3>
              </div>

              <div className="flex-1 overflow-y-auto p-4">
                {moderationActions.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No moderation actions yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {moderationActions.map((action) => (
                      <div key={action.id} className="p-4 rounded-lg border border-gray-700 bg-gray-800">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <span className="font-semibold text-white">
                                {action.action_type.replace('_', ' ').toUpperCase()}
                              </span>
                              <span className="text-xs text-gray-400">
                                {new Date(action.created_at).toLocaleString()}
                              </span>
                            </div>
                            <p className="text-sm text-gray-300 mb-2">{action.reason}</p>
                            {action.duration_minutes && (
                              <p className="text-xs text-gray-400">
                                Duration: {action.duration_minutes} minutes
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Action Modals */}
        {selectedMessage && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60 p-4">
            <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Moderate Message</h3>
                <div className="mb-4">
                  <p className="text-sm text-gray-300 mb-2">Message from {selectedMessage.username}:</p>
                  <p className="text-sm bg-gray-700 p-3 rounded">{selectedMessage.message}</p>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Reason for action
                  </label>
                  <textarea
                    value={moderationReason}
                    onChange={(e) => setModerationReason(e.target.value)}
                    placeholder="Explain why this action is being taken..."
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => {
                      setSelectedMessage(null);
                      setModerationReason('');
                    }}
                    className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleDeleteMessage(selectedMessage.id)}
                    disabled={isLoading}
                    className="bg-red-600 hover:bg-red-700 disabled:bg-red-800 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    {isLoading ? 'Deleting...' : 'Delete Message'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60 p-4">
            <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Moderate User</h3>
                <div className="mb-4">
                  <p className="text-sm text-gray-300">
                    User: {users.find(u => u.id === selectedUser)?.username}
                  </p>
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Reason for action
                  </label>
                  <textarea
                    value={moderationReason}
                    onChange={(e) => setModerationReason(e.target.value)}
                    placeholder="Explain why this action is being taken..."
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Mute Duration (minutes)
                  </label>
                  <input
                    type="number"
                    value={muteDuration}
                    onChange={(e) => setMuteDuration(parseInt(e.target.value) || 30)}
                    min="1"
                    max="1440"
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Ban Reason
                  </label>
                  <textarea
                    value={banReason}
                    onChange={(e) => setBanReason(e.target.value)}
                    placeholder="Reason for ban (leave empty to skip ban)..."
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={2}
                  />
                </div>

                <div className="mb-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={isPermanentBan}
                      onChange={(e) => setIsPermanentBan(e.target.checked)}
                      className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-300">Permanent ban</span>
                  </label>
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => {
                      setSelectedUser(null);
                      setModerationReason('');
                      setBanReason('');
                    }}
                    className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleMuteUser(selectedUser)}
                    disabled={isLoading}
                    className="bg-yellow-600 hover:bg-yellow-700 disabled:bg-yellow-800 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    {isLoading ? 'Muting...' : 'Mute User'}
                  </button>
                  {banReason.trim() && (
                    <button
                      onClick={() => handleBanUser(selectedUser)}
                      disabled={isLoading}
                      className="bg-red-600 hover:bg-red-700 disabled:bg-red-800 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      {isLoading ? 'Banning...' : 'Ban User'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
