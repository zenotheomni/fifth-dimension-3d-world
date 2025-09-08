import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  Users, 
  DollarSign, 
  Settings, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff,
  Save,
  X,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

interface Event {
  id: string;
  title: string;
  subtitle: string;
  description_md: string;
  start_at: string;
  end_at: string;
  visibility: 'draft' | 'listed' | 'unlisted';
  age_restriction: string;
  tags: string[];
  poster_image_url: string;
  trailer_video_url: string;
  access_mode: 'public_free' | 'ticket_required' | 'invite_only';
  max_capacity: number;
  record_vod: boolean;
  enable_drm: boolean;
  created_at: string;
  updated_at: string;
}

interface EventManagerProps {
  isOpen: boolean;
  onClose: () => void;
  onEventCreated: (event: Event) => void;
  onEventUpdated: (event: Event) => void;
  onEventDeleted: (eventId: string) => void;
  currentUser: any;
}

interface EventFormData {
  title: string;
  subtitle: string;
  description_md: string;
  start_at: string;
  end_at: string;
  visibility: 'draft' | 'listed' | 'unlisted';
  age_restriction: string;
  tags: string;
  poster_image_url: string;
  trailer_video_url: string;
  access_mode: 'public_free' | 'ticket_required' | 'invite_only';
  max_capacity: number;
  record_vod: boolean;
  enable_drm: boolean;
}

export const EventManager: React.FC<EventManagerProps> = ({
  isOpen,
  onClose,
  onEventCreated,
  onEventUpdated,
  onEventDeleted,
  currentUser
}) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState<EventFormData>({
    title: '',
    subtitle: '',
    description_md: '',
    start_at: '',
    end_at: '',
    visibility: 'draft',
    age_restriction: '13+',
    tags: '',
    poster_image_url: '',
    trailer_video_url: '',
    access_mode: 'public_free',
    max_capacity: 1000,
    record_vod: true,
    enable_drm: false
  });

  useEffect(() => {
    if (isOpen) {
      fetchEvents();
    }
  }, [isOpen]);

  const fetchEvents = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/events');
      const data = await response.json();
      setEvents(data);
    } catch (err) {
      setError('Failed to fetch events');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (type === 'number') {
      setFormData(prev => ({ ...prev, [name]: parseInt(value) || 0 }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    setError('');
  };

  const handleCreateEvent = () => {
    setIsCreating(true);
    setSelectedEvent(null);
    setFormData({
      title: '',
      subtitle: '',
      description_md: '',
      start_at: '',
      end_at: '',
      visibility: 'draft',
      age_restriction: '13+',
      tags: '',
      poster_image_url: '',
      trailer_video_url: '',
      access_mode: 'public_free',
      max_capacity: 1000,
      record_vod: true,
      enable_drm: false
    });
  };

  const handleEditEvent = (event: Event) => {
    setSelectedEvent(event);
    setIsCreating(false);
    setFormData({
      title: event.title,
      subtitle: event.subtitle,
      description_md: event.description_md,
      start_at: new Date(event.start_at).toISOString().slice(0, 16),
      end_at: new Date(event.end_at).toISOString().slice(0, 16),
      visibility: event.visibility,
      age_restriction: event.age_restriction,
      tags: event.tags.join(', '),
      poster_image_url: event.poster_image_url,
      trailer_video_url: event.trailer_video_url,
      access_mode: event.access_mode,
      max_capacity: event.max_capacity,
      record_vod: event.record_vod,
      enable_drm: event.enable_drm
    });
  };

  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      setError('Event title is required');
      return;
    }

    if (!formData.start_at || !formData.end_at) {
      setError('Start and end times are required');
      return;
    }

    if (new Date(formData.start_at) >= new Date(formData.end_at)) {
      setError('End time must be after start time');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const eventData = {
        ...formData,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        created_by: currentUser?.id,
        updated_by: currentUser?.id
      };

      let response;
      if (isCreating) {
        response = await fetch('http://localhost:4000/api/events', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('theatre_token')}`
          },
          body: JSON.stringify(eventData)
        });
      } else {
        response = await fetch(`http://localhost:4000/api/events/${selectedEvent?.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('theatre_token')}`
          },
          body: JSON.stringify(eventData)
        });
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save event');
      }

      setSuccess(isCreating ? 'Event created successfully!' : 'Event updated successfully!');
      
      if (isCreating) {
        onEventCreated(data.event);
      } else {
        onEventUpdated(data.event);
      }

      // Reset form
      setIsCreating(false);
      setSelectedEvent(null);
      fetchEvents();

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save event');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:4000/api/events/${eventId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('theatre_token')}`
        }
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete event');
      }

      setSuccess('Event deleted successfully!');
      onEventDeleted(eventId);
      fetchEvents();

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete event');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getAccessModeColor = (mode: string) => {
    switch (mode) {
      case 'public_free': return 'text-green-400 bg-green-900/30';
      case 'ticket_required': return 'text-yellow-400 bg-yellow-900/30';
      case 'invite_only': return 'text-purple-400 bg-purple-900/30';
      default: return 'text-gray-400 bg-gray-900/30';
    }
  };

  const getVisibilityColor = (visibility: string) => {
    switch (visibility) {
      case 'listed': return 'text-green-400 bg-green-900/30';
      case 'unlisted': return 'text-yellow-400 bg-yellow-900/30';
      case 'draft': return 'text-gray-400 bg-gray-900/30';
      default: return 'text-gray-400 bg-gray-900/30';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg shadow-xl w-full max-w-6xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-2xl font-bold text-white flex items-center">
            <Calendar className="w-6 h-6 mr-2" />
            Event Manager
          </h2>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleCreateEvent}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Event
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Events List */}
          <div className="w-1/2 border-r border-gray-700 overflow-y-auto">
            <div className="p-4">
              <h3 className="text-lg font-semibold text-white mb-4">Your Events</h3>
              
              {events.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No events found</p>
                  <p className="text-sm">Create your first event to get started</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {events.map((event) => (
                    <div
                      key={event.id}
                      className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                        selectedEvent?.id === event.id
                          ? 'border-blue-500 bg-blue-900/20'
                          : 'border-gray-700 bg-gray-800 hover:bg-gray-750'
                      }`}
                      onClick={() => handleEditEvent(event)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-white mb-1">{event.title}</h4>
                          <p className="text-sm text-gray-400 mb-2">{event.subtitle}</p>
                          
                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <span className="flex items-center">
                              <Clock className="w-3 h-3 mr-1" />
                              {formatDate(event.start_at)}
                            </span>
                            <span className="flex items-center">
                              <Users className="w-3 h-3 mr-1" />
                              {event.max_capacity} max
                            </span>
                          </div>
                          
                          <div className="flex items-center space-x-2 mt-2">
                            <span className={`px-2 py-1 rounded text-xs ${getAccessModeColor(event.access_mode)}`}>
                              {event.access_mode.replace('_', ' ')}
                            </span>
                            <span className={`px-2 py-1 rounded text-xs ${getVisibilityColor(event.visibility)}`}>
                              {event.visibility}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditEvent(event);
                            }}
                            className="text-gray-400 hover:text-blue-400 transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteEvent(event.id);
                            }}
                            className="text-gray-400 hover:text-red-400 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Event Form */}
          <div className="w-1/2 overflow-y-auto">
            <div className="p-6">
              {success && (
                <div className="bg-green-900/50 border border-green-500 text-green-200 px-4 py-3 rounded-lg mb-4 flex items-center">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  {success}
                </div>
              )}

              {error && (
                <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-lg mb-4 flex items-center">
                  <AlertCircle className="w-5 h-5 mr-2" />
                  {error}
                </div>
              )}

              <h3 className="text-lg font-semibold text-white mb-4">
                {isCreating ? 'Create New Event' : selectedEvent ? 'Edit Event' : 'Select an Event'}
              </h3>

              {!isCreating && !selectedEvent ? (
                <div className="text-center py-8 text-gray-400">
                  <Settings className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Select an event to edit or create a new one</p>
                </div>
              ) : (
                <form onSubmit={handleSaveEvent} className="space-y-4">
                  {/* Basic Info */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Event Title *
                      </label>
                      <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Subtitle
                      </label>
                      <input
                        type="text"
                        name="subtitle"
                        value={formData.subtitle}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Description
                    </label>
                    <textarea
                      name="description_md"
                      value={formData.description_md}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Scheduling */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Start Time *
                      </label>
                      <input
                        type="datetime-local"
                        name="start_at"
                        value={formData.start_at}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        End Time *
                      </label>
                      <input
                        type="datetime-local"
                        name="end_at"
                        value={formData.end_at}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                  </div>

                  {/* Settings */}
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Visibility
                      </label>
                      <select
                        name="visibility"
                        value={formData.visibility}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="draft">Draft</option>
                        <option value="unlisted">Unlisted</option>
                        <option value="listed">Listed</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Access Mode
                      </label>
                      <select
                        name="access_mode"
                        value={formData.access_mode}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="public_free">Public Free</option>
                        <option value="ticket_required">Ticket Required</option>
                        <option value="invite_only">Invite Only</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Max Capacity
                      </label>
                      <input
                        type="number"
                        name="max_capacity"
                        value={formData.max_capacity}
                        onChange={handleInputChange}
                        min="1"
                        max="10000"
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  {/* Media URLs */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Poster Image URL
                      </label>
                      <input
                        type="url"
                        name="poster_image_url"
                        value={formData.poster_image_url}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Trailer Video URL
                      </label>
                      <input
                        type="url"
                        name="trailer_video_url"
                        value={formData.trailer_video_url}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  {/* Additional Settings */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Tags (comma-separated)
                    </label>
                    <input
                      type="text"
                      name="tags"
                      value={formData.tags}
                      onChange={handleInputChange}
                      placeholder="concert, live, music"
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Age Restriction
                    </label>
                    <select
                      name="age_restriction"
                      value={formData.age_restriction}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">All Ages</option>
                      <option value="13+">13+</option>
                      <option value="16+">16+</option>
                      <option value="18+">18+</option>
                      <option value="21+">21+</option>
                    </select>
                  </div>

                  {/* Checkboxes */}
                  <div className="space-y-3">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="record_vod"
                        checked={formData.record_vod}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-blue-600 bg-gray-800 border-gray-600 rounded focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-300">Record for VOD</span>
                    </label>
                    
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="enable_drm"
                        checked={formData.enable_drm}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-blue-600 bg-gray-800 border-gray-600 rounded focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-300">Enable DRM Protection</span>
                    </label>
                  </div>

                  {/* Save Button */}
                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setIsCreating(false);
                        setSelectedEvent(null);
                        setError('');
                        setSuccess('');
                      }}
                      className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg flex items-center transition-colors"
                    >
                      {isLoading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          {isCreating ? 'Create Event' : 'Update Event'}
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
