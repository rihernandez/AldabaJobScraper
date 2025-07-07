import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { JobService } from '../services/job.service';
import { NotificationService } from '../services/notification.service';

@Injectable()
export class ScrapingTask {
  private readonly logger = new Logger(ScrapingTask.name);
  private isScrapingInProgress = false;
  private lastNoJobsNotification: Date = new Date();

  constructor(
    private jobService: JobService,
    private notificationService: NotificationService,
  ) {}

  @Cron('*/5 * * * *') // Every 5 minutes
  async handleScrapingCron() {
    if (this.isScrapingInProgress) {
      this.logger.warn('Scraping already in progress, skipping this cycle');
      return;
    }

    this.isScrapingInProgress = true;
    this.logger.log('Starting scheduled scraping task');

    try {
      const result = await this.jobService.scrapeAndFilterJobs();
      
      // Send notification for new jobs
      if (result.newJobs.length > 0) {
        await this.notificationService.sendNewJobsNotification(result.newJobs);
        this.logger.log(`Sent notification for ${result.newJobs.length} new jobs`);
      }

      // Check if we should send no jobs notification
      await this.checkAndSendNoJobsNotification();

    } catch (error) {
      this.logger.error('Error in scheduled scraping task', error.stack);
    } finally {
      this.isScrapingInProgress = false;
    }
  }

  @Cron('0 */6 * * *') // Every 6 hours
  async handleNoJobsNotificationCron() {
    await this.checkAndSendNoJobsNotification();
  }

  private async checkAndSendNoJobsNotification(): Promise<void> {
    if (this.jobService.shouldSendNoJobsNotification()) {
      const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000);
      
      // Only send if we haven't sent one in the last 6 hours
      if (this.lastNoJobsNotification < sixHoursAgo) {
        await this.notificationService.sendNoJobsNotification();
        this.lastNoJobsNotification = new Date();
        this.logger.log('Sent no jobs notification');
      }
    }
  }

  // Manual trigger for testing
  async triggerManualScraping(): Promise<any> {
    this.logger.log('Manual scraping triggered');
    const result = await this.jobService.scrapeAndFilterJobs();
    
    if (result.newJobs.length > 0) {
      await this.notificationService.sendNewJobsNotification(result.newJobs);
    }
    
    return result;
  }
}
