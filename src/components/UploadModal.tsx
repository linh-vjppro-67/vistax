import { useEffect, useMemo, useState } from 'react';
import { PHASES, Phase, DocStatus, STATUS_LABELS, PHASE_LABELS, canEditPhase } from '@/data/mock-data';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, FileUp, ChevronRight, Check, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UploadModalProps {
  open: boolean;
  onClose: () => void;
  projectId: string;
  defaultPhase?: Phase;
  defaultCategory?: string;
  defaultDocType?: string;
}

function todayISO() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export default function UploadModal({ open, onClose, projectId, defaultPhase, defaultCategory, defaultDocType }: UploadModalProps) {
  const { role, userName } = useAuth();
  const { getProjectById, getCategoriesForProjectPhase, uploadDocument, docTypes, taxonomy } = useData();
  const [step, setStep] = useState(1);
  const [file, setFile] = useState<File | null>(null);
  const [form, setForm] = useState({
    title: '',
    phase: defaultPhase || '' as string,
    category: defaultCategory || '',
    docType: defaultDocType || '',
    owner: '',
    status: 'Draft' as DocStatus,
    date: todayISO(),
    versionNote: '',
    projectType: '',
    clientType: '',
    deliverableType: '',
  });

  const [errors, setErrors] = useState<Record<string, boolean>>({});

  const project = useMemo(() => getProjectById(projectId), [getProjectById, projectId]);
  const categories = form.phase ? (getCategoriesForProjectPhase(projectId, form.phase as Phase) || []) : [];

  // When opening the dialog, apply defaults (phase/category/docType) again.
  useEffect(() => {
    if (!open) return;
    setStep(1);
    setFile(null);
    setErrors({});
    setForm((prev) => ({
      ...prev,
      phase: defaultPhase || prev.phase || 'Sale',
      category: defaultCategory || prev.category,
      docType: defaultDocType || prev.docType,
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, projectId, defaultPhase, defaultCategory, defaultDocType]);

  const enabledDocTypes = useMemo(() => docTypes.filter(d => d.enabled).map(d => d.name), [docTypes]);
  const enabledProjectTypes = taxonomy.projectTypes.filter(t => t.enabled);
  const enabledClientTypes = taxonomy.clientTypes.filter(t => t.enabled);
  const enabledDeliverableTypes = taxonomy.deliverableTypes.filter(t => t.enabled);

  const canUploadForPhase = form.phase ? canEditPhase(role, form.phase as Phase) : true;

  const validate = () => {
    const required = ['title', 'phase', 'category', 'docType', 'owner', 'status', 'date'];
    const newErrors: Record<string, boolean> = {};
    required.forEach(field => {
      if (!form[field as keyof typeof form]) newErrors[field] = true;
    });
    if (!file) newErrors['file'] = true;
    if (form.phase && !canUploadForPhase) newErrors['phase'] = true;
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && !file) {
      setErrors({ file: true });
      return;
    }
    if (step === 2 && !validate()) return;
    setStep(s => s + 1);
  };

  const handleSubmit = () => {
    if (!validate()) {
      setStep(2);
      return;
    }
    if (!project) {
      onClose();
      return;
    }

    uploadDocument({
      projectId,
      fileName: file?.name || 'Untitled',
      title: form.title,
      phase: form.phase as Phase,
      category: form.category,
      docType: form.docType,
      owner: form.owner,
      status: form.status,
      versionNote: form.versionNote,
      date: form.date,
      tags: {
        projectType: form.projectType || project.projectType,
        clientType: form.clientType || 'Other',
        deliverableType: form.deliverableType || 'Document',
      },
      uploadedBy: userName,
    });

    onClose();
    setStep(1);
    setFile(null);
    setForm({ title: '', phase: defaultPhase || '', category: defaultCategory || '', docType: '', owner: '', status: 'Draft', date: todayISO(), versionNote: '', projectType: '', clientType: '', deliverableType: '' });
  };

  const steps = ['Chọn tệp', 'Metadata', 'Xác nhận'];

  useEffect(() => {
    // Reset defaults when opening from a new context
    if (!open) return;
    setStep(1);
    setFile(null);
    setErrors({});
    setForm((f) => ({
      ...f,
      phase: defaultPhase || f.phase,
      category: defaultCategory || (defaultPhase ? '' : f.category),
      date: todayISO(),
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, defaultPhase, defaultCategory, projectId]);

  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Tải lên tài liệu (Upload Document)</DialogTitle>
        </DialogHeader>

        {/* Stepper */}
        <div className="flex items-center gap-2 mb-4">
          {steps.map((s, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className={cn(
                'h-7 w-7 rounded-full flex items-center justify-center text-xs font-medium',
                step > i + 1 ? 'bg-primary text-primary-foreground' :
                step === i + 1 ? 'bg-primary text-primary-foreground' :
                'bg-muted text-muted-foreground'
              )}>
                {step > i + 1 ? <Check className="h-3.5 w-3.5" /> : i + 1}
              </div>
              <span className={cn('text-xs', step === i + 1 ? 'font-medium' : 'text-muted-foreground')}>{s}</span>
              {i < 2 && <ChevronRight className="h-3 w-3 text-muted-foreground" />}
            </div>
          ))}
        </div>

        {/* Step 1: File */}
        {step === 1 && (
          <div
            className={cn(
              'border-2 border-dashed rounded-lg p-10 text-center transition-colors cursor-pointer',
              file ? 'border-primary/50 bg-primary/5' : errors.file ? 'border-destructive' : 'border-border hover:border-primary/30'
            )}
            onClick={() => document.getElementById('file-input')?.click()}
          >
            <input id="file-input" type="file" className="hidden" onChange={e => { setFile(e.target.files?.[0] || null); setErrors({}); }} />
            {file ? (
              <div>
                <FileUp className="h-8 w-8 mx-auto text-primary mb-2" />
                <p className="font-medium">{file.name}</p>
                <p className="text-xs text-muted-foreground mt-1">{(file.size / 1024).toFixed(1)} KB</p>
              </div>
            ) : (
              <div>
                <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm font-medium">Kéo thả tệp hoặc nhấn để chọn</p>
                <p className="text-xs text-muted-foreground mt-1">Drag & drop or click to select</p>
              </div>
            )}
            {errors.file && <p className="text-xs text-destructive mt-2 flex items-center justify-center gap-1"><AlertCircle className="h-3 w-3" /> Vui lòng chọn tệp</p>}
          </div>
        )}

        {/* Step 2: Metadata */}
        {step === 2 && (
          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
            <div className="space-y-1.5">
              <Label>Tên tài liệu *</Label>
              <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className={errors.title ? 'border-destructive' : ''} />
              {errors.title && <p className="text-xs text-destructive">Bắt buộc</p>}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Giai đoạn *</Label>
                <Select value={form.phase} onValueChange={v => setForm(f => ({ ...f, phase: v, category: '' }))}>
                  <SelectTrigger className={errors.phase ? 'border-destructive' : ''}><SelectValue placeholder="Chọn" /></SelectTrigger>
                  <SelectContent>{PHASES.map(p => <SelectItem key={p} value={p}>{PHASE_LABELS[p]}</SelectItem>)}</SelectContent>
                </Select>
                {form.phase && !canEditPhase(role, form.phase as Phase) && (
                  <p className="text-xs text-destructive">Bạn không có quyền upload ở giai đoạn này</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label>Danh mục *</Label>
                <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v }))} disabled={!form.phase}>
                  <SelectTrigger className={errors.category ? 'border-destructive' : ''}><SelectValue placeholder="Chọn" /></SelectTrigger>
                  <SelectContent>{categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Loại tài liệu *</Label>
                <Select value={form.docType} onValueChange={v => setForm(f => ({ ...f, docType: v }))}>
                  <SelectTrigger className={errors.docType ? 'border-destructive' : ''}><SelectValue placeholder="Chọn" /></SelectTrigger>
                  <SelectContent>
                    {enabledDocTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Người sở hữu *</Label>
                <Input value={form.owner} onChange={e => setForm(f => ({ ...f, owner: e.target.value }))} className={errors.owner ? 'border-destructive' : ''} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Ngày *</Label>
                <Input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} className={errors.date ? 'border-destructive' : ''} />
              </div>
              <div className="space-y-1.5">
                <Label>Phiên bản (Version)</Label>
                <Input value="v1" disabled />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Trạng thái</Label>
              <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v as DocStatus }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(['Draft', 'Shared', 'Final', 'Archived'] as DocStatus[]).map(s => (
                    <SelectItem key={s} value={s}>{STATUS_LABELS[s]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Ghi chú phiên bản</Label>
              <Textarea value={form.versionNote} onChange={e => setForm(f => ({ ...f, versionNote: e.target.value }))} rows={2} />
            </div>
            <div className="border-t pt-3 mt-3">
              <p className="text-xs font-medium text-muted-foreground mb-2">Taxonomy Tags</p>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Loại dự án</Label>
                  <Select value={form.projectType} onValueChange={v => setForm(f => ({ ...f, projectType: v }))}>
                    <SelectTrigger className="h-8"><SelectValue placeholder="—" /></SelectTrigger>
                    <SelectContent>{enabledProjectTypes.map(t => <SelectItem key={t.id} value={t.value}>{t.value}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Loại KH</Label>
                  <Select value={form.clientType} onValueChange={v => setForm(f => ({ ...f, clientType: v }))}>
                    <SelectTrigger className="h-8"><SelectValue placeholder="—" /></SelectTrigger>
                    <SelectContent>{enabledClientTypes.map(t => <SelectItem key={t.id} value={t.value}>{t.value}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Loại SP</Label>
                  <Select value={form.deliverableType} onValueChange={v => setForm(f => ({ ...f, deliverableType: v }))}>
                    <SelectTrigger className="h-8"><SelectValue placeholder="—" /></SelectTrigger>
                    <SelectContent>{enabledDeliverableTypes.map(t => <SelectItem key={t.id} value={t.value}>{t.value}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Review */}
        {step === 3 && (
          <div className="space-y-3">
            <div className="bg-secondary rounded-lg p-4 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Tệp:</span><span className="font-medium">{file?.name}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Tên:</span><span>{form.title}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Giai đoạn:</span><span>{PHASE_LABELS[form.phase as Phase]}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Danh mục:</span><span>{form.category}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Loại:</span><span>{form.docType}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Người sở hữu:</span><span>{form.owner}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Trạng thái:</span><span>{STATUS_LABELS[form.status]}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Ngày:</span><span>{form.date}</span></div>
            </div>
            <p className="text-xs text-muted-foreground">Nhấn "Tải lên" để hoàn tất. (Click "Upload" to confirm)</p>
          </div>
        )}

        <DialogFooter className="gap-2">
          {step > 1 && <Button variant="outline" onClick={() => setStep(s => s - 1)}>Quay lại</Button>}
          {step < 3 ? (
            <Button onClick={handleNext}>Tiếp theo</Button>
          ) : (
            <Button onClick={handleSubmit} className="gap-1.5"><Upload className="h-3.5 w-3.5" /> Tải lên</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
