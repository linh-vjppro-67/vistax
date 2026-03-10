import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '@/contexts/DataContext';
import { Phase, PHASE_LABELS, WORKFLOW_STEPS_V1 } from '@/data/mock-data';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  FileText, ChevronRight, ArrowRight, CheckCircle2,
  Circle, AlertTriangle, FolderOpen, Info
} from 'lucide-react';

// URL segment -> Phase
const PHASE_MAP: Record<string, Phase> = {
  sale: 'Sale',
  planning: 'Planning',
  execution: 'Execution',
  closing: 'Closing',
};

// URL sub-segment -> category name
const STEP_MAP: Record<string, string> = {
  'client-brief':       'Client Brief',
  'discovery':          'Discovery 360 / Solution Framing',
  'solution-proposal':  'Solution Proposal',
  'business-case':      'Business Case (Phương án kinh doanh)',
  'approval':           'Approval',
  'project-proposal':   'Project Proposal',
  'contract':           'Contract',
  'onboarding':         'Project Onboarding',
  'internal-kickoff':   'Internal Kickoff',
  'checklist':          'Project Checklist',
  'client-kickoff':     'Client Kickoff',
  'charter':            'Project Charter',
  'execution-plan':     'Project Execution Plan',
  'run':                'Execution',
  'update':             'Project Update',
  'change-request':     'Change Request',
  'payment':            'Payment Process',
  'close':              'Project Closing',
  'after-sales':        'After Sales Follow Up',
  'post-mortem':        'Post Mortem / Lessons Learnt',
};

// Step descriptions from workflow diagrams
const STEP_DESCRIPTIONS: Record<string, { description: string; owners: string[] }> = {
  'Client Brief':                               { description: 'Client Profile, Overview dự án, Business Objectives, SOW (Deliverables, Timeline, Budget), MKT/Usage Strategy, Creative Direction/Branding, Data Input, Risk Assessment, Project Score.', owners: ['Sale Executive'] },
  'Discovery 360 / Solution Framing':           { description: 'Client/Business/Project Objectives, nhận thông tin giải pháp, Mapping VistaX Solutions, Value Proposition Mapping (USP, ROI), Cost of doing nothing, Implementation Roadmap.', owners: ['Sale Executive', 'Solution Advisor'] },
  'Solution Proposal':                          { description: 'Client/Project Insights, Showcase VistaX sản phẩm, Đề nghị VistaX Solutions (SOW, Directions, Implementation, Usages), Why (USP, ROI, Strategic Expertise, Risk).', owners: ['Sale Executive', 'Solution Advisor'] },
  'Business Case (Phương án kinh doanh)':       { description: 'Revenue Structure, Cost Structure (Production Cost, Outsource, % Hoa hồng Sale, % PM), Margin & Risk Calculation, Resource và Capacity Planning, Risk Management.', owners: ['Solution Advisor', 'Sale Executive', 'Procurement', 'Technical Lead'] },
  'Approval':                                   { description: 'CEO phê duyệt Phương án Kinh doanh trước khi gửi Project Proposal cho client.', owners: ['CEO'] },
  'Project Proposal':                           { description: 'Scope of Work, Deliverables, Timeline, Price/Quotation, Project Governance (Communication, Feedback, Decision, Revision, Payment), Strategic Insights (Direction, ROI, USP), Case Studies, Reference.', owners: ['Sale Executive', 'Solution Executive'] },
  'Contract':                                   { description: 'Deliverables, Timeline, Price/Cost, Revision & Approval Structure, Payment Structure, Intellectual Property & Usage Rights, Confidentiality, Termination Clause, Clients Responsibilities.', owners: ['Sale Executive', 'Solution Executive'] },
  'Project Onboarding':                         { description: 'Project Overview Summary, Scope Breakdown (Deliverables, In/Out of Scope), Timeline/Milestones, Data/Asset Inventory, Resource/Incentive Allocation, Governance & Communication Protocol, Insights.', owners: ['Solution Executive', 'PM'] },
  'Internal Kickoff':                           { description: 'Đồng bộ toàn team về dự án, Review SOW/Timeline/giải pháp, Nhận thông tin giải pháp, Xác nhận năng lực/timeline, Thiết lập kế hoạch giải pháp, Đưa ra check list/câu hỏi.', owners: ['PM', 'Solution Executive', 'Technical Lead', 'Operation Team'] },
  'Project Checklist':                          { description: 'Check list thông tin cần thiết đầu vào, Asset và Document Request (CAD, 3D Model, Masterplan, unitMaterials, Branding, Reference), Gởi trước cho Client trước buổi Client Kick off.', owners: ['PM'] },
  'Client Kickoff':                             { description: '3 key objectives: Thấu hiểu mục tiêu/mong muốn, Giải đáp câu hỏi/thông tin cần thiết, Thiết lập Workflow/Governance Framework cho dự án.', owners: ['PM', 'Sale Executive'] },
  'Project Charter':                            { description: '"Single Source of Truth" cho tất cả liên quan. Nội dung: Project Overview, Scope & Deliverables, Milestones & Base Timeline, Governance & Communication, Change/Revision Control.', owners: ['PM'] },
  'Project Execution Plan':                     { description: '"Bản đồ tác chiến": ai làm gì, khi nào, QC nào, rủi ro nào. Timeline Execution theo đúng 6 trục quản trị: Deliverables, Timeline, Quality, Resource, Communication, Risk.', owners: ['PM'] },
  'Execution':                                  { description: 'PM vận hành theo 3 vòng kiểm soát: Loop 1 Daily Production Control (Resource), Loop 2 Milestone Gate Control (Timeline/QC), Loop 3 Client Alignment (Update/Feedback).', owners: ['PM', 'Technical Lead', 'Team Lead', 'Production Team'] },
  'Project Update':                             { description: 'PM update tiến độ dự án, deliver theo tiến độ, commitment theo Project Execution Plan và Project Charter. Format: Summary, Completed, In progress/Next step, Điều cần support, Risk/Issues, Timeline Checkpoint.', owners: ['PM'] },
  'Change Request':                             { description: 'PM tạo Change Requests khi: Client thay đổi Scope/Timeline/Quality, Client Update thay đổi không theo thỏa thuận, Client không comment/feedback. Quy trình: Ghi nhận → Impact Analysis → Option Proposal → Client Approval → Update Charter.', owners: ['PM', 'Sale Executive'] },
  'Payment Process':                            { description: 'Quy trình thanh toán theo milestone đã thỏa thuận trong hợp đồng.', owners: ['Procurement', 'Kế toán'] },
  'Project Closing':                            { description: 'Chính thức hoàn tất scope Project Charter, Xác nhận bàn giao/nghiệm thu. PM follow theo việc và concern về Project Charter. Solution Advisor/Sale/Procurements follow về invoice/thanh toán.', owners: ['PM', 'Solution Advisor', 'Sale Executive', 'Procurement', 'Kế toán'] },
  'After Sales Follow Up':                      { description: 'Chăm sóc khách hàng follow up, Thu thập Testimonial/Case studies, Giữ mối quan hệ và khai thác cơ hội dự án tiếp theo, Giữ VistaX top-of-mind, Giúp PM hoàn thành Post Mortem và Lessons Learnt.', owners: ['Sale Executive'] },
  'Post Mortem / Lessons Learnt':              { description: 'Rút kinh nghiệm điều làm tốt/chưa tốt, Tối ưu quy trình, Nâng cấp chất lượng sản phẩm/dịch vụ/chuyên môn, Bảo vệ margin tương lai.', owners: ['PM', 'Solution Advisor', 'Sale Executive', 'Technical Lead', 'Team Lead'] },
};

const PHASES_ORDER: Phase[] = ['Sale', 'Planning', 'Execution', 'Closing'];

const phaseColors: Record<Phase, { dot: string; badge: string; border: string }> = {
  Sale:      { dot: 'bg-orange-400', badge: 'bg-orange-100 text-orange-700', border: 'border-l-orange-400' },
  Planning:  { dot: 'bg-teal-400',   badge: 'bg-teal-100 text-teal-700',     border: 'border-l-teal-400' },
  Execution: { dot: 'bg-purple-400', badge: 'bg-purple-100 text-purple-700', border: 'border-l-purple-400' },
  Closing:   { dot: 'bg-green-400',  badge: 'bg-green-100 text-green-700',   border: 'border-l-green-400' },
};

export default function PhaseWorkflowPage() {
  const { phaseSlug, stepSlug } = useParams<{ phaseSlug: string; stepSlug?: string }>();
  const navigate = useNavigate();
  const { documents, projects } = useData();

  const phase = PHASE_MAP[phaseSlug || ''];
  if (!phase) return <div className="text-center py-20 text-muted-foreground">Phase không tồn tại</div>;

  const col = phaseColors[phase];
  const stepsForPhase = WORKFLOW_STEPS_V1.filter(s => s.phase === phase).sort((a, b) => a.order - b.order);
  const activeCategory = stepSlug ? STEP_MAP[stepSlug] : undefined;
  const activeStep = activeCategory ? stepsForPhase.find(s => s.category === activeCategory) : undefined;

  const getDocsForCategory = (category: string) =>
    documents.filter(d => d.phase === phase && d.category === category);

  const getCategorySlug = (category: string) =>
    Object.entries(STEP_MAP).find(([, v]) => v === category)?.[0];

  // ---- Step detail view ----
  if (activeStep) {
    const stepDocs = getDocsForCategory(activeStep.category);
    const stepDesc = STEP_DESCRIPTIONS[activeStep.category];
    const activeIdx = stepsForPhase.findIndex(s => s.id === activeStep.id);

    return (
      <div className="space-y-5">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <button onClick={() => navigate(`/phase/${phaseSlug}`)} className="hover:text-foreground">
            {PHASE_LABELS[phase]}
          </button>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground font-medium">{activeStep.name}</span>
        </div>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold">{activeStep.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge className={`text-xs ${col.badge}`}>{PHASE_LABELS[phase]}</Badge>
              <span className="text-xs text-muted-foreground">Bước {activeIdx + 1}/{stepsForPhase.length}</span>
            </div>
          </div>
        </div>

        {/* Description */}
        {stepDesc && (
          <Card className={`border-l-4 ${col.border}`}>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-start gap-2 mb-2">
                <Info className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                <p className="text-sm text-muted-foreground leading-relaxed">{stepDesc.description}</p>
              </div>
              <div className="flex items-center gap-2 mt-3">
                <span className="text-xs text-muted-foreground font-medium">Người thực hiện:</span>
                {stepDesc.owners.map(o => (
                  <Badge key={o} variant="outline" className="text-xs">{o}</Badge>
                ))}
              </div>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs text-muted-foreground font-medium">Tài liệu cần có:</span>
                {activeStep.requiredDocTypes.map(d => (
                  <Badge key={d} variant="secondary" className="text-xs">{d}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Documents across ALL projects for this phase+category */}
        <div>
          <h2 className="text-sm font-semibold mb-3">
            Tài liệu trong bước này ({stepDocs.length})
          </h2>

          {stepDocs.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground text-sm">
                <FolderOpen className="h-8 w-8 mx-auto mb-2 opacity-30" />
                Chưa có tài liệu nào cho bước này.<br />
                <span className="text-xs">Mở một dự án cụ thể và upload tài liệu tại đó.</span>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {stepDocs.map(doc => {
                const project = projects.find(p => p.id === doc.projectId);
                return (
                  <Card
                    key={doc.id}
                    className="hover:shadow-sm transition-shadow cursor-pointer"
                    onClick={() => navigate(`/projects/${doc.projectId}/docs/${doc.id}`)}
                  >
                    <CardContent className="py-3 px-4 flex items-center gap-3">
                      <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{doc.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {project?.name || doc.projectId} · {doc.docType} · v{doc.versionCurrent}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge variant="secondary" className="text-xs">{doc.status}</Badge>
                        <span className="text-xs text-muted-foreground">{doc.updatedAt.slice(0, 10)}</span>
                        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Prev / Next step nav */}
        <div className="flex gap-3 pt-2">
          {activeIdx > 0 && (
            <Button variant="outline" size="sm" onClick={() => {
              const prev = stepsForPhase[activeIdx - 1];
              const slug = getCategorySlug(prev.category);
              if (slug) navigate(`/phase/${phaseSlug}/${slug}`);
            }}>
              ← {stepsForPhase[activeIdx - 1].name}
            </Button>
          )}
          {activeIdx < stepsForPhase.length - 1 && (
            <Button size="sm" onClick={() => {
              const next = stepsForPhase[activeIdx + 1];
              const slug = getCategorySlug(next.category);
              if (slug) navigate(`/phase/${phaseSlug}/${slug}`);
            }}>
              {stepsForPhase[activeIdx + 1].name} →
            </Button>
          )}
        </div>
      </div>
    );
  }

  // ---- Phase overview: all steps as vertical flow ----
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold">{PHASE_LABELS[phase]}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {stepsForPhase.length} bước trong workflow này
        </p>
      </div>

      <div className="space-y-2">
        {stepsForPhase.map((step, idx) => {
          const docCount = getDocsForCategory(step.category).length;
          const slug = getCategorySlug(step.category);
          const hasDocs = docCount > 0;

          return (
            <div key={step.id} className="flex items-stretch gap-3">
              {/* Step connector */}
              <div className="flex flex-col items-center w-8 shrink-0">
                <div className={`h-7 w-7 rounded-full ${col.dot} flex items-center justify-center text-white text-xs font-bold`}>
                  {idx + 1}
                </div>
                {idx < stepsForPhase.length - 1 && (
                  <div className="w-px flex-1 bg-border mt-1" />
                )}
              </div>

              {/* Step card */}
              <Card
                className={`flex-1 mb-2 cursor-pointer hover:shadow-md transition-all ${idx < stepsForPhase.length - 1 ? 'mb-2' : 'mb-0'}`}
                onClick={() => slug && navigate(`/phase/${phaseSlug}/${slug}`)}
              >
                <CardContent className="py-3 px-4 flex items-center gap-3">
                  {hasDocs
                    ? <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                    : <Circle className="h-4 w-4 text-muted-foreground shrink-0" />
                  }
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{step.name}</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      {step.owners.map(o => (
                        <span key={o} className="text-[10px] bg-secondary px-1.5 py-0.5 rounded">{o}</span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    {hasDocs ? (
                      <Badge className={`text-xs ${col.badge}`}>
                        <FileText className="h-3 w-3 mr-1" />{docCount} docs
                      </Badge>
                    ) : (
                      <span className="text-xs text-muted-foreground">Chưa có tài liệu</span>
                    )}
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            </div>
          );
        })}
      </div>

      {/* Next phase hint */}
      {phase !== 'Closing' && (
        <div className="flex items-center gap-2 text-muted-foreground pt-2">
          <ArrowRight className="h-4 w-4" />
          <span className="text-xs">
            Tiếp theo: <strong>{PHASE_LABELS[PHASES_ORDER[PHASES_ORDER.indexOf(phase) + 1]]}</strong>
          </span>
        </div>
      )}
    </div>
  );
}
