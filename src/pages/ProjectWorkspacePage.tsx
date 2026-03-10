import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PHASES, Phase, PHASE_LABELS, WORKFLOW_STEPS_V1, canEditPhase } from '@/data/mock-data';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import {
  FileText, Upload, ChevronRight, CheckCircle2, Circle,
  AlertTriangle, FolderOpen, ExternalLink
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import UploadModal from '@/components/UploadModal';

const phaseColors: Record<Phase, { bg: string; text: string; border: string }> = {
  Sale:     { bg: 'bg-orange-50',  text: 'text-orange-700',  border: 'border-orange-200' },
  Planning: { bg: 'bg-teal-50',    text: 'text-teal-700',    border: 'border-teal-200' },
  Execution:{ bg: 'bg-purple-50',  text: 'text-purple-700',  border: 'border-purple-200' },
  Closing:  { bg: 'bg-green-50',   text: 'text-green-700',   border: 'border-green-200' },
};

// Maps phase -> nav path for "Xem workflow" button
const phaseNavPath: Record<Phase, string> = {
  Sale:      '/phase/sale',
  Planning:  '/phase/planning',
  Execution: '/phase/execution',
  Closing:   '/phase/closing',
};

export default function ProjectWorkspacePage() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { role } = useAuth();
  const { getProjectById, documents, getDocsByCategory } = useData();

  const [showUpload, setShowUpload] = useState(false);
  const [uploadDefaults, setUploadDefaults] = useState<{ phase?: Phase; category?: string; docType?: string } | null>(null);

  const project = projectId ? getProjectById(projectId) : undefined;
  if (!project) return <div className="text-center py-20 text-muted-foreground">Dự án không tồn tại</div>;

  const projectDocs = documents.filter(d => d.projectId === projectId);
  const canUpload = role !== 'Viewer';

  const openUpload = (phase?: Phase, category?: string, docType?: string) => {
    setUploadDefaults({ phase, category, docType });
    setShowUpload(true);
  };

  // Tính trạng thái từng workflow step
  const getStepStatus = (phase: Phase, category: string, requiredDocTypes: string[]) => {
    const docs = getDocsByCategory(projectId!, phase, category);
    const found = (dt: string) => docs.filter(d => d.docType === dt && d.status !== 'Archived');
    const ready = requiredDocTypes.filter(dt => found(dt).length > 0).length;
    if (ready === requiredDocTypes.length && requiredDocTypes.length > 0) return 'Done';
    if (ready > 0) return 'In Progress';
    return 'Not Started';
  };

  const statusColors: Record<string, string> = {
    Active: 'bg-green-100 text-green-700',
    'On Hold': 'bg-yellow-100 text-yellow-700',
    Completed: 'bg-gray-100 text-gray-600',
    Cancelled: 'bg-red-100 text-red-700',
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <button onClick={() => navigate('/projects')} className="hover:text-foreground transition-colors">
          Tất cả Dự án
        </button>
        <ChevronRight className="h-3 w-3" />
        <span className="text-foreground font-medium">{project.name}</span>
      </div>

      {/* Project header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl font-bold">{project.name}</h1>
            <Badge className={`text-xs ${statusColors[project.status]}`}>{project.status}</Badge>
          </div>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span className="font-mono">{project.code}</span>
            <span>·</span>
            <span>{project.clientName}</span>
            <span>·</span>
            <span>{project.projectType}</span>
          </div>
        </div>
        {canUpload && (
          <Button size="sm" className="gap-1.5" onClick={() => openUpload('Sale')}>
            <Upload className="h-3.5 w-3.5" /> Tải lên tài liệu
          </Button>
        )}
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-4 gap-3">
        {PHASES.map(phase => {
          const count = projectDocs.filter(d => d.phase === phase).length;
          const stepsForPhase = WORKFLOW_STEPS_V1.filter(s => s.phase === phase);
          const doneSteps = stepsForPhase.filter(s =>
            getStepStatus(phase, s.category, s.requiredDocTypes) === 'Done'
          ).length;
          const col = phaseColors[phase];
          return (
            <Card
              key={phase}
              className={`cursor-pointer hover:shadow-md transition-all border ${col.border}`}
              onClick={() => navigate(phaseNavPath[phase])}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-xs font-semibold ${col.text}`}>{PHASE_LABELS[phase]}</span>
                  <ExternalLink className="h-3 w-3 text-muted-foreground" />
                </div>
                <p className="text-2xl font-bold">{count}</p>
                <p className="text-xs text-muted-foreground mt-0.5">tài liệu</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {doneSteps}/{stepsForPhase.length} bước hoàn tất
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Phase breakdown */}
      <div className="space-y-4">
        {PHASES.map(phase => {
          const stepsForPhase = WORKFLOW_STEPS_V1.filter(s => s.phase === phase);
          const col = phaseColors[phase];
          const canUploadPhase = canUpload && canEditPhase(role, phase);

          return (
            <Card key={phase}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${col.bg} ${col.text}`}>
                      {PHASE_LABELS[phase]}
                    </span>
                    <span className="text-muted-foreground font-normal text-xs">
                      {projectDocs.filter(d => d.phase === phase).length} tài liệu
                    </span>
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs gap-1 h-7"
                      onClick={() => navigate(phaseNavPath[phase])}
                    >
                      Xem workflow <ChevronRight className="h-3 w-3" />
                    </Button>
                    {canUploadPhase && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs gap-1 h-7"
                        onClick={() => openUpload(phase)}
                      >
                        <Upload className="h-3 w-3" /> Upload
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  {stepsForPhase.map(step => {
                    const stepDocs = getDocsByCategory(projectId!, phase, step.category);
                    const status = getStepStatus(phase, step.category, step.requiredDocTypes);
                    const StatusIcon = status === 'Done' ? CheckCircle2 : status === 'In Progress' ? AlertTriangle : Circle;
                    const statusColor = status === 'Done' ? 'text-green-500' : status === 'In Progress' ? 'text-yellow-500' : 'text-muted-foreground';

                    return (
                      <div
                        key={step.id}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors"
                      >
                        <StatusIcon className={`h-4 w-4 shrink-0 ${statusColor}`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{step.name}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            {step.owners.map(o => (
                              <span key={o} className="text-[10px] bg-secondary px-1.5 py-0.5 rounded">{o}</span>
                            ))}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {stepDocs.length > 0 ? (
                            <Badge variant="secondary" className="text-xs">
                              <FileText className="h-3 w-3 mr-1" />
                              {stepDocs.length}
                            </Badge>
                          ) : (
                            <span className="text-xs text-muted-foreground">Chưa có tài liệu</span>
                          )}
                          {canUploadPhase && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 px-2 text-xs"
                              onClick={() => openUpload(phase, step.category, step.requiredDocTypes[0])}
                            >
                              <Upload className="h-3 w-3" />
                            </Button>
                          )}
                          {stepDocs.length > 0 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 px-2 text-xs"
                              onClick={() => navigate(`/projects/${projectId}/docs?phase=${phase}&category=${encodeURIComponent(step.category)}`)}
                            >
                              Xem <ChevronRight className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <UploadModal
        open={showUpload}
        onClose={() => { setShowUpload(false); setUploadDefaults(null); }}
        projectId={project.id}
        defaultPhase={uploadDefaults?.phase}
        defaultCategory={uploadDefaults?.category}
        defaultDocType={uploadDefaults?.docType}
      />
    </div>
  );
}
