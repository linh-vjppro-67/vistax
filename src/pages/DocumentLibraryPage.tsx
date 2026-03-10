import { useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { PHASES, Phase, DocStatus, STATUS_LABELS, PHASE_LABELS, canEditPhase, Document } from '@/data/mock-data';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { ChevronRight, Search, Upload, FileText, Download, Eye, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Checkbox } from '@/components/ui/checkbox';
import UploadModal from '@/components/UploadModal';

export default function DocumentLibraryPage() {
  const { projectId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { role } = useAuth();
  const { getProjectById, documents, docTypes, updateDocument } = useData();

  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterDocType, setFilterDocType] = useState<string>('all');
  const [filterOwner, setFilterOwner] = useState<string>('all');
  const [filterFrom, setFilterFrom] = useState<string>('');
  const [filterTo, setFilterTo] = useState<string>('');
  const [showUpload, setShowUpload] = useState(false);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [bulkStatus, setBulkStatus] = useState<DocStatus>('Shared');

  const phase = (searchParams.get('phase') || 'Sale') as Phase;
  const category = searchParams.get('category') || '';

  const project = projectId ? getProjectById(projectId) : undefined;
  if (!project) return <div className="text-center py-20 text-muted-foreground">Dự án không tồn tại</div>;

  const canEdit = canEditPhase(role, phase);

  const enabledDocTypes = docTypes.filter(d => d.enabled).map(d => d.name);

  let docs = documents.filter(d => d.projectId === projectId && d.phase === phase);
  if (category) docs = docs.filter(d => d.category === category);
  if (search) docs = docs.filter(d => d.title.toLowerCase().includes(search.toLowerCase()));
  if (filterStatus !== 'all') docs = docs.filter(d => d.status === filterStatus);
  if (filterDocType !== 'all') docs = docs.filter(d => d.docType === filterDocType);
  if (filterOwner !== 'all') docs = docs.filter(d => d.owner === filterOwner);
  if (filterFrom) docs = docs.filter(d => d.updatedAt >= filterFrom);
  if (filterTo) docs = docs.filter(d => d.updatedAt <= filterTo);

  const owners = Array.from(new Set(documents.filter(d => d.projectId === projectId).map(d => d.owner))).filter(Boolean);

  const canBulk = role === 'Admin' || role === 'PM';
  const selectedIds = Object.entries(selected).filter(([, v]) => v).map(([id]) => id);
  const toggleAll = (checked: boolean) => {
    const next: Record<string, boolean> = {};
    docs.forEach(d => { next[d.id] = checked; });
    setSelected(next);
  };

  const exportCsv = (items: Document[]) => {
    const headers = ['Title','Project','Phase','Category','DocType','Owner','Status','CurrentVersion','Updated','Imported'];
    const rows = items.map(d => [
      d.title,
      project.code,
      d.phase,
      d.category,
      d.docType,
      d.owner,
      d.status,
      `v${d.versionCurrent}`,
      d.updatedAt,
      d.imported ? 'Yes' : 'No',
    ]);
    const esc = (v: string) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const csv = [headers.map(esc).join(','), ...rows.map(r => r.map(esc).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vistax_${project.code}_${phase}${category ? '_' + category : ''}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-4">
        <button onClick={() => navigate('/projects')} className="hover:text-foreground">Dự án</button>
        <ChevronRight className="h-3 w-3" />
        <button onClick={() => navigate(`/projects/${project.id}`)} className="hover:text-foreground">{project.name}</button>
        <ChevronRight className="h-3 w-3" />
        <span className="text-foreground">{PHASE_LABELS[phase]}</span>
        {category && (
          <>
            <ChevronRight className="h-3 w-3" />
            <span className="text-foreground font-medium">{category}</span>
          </>
        )}
      </div>

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold">
          Tài liệu <span className="text-sm font-normal text-muted-foreground">(Documents)</span>
        </h1>
        {canEdit ? (
          <Button size="sm" className="gap-1.5" onClick={() => setShowUpload(true)}>
            <Upload className="h-3.5 w-3.5" /> Tải lên
          </Button>
        ) : (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="sm" variant="outline" disabled><Upload className="h-3.5 w-3.5 mr-1" /> Tải lên</Button>
            </TooltipTrigger>
            <TooltipContent>Insufficient permission</TooltipContent>
          </Tooltip>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input placeholder="Tìm tài liệu..." className="pl-8 h-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-40 h-9"><SelectValue placeholder="Trạng thái" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả trạng thái</SelectItem>
            {(['Draft', 'Shared', 'Final', 'Archived'] as DocStatus[]).map(s => (
              <SelectItem key={s} value={s}>{STATUS_LABELS[s]}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterDocType} onValueChange={setFilterDocType}>
          <SelectTrigger className="w-40 h-9"><SelectValue placeholder="Loại tài liệu" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả loại</SelectItem>
            {enabledDocTypes.map(t => (
              <SelectItem key={t} value={t}>{t}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filterOwner} onValueChange={setFilterOwner}>
          <SelectTrigger className="w-44 h-9"><SelectValue placeholder="Owner" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả owner</SelectItem>
            {owners.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
          </SelectContent>
        </Select>

        <div className="flex items-center gap-2">
          <Input type="date" value={filterFrom} onChange={e => setFilterFrom(e.target.value)} className="h-9 w-40" />
          <span className="text-xs text-muted-foreground">→</span>
          <Input type="date" value={filterTo} onChange={e => setFilterTo(e.target.value)} className="h-9 w-40" />
        </div>
      </div>

      {/* Bulk actions */}
      {canBulk && selectedIds.length > 0 && (
        <div className="flex items-center gap-3 mb-4 border rounded-lg bg-card p-3">
          <span className="text-sm font-medium">Đã chọn {selectedIds.length}</span>
          <Select value={bulkStatus} onValueChange={(v) => setBulkStatus(v as DocStatus)}>
            <SelectTrigger className="w-44 h-9"><SelectValue /></SelectTrigger>
            <SelectContent>
              {(['Draft', 'Shared', 'Final', 'Archived'] as DocStatus[]).map(s => (
                <SelectItem key={s} value={s}>{STATUS_LABELS[s]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            size="sm"
            onClick={() => {
              selectedIds.forEach(id => updateDocument(id, { status: bulkStatus }));
              setSelected({});
            }}
          >
            Đổi trạng thái
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              selectedIds.forEach(id => updateDocument(id, { status: 'Archived' }));
              setSelected({});
            }}
          >
            Lưu trữ
          </Button>
          <Button size="sm" variant="outline" onClick={() => setSelected({})}>Bỏ chọn</Button>
          <Button
            size="sm"
            variant="outline"
            className="ml-auto"
            onClick={() => exportCsv(docs.filter(d => selectedIds.includes(d.id)))}
          >
            Export CSV
          </Button>
        </div>
      )}

      {/* Table */}
      {docs.length === 0 ? (
        <div className="text-center py-16 border rounded-lg bg-card">
          <FileText className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
          <p className="font-medium">Chưa có tài liệu</p>
          <p className="text-sm text-muted-foreground mt-1">Tải lên tài liệu đầu tiên</p>
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                {canBulk && <TableHead className="w-10"><Checkbox checked={docs.length > 0 && selectedIds.length === docs.length} onCheckedChange={(v) => toggleAll(!!v)} /></TableHead>}
                <TableHead>Tên tài liệu</TableHead>
                <TableHead>Loại</TableHead>
                <TableHead>Người sở hữu</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Phiên bản</TableHead>
                <TableHead>Cập nhật</TableHead>
                <TableHead className="w-16"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {docs.map(doc => (
                <TableRow
                  key={doc.id}
                  className="cursor-pointer hover:bg-accent/50"
                  onClick={() => navigate(`/projects/${projectId}/docs/${doc.id}`)}
                >
                  {canBulk && (
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Checkbox checked={!!selected[doc.id]} onCheckedChange={(v) => setSelected((s) => ({ ...s, [doc.id]: !!v }))} />
                    </TableCell>
                  )}
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="font-medium">{doc.title}</span>
                      {doc.imported && <Badge variant="outline" className="text-[10px]">Imported</Badge>}
                    </div>
                  </TableCell>
                  <TableCell><Badge variant="outline" className="text-xs">{doc.docType}</Badge></TableCell>
                  <TableCell className="text-sm">{doc.owner}</TableCell>
                  <TableCell>
                    <span className={`status-badge status-${doc.status.toLowerCase()}`}>
                      {STATUS_LABELS[doc.status]}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm">v{doc.versionCurrent}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{doc.updatedAt}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={e => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" className="h-7 w-7">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => navigate(`/projects/${projectId}/docs/${doc.id}`)}>
                          <Eye className="h-3.5 w-3.5 mr-2" /> Xem chi tiết
                        </DropdownMenuItem>
                        <DropdownMenuItem><Download className="h-3.5 w-3.5 mr-2" /> Tải xuống</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <UploadModal
        open={showUpload}
        onClose={() => setShowUpload(false)}
        projectId={projectId || ''}
        defaultPhase={phase}
        defaultCategory={category}
      />
    </div>
  );
}
