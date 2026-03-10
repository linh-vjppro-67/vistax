import { useParams, useNavigate } from 'react-router-dom';
import { PHASES, Phase, PHASE_LABELS, WORKFLOW_STEPS_V1, canEditPhase } from '@/data/mock-data';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { ChevronRight, CheckCircle2, Circle, AlertTriangle, TrendingUp, ClipboardList, Zap, Archive, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const phaseSlugMap: Record<Phase, string> = {
  Sale: 'sale', Planning: 'planning', Execution: 'execution', Closing: 'closing',
};

const phaseConfig: Record<Phase, { icon: React.ElementType; color: string; bg: string; textColor: string; border: string }> = {
  Sale:      { icon: TrendingUp,   color: 'text-orange-500', bg: 'bg-orange-50', textColor: 'text-orange-700', border: 'border-orange-200' },
  Planning:  { icon: ClipboardList, color: 'text-teal-500',  bg: 'bg-teal-50',   textColor: 'text-teal-700',   border: 'border-teal-200' },
  Execution: { icon: Zap,          color: 'text-purple-500', bg: 'bg-purple-50', textColor: 'text-purple-700', border: 'border-purple-200' },
  Closing:   { icon: Archive,      color: 'text-green-500',  bg: 'bg-green-50',  textColor: 'text-green-700',  border: 'border-green-200' },
};

const statusColors: Record<string, string> = {
  Active: 'bg-green-100 text-green-700',
  'On Hold': 'bg-yellow-100 text-yellow-700',
  Completed: 'bg-gray-100 text-gray-600',
  Cancelled: 'bg-red-100 text-red-700',
};

export default function ProjectOverviewPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { role } = useAuth();
  const { getProjectById, documents, getDocsByCategory } = useData();

  const project = projectId ? getProjectById(projectId) : undefined;
  if (!project) return <div className="text-center py-20 text-muted-foreground">Dự án không tồn tại</div>;

  const projectDocs = documents.filter(d => d.projectId === projectId);

  const getPhaseProgress = (phase: Phase) => {
    const steps = WORKFLOW_STEPS_V1.filter(s => s.phase === phase);
    const done = steps.filter(s => {
      const docs = getDocsByCategory(projectId!, phase, s.category);
      const ready = s.requiredDocTypes.filter(dt =>
        docs.some(d => d.docType === dt && d.status !== 'Archived')
      ).length;
      return ready === s.requiredDocTypes.length && s.requiredDocTypes.length > 0;
    }).length;
    const inProgress = steps.filter(s => {
      const docs = getDocsByCategory(projectId!, phase, s.category);
      const ready = s.requiredDocTypes.filter(dt =>
        docs.some(d => d.docType === dt && d.status !== 'Archived')
      ).length;
      return ready > 0 && ready < s.requiredDocTypes.length;
    }).length;
    return { done, inProgress, total: steps.length, docCount: projectDocs.filter(d => d.phase === phase).length };
  };

  // Xác định phase hiện tại của dự án (phase đầu tiên chưa hoàn tất)
  const currentPhase = PHASES.find(phase => {
    const { done, total } = getPhaseProgress(phase);
    return done < total;
  }) || PHASES[PHASES.length - 1];

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
        {/* CTA: Tiếp tục làm việc ở phase hiện tại */}
        {role !== 'Viewer' && (
          <Button
            className="gap-1.5"
            onClick={() => navigate(`/projects/${projectId}/phase/${phaseSlugMap[currentPhase]}`)}
          >
            Tiếp tục: {PHASE_LABELS[currentPhase]}
            <ArrowRight className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Phase progress timeline */}
      <div className="flex items-center gap-0">
        {PHASES.map((phase, idx) => {
          const cfg = phaseConfig[phase];
          const { done, total, inProgress } = getPhaseProgress(phase);
          const isComplete = done === total && total > 0;
          const isActive = phase === currentPhase;
          const Icon = cfg.icon;

          return (
            <div key={phase} className="flex items-center flex-1">
              <button
                onClick={() => navigate(`/projects/${projectId}/phase/${phaseSlugMap[phase]}`)}
                className={`flex-1 p-4 rounded-xl border-2 transition-all hover:shadow-md text-left ${
                  isActive
                    ? `${cfg.border} ${cfg.bg} shadow-sm`
                    : isComplete
                    ? 'border-green-200 bg-green-50'
                    : 'border-border bg-card hover:bg-muted/30'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Icon className={`h-4 w-4 ${isComplete ? 'text-green-500' : cfg.color}`} />
                  <span className={`text-xs font-semibold ${isComplete ? 'text-green-700' : cfg.textColor}`}>
                    {PHASE_LABELS[phase]}
                  </span>
                  {isActive && (
                    <Badge className="text-[10px] bg-primary text-primary-foreground ml-auto">Đang làm</Badge>
                  )}
                  {isComplete && (
                    <CheckCircle2 className="h-3.5 w-3.5 text-green-500 ml-auto" />
                  )}
                </div>
                <div className="text-lg font-bold">{done}/{total}</div>
                <div className="text-xs text-muted-foreground">bước hoàn tất</div>
                {inProgress > 0 && (
                  <div className="text-xs text-yellow-600 mt-1">{inProgress} đang thực hiện</div>
                )}
              </button>
              {idx < PHASES.length - 1 && (
                <ArrowRight className="h-4 w-4 text-muted-foreground mx-1 shrink-0" />
              )}
            </div>
          );
        })}
      </div>

      {/* Phase detail cards */}
      <div className="space-y-3">
        {PHASES.map(phase => {
          const cfg = phaseConfig[phase];
          const { done, total, docCount } = getPhaseProgress(phase);
          const steps = WORKFLOW_STEPS_V1.filter(s => s.phase === phase);
          const canWorkHere = canEditPhase(role, phase);
          const isCurrentPhase = phase === currentPhase;
          const Icon = cfg.icon;

          return (
            <Card
              key={phase}
              className={`transition-all ${isCurrentPhase ? `border-l-4 ${cfg.border}` : ''}`}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className={`h-7 w-7 rounded-lg ${cfg.bg} flex items-center justify-center`}>
                      <Icon className={`h-4 w-4 ${cfg.color}`} />
                    </div>
                    <div>
                      <span className={`text-sm font-semibold ${cfg.textColor}`}>{PHASE_LABELS[phase]}</span>
                      {isCurrentPhase && (
                        <span className="ml-2 text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-medium">
                          Phase hiện tại
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{docCount} tài liệu · {done}/{total} bước</span>
                    <Button
                      size="sm"
                      variant={isCurrentPhase && canWorkHere ? 'default' : 'outline'}
                      className="h-7 text-xs gap-1"
                      onClick={() => navigate(`/projects/${projectId}/phase/${phaseSlugMap[phase]}`)}
                    >
                      {canWorkHere ? 'Làm việc' : 'Xem'}
                      <ChevronRight className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                {/* Steps mini preview */}
                <div className="flex flex-wrap gap-1.5">
                  {steps.map(step => {
                    const docs = getDocsByCategory(projectId!, phase, step.category);
                    const ready = step.requiredDocTypes.filter(dt =>
                      docs.some(d => d.docType === dt && d.status !== 'Archived')
                    ).length;
                    const stepStatus = ready === step.requiredDocTypes.length && step.requiredDocTypes.length > 0
                      ? 'done' : ready > 0 ? 'progress' : 'empty';
                    const StepIcon = stepStatus === 'done' ? CheckCircle2 : stepStatus === 'progress' ? AlertTriangle : Circle;
                    const iconColor = stepStatus === 'done' ? 'text-green-500' : stepStatus === 'progress' ? 'text-yellow-500' : 'text-muted-foreground/40';

                    return (
                      <button
                        key={step.id}
                        onClick={() => navigate(`/projects/${projectId}/phase/${phaseSlugMap[phase]}`)}
                        className="flex items-center gap-1 px-2 py-1 rounded-md bg-muted/50 hover:bg-muted text-xs transition-colors"
                        title={step.name}
                      >
                        <StepIcon className={`h-3 w-3 ${iconColor}`} />
                        <span className="text-muted-foreground max-w-[120px] truncate">{step.name}</span>
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
