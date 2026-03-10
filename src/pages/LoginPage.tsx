import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Role, ROLE_LABELS } from '@/data/mock-data';
import { Shield, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const ROLES: Role[] = ['Admin', 'Sale', 'PM', 'Production', 'Finance', 'Viewer'];

const ROLE_DESCRIPTIONS: Record<Role, string> = {
  Admin: 'Toàn quyền truy cập. Full access to all features.',
  Sale: 'Tải lên/chỉnh sửa tài liệu giai đoạn Bán hàng. Upload/edit in Sale phase.',
  PM: 'Quản lý tài liệu giai đoạn Lập kế hoạch & Thực hiện. Planning & Execution phases.',
  Production: 'Tải lên/chỉnh sửa tài liệu giai đoạn Thực hiện. Execution phase only.',
  Finance: 'Xem tất cả; tải lên tài liệu thanh toán giai đoạn Đóng. Closing phase uploads.',
  Viewer: 'Chỉ xem, không thể tải lên hoặc chỉnh sửa. Read-only access.',
};

export default function LoginPage() {
  const { setRole } = useAuth();
  const navigate = useNavigate();

  const handleLogin = (role: Role) => {
    setRole(role);
    navigate('/projects');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-primary mb-4">
            <span className="text-primary-foreground font-bold text-xl">VX</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground">VistaX Data Platform</h1>
          <p className="text-muted-foreground mt-1">Chọn vai trò để tiếp tục (Select role to continue)</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {ROLES.map(role => (
            <Card
              key={role}
              className="cursor-pointer hover:border-primary/50 hover:shadow-md transition-all group"
              onClick={() => handleLogin(role)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-primary" />
                    <CardTitle className="text-sm">{ROLE_LABELS[role]}</CardTitle>
                  </div>
                  <span className="text-xs text-muted-foreground font-mono">{role}</span>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-xs leading-relaxed">
                  {ROLE_DESCRIPTIONS[role]}
                </CardDescription>
                <Button variant="ghost" size="sm" className="mt-3 w-full gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  Đăng nhập <ArrowRight className="h-3 w-3" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
