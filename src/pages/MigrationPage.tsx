import { useState } from 'react';
import { FolderOpen, ArrowRight, Check, AlertTriangle, Cloud, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PHASES, PHASE_LABELS, Phase } from '@/data/mock-data';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';

const MOCK_DRIVE_FOLDERS = [
  { id: 'gd1', name: 'VGP Project Files', files: 24 },
  { id: 'gd2', name: 'Masterise Lumière Assets', files: 18 },
  { id: 'gd3', name: 'Client Contracts 2024', files: 7 },
  { id: 'gd4', name: 'Shared/Miscellaneous', files: 42 },
];

export default function MigrationPage() {
  const { projects, getProjectById, getCategoriesForProjectPhase, runMigrationImport } = useData();
  const { userName, isAdmin } = useAuth();
  if (!isAdmin) {
    return <div className="text-center py-20 text-muted-foreground">🔒 Insufficient permission</div>;
  }
  const [step, setStep] = useState(0); // 0=connect, 1=select, 2=map, 3=preview, 4=done
  const [selectedFolder, setSelectedFolder] = useState('');
  const [mapping, setMapping] = useState({ project: '', phase: '' as string, category: '' });
  const [importSummary, setImportSummary] = useState<{ created: number; warnings: string[] } | null>(null);

  const folder = MOCK_DRIVE_FOLDERS.find(f => f.id === selectedFolder);
  const project = mapping.project ? getProjectById(mapping.project) : undefined;
  const categories = mapping.phase && mapping.project ? (getCategoriesForProjectPhase(mapping.project, mapping.phase as Phase) || []) : [];

  const mockFilesForFolder = (folderId: string) => {
    const base = folderId === 'gd1' ? 'VGP Project Files' :
      folderId === 'gd2' ? 'Masterise Lumière Assets' :
      folderId === 'gd3' ? 'Client Contracts 2024' : 'Shared/Miscellaneous';
    const count = MOCK_DRIVE_FOLDERS.find(f => f.id === folderId)?.files || 0;
    return Array.from({ length: Math.min(count, 25) }).map((_, i) => `${base}/File_${String(i + 1).padStart(2, '0')}.pdf`);
  };

  return (
    <div className="w-full">
      <div className="mb-6">
        <h1 className="text-xl font-semibold flex items-center gap-2">
          <Cloud className="h-5 w-5" />
          Di chuyển dữ liệu <span className="text-sm font-normal text-muted-foreground">(Data Migration)</span>
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Import dữ liệu từ Google Drive vào hệ thống</p>
      </div>

      {/* Step indicators */}
      <div className="flex items-center gap-2 mb-6">
        {['Kết nối', 'Chọn thư mục', 'Ánh xạ', 'Xem trước', 'Hoàn tất'].map((s, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-medium ${
              step > i ? 'bg-primary text-primary-foreground' :
              step === i ? 'bg-primary text-primary-foreground' :
              'bg-muted text-muted-foreground'
            }`}>
              {step > i ? <Check className="h-3.5 w-3.5" /> : i + 1}
            </div>
            <span className={`text-xs ${step === i ? 'font-medium' : 'text-muted-foreground'} hidden sm:inline`}>{s}</span>
            {i < 4 && <ChevronRight className="h-3 w-3 text-muted-foreground" />}
          </div>
        ))}
      </div>

      {/* Step 0: Connect */}
      {step === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Cloud className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" />
            <h2 className="text-lg font-medium">Kết nối Google Drive</h2>
            <p className="text-sm text-muted-foreground mt-1 mb-6">Liên kết tài khoản Google Drive để bắt đầu import</p>
            <Button className="gap-2" onClick={() => setStep(1)}>
              <Cloud className="h-4 w-4" /> Connect Google Drive
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Step 1: Select folder */}
      {step === 1 && (
        <Card>
          <CardHeader><CardTitle className="text-sm">Chọn thư mục nguồn (Select Source Folder)</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {MOCK_DRIVE_FOLDERS.map(f => (
              <div
                key={f.id}
                className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                  selectedFolder === f.id ? 'border-primary bg-primary/5' : 'hover:bg-accent/50'
                }`}
                onClick={() => setSelectedFolder(f.id)}
              >
                <FolderOpen className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium flex-1">{f.name}</span>
                <Badge variant="secondary" className="text-xs">{f.files} files</Badge>
              </div>
            ))}
            <div className="flex justify-end mt-4">
              <Button disabled={!selectedFolder} onClick={() => setStep(2)} className="gap-1.5">
                Tiếp theo <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Map */}
      {step === 2 && (
        <Card>
          <CardHeader><CardTitle className="text-sm">Ánh xạ thư mục (Map to Structure)</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="p-3 bg-secondary/50 rounded-lg text-sm">
              <span className="text-muted-foreground">Nguồn:</span> <span className="font-medium ml-1">{folder?.name}</span>
              <span className="text-muted-foreground ml-3">({folder?.files} files)</span>
            </div>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Dự án đích *</label>
                <Select value={mapping.project} onValueChange={v => setMapping(m => ({ ...m, project: v }))}>
                  <SelectTrigger><SelectValue placeholder="Chọn dự án" /></SelectTrigger>
                  <SelectContent>{projects.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Giai đoạn *</label>
                <Select value={mapping.phase} onValueChange={v => setMapping(m => ({ ...m, phase: v, category: '' }))}>
                  <SelectTrigger><SelectValue placeholder="Chọn giai đoạn" /></SelectTrigger>
                  <SelectContent>{PHASES.map(p => <SelectItem key={p} value={p}>{PHASE_LABELS[p]}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Danh mục *</label>
                <Select value={mapping.category} onValueChange={v => setMapping(m => ({ ...m, category: v }))} disabled={!mapping.phase}>
                  <SelectTrigger><SelectValue placeholder="Chọn danh mục" /></SelectTrigger>
                  <SelectContent>{categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-between mt-4">
              <Button variant="outline" onClick={() => setStep(1)}>Quay lại</Button>
              <Button disabled={!mapping.project || !mapping.phase || !mapping.category} onClick={() => setStep(3)} className="gap-1.5">
                Xem trước <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Preview */}
      {step === 3 && (
        <Card>
          <CardHeader><CardTitle className="text-sm">Xem trước kết quả (Preview)</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-secondary/50 rounded-lg p-4 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Nguồn:</span><span>{folder?.name}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Số tệp:</span><span className="font-medium">{folder?.files}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Dự án:</span><span>{project?.name}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Giai đoạn:</span><span>{PHASE_LABELS[mapping.phase as Phase]}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Danh mục:</span><span>{mapping.category}</span></div>
            </div>
            <div className="flex items-center gap-2 p-3 bg-[hsl(var(--warning)/0.1)] rounded-lg text-sm">
              <AlertTriangle className="h-4 w-4 text-[hsl(var(--warning))] shrink-0" />
              <span>Tệp import sẽ được gán trạng thái "Draft" và nhãn "Imported" (POC)</span>
            </div>
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(2)}>Quay lại</Button>
              <Button
                onClick={() => {
                  const files = mockFilesForFolder(selectedFolder);
                  const res = runMigrationImport(
                    {
                      projectId: mapping.project,
                      items: files.map((sourcePath) => ({
                        sourcePath,
                        phase: mapping.phase as Phase,
                        category: mapping.category,
                        docType: 'Other',
                      })),
                    },
                    userName
                  );
                  setImportSummary(res);
                  setStep(4);
                }}
                className="gap-1.5"
              >
                <Check className="h-3.5 w-3.5" /> Thực hiện import
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Done */}
      {step === 4 && (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="h-12 w-12 rounded-full bg-[hsl(var(--success)/0.1)] flex items-center justify-center mx-auto mb-4">
              <Check className="h-6 w-6 text-[hsl(var(--success))]" />
            </div>
            <h2 className="text-lg font-medium">Import hoàn tất!</h2>
            <p className="text-sm text-muted-foreground mt-1">{importSummary?.created ?? folder?.files} tệp đã được import vào hệ thống với trạng thái "Draft"</p>
            {importSummary?.warnings?.length ? (
              <div className="mt-4 text-left max-w-xl mx-auto">
                <p className="text-xs font-medium text-muted-foreground">Warnings</p>
                <ul className="text-xs text-muted-foreground list-disc pl-5 mt-1">
                  {importSummary.warnings.slice(0, 5).map((w, i) => <li key={i}>{w}</li>)}
                </ul>
              </div>
            ) : null}
            <Button variant="outline" className="mt-6" onClick={() => setStep(0)}>Import thêm</Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
