import { Controller, Get, Post, Logger, Res, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Response } from 'express';
import * as path from 'path';
import { JobService } from '../services/job.service';
import { NotificationService } from '../services/notification.service';
import { ScrapingTask } from '../tasks/scraping.task';
import { ScrapingResultDto, AddRecipientDto, RemoveRecipientDto, RecipientsResponseDto } from '../dto/job.dto';

@ApiTags('jobs')
@Controller()
export class JobController {
  private readonly logger = new Logger(JobController.name);

  constructor(
    private jobService: JobService,
    private notificationService: NotificationService,
    private scrapingTask: ScrapingTask,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Dashboard web interface' })
  @ApiResponse({ status: 200, description: 'Dashboard HTML page' })
  async dashboard(@Res() res: Response) {
    const htmlPath = path.join(process.cwd(), 'public', 'index.html');
    return res.sendFile(htmlPath);
  }

  @Get('api/jobs/scrape')
  @ApiOperation({ summary: 'Trigger manual job scraping' })
  @ApiResponse({ status: 200, description: 'Jobs scraped successfully', type: ScrapingResultDto })
  async scrapeJobs() {
    this.logger.log('Manual scraping triggered via API');
    return await this.scrapingTask.triggerManualScraping();
  }

  @Get('api/jobs/stats')
  @ApiOperation({ summary: 'Get scraping statistics' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  async getStats() {
    const stats = await this.jobService.getJobsStats();
    return {
      ...stats,
      status: 'active',
      scrapingInterval: '5 minutes',
      noJobsNotificationInterval: '6 hours',
    };
  }

  @Get('api/jobs/keywords')
  @ApiOperation({ summary: 'Get configured keywords' })
  @ApiResponse({ status: 200, description: 'Keywords retrieved successfully' })
  async getKeywords() {
    return {
      keywords: this.jobService.getKeywords(),
      count: this.jobService.getKeywords().length,
    };
  }

  @Post('api/jobs/test-notification')
  @ApiOperation({ summary: 'Send test WhatsApp notification' })
  @ApiResponse({ status: 200, description: 'Test notification sent successfully' })
  async sendTestNotification() {
    await this.notificationService.sendTestNotification();
    return { message: 'Test notification sent successfully' };
  }

  @Post('api/jobs/clear-cache')
  @ApiOperation({ summary: 'Clear processed jobs cache' })
  @ApiResponse({ status: 200, description: 'Cache cleared successfully' })
  async clearCache() {
    this.jobService.clearProcessedJobs();
    return { message: 'Processed jobs cache cleared successfully' };
  }

  @Get('api/jobs/health')
  @ApiOperation({ summary: 'Health check endpoint' })
  @ApiResponse({ status: 200, description: 'Service is healthy' })
  async healthCheck() {
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
    };
  }

  @Get('api/jobs/recipients')
  @ApiOperation({ summary: 'Get all WhatsApp recipient numbers' })
  @ApiResponse({ status: 200, description: 'Recipients retrieved successfully', type: RecipientsResponseDto })
  async getRecipients(): Promise<RecipientsResponseDto> {
    const recipients = this.notificationService.getRecipientNumbers();
    return {
      recipients,
      count: recipients.length,
    };
  }

  @Post('api/jobs/recipients/add')
  @ApiOperation({ summary: 'Add a new WhatsApp recipient number' })
  @ApiResponse({ status: 200, description: 'Recipient added successfully' })
  @ApiResponse({ status: 400, description: 'Invalid number format' })
  async addRecipient(@Body() addRecipientDto: AddRecipientDto) {
    try {
      this.notificationService.addRecipientNumber(addRecipientDto.number);
      const recipients = this.notificationService.getRecipientNumbers();
      return { 
        message: `Recipient added successfully`,
        number: addRecipientDto.number,
        totalRecipients: recipients.length,
        recipients 
      };
    } catch (error) {
      this.logger.error('Failed to add recipient', error.stack);
      throw error;
    }
  }

  @Post('api/jobs/recipients/remove')
  @ApiOperation({ summary: 'Remove a WhatsApp recipient number' })
  @ApiResponse({ status: 200, description: 'Recipient removed successfully' })
  @ApiResponse({ status: 404, description: 'Recipient not found' })
  async removeRecipient(@Body() removeRecipientDto: RemoveRecipientDto) {
    const removed = this.notificationService.removeRecipientNumber(removeRecipientDto.number);
    const recipients = this.notificationService.getRecipientNumbers();
    
    if (removed) {
      return { 
        message: `Recipient removed successfully`,
        number: removeRecipientDto.number,
        totalRecipients: recipients.length,
        recipients 
      };
    } else {
      return { 
        message: `Recipient not found`,
        number: removeRecipientDto.number,
        totalRecipients: recipients.length,
        recipients 
      };
    }
  }

  @Post('api/jobs/recipients/clear')
  @ApiOperation({ summary: 'Clear all WhatsApp recipient numbers' })
  @ApiResponse({ status: 200, description: 'All recipients cleared successfully' })
  async clearRecipients() {
    this.notificationService.clearRecipientNumbers();
    return { 
      message: 'All recipients cleared successfully',
      totalRecipients: 0,
      recipients: []
    };
  }
}
