import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PROJECT_TYPES, ProjectStatus, PHASES, Phase, PHASE_LABELS } from '@/data/mock-data';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { Plus, FolderOpen, Search, ChevronRight, FileText, Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

const statusColors: Record<ProjectStatus, string> = {
  Active: 'bg-green-100 text-green-700 border-green-200',
  'On Hold': 'bg-yellow-100 text-yellow-700 border-yellow-200',
  Completed: 'bg-gray-100 text-gray-600 border-gray-200',
  Cancelled: 'bg-red-100 text-red-700 border-red-200',
};

const phaseSlug: Record<Phase, string> = {
  Sale: 'sale', Planning: 'planning', Execution: 'execution', Closing: 'closing',
};

const phaseColors: Record<Phase, string> = {
  Sale: 'bg-orange-100 text-orange-700',
  Planning: 'bg-teal-100 text-teal-700',
  Execution: 'bg-purple-100 text-purple-700',
  Closing: 'bg-green-100 text-green-700',
};

// Xác định phase hiện tại của project (phase đầu tiên chưa có đủ docs)
function getCurrentPhase(projectId: string, documents: ReturnType<typeof useData>['documents']): Phase {
  const phaseDocCount = PHASES.map(p => documents.filter(d => d.projectId === projectId && d.phase === p).length);
  for (let i = 0; i < PHASES.length; i++) {
    if (phaseDocCount[i] === 0) return PHASES[i];
  }
  return PHASES[PHASES.length - 1];
}

export default function ProjectsPage() {
  const navigate = useNavigate();
  const { role } = useAuth();
  const { projects, documents, createProject, templates } = useData();

  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({
    name: '', code: '', clientName: '', projectType: '', templateId: 'tpl_baseline',
  });
  const [errors, setErrors] = useState<Record<string, boolean>>({});

  const filtered = projects.filter(p => {
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.code.toLowerCase().includes(search.toLowerCase()) ||
      p.clientName.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || p.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const validate = () => {
    const e: Record<string, boolean> = {};
    if (!form.name.trim()) e.name = true;
    if (!form.code.trim()) e.code = true;
    if (!form.clientName.trim()) e.clientName = true;
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleCreate = () => {
    if (!validate()) return;
    const p = createProject({
      name: form.name.trim(),
      code: form.code.trim(),
      clientName: form.clientName.trim(),
      projectType: form.projectType || 'CGI',
      templateId: form.templateId,
    });
    setShowCreate(false);
    setForm({ name: '', code: '', clientName: '', projectType: '', templateId: 'tpl_baseline' });
    setErrors({});
    navigate(`/projects/${p.id}`);
  };

  const canCreate = role === 'Admin' || role === 'PM';

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Tất cả Dự án</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {projects.length} dự án · {projects.filter(p => p.status === 'Active').length} đang hoạt động
          </p>
        </div>
        {canCreate && (
          <Button size="sm" className="gap-1.5" onClick={() => setShowCreate(true)}>
            <Plus className="h-3.5 w-3.5" /> Tạo dự án mới
          </Button>
        )}
      </div>

      {/* Create project panel */}
      {showCreate && (
        <Card className="border-primary/40 shadow-md">
          <CardContent className="pt-5 pb-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold">Tạo dự án mới</h2>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setShowCreate(false); setErrors({}); }}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs">Tên dự án <span className="text-red-500">*</span></Label>
                <Input
                  placeholder="VD: Vinhomes Grand Park CGI"
                  value={form.name}
                  onChange={e => { setForm(f => ({ ...f, name: e.target.value })); setErrors(er => ({ ...er, name: false })); }}
                  className={cn('h-9', errors.name && 'border-red-400')}
                  autoFocus
                />
                {errors.name && <p className="text-xs text-red-500">Bắt buộc nhập tên dự án</p>}
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Mã dự án <span className="text-red-500">*</span></Label>
                <Input
                  placeholder="VD: VGP-2024-001"
                  value={form.code}
                  onChange={e => { setForm(f => ({ ...f, code: e.target.value })); setErrors(er => ({ ...er, code: false })); }}
                  className={cn('h-9', errors.code && 'border-red-400')}
                />
                {errors.code && <p className="text-xs text-red-500">Bắt buộc nhập mã dự án</p>}
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Tên khách hàng <span className="text-red-500">*</span></Label>
                <Input
                  placeholder="VD: Vinhomes"
                  value={form.clientName}
                  onChange={e => { setForm(f => ({ ...f, clientName: e.target.value })); setErrors(er => ({ ...er, clientName: false })); }}
                  className={cn('h-9', errors.clientName && 'border-red-400')}
                />
                {errors.clientName && <p className="text-xs text-red-500">Bắt buộc nhập tên khách hàng</p>}
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Loại dự án</Label>
                <Select value={form.projectType} onValueChange={v => setForm(f => ({ ...f, projectType: v }))}>
                  <SelectTrigger className="h-9"><SelectValue placeholder="Chọn loại dự án" /></SelectTrigger>
                  <SelectContent>
                    {PROJECT_TYPES.filter(t => t.enabled).map(t => (
                      <SelectItem key={t.id} value={t.value}>{t.value}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {templates.length > 1 && (
                <div className="space-y-1.5 col-span-2">
                  <Label className="text-xs">Template workflow</Label>
                  <Select value={form.templateId} onValueChange={v => setForm(f => ({ ...f, templateId: v }))}>
                    <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {templates.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
            <div className="flex gap-2 justify-end mt-4">
              <Button variant="outline" size="sm" onClick={() => { setShowCreate(false); setErrors({}); }}>Huỷ</Button>
              <Button size="sm" onClick={handleCreate} className="gap-1.5">
                <Plus className="h-3.5 w-3.5" /> Tạo dự án
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Tìm theo tên, mã, khách hàng..."
            className="pl-8 h-9"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-1.5">
          <Filter className="h-3.5 w-3.5 text-muted-foreground" />
          {(['all', 'Active', 'On Hold', 'Completed', 'Cancelled'] as const).map(s => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={cn(
                'px-3 py-1.5 rounded-md text-xs font-medium transition-colors',
                filterStatus === s
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              )}
            >
              {s === 'all' ? 'Tất cả' : s}
            </button>
          ))}
        </div>
      </div>

      {/* Project cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(project => {
          const docCount = documents.filter(d => d.projectId === project.id).length;
          const currentPhase = getCurrentPhase(project.id, documents);
          const phaseDocCounts = PHASES.map(p => ({
            phase: p,
            count: documents.filter(d => d.projectId === project.id && d.phase === p).length,
          }));

          return (
            <Card
              key={project.id}
              className="cursor-pointer hover:shadow-md transition-all group border hover:border-primary/30"
              onClick={() => navigate(`/projects/${project.id}`)}
            >
              <CardContent className="p-4">
                {/* Top row */}
                <div className="flex items-start justify-between mb-3">
                  <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
                    <FolderOpen className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <Badge className={cn('text-xs border', statusColors[project.status as ProjectStatus])}>
                    {project.status}
                  </Badge>
                </div>

                {/* Name & client */}
                <p className="font-semibold text-sm mb-0.5 truncate">{project.name}</p>
                <p className="text-xs text-muted-foreground mb-1">{project.clientName}</p>
                <p className="text-[10px] font-mono text-muted-foreground/70 mb-3">{project.code} · {project.projectType}</p>

                {/* Phase progress dots */}
                <div className="flex items-center gap-1.5 mb-3">
                  {phaseDocCounts.map(({ phase, count }) => (
                    <div
                      key={phase}
                      className={cn(
                        'flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium',
                        count > 0 ? phaseColors[phase] : 'bg-muted text-muted-foreground/50'
                      )}
                      title={`${PHASE_LABELS[phase]}: ${count} docs`}
                    >
                      <span className={cn('h-1.5 w-1.5 rounded-full', count > 0 ? 'bg-current opacity-70' : 'bg-muted-foreground/30')} />
                      {count}
                    </div>
                  ))}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <FileText className="h-3 w-3" />
                    <span>{docCount} tài liệu</span>
                  </div>
                  <button
                    className={cn(
                      'flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md transition-colors',
                      phaseColors[currentPhase]
                    )}
                    onClick={e => {
                      e.stopPropagation();
                      navigate(`/projects/${project.id}/phase/${phaseSlug[currentPhase]}`);
                    }}
                  >
                    {PHASE_LABELS[currentPhase]}
                    <ChevronRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {/* Empty create card */}
        {canCreate && (
          <Card
            className="cursor-pointer hover:shadow-md transition-all border-dashed border-2 hover:border-primary/40 flex items-center justify-center min-h-[180px]"
            onClick={() => setShowCreate(true)}
          >
            <CardContent className="p-4 flex flex-col items-center gap-2 text-muted-foreground">
              <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                <Plus className="h-5 w-5" />
              </div>
              <p className="text-sm font-medium">Tạo dự án mới</p>
            </CardContent>
          </Card>
        )}

        {filtered.length === 0 && !canCreate && (
          <div className="col-span-3 text-center py-16 text-muted-foreground text-sm">
            Không tìm thấy dự án nào
          </div>
        )}
      </div>
    </div>
  );
}
