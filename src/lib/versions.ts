export const GUIDE_VERSIONS = ['2024', '2025', '2026'] as const;
export type GuideVersion = typeof GUIDE_VERSIONS[number];

export interface BiomarkerThreshold {
  normal: number;
  moderate: number;
  severe: number;
  unit: string;
}

export interface VersionedBiomarkers {
  dlactate: BiomarkerThreshold;
  ifabp: BiomarkerThreshold;
  pct: BiomarkerThreshold;
  crp: BiomarkerThreshold;
  pla2: BiomarkerThreshold;
  hladr: BiomarkerThreshold;
}

export const BIOMARKER_VERSIONS: Record<GuideVersion, VersionedBiomarkers> = {
  '2024': {
    dlactate: { normal: 0.5, moderate: 1.5, severe: 2.5, unit: 'mmol/L' },
    ifabp: { normal: 100, moderate: 250, severe: 400, unit: 'pg/mL' },
    pct: { normal: 0.5, moderate: 1.5, severe: 2.0, unit: 'ng/mL' },
    crp: { normal: 10, moderate: 150, severe: 200, unit: 'mg/L' },
    pla2: { normal: 10, moderate: 15, severe: 25, unit: 'U/mL' },
    hladr: { normal: 60, moderate: 50, severe: 30, unit: '%' },
  },
  '2025': {
    dlactate: { normal: 0.5, moderate: 2.0, severe: 3.0, unit: 'mmol/L' },
    ifabp: { normal: 150, moderate: 300, severe: 500, unit: 'pg/mL' },
    pct: { normal: 0.5, moderate: 2.0, severe: 10, unit: 'ng/mL' },
    crp: { normal: 10, moderate: 200, severe: 300, unit: 'mg/L' },
    pla2: { normal: 10, moderate: 20, severe: 30, unit: 'U/mL' },
    hladr: { normal: 60, moderate: 45, severe: 30, unit: '%' },
  },
  '2026': {
    dlactate: { normal: 0.5, moderate: 2.0, severe: 3.0, unit: 'mmol/L' },
    ifabp: { normal: 150, moderate: 300, severe: 500, unit: 'pg/mL' },
    pct: { normal: 0.5, moderate: 2.0, severe: 10, unit: 'ng/mL' },
    crp: { normal: 10, moderate: 200, severe: 300, unit: 'mg/L' },
    pla2: { normal: 10, moderate: 20, severe: 30, unit: 'U/mL' },
    hladr: { normal: 60, moderate: 45, severe: 30, unit: '%' },
  },
};

export const VERSION_NOTES: Record<GuideVersion, string> = {
  '2024': 'Архивная версия. Прокальцитонин пороги пересмотрены в 2025.',
  '2025': 'Текущая версия. Обновлены пороги IL-10 метаболизма.',
  '2026': 'Новая версия. Актуальная на 11.08.2026. Добавлены метаболические сигнатуры.',
};

export function getCurrentVersion(): GuideVersion {
  const saved = localStorage.getItem('guide_version');
  if (saved && GUIDE_VERSIONS.includes(saved as GuideVersion)) {
    return saved as GuideVersion;
  }
  return '2026';
}

export function setCurrentVersion(version: GuideVersion) {
  localStorage.setItem('guide_version', version);
}

export function getBiomarkerThresholds(version?: GuideVersion): VersionedBiomarkers {
  const v = version || getCurrentVersion();
  return BIOMARKER_VERSIONS[v];
}
