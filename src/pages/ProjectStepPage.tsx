import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Phase, PHASE_LABELS, WORKFLOW_STEPS_V1, canEditPhase } from '@/data/mock-data';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { ChevronRight, Upload, FileText, Info, ArrowLeft, ArrowRight, StickyNote, Plus, Trash2, Pencil } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import UploadModal from '@/components/UploadModal';

const PHASE_MAP: Record<string, Phase> = {
  sale: 'Sale', planning: 'Planning', execution: 'Execution', closing: 'Closing',
};
const STEP_MAP: Record<string, string> = {
  'client-brief': 'Client Brief',
  'discovery': 'Discovery 360 / Solution Framing',
  'solution-proposal': 'Solution Proposal',
  'business-case': 'Business Case (Phương án kinh doanh)',
  'approval': 'Approval',
  'project-proposal': 'Project Proposal',
  'contract': 'Contract',
  'onboarding': 'Project Onboarding',
  'internal-kickoff': 'Internal Kickoff',
  'checklist': 'Project Checklist',
  'client-kickoff': 'Client Kickoff',
  'charter': 'Project Charter',
  'execution-plan': 'Project Execution Plan',
  'run': 'Execution',
  'update': 'Project Update',
  'change-request': 'Change Request',
  'payment': 'Payment Process',
  'close': 'Project Closing',
  'after-sales': 'After Sales Follow Up',
  'post-mortem': 'Post Mortem / Lessons Learnt',
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
  'Execution': { description: 'PM vận hành theo 3 vòng kiểm soát: Loop 1 Daily Production Control (Resource), Loop 2 Milestone Gate Control (Timeline/QC), Loop 3 Client Alignment (Update/Feedback).', owners: ['PM', 'Technical Lead', 'Team Lead', 'Production Team'] },
  'Project Update': { description: 'PM update tiến độ, commit theo Execution Plan và Project Charter. Format: Summary, Completed, In progress/Next step, Điều cần support, Risk/Issues, Timeline Checkpoint.', owners: ['PM'] },
  'Change Request': { description: 'Khi: Client thay đổi Scope/Timeline/Quality, Client Update không theo thỏa thuận, Client không comment/feedback. Quy trình: Ghi nhận → Impact Analysis → Option Proposal → Client Approval → Update Charter.', owners: ['PM', 'Sale Executive'] },
  'Payment Process': { description: 'Quy trình thanh toán theo milestone đã thỏa thuận trong hợp đồng.', owners: ['Procurement', 'Kế toán'] },
  'Project Closing': { description: 'Hoàn tất scope Project Charter, xác nhận bàn giao/nghiệm thu. PM follow theo Project Charter. Solution Advisor/Sale/Procurements follow về invoice/thanh toán.', owners: ['PM', 'Solution Advisor', 'Sale Executive', 'Procurement'] },
  'After Sales Follow Up': { description: 'Chăm sóc khách hàng, thu thập Testimonial/Case studies, giữ mối quan hệ và khai thác cơ hội dự án tiếp theo, Giữ VistaX top-of-mind.', owners: ['Sale Executive'] },
  'Post Mortem / Lessons Learnt': { description: 'Rút kinh nghiệm, tối ưu quy trình, nâng cấp chất lượng sản phẩm/dịch vụ/chuyên môn, bảo vệ margin tương lai.', owners: ['PM', 'Solution Advisor', 'Sale Executive', 'Technical Lead'] },
};

const phaseColors: Record<Phase, { badge: string; border: string; bg: string; text: string }> = {
  Sale:      { badge: 'bg-orange-100 text-orange-700', border: 'border-l-orange-400', bg: 'bg-orange-50', text: 'text-orange-700' },
  Planning:  { badge: 'bg-teal-100 text-teal-700',     border: 'border-l-teal-400',   bg: 'bg-teal-50',   text: 'text-teal-700' },
  Execution: { badge: 'bg-purple-100 text-purple-700', border: 'border-l-purple-400', bg: 'bg-purple-50', text: 'text-purple-700' },
  Closing:   { badge: 'bg-green-100 text-green-700',   border: 'border-l-green-400',  bg: 'bg-green-50',  text: 'text-green-700' },
};

type Note = { id: string; stepId: string; title: string; content: string; author: string; createdAt: string };
function nowISO() { return new Date().toISOString().slice(0, 16).replace('T', ' '); }
function uid() { return Math.random().toString(36).slice(2) + Date.now().toString(36); }

export default function ProjectStepPage() {
  const { projectId, phaseSlug, stepSlug } = useParams();
  const navigate = useNavigate();
  const { role, userName } = useAuth();
  const { getProjectById, documents, getDocsByCategory } = useData();

  const phase = PHASE_MAP[phaseSlug || ''];
  const category = STEP_MAP[stepSlug || ''];
  const project = projectId ? getProjectById(projectId) : undefined;

  const [showUpload, setShowUpload] = useState(false);
  const [notes, setNotes] = useState<Note[]>([]);
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [draftTitle, setDraftTitle] = useState('');
  const [draftContent, setDraftContent] = useState('');

  if (!project || !phase || !category) return <div className="text-center py-20 text-muted-foreground">Không tìm thấy</div>;

  const step = WORKFLOW_STEPS_V1.find(s => s.phase === phase && s.category === category);
  if (!step) return <div className="text-center py-20 text-muted-foreground">Bước không tồn tại</div>;

  const notesKey = `vx_notes_${projectId}_${phase}_${step.id}`;

  useEffect(() => {
    try {
      const raw = localStorage.getItem(notesKey);
      setNotes(raw ? JSON.parse(raw) : []);
    } catch { setNotes([]); }
  }, [notesKey]);

  const saveNotes = (updated: Note[]) => {
    setNotes(updated);
    localStorage.setItem(notesKey, JSON.stringify(updated));
  };

  const col = phaseColors[phase];
  const stepsForPhase = WORKFLOW_STEPS_V1.filter(s => s.phase === phase).sort((a, b) => a.order - b.order);
  const stepIdx = stepsForPhase.findIndex(s => s.id === step.id);
  const prevStep = stepIdx > 0 ? stepsForPhase[stepIdx - 1] : null;
  const nextStep = stepIdx < stepsForPhase.length - 1 ? stepsForPhase[stepIdx + 1] : null;
  const getCatSlug = (cat: string) => Object.entries(STEP_MAP).find(([, v]) => v === cat)?.[0];

  const canEdit = role !== 'Viewer';
  const canUpload = canEdit && canEditPhase(role, phase);
  const stepDocs = getDocsByCategory(projectId!, phase, category);
  const info = STEP_INFO[category];

  const submitNote = () => {
    if (!draftTitle.trim() && !draftContent.trim()) { setShowNoteForm(false); return; }
    if (editingNote) {
      saveNotes(notes.map(n => n.id === editingNote.id ? { ...n, title: draftTitle, content: draftContent } : n));
    } else {
      saveNotes([{ id: uid(), stepId: step.id, title: draftTitle, content: draftContent, author: userName, createdAt: nowISO() }, ...notes]);
    }
    setShowNoteForm(false);
    setEditingNote(null);
    setDraftTitle(''); setDraftContent('');
  };

  const editNote = (note: Note) => {
    setEditingNote(note);
    setDraftTitle(note.title);
    setDraftContent(note.content);
    setShowNoteForm(true);
  };

  return (
    <div className="space-y-5">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-sm text-muted-foreground flex-wrap">
        <button onClick={() => navigate('/projects')} className="hover:text-foreground">Dự án</button>
        <ChevronRight className="h-3 w-3" />
        <button onClick={() => navigate(`/projects/${projectId}`)} className="hover:text-foreground">{project.name}</button>
        <ChevronRight className="h-3 w-3" />
        <button onClick={() => navigate(`/projects/${projectId}/phase/${phaseSlug}`)} className={`hover:text-foreground ${col.text}`}>
          {PHASE_LABELS[phase]}
        </button>
        <ChevronRight className="h-3 w-3" />
        <span className="text-foreground font-medium">{step.name}</span>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl font-bold">{step.name}</h1>
            <Badge className={`text-xs ${col.badge}`}>{PHASE_LABELS[phase]}</Badge>
            <span className="text-xs text-muted-foreground">Bước {stepIdx + 1}/{stepsForPhase.length}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {canEdit && (
            <Button variant="outline" size="sm" className="gap-1 text-xs"
              onClick={() => { setEditingNote(null); setDraftTitle(''); setDraftContent(''); setShowNoteForm(v => !v); }}>
              <Plus className="h-3 w-3" /> Thêm note
            </Button>
          )}
          {canUpload && (
            <Button size="sm" className="gap-1.5"
              onClick={() => setShowUpload(true)}>
              <Upload className="h-3.5 w-3.5" /> Tải lên tài liệu
            </Button>
          )}
        </div>
      </div>

      {/* Info box */}
      {info && (
        <Card className={`border-l-4 ${col.border}`}>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-start gap-2 mb-3">
              <Info className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
              <p className="text-sm text-muted-foreground leading-relaxed">{info.description}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-muted-foreground font-medium">Người thực hiện:</span>
              {info.owners.map(o => <Badge key={o} variant="outline" className="text-xs">{o}</Badge>)}
              <span className="text-xs text-muted-foreground ml-2 font-medium">Tài liệu cần:</span>
              {step.requiredDocTypes.map(d => <Badge key={d} variant="secondary" className="text-xs">{d}</Badge>)}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Note form */}
      {showNoteForm && canEdit && (
        <Card className={col.bg}>
          <CardContent className="pt-4 pb-4 space-y-2">
            <p className="text-xs font-medium text-muted-foreground mb-2">
              <StickyNote className="h-3.5 w-3.5 inline mr-1" />
              {editingNote ? 'Sửa ghi chú' : 'Thêm ghi chú'}
            </p>
            <Input
              placeholder="Tiêu đề..."
              value={draftTitle}
              onChange={e => setDraftTitle(e.target.value)}
              className="h-8 text-xs bg-white"
              autoFocus
            />
            <Textarea
              placeholder="Nội dung ghi chú..."
              value={draftContent}
              onChange={e => setDraftContent(e.target.value)}
              rows={4}
              className="text-xs resize-none bg-white"
            />
            <div className="flex gap-2 justify-end">
              <Button variant="ghost" size="sm" className="h-7 text-xs"
                onClick={() => { setShowNoteForm(false); setEditingNote(null); }}>
                Huỷ
              </Button>
              <Button size="sm" className="h-7 text-xs" onClick={submitNote}>
                {editingNote ? 'Lưu thay đổi' : 'Thêm note'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Notes list */}
      {notes.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-sm font-semibold flex items-center gap-1.5">
            <StickyNote className="h-4 w-4" /> Ghi chú ({notes.length})
          </h2>
          {notes.map(note => (
            <Card key={note.id} className={`${col.bg} group`}>
              <CardContent className="py-3 px-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    {note.title && <p className="text-sm font-medium mb-0.5">{note.title}</p>}
                    {note.content && <p className="text-xs text-muted-foreground whitespace-pre-wrap leading-relaxed">{note.content}</p>}
                    <p className="text-[10px] text-muted-foreground mt-1.5">{note.author} · {note.createdAt}</p>
                  </div>
                  {canEdit && (
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => editNote(note)}>
                        <Pencil className="h-3 w-3" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-6 w-6"
                        onClick={() => saveNotes(notes.filter(n => n.id !== note.id))}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Documents */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-semibold flex items-center gap-1.5">
            <FileText className="h-4 w-4" /> Tài liệu ({stepDocs.length})
          </h2>
        </div>
        {stepDocs.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center text-muted-foreground text-sm">
              Chưa có tài liệu nào
              {canUpload && (
                <><br /><Button variant="link" className="text-sm mt-1" onClick={() => setShowUpload(true)}>
                  Tải lên tài liệu đầu tiên →
                </Button></>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {stepDocs.map(doc => (
              <Card key={doc.id} className="hover:shadow-sm transition-shadow cursor-pointer"
                onClick={() => navigate(`/projects/${projectId}/docs/${doc.id}`)}>
                <CardContent className="py-3 px-4 flex items-center gap-3">
                  <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{doc.title}</p>
                    <p className="text-xs text-muted-foreground">{doc.docType} · v{doc.versionCurrent} · {doc.owner}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant="secondary" className="text-xs">{doc.status}</Badge>
                    <span className="text-xs text-muted-foreground">{doc.updatedAt.slice(0, 10)}</span>
                    <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Prev / Next step */}
      <div className="flex justify-between pt-2">
        <div>
          {prevStep && (
            <Button variant="outline" size="sm" className="gap-1 text-xs"
              onClick={() => { const s = getCatSlug(prevStep.category); if (s) navigate(`/projects/${projectId}/phase/${phaseSlug}/${s}`); }}>
              <ArrowLeft className="h-3 w-3" /> {prevStep.name}
            </Button>
          )}
        </div>
        <div>
          {nextStep && (
            <Button size="sm" className="gap-1 text-xs"
              onClick={() => { const s = getCatSlug(nextStep.category); if (s) navigate(`/projects/${projectId}/phase/${phaseSlug}/${s}`); }}>
              {nextStep.name} <ArrowRight className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>

      <UploadModal
        open={showUpload}
        onClose={() => setShowUpload(false)}
        projectId={project.id}
        defaultPhase={phase}
        defaultCategory={category}
        defaultDocType={step.requiredDocTypes[0]}
      />
    </div>
  );
}
