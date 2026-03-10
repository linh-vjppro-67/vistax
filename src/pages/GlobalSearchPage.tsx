import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { PHASES, DocStatus, STATUS_LABELS, PHASE_LABELS } from '@/data/mock-data';
import { useData } from '@/contexts/DataContext';
import { Search as SearchIcon, FileText, SlidersHorizontal } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';

export default function GlobalSearchPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { documents, projects, docTypes } = useData();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [showFilters, setShowFilters] = useState(false);
  const [filterPhase, setFilterPhase] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterDocType, setFilterDocType] = useState<string>('all');

  const enabledDocTypes = docTypes.filter(d => d.enabled).map(d => d.name);

  let results = documents;
  if (query) results = results.filter(d => d.title.toLowerCase().includes(query.toLowerCase()) || d.owner.toLowerCase().includes(query.toLowerCase()));
  if (filterPhase !== 'all') results = results.filter(d => d.phase === filterPhase);
  if (filterStatus !== 'all') results = results.filter(d => d.status === filterStatus);
  if (filterDocType !== 'all') results = results.filter(d => d.docType === filterDocType);

  const getProjectName = (pid: string) => projects.find(p => p.id === pid)?.name || '';

  return (
    <div className="w-full">
      <h1 className="text-xl font-semibold mb-6">Tìm kiếm <span className="text-sm font-normal text-muted-foreground">(Global Search)</span></h1>

      <div className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm tài liệu, dự án..."
            className="pl-10 h-10"
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
        </div>
        <Button variant="outline" size="icon" onClick={() => setShowFilters(!showFilters)}>
          <SlidersHorizontal className="h-4 w-4" />
        </Button>
      </div>

      {showFilters && (
        <div className="flex gap-3 mb-4 p-3 bg-secondary/50 rounded-lg">
          <Select value={filterPhase} onValueChange={setFilterPhase}>
            <SelectTrigger className="w-40 h-9"><SelectValue placeholder="Giai đoạn" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả giai đoạn</SelectItem>
              {PHASES.map(p => <SelectItem key={p} value={p}>{PHASE_LABELS[p]}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-40 h-9"><SelectValue placeholder="Trạng thái" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              {(['Draft', 'Shared', 'Final', 'Archived'] as DocStatus[]).map(s => <SelectItem key={s} value={s}>{STATUS_LABELS[s]}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={filterDocType} onValueChange={setFilterDocType}>
            <SelectTrigger className="w-40 h-9"><SelectValue placeholder="Loại" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả loại</SelectItem>
              {enabledDocTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      )}

      <p className="text-sm text-muted-foreground mb-3">{results.length} kết quả</p>

      <div className="space-y-2">
        {results.map(doc => (
          <Card
            key={doc.id}
            className="cursor-pointer hover:border-primary/30 transition-colors"
            onClick={() => navigate(`/projects/${doc.projectId}/docs/${doc.id}`)}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <FileText className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium">{doc.title}</p>
                    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                      <span>{getProjectName(doc.projectId)}</span>
                      <span>·</span>
                      <span>{PHASE_LABELS[doc.phase]}</span>
                      <span>·</span>
                      <span>{doc.category}</span>
                      <span>·</span>
                      <span>{doc.updatedAt}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">{doc.docType}</Badge>
                  <span className={`status-badge status-${doc.status.toLowerCase()}`}>{STATUS_LABELS[doc.status]}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
