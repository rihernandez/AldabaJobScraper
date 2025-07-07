export interface JobListing {
  id: string;
  title: string;
  company: string;
  location: string;
  description?: string;
  url?: string;
  publishedDate: Date;
  scrapedAt: Date;
}

export interface ScrapingResult {
  jobs: JobListing[];
  totalFound: number;
  matchedJobs: JobListing[];
  newJobs: JobListing[];
}
