import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule } from '@nestjs/config';
import { JobController } from './controllers/job.controller';
import { ScrapingService } from './services/scraping.service';
import { NotificationService } from './services/notification.service';
import { JobService } from './services/job.service';
import { ScrapingTask } from './tasks/scraping.task';
import configuration from './config/configuration';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    ScheduleModule.forRoot(),
  ],
  controllers: [JobController],
  providers: [
    ScrapingService,
    NotificationService,
    JobService,
    ScrapingTask,
  ],
})
export class AppModule {}
