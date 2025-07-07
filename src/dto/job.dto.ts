import { IsString, IsOptional, IsArray, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class JobListingDto {
  @ApiProperty()
  @IsString()
  id: string;

  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty()
  @IsString()
  company: string;

  @ApiProperty()
  @IsString()
  location: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  url?: string;

  @ApiProperty()
  @IsDateString()
  publishedDate: string;

  @ApiProperty()
  @IsDateString()
  scrapedAt: string;
}

export class ScrapingResultDto {
  @ApiProperty({ type: [JobListingDto] })
  @IsArray()
  jobs: JobListingDto[];

  @ApiProperty()
  totalFound: number;

  @ApiProperty({ type: [JobListingDto] })
  @IsArray()
  matchedJobs: JobListingDto[];

  @ApiProperty({ type: [JobListingDto] })
  @IsArray()
  newJobs: JobListingDto[];
}

export class AddRecipientDto {
  @ApiProperty({ example: '+18097694364', description: 'WhatsApp number to add (with or without whatsapp: prefix)' })
  @IsString()
  number: string;
}

export class RemoveRecipientDto {
  @ApiProperty({ example: '+18097694364', description: 'WhatsApp number to remove (with or without whatsapp: prefix)' })
  @IsString()
  number: string;
}

export class RecipientsResponseDto {
  @ApiProperty({ type: [String], example: ['whatsapp:+18097694364', 'whatsapp:+18097694365'] })
  @IsArray()
  recipients: string[];

  @ApiProperty({ example: 2 })
  count: number;
}
