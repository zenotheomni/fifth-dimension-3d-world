import { TheatreEvent, TheatreTicket } from './theatreApi';

export interface NotificationPreferences {
  email: boolean;
  sms: boolean;
  email_address?: string;
  phone_number?: string;
}

export interface NotificationTemplate {
  email: {
    subject: string;
    html: string;
  };
  sms: {
    text: string;
  };
}

export interface ReminderSchedule {
  name: string;
  offset: {
    days_before_event?: number;
    hours_before_event?: number;
    minutes_before_event?: number;
  };
}

export interface NotificationProvider {
  name: string;
  type: 'email' | 'sms';
  enabled: boolean;
  config: any;
}

export class NotificationService {
  private providers: NotificationProvider[] = [
    { name: 'SendGrid', type: 'email', enabled: true, config: {} },
    { name: 'AmazonSES', type: 'email', enabled: false, config: {} },
    { name: 'Resend', type: 'email', enabled: false, config: {} },
    { name: 'Twilio', type: 'sms', enabled: true, config: {} },
    { name: 'MessageBird', type: 'sms', enabled: false, config: {} }
  ];

  private reminderSchedules: ReminderSchedule[] = [
    { name: 'T-7 days', offset: { days_before_event: 7 } },
    { name: 'T-24 hours', offset: { hours_before_event: 24 } },
    { name: 'T-1 hour', offset: { hours_before_event: 1 } }
  ];

  private templates: NotificationTemplate = {
    email: {
      subject: 'Reminder: {event_title}',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #3b82f6;">{event_title}</h2>
          <p style="color: #6b7280; font-size: 16px;">Your event is coming up soon!</p>
          
          <div style="background: #1f2937; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: white; margin: 0 0 10px 0;">Event Details</h3>
            <p style="color: #d1d5db; margin: 5px 0;"><strong>Start:</strong> {start_at_local}</p>
            <p style="color: #d1d5db; margin: 5px 0;"><strong>Duration:</strong> {duration}</p>
            <p style="color: #d1d5db; margin: 5px 0;"><strong>Access:</strong> {access_mode}</p>
          </div>
          
          <div style="background: #065f46; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: white; margin: 0 0 10px 0;">Your Ticket</h3>
            <p style="color: #d1d5db; margin: 5px 0;"><strong>Type:</strong> {ticket_type}</p>
            <p style="color: #d1d5db; margin: 5px 0;"><strong>Quantity:</strong> {ticket_quantity}</p>
            <p style="color: #d1d5db; margin: 5px 0;"><strong>QR Code:</strong> Available 24 hours before event</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="{join_url}" 
               style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Join Event
            </a>
          </div>
          
          <p style="color: #6b7280; font-size: 14px; text-align: center;">
            This is an automated reminder. If you have any questions, please contact support.
          </p>
        </div>
      `
    },
    sms: {
      text: '{event_title} starts {relative_time}. Join link: {join_url}'
    }
  };

  async scheduleNotifications(
    event: TheatreEvent,
    ticket: TheatreTicket,
    preferences: NotificationPreferences
  ): Promise<void> {
    if (!preferences.email && !preferences.sms) {
      return;
    }

    const eventStart = new Date(event.start_at);
    const now = new Date();

    for (const schedule of this.reminderSchedules) {
      const reminderTime = this.calculateReminderTime(eventStart, schedule.offset);
      
      // Only schedule if reminder time is in the future
      if (reminderTime > now) {
        await this.scheduleReminder(
          event,
          ticket,
          preferences,
          schedule,
          reminderTime
        );
      }
    }
  }

  private calculateReminderTime(eventStart: Date, offset: any): Date {
    const reminderTime = new Date(eventStart);

    if (offset.days_before_event) {
      reminderTime.setDate(reminderTime.getDate() - offset.days_before_event);
    }
    if (offset.hours_before_event) {
      reminderTime.setHours(reminderTime.getHours() - offset.hours_before_event);
    }
    if (offset.minutes_before_event) {
      reminderTime.setMinutes(reminderTime.getMinutes() - offset.minutes_before_event);
    }

    return reminderTime;
  }

  private async scheduleReminder(
    event: TheatreEvent,
    ticket: TheatreTicket,
    preferences: NotificationPreferences,
    schedule: ReminderSchedule,
    reminderTime: Date
  ): Promise<void> {
    try {
      // In a real implementation, this would schedule the notification with a job queue
      // For now, we'll just log the scheduled notification
      console.log(`Scheduled ${schedule.name} reminder for ${reminderTime.toISOString()}`);

      // Store the scheduled notification in the database
      await this.storeScheduledNotification({
        event_id: event.id,
        ticket_id: ticket.id,
        schedule_name: schedule.name,
        reminder_time: reminderTime.toISOString(),
        preferences,
        status: 'scheduled'
      });

    } catch (error) {
      console.error('Failed to schedule reminder:', error);
    }
  }

  private async storeScheduledNotification(notification: any): Promise<void> {
    // In a real implementation, this would store in the database
    // For now, we'll just log it
    console.log('Stored scheduled notification:', notification);
  }

  async sendNotification(
    event: TheatreEvent,
    ticket: TheatreTicket,
    preferences: NotificationPreferences,
    scheduleName: string
  ): Promise<void> {
    const template = this.templates;
    const variables = this.buildTemplateVariables(event, ticket, scheduleName);

    if (preferences.email && preferences.email_address) {
      await this.sendEmailNotification(
        preferences.email_address,
        this.replaceTemplateVariables(template.email.subject, variables),
        this.replaceTemplateVariables(template.email.html, variables)
      );
    }

    if (preferences.sms && preferences.phone_number) {
      await this.sendSMSNotification(
        preferences.phone_number,
        this.replaceTemplateVariables(template.sms.text, variables)
      );
    }
  }

  private buildTemplateVariables(event: TheatreEvent, ticket: TheatreTicket, scheduleName: string): Record<string, string> {
    const eventStart = new Date(event.start_at);
    const eventEnd = new Date(event.end_at);
    const duration = Math.round((eventEnd.getTime() - eventStart.getTime()) / (1000 * 60));

    return {
      event_title: event.title,
      event_subtitle: event.subtitle || '',
      start_at_local: eventStart.toLocaleString(),
      duration: `${duration} minutes`,
      access_mode: event.access_mode.replace('_', ' '),
      ticket_type: ticket.type,
      ticket_quantity: '1', // Assuming single ticket for now
      join_url: `${window.location.origin}/venue5/${event.id}`,
      relative_time: this.getRelativeTime(eventStart, scheduleName)
    };
  }

  private getRelativeTime(eventStart: Date, scheduleName: string): string {
    const now = new Date();
    const diff = eventStart.getTime() - now.getTime();

    if (diff <= 0) return 'now';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `in ${days} day${days > 1 ? 's' : ''}`;
    if (hours > 0) return `in ${hours} hour${hours > 1 ? 's' : ''}`;
    return `in ${minutes} minute${minutes > 1 ? 's' : ''}`;
  }

  private replaceTemplateVariables(template: string, variables: Record<string, string>): string {
    let result = template;
    for (const [key, value] of Object.entries(variables)) {
      result = result.replace(new RegExp(`{${key}}`, 'g'), value);
    }
    return result;
  }

  private async sendEmailNotification(to: string, subject: string, html: string): Promise<void> {
    try {
      // In a real implementation, this would use SendGrid, SES, or Resend
      console.log('Sending email notification:', { to, subject });
      
      // Mock email sending
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('Email sent successfully to:', to);
    } catch (error) {
      console.error('Failed to send email:', error);
      throw error;
    }
  }

  private async sendSMSNotification(to: string, text: string): Promise<void> {
    try {
      // In a real implementation, this would use Twilio or MessageBird
      console.log('Sending SMS notification:', { to, text });
      
      // Mock SMS sending
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('SMS sent successfully to:', to);
    } catch (error) {
      console.error('Failed to send SMS:', error);
      throw error;
    }
  }

  async getNotificationStatus(ticketId: string): Promise<any[]> {
    try {
      const response = await fetch(`http://localhost:4000/api/notifications/status/${ticketId}`);
      const data = await response.json();
      return data.notifications || [];
    } catch (error) {
      console.error('Failed to get notification status:', error);
      return [];
    }
  }

  async updateNotificationPreferences(
    ticketId: string,
    preferences: NotificationPreferences
  ): Promise<void> {
    try {
      await fetch(`http://localhost:4000/api/notifications/preferences/${ticketId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('theatre_token')}`
        },
        body: JSON.stringify(preferences)
      });
    } catch (error) {
      console.error('Failed to update notification preferences:', error);
      throw error;
    }
  }
}

export const notificationService = new NotificationService();
