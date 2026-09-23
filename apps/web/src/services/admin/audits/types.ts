export type AdminAudit = {
  id: string;
  company?: string;
  type?: string;
  stage?: string;
  progress?: number;
  status?: string;
  dueDate?: string;
  assignee?: string;
};

export type AdminAuditsResponse = AdminAudit[];

export type AdminAuditsMetrics = {
  totalActive?: number;
  overdue?: number;
  inReview?: number;
  completedThisMonth?: number;
};

export default AdminAuditsResponse;
