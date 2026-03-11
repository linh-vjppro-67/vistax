import { useNavigate } from 'react-router-dom';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { PHASES, Phase, PHASE_LABELS, PROJECT_TYPES } from '@/data/mock-data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  TrendingUp, ClipboardList, Zap, Archive, FolderOpen, FileText,
  ChevronRight, Activity, AlertCircle, Clock, CheckCircle2,
  BarChart2, Plus, ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

const phaseConfig: Record<Phase, {
  icon: React.ElementType; color: string; bg: string; textColor: string;
  border: string; slug: string; desc: string; dot: string;
}> = {
  Sale:      { icon: TrendingUp,    color: 'text-orange-500', bg: 'bg-orange-50', textColor: 'text-orange-700', border: 'border-orange-300', dot: 'bg-orange-400', slug: 'sale',      desc: 'Brief → Discovery → Proposal → Contract' },
  Planning:  { icon: ClipboardList, color: 'text-teal-500',   bg: 'bg-teal-50',   textColor: 'text-teal-700',   border: 'border-teal-300',   dot: 'bg-teal-400',   slug: 'planning',  desc: 'Onboarding → Kickoff → Charter → Plan' },
  Execution: { icon: Zap,           color: 'text-purple-500', bg: 'bg-purple-50', textColor: 'text-purple-700', border: 'border-purple-300', dot: 'bg-purple-400', slug: 'execution', desc: 'Execute → Update → Change Request' },
  Closing:   { icon: Archive,       color: 'text-green-500',  bg: 'bg-green-50',  textColor: 'text-green-700',  border: 'border-green-300',  dot: 'bg-green-400',  slug: 'closing',   desc: 'Closing → After Sales → Post Mortem' },
};

const statusColors: Record<string, string> = {
  Active:    'bg-green-100 text-green-700',
  'On Hold': 'bg-yellow-100 text-yellow-700',
  Completed: 'bg-gray-100 text-gray-600',
  Cancelled: 'bg-red-100 text-red-600',
};

// Xác định project đang ở phase nào (phase đầu tiên chưa có docs)
function getProjectPhase(projectId: string, docs: { projectId: string; phase: Phase }[]): Phase {
  for (const phase of PHASES) {
    if (docs.filter(d => d.projectId === projectId && d.phase === phase).length === 0) {
      return phase;
    }
  }
  return 'Closing';
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const { projects, documents } = useData();
  const { userName } = useAuth();

  // ── KPI stats ──
  const activeProjects    = projects.filter(p => p.status === 'Active');
  const onHoldProjects    = projects.filter(p => p.status === 'On Hold');
  const totalDocs         = documents.length;
  const finalDocs         = documents.filter(d => d.status === 'Final').length;
  const draftDocs         = documents.filter(d => d.status === 'Draft').length;
  const finalPct          = totalDocs > 0 ? Math.round((finalDocs / totalDocs) * 100) : 0;

  // ── Kanban: gom project vào từng phase ──
  // Chỉ active + on-hold projects (completed không cần track nữa)
  const trackingProjects = projects.filter(p => p.status === 'Active' || p.status === 'On Hold');
  const kanbanColumns = PHASES.map(phase => ({
    phase,
    projects: trackingProjects.filter(p => getProjectPhase(p.id, documents) === phase),
  }));

  // ── Alerts ──
  const stuckProjects     = onHoldProjects;
  const needsAttention    = activeProjects.filter(p =>
    documents.filter(d => d.projectId === p.id).length === 0
  );

  // ── Loại dự án ──
  const byType = PROJECT_TYPES.reduce((acc, t) => {
    acc[t.value] = projects.filter(p => p.projectType === t.value).length;
    return acc;
  }, {} as Record<string, number>);

  // ── Recent docs ──
  const recentDocs = [...documents]
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Xin chào, {userName} 👋</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Tổng quan hệ thống quản lý dự án VistaX</p>
        </div>
        <Button size="sm" className="gap-1.5" onClick={() => navigate('/projects')}>
          <Plus className="h-3.5 w-3.5" /> Tạo dự án mới
        </Button>
      </div>

      {/* ── KPI row ── */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard icon={FolderOpen} iconBg="bg-blue-50" iconColor="text-blue-500"
          value={projects.length} label="Tổng dự án"
          sub={`${activeProjects.length} Active · ${onHoldProjects.length} On Hold`}
          onClick={() => navigate('/projects')} />
        <StatCard icon={Activity} iconBg="bg-green-50" iconColor="text-green-500"
          value={activeProjects.length} label="Đang hoạt động"
          sub={trackingProjects.length + ' project đang tracking'}
          onClick={() => navigate('/projects')} />
        <StatCard icon={FileText} iconBg="bg-orange-50" iconColor="text-orange-500"
          value={totalDocs} label="Tổng tài liệu"
          sub={`${finalDocs} Final · ${draftDocs} Draft`} />
        <StatCard icon={CheckCircle2} iconBg="bg-purple-50" iconColor="text-purple-500"
          value={`${finalPct}%`} label="Tỷ lệ Final"
          sub={`${finalDocs}/${totalDocs} tài liệu hoàn tất`} />
      </div>

      {/* ── KANBAN BOARD ── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold flex items-center gap-1.5">
            <Activity className="h-4 w-4 text-muted-foreground" />
            Pipeline Dự án
          </h2>
          <Button variant="ghost" size="sm" className="text-xs gap-1 h-7" onClick={() => navigate('/projects')}>
            Xem tất cả <ChevronRight className="h-3 w-3" />
          </Button>
        </div>

        <div className="grid grid-cols-4 gap-3">
          {kanbanColumns.map(({ phase, projects: colProjects }, colIdx) => {
            const cfg = phaseConfig[phase];
            const Icon = cfg.icon;
            return (
              <div key={phase} className="flex flex-col gap-2">
                {/* Column header */}
                <div className={cn(
                  'flex items-center gap-2 px-3 py-2.5 rounded-xl border',
                  cfg.bg, cfg.border
                )}>
                  <Icon className={cn('h-4 w-4', cfg.color)} />
                  <span className={cn('text-xs font-semibold flex-1', cfg.textColor)}>
                    {PHASE_LABELS[phase]}
                  </span>
                  <Badge variant="secondary" className="text-[10px] px-1.5">
                    {colProjects.length}
                  </Badge>
                </div>

                {/* Arrow connector */}
                {colIdx < PHASES.length - 1 && (
                  <div className="absolute hidden" /> // decorative only in grid layout
                )}

                {/* Project cards */}
                <div className="space-y-2 min-h-[80px]">
                  {colProjects.length === 0 ? (
                    <div className="border-2 border-dashed rounded-xl h-20 flex items-center justify-center">
                      <span className="text-[10px] text-muted-foreground">Không có dự án</span>
                    </div>
                  ) : (
                    colProjects.map(project => {
                      const docCount = documents.filter(d => d.projectId === project.id).length;
                      const phaseDocCount = documents.filter(d => d.projectId === project.id && d.phase === phase).length;
                      return (
                        <Card
                          key={project.id}
                          className={cn(
                            'cursor-pointer hover:shadow-md transition-all border-l-4 group',
                            `border-l-${cfg.dot.replace('bg-', '')}`
                          )}
                          style={{ borderLeftColor: phase === 'Sale' ? '#fb923c' : phase === 'Planning' ? '#2dd4bf' : phase === 'Execution' ? '#a78bfa' : '#4ade80' }}
                          onClick={() => navigate(`/projects/${project.id}/phase/${cfg.slug}`)}
                        >
                          <CardContent className="p-3 space-y-2">
                            {/* Project name */}
                            <div>
                              <p className="text-xs font-semibold leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                                {project.name}
                              </p>
                              <p className="text-[10px] text-muted-foreground mt-0.5">{project.clientName}</p>
                            </div>

                            {/* Status + type */}
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <Badge className={cn('text-[10px] px-1.5 py-0', statusColors[project.status])}>
                                {project.status}
                              </Badge>
                              <span className="text-[10px] text-muted-foreground bg-secondary px-1.5 py-0.5 rounded">
                                {project.projectType}
                              </span>
                            </div>

                            {/* Doc count */}
                            <div className="flex items-center justify-between text-[10px] text-muted-foreground border-t pt-1.5">
                              <span className="flex items-center gap-1">
                                <FileText className="h-3 w-3" />
                                {docCount} tài liệu
                              </span>
                              <span className={cn('font-medium', cfg.textColor)}>
                                {phaseDocCount} ở phase này
                              </span>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Flow arrow between columns */}
        {/* <div className="flex items-center justify-center gap-3 mt-2 text-muted-foreground/40">
          {PHASES.map((phase, i) => (
            <div key={phase} className="flex items-center gap-3">
              <span className={cn('text-[10px] font-medium', phaseConfig[phase].textColor)}>
                {PHASE_LABELS[phase]}
              </span>
              {i < PHASES.length - 1 && <ArrowRight className="h-3 w-3" />}
            </div>
          ))}
        </div> */}
      </div>

      {/* ── Row 3: Alerts + Recent docs + Type chart ── */}
      <div className="grid grid-cols-3 gap-4">

        {/* Cần chú ý */}
        <div className="space-y-2">
          <h2 className="text-sm font-semibold flex items-center gap-1.5">
            <AlertCircle className="h-4 w-4 text-yellow-500" /> Cần chú ý
          </h2>
          {stuckProjects.length === 0 && needsAttention.length === 0 ? (
            <Card>
              <CardContent className="py-6 text-center text-sm text-muted-foreground">
                <CheckCircle2 className="h-7 w-7 mx-auto mb-2 text-green-400" />
                Không có vấn đề!
              </CardContent>
            </Card>
          ) : (
            <>
              {stuckProjects.map(p => (
                <Card key={p.id} className="border-yellow-200 bg-yellow-50 cursor-pointer hover:shadow-sm"
                  onClick={() => navigate(`/projects/${p.id}`)}>
                  <CardContent className="py-3 px-3 flex items-start gap-2">
                    <Clock className="h-3.5 w-3.5 text-yellow-600 shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <p className="text-xs font-medium truncate">{p.name}</p>
                      <p className="text-[10px] text-yellow-700">On Hold · {p.clientName}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {needsAttention.map(p => (
                <Card key={p.id} className="border-orange-200 bg-orange-50 cursor-pointer hover:shadow-sm"
                  onClick={() => navigate(`/projects/${p.id}`)}>
                  <CardContent className="py-3 px-3 flex items-start gap-2">
                    <AlertCircle className="h-3.5 w-3.5 text-orange-500 shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <p className="text-xs font-medium truncate">{p.name}</p>
                      <p className="text-[10px] text-orange-700">Chưa có tài liệu nào</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </>
          )}

          {/* Type breakdown */}
          <h2 className="text-sm font-semibold flex items-center gap-1.5 pt-2">
            <BarChart2 className="h-4 w-4 text-muted-foreground" /> Loại dự án
          </h2>
          <Card>
            <CardContent className="py-3 px-3 space-y-2.5">
              {PROJECT_TYPES.filter(t => t.enabled).map(t => {
                const count = byType[t.value] || 0;
                const pct = projects.length > 0 ? Math.round((count / projects.length) * 100) : 0;
                return (
                  <div key={t.id}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-muted-foreground">{t.value}</span>
                      <span className="font-medium">{count} dự án</span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary/60 rounded-full transition-all" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>

        {/* Tài liệu mới */}
        <div className="col-span-2">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-semibold flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-muted-foreground" /> Tài liệu mới cập nhật
            </h2>
            <Button variant="ghost" size="sm" onClick={() => navigate('/search')} className="gap-1 text-xs h-7">
              Tìm kiếm <ChevronRight className="h-3 w-3" />
            </Button>
          </div>
          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                {recentDocs.map(doc => {
                  const project = projects.find(p => p.id === doc.projectId);
                  const cfg = phaseConfig[doc.phase];
                  return (
                    <div
                      key={doc.id}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-muted/40 cursor-pointer transition-colors"
                      onClick={() => navigate(`/projects/${doc.projectId}/docs/${doc.id}`)}
                    >
                      <div className={cn('h-8 w-8 rounded-lg flex items-center justify-center shrink-0', cfg.bg)}>
                        <FileText className={cn('h-4 w-4', cfg.color)} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{doc.title}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {project?.name || '—'} ·{' '}
                          <span className={cn('font-medium', cfg.textColor)}>{PHASE_LABELS[doc.phase]}</span>
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-0.5 shrink-0">
                        <Badge variant="outline" className="text-[10px] px-1.5">{doc.status}</Badge>
                        <span className="text-[10px] text-muted-foreground">{doc.updatedAt.slice(0, 10)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}

function StatCard({ icon: Icon, iconBg, iconColor, value, label, sub, onClick }: {
  icon: React.ElementType; iconBg: string; iconColor: string;
  value: string | number; label: string; sub?: string; onClick?: () => void;
}) {
  return (
    <Card className={cn(onClick && 'cursor-pointer hover:shadow-md transition-all')} onClick={onClick}>
      <CardContent className="pt-5 pb-4">
        <div className="flex items-start gap-3">
          <div className={cn('h-10 w-10 rounded-lg flex items-center justify-center shrink-0', iconBg)}>
            <Icon className={cn('h-5 w-5', iconColor)} />
          </div>
          <div>
            <p className="text-2xl font-bold leading-none mb-1">{value}</p>
            <p className="text-xs text-muted-foreground">{label}</p>
            {sub && <p className="text-[10px] text-muted-foreground/70 mt-0.5">{sub}</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
