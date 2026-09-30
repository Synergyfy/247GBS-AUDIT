export type AuditFormType = "SHORT_FORM" | "LONG_FORM";

export interface AuditFormAnswer {
  id: string;
  questionId: string;
  text: string;
  scoreImpact: number | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
}

export interface AuditFormQuestion {
  id: string;
  formId: string;
  text: string;
  type: string;
  description: string | null;
  hint: string | null;
  required: boolean;
  category: string | null;
  config: Record<string, any>;
  order: number;
  isActive: boolean;
  answers: AuditFormAnswer[];
  createdAt: string;
}

export interface AuditForm {
  id: string;
  title: string;
  description: string | null;
  auditType: AuditFormType;
  slug: string | null;
  isDefault: boolean;
  status: "draft" | "published";
  sectorId?: string | null;
  sectorName?: string | null;
  categoryId?: string | null;
  categoryName?: string | null;
  subcategoryId?: string | null;
  subcategoryName?: string | null;
  questionCount?: number;
  questions?: AuditFormQuestion[];
  settings: Record<string, any>;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAuditFormPayload {
  title: string;
  description?: string | null;
  auditType: AuditFormType;
  isDefault?: boolean;
  sectorId?: string | null;
  sectorName?: string | null;
  categoryId?: string | null;
  categoryName?: string | null;
  subcategoryId?: string | null;
  subcategoryName?: string | null;
  settings?: Record<string, any>;
}

export interface UpdateAuditFormPayload {
  title?: string;
  description?: string | null;
  auditType?: AuditFormType;
  isDefault?: boolean;
  status?: string;
  sectorId?: string | null;
  sectorName?: string | null;
  categoryId?: string | null;
  categoryName?: string | null;
  subcategoryId?: string | null;
  subcategoryName?: string | null;
  settings?: Record<string, any>;
}

export interface CreateAuditQuestionPayload {
  text: string;
  type?: string;
  description?: string | null;
  hint?: string | null;
  required?: boolean;
  category?: string | null;
  config?: Record<string, any>;
  order?: number;
  isActive?: boolean;
}

export interface CreateAuditAnswerPayload {
  text: string;
  scoreImpact?: number | null;
  sortOrder?: number;
  isActive?: boolean;
}
