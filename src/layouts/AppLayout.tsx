import { ReactNode, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Role, ROLE_LABELS } from '@/data/mock-data';
import {
  LayoutDashboard, Search, Settings,
  User, LogOut, Shield, TrendingUp, ClipboardList, Zap, Archive, FolderOpen
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
  DropdownMenuSeparator, DropdownMenuLabel
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const ROLES: Role[] = ['Admin', 'Sale', 'PM', 'Production', 'Finance', 'Viewer'];

const PHASE_NAV = [
  { icon: TrendingUp,   color: 'text-orange-500', labelVi: 'Bán hàng & Tư vấn', label: 'Sale & Advisory',   path: '/phase/sale'      },
  { icon: ClipboardList, color: 'text-teal-500',  labelVi: 'Lập kế hoạch',       label: 'Project Planning',  path: '/phase/planning'  },
  { icon: Zap,          color: 'text-purple-500', labelVi: 'Thực thi Dự án',      label: 'Execution',         path: '/phase/execution' },
  { icon: Archive,      color: 'text-green-500',  labelVi: 'Đóng dự án',          label: 'Project Closing',   path: '/phase/closing'   },
];

export default function AppLayout({ children }: { children: ReactNode }) {
  const { role, setRole, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const isActive = (path: string) => location.pathname.startsWith(path);
  const isExact  = (path: string) => location.pathname === path;

  return (
    <div className="flex h-screen w-full overflow-hidden">
      {/* Sidebar */}
      <aside className="w-60 shrink-0 bg-sidebar flex flex-col border-r border-sidebar-border">
        {/* Logo */}
        <div
          className="p-4 border-b border-sidebar-border cursor-pointer"
          onClick={() => navigate('/dashboard')}
        >
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-sidebar-primary flex items-center justify-center overflow-hidden">
              <img src="/logo.png" alt="VistaX" className="h-6 w-6 object-contain" />
            </div>
            <div>
              <h1 className="text-sm font-semibold text-sidebar-accent-foreground">VistaX</h1>
              <p className="text-[10px] text-sidebar-foreground">Project Hub</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">

          {/* Dashboard */}
          <NavBtn
            icon={LayoutDashboard}
            iconColor="text-blue-500"
            labelVi="Tổng quan"
            label="Dashboard"
            active={isExact('/dashboard')}
            onClick={() => navigate('/dashboard')}
          />

          {/* Divider + section label */}
          <div className="pt-3 pb-1 px-3">
            <p className="text-[10px] uppercase tracking-wider text-sidebar-foreground/50 font-medium">
              Workflow Phases
            </p>
          </div>

          {/* 4 Phase tabs — reference / tham khảo */}
          {PHASE_NAV.map(item => (
            <NavBtn
              key={item.path}
              icon={item.icon}
              iconColor={item.color}
              labelVi={item.labelVi}
              label={item.label}
              active={isActive(item.path)}
              onClick={() => navigate(item.path)}
            />
          ))}

          {/* Divider */}
          <div className="pt-3 pb-1">
            <div className="border-t border-sidebar-border" />
          </div>

          {/* All Projects */}
          <NavBtn
            icon={FolderOpen}
            iconColor="text-blue-400"
            labelVi="Tất cả Dự án"
            label="All Projects"
            active={isActive('/projects')}
            onClick={() => navigate('/projects')}
          />

          {/* Search */}
          <NavBtn
            icon={Search}
            iconColor="text-gray-400"
            labelVi="Tìm kiếm"
            label="Search"
            active={isExact('/search')}
            onClick={() => navigate('/search')}
          />

          {/* Admin */}
          {isAdmin && (
            <NavBtn
              icon={Settings}
              iconColor="text-gray-400"
              labelVi="Cấu hình Admin"
              label="Admin Settings"
              active={isActive('/admin')}
              onClick={() => navigate('/admin/structure')}
            />
          )}
        </nav>

        {/* Role Switcher */}
        <div className="p-3 border-t border-sidebar-border">
          <div className="text-[10px] uppercase tracking-wider text-sidebar-foreground/60 mb-2 px-1">Vai trò</div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 w-full px-3 py-2 rounded-lg bg-sidebar-accent text-sidebar-accent-foreground hover:bg-sidebar-accent/80 transition-colors">
                <Shield className="h-3.5 w-3.5 shrink-0" />
                <span className="flex-1 text-left text-xs">{ROLE_LABELS[role]}</span>
                <Badge variant="outline" className="text-[10px] border-sidebar-border">{role}</Badge>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-52">
              <DropdownMenuLabel>Chuyển vai trò</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {ROLES.map(r => (
                <DropdownMenuItem key={r} onClick={() => setRole(r)} className={cn(r === role && 'bg-accent')}>
                  <span>{ROLE_LABELS[r]}</span>
                  <span className="ml-auto text-xs text-muted-foreground">{r}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-14 shrink-0 bg-card border-b flex items-center px-4 gap-3">
          <div className="flex-1 max-w-sm">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm tài liệu..."
                className="pl-8 h-8 text-sm bg-secondary border-0"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={handleSearch}
              />
            </div>
          </div>
          <div className="flex-1" />
          <Badge variant="secondary" className="text-xs">{ROLE_LABELS[role]}</Badge>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                <User className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('/login')}>
                <LogOut className="h-4 w-4 mr-2" />
                Đăng xuất
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

// Reusable nav button
function NavBtn({
  icon: Icon, iconColor, labelVi, label, active, onClick
}: {
  icon: React.ElementType; iconColor: string;
  labelVi: string; label: string;
  active: boolean; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-2.5 w-full px-3 py-2.5 rounded-lg transition-colors text-left',
        active
          ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
          : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
      )}
    >
      <Icon className={cn('h-4 w-4 shrink-0', iconColor)} />
      <div>
        <div className="text-xs font-medium">{labelVi}</div>
        <div className="text-[10px] opacity-50">{label}</div>
      </div>
    </button>
  );
}
