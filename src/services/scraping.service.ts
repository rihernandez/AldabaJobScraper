import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import puppeteer from 'puppeteer';
import { JobListing } from '../interfaces/job.interface';

@Injectable()
export class ScrapingService {
  private readonly logger = new Logger(ScrapingService.name);
  private readonly scrapingUrl: string;

  constructor(private configService: ConfigService) {
    this.scrapingUrl = this.configService.get<string>('scraping.url');
  }

  async scrapeJobs(): Promise<JobListing[]> {
    this.logger.log('Starting job scraping from Aldaba.com');
    
    let browser;
    try {
      browser = await puppeteer.launch({
        headless: true,
        executablePath: '/nix/store/zi4f80l169xlmivz8vja8wlphq74qqk0-chromium-125.0.6422.141/bin/chromium',
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu',
          '--disable-extensions',
          '--disable-background-timer-throttling',
          '--disable-backgrounding-occluded-windows',
          '--disable-renderer-backgrounding',
          '--disable-features=TranslateUI',
          '--disable-ipc-flooding-protection',
          '--enable-features=NetworkService,NetworkServiceInProcess',
          '--force-color-profile=srgb',
          '--metrics-recording-only',
          '--disable-background-networking',
        ],
      });

      const page = await browser.newPage();
      await page.setUserAgent(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      );

      await page.goto(this.scrapingUrl, {
        waitUntil: 'networkidle2',
        timeout: 30000,
      });

      // Wait for job listings to load
      await page.waitForSelector('table tr', { timeout: 10000 });

      const jobs = await page.evaluate(() => {
        const jobRows = document.querySelectorAll('table tr');
        const jobListings: any[] = [];

        jobRows.forEach((row, index) => {
          // Skip header rows and non-job rows
          if (index === 0 || !row.textContent.trim()) return;

          const cells = row.querySelectorAll('td');
          if (cells.length >= 3) {
            const titleCell = cells[0];
            const companyCell = cells[1];
            const locationCell = cells[2];

            const title = titleCell?.textContent?.trim() || '';
            const company = companyCell?.textContent?.trim() || '';
            const location = locationCell?.textContent?.trim() || '';

            // Get job URL if available
            const linkElement = titleCell?.querySelector('a');
            const jobUrl = linkElement?.href || '';

            if (title && company && location) {
              jobListings.push({
                id: `${title}-${company}-${location}`.replace(/\s+/g, '-').toLowerCase(),
                title,
                company,
                location,
                url: jobUrl,
                publishedDate: new Date().toISOString(),
                scrapedAt: new Date().toISOString(),
              });
            }
          }
        });

        return jobListings;
      });

      this.logger.log(`Successfully scraped ${jobs.length} jobs from Aldaba.com`);
      return jobs.map(job => ({
        ...job,
        publishedDate: new Date(job.publishedDate),
        scrapedAt: new Date(job.scrapedAt),
      }));

    } catch (error) {
      this.logger.error('Error scraping jobs from Aldaba.com', error.stack);
      throw error;
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }

  async scrapeJobDetails(jobUrl: string): Promise<string> {
    if (!jobUrl) return '';

    let browser;
    try {
      browser = await puppeteer.launch({
        headless: true,
        executablePath: '/nix/store/zi4f80l169xlmivz8vja8wlphq74qqk0-chromium-125.0.6422.141/bin/chromium',
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
          '--disable-extensions',
        ],
      });

      const page = await browser.newPage();
      await page.goto(jobUrl, { waitUntil: 'networkidle2', timeout: 15000 });

      const description = await page.evaluate(() => {
        // Try to find job description in common selectors
        const descriptionSelectors = [
          '.job-description',
          '.description',
          '.content',
          'div[class*="description"]',
          'div[class*="content"]',
        ];

        for (const selector of descriptionSelectors) {
          const element = document.querySelector(selector);
          if (element) {
            return element.textContent?.trim() || '';
          }
        }

        // Fallback to body text
        return document.body.textContent?.trim() || '';
      });

      return description;
    } catch (error) {
      this.logger.warn(`Failed to scrape job details from ${jobUrl}`, error.message);
      return '';
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }
}
