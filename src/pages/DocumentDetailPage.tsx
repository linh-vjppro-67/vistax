import { useParams, useNavigate } from 'react-router-dom';
import { STATUS_LABELS, PHASE_LABELS, canEditPhase, Phase, PHASES, DocStatus } from '@/data/mock-data';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { ChevronRight, Download, FileText, Clock, Tag, Eye } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { useMemo, useState } from 'react';

export default function DocumentDetailPage() {
  const { projectId, docId } = useParams();
  const navigate = useNavigate();
  const { role, userName } = useAuth();
  const { getDocById, getProjectById, setCurrentVersion, updateDocument, updateDocumentTags, addVersion, docTypes, taxonomy } = useData();

  const doc = docId ? getDocById(docId) : undefined;
  const project = projectId ? getProjectById(projectId) : undefined;
  const [showNewVersion, setShowNewVersion] = useState(false);
  const [newVer, setNewVer] = useState({ fileName: '', note: '' });

  if (!doc || !project) return <div className="text-center py-20 text-muted-foreground">Tài liệu không tồn tại</div>;

  const canEdit = canEditPhase(role, doc.phase);

  const enabledDocTypes = docTypes.filter(d => d.enabled).map(d => d.name);
  const enabledProjectTypes = taxonomy.projectTypes.filter(t => t.enabled);
  const enabledClientTypes = taxonomy.clientTypes.filter(t => t.enabled);
  const enabledDeliverableTypes = taxonomy.deliverableTypes.filter(t => t.enabled);

  const metadataEditable = canEdit && role !== 'Viewer';

  return (
    <div className="w-full">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-4 flex-wrap">
        <button onClick={() => navigate('/projects')} className="hover:text-foreground">Dự án</button>
        <ChevronRight className="h-3 w-3" />
        <button onClick={() => navigate(`/projects/${project.id}`)} className="hover:text-foreground">{project.name}</button>
        <ChevronRight className="h-3 w-3" />
        <button onClick={() => navigate(`/projects/${project.id}/docs?phase=${doc.phase}&category=${doc.category}`)} className="hover:text-foreground">{doc.category}</button>
        <ChevronRight className="h-3 w-3" />
        <span className="text-foreground font-medium">{doc.title}</span>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-semibold">{doc.title}</h1>
            <span className={`status-badge status-${doc.status.toLowerCase()}`}>{STATUS_LABELS[doc.status]}</span>
          </div>
          <div className="flex items-center gap-2 mt-1.5 text-sm text-muted-foreground">
            <span>v{doc.versionCurrent}</span>
            <span>·</span>
            <span>{doc.owner}</span>
            <span>·</span>
            <span>{doc.updatedAt}</span>
          </div>
        </div>
        <Button variant="outline" size="sm" className="gap-1.5">
          <Download className="h-3.5 w-3.5" /> Tải xuống
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="col-span-2">
          <Tabs defaultValue="overview">
            <TabsList>
              <TabsTrigger value="overview">Tổng quan</TabsTrigger>
              <TabsTrigger value="versions">Phiên bản ({doc.versions.length})</TabsTrigger>
              <TabsTrigger value="metadata">Metadata</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-4">
              {/* Preview Placeholder */}
              <Card>
                <CardContent className="p-0">
                  <div className="h-64 bg-muted rounded-lg flex items-center justify-center">
                    <div className="text-center text-muted-foreground">
                      <Eye className="h-8 w-8 mx-auto mb-2 opacity-40" />
                      <p className="text-sm">File preview will appear here</p>
                      <p className="text-xs mt-1">Xem trước tệp sẽ hiển thị ở đây</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* API Ready Placeholder */}
              <Card className="mt-4 border-dashed">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Tag className="h-4 w-4" />
                    <span className="text-xs">🔌 API-ready: RAG/AI features placeholder — future integration point</span>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="versions" className="mt-4 space-y-3">
              {metadataEditable && (
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">Quản lý phiên bản</p>
                  <Button size="sm" onClick={() => { setNewVer({ fileName: '', note: '' }); setShowNewVersion(true); }}>
                    Tải phiên bản mới
                  </Button>
                </div>
              )}
              {doc.versions.sort((a, b) => b.v - a.v).map(ver => (
                <Card key={ver.v} className={ver.v === doc.versionCurrent ? 'border-primary/30' : ''}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Badge variant={ver.v === doc.versionCurrent ? 'default' : 'outline'} className="text-xs">
                          v{ver.v}
                        </Badge>
                        <div>
                          <p className="text-sm font-medium">{ver.fileName}</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                            <Clock className="h-3 w-3" />
                            {ver.uploadedAt} · {ver.uploadedBy}
                          </p>
                          {ver.note && <p className="text-xs text-muted-foreground mt-1">{ver.note}</p>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" className="gap-1 text-xs">
                          <Download className="h-3 w-3" /> Tải
                        </Button>
                        {ver.v !== doc.versionCurrent && (role === 'Admin' || role === 'PM') && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-xs"
                                onClick={() => setCurrentVersion(doc.id, ver.v)}
                              >
                                Đặt hiện tại
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Set as current version</TooltipContent>
                          </Tooltip>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="metadata" className="mt-4">
              <Card>
                <CardContent className="p-4 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label>Giai đoạn (Phase)</Label>
                      <Select
                        value={doc.phase}
                        onValueChange={(v) => updateDocument(doc.id, { phase: v as Phase })}
                        disabled={!metadataEditable}
                      >
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {PHASES.map(p => <SelectItem key={p} value={p}>{PHASE_LABELS[p]}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label>Danh mục (Category)</Label>
                      <Input value={doc.category} disabled className="bg-muted" />
                      <p className="text-[11px] text-muted-foreground">POC: đổi category thực hiện tại Document Library</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label>Loại tài liệu (Doc Type)</Label>
                      <Select
                        value={doc.docType}
                        onValueChange={(v) => updateDocument(doc.id, { docType: v })}
                        disabled={!metadataEditable}
                      >
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {enabledDocTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label>Người sở hữu (Owner)</Label>
                      <Input value={doc.owner} onChange={(e) => updateDocument(doc.id, { owner: e.target.value })} disabled={!metadataEditable} />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label>Trạng thái (Status)</Label>
                      <Select
                        value={doc.status}
                        onValueChange={(v) => updateDocument(doc.id, { status: v as DocStatus })}
                        disabled={!metadataEditable}
                      >
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {(['Draft', 'Shared', 'Final', 'Archived'] as DocStatus[]).map(s => (
                            <SelectItem key={s} value={s}>{STATUS_LABELS[s]}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label>Phiên bản hiện tại</Label>
                      <Input value={`v${doc.versionCurrent}`} disabled className="bg-muted" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label>Ngày tạo (Created)</Label>
                      <Input value={doc.createdAt} disabled className="bg-muted" />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Cập nhật (Updated)</Label>
                      <Input value={doc.updatedAt} disabled className="bg-muted" />
                    </div>
                  </div>
                  <Separator />
                  <p className="text-xs font-medium text-muted-foreground">Taxonomy Tags</p>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Project Type</Label>
                      <Select
                        value={doc.tags.projectType}
                        onValueChange={(v) => updateDocumentTags(doc.id, { ...doc.tags, projectType: v })}
                        disabled={!metadataEditable}
                      >
                        <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {enabledProjectTypes.map(t => <SelectItem key={t.id} value={t.value}>{t.value}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Client Type</Label>
                      <Select
                        value={doc.tags.clientType}
                        onValueChange={(v) => updateDocumentTags(doc.id, { ...doc.tags, clientType: v })}
                        disabled={!metadataEditable}
                      >
                        <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {enabledClientTypes.map(t => <SelectItem key={t.id} value={t.value}>{t.value}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Deliverable Type</Label>
                      <Select
                        value={doc.tags.deliverableType}
                        onValueChange={(v) => updateDocumentTags(doc.id, { ...doc.tags, deliverableType: v })}
                        disabled={!metadataEditable}
                      >
                        <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {enabledDeliverableTypes.map(t => <SelectItem key={t.id} value={t.value}>{t.value}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  {!canEdit && (
                    <p className="text-xs text-muted-foreground bg-muted rounded p-2 mt-2">
                      🔒 Bạn không có quyền chỉnh sửa metadata (Read-only)
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Thông tin (Info)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div><span className="text-muted-foreground">Dự án:</span> <span className="font-medium ml-1">{project.name}</span></div>
              <div><span className="text-muted-foreground">Mã:</span> <span className="font-mono text-xs ml-1">{project.code}</span></div>
              <div><span className="text-muted-foreground">Khách hàng:</span> <span className="ml-1">{project.clientName}</span></div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={showNewVersion} onOpenChange={setShowNewVersion}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tải phiên bản mới</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label>File name (mock)</Label>
              <Input placeholder="e.g., Plan_v2.pdf" value={newVer.fileName} onChange={(e) => setNewVer(v => ({ ...v, fileName: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Ghi chú</Label>
              <Input placeholder="What's changed?" value={newVer.note} onChange={(e) => setNewVer(v => ({ ...v, note: e.target.value }))} />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Hủy</Button></DialogClose>
            <DialogClose asChild>
              <Button
                disabled={!newVer.fileName.trim()}
                onClick={() => {
                  addVersion(doc.id, { fileName: newVer.fileName.trim(), uploadedAt: new Date().toISOString().slice(0,10), uploadedBy: userName, note: newVer.note });
                }}
              >
                Upload
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
