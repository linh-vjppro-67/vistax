import React, { createContext, useContext, useMemo, useState, ReactNode } from 'react';
import {
  CLIENT_TYPES,
  DEFAULT_CATEGORIES,
  DELIVERABLE_TYPES,
  DOC_TYPES,
  Document,
  DocStatus,
  MOCK_DOCUMENTS,
  MOCK_PROJECTS,
  PHASES,
  Phase,
  PROJECT_TYPES,
  Project,
  Role,
  TaxonomyItem,
} from '@/data/mock-data';

export type DocTypeConfig = {
  id: string;
  name: string;
  enabled: boolean;
  isDefault?: boolean;
  requiresAdminApproval?: boolean;
};

export type CategoryConfig = {
  id: string;
  name: string;
  enabled: boolean;
};

export type TemplateConfig = {
  id: string;
  name: string;
  description?: string;
  categoriesByPhase: Record<Phase, CategoryConfig[]>;
};

type UploadInput = {
  projectId: string;
  fileName: string;
  title: string;
  phase: Phase;
  category: string;
  docType: string;
  owner: string;
  status: DocStatus;
  versionNote?: string;
  date: string; // ISO date
  tags: { projectType: string; clientType: string; deliverableType: string };
  uploadedBy: string;
  imported?: boolean;
};

type MigrationMapping = {
  projectId: string;
  items: Array<{
    sourcePath: string;
    phase: Phase;
    category: string;
    docType: string;
  }>;
};

interface DataContextType {
  projects: Project[];
  documents: Document[];

  // Config
  phaseOrder: Phase[];
  templates: TemplateConfig[];
  activeTemplateId: string; // baseline for POC
  docTypes: DocTypeConfig[];

  taxonomy: {
    version: 'v1';
    projectTypes: TaxonomyItem[];
    clientTypes: TaxonomyItem[];
    deliverableTypes: TaxonomyItem[];
  };

  // Helpers
  getProjectById: (id: string) => Project | undefined;
  getDocById: (id: string) => Document | undefined;
  getDocsByProject: (projectId: string) => Document[];
  getDocsByPhase: (projectId: string, phase: Phase) => Document[];
  getDocsByCategory: (projectId: string, phase: Phase, category: string) => Document[];
  getCategoriesForProjectPhase: (projectId: string, phase: Phase) => string[];

  // Mutations
  createProject: (input: {
    name: string;
    code: string;
    clientName: string;
    projectType: string;
    templateId?: string;
  }) => Project;
  uploadDocument: (input: UploadInput) => Document;
  addVersion: (docId: string, input: { fileName: string; uploadedAt: string; uploadedBy: string; note?: string }) => void;
  setCurrentVersion: (docId: string, v: number) => void;
  updateDocument: (docId: string, patch: Partial<Omit<Document, 'id' | 'projectId' | 'versions'>>) => void;
  updateDocumentTags: (docId: string, tags: Document['tags']) => void;

  // Admin config
  reorderPhases: (order: Phase[]) => void;
  // Template / structure
  createTemplate: (input: { name: string; description?: string; baseTemplateId?: string }) => TemplateConfig;
  renameTemplate: (templateId: string, patch: { name?: string; description?: string }) => void;
  addCategory: (phase: Phase, name: string, templateId?: string) => void;
  toggleCategory: (phase: Phase, name: string, enabled: boolean, templateId?: string) => void;
  addDocType: (name: string) => void;
  toggleDocType: (name: string, enabled: boolean) => void;

  // Taxonomy
  addTaxonomyItem: (group: 'projectTypes' | 'clientTypes' | 'deliverableTypes', value: string) => void;
  toggleTaxonomyItem: (group: 'projectTypes' | 'clientTypes' | 'deliverableTypes', id: string, enabled: boolean) => void;

  // Migration
  runMigrationImport: (mapping: MigrationMapping, actorName: string) => { created: number; warnings: string[] };
}

const DataContext = createContext<DataContextType | undefined>(undefined);

function todayISO() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function uid(prefix: string) {
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`;
}

function buildBaselineTemplate(): TemplateConfig {
  const categoriesByPhase = {
    Sale: DEFAULT_CATEGORIES.Sale.map((name) => ({ id: uid('cat'), name, enabled: true })),
    Planning: DEFAULT_CATEGORIES.Planning.map((name) => ({ id: uid('cat'), name, enabled: true })),
    Execution: DEFAULT_CATEGORIES.Execution.map((name) => ({ id: uid('cat'), name, enabled: true })),
    Closing: DEFAULT_CATEGORIES.Closing.map((name) => ({ id: uid('cat'), name, enabled: true })),
  } satisfies Record<Phase, CategoryConfig[]>;
  return {
    id: 'tpl_baseline',
    name: 'Baseline template',
    description: 'Default (v1) — 4 phases + starter categories',
    categoriesByPhase,
  };
}

export function DataProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<Project[]>(MOCK_PROJECTS);
  const [documents, setDocuments] = useState<Document[]>(MOCK_DOCUMENTS);

  const [phaseOrder, setPhaseOrder] = useState<Phase[]>([...PHASES]);
  const [templates, setTemplates] = useState<TemplateConfig[]>([buildBaselineTemplate()]);
  const [activeTemplateId] = useState<string>('tpl_baseline');

  const [docTypes, setDocTypes] = useState<DocTypeConfig[]>(
    DOC_TYPES.map((name, i) => ({
      id: `dt_${i}`,
      name,
      enabled: true,
      isDefault: i < 5,
      requiresAdminApproval: name === 'Other',
    }))
  );

  const [taxonomy, setTaxonomy] = useState<DataContextType['taxonomy']>({
    version: 'v1',
    projectTypes: PROJECT_TYPES,
    clientTypes: CLIENT_TYPES,
    deliverableTypes: DELIVERABLE_TYPES,
  });

  const getProjectById = (id: string) => projects.find((p) => p.id === id);
  const getDocById = (id: string) => documents.find((d) => d.id === id);

  const getDocsByProject = (projectId: string) => documents.filter((d) => d.projectId === projectId);
  const getDocsByPhase = (projectId: string, phase: Phase) => documents.filter((d) => d.projectId === projectId && d.phase === phase);
  const getDocsByCategory = (projectId: string, phase: Phase, category: string) =>
    documents.filter((d) => d.projectId === projectId && d.phase === phase && d.category === category);

  const getCategoriesForProjectPhase = (projectId: string, phase: Phase) => {
    const p = getProjectById(projectId);
    if (!p) return [];
    return (p.categoriesByPhase?.[phase] || []).slice();
  };

  const createTemplate: DataContextType['createTemplate'] = (input) => {
    const base = templates.find((t) => t.id === (input.baseTemplateId || activeTemplateId)) || templates[0];
    const next: TemplateConfig = {
      id: uid('tpl'),
      name: input.name,
      description: input.description || `Custom template based on ${base.name}`,
      categoriesByPhase: {
        Sale: base.categoriesByPhase.Sale.map((c) => ({ ...c, id: uid('cat') })),
        Planning: base.categoriesByPhase.Planning.map((c) => ({ ...c, id: uid('cat') })),
        Execution: base.categoriesByPhase.Execution.map((c) => ({ ...c, id: uid('cat') })),
        Closing: base.categoriesByPhase.Closing.map((c) => ({ ...c, id: uid('cat') })),
      },
    };
    setTemplates((prev) => [next, ...prev]);
    return next;
  };

  const renameTemplate: DataContextType['renameTemplate'] = (templateId, patch) => {
    setTemplates((prev) => prev.map((t) => (t.id === templateId ? { ...t, ...patch } : t)));
  };

  const createProject: DataContextType['createProject'] = (input) => {
    const now = todayISO();
    const templateId = input.templateId || activeTemplateId;
    const tpl = templates.find((t) => t.id === templateId) || templates[0];
    const categoriesByPhase: Project['categoriesByPhase'] = {
      Sale: tpl.categoriesByPhase.Sale.filter((c) => c.enabled).map((c) => c.name),
      Planning: tpl.categoriesByPhase.Planning.filter((c) => c.enabled).map((c) => c.name),
      Execution: tpl.categoriesByPhase.Execution.filter((c) => c.enabled).map((c) => c.name),
      Closing: tpl.categoriesByPhase.Closing.filter((c) => c.enabled).map((c) => c.name),
    };
    const project: Project = {
      id: uid('p'),
      name: input.name,
      code: input.code,
      clientName: input.clientName,
      projectType: input.projectType,
      status: 'Active',
      createdAt: now,
      updatedAt: now,
      phases: phaseOrder,
      categoriesByPhase,
    };
    setProjects((prev) => [project, ...prev]);
    return project;
  };

  const uploadDocument: DataContextType['uploadDocument'] = (input) => {
    const now = input.date || todayISO();
    const docId = uid('d');
    const doc: Document = {
      id: docId,
      projectId: input.projectId,
      title: input.title,
      phase: input.phase,
      category: input.category,
      docType: input.docType,
      owner: input.owner,
      status: input.status,
      versionCurrent: 1,
      versions: [
        {
          v: 1,
          fileName: input.fileName,
          uploadedAt: now,
          uploadedBy: input.uploadedBy,
          note: input.versionNote || '',
        },
      ],
      tags: input.tags,
      createdAt: now,
      updatedAt: now,
      imported: input.imported,
    };
    setDocuments((prev) => [doc, ...prev]);
    setProjects((prev) => prev.map((p) => (p.id === input.projectId ? { ...p, updatedAt: now } : p)));
    return doc;
  };

  const addVersion: DataContextType['addVersion'] = (docId, input) => {
    setDocuments((prev) =>
      prev.map((d) => {
        if (d.id !== docId) return d;
        const nextV = (d.versions?.reduce((m, x) => Math.max(m, x.v), 0) || 0) + 1;
        const updatedAt = input.uploadedAt || todayISO();
        return {
          ...d,
          versionCurrent: nextV,
          versions: [
            ...d.versions,
            { v: nextV, fileName: input.fileName, uploadedAt: updatedAt, uploadedBy: input.uploadedBy, note: input.note || '' },
          ],
          updatedAt,
        };
      })
    );
  };

  const setCurrentVersion: DataContextType['setCurrentVersion'] = (docId, v) => {
    setDocuments((prev) => prev.map((d) => (d.id === docId ? { ...d, versionCurrent: v, updatedAt: todayISO() } : d)));
  };

  const updateDocument: DataContextType['updateDocument'] = (docId, patch) => {
    setDocuments((prev) => prev.map((d) => (d.id === docId ? { ...d, ...patch, updatedAt: todayISO() } : d)));
  };

  const updateDocumentTags: DataContextType['updateDocumentTags'] = (docId, tags) => {
    setDocuments((prev) => prev.map((d) => (d.id === docId ? { ...d, tags, updatedAt: todayISO() } : d)));
  };

  const reorderPhases: DataContextType['reorderPhases'] = (order) => {
    // POC: reorder only (no delete)
    if (order.length !== 4) return;
    setPhaseOrder(order);
    setProjects((prev) => prev.map((p) => ({ ...p, phases: order })));
  };

  const addCategory: DataContextType['addCategory'] = (phase, name, templateId) => {
    const trimmed = name.trim();
    if (!trimmed) return;

    const targetId = templateId || activeTemplateId;

    // Update template
    setTemplates((prev) =>
      prev.map((t) => {
        if (t.id !== targetId) return t;
        const exists = t.categoriesByPhase[phase].some((c) => c.name.toLowerCase() === trimmed.toLowerCase());
        if (exists) return t;
        return {
          ...t,
          categoriesByPhase: {
            ...t.categoriesByPhase,
            [phase]: [...t.categoriesByPhase[phase], { id: uid('cat'), name: trimmed, enabled: true }],
          },
        };
      })
    );

    // POC convenience: if editing baseline template, also add the category to existing projects
    if (targetId === activeTemplateId) {
      setProjects((prev) =>
        prev.map((p) => {
          const list = p.categoriesByPhase[phase] || [];
          if (list.includes(trimmed)) return p;
          return { ...p, categoriesByPhase: { ...p.categoriesByPhase, [phase]: [...list, trimmed] } };
        })
      );
    }
  };

  const toggleCategory: DataContextType['toggleCategory'] = (phase, name, enabled, templateId) => {
    // For POC: disabling a category only affects template + future projects; existing projects keep structure.
    const targetId = templateId || activeTemplateId;
    setTemplates((prev) =>
      prev.map((t) => {
        if (t.id !== targetId) return t;
        return {
          ...t,
          categoriesByPhase: {
            ...t.categoriesByPhase,
            [phase]: t.categoriesByPhase[phase].map((c) => (c.name === name ? { ...c, enabled } : c)),
          },
        };
      })
    );
  };

  const addDocType: DataContextType['addDocType'] = (name) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setDocTypes((prev) => {
      if (prev.some((d) => d.name.toLowerCase() === trimmed.toLowerCase())) return prev;
      return [...prev, { id: uid('dt'), name: trimmed, enabled: true, isDefault: false, requiresAdminApproval: trimmed === 'Other' }];
    });
  };

  const toggleDocType: DataContextType['toggleDocType'] = (name, enabled) => {
    setDocTypes((prev) => prev.map((d) => (d.name === name ? { ...d, enabled } : d)));
  };

  const addTaxonomyItem: DataContextType['addTaxonomyItem'] = (group, value) => {
    const trimmed = value.trim();
    if (!trimmed) return;
    setTaxonomy((prev) => {
      if (prev[group].some((x) => x.value.toLowerCase() === trimmed.toLowerCase())) return prev;
      return {
        ...prev,
        [group]: [...prev[group], { id: uid('tax'), value: trimmed, enabled: true }],
      };
    });
  };

  const toggleTaxonomyItem: DataContextType['toggleTaxonomyItem'] = (group, id, enabled) => {
    setTaxonomy((prev) => ({
      ...prev,
      [group]: prev[group].map((x) => (x.id === id ? { ...x, enabled } : x)),
    }));
  };

  const runMigrationImport: DataContextType['runMigrationImport'] = (mapping, actorName) => {
    const warnings: string[] = [];
    const project = getProjectById(mapping.projectId);
    if (!project) return { created: 0, warnings: ['Project not found'] };

    let created = 0;
    mapping.items.forEach((it) => {
      if (!it.phase || !it.category) {
        warnings.push(`Missing mapping for: ${it.sourcePath}`);
        return;
      }
      const fileName = it.sourcePath.split('/').pop() || 'Imported_File';
      uploadDocument({
        projectId: mapping.projectId,
        fileName,
        title: fileName.replace(/\.[^/.]+$/, ''),
        phase: it.phase,
        category: it.category,
        docType: it.docType || 'Other',
        owner: actorName,
        status: 'Draft',
        versionNote: 'Imported from Google Drive (mock)',
        date: todayISO(),
        tags: {
          projectType: project.projectType,
          clientType: 'Other',
          deliverableType: 'Document',
        },
        uploadedBy: actorName,
        imported: true,
      });
      created += 1;
    });
    return { created, warnings };
  };

  const value = useMemo<DataContextType>(
    () => ({
      projects,
      documents,
      phaseOrder,
      templates,
      activeTemplateId,
      docTypes,
      taxonomy,
      getProjectById,
      getDocById,
      getDocsByProject,
      getDocsByPhase,
      getDocsByCategory,
      getCategoriesForProjectPhase,
      createTemplate,
      renameTemplate,
      createProject,
      uploadDocument,
      addVersion,
      setCurrentVersion,
      updateDocument,
      updateDocumentTags,
      reorderPhases,
      addCategory,
      toggleCategory,
      addDocType,
      toggleDocType,
      addTaxonomyItem,
      toggleTaxonomyItem,
      runMigrationImport,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [projects, documents, phaseOrder, templates, activeTemplateId, docTypes, taxonomy]
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
}
