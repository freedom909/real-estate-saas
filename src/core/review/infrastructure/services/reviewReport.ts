export enum ReportStatus {
  OPEN = "OPEN",
  RESOLVED = "RESOLVED",
  DISMISSED = "DISMISSED"
}

export interface ReviewReportProps {
  reporterId: string;
  reason: string;
  status: ReportStatus;
  createdAt: Date;
}

export class ReviewReport {
  constructor(public readonly props: ReviewReportProps) {}
}