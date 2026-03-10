import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Phase, PHASE_LABELS, WORKFLOW_STEPS_V1, canEditPhase } from '@/data/mock-data';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import {
  ChevronRight, Upload, FileText, CheckCircle2, Circle,
  AlertTriangle, StickyNote, Plus, Trash2, Pencil, ArrowLeft, ArrowRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
const PHASE_SLUG: Record<Phase, string> = {
  Sale: 'sale', Planning: 'planning', Execution: 'execution', Closing: 'closing',
};
const PHASES_ORDER: Phase[] = ['Sale', 'Planning', 'Execution', 'Closing'];

const phaseColors: Record<Phase, { dot: string; badge: string; border: string; bg: string; text: string }> = {
  Sale:      { dot: 'bg-orange-400', badge: 'bg-orange-100 text-orange-700', border: 'border-l-orange-400', bg: 'bg-orange-50', text: 'text-orange-700' },
  Planning:  { dot: 'bg-teal-400',   badge: 'bg-teal-100 text-teal-700',     border: 'border-l-teal-400',   bg: 'bg-teal-50',   text: 'text-teal-700' },
  Execution: { dot: 'bg-purple-400', badge: 'bg-purple-100 text-purple-700', border: 'border-l-purple-400', bg: 'bg-purple-50', text: 'text-purple-700' },
  Closing:   { dot: 'bg-green-400',  badge: 'bg-green-100 text-green-700',   border: 'border-l-green-400',  bg: 'bg-green-50',  text: 'text-green-700' },
};

type Note = { id: string; stepId: string; title: string; content: string; author: string; createdAt: string };

function nowISO() {
  return new Date().toISOString().slice(0, 16).replace('T', ' ');
}
function uid() { return Math.random().toString(36).slice(2) + Date.now().toString(36); }

export default function ProjectPhasePage() {
  const { projectId, phaseSlug } = useParams();
  const navigate = useNavigate();
  const { role, userName } = useAuth();
  const { getProjectById, documents, getDocsByCategory } = useData();

  const phase = PHASE_MAP[phaseSlug || ''];
  const project = projectId ? getProjectById(projectId) : undefined;

  const [showUpload, setShowUpload] = useState(false);
  const [uploadDefaults, setUploadDefaults] = useState<{ category?: string; docType?: string } | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [newNoteStepId, setNewNoteStepId] = useState<string | null>(null);
  const [draftTitle, setDraftTitle] = useState('');
  const [draftContent, setDraftContent] = useState('');

  if (!project || !phase) return <div className="text-center py-20 text-muted-foreground">Không tìm thấy</div>;

  const notesKey = `vx_notes_${projectId}_${phase}`;

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

  const canEdit = role !== 'Viewer';
  const canUpload = canEdit && canEditPhase(role, phase);
  const col = phaseColors[phase];
  const steps = WORKFLOW_STEPS_V1.filter(s => s.phase === phase).sort((a, b) => a.order - b.order);
  const phaseIdx = PHASES_ORDER.indexOf(phase);

  const getCategorySlug = (cat: string) =>
    Object.entries(STEP_MAP).find(([, v]) => v === cat)?.[0];

  const getStepStatus = (category: string, requiredDocTypes: string[]) => {
    const docs = getDocsByCategory(projectId!, phase, category);
    const ready = requiredDocTypes.filter(dt =>
      docs.some(d => d.docType === dt && d.status !== 'Archived')
    ).length;
    if (ready === requiredDocTypes.length && requiredDocTypes.length > 0) return 'done';
    if (ready > 0) return 'progress';
    return 'empty';
  };

  const openUpload = (category?: string, docType?: string) => {
    setUploadDefaults({ category, docType });
    setShowUpload(true);
  };

  const startNote = (stepId: string) => {
    setNewNoteStepId(stepId);
    setEditingNote(null);
    setDraftTitle('');
    setDraftContent('');
  };

  const submitNote = (stepId: string) => {
    if (!draftTitle.trim() && !draftContent.trim()) { setNewNoteStepId(null); return; }
    if (editingNote) {
      saveNotes(notes.map(n => n.id === editingNote.id
        ? { ...n, title: draftTitle, content: draftContent }
        : n));
    } else {
      saveNotes([{ id: uid(), stepId, title: draftTitle, content: draftContent, author: userName, createdAt: nowISO() }, ...notes]);
    }
    setNewNoteStepId(null);
    setEditingNote(null);
  };

  const deleteNote = (id: string) => saveNotes(notes.filter(n => n.id !== id));

  const editNote = (note: Note) => {
    setEditingNote(note);
    setNewNoteStepId(note.stepId);
    setDraftTitle(note.title);
    setDraftContent(note.content);
  };

  return (
    <div className="space-y-5">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-sm text-muted-foreground flex-wrap">
        <button onClick={() => navigate('/projects')} className="hover:text-foreground">Dự án</button>
        <ChevronRight className="h-3 w-3" />
        <button onClick={() => navigate(`/projects/${projectId}`)} className="hover:text-foreground">{project.name}</button>
        <ChevronRight className="h-3 w-3" />
        <span className={`font-medium ${col.text}`}>{PHASE_LABELS[phase]}</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">{PHASE_LABELS[phase]}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{project.name} · {steps.length} bước</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Phase prev/next */}
          {phaseIdx > 0 && (
            <Button variant="outline" size="sm" className="gap-1 text-xs"
              onClick={() => navigate(`/projects/${projectId}/phase/${PHASE_SLUG[PHASES_ORDER[phaseIdx - 1]]}`)}>
              <ArrowLeft className="h-3 w-3" /> {PHASE_LABELS[PHASES_ORDER[phaseIdx - 1]]}
            </Button>
          )}
          {phaseIdx < PHASES_ORDER.length - 1 && (
            <Button variant="outline" size="sm" className="gap-1 text-xs"
              onClick={() => navigate(`/projects/${projectId}/phase/${PHASE_SLUG[PHASES_ORDER[phaseIdx + 1]]}`)}>
              {PHASE_LABELS[PHASES_ORDER[phaseIdx + 1]]} <ArrowRight className="h-3 w-3" />
            </Button>
          )}
          {canUpload && (
            <Button size="sm" className="gap-1.5 ml-2" onClick={() => openUpload()}>
              <Upload className="h-3.5 w-3.5" /> Tải lên
            </Button>
          )}
        </div>
      </div>

      {/* Steps */}
      <div className="space-y-3">
        {steps.map((step, idx) => {
          const status = getStepStatus(step.category, step.requiredDocTypes);
          const stepDocs = getDocsByCategory(projectId!, phase, step.category);
          const stepNotes = notes.filter(n => n.stepId === step.id);
          const StatusIcon = status === 'done' ? CheckCircle2 : status === 'progress' ? AlertTriangle : Circle;
          const statusColor = status === 'done' ? 'text-green-500' : status === 'progress' ? 'text-yellow-500' : 'text-muted-foreground';
          const slug = getCategorySlug(step.category);
          const isAddingNote = newNoteStepId === step.id;

          return (
            <Card key={step.id} className={`border-l-4 ${col.border}`}>
              <CardHeader className="pb-2 pt-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5">
                    <div className={`h-6 w-6 rounded-full ${col.dot} flex items-center justify-center text-white text-xs font-bold shrink-0 mt-0.5`}>
                      {idx + 1}
                    </div>
                    <div>
                      <CardTitle className="text-sm font-semibold flex items-center gap-2">
                        {step.name}
                        <StatusIcon className={`h-3.5 w-3.5 ${statusColor}`} />
                      </CardTitle>
                      <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                        {step.owners.map(o => (
                          <span key={o} className="text-[10px] bg-secondary px-1.5 py-0.5 rounded">{o}</span>
                        ))}
                        <span className="text-[10px] text-muted-foreground">·</span>
                        {step.requiredDocTypes.map(dt => (
                          <span key={dt} className="text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground">{dt}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {canUpload && (
                      <Button variant="outline" size="sm" className="h-7 text-xs gap-1"
                        onClick={() => openUpload(step.category, step.requiredDocTypes[0])}>
                        <Upload className="h-3 w-3" /> Upload
                      </Button>
                    )}
                    {canEdit && (
                      <Button variant="ghost" size="sm" className="h-7 text-xs gap-1"
                        onClick={() => startNote(step.id)}>
                        <Plus className="h-3 w-3" /> Note
                      </Button>
                    )}
                    {slug && (
                      <Button variant="ghost" size="sm" className="h-7 px-2"
                        onClick={() => navigate(`/projects/${projectId}/phase/${phaseSlug}/${slug}`)}>
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-1 pb-4 space-y-3">
                {/* Documents */}
                {stepDocs.length > 0 && (
                  <div className="space-y-1.5">
                    {stepDocs.slice(0, 3).map(doc => (
                      <div
                        key={doc.id}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/40 hover:bg-muted cursor-pointer transition-colors"
                        onClick={() => navigate(`/projects/${projectId}/docs/${doc.id}`)}
                      >
                        <FileText className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        <span className="text-xs flex-1 truncate font-medium">{doc.title}</span>
                        <Badge variant="outline" className="text-[10px]">{doc.status}</Badge>
                        <span className="text-[10px] text-muted-foreground">{doc.updatedAt.slice(0, 10)}</span>
                      </div>
                    ))}
                    {stepDocs.length > 3 && (
                      <button
                        className="text-xs text-muted-foreground hover:text-foreground pl-3"
                        onClick={() => navigate(`/projects/${projectId}/phase/${phaseSlug}/${slug}`)}
                      >
                        +{stepDocs.length - 3} tài liệu khác...
                      </button>
                    )}
                  </div>
                )}

                {/* Notes */}
                {stepNotes.length > 0 && (
                  <div className="space-y-1.5">
                    {stepNotes.map(note => (
                      <div key={note.id} className={`px-3 py-2 rounded-lg border ${col.bg} group`}>
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 mb-0.5">
                              <StickyNote className="h-3 w-3 text-muted-foreground" />
                              <span className="text-xs font-medium">{note.title || '(Không tiêu đề)'}</span>
                            </div>
                            {note.content && (
                              <p className="text-xs text-muted-foreground whitespace-pre-wrap leading-relaxed">{note.content}</p>
                            )}
                            <p className="text-[10px] text-muted-foreground mt-1">{note.author} · {note.createdAt}</p>
                          </div>
                          {canEdit && (
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                              <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => editNote(note)}>
                                <Pencil className="h-3 w-3" />
                              </Button>
                              <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => deleteNote(note.id)}>
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Note form */}
                {isAddingNote && canEdit && (
                  <div className="space-y-2 pt-1">
                    <Input
                      placeholder="Tiêu đề note..."
                      value={draftTitle}
                      onChange={e => setDraftTitle(e.target.value)}
                      className="h-8 text-xs"
                      autoFocus
                    />
                    <Textarea
                      placeholder="Nội dung note..."
                      value={draftContent}
                      onChange={e => setDraftContent(e.target.value)}
                      rows={3}
                      className="text-xs resize-none"
                    />
                    <div className="flex gap-2 justify-end">
                      <Button variant="ghost" size="sm" className="h-7 text-xs"
                        onClick={() => { setNewNoteStepId(null); setEditingNote(null); }}>
                        Huỷ
                      </Button>
                      <Button size="sm" className="h-7 text-xs" onClick={() => submitNote(step.id)}>
                        {editingNote ? 'Lưu' : 'Thêm note'}
                      </Button>
                    </div>
                  </div>
                )}

                {/* Empty state */}
                {stepDocs.length === 0 && stepNotes.length === 0 && !isAddingNote && (
                  <div className="text-xs text-muted-foreground/60 text-center py-2 border border-dashed rounded-lg">
                    Chưa có tài liệu hay ghi chú
                    {canUpload && (
                      <span> — <button className="underline hover:text-foreground" onClick={() => openUpload(step.category)}>Upload ngay</button></span>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <UploadModal
        open={showUpload}
        onClose={() => { setShowUpload(false); setUploadDefaults(null); }}
        projectId={project.id}
        defaultPhase={phase}
        defaultCategory={uploadDefaults?.category}
        defaultDocType={uploadDefaults?.docType}
      />
    </div>
  );
}
