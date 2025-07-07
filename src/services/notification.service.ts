import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Twilio } from 'twilio';
import { JobListing } from '../interfaces/job.interface';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);
  private readonly twilioClient: Twilio;
  private readonly fromNumber: string;
  private recipientNumbers: string[] = [];

  constructor(private configService: ConfigService) {
    const accountSid = this.configService.get<string>('twilio.accountSid');
    const authToken = this.configService.get<string>('twilio.authToken');
    this.fromNumber = this.configService.get<string>('twilio.whatsappNumber');
    const recipientNumbers = this.configService.get<string>('twilio.recipientNumbers');

    if (!accountSid || !authToken) {
      this.logger.error('Twilio credentials not configured');
      throw new Error('Twilio credentials are required');
    }

    if (!recipientNumbers) {
      this.logger.error('Recipient WhatsApp numbers not configured');
      throw new Error('Recipient WhatsApp numbers are required');
    }

    // Parse multiple recipient numbers (comma-separated)
    this.recipientNumbers = recipientNumbers
      .split(',')
      .map(num => num.trim())
      .filter(num => num.length > 0)
      .map(num => num.startsWith('whatsapp:') ? num : `whatsapp:${num}`);

    this.twilioClient = new Twilio(accountSid, authToken);
    this.logger.log(`Notification service initialized. From: ${this.fromNumber}, To: ${this.recipientNumbers.length} recipients`);
  }

  async sendNewJobsNotification(jobs: JobListing[]): Promise<void> {
    if (jobs.length === 0) return;

    try {
      const message = this.formatJobsMessage(jobs);
      
      // Send to all recipient numbers
      const promises = this.recipientNumbers.map(async (toNumber) => {
        return this.twilioClient.messages.create({
          body: message,
          from: this.fromNumber,
          to: toNumber,
        });
      });

      await Promise.all(promises);

      this.logger.log(`Successfully sent WhatsApp notification for ${jobs.length} new jobs to ${this.recipientNumbers.length} recipients`);
    } catch (error) {
      this.logger.error('Failed to send WhatsApp notification', error.stack);
      throw error;
    }
  }

  async sendNoJobsNotification(): Promise<void> {
    try {
      const message = `🔍 *Aldaba Job Alert*\n\n⏰ No hay nuevas ofertas de trabajo tecnológicas disponibles en las últimas 6 horas.\n\n🔄 Continuaremos monitoreando y te notificaremos cuando haya nuevas oportunidades.\n\n📅 ${new Date().toLocaleString('es-DO')}`;

      // Send to all recipient numbers
      const promises = this.recipientNumbers.map(async (toNumber) => {
        return this.twilioClient.messages.create({
          body: message,
          from: this.fromNumber,
          to: toNumber,
        });
      });

      await Promise.all(promises);

      this.logger.log(`Successfully sent no jobs notification to ${this.recipientNumbers.length} recipients`);
    } catch (error) {
      this.logger.error('Failed to send no jobs notification', error.stack);
      throw error;
    }
  }

  private formatJobsMessage(jobs: JobListing[]): string {
    const jobCount = jobs.length;
    const header = `🚀 *Aldaba Job Alert*\n\n${jobCount} nueva${jobCount > 1 ? 's' : ''} oferta${jobCount > 1 ? 's' : ''}!\n\n`;
    
    // Limitar a 3 trabajos para evitar el límite de 1600 caracteres
    const jobsList = jobs.slice(0, 3).map((job, index) => {
      // Truncar título si es muy largo
      const title = job.title.length > 40 ? job.title.substring(0, 40) + '...' : job.title;
      const company = job.company.length > 30 ? job.company.substring(0, 30) + '...' : job.company;
      const location = job.location.length > 25 ? job.location.substring(0, 25) + '...' : job.location;
      
      return `${index + 1}. *${title}*\n🏢 ${company}\n📍 ${location}\n`;
    }).join('\n');

    const footer = jobCount > 3 ? `\n...y ${jobCount - 3} más!\n` : '\n';
    const timestamp = `📅 ${new Date().toLocaleString('es-DO')}`;

    const message = header + jobsList + footer + timestamp;
    
    // Asegurar que el mensaje no exceda 1500 caracteres (buffer de seguridad)
    if (message.length > 1500) {
      const truncatedMessage = message.substring(0, 1450) + '...\n' + timestamp;
      return truncatedMessage;
    }
    
    return message;
  }

  async sendTestNotification(): Promise<void> {
    try {
      const message = `🔔 *Test Notification*\n\nEl sistema de notificaciones de Aldaba Job Scraper está funcionando correctamente.\n\n📅 ${new Date().toLocaleString('es-DO')}`;

      // Send to all recipient numbers
      const promises = this.recipientNumbers.map(async (toNumber) => {
        return this.twilioClient.messages.create({
          body: message,
          from: this.fromNumber,
          to: toNumber,
        });
      });

      await Promise.all(promises);

      this.logger.log(`Successfully sent test notification to ${this.recipientNumbers.length} recipients`);
    } catch (error) {
      this.logger.error('Failed to send test notification', error.stack);
      throw error;
    }
  }

  // New methods for managing recipient numbers
  addRecipientNumber(number: string): void {
    const formattedNumber = number.startsWith('whatsapp:') ? number : `whatsapp:${number}`;
    if (!this.recipientNumbers.includes(formattedNumber)) {
      this.recipientNumbers.push(formattedNumber);
      this.logger.log(`Added recipient number: ${formattedNumber}`);
    }
  }

  removeRecipientNumber(number: string): boolean {
    const formattedNumber = number.startsWith('whatsapp:') ? number : `whatsapp:${number}`;
    const index = this.recipientNumbers.indexOf(formattedNumber);
    if (index > -1) {
      this.recipientNumbers.splice(index, 1);
      this.logger.log(`Removed recipient number: ${formattedNumber}`);
      return true;
    }
    return false;
  }

  getRecipientNumbers(): string[] {
    return [...this.recipientNumbers];
  }

  clearRecipientNumbers(): void {
    this.recipientNumbers = [];
    this.logger.log('Cleared all recipient numbers');
  }
}
