export interface AuditEvent {
  action: string;
  resourceId?: string;
  resourceType?: string;
  performedBy: string;
  metadata?: Record<string, any>;
}
