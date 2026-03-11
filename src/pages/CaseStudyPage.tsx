import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MOCK_CASE_STUDIES, MOCK_REFERRALS, CaseStudy, Referral, CaseStudyStatus, ReferralStatus } from '@/data/mock-data';
import { useAuth } from '@/contexts/AuthContext';
import {
  BookOpen, Star, Plus, ChevronRight, ExternalLink, Users,
  TrendingUp, ArrowRight, Quote, Tag, CheckCircle2,
  Clock, AlertCircle, XCircle, Edit2, Trash2, Filter
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

// ─── Colors ────────────────────────────────────────────────────────────────────

const csStatusColors: Record<CaseStudyStatus, string> = {
  Published: 'bg-green-100 text-green-700 border-green-200',
  Draft:     'bg-yellow-100 text-yellow-700 border-yellow-200',
  Archived:  'bg-gray-100 text-gray-500 border-gray-200',
};

const refStatusConfig: Record<ReferralStatus, { color: string; icon: React.ElementType; label: string }> = {
  Pending:     { color: 'bg-gray-100 text-gray-600',    icon: Clock,         label: 'Chờ liên hệ' },
  'In Progress': { color: 'bg-blue-100 text-blue-700',  icon: ArrowRight,    label: 'Đang xử lý' },
  Converted:   { color: 'bg-green-100 text-green-700',  icon: CheckCircle2,  label: 'Đã chốt' },
  Lost:        { color: 'bg-red-100 text-red-600',      icon: XCircle,       label: 'Mất deal' },
};

const typeColors: Record<string, string> = {
  CGI: 'bg-orange-100 text-orange-700',
  Animation: 'bg-purple-100 text-purple-700',
  '360': 'bg-teal-100 text-teal-700',
  Mixed: 'bg-blue-100 text-blue-700',
};

type Tab = 'case-studies' | 'referrals';

export default function CaseStudyPage() {
  const navigate = useNavigate();
  const { role } = useAuth();
  const canEdit = role === 'Admin' || role === 'Sale' || role === 'PM';

  const [tab, setTab] = useState<Tab>('case-studies');
  const [caseStudies, setCaseStudies] = useState<CaseStudy[]>(MOCK_CASE_STUDIES);
  const [referrals, setReferrals] = useState<Referral[]>(MOCK_REFERRALS);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [selectedCS, setSelectedCS] = useState<CaseStudy | null>(null);

  // ── Case Studies filtered ──
  const filteredCS = caseStudies.filter(cs => {
    const matchSearch = cs.title.toLowerCase().includes(search.toLowerCase()) ||
      cs.clientName.toLowerCase().includes(search.toLowerCase()) ||
      cs.tags.some(t => t.toLowerCase().includes(search.toLowerCase()));
    const matchType = filterType === 'all' || cs.projectType === filterType;
    return matchSearch && matchType;
  });

  // ── Referral stats ──
  const refStats = {
    total: referrals.length,
    converted: referrals.filter(r => r.status === 'Converted').length,
    inProgress: referrals.filter(r => r.status === 'In Progress').length,
    pending: referrals.filter(r => r.status === 'Pending').length,
    lost: referrals.filter(r => r.status === 'Lost').length,
  };
  const conversionRate = refStats.total > 0
    ? Math.round((refStats.converted / refStats.total) * 100) : 0;

  const updateRefStatus = (id: string, status: ReferralStatus) => {
    setReferrals(prev => prev.map(r => r.id === id ? { ...r, status, updatedAt: new Date().toISOString().slice(0, 10) } : r));
  };

  // ── If viewing case study detail ──
  if (selectedCS) {
    return (
      <div className="space-y-5 max-w-3xl">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <button onClick={() => setSelectedCS(null)} className="hover:text-foreground">Case Studies</button>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground font-medium">{selectedCS.title}</span>
        </div>

        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge className={cn('text-xs border', csStatusColors[selectedCS.status])}>{selectedCS.status}</Badge>
              <Badge className={cn('text-xs', typeColors[selectedCS.projectType] || 'bg-muted text-muted-foreground')}>
                {selectedCS.projectType}
              </Badge>
            </div>
            <h1 className="text-xl font-bold leading-snug">{selectedCS.title}</h1>
            <p className="text-sm text-muted-foreground mt-1">{selectedCS.clientName} · {selectedCS.projectName}</p>
          </div>
          {selectedCS.projectId && (
            <Button variant="outline" size="sm" className="gap-1 shrink-0"
              onClick={() => navigate(`/projects/${selectedCS.projectId}`)}>
              <ExternalLink className="h-3.5 w-3.5" /> Xem dự án
            </Button>
          )}
        </div>

        {/* Summary */}
        <Card className="bg-muted/30">
          <CardContent className="py-4 px-5">
            <p className="text-sm leading-relaxed font-medium">{selectedCS.summary}</p>
          </CardContent>
        </Card>

        {/* 3-column: Challenge, Solution, Result */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: '🎯 Thách thức', content: selectedCS.challenge, bg: 'bg-red-50', border: 'border-red-200' },
            { label: '💡 Giải pháp', content: selectedCS.solution,   bg: 'bg-blue-50', border: 'border-blue-200' },
            { label: '🏆 Kết quả',   content: selectedCS.result,     bg: 'bg-green-50', border: 'border-green-200' },
          ].map(item => (
            <Card key={item.label} className={`border ${item.border} ${item.bg}`}>
              <CardContent className="py-4 px-4">
                <p className="text-xs font-semibold mb-2">{item.label}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{item.content}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Testimonial */}
        {selectedCS.testimonial && (
          <Card className="border-l-4 border-l-primary bg-primary/5">
            <CardContent className="py-5 px-5">
              <Quote className="h-5 w-5 text-primary/40 mb-2" />
              <p className="text-sm italic leading-relaxed mb-3">"{selectedCS.testimonial}"</p>
              <p className="text-xs font-medium text-muted-foreground">— {selectedCS.testimonialAuthor}</p>
            </CardContent>
          </Card>
        )}

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          {selectedCS.tags.map(tag => (
            <span key={tag} className="flex items-center gap-1 text-xs bg-secondary px-2.5 py-1 rounded-full">
              <Tag className="h-3 w-3" /> {tag}
            </span>
          ))}
        </div>

        <div className="text-xs text-muted-foreground">
          Cập nhật lần cuối: {selectedCS.updatedAt}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Case Studies & Referrals</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Tài liệu tham chiếu và mạng lưới giới thiệu khách hàng
          </p>
        </div>
        {canEdit && (
          <Button size="sm" className="gap-1.5">
            <Plus className="h-3.5 w-3.5" /> Thêm mới
          </Button>
        )}
      </div>

      {/* Tab switcher */}
      <div className="flex gap-1 p-1 bg-muted rounded-lg w-fit">
        <button
          onClick={() => setTab('case-studies')}
          className={cn(
            'flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium transition-all',
            tab === 'case-studies' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <BookOpen className="h-4 w-4" />
          Case Studies
          <Badge variant="secondary" className="text-xs ml-1">{caseStudies.length}</Badge>
        </button>
        <button
          onClick={() => setTab('referrals')}
          className={cn(
            'flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium transition-all',
            tab === 'referrals' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <Users className="h-4 w-4" />
          Referrals
          <Badge variant="secondary" className="text-xs ml-1">{referrals.length}</Badge>
        </button>
      </div>

      {/* ── CASE STUDIES TAB ── */}
      {tab === 'case-studies' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex items-center gap-3">
            <div className="relative max-w-xs flex-1">
              <Input
                placeholder="Tìm theo tên, client, tag..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="h-9 pl-3"
              />
            </div>
            <div className="flex items-center gap-1.5">
              <Filter className="h-3.5 w-3.5 text-muted-foreground" />
              {(['all', 'CGI', 'Animation', '360', 'Mixed'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setFilterType(t)}
                  className={cn(
                    'px-3 py-1.5 rounded-md text-xs font-medium transition-colors',
                    filterType === t ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  )}
                >
                  {t === 'all' ? 'Tất cả' : t}
                </button>
              ))}
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3">
            <Card>
              <CardContent className="py-3 px-4 flex items-center gap-3">
                <BookOpen className="h-8 w-8 text-blue-500 bg-blue-50 rounded-lg p-1.5" />
                <div>
                  <p className="text-xl font-bold">{caseStudies.filter(c => c.status === 'Published').length}</p>
                  <p className="text-xs text-muted-foreground">Đã publish</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="py-3 px-4 flex items-center gap-3">
                <Star className="h-8 w-8 text-yellow-500 bg-yellow-50 rounded-lg p-1.5" />
                <div>
                  <p className="text-xl font-bold">{caseStudies.filter(c => c.testimonial).length}</p>
                  <p className="text-xs text-muted-foreground">Có testimonial</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="py-3 px-4 flex items-center gap-3">
                <TrendingUp className="h-8 w-8 text-green-500 bg-green-50 rounded-lg p-1.5" />
                <div>
                  <p className="text-xl font-bold">{[...new Set(caseStudies.map(c => c.clientName))].length}</p>
                  <p className="text-xs text-muted-foreground">Khách hàng tiêu biểu</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Case study cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCS.map(cs => (
              <Card
                key={cs.id}
                className="cursor-pointer hover:shadow-lg transition-all group border hover:border-primary/30"
                onClick={() => setSelectedCS(cs)}
              >
                <CardContent className="p-4 space-y-3">
                  {/* Top badges */}
                  <div className="flex items-center justify-between">
                    <Badge className={cn('text-xs border', csStatusColors[cs.status])}>{cs.status}</Badge>
                    <Badge className={cn('text-xs', typeColors[cs.projectType] || 'bg-muted text-muted-foreground')}>
                      {cs.projectType}
                    </Badge>
                  </div>

                  {/* Title */}
                  <p className="font-semibold text-sm leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                    {cs.title}
                  </p>

                  {/* Summary */}
                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                    {cs.summary}
                  </p>

                  {/* Testimonial preview */}
                  {cs.testimonial && (
                    <div className="flex items-start gap-1.5 bg-muted/40 rounded-lg px-3 py-2">
                      <Quote className="h-3 w-3 text-muted-foreground shrink-0 mt-0.5" />
                      <p className="text-[10px] text-muted-foreground italic line-clamp-2">{cs.testimonial}</p>
                    </div>
                  )}

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1">
                    {cs.tags.slice(0, 3).map(tag => (
                      <span key={tag} className="text-[10px] bg-secondary px-2 py-0.5 rounded-full">{tag}</span>
                    ))}
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-1 border-t text-xs text-muted-foreground">
                    <span>{cs.clientName}</span>
                    <span className="flex items-center gap-1 group-hover:text-primary">
                      Xem chi tiết <ChevronRight className="h-3 w-3" />
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Add new card */}
            {canEdit && (
              <Card className="cursor-pointer hover:shadow-md transition-all border-dashed border-2 hover:border-primary/40 flex items-center justify-center min-h-[220px]">
                <CardContent className="p-4 flex flex-col items-center gap-2 text-muted-foreground">
                  <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                    <Plus className="h-5 w-5" />
                  </div>
                  <p className="text-sm font-medium">Thêm Case Study</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* ── REFERRALS TAB ── */}
      {tab === 'referrals' && (
        <div className="space-y-4">
          {/* Referral KPIs */}
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: 'Tổng referrals', value: refStats.total, color: 'text-blue-500', bg: 'bg-blue-50' },
              { label: 'Đang xử lý', value: refStats.inProgress, color: 'text-blue-500', bg: 'bg-blue-50' },
              { label: 'Đã chốt', value: refStats.converted, color: 'text-green-500', bg: 'bg-green-50' },
              { label: 'Tỷ lệ chốt', value: `${conversionRate}%`, color: 'text-purple-500', bg: 'bg-purple-50' },
            ].map(s => (
              <Card key={s.label}>
                <CardContent className="py-3 px-4">
                  <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Kanban-style referral board */}
          <div className="grid grid-cols-4 gap-3">
            {(['Pending', 'In Progress', 'Converted', 'Lost'] as ReferralStatus[]).map(status => {
              const cfg = refStatusConfig[status];
              const StatusIcon = cfg.icon;
              const items = referrals.filter(r => r.status === status);
              return (
                <div key={status} className="space-y-2">
                  <div className={cn('flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold', cfg.color)}>
                    <StatusIcon className="h-3.5 w-3.5" />
                    {cfg.label}
                    <Badge variant="secondary" className="ml-auto text-[10px]">{items.length}</Badge>
                  </div>
                  <div className="space-y-2 min-h-[100px]">
                    {items.map(ref => (
                      <Card key={ref.id} className="hover:shadow-sm transition-shadow">
                        <CardContent className="py-3 px-3 space-y-2">
                          <div>
                            <p className="text-xs font-semibold">{ref.toCompany}</p>
                            <p className="text-[10px] text-muted-foreground">{ref.toLeadName}</p>
                          </div>
                          <div className="flex items-center gap-1 flex-wrap">
                            <Badge className={cn('text-[10px]', typeColors[ref.projectType] || 'bg-muted')}>{ref.projectType}</Badge>
                            {ref.fromClientName && (
                              <span className="text-[10px] text-muted-foreground">từ {ref.fromClientName}</span>
                            )}
                          </div>
                          {ref.estimatedValue && (
                            <p className="text-[10px] font-medium text-green-700">{ref.estimatedValue}</p>
                          )}
                          {ref.note && (
                            <p className="text-[10px] text-muted-foreground leading-relaxed border-t pt-1.5">{ref.note}</p>
                          )}
                          {/* Status change buttons */}
                          {canEdit && status !== 'Converted' && status !== 'Lost' && (
                            <div className="flex gap-1 pt-1">
                              {status === 'Pending' && (
                                <button
                                  onClick={() => updateRefStatus(ref.id, 'In Progress')}
                                  className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded hover:bg-blue-200 transition-colors"
                                >
                                  → Xử lý
                                </button>
                              )}
                              {status === 'In Progress' && (
                                <>
                                  <button
                                    onClick={() => updateRefStatus(ref.id, 'Converted')}
                                    className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded hover:bg-green-200 transition-colors"
                                  >
                                    ✓ Chốt
                                  </button>
                                  <button
                                    onClick={() => updateRefStatus(ref.id, 'Lost')}
                                    className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded hover:bg-red-200 transition-colors"
                                  >
                                    ✗ Mất
                                  </button>
                                </>
                              )}
                            </div>
                          )}
                          <p className="text-[10px] text-muted-foreground/60">{ref.updatedAt}</p>
                        </CardContent>
                      </Card>
                    ))}
                    {items.length === 0 && (
                      <div className="border-2 border-dashed rounded-lg h-16 flex items-center justify-center text-xs text-muted-foreground">
                        Không có
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
