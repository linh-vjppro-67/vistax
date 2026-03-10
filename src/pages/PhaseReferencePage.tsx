// Phase Reference Page — accessed from left nav WITHOUT project context
// Shows workflow steps + descriptions as a reference/guide, NO upload (no project selected)
import { useParams, useNavigate } from 'react-router-dom';
import { Phase, PHASE_LABELS, WORKFLOW_STEPS_V1 } from '@/data/mock-data';
import { useData } from '@/contexts/DataContext';
import { ChevronRight, Circle, Info, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const PHASE_MAP: Record<string, Phase> = {
  sale: 'Sale', planning: 'Planning', execution: 'Execution', closing: 'Closing',
};
const PHASES_ORDER: Phase[] = ['Sale', 'Planning', 'Execution', 'Closing'];
const PHASE_SLUG: Record<Phase, string> = {
  Sale: 'sale', Planning: 'planning', Execution: 'execution', Closing: 'closing',
};

const phaseColors: Record<Phase, { dot: string; badge: string; border: string; text: string }> = {
  Sale:      { dot: 'bg-orange-400', badge: 'bg-orange-100 text-orange-700', border: 'border-l-orange-400', text: 'text-orange-700' },
  Planning:  { dot: 'bg-teal-400',   badge: 'bg-teal-100 text-teal-700',     border: 'border-l-teal-400',   text: 'text-teal-700' },
  Execution: { dot: 'bg-purple-400', badge: 'bg-purple-100 text-purple-700', border: 'border-l-purple-400', text: 'text-purple-700' },
  Closing:   { dot: 'bg-green-400',  badge: 'bg-green-100 text-green-700',   border: 'border-l-green-400',  text: 'text-green-700' },
};

const STEP_INFO: Record<string, { description: string; owners: string[] }> = {
  'Client Brief': { description: 'Client Profile, Overview dự án, Business Objectives, SOW (Deliverables, Timeline, Budget), MKT/Usage Strategy, Creative Direction/Branding, Data Input, Risk Assessment, Project Score.', owners: ['Sale Executive'] },
  'Discovery 360 / Solution Framing': { description: 'Client/Business/Project Objectives, Mapping VistaX Solutions, Value Proposition Mapping (USP, ROI), Cost of doing nothing, Implementation Roadmap.', owners: ['Sale Executive', 'Solution Advisor'] },
  'Solution Proposal': { description: 'Client/Project Insights, Showcase VistaX sản phẩm, Đề nghị VistaX Solutions (SOW, Directions, Implementation, Usages), Why (USP, ROI, Strategic Expertise, Risk).', owners: ['Sale Executive', 'Solution Advisor'] },
  'Business Case (Phương án kinh doanh)': { description: 'Revenue Structure, Cost Structure (Production Cost, Outsource, % Hoa hồng Sale, % PM), Margin & Risk Calculation, Resource và Capacity Planning, Risk Management.', owners: ['Solution Advisor', 'Sale Executive', 'Procurement', 'Technical Lead'] },
  'Approval': { description: 'CEO phê duyệt Phương án Kinh doanh trước khi gửi Project Proposal cho client.', owners: ['CEO'] },
  'Project Proposal': { description: 'Scope of Work, Deliverables, Timeline, Price/Quotation, Project Governance (Communication, Feedback, Decision, Revision, Payment), Strategic Insights, Case Studies, Reference.', owners: ['Sale Executive', 'Solution Executive'] },
  'Contract': { description: 'Deliverables, Timeline, Price/Cost, Revision & Approval Structure, Payment Structure, Intellectual Property & Usage Rights, Confidentiality, Termination Clause, Clients Responsibilities.', owners: ['Sale Executive', 'Solution Executive'] },
  'Project Onboarding': { description: 'Project Overview Summary, Scope Breakdown (Deliverables, In/Out of Scope), Timeline/Milestones, Data/Asset Inventory, Resource/Incentive Allocation, Governance & Communication Protocol, Insights.', owners: ['Solution Executive', 'PM'] },
  'Internal Kickoff': { description: 'Đồng bộ toàn team về dự án, Review SOW/Timeline/giải pháp, Xác nhận năng lực/timeline, Thiết lập kế hoạch giải pháp, Đưa ra check list/câu hỏi.', owners: ['PM', 'Solution Executive', 'Technical Lead', 'Operation Team'] },
  'Project Checklist': { description: 'Check list thông tin cần thiết đầu vào, Asset và Document Request (CAD, 3D Model, Masterplan, Branding, Reference), Gởi trước cho Client trước buổi Client Kick off.', owners: ['PM'] },
  'Client Kickoff': { description: '3 key objectives: Thấu hiểu mục tiêu/mong muốn, Giải đáp câu hỏi/thông tin cần thiết, Thiết lập Workflow/Governance Framework cho dự án.', owners: ['PM', 'Sale Executive'] },
  'Project Charter': { description: '"Single Source of Truth" cho tất cả liên quan. Nội dung: Project Overview, Scope & Deliverables, Milestones & Base Timeline, Governance & Communication, Change/Revision Control.', owners: ['PM'] },
  'Project Execution Plan': { description: '"Bản đồ tác chiến": ai làm gì, khi nào, QC nào, rủi ro nào. Timeline Execution theo 6 trục quản trị: Deliverables, Timeline, Quality, Resource, Communication, Risk.', owners: ['PM'] },
  'Execution': { description: 'PM vận hành theo 3 vòng kiểm soát: Loop 1 Daily Production Control, Loop 2 Milestone Gate Control, Loop 3 Client Alignment.', owners: ['PM', 'Technical Lead', 'Team Lead', 'Production Team'] },
  'Project Update': { description: 'PM update tiến độ, commit theo Execution Plan và Charter. Format: Summary, Completed, In progress/Next step, Điều cần support, Risk/Issues, Timeline Checkpoint.', owners: ['PM'] },
  'Change Request': { description: 'Khi: Client thay đổi Scope/Timeline/Quality hoặc không theo thỏa thuận. Quy trình: Ghi nhận → Impact Analysis → Option Proposal → Client Approval → Update Charter.', owners: ['PM', 'Sale Executive'] },
  'Payment Process': { description: 'Quy trình thanh toán theo milestone đã thỏa thuận trong hợp đồng.', owners: ['Procurement', 'Kế toán'] },
  'Project Closing': { description: 'Hoàn tất scope Project Charter, xác nhận bàn giao/nghiệm thu. PM follow theo Charter. Solution Advisor/Sale/Procurements follow về invoice/thanh toán.', owners: ['PM', 'Solution Advisor', 'Sale Executive', 'Procurement'] },
  'After Sales Follow Up': { description: 'Chăm sóc khách hàng, thu thập Testimonial/Case studies, giữ mối quan hệ và khai thác cơ hội dự án tiếp theo, Giữ VistaX top-of-mind.', owners: ['Sale Executive'] },
  'Post Mortem / Lessons Learnt': { description: 'Rút kinh nghiệm, tối ưu quy trình, nâng cấp chất lượng sản phẩm/dịch vụ/chuyên môn, bảo vệ margin tương lai.', owners: ['PM', 'Solution Advisor', 'Sale Executive', 'Technical Lead'] },
};

export default function PhaseReferencePage() {
  const { phaseSlug } = useParams();
  const navigate = useNavigate();
  const { projects } = useData();

  const phase = PHASE_MAP[phaseSlug || ''];
  if (!phase) return <div className="text-center py-20 text-muted-foreground">Phase không tồn tại</div>;

  const col = phaseColors[phase];
  const steps = WORKFLOW_STEPS_V1.filter(s => s.phase === phase).sort((a, b) => a.order - b.order);
  const phaseIdx = PHASES_ORDER.indexOf(phase);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <h1 className="text-xl font-bold">{PHASE_LABELS[phase]}</h1>
          <Badge className={`text-xs ${col.badge}`}>Workflow Reference</Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          Tài liệu tham khảo workflow — để làm việc với dự án cụ thể, hãy chọn dự án từ danh sách.
        </p>
      </div>

      {/* CTA: pick a project */}
      <Card className="border-dashed">
        <CardContent className="py-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Muốn làm việc ở phase này?</p>
            <p className="text-xs text-muted-foreground">Chọn một dự án để upload tài liệu, thêm ghi chú và theo dõi tiến độ.</p>
          </div>
          <div className="flex gap-2">
            {projects.slice(0, 3).map(p => (
              <Button key={p.id} variant="outline" size="sm" className="text-xs"
                onClick={() => navigate(`/projects/${p.id}/phase/${phaseSlug}`)}>
                {p.code}
              </Button>
            ))}
            <Button size="sm" className="text-xs" onClick={() => navigate('/projects')}>
              Xem tất cả dự án <ArrowRight className="h-3 w-3 ml-1" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Phase nav */}
      <div className="flex gap-2 flex-wrap">
        {PHASES_ORDER.map(p => (
          <Button
            key={p}
            variant={p === phase ? 'default' : 'outline'}
            size="sm"
            className="text-xs"
            onClick={() => navigate(`/phase/${PHASE_SLUG[p]}`)}>
            {PHASE_LABELS[p]}
          </Button>
        ))}
      </div>

      {/* Steps */}
      <div className="space-y-2">
        {steps.map((step, idx) => {
          const info = STEP_INFO[step.category];
          return (
            <div key={step.id} className="flex items-stretch gap-3">
              <div className="flex flex-col items-center w-8 shrink-0">
                <div className={`h-7 w-7 rounded-full ${col.dot} flex items-center justify-center text-white text-xs font-bold`}>
                  {idx + 1}
                </div>
                {idx < steps.length - 1 && <div className="w-px flex-1 bg-border mt-1" />}
              </div>
              <Card className={`flex-1 mb-2 border-l-4 ${col.border}`}>
                <CardContent className="py-3 px-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <p className="text-sm font-semibold mb-1">{step.name}</p>
                      {info && (
                        <div className="flex items-start gap-1.5 mb-2">
                          <Info className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
                          <p className="text-xs text-muted-foreground leading-relaxed">{info.description}</p>
                        </div>
                      )}
                      <div className="flex flex-wrap gap-1.5 items-center">
                        {(info?.owners || step.owners).map(o => (
                          <Badge key={o} variant="outline" className="text-[10px]">{o}</Badge>
                        ))}
                        <span className="text-[10px] text-muted-foreground">·</span>
                        {step.requiredDocTypes.map(d => (
                          <Badge key={d} variant="secondary" className="text-[10px]">{d}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          );
        })}
      </div>

      {/* Next phase */}
      {phaseIdx < PHASES_ORDER.length - 1 && (
        <div className="flex items-center gap-2 text-muted-foreground pt-2">
          <ArrowRight className="h-4 w-4" />
          <span className="text-sm">
            Tiếp theo:{' '}
            <button
              className="underline hover:text-foreground font-medium"
              onClick={() => navigate(`/phase/${PHASE_SLUG[PHASES_ORDER[phaseIdx + 1]]}`)}
            >
              {PHASE_LABELS[PHASES_ORDER[phaseIdx + 1]]}
            </button>
          </span>
        </div>
      )}
    </div>
  );
}
