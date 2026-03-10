import { useState } from 'react';
import { TaxonomyItem } from '@/data/mock-data';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { Database, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';

function TaxonomyList({ items, onToggle, onAdd }: { items: TaxonomyItem[]; onToggle: (id: string, enabled: boolean) => void; onAdd: (value: string) => void }) {
  const [showAdd, setShowAdd] = useState(false);
  const [newVal, setNewVal] = useState('');

  return (
    <>
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm text-muted-foreground">{items.length} giá trị</p>
        <Button size="sm" className="gap-1.5" onClick={() => { setNewVal(''); setShowAdd(true); }}>
          <Plus className="h-3.5 w-3.5" /> Thêm
        </Button>
      </div>
      <Card>
        <CardContent className="p-4 space-y-2">
          {items.map(item => (
            <div key={item.id} className="flex items-center gap-3 p-3 border rounded-lg">
              <span className="text-sm font-medium flex-1">{item.value}</span>
              <Switch checked={item.enabled} onCheckedChange={(checked) => onToggle(item.id, checked)} />
            </div>
          ))}
        </CardContent>
      </Card>
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent>
          <DialogHeader><DialogTitle>Thêm giá trị mới</DialogTitle></DialogHeader>
          <div className="space-y-2 py-4">
            <Label>Giá trị</Label>
            <Input value={newVal} onChange={e => setNewVal(e.target.value)} />
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Hủy</Button></DialogClose>
            <Button disabled={!newVal.trim()} onClick={() => { onAdd(newVal.trim()); setShowAdd(false); }}>Thêm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default function AdminTaxonomyPage() {
  const { isAdmin } = useAuth();
  const { taxonomy, addTaxonomyItem, toggleTaxonomyItem } = useData();

  if (!isAdmin) {
    return <div className="text-center py-20 text-muted-foreground">🔒 Insufficient permission</div>;
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold flex items-center gap-2">
            <Database className="h-5 w-5" />
            Phân loại <span className="text-sm font-normal text-muted-foreground">(Taxonomy)</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Quản lý danh sách phân loại cho dữ liệu</p>
        </div>
        <Badge variant="outline">Taxonomy version: v1</Badge>
      </div>

      <Tabs defaultValue="project">
        <TabsList>
          <TabsTrigger value="project">Loại dự án</TabsTrigger>
          <TabsTrigger value="client">Loại khách hàng</TabsTrigger>
          <TabsTrigger value="deliverable">Loại sản phẩm</TabsTrigger>
        </TabsList>

        <TabsContent value="project" className="mt-4">
          <TaxonomyList
            items={taxonomy.projectTypes}
            onToggle={(id, enabled) => toggleTaxonomyItem('projectTypes', id, enabled)}
            onAdd={(v) => addTaxonomyItem('projectTypes', v)}
          />
        </TabsContent>
        <TabsContent value="client" className="mt-4">
          <TaxonomyList
            items={taxonomy.clientTypes}
            onToggle={(id, enabled) => toggleTaxonomyItem('clientTypes', id, enabled)}
            onAdd={(v) => addTaxonomyItem('clientTypes', v)}
          />
        </TabsContent>
        <TabsContent value="deliverable" className="mt-4">
          <TaxonomyList
            items={taxonomy.deliverableTypes}
            onToggle={(id, enabled) => toggleTaxonomyItem('deliverableTypes', id, enabled)}
            onAdd={(v) => addTaxonomyItem('deliverableTypes', v)}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
