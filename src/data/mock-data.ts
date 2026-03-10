// VistaX Data Platform - Mock Data & Types

export type Role = 'Admin' | 'Sale' | 'PM' | 'Production' | 'Finance' | 'Viewer';

export type Phase = 'Sale' | 'Planning' | 'Execution' | 'Closing';

export type DocStatus = 'Draft' | 'Shared' | 'Final' | 'Archived';

export type ProjectStatus = 'Active' | 'On Hold' | 'Completed' | 'Cancelled';

export interface DocumentVersion {
  v: number;
  fileName: string;
  uploadedAt: string;
  uploadedBy: string;
  note: string;
}

export interface Document {
  id: string;
  projectId: string;
  title: string;
  phase: Phase;
  category: string;
  docType: string;
  owner: string;
  status: DocStatus;
  versionCurrent: number;
  versions: DocumentVersion[];
  tags: {
    projectType: string;
    clientType: string;
    deliverableType: string;
  };
  createdAt: string;
  updatedAt: string;
  imported?: boolean;
}

export interface Project {
  id: string;
  name: string;
  code: string;
  clientName: string;
  projectType: string;
  status: ProjectStatus;
  createdAt: string;
  updatedAt: string;
  phases: Phase[];
  categoriesByPhase: Record<Phase, string[]>;
}

export interface TaxonomyItem {
  id: string;
  value: string;
  enabled: boolean;
}

export const PHASES: Phase[] = ['Sale', 'Planning', 'Execution', 'Closing'];

export const DEFAULT_CATEGORIES: Record<Phase, string[]> = {
  // Designed to match VistaX workflow diagram (v1)
  // Keep the same 4 phase keys for routing/data stability.
  Sale: [
    'Client Brief',
    'Discovery 360 / Solution Framing',
    'Solution Proposal',
    'Business Case (Phương án kinh doanh)',
    'Approval',
    'Project Proposal',
    'Contract',
  ],
  Planning: [
    'Project Onboarding',
    'Internal Kickoff',
    'Project Checklist',
    'Client Kickoff',
    'Technical Checklist',
    'Timeline Checklist',
    'Quality Checklist',
    'Resource Checklist',
    'Risk Checklist',
    'Communication Plan',
    'Project Charter',
    'Project Execution Plan',
  ],
  Execution: [
    'Execution',
    'Project Update',
    'Change Request',
    'Payment Process',
    'Deliverables',
  ],
  Closing: [
    'Acceptance & Handover',
    'Invoice & Settlement',
    'Project Closing',
    'After Sales Follow Up',
    'Post Mortem / Lessons Learnt',
    'Case Study / Testimonial',
  ],
};

export const DOC_TYPES = [
  // Sale + Advisory
  'Client Profile',
  'Project Brief',
  'Discovery 360',
  'Solution Proposal',
  'Business Case',
  'Approval Record',
  'Project Proposal',
  'Contract',
  // Planning
  'Project Onboarding Pack',
  'Internal Kickoff Notes',
  'Project Checklist',
  'Client Kickoff Notes',
  'Technical Checklist',
  'Timeline Checklist',
  'Quality Checklist',
  'Resource Checklist',
  'Risk Checklist',
  'Communication Plan',
  'Project Charter',
  'Project Execution Plan',
  // Execution
  'Project Update',
  'Change Request',
  'Payment Request',
  'Deliverable',
  // Closing
  'Acceptance',
  'Invoice/Settlement',
  'Project Closing Report',
  'After Sales Follow Up',
  'Post Mortem / Lessons Learnt',
  'Case Study / Testimonial',
  // Misc
  'Other',
];

export type WorkflowStatus = 'Not Started' | 'In Progress' | 'Done';

export interface WorkflowStep {
  id: string;
  phase: Phase;
  name: string;
  order: number;
  category: string;
  requiredDocTypes: string[];
  owners: Role[];
}

// Workflow steps (v1) — aligns with the diagram and used by the Workspace “Workflow” view.
export const WORKFLOW_STEPS_V1: WorkflowStep[] = [
  // Phase 1: Sale + Advisory
  {
    id: 'sale_01_brief',
    phase: 'Sale',
    name: 'Client Brief',
    order: 10,
    category: 'Client Brief',
    requiredDocTypes: ['Project Brief'],
    owners: ['Sale'],
  },
  {
    id: 'sale_02_discovery',
    phase: 'Sale',
    name: 'Discovery 360 / Solution Framing',
    order: 20,
    category: 'Discovery 360 / Solution Framing',
    requiredDocTypes: ['Discovery 360'],
    owners: ['Sale'],
  },
  {
    id: 'sale_03_solution_proposal',
    phase: 'Sale',
    name: 'Solution Proposal',
    order: 30,
    category: 'Solution Proposal',
    requiredDocTypes: ['Solution Proposal'],
    owners: ['Sale'],
  },
  {
    id: 'sale_04_business_case',
    phase: 'Sale',
    name: 'Business Case (Phương án kinh doanh)',
    order: 40,
    category: 'Business Case (Phương án kinh doanh)',
    requiredDocTypes: ['Business Case'],
    owners: ['Sale', 'Finance'],
  },
  {
    id: 'sale_05_approval',
    phase: 'Sale',
    name: 'Approval',
    order: 50,
    category: 'Approval',
    requiredDocTypes: ['Approval Record'],
    owners: ['Admin'],
  },
  {
    id: 'sale_06_project_proposal',
    phase: 'Sale',
    name: 'Project Proposal',
    order: 60,
    category: 'Project Proposal',
    requiredDocTypes: ['Project Proposal'],
    owners: ['Sale'],
  },
  {
    id: 'sale_07_contract',
    phase: 'Sale',
    name: 'Contract',
    order: 70,
    category: 'Contract',
    requiredDocTypes: ['Contract'],
    owners: ['Sale', 'Admin'],
  },

  // Phase 2: Project Planning
  {
    id: 'plan_01_onboarding',
    phase: 'Planning',
    name: 'Project Onboarding',
    order: 10,
    category: 'Project Onboarding',
    requiredDocTypes: ['Project Onboarding Pack'],
    owners: ['PM'],
  },
  {
    id: 'plan_02_internal_kickoff',
    phase: 'Planning',
    name: 'Internal Kickoff',
    order: 20,
    category: 'Internal Kickoff',
    requiredDocTypes: ['Internal Kickoff Notes'],
    owners: ['PM'],
  },
  {
    id: 'plan_03_project_checklist',
    phase: 'Planning',
    name: 'Project Checklist',
    order: 30,
    category: 'Project Checklist',
    requiredDocTypes: ['Project Checklist'],
    owners: ['PM'],
  },
  {
    id: 'plan_04_client_kickoff',
    phase: 'Planning',
    name: 'Client Kickoff',
    order: 40,
    category: 'Client Kickoff',
    requiredDocTypes: ['Client Kickoff Notes'],
    owners: ['PM', 'Sale'],
  },
  {
    id: 'plan_05_checklists',
    phase: 'Planning',
    name: 'Checklists (Technical/Timeline/Quality/Resource/Risk)',
    order: 50,
    category: 'Technical Checklist',
    requiredDocTypes: ['Technical Checklist', 'Timeline Checklist', 'Quality Checklist', 'Resource Checklist', 'Risk Checklist'],
    owners: ['PM', 'Production'],
  },
  {
    id: 'plan_06_comm_plan',
    phase: 'Planning',
    name: 'Communication Plan',
    order: 60,
    category: 'Communication Plan',
    requiredDocTypes: ['Communication Plan'],
    owners: ['PM'],
  },
  {
    id: 'plan_07_charter',
    phase: 'Planning',
    name: 'Project Charter',
    order: 70,
    category: 'Project Charter',
    requiredDocTypes: ['Project Charter'],
    owners: ['PM'],
  },
  {
    id: 'plan_08_execution_plan',
    phase: 'Planning',
    name: 'Project Execution Plan',
    order: 80,
    category: 'Project Execution Plan',
    requiredDocTypes: ['Project Execution Plan'],
    owners: ['PM'],
  },

  // Phase 3: Execution
  {
    id: 'exec_01_execution',
    phase: 'Execution',
    name: 'Execution',
    order: 10,
    category: 'Execution',
    requiredDocTypes: ['Deliverable'],
    owners: ['PM', 'Production'],
  },
  {
    id: 'exec_02_updates',
    phase: 'Execution',
    name: 'Project Update',
    order: 20,
    category: 'Project Update',
    requiredDocTypes: ['Project Update'],
    owners: ['PM'],
  },
  {
    id: 'exec_03_change',
    phase: 'Execution',
    name: 'Change Request',
    order: 30,
    category: 'Change Request',
    requiredDocTypes: ['Change Request'],
    owners: ['PM', 'Sale'],
  },
  {
    id: 'exec_04_payment',
    phase: 'Execution',
    name: 'Payment Process',
    order: 40,
    category: 'Payment Process',
    requiredDocTypes: ['Payment Request'],
    owners: ['Finance', 'PM'],
  },

  // Phase 4: Project Closing
  {
    id: 'close_01_acceptance',
    phase: 'Closing',
    name: 'Acceptance & Handover',
    order: 10,
    category: 'Acceptance & Handover',
    requiredDocTypes: ['Acceptance'],
    owners: ['PM'],
  },
  {
    id: 'close_02_invoice',
    phase: 'Closing',
    name: 'Invoice & Settlement',
    order: 20,
    category: 'Invoice & Settlement',
    requiredDocTypes: ['Invoice/Settlement'],
    owners: ['Finance'],
  },
  {
    id: 'close_03_closing_report',
    phase: 'Closing',
    name: 'Project Closing',
    order: 30,
    category: 'Project Closing',
    requiredDocTypes: ['Project Closing Report'],
    owners: ['PM'],
  },
  {
    id: 'close_04_after_sales',
    phase: 'Closing',
    name: 'After Sales Follow Up',
    order: 40,
    category: 'After Sales Follow Up',
    requiredDocTypes: ['After Sales Follow Up'],
    owners: ['Sale'],
  },
  {
    id: 'close_05_post_mortem',
    phase: 'Closing',
    name: 'Post Mortem / Lessons Learnt',
    order: 50,
    category: 'Post Mortem / Lessons Learnt',
    requiredDocTypes: ['Post Mortem / Lessons Learnt'],
    owners: ['PM'],
  },
];

export const PHASE_PERMISSIONS: Record<Role, Phase[]> = {
  Admin: ['Sale', 'Planning', 'Execution', 'Closing'],
  Sale: ['Sale'],
  PM: ['Planning', 'Execution'],
  Production: ['Execution'],
  Finance: ['Closing'],
  Viewer: [],
};

export const PROJECT_TYPES: TaxonomyItem[] = [
  { id: '1', value: 'CGI', enabled: true },
  { id: '2', value: 'Animation', enabled: true },
  { id: '3', value: '360', enabled: true },
  { id: '4', value: 'Mixed', enabled: true },
];

export const CLIENT_TYPES: TaxonomyItem[] = [
  { id: '1', value: 'Developer', enabled: true },
  { id: '2', value: 'Agency', enabled: true },
  { id: '3', value: 'Enterprise', enabled: true },
  { id: '4', value: 'Other', enabled: true },
];

export const DELIVERABLE_TYPES: TaxonomyItem[] = [
  { id: '1', value: 'Image', enabled: true },
  { id: '2', value: 'Video', enabled: true },
  { id: '3', value: '360', enabled: true },
  { id: '4', value: 'Document', enabled: true },
  { id: '5', value: 'Other', enabled: true },
];

export const MOCK_PROJECTS: Project[] = [
  {
    id: 'p1',
    name: 'Vinhomes Grand Park - CGI Package',
    code: 'VGP-2024-001',
    clientName: 'Vinhomes',
    projectType: 'CGI',
    status: 'Active',
    createdAt: '2024-01-15',
    updatedAt: '2024-03-01',
    phases: PHASES,
    categoriesByPhase: { ...DEFAULT_CATEGORIES },
  },
  {
    id: 'p2',
    name: 'Masterise Lumière - Animation',
    code: 'MLR-2024-002',
    clientName: 'Masterise Homes',
    projectType: 'Animation',
    status: 'Active',
    createdAt: '2024-02-01',
    updatedAt: '2024-03-02',
    phases: PHASES,
    categoriesByPhase: { ...DEFAULT_CATEGORIES },
  },
  {
    id: 'p3',
    name: 'Novaland - 360 Virtual Tour',
    code: 'NVL-2024-003',
    clientName: 'Novaland',
    projectType: '360',
    status: 'Completed',
    createdAt: '2023-11-01',
    updatedAt: '2024-02-28',
    phases: PHASES,
    categoriesByPhase: { ...DEFAULT_CATEGORIES },
  },
];

export const MOCK_DOCUMENTS: Document[] = [
  {
    id: 'd1', projectId: 'p1', title: 'Project Brief - VGP CGI', phase: 'Sale', category: 'Client Brief', docType: 'Project Brief',
    owner: 'Nguyen Van A', status: 'Final', versionCurrent: 2,
    versions: [
      { v: 1, fileName: 'VGP_Brief_v1.pdf', uploadedAt: '2024-01-15', uploadedBy: 'Nguyen Van A', note: 'Initial draft' },
      { v: 2, fileName: 'VGP_Brief_v2.pdf', uploadedAt: '2024-01-20', uploadedBy: 'Nguyen Van A', note: 'Client feedback incorporated' },
    ],
    tags: { projectType: 'CGI', clientType: 'Developer', deliverableType: 'Document' },
    createdAt: '2024-01-15', updatedAt: '2024-01-20',
  },
  {
    id: 'd2', projectId: 'p1', title: 'Solution Proposal - VGP', phase: 'Sale', category: 'Solution Proposal', docType: 'Solution Proposal',
    owner: 'Tran Thi B', status: 'Shared', versionCurrent: 1,
    versions: [
      { v: 1, fileName: 'VGP_Proposal_v1.pdf', uploadedAt: '2024-01-18', uploadedBy: 'Tran Thi B', note: 'First version' },
    ],
    tags: { projectType: 'CGI', clientType: 'Developer', deliverableType: 'Document' },
    createdAt: '2024-01-18', updatedAt: '2024-01-18',
  },
  {
    id: 'd3', projectId: 'p1', title: 'Service Contract - VGP', phase: 'Sale', category: 'Contract', docType: 'Contract',
    owner: 'Le Van C', status: 'Final', versionCurrent: 3,
    versions: [
      { v: 1, fileName: 'VGP_Contract_v1.docx', uploadedAt: '2024-01-22', uploadedBy: 'Le Van C', note: 'Draft' },
      { v: 2, fileName: 'VGP_Contract_v2.docx', uploadedAt: '2024-01-25', uploadedBy: 'Le Van C', note: 'Legal review' },
      { v: 3, fileName: 'VGP_Contract_v3.docx', uploadedAt: '2024-01-28', uploadedBy: 'Le Van C', note: 'Signed version' },
    ],
    tags: { projectType: 'CGI', clientType: 'Developer', deliverableType: 'Document' },
    createdAt: '2024-01-22', updatedAt: '2024-01-28',
  },
  {
    id: 'd4', projectId: 'p1', title: 'Project Charter - VGP', phase: 'Planning', category: 'Project Charter', docType: 'Project Charter',
    owner: 'Pham Thi D', status: 'Final', versionCurrent: 1,
    versions: [
      { v: 1, fileName: 'VGP_Charter_v1.pdf', uploadedAt: '2024-02-01', uploadedBy: 'Pham Thi D', note: 'Approved' },
    ],
    tags: { projectType: 'CGI', clientType: 'Developer', deliverableType: 'Document' },
    createdAt: '2024-02-01', updatedAt: '2024-02-01',
  },
  {
    id: 'd5', projectId: 'p1', title: 'Project Execution Plan - VGP', phase: 'Planning', category: 'Project Execution Plan', docType: 'Project Execution Plan',
    owner: 'Pham Thi D', status: 'Draft', versionCurrent: 1,
    versions: [
      { v: 1, fileName: 'VGP_Plan_v1.xlsx', uploadedAt: '2024-02-05', uploadedBy: 'Pham Thi D', note: 'WIP' },
    ],
    tags: { projectType: 'CGI', clientType: 'Developer', deliverableType: 'Document' },
    createdAt: '2024-02-05', updatedAt: '2024-02-05',
  },
  {
    id: 'd6', projectId: 'p1', title: 'CGI Renders - Lobby', phase: 'Execution', category: 'Deliverables', docType: 'Deliverable',
    owner: 'Hoang Van E', status: 'Shared', versionCurrent: 2,
    versions: [
      { v: 1, fileName: 'VGP_Lobby_v1.zip', uploadedAt: '2024-02-15', uploadedBy: 'Hoang Van E', note: 'First pass' },
      { v: 2, fileName: 'VGP_Lobby_v2.zip', uploadedAt: '2024-02-20', uploadedBy: 'Hoang Van E', note: 'Color correction' },
    ],
    tags: { projectType: 'CGI', clientType: 'Developer', deliverableType: 'Image' },
    createdAt: '2024-02-15', updatedAt: '2024-02-20',
  },
  {
    id: 'd7', projectId: 'p2', title: 'Animation Brief - Lumière', phase: 'Sale', category: 'Client Brief', docType: 'Project Brief',
    owner: 'Nguyen Van A', status: 'Final', versionCurrent: 1,
    versions: [
      { v: 1, fileName: 'MLR_Brief_v1.pdf', uploadedAt: '2024-02-01', uploadedBy: 'Nguyen Van A', note: 'Final' },
    ],
    tags: { projectType: 'Animation', clientType: 'Developer', deliverableType: 'Document' },
    createdAt: '2024-02-01', updatedAt: '2024-02-01',
  },
  {
    id: 'd8', projectId: 'p2', title: 'Storyboard - Lumière Flythrough', phase: 'Execution', category: 'Deliverables', docType: 'Deliverable',
    owner: 'Hoang Van E', status: 'Draft', versionCurrent: 1,
    versions: [
      { v: 1, fileName: 'MLR_Storyboard_v1.pdf', uploadedAt: '2024-02-20', uploadedBy: 'Hoang Van E', note: 'Draft storyboard' },
    ],
    tags: { projectType: 'Animation', clientType: 'Developer', deliverableType: 'Video' },
    createdAt: '2024-02-20', updatedAt: '2024-02-20',
  },
];

export const PHASE_LABELS: Record<Phase, string> = {
  // Keep stable phase keys for data & routing, but match the latest workflow naming.
  Sale: 'Sale + Advisory',
  Planning: 'Project Planning',
  Execution: 'Execution',
  Closing: 'Project Closing',
};

export const STATUS_LABELS: Record<DocStatus, string> = {
  Draft: 'Bản nháp',
  Shared: 'Đã chia sẻ',
  Final: 'Hoàn thiện',
  Archived: 'Lưu trữ',
};

export const ROLE_LABELS: Record<Role, string> = {
  Admin: 'Quản trị viên',
  Sale: 'Kinh doanh',
  PM: 'Quản lý dự án',
  Production: 'Sản xuất',
  Finance: 'Tài chính',
  Viewer: 'Xem',
};

export function canEditPhase(role: Role, phase: Phase): boolean {
  return PHASE_PERMISSIONS[role].includes(phase);
}

export function getDocsByProject(projectId: string): Document[] {
  return MOCK_DOCUMENTS.filter(d => d.projectId === projectId);
}

export function getDocsByPhase(projectId: string, phase: Phase): Document[] {
  return MOCK_DOCUMENTS.filter(d => d.projectId === projectId && d.phase === phase);
}

export function getDocsByCategory(projectId: string, phase: Phase, category: string): Document[] {
  return MOCK_DOCUMENTS.filter(d => d.projectId === projectId && d.phase === phase && d.category === category);
}
