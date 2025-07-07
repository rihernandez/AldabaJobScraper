import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JobListing, ScrapingResult } from '../interfaces/job.interface';
import { ScrapingService } from './scraping.service';

@Injectable()
export class JobService {
  private readonly logger = new Logger(JobService.name);
  private readonly keywords: string[];
  private readonly processedJobs: Set<string> = new Set();
  private lastJobsFound: Date = new Date();

  constructor(
    private configService: ConfigService,
    private scrapingService: ScrapingService,
  ) {
    this.keywords = this.configService.get<string[]>('keywords') || [];
    this.logger.log(`Initialized with ${this.keywords.length} keywords`);
  }

  async scrapeAndFilterJobs(): Promise<ScrapingResult> {
    try {
      // Scrape all jobs
      const allJobs = await this.scrapingService.scrapeJobs();
      
      // Filter jobs by keywords
      const matchedJobs = this.filterJobsByKeywords(allJobs);
      
      // Get only new jobs (not previously processed)
      const newJobs = this.getNewJobs(matchedJobs);
      
      // Update processed jobs set
      newJobs.forEach(job => this.processedJobs.add(job.id));
      
      // Update last jobs found timestamp if we have new jobs
      if (newJobs.length > 0) {
        this.lastJobsFound = new Date();
      }

      const result: ScrapingResult = {
        jobs: allJobs,
        totalFound: allJobs.length,
        matchedJobs,
        newJobs,
      };

      this.logger.log(`Scraping result: ${allJobs.length} total, ${matchedJobs.length} matched, ${newJobs.length} new`);
      return result;

    } catch (error) {
      this.logger.error('Error in scrapeAndFilterJobs', error.stack);
      throw error;
    }
  }

  private filterJobsByKeywords(jobs: JobListing[]): JobListing[] {
    return jobs.filter(job => {
      const searchText = `${job.title} ${job.company} ${job.location}`.toLowerCase();
      return this.keywords.some(keyword => 
        searchText.includes(keyword.toLowerCase())
      );
    });
  }

  private getNewJobs(jobs: JobListing[]): JobListing[] {
    return jobs.filter(job => !this.processedJobs.has(job.id));
  }

  shouldSendNoJobsNotification(): boolean {
    const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000);
    return this.lastJobsFound < sixHoursAgo;
  }

  getProcessedJobsCount(): number {
    return this.processedJobs.size;
  }

  getLastJobsFoundTime(): Date {
    return this.lastJobsFound;
  }

  getKeywords(): string[] {
    return this.keywords;
  }

  clearProcessedJobs(): void {
    this.processedJobs.clear();
    this.logger.log('Cleared processed jobs cache');
  }

  async getJobsStats(): Promise<{
    totalProcessed: number;
    lastJobsFound: Date;
    keywords: string[];
    nextNoJobsNotification: Date;
  }> {
    const sixHoursFromLastJobs = new Date(this.lastJobsFound.getTime() + 6 * 60 * 60 * 1000);
    
    return {
      totalProcessed: this.processedJobs.size,
      lastJobsFound: this.lastJobsFound,
      keywords: this.keywords,
      nextNoJobsNotification: sixHoursFromLastJobs,
    };
  }
}
