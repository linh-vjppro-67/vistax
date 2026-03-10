import { useMemo, useState } from 'react';
import { PHASES, Phase, PHASE_LABELS } from '@/data/mock-data';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { Settings, GripVertical, Plus, Layers, FileType, LayoutList } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function AdminStructurePage() {
  const { isAdmin } = useAuth();
  const {
    templates,
    activeTemplateId,
    createTemplate,
    renameTemplate,
    docTypes,
    addCategory,
    toggleCategory,
    addDocType,
    toggleDocType,
    documents,
    reorderPhases,
    phaseOrder,
  } = useData();
  if (!isAdmin) {
    return <div className="text-center py-20 text-muted-foreground">🔒 Insufficient permission</div>;
  }
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [showAddDocType, setShowAddDocType] = useState(false);
  const [showCreateTemplate, setShowCreateTemplate] = useState(false);
  const [showRenameTemplate, setShowRenameTemplate] = useState(false);
  const [selectedPhase, setSelectedPhase] = useState<Phase>('Sale');
  const [newValue, setNewValue] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(activeTemplateId);
  const [templateForm, setTemplateForm] = useState({ name: '', description: '', baseTemplateId: activeTemplateId });
  const [renameForm, setRenameForm] = useState({ name: '', description: '' });

  const activeTemplate = useMemo(
    () => templates.find(t => t.id === selectedTemplateId) || templates[0],
    [templates, selectedTemplateId]
  );

  const docsByCat = useMemo(() => {
    const map = new Map<string, number>();
    documents.forEach(d => {
      const key = `${d.phase}::${d.category}`;
      map.set(key, (map.get(key) || 0) + 1);
    });
    return map;
  }, [documents]);

  return (
    <div className="w-full">
      <div className="mb-6">
        <h1 className="text-xl font-semibold flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Cấu hình cấu trúc <span className="text-sm font-normal text-muted-foreground">(Structure Config)</span>
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Quản lý giai đoạn, danh mục và loại tài liệu</p>
      </div>

      {/* Template selector */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row md:items-center gap-3">
            <div className="flex-1">
              <p className="text-sm font-medium">Template cấu trúc (Templates)</p>
              <p className="text-xs text-muted-foreground mt-0.5">Baseline (default) + custom templates cho dự án mới</p>
            </div>
            <div className="flex items-center gap-2">
              <Select value={selectedTemplateId} onValueChange={setSelectedTemplateId}>
                <SelectTrigger className="w-[260px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {templates.map(t => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name}{t.id === activeTemplateId ? ' (Baseline)' : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button size="sm" variant="outline" onClick={() => {
                setRenameForm({ name: activeTemplate.name, description: activeTemplate.description || '' });
                setShowRenameTemplate(true);
              }}>Đổi tên</Button>
              <Button size="sm" className="gap-1.5" onClick={() => {
                setTemplateForm({ name: '', description: '', baseTemplateId: selectedTemplateId });
                setShowCreateTemplate(true);
              }}>
                <Plus className="h-3.5 w-3.5" /> Tạo template
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="phases">
        <TabsList>
          <TabsTrigger value="phases" className="gap-1.5"><Layers className="h-3.5 w-3.5" /> Giai đoạn</TabsTrigger>
          <TabsTrigger value="categories" className="gap-1.5"><LayoutList className="h-3.5 w-3.5" /> Danh mục</TabsTrigger>
          <TabsTrigger value="doctypes" className="gap-1.5"><FileType className="h-3.5 w-3.5" /> Loại tài liệu</TabsTrigger>
        </TabsList>

        {/* Phases */}
        <TabsContent value="phases" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Giai đoạn dự án (Project Phases)</CardTitle>
              <p className="text-xs text-muted-foreground">4 giai đoạn cố định. Chỉ có thể sắp xếp lại.</p>
            </CardHeader>
            <CardContent className="space-y-2">
              {phaseOrder.map((phase, i) => (
                <div key={phase} className="flex items-center gap-3 p-3 border rounded-lg bg-secondary/30">
                  <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                  <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold bg-primary/10 text-primary">{i + 1}</span>
                  <span className="font-medium text-sm">{PHASE_LABELS[phase]}</span>
                  <span className="text-xs text-muted-foreground">({phase})</span>
                  <Badge variant="outline" className="ml-auto text-xs">Cố định</Badge>
                </div>
              ))}
              
            </CardContent>
          </Card>
        </TabsContent>

        {/* Categories */}
        <TabsContent value="categories" className="mt-4">
          <div className="flex items-center justify-between mb-4">
            <Select value={selectedPhase} onValueChange={v => setSelectedPhase(v as Phase)}>
              <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
              <SelectContent>
                {PHASES.map(p => <SelectItem key={p} value={p}>{PHASE_LABELS[p]}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button size="sm" className="gap-1.5" onClick={() => { setNewValue(''); setShowAddCategory(true); }}>
              <Plus className="h-3.5 w-3.5" /> Thêm danh mục
            </Button>
          </div>
          <Card>
            <CardContent className="p-4 space-y-2">
              {(activeTemplate.categoriesByPhase[selectedPhase] || []).map((cat) => {
                const count = docsByCat.get(`${selectedPhase}::${cat.name}`) || 0;
                return (
                  <div key={cat.id} className="flex items-center gap-3 p-3 border rounded-lg">
                    <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{cat.name}</span>
                        {count > 0 && (
                          <Badge variant="outline" className="text-[10px]">{count} docs</Badge>
                        )}
                        {!cat.enabled && <Badge variant="secondary" className="text-[10px]">Disabled</Badge>}
                      </div>
                      {count > 0 && !cat.enabled && (
                        <p className="text-[11px] text-muted-foreground mt-1">⚠️ Category đang có tài liệu. POC: chỉ disable ở template, không xoá khỏi dự án hiện tại.</p>
                      )}
                    </div>
                    <Switch checked={cat.enabled} onCheckedChange={(checked) => toggleCategory(selectedPhase, cat.name, checked, selectedTemplateId)} />
                  </div>
                );
              })}
            </CardContent>
          </Card>
          <Dialog open={showAddCategory} onOpenChange={setShowAddCategory}>
            <DialogContent>
              <DialogHeader><DialogTitle>Thêm danh mục mới</DialogTitle></DialogHeader>
              <div className="space-y-2 py-4">
                <Label>Tên danh mục</Label>
                <Input value={newValue} onChange={e => setNewValue(e.target.value)} />
              </div>
              <DialogFooter>
                <DialogClose asChild><Button variant="outline">Hủy</Button></DialogClose>
                <Button disabled={!newValue.trim()} onClick={() => {
                  addCategory(selectedPhase, newValue.trim(), selectedTemplateId);
                  setShowAddCategory(false);
                }}>Thêm</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>

        {/* Doc Types */}
        <TabsContent value="doctypes" className="mt-4">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-muted-foreground">{docTypes.length} loại tài liệu</p>
            <Button size="sm" className="gap-1.5" onClick={() => { setNewValue(''); setShowAddDocType(true); }}>
              <Plus className="h-3.5 w-3.5" /> Thêm loại
            </Button>
          </div>
          <Card>
            <CardContent className="p-4 space-y-2">
              {docTypes.map(dt => (
                <div key={dt.id} className="flex items-center gap-3 p-3 border rounded-lg">
                  <span className="text-sm font-medium flex-1">{dt.name}</span>
                  {dt.isDefault && <Badge variant="secondary" className="text-xs">Mặc định</Badge>}
                  {dt.requiresAdminApproval && <Badge variant="outline" className="text-xs">Cần duyệt</Badge>}
                  <Switch checked={dt.enabled} onCheckedChange={checked => toggleDocType(dt.name, checked)} />
                </div>
              ))}
            </CardContent>
          </Card>
          <Dialog open={showAddDocType} onOpenChange={setShowAddDocType}>
            <DialogContent>
              <DialogHeader><DialogTitle>Thêm loại tài liệu mới</DialogTitle></DialogHeader>
              <div className="space-y-2 py-4">
                <Label>Tên loại</Label>
                <Input value={newValue} onChange={e => setNewValue(e.target.value)} />
              </div>
              <DialogFooter>
                <DialogClose asChild><Button variant="outline">Hủy</Button></DialogClose>
                <Button disabled={!newValue.trim()} onClick={() => {
                  addDocType(newValue.trim());
                  setShowAddDocType(false);
                }}>Thêm</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>
      </Tabs>

      {/* Create template */}
      <Dialog open={showCreateTemplate} onOpenChange={setShowCreateTemplate}>
        <DialogContent>
          <DialogHeader><DialogTitle>Tạo template mới</DialogTitle></DialogHeader>
          <div className="space-y-3 py-4">
            <div className="space-y-2">
              <Label>Tên template *</Label>
              <Input value={templateForm.name} onChange={e => setTemplateForm(s => ({ ...s, name: e.target.value }))} placeholder="e.g., CGI Standard" />
            </div>
            <div className="space-y-2">
              <Label>Mô tả</Label>
              <Input value={templateForm.description} onChange={e => setTemplateForm(s => ({ ...s, description: e.target.value }))} placeholder="Optional" />
            </div>
            <div className="space-y-2">
              <Label>Base template</Label>
              <Select value={templateForm.baseTemplateId} onValueChange={(v) => setTemplateForm(s => ({ ...s, baseTemplateId: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {templates.map(t => (
                    <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-[11px] text-muted-foreground">POC: tạo template bằng cách clone categories theo phase</p>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Hủy</Button></DialogClose>
            <Button
              disabled={!templateForm.name.trim()}
              onClick={() => {
                const t = createTemplate({
                  name: templateForm.name.trim(),
                  description: templateForm.description.trim() || undefined,
                  baseTemplateId: templateForm.baseTemplateId,
                });
                setSelectedTemplateId(t.id);
                setShowCreateTemplate(false);
              }}
            >Tạo</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rename template */}
      <Dialog open={showRenameTemplate} onOpenChange={setShowRenameTemplate}>
        <DialogContent>
          <DialogHeader><DialogTitle>Chỉnh sửa template</DialogTitle></DialogHeader>
          <div className="space-y-3 py-4">
            <div className="space-y-2">
              <Label>Tên template *</Label>
              <Input value={renameForm.name} onChange={e => setRenameForm(s => ({ ...s, name: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Mô tả</Label>
              <Input value={renameForm.description} onChange={e => setRenameForm(s => ({ ...s, description: e.target.value }))} />
            </div>
            {selectedTemplateId === activeTemplateId && (
              <p className="text-xs text-muted-foreground">Baseline template: dùng làm mặc định. Bạn vẫn có thể chỉnh categories/doctype trong POC.</p>
            )}
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Đóng</Button></DialogClose>
            <Button
              disabled={!renameForm.name.trim()}
              onClick={() => {
                renameTemplate(selectedTemplateId, {
                  name: renameForm.name.trim(),
                  description: renameForm.description.trim() || undefined,
                });
                setShowRenameTemplate(false);
              }}
            >Lưu</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
