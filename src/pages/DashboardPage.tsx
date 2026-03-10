import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { PHASES, Phase, PHASE_LABELS, WORKFLOW_STEPS_V1, PROJECT_TYPES } from '@/data/mock-data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  TrendingUp, ClipboardList, Zap, Archive, FolderOpen, FileText,
  ChevronRight, Activity, AlertCircle, Clock, CheckCircle2,
  BarChart2, Users, Plus
} from 'lucide-react';
import { cn } from '@/lib/utils';

const phaseConfig: Record<Phase, { icon: React.ElementType; color: string; bg: string; textColor: string; slug: string; desc: string }> = {
  Sale:      { icon: TrendingUp,    color: 'text-orange-500', bg: 'bg-orange-50', textColor: 'text-orange-700', slug: 'sale',      desc: 'Brief → Discovery → Proposal → Contract' },
  Planning:  { icon: ClipboardList, color: 'text-teal-500',   bg: 'bg-teal-50',   textColor: 'text-teal-700',   slug: 'planning',  desc: 'Onboarding → Kickoff → Charter → Execution Plan' },
  Execution: { icon: Zap,           color: 'text-purple-500', bg: 'bg-purple-50', textColor: 'text-purple-700', slug: 'execution', desc: 'Execute → Update → Change Request → Payment' },
  Closing:   { icon: Archive,       color: 'text-green-500',  bg: 'bg-green-50',  textColor: 'text-green-700',  slug: 'closing',   desc: 'Closing → After Sales → Post Mortem' },
};

const statusColors: Record<string, string> = {
  Active:    'bg-green-100 text-green-700',
  'On Hold': 'bg-yellow-100 text-yellow-700',
  Completed: 'bg-gray-100 text-gray-600',
  Cancelled: 'bg-red-100 text-red-700',
};

const phaseSlug: Record<Phase, string> = {
  Sale: 'sale', Planning: 'planning', Execution: 'execution', Closing: 'closing',
};

export default function DashboardPage() {
  const navigate = useNavigate();
  const { projects, documents } = useData();
  const { role, userName } = useAuth();

  // --- Computed stats ---
  const activeProjects   = projects.filter(p => p.status === 'Active');
  const onHoldProjects   = projects.filter(p => p.status === 'On Hold');
  const completedProjects = projects.filter(p => p.status === 'Completed');
  const totalDocs        = documents.length;
  const draftDocs        = documents.filter(d => d.status === 'Draft').length;
  const finalDocs        = documents.filter(d => d.status === 'Final').length;

  const docsByPhase = PHASES.reduce((acc, p) => {
    acc[p] = documents.filter(d => d.phase === p).length;
    return acc;
  }, {} as Record<Phase, number>);

  // Projects theo loại
  const byType = PROJECT_TYPES.reduce((acc, t) => {
    acc[t.value] = projects.filter(p => p.projectType === t.value).length;
    return acc;
  }, {} as Record<string, number>);

  // Tìm projects có đang stuck (On Hold)
  const stuckProjects = projects.filter(p => p.status === 'On Hold');

  // Recent activity: docs sorted by updatedAt
  const recentDocs = [...documents]
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, 6);

  // Projects sorted by updatedAt
  const recentProjects = [...projects]
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, 5);

  // Tổng % docs đã Final
  const finalPct = totalDocs > 0 ? Math.round((finalDocs / totalDocs) * 100) : 0;

  // Completion per phase (docs Final / total docs in that phase)
  const phaseCompletion = PHASES.map(phase => {
    const total = docsByPhase[phase];
    const final = documents.filter(d => d.phase === phase && d.status === 'Final').length;
    return { phase, total, final, pct: total > 0 ? Math.round((final / total) * 100) : 0 };
  });

  // Projects cần chú ý: active nhưng không có doc nào ở Execution/Planning
  const needsAttention = activeProjects.filter(p => {
    const execDocs = documents.filter(d => d.projectId === p.id && (d.phase === 'Execution' || d.phase === 'Planning')).length;
    return execDocs === 0;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Xin chào, {userName} 👋</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Tổng quan hệ thống quản lý dự án VistaX
          </p>
        </div>
        <Button size="sm" className="gap-1.5" onClick={() => navigate('/projects')}>
          <Plus className="h-3.5 w-3.5" /> Xem tất cả dự án
        </Button>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={FolderOpen} iconBg="bg-blue-50" iconColor="text-blue-500"
          value={projects.length} label="Tổng dự án"
          sub={`${activeProjects.length} đang hoạt động`}
          onClick={() => navigate('/projects')}
        />
        <StatCard
          icon={Activity} iconBg="bg-green-50" iconColor="text-green-500"
          value={activeProjects.length} label="Active Projects"
          sub={onHoldProjects.length > 0 ? `${onHoldProjects.length} đang tạm dừng` : 'Không có tạm dừng'}
          subColor={onHoldProjects.length > 0 ? 'text-yellow-600' : undefined}
          onClick={() => navigate('/projects')}
        />
        <StatCard
          icon={FileText} iconBg="bg-orange-50" iconColor="text-orange-500"
          value={totalDocs} label="Tổng tài liệu"
          sub={`${finalDocs} Final · ${draftDocs} Draft`}
          onClick={() => navigate('/search')}
        />
        <StatCard
          icon={CheckCircle2} iconBg="bg-purple-50" iconColor="text-purple-500"
          value={`${finalPct}%`} label="Tỷ lệ Final"
          sub={`${finalDocs}/${totalDocs} tài liệu hoàn tất`}
        />
      </div>

      {/* Row 2: Phase overview + Alerts */}
      <div className="grid grid-cols-3 gap-4">
        {/* Phase breakdown — 2/3 width */}
        <div className="col-span-2 space-y-3">
          <h2 className="text-sm font-semibold">Phân bổ tài liệu theo Phase</h2>
          <div className="grid grid-cols-2 gap-3">
            {PHASES.map(phase => {
              const cfg = phaseConfig[phase];
              const Icon = cfg.icon;
              const completion = phaseCompletion.find(p => p.phase === phase)!;
              return (
                <Card
                  key={phase}
                  className="cursor-pointer hover:shadow-md transition-all group"
                  onClick={() => navigate(`/phase/${cfg.slug}`)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className={`h-9 w-9 rounded-lg ${cfg.bg} flex items-center justify-center`}>
                        <Icon className={`h-5 w-5 ${cfg.color}`} />
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
                    </div>
                    <p className={`text-xs font-semibold mb-0.5 ${cfg.textColor}`}>{PHASE_LABELS[phase]}</p>
                    <p className="text-[10px] text-muted-foreground mb-3">{cfg.desc}</p>
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">{completion.total} tài liệu</span>
                        <span className="font-medium">{completion.pct}% Final</span>
                      </div>
                      {/* Progress bar */}
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${cfg.bg.replace('bg-', 'bg-').replace('-50', '-400')}`}
                          style={{ width: `${completion.pct}%` }}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Alerts & attention — 1/3 */}
        <div className="space-y-3">
          <h2 className="text-sm font-semibold flex items-center gap-1.5">
            <AlertCircle className="h-4 w-4 text-yellow-500" /> Cần chú ý
          </h2>

          {needsAttention.length === 0 && stuckProjects.length === 0 ? (
            <Card>
              <CardContent className="py-6 text-center text-sm text-muted-foreground">
                <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-green-400" />
                Không có vấn đề gì!
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {stuckProjects.map(p => (
                <Card key={p.id} className="border-yellow-200 bg-yellow-50 cursor-pointer hover:shadow-sm"
                  onClick={() => navigate(`/projects/${p.id}`)}>
                  <CardContent className="py-3 px-3">
                    <div className="flex items-start gap-2">
                      <Clock className="h-3.5 w-3.5 text-yellow-600 shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <p className="text-xs font-medium truncate">{p.name}</p>
                        <p className="text-[10px] text-yellow-700">On Hold · {p.clientName}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {needsAttention.slice(0, 3).map(p => (
                <Card key={p.id} className="border-orange-200 bg-orange-50 cursor-pointer hover:shadow-sm"
                  onClick={() => navigate(`/projects/${p.id}`)}>
                  <CardContent className="py-3 px-3">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-3.5 w-3.5 text-orange-500 shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <p className="text-xs font-medium truncate">{p.name}</p>
                        <p className="text-[10px] text-orange-700">Active nhưng chưa có docs thực thi</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Project by type mini chart */}
          <h2 className="text-sm font-semibold flex items-center gap-1.5 pt-2">
            <BarChart2 className="h-4 w-4 text-muted-foreground" /> Loại dự án
          </h2>
          <Card>
            <CardContent className="py-3 px-3 space-y-2">
              {PROJECT_TYPES.filter(t => t.enabled).map(t => {
                const count = byType[t.value] || 0;
                const pct = projects.length > 0 ? Math.round((count / projects.length) * 100) : 0;
                return (
                  <div key={t.id}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-muted-foreground">{t.value}</span>
                      <span className="font-medium">{count}</span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary/60 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Row 3: Recent projects + Recent docs */}
      <div className="grid grid-cols-2 gap-4">
        {/* Recent projects */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold flex items-center gap-1.5">
              <FolderOpen className="h-4 w-4 text-muted-foreground" /> Dự án gần đây
            </h2>
            <Button variant="ghost" size="sm" onClick={() => navigate('/projects')} className="gap-1 text-xs h-7">
              Xem tất cả <ChevronRight className="h-3 w-3" />
            </Button>
          </div>
          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                {recentProjects.map(project => {
                  const docCount = documents.filter(d => d.projectId === project.id).length;
                  // find current phase
                  const currentPhase = PHASES.find(p =>
                    documents.filter(d => d.projectId === project.id && d.phase === p).length === 0
                  ) || PHASES[PHASES.length - 1];
                  const cfg = phaseConfig[currentPhase];

                  return (
                    <div
                      key={project.id}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-muted/40 cursor-pointer transition-colors"
                      onClick={() => navigate(`/projects/${project.id}`)}
                    >
                      <div className={`h-7 w-7 rounded-lg ${cfg.bg} flex items-center justify-center shrink-0`}>
                        <cfg.icon className={`h-3.5 w-3.5 ${cfg.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{project.name}</p>
                        <p className="text-xs text-muted-foreground">{project.clientName} · {project.code}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs text-muted-foreground">{docCount} docs</span>
                        <Badge className={`text-[10px] px-1.5 py-0.5 ${statusColors[project.status]}`}>
                          {project.status}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent documents */}
        <div>
          <div className="flex items-center justify-between mb-3">
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
                      <div className={`h-7 w-7 rounded-lg ${cfg.bg} flex items-center justify-center shrink-0`}>
                        <FileText className={`h-3.5 w-3.5 ${cfg.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate">{doc.title}</p>
                        <p className="text-[10px] text-muted-foreground truncate">
                          {project?.name || '—'} · <span className={cn('font-medium', cfg.textColor)}>{PHASE_LABELS[doc.phase]}</span>
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

      {/* Quick access: active projects by phase */}
      <div>
        <h2 className="text-sm font-semibold mb-3 flex items-center gap-1.5">
          <Users className="h-4 w-4 text-muted-foreground" /> Active Projects — Truy cập nhanh
        </h2>
        <div className="grid grid-cols-4 gap-3">
          {PHASES.map(phase => {
            const cfg = phaseConfig[phase];
            // projects có docs ở phase này
            const projectsInPhase = activeProjects.filter(p =>
              documents.some(d => d.projectId === p.id && d.phase === phase)
            );
            return (
              <Card key={phase}>
                <CardHeader className="pb-2 pt-3">
                  <CardTitle className={cn('text-xs font-semibold flex items-center gap-1.5', cfg.textColor)}>
                    <cfg.icon className="h-3.5 w-3.5" />
                    {PHASE_LABELS[phase]}
                    <Badge variant="secondary" className="ml-auto text-[10px]">{projectsInPhase.length}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 pb-3 space-y-1.5">
                  {projectsInPhase.length === 0 ? (
                    <p className="text-[10px] text-muted-foreground">Không có dự án</p>
                  ) : (
                    projectsInPhase.slice(0, 3).map(p => (
                      <button
                        key={p.id}
                        onClick={() => navigate(`/projects/${p.id}/phase/${phaseSlug[phase]}`)}
                        className="w-full text-left px-2 py-1.5 rounded-md hover:bg-muted text-xs truncate transition-colors flex items-center gap-1.5"
                      >
                        <span className={cn('h-1.5 w-1.5 rounded-full shrink-0', cfg.bg.replace('bg-', 'bg-').replace('-50', '-400'))} />
                        {p.name}
                      </button>
                    ))
                  )}
                  {projectsInPhase.length > 3 && (
                    <p className="text-[10px] text-muted-foreground pl-2">+{projectsInPhase.length - 3} khác</p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Reusable stat card
function StatCard({
  icon: Icon, iconBg, iconColor, value, label, sub, subColor, onClick
}: {
  icon: React.ElementType; iconBg: string; iconColor: string;
  value: string | number; label: string;
  sub?: string; subColor?: string; onClick?: () => void;
}) {
  return (
    <Card className={cn(onClick && 'cursor-pointer hover:shadow-md transition-all')} onClick={onClick}>
      <CardContent className="pt-5 pb-4">
        <div className="flex items-start gap-3">
          <div className={`h-10 w-10 rounded-lg ${iconBg} flex items-center justify-center shrink-0`}>
            <Icon className={`h-5 w-5 ${iconColor}`} />
          </div>
          <div className="min-w-0">
            <p className="text-2xl font-bold leading-none mb-1">{value}</p>
            <p className="text-xs text-muted-foreground">{label}</p>
            {sub && <p className={cn('text-[10px] mt-0.5', subColor || 'text-muted-foreground/70')}>{sub}</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
