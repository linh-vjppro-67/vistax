import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import {
  Bot, Sparkles, Database, MessageSquare,
  Loader2, CheckCircle2, ChevronRight,
  FileText, Send, Building2, TrendingUp,
  Zap, FileSearch, ClipboardList, AlertTriangle,
  ThumbsUp, BarChart2, FolderOpen, RefreshCw,
  BookOpen, Info
} from 'lucide-react';

// ══════════════════════════════════════════════════════════════════════════════
// DATA — Tài liệu nội bộ VistaX
// ══════════════════════════════════════════════════════════════════════════════

export interface InternalDoc {
  id: string;
  projectId: string;
  projectName: string;
  client: string;
  type: string; // CGI / Animation / 360
  title: string;
  phase: 'Sale' | 'Planning' | 'Execution' | 'Closing';
  category: string;
  status: 'Final' | 'Shared' | 'Draft';
  tokens: number; // ký tự giả lập để show "đang đọc"
}

const ALL_DOCS: InternalDoc[] = [
  { id: 'd1',  projectId: 'p1', projectName: 'Vinhomes Grand Park', client: 'Vinhomes',       type: 'CGI',       title: 'Project Brief - VGP CGI',             phase: 'Sale',      category: 'Client Brief',          status: 'Final',  tokens: 1840 },
  { id: 'd2',  projectId: 'p1', projectName: 'Vinhomes Grand Park', client: 'Vinhomes',       type: 'CGI',       title: 'Solution Proposal - VGP',             phase: 'Sale',      category: 'Solution Proposal',     status: 'Shared', tokens: 3200 },
  { id: 'd3',  projectId: 'p1', projectName: 'Vinhomes Grand Park', client: 'Vinhomes',       type: 'CGI',       title: 'Service Contract - VGP',              phase: 'Sale',      category: 'Contract',              status: 'Final',  tokens: 2600 },
  { id: 'd4',  projectId: 'p1', projectName: 'Vinhomes Grand Park', client: 'Vinhomes',       type: 'CGI',       title: 'Project Charter - VGP',               phase: 'Planning',  category: 'Project Charter',       status: 'Final',  tokens: 2100 },
  { id: 'd5',  projectId: 'p1', projectName: 'Vinhomes Grand Park', client: 'Vinhomes',       type: 'CGI',       title: 'Project Execution Plan - VGP',        phase: 'Planning',  category: 'Project Execution Plan',status: 'Draft',  tokens: 1500 },
  { id: 'd6',  projectId: 'p1', projectName: 'Vinhomes Grand Park', client: 'Vinhomes',       type: 'CGI',       title: 'CGI Renders - Lobby',                 phase: 'Execution', category: 'Deliverables',          status: 'Shared', tokens: 800  },
  { id: 'd7',  projectId: 'p2', projectName: 'Masterise Lumière',   client: 'Masterise Homes',type: 'Animation', title: 'Animation Brief – Lumière',           phase: 'Sale',      category: 'Client Brief',          status: 'Final',  tokens: 2200 },
  { id: 'd8',  projectId: 'p2', projectName: 'Masterise Lumière',   client: 'Masterise Homes',type: 'Animation', title: 'Storyboard – Lumière Flythrough',     phase: 'Execution', category: 'Deliverables',          status: 'Draft',  tokens: 950  },
  { id: 'd9',  projectId: 'p3', projectName: 'Novaland 360 Tour',   client: 'Novaland',       type: '360',       title: 'Project Brief - Novaland 360',        phase: 'Sale',      category: 'Client Brief',          status: 'Final',  tokens: 1700 },
  { id: 'd10', projectId: 'p3', projectName: 'Novaland 360 Tour',   client: 'Novaland',       type: '360',       title: 'Solution Proposal - 360 Tour',        phase: 'Sale',      category: 'Solution Proposal',     status: 'Final',  tokens: 3400 },
  { id: 'd11', projectId: 'p3', projectName: 'Novaland 360 Tour',   client: 'Novaland',       type: '360',       title: 'Contract - Novaland',                 phase: 'Sale',      category: 'Contract',              status: 'Final',  tokens: 2800 },
  { id: 'd12', projectId: 'p3', projectName: 'Novaland 360 Tour',   client: 'Novaland',       type: '360',       title: 'Project Charter - NVL',               phase: 'Planning',  category: 'Project Charter',       status: 'Final',  tokens: 2000 },
  { id: 'd13', projectId: 'p3', projectName: 'Novaland 360 Tour',   client: 'Novaland',       type: '360',       title: 'Execution Plan - NVL',                phase: 'Planning',  category: 'Project Execution Plan',status: 'Final',  tokens: 1900 },
  { id: 'd14', projectId: 'p3', projectName: 'Novaland 360 Tour',   client: 'Novaland',       type: '360',       title: '360 Renders - Showroom',              phase: 'Execution', category: 'Deliverables',          status: 'Final',  tokens: 700  },
  { id: 'd15', projectId: 'p3', projectName: 'Novaland 360 Tour',   client: 'Novaland',       type: '360',       title: 'Acceptance & Handover - NVL',         phase: 'Closing',   category: 'Acceptance & Handover', status: 'Final',  tokens: 1200 },
  { id: 'd16', projectId: 'p3', projectName: 'Novaland 360 Tour',   client: 'Novaland',       type: '360',       title: 'Post Mortem - NVL',                   phase: 'Closing',   category: 'Post Mortem',           status: 'Final',  tokens: 2500 },
];

const PROJECTS = [
  { id: 'p1', name: 'Vinhomes Grand Park', client: 'Vinhomes',       type: 'CGI',       status: 'Active',    color: 'text-orange-500 bg-orange-50' },
  { id: 'p2', name: 'Masterise Lumière',   client: 'Masterise Homes',type: 'Animation', status: 'Active',    color: 'text-purple-500 bg-purple-50' },
  { id: 'p3', name: 'Novaland 360 Tour',   client: 'Novaland',       type: '360',       status: 'Completed', color: 'text-green-500 bg-green-50'  },
];

// ══════════════════════════════════════════════════════════════════════════════
// SHARED TYPES
// ══════════════════════════════════════════════════════════════════════════════

export interface KnowledgeBase {
  indexedDocs: InternalDoc[];
  indexedAt: Date;
  totalTokens: number;
}

// ══════════════════════════════════════════════════════════════════════════════
// TOOL 1 — Crawl & Index tài liệu nội bộ
// ══════════════════════════════════════════════════════════════════════════════

const phaseColor: Record<string, string> = {
  Sale:      'text-orange-600 bg-orange-50 border-orange-200',
  Planning:  'text-teal-600   bg-teal-50   border-teal-200',
  Execution: 'text-purple-600 bg-purple-50 border-purple-200',
  Closing:   'text-green-600  bg-green-50  border-green-200',
};
const statusColor: Record<string, string> = {
  Final:  'bg-green-100 text-green-700',
  Shared: 'bg-blue-100  text-blue-700',
  Draft:  'bg-gray-100  text-gray-500',
};

function CrawlIndexTool({ onIndexed }: { onIndexed: (kb: KnowledgeBase) => void }) {
  const [selectedProjects, setSelectedProjects] = useState<string[]>(['p1', 'p2', 'p3']);
  const [running, setRunning] = useState(false);
  const [indexedIds, setIndexedIds] = useState<string[]>([]);
  const [done, setDone] = useState(false);
  const [kb, setKb] = useState<KnowledgeBase | null>(null);

  const toggleProject = (id: string) => {
    if (running || done) return;
    setSelectedProjects(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const targetDocs = ALL_DOCS.filter(d => selectedProjects.includes(d.projectId));

  const runCrawl = async () => {
    if (running || selectedProjects.length === 0) return;
    setRunning(true);
    setIndexedIds([]);
    setDone(false);

    for (const doc of targetDocs) {
      await new Promise(r => setTimeout(r, 280 + Math.random() * 200));
      setIndexedIds(prev => [...prev, doc.id]);
    }

    const result: KnowledgeBase = {
      indexedDocs: targetDocs,
      indexedAt: new Date(),
      totalTokens: targetDocs.reduce((s, d) => s + d.tokens, 0),
    };
    setKb(result);
    setDone(true);
    setRunning(false);
    onIndexed(result);
  };

  const reset = () => {
    setIndexedIds([]);
    setDone(false);
    setKb(null);
    setRunning(false);
    setSelectedProjects(['p1', 'p2', 'p3']);
  };

  return (
    <div className="space-y-4">
      {/* Hướng dẫn */}
      <div className="flex items-start gap-2 px-3 py-2.5 bg-blue-50 border border-blue-100 rounded-xl">
        <Info className="h-3.5 w-3.5 text-blue-500 shrink-0 mt-0.5" />
        <p className="text-[12px] text-blue-800 leading-relaxed">
          Bước 1: Chọn dự án cần index → Bấm <strong>Crawl & Index</strong>. AI sẽ đọc toàn bộ tài liệu nội bộ và đưa vào knowledge base để dùng cho RAG (Tool 2).
        </p>
      </div>

      {/* Chọn project */}
      <div>
        <p className="text-xs font-medium text-muted-foreground mb-2">Chọn dự án cần crawl tài liệu:</p>
        <div className="grid grid-cols-3 gap-2">
          {PROJECTS.map(proj => {
            const docCount = ALL_DOCS.filter(d => d.projectId === proj.id).length;
            const isSelected = selectedProjects.includes(proj.id);
            return (
              <button key={proj.id} onClick={() => toggleProject(proj.id)} disabled={running || done}
                className={cn(
                  'flex flex-col items-start gap-1.5 p-3 rounded-xl border-2 text-left transition-all',
                  isSelected
                    ? 'border-primary bg-primary/5'
                    : 'border-border bg-card opacity-50'
                )}>
                <div className="flex items-center gap-1.5 w-full">
                  <Building2 className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <span className="text-xs font-semibold truncate flex-1">{proj.client}</span>
                  {isSelected && <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" />}
                </div>
                <p className="text-[10px] text-muted-foreground">{proj.type} · {docCount} tài liệu</p>
                <Badge className={cn('text-[9px] px-1.5 border-0',
                  proj.status === 'Completed' ? 'bg-gray-100 text-gray-600' : 'bg-green-100 text-green-700'
                )}>{proj.status}</Badge>
              </button>
            );
          })}
        </div>
      </div>

      {/* Nút hành động */}
      {!done ? (
        <Button onClick={runCrawl} disabled={running || selectedProjects.length === 0}
          className="w-full gap-2">
          {running
            ? <><Loader2 className="h-4 w-4 animate-spin" /> Đang crawl & index...</>
            : <><Database className="h-4 w-4" /> Crawl & Index {targetDocs.length} tài liệu</>}
        </Button>
      ) : (
        <Button variant="outline" onClick={reset} className="w-full gap-2">
          <RefreshCw className="h-4 w-4" /> Index lại
        </Button>
      )}

      {/* Progress — danh sách tài liệu đang được đọc */}
      {(running || done) && (
        <div className="border rounded-xl overflow-hidden">
          <div className="px-3 py-2 bg-muted/40 border-b flex items-center justify-between">
            <p className="text-xs font-medium flex items-center gap-1.5">
              <FileSearch className="h-3.5 w-3.5 text-primary" />
              {done ? 'Đã index xong' : 'Đang đọc tài liệu...'}
            </p>
            <span className="text-xs text-muted-foreground">
              {indexedIds.length}/{targetDocs.length} files
            </span>
          </div>
          <div className="divide-y max-h-64 overflow-y-auto">
            {targetDocs.map(doc => {
              const isIndexed = indexedIds.includes(doc.id);
              const isCurrentlyIndexing = running && indexedIds[indexedIds.length - 1] !== doc.id
                ? false
                : running && !isIndexed && indexedIds.length < targetDocs.indexOf(doc) + 1;
              // simpler: current = last item being processed
              const isCurrent = running && indexedIds.length === targetDocs.indexOf(doc);
              return (
                <div key={doc.id} className={cn(
                  'flex items-center gap-2.5 px-3 py-2 transition-all',
                  isIndexed ? 'bg-background' : 'opacity-35'
                )}>
                  {isIndexed ? (
                    <CheckCircle2 className="h-3.5 w-3.5 text-green-500 shrink-0" />
                  ) : isCurrent ? (
                    <Loader2 className="h-3.5 w-3.5 text-primary animate-spin shrink-0" />
                  ) : (
                    <div className="h-3.5 w-3.5 rounded-full border border-muted-foreground/30 shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-medium truncate">{doc.title}</p>
                    <p className="text-[10px] text-muted-foreground">{doc.projectName}</p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <Badge className={cn('text-[9px] px-1.5 border', phaseColor[doc.phase])}>
                      {doc.phase}
                    </Badge>
                    <Badge className={cn('text-[9px] px-1.5 border-0', statusColor[doc.status])}>
                      {doc.status}
                    </Badge>
                  </div>
                  {isIndexed && (
                    <span className="text-[10px] text-muted-foreground shrink-0">{doc.tokens.toLocaleString()} tokens</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Done summary */}
      {done && kb && (
        <div className="rounded-xl border bg-green-50 border-green-200 p-4 animate-in fade-in duration-300">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <p className="text-sm font-semibold text-green-800">Knowledge base đã sẵn sàng!</p>
          </div>
          <div className="grid grid-cols-3 gap-3 mb-3">
            <div className="bg-white/70 rounded-lg p-2.5 text-center">
              <p className="text-lg font-bold text-green-700">{kb.indexedDocs.length}</p>
              <p className="text-[10px] text-green-600">Tài liệu đã index</p>
            </div>
            <div className="bg-white/70 rounded-lg p-2.5 text-center">
              <p className="text-lg font-bold text-green-700">{selectedProjects.length}</p>
              <p className="text-[10px] text-green-600">Dự án</p>
            </div>
            <div className="bg-white/70 rounded-lg p-2.5 text-center">
              <p className="text-lg font-bold text-green-700">{(kb.totalTokens / 1000).toFixed(1)}K</p>
              <p className="text-[10px] text-green-600">Tokens</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 bg-green-100 rounded-lg px-3 py-2">
            <Sparkles className="h-3.5 w-3.5 text-green-600 shrink-0" />
            <p className="text-[12px] text-green-800">
              Chuyển sang <strong>Tool 2 – RAG Q&A</strong> để hỏi đáp về các tài liệu này.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// TOOL 2 — RAG Q&A (dùng knowledge base từ Tool 1)
// ══════════════════════════════════════════════════════════════════════════════

const RAG_ANSWERS: Array<{
  match: (q: string) => boolean;
  answer: string;
  sources: string[];
}> = [
  {
    match: q => /vinhomes|vgp|lobby|cgi/i.test(q),
    answer: '**Vinhomes Grand Park (VGP-2024-001)** đang ở phase **Execution**. Tổng 6 tài liệu: Brief (Final), Proposal (Shared — chưa Final dù Contract đã ký), Contract v3 (Final), Charter (Final), Execution Plan (Draft — cần hoàn thiện), CGI Lobby (Shared — chờ feedback client vòng 2).',
    sources: ['d1 · Project Brief - VGP CGI · Sale · Final', 'd3 · Service Contract - VGP · Sale · Final v3', 'd6 · CGI Renders - Lobby · Execution · Shared v2'],
  },
  {
    match: q => /masterise|lumière|lumiere|animation|storyboard/i.test(q),
    answer: '**Masterise Lumière (MLR-2024-002)** chỉ có 2 tài liệu. Brief (Final) và Storyboard (Draft — chưa approve). Thiếu hoàn toàn tài liệu Planning. Storyboard là blocker chính — production không thể bắt đầu cho đến khi được approve.',
    sources: ['d7 · Animation Brief – Lumière · Sale · Final', 'd8 · Storyboard – Lumière Flythrough · Execution · Draft'],
  },
  {
    match: q => /novaland|nvl|360|virtual/i.test(q),
    answer: '**Novaland 360 Tour (NVL-2024-003)** đã **Completed**. Toàn bộ 8 tài liệu Final từ Sale đến Closing — đây là dự án hoàn chỉnh nhất trong knowledge base. Post Mortem và Acceptance đều có. Rất phù hợp làm template cho proposal 360° mới.',
    sources: ['d10 · Solution Proposal - 360 Tour · Sale · Final', 'd15 · Acceptance & Handover · Closing · Final', 'd16 · Post Mortem - NVL · Closing · Final'],
  },
  {
    match: q => /proposal|đề xuất|solution/i.test(q),
    answer: 'Knowledge base có **2 Solution Proposal**: (1) **VGP Proposal** (d2) — Shared, chưa Final. Nên cập nhật trạng thái. (2) **NVL Proposal** (d10) — Final, là proposal thành công hoàn chỉnh nhất, có thể dùng làm mẫu. Masterise Lumière chưa có proposal — đây là điểm thiếu.',
    sources: ['d2 · Solution Proposal - VGP · Sale · Shared', 'd10 · Solution Proposal - 360 Tour · Sale · Final'],
  },
  {
    match: q => /contract|hợp đồng/i.test(q),
    answer: 'Tìm thấy **2 Contract Final**: (1) **VGP Contract** (d3) — v3, ký 28/01/2024. (2) **NVL Contract** (d11) — Final. Dự án Masterise Lumière **chưa có contract** trong knowledge base — đây là rủi ro cần kiểm tra ngay.',
    sources: ['d3 · Service Contract - VGP · Final v3', 'd11 · Contract - Novaland · Final'],
  },
  {
    match: q => /draft|chưa xong|chưa final|còn lại/i.test(q),
    answer: 'Trong knowledge base có **2 tài liệu Draft**: (1) **Execution Plan - VGP** (d5) — Planning phase của Vinhomes. (2) **Storyboard – Lumière** (d8) — Execution phase của Masterise, đây là blocker nghiêm trọng hơn vì đang chặn production.',
    sources: ['d5 · Project Execution Plan - VGP · Planning · Draft', 'd8 · Storyboard – Lumière Flythrough · Execution · Draft'],
  },
  {
    match: q => /brief/i.test(q),
    answer: 'Có **3 Client Brief Final** trong knowledge base: (1) **VGP Brief** (d1) — CGI, Vinhomes, v2. (2) **Lumière Brief** (d7) — Animation, Masterise, v1. (3) **NVL Brief** (d9) — 360°, Novaland. Tất cả đều là Developer client và đều Final.',
    sources: ['d1 · Project Brief - VGP CGI · Final', 'd7 · Animation Brief – Lumière · Final', 'd9 · Project Brief - Novaland 360 · Final'],
  },
  {
    match: q => /post.?mortem|bài học|lesson/i.test(q),
    answer: '**Post Mortem - NVL** (d16) là tài liệu duy nhất trong knowledge base. Đây là tài liệu tổng kết kinh nghiệm dự án 360° Virtual Tour của Novaland — bao gồm timeline thực tế, các vấn đề phát sinh và bài học. Nên đọc trước khi pitch dự án 360° mới.',
    sources: ['d16 · Post Mortem - NVL · Closing · Final · 2,500 tokens'],
  },
  {
    match: q => /tổng|bao nhiêu|thống kê|tất cả/i.test(q),
    answer: 'Knowledge base hiện tại chứa tổng cộng **16 tài liệu** từ 3 dự án. Phân loại theo status: Final: 12, Shared: 2, Draft: 2. Phân loại theo phase: Sale: 5 docs, Planning: 4 docs, Execution: 4 docs, Closing: 3 docs. Tổng ~28.4K tokens đã được index.',
    sources: ['Knowledge base · 3 projects · 16 documents · ~28.4K tokens'],
  },
  {
    match: () => true, // fallback
    answer: 'Tôi đã tìm trong knowledge base nhưng chưa khớp chính xác. Hãy thử hỏi về: tên dự án (Vinhomes, Masterise, Novaland), loại tài liệu (proposal, contract, brief, storyboard, post mortem), hoặc trạng thái (Draft, Final, Shared).',
    sources: [],
  },
];

function getRagAnswer(q: string) {
  return RAG_ANSWERS.find(a => a.match(q)) ?? RAG_ANSWERS[RAG_ANSWERS.length - 1];
}

interface ChatMsg { role: 'user' | 'assistant'; content: string; sources?: string[] }

const RAG_STEPS = [
  { icon: Database,   label: 'Tìm kiếm trong knowledge base đã index...', durationMs: 600 },
  { icon: FileSearch, label: 'So khớp ngữ nghĩa (vector search)...',       durationMs: 800 },
  { icon: Sparkles,   label: 'Tổng hợp câu trả lời từ context...',         durationMs: 650 },
];

function ProgressSteps({ steps, currentStep }: { steps: typeof RAG_STEPS; currentStep: number }) {
  return (
    <div className="space-y-1">
      {steps.map((step, i) => {
        const Icon = step.icon;
        const isActive = i === currentStep;
        const isDone = i < currentStep;
        return (
          <div key={i} className={cn(
            'flex items-center gap-2 px-2 py-1 rounded-lg text-xs transition-all',
            isActive && 'text-primary font-medium',
            isDone && 'text-green-600',
            !isActive && !isDone && 'text-muted-foreground opacity-40',
          )}>
            {isActive ? <Loader2 className="h-3 w-3 animate-spin shrink-0" />
              : isDone ? <CheckCircle2 className="h-3 w-3 shrink-0" />
              : <Icon className="h-3 w-3 shrink-0" />}
            {step.label}
          </div>
        );
      })}
    </div>
  );
}

function RagTool({ kb }: { kb: KnowledgeBase | null }) {
  const [messages, setMessages] = useState<ChatMsg[]>([{
    role: 'assistant',
    content: kb
      ? `Knowledge base đã sẵn sàng với **${kb.indexedDocs.length} tài liệu** từ ${[...new Set(kb.indexedDocs.map(d => d.projectName))].join(', ')}. Hãy hỏi bất cứ điều gì về các tài liệu đã index!`
      : 'Bạn chưa index tài liệu. Hãy vào **Tool 1 – Crawl & Index** để AI đọc tài liệu trước, sau đó quay lại đây để hỏi đáp.',
  }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(-1);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, loading]);

  // Reset chat khi kb thay đổi
  useEffect(() => {
    setMessages([{
      role: 'assistant',
      content: kb
        ? `Knowledge base đã sẵn sàng với **${kb.indexedDocs.length} tài liệu** từ ${[...new Set(kb.indexedDocs.map(d => d.projectName))].join(', ')}. Hãy hỏi bất cứ điều gì!`
        : 'Bạn chưa index tài liệu. Hãy vào **Tool 1 – Crawl & Index** để AI đọc tài liệu trước.',
    }]);
  }, [kb]);

  const send = async () => {
    const q = input.trim();
    if (!q || loading || !kb) return;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: q }]);
    setLoading(true);
    for (let i = 0; i < RAG_STEPS.length; i++) {
      setStep(i);
      await new Promise(r => setTimeout(r, RAG_STEPS[i].durationMs));
    }
    const { answer, sources } = getRagAnswer(q);
    setMessages(prev => [...prev, { role: 'assistant', content: answer, sources }]);
    setLoading(false);
    setStep(-1);
  };

  const QUICK = kb ? [
    'Dự án nào đang có tài liệu Draft?',
    'Masterise Lumière thiếu gì?',
    'Proposal nào đã Final?',
    'Tổng bao nhiêu tài liệu?',
    'Post mortem của Novaland nói gì?',
  ] : [];

  return (
    <div className="flex flex-col gap-3">
      {/* KB status bar */}
      <div className={cn(
        'flex items-center gap-2 px-3 py-2 rounded-xl border',
        kb ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'
      )}>
        <Database className={cn('h-3.5 w-3.5 shrink-0', kb ? 'text-green-600' : 'text-amber-500')} />
        {kb ? (
          <p className="text-[11px] text-green-800">
            Knowledge base: <strong>{kb.indexedDocs.length} tài liệu</strong> · {(kb.totalTokens / 1000).toFixed(1)}K tokens · Index lúc {kb.indexedAt.toLocaleTimeString('vi-VN')}
          </p>
        ) : (
          <p className="text-[11px] text-amber-800">
            Chưa có knowledge base — hãy chạy <strong>Tool 1 – Crawl & Index</strong> trước.
          </p>
        )}
      </div>

      {/* Chat */}
      <div className="border rounded-xl bg-background overflow-y-auto p-3 space-y-3" style={{ maxHeight: 340 }}>
        {messages.map((msg, i) => (
          <div key={i} className={cn('flex gap-2', msg.role === 'user' && 'justify-end')}>
            {msg.role === 'assistant' && (
              <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                <Bot className="h-3.5 w-3.5 text-primary" />
              </div>
            )}
            <div className={cn(
              'max-w-[88%] rounded-xl px-3 py-2',
              msg.role === 'assistant' ? 'bg-muted/60 border text-foreground' : 'bg-primary text-primary-foreground'
            )}>
              <p className="text-[13px] leading-relaxed"
                dangerouslySetInnerHTML={{ __html: msg.content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
              {msg.sources && msg.sources.length > 0 && (
                <div className="mt-2 pt-2 border-t border-border/40">
                  <p className="text-[10px] text-muted-foreground font-medium mb-0.5">📎 Nguồn tài liệu:</p>
                  {msg.sources.map(s => (
                    <p key={s} className="text-[10px] text-primary/70 flex items-center gap-1 mt-0.5">
                      <FileText className="h-2.5 w-2.5 shrink-0" />{s}
                    </p>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-2">
            <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
              <Bot className="h-3.5 w-3.5 text-primary" />
            </div>
            <div className="bg-muted/60 border rounded-xl px-3 py-2.5">
              <ProgressSteps steps={RAG_STEPS} currentStep={step} />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick prompts */}
      {QUICK.length > 0 && (
        <div className="flex gap-1.5 flex-wrap">
          {QUICK.map(q => (
            <button key={q} onClick={() => setInput(q)}
              className="text-[11px] px-2.5 py-1 rounded-full border border-border/60 bg-secondary hover:bg-secondary/70 text-muted-foreground hover:text-foreground transition-colors">
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="flex gap-2">
        <Input
          placeholder={kb ? 'Hỏi về tài liệu đã index...' : 'Cần index tài liệu trước (Tool 1)'}
          value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send()}
          className="flex-1 h-9 text-sm" disabled={loading || !kb} />
        <Button size="sm" onClick={send} disabled={loading || !input.trim() || !kb} className="h-9 w-9 p-0">
          {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
        </Button>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// TOOL 3 — Project Info AI Summary
// ══════════════════════════════════════════════════════════════════════════════

const PROJECT_INSIGHTS = [
  {
    id: 'p1', client: 'Vinhomes', name: 'Vinhomes Grand Park – CGI Package',
    code: 'VGP-2024-001', type: 'CGI', status: 'Active', health: 'good',
    completion: 72, totalDocs: 6, finalDocs: 3, pm: 'Pham Thi D', startDate: '15/01/2024',
    docBreakdown: [
      { phase: 'Sale',      count: 3, final: 2, label: 'Brief ✓, Contract ✓, Proposal (Shared)' },
      { phase: 'Planning',  count: 2, final: 1, label: 'Charter ✓, Execution Plan (Draft)' },
      { phase: 'Execution', count: 1, final: 0, label: 'CGI Renders Lobby (Shared)' },
      { phase: 'Closing',   count: 0, final: 0, label: 'Chưa có tài liệu' },
    ],
    insight: 'Dự án CGI tiến triển tốt. Lobby Renders đã gửi client — tín hiệu tích cực. Tuy nhiên Execution Plan vẫn Draft và Solution Proposal chưa Final dù Contract đã ký.',
    risks: ['Execution Plan Draft — thiếu căn cứ track sprint tiếp theo', 'Solution Proposal chưa Final dù contract đã ký'],
    strengths: ['Contract Final v3', 'Charter đã approved', 'Deliverable đầu tiên đã gửi client'],
    nextAction: 'Finalize Execution Plan trong tuần. Follow up client về CGI Lobby feedback.',
  },
  {
    id: 'p2', client: 'Masterise Homes', name: 'Masterise Lumière – Animation',
    code: 'MLR-2024-002', type: 'Animation', status: 'Active', health: 'warning',
    completion: 22, totalDocs: 2, finalDocs: 1, pm: 'Nguyen Van A', startDate: '01/02/2024',
    docBreakdown: [
      { phase: 'Sale',      count: 1, final: 1, label: 'Brief ✓' },
      { phase: 'Planning',  count: 0, final: 0, label: '⚠️ Không có tài liệu nào' },
      { phase: 'Execution', count: 1, final: 0, label: 'Storyboard (Draft — chưa approve)' },
      { phase: 'Closing',   count: 0, final: 0, label: 'Chưa có' },
    ],
    insight: 'Tình trạng đáng lo. Storyboard Draft là blocker 100% production. Thiếu hoàn toàn Planning. Contract chưa được lưu trong hệ thống.',
    risks: ['Storyboard Draft — block toàn bộ production', 'Không có Charter và Execution Plan', 'Contract chưa có trong hệ thống'],
    strengths: ['Brief đã Final và rõ ràng', 'Scope animation được định nghĩa'],
    nextAction: 'Gửi Storyboard cho client approve ngay. Tạo Charter và Execution Plan song song.',
  },
  {
    id: 'p3', client: 'Novaland', name: 'Novaland – 360 Virtual Tour',
    code: 'NVL-2024-003', type: '360', status: 'Completed', health: 'done',
    completion: 100, totalDocs: 8, finalDocs: 8, pm: 'Le Van C', startDate: '01/11/2023',
    docBreakdown: [
      { phase: 'Sale',      count: 3, final: 3, label: 'Brief ✓, Proposal ✓, Contract ✓' },
      { phase: 'Planning',  count: 2, final: 2, label: 'Charter ✓, Execution Plan ✓' },
      { phase: 'Execution', count: 1, final: 1, label: '360 Renders Showroom ✓' },
      { phase: 'Closing',   count: 2, final: 2, label: 'Acceptance ✓, Post Mortem ✓' },
    ],
    insight: 'Dự án hoàn chỉnh nhất portfolio — 8/8 Final. Workflow chuẩn mực từ Sale → Closing, có Post Mortem. Đây là mẫu tốt nhất để làm template và case study.',
    risks: [],
    strengths: ['8/8 tài liệu Final', 'Post Mortem có giá trị học hỏi', 'Proof of concept 360° duy nhất', 'Có thể làm case study ngay'],
    nextAction: 'Publish Case Study chính thức. Dùng NVL Proposal làm template cho 360° pitch mới.',
  },
];

const INFO_STEPS = [
  { icon: Database,      label: 'Truy xuất dữ liệu dự án...', durationMs: 500 },
  { icon: ClipboardList, label: 'Phân tích tài liệu theo phase...', durationMs: 700 },
  { icon: Sparkles,      label: 'Tổng hợp insight & đề xuất...', durationMs: 800 },
];

function ProjectInfoTool() {
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(-1);
  const [result, setResult] = useState<typeof PROJECT_INSIGHTS[0] | null>(null);

  const analyze = async (id: string) => {
    setSelected(id);
    setResult(null);
    setLoading(true);
    for (let i = 0; i < INFO_STEPS.length; i++) {
      setStep(i);
      await new Promise(r => setTimeout(r, INFO_STEPS[i].durationMs));
    }
    setResult(PROJECT_INSIGHTS.find(p => p.id === id) ?? null);
    setLoading(false);
    setStep(-1);
  };

  const hb = (h: string) => ({
    good:    { label: '✅ On Track',    cls: 'bg-green-100 text-green-700' },
    warning: { label: '⚠️ Cần xử lý', cls: 'bg-amber-100 text-amber-700' },
    done:    { label: '🏁 Hoàn thành', cls: 'bg-gray-100  text-gray-600'  },
  }[h] ?? { label: h, cls: 'bg-gray-100 text-gray-600' });

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-2">
        {PROJECT_INSIGHTS.map(p => {
          const badge = hb(p.health);
          return (
            <button key={p.id} onClick={() => analyze(p.id)} disabled={loading}
              className={cn(
                'flex flex-col items-start gap-1.5 p-3 rounded-xl border text-left transition-all hover:shadow-sm',
                selected === p.id ? 'border-primary bg-primary/5' : 'border-border bg-card'
              )}>
              <div className="flex items-center gap-1.5 w-full">
                <Building2 className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <span className="text-xs font-medium truncate flex-1">{p.client}</span>
              </div>
              <p className="text-[11px] text-muted-foreground">{p.type} · {p.totalDocs} docs</p>
              <Badge className={cn('text-[9px] px-1.5 border-0', badge.cls)}>{badge.label}</Badge>
            </button>
          );
        })}
      </div>

      {loading && (
        <div className="border rounded-xl p-4 bg-muted/20">
          <p className="text-xs font-medium mb-3">AI đang phân tích...</p>
          <div className="space-y-1.5">
            {INFO_STEPS.map((s, i) => {
              const Icon = s.icon;
              return (
                <div key={i} className={cn(
                  'flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs',
                  i === step && 'bg-primary/10 text-primary font-medium',
                  i < step && 'text-green-600',
                  i > step && 'text-muted-foreground opacity-40',
                )}>
                  {i === step ? <Loader2 className="h-3.5 w-3.5 animate-spin shrink-0" />
                    : i < step ? <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                    : <Icon className="h-3.5 w-3.5 shrink-0" />}
                  {s.label}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {result && !loading && (
        <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
          {/* Header */}
          <div className="p-4 rounded-xl border bg-card">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <p className="text-sm font-semibold">{result.name}</p>
              <Badge className={cn('text-[10px] px-2 border-0', hb(result.health).cls)}>{hb(result.health).label}</Badge>
            </div>
            <p className="text-xs text-muted-foreground">{result.code} · PM: {result.pm} · Từ {result.startDate}</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { val: `${result.completion}%`, label: 'Tiến độ', color: 'text-primary' },
              { val: result.totalDocs,          label: 'Tổng docs', color: '' },
              { val: result.finalDocs,           label: 'Final',    color: 'text-green-600' },
            ].map(stat => (
              <div key={stat.label} className="rounded-xl border p-3 text-center bg-card">
                <p className={cn('text-2xl font-bold', stat.color)}>{stat.val}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Doc breakdown */}
          <div className="rounded-xl border p-3 bg-card space-y-2">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Tài liệu theo Phase</p>
            {result.docBreakdown.map(d => (
              <div key={d.phase} className="flex items-center gap-3">
                <Badge className={cn('text-[10px] px-2 border shrink-0 w-20 justify-center', phaseColor[d.phase])}>
                  {d.phase}
                </Badge>
                <p className="text-[12px] text-muted-foreground flex-1">{d.label}</p>
                <span className="text-[10px] font-medium shrink-0">{d.final}/{d.count}</span>
              </div>
            ))}
          </div>

          {/* AI Insight */}
          <div className="rounded-xl border bg-blue-50 border-blue-100 p-3">
            <p className="text-xs font-semibold text-blue-700 mb-1.5 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5" /> AI Insight
            </p>
            <p className="text-[13px] text-blue-900 leading-relaxed">{result.insight}</p>
          </div>

          {result.strengths.length > 0 && (
            <div className="rounded-xl border bg-green-50 border-green-100 p-3">
              <p className="text-xs font-semibold text-green-700 mb-1.5 flex items-center gap-1.5">
                <ThumbsUp className="h-3.5 w-3.5" /> Điểm mạnh
              </p>
              {result.strengths.map((s, i) => (
                <p key={i} className="text-[12px] text-green-800 flex items-start gap-1.5 mb-0.5">
                  <CheckCircle2 className="h-3 w-3 shrink-0 mt-0.5" />{s}
                </p>
              ))}
            </div>
          )}

          {result.risks.length > 0 && (
            <div className="rounded-xl border bg-amber-50 border-amber-100 p-3">
              <p className="text-xs font-semibold text-amber-700 mb-1.5 flex items-center gap-1.5">
                <AlertTriangle className="h-3.5 w-3.5" /> Rủi ro & Cần xử lý
              </p>
              {result.risks.map((r, i) => (
                <p key={i} className="text-[12px] text-amber-800 flex items-start gap-1.5 mb-0.5">
                  <ChevronRight className="h-3 w-3 shrink-0 mt-0.5" />{r}
                </p>
              ))}
            </div>
          )}

          <div className="rounded-xl border bg-violet-50 border-violet-100 p-3">
            <p className="text-xs font-semibold text-violet-700 mb-1 flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5" /> Hành động tiếp theo
            </p>
            <p className="text-[13px] text-violet-900">{result.nextAction}</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// Main Page
// ══════════════════════════════════════════════════════════════════════════════

const TOOLS = [
  {
    id: 'crawl',
    icon: FolderOpen,
    iconBg: 'bg-blue-50',
    iconColor: 'text-blue-500',
    badgeColor: 'bg-blue-100 text-blue-700',
    title: 'Crawl & Index Tài liệu',
    subtitle: 'Đọc tài liệu nội bộ · Tạo knowledge base',
    desc: 'AI đọc toàn bộ tài liệu nội bộ của VistaX (proposal, brief, contract, charter...) và đưa vào knowledge base. Knowledge base này sẽ được dùng cho Tool 2 để hỏi đáp.',
    badge: 'Bước 1',
    badgeStyle: 'bg-blue-100 text-blue-700',
  },
  {
    id: 'rag',
    icon: MessageSquare,
    iconBg: 'bg-purple-50',
    iconColor: 'text-purple-500',
    badgeColor: 'bg-purple-100 text-purple-700',
    title: 'RAG – Hỏi đáp về Dự án',
    subtitle: 'Vector search · Document Q&A · Trích nguồn',
    desc: 'Sau khi đã index (Tool 1), hỏi AI bất cứ câu hỏi nào về tài liệu nội bộ. AI trả lời dựa trên knowledge base và luôn trích dẫn nguồn tài liệu cụ thể.',
    badge: 'Bước 2',
    badgeStyle: 'bg-purple-100 text-purple-700',
  },
  {
    id: 'info',
    icon: BarChart2,
    iconBg: 'bg-green-50',
    iconColor: 'text-green-500',
    badgeColor: 'bg-green-100 text-green-700',
    title: 'Project Info Summary',
    subtitle: 'Auto-analysis · Risk detection · Next actions',
    desc: 'Chọn một dự án để AI tổng hợp trạng thái toàn diện: tiến độ, phân tích tài liệu theo phase, điểm mạnh, rủi ro và hành động ưu tiên tiếp theo.',
    badge: 'Bonus',
    badgeStyle: 'bg-green-100 text-green-700',
  },
];

export default function AIToolsPage() {
  const [activeTool, setActiveTool] = useState('crawl');
  const [knowledgeBase, setKnowledgeBase] = useState<KnowledgeBase | null>(null);

  const active = TOOLS.find(t => t.id === activeTool)!;
  const ActiveIcon = active.icon;

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Bot className="h-5 w-5 text-primary" />
          <h1 className="text-2xl font-bold">AI Tools</h1>
          <Badge className="bg-primary/10 text-primary border-0 text-xs">Beta</Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          Công cụ AI phân tích dữ liệu nội bộ.
        </p>
      </div>

      {/* Flow indicator */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <div className={cn(
          'flex items-center gap-1.5 px-3 py-1.5 rounded-full border font-medium transition-all',
          activeTool === 'crawl' ? 'bg-blue-50 border-blue-200 text-blue-700' : knowledgeBase ? 'bg-green-50 border-green-200 text-green-700' : 'border-border'
        )}>
          <FolderOpen className="h-3 w-3" />
          Crawl & Index
          {knowledgeBase && <CheckCircle2 className="h-3 w-3 text-green-500" />}
        </div>
        <ChevronRight className="h-3.5 w-3.5" />
        <div className={cn(
          'flex items-center gap-1.5 px-3 py-1.5 rounded-full border font-medium transition-all',
          activeTool === 'rag' ? 'bg-purple-50 border-purple-200 text-purple-700' : 'border-border'
        )}>
          <MessageSquare className="h-3 w-3" />
          RAG Q&A
          {!knowledgeBase && <span className="text-[10px] opacity-60">(cần index trước)</span>}
        </div>
        <span className="mx-1">·</span>
        <div className={cn(
          'flex items-center gap-1.5 px-3 py-1.5 rounded-full border font-medium transition-all',
          activeTool === 'info' ? 'bg-green-50 border-green-200 text-green-700' : 'border-border'
        )}>
          <BarChart2 className="h-3 w-3" />
          Project Summary
        </div>
      </div>

      {/* Tool tabs */}
      <div className="grid grid-cols-3 gap-3">
        {TOOLS.map(tool => {
          const Icon = tool.icon;
          const isActive = activeTool === tool.id;
          const showKbBadge = tool.id === 'rag' && knowledgeBase;
          return (
            <button key={tool.id} onClick={() => setActiveTool(tool.id)}
              className={cn(
                'flex flex-col items-start gap-2 p-4 rounded-2xl border text-left transition-all hover:shadow-md relative',
                isActive ? 'border-primary bg-primary/5 shadow-sm' : 'border-border bg-card'
              )}>
              <div className="flex items-center gap-2 w-full">
                <div className={cn('h-8 w-8 rounded-lg flex items-center justify-center shrink-0', tool.iconBg)}>
                  <Icon className={cn('h-4 w-4', tool.iconColor)} />
                </div>
                <Badge className={cn('text-[10px] border-0 ml-auto', tool.badgeStyle)}>{tool.badge}</Badge>
              </div>
              <div>
                <p className="text-sm font-semibold leading-tight">{tool.title}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5 leading-snug">{tool.subtitle}</p>
              </div>
              {showKbBadge && (
                <div className="absolute top-2 right-2">
                  <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Active panel */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div className={cn('h-9 w-9 rounded-xl flex items-center justify-center', active.iconBg)}>
              <ActiveIcon className={cn('h-5 w-5', active.iconColor)} />
            </div>
            <div className="flex-1">
              <CardTitle className="text-base">{active.title}</CardTitle>
              <CardDescription className="text-xs mt-0.5">{active.desc}</CardDescription>
            </div>
            <Badge className={cn('text-xs border-0 shrink-0', active.badgeStyle)}>{active.badge}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          {activeTool === 'crawl' && (
            <CrawlIndexTool onIndexed={(kb) => {
              setKnowledgeBase(kb);
              // Auto switch to RAG after a short delay
              setTimeout(() => setActiveTool('rag'), 1200);
            }} />
          )}
          {activeTool === 'rag' && <RagTool kb={knowledgeBase} />}
          {activeTool === 'info' && <ProjectInfoTool />}
        </CardContent>
      </Card>
    </div>
  );
}
