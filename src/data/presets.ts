import { PresetApp } from "../types";

// Helper to create realistic SVG mobile mockups as base64 data URLs
function escapeXml(str: string): string {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}

function createSvgScreen(title: string, subtitle: string, accentColor: string, bgColor: string, elements: string): string {
  const safeTitle = escapeXml(title);
  const safeSubtitle = escapeXml(subtitle);
  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 390 844" width="390" height="844">
  <defs>
    <linearGradient id="bgGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${bgColor}" />
      <stop offset="100%" stop-color="${bgColor === '#0F172A' ? '#020617' : '#F1F5F9'}" />
    </linearGradient>
    <linearGradient id="accentGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${accentColor}" />
      <stop offset="100%" stop-color="${accentColor}CC" />
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="390" height="844" fill="url(#bgGrad)" />

  <!-- Status Bar -->
  <text x="32" y="38" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="14" font-weight="600" fill="${bgColor === '#0F172A' ? '#F8FAFC' : '#0F172A'}">9:41</text>
  <circle cx="330" cy="34" r="3" fill="${bgColor === '#0F172A' ? '#94A3B8' : '#64748B'}" />
  <circle cx="340" cy="34" r="4" fill="${bgColor === '#0F172A' ? '#94A3B8' : '#64748B'}" />
  <rect x="352" y="28" width="22" height="11" rx="3" fill="none" stroke="${bgColor === '#0F172A' ? '#94A3B8' : '#64748B'}" stroke-width="1.5" />
  <rect x="354" y="30" width="14" height="7" rx="1.5" fill="${accentColor}" />

  <!-- Top App Header -->
  <text x="24" y="86" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="22" font-weight="700" fill="${bgColor === '#0F172A' ? '#FFFFFF' : '#0F172A'}">${safeTitle}</text>
  <text x="24" y="110" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="13" font-weight="500" fill="${bgColor === '#0F172A' ? '#94A3B8' : '#64748B'}">${safeSubtitle}</text>

  <!-- Content Elements -->
  ${elements}

  <!-- Bottom Navigation Bar -->
  <rect x="0" y="760" width="390" height="84" fill="${bgColor === '#0F172A' ? '#1E293B' : '#FFFFFF'}" opacity="0.9" />
  <circle cx="65" cy="790" r="16" fill="${accentColor}" opacity="0.2" />
  <circle cx="65" cy="790" r="8" fill="${accentColor}" />
  <circle cx="150" cy="790" r="6" fill="${bgColor === '#0F172A' ? '#64748B' : '#94A3B8'}" />
  <circle cx="240" cy="790" r="6" fill="${bgColor === '#0F172A' ? '#64748B' : '#94A3B8'}" />
  <circle cx="325" cy="790" r="6" fill="${bgColor === '#0F172A' ? '#64748B' : '#94A3B8'}" />
  <rect x="130" y="830" width="130" height="4" rx="2" fill="${bgColor === '#0F172A' ? '#64748B' : '#94A3B8'}" />
</svg>
  `;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

// FitPulse SVG screens
const fitPulse1 = createSvgScreen(
  "FitPulse Pro",
  "Tableau de bord forme & cardio",
  "#10B981",
  "#0F172A",
  `
  <!-- Activity Card -->
  <rect x="24" y="130" width="342" height="170" rx="20" fill="#1E293B" />
  <text x="44" y="165" font-family="sans-serif" font-size="14" font-weight="600" fill="#94A3B8">OBJECTIF DU JOUR</text>
  <text x="44" y="200" font-family="sans-serif" font-size="28" font-weight="800" fill="#FFFFFF">780 / 900 <tspan font-size="16" fill="#10B981">kcal</tspan></text>
  <rect x="44" y="220" width="302" height="10" rx="5" fill="#334155" />
  <rect x="44" y="220" width="250" height="10" rx="5" fill="#10B981" />
  <text x="44" y="258" font-family="sans-serif" font-size="13" fill="#E2E8F0">🔥 14 jours de série active</text>
  <text x="240" y="258" font-family="sans-serif" font-size="13" fill="#38BDF8">⏱ 48 min d'effort</text>

  <!-- Quick Workout Card -->
  <rect x="24" y="320" width="342" height="140" rx="20" fill="#1E293B" />
  <rect x="44" y="340" width="60" height="60" rx="14" fill="#10B981" opacity="0.2" />
  <text x="64" y="378" font-size="24">⚡️</text>
  <text x="120" y="365" font-family="sans-serif" font-size="18" font-weight="700" fill="#FFFFFF">HIIT Brûle-Graisses</text>
  <text x="120" y="388" font-family="sans-serif" font-size="13" fill="#94A3B8">20 min • Intensité Haute • Sans matériel</text>
  <rect x="120" y="408" width="120" height="32" rx="16" fill="#10B981" />
  <text x="145" y="429" font-family="sans-serif" font-size="13" font-weight="600" fill="#0F172A">Démarrer</text>

  <!-- Health Stats Rows -->
  <rect x="24" y="480" width="162" height="120" rx="18" fill="#1E293B" />
  <text x="40" y="515" font-family="sans-serif" font-size="13" fill="#94A3B8">Fréquence Cardiaque</text>
  <text x="40" y="550" font-family="sans-serif" font-size="24" font-weight="800" fill="#F43F5E">68 <tspan font-size="14" fill="#94A3B8">bpm</tspan></text>
  <text x="40" y="578" font-family="sans-serif" font-size="12" fill="#10B981">Au repos • Optimal</text>

  <rect x="204" y="480" width="162" height="120" rx="18" fill="#1E293B" />
  <text x="220" y="515" font-family="sans-serif" font-size="13" fill="#94A3B8">Score de Sommeil</text>
  <text x="220" y="550" font-family="sans-serif" font-size="24" font-weight="800" fill="#818CF8">88 <tspan font-size="14" fill="#94A3B8">/100</tspan></text>
  <text x="220" y="578" font-family="sans-serif" font-size="12" fill="#818CF8">7h42 • Récupéré</text>
  `
);

const fitPulse2 = createSvgScreen(
  "Entraînement en cours",
  "Circuit Tabata 4/8",
  "#10B981",
  "#0F172A",
  `
  <!-- Live Timer Circle -->
  <circle cx="195" cy="270" r="110" fill="none" stroke="#334155" stroke-width="12" />
  <circle cx="195" cy="270" r="110" fill="none" stroke="#10B981" stroke-width="12" stroke-dasharray="690" stroke-dashoffset="180" stroke-linecap="round" />
  <text x="195" y="260" font-family="sans-serif" font-size="52" font-weight="900" fill="#FFFFFF" text-anchor="middle">00:32</text>
  <text x="195" y="295" font-family="sans-serif" font-size="14" font-weight="600" fill="#10B981" text-anchor="middle">BURPEES EXPLOSIFS</text>

  <!-- Live Stats -->
  <rect x="24" y="420" width="342" height="80" rx="18" fill="#1E293B" />
  <text x="60" y="455" font-family="sans-serif" font-size="12" fill="#94A3B8">PULSATIONS</text>
  <text x="60" y="482" font-family="sans-serif" font-size="20" font-weight="700" fill="#F43F5E">154 bpm</text>

  <text x="190" y="455" font-family="sans-serif" font-size="12" fill="#94A3B8">CALORIES</text>
  <text x="190" y="482" font-family="sans-serif" font-size="20" font-weight="700" fill="#FBBF24">215 kcal</text>

  <text x="295" y="455" font-family="sans-serif" font-size="12" fill="#94A3B8">SERIE</text>
  <text x="295" y="482" font-family="sans-serif" font-size="20" font-weight="700" fill="#10B981">4 / 8</text>

  <!-- Prochain Exercice -->
  <rect x="24" y="520" width="342" height="90" rx="18" fill="#1E293B" />
  <text x="44" y="555" font-family="sans-serif" font-size="13" fill="#94A3B8">À SUIVRE (PAUSE 15 SEC)</text>
  <text x="44" y="585" font-family="sans-serif" font-size="18" font-weight="700" fill="#FFFFFF">Mountain Climbers x 40 reps</text>
  `
);

// NovaPay SVG screens
const novaPay1 = createSvgScreen(
  "NovaPay",
  "Compte Principal & Épargne",
  "#6366F1",
  "#0B0F19",
  `
  <!-- Virtual Card -->
  <rect x="24" y="130" width="342" height="190" rx="22" fill="url(#accentGrad)" />
  <text x="50" y="170" font-family="sans-serif" font-size="18" font-weight="800" fill="#FFFFFF">NOVAPAY BLACK</text>
  <circle cx="320" cy="165" r="16" fill="#FFFFFF" opacity="0.2" />
  <circle cx="335" cy="165" r="16" fill="#F43F5E" opacity="0.6" />
  <text x="50" y="240" font-family="sans-serif" font-size="32" font-weight="900" fill="#FFFFFF">8 450,20 €</text>
  <text x="50" y="280" font-family="sans-serif" font-size="13" fill="#E0E7FF">•••• 4892  |  Exp 09/29</text>

  <!-- Action buttons -->
  <rect x="24" y="340" width="104" height="60" rx="16" fill="#1E293B" />
  <text x="76" y="375" font-size="20" text-anchor="middle">↗️</text>
  <text x="76" y="390" font-family="sans-serif" font-size="11" fill="#94A3B8" text-anchor="middle">Envoyer</text>

  <rect x="143" y="340" width="104" height="60" rx="16" fill="#1E293B" />
  <text x="195" y="375" font-size="20" text-anchor="middle">↙️</text>
  <text x="195" y="390" font-family="sans-serif" font-size="11" fill="#94A3B8" text-anchor="middle">Recevoir</text>

  <rect x="262" y="340" width="104" height="60" rx="16" fill="#1E293B" />
  <text x="314" y="375" font-size="20" text-anchor="middle">🏦</text>
  <text x="314" y="390" font-family="sans-serif" font-size="11" fill="#94A3B8" text-anchor="middle">Coffres</text>

  <!-- Coffres d'épargne auto -->
  <text x="24" y="440" font-family="sans-serif" font-size="16" font-weight="700" fill="#FFFFFF">Coffres & Projets</text>
  <rect x="24" y="460" width="342" height="85" rx="18" fill="#1E293B" />
  <text x="44" y="495" font-family="sans-serif" font-size="16" font-weight="600" fill="#FFFFFF">✈️ Voyage à Tokyo</text>
  <text x="280" y="495" font-family="sans-serif" font-size="14" font-weight="700" fill="#6366F1">1 850 / 2 500 €</text>
  <rect x="44" y="515" width="302" height="8" rx="4" fill="#334155" />
  <rect x="44" y="515" width="220" height="8" rx="4" fill="#6366F1" />

  <rect x="24" y="560" width="342" height="85" rx="18" fill="#1E293B" />
  <text x="44" y="595" font-family="sans-serif" font-size="16" font-weight="600" fill="#FFFFFF">🛡️ Réserve de Sécurité</text>
  <text x="280" y="595" font-family="sans-serif" font-size="14" font-weight="700" fill="#10B981">4 000 / 4 000 €</text>
  <rect x="44" y="615" width="302" height="8" rx="4" fill="#334155" />
  <rect x="44" y="615" width="302" height="8" rx="4" fill="#10B981" />
  `
);

export const PRESET_APPS: PresetApp[] = [
  {
    id: "fitpulse",
    name: "FitPulse Pro",
    category: "Santé, Fitness & Coaching",
    description: "Application mobile de coaching sportif personnalisé, suivi des séances cardio, HIIT et analyse biométrique du sommeil.",
    audience: "Jeunes actifs et sportifs souhaitant des entraînements rapides, motivants et sans équipement lourd.",
    images: [
      {
        id: "fitpulse-1",
        name: "fitpulse_dashboard.png",
        dataUrl: fitPulse1,
        previewUrl: fitPulse1,
        tag: "Tableau de bord",
        isPreset: true,
      },
      {
        id: "fitpulse-2",
        name: "fitpulse_workout_timer.png",
        dataUrl: fitPulse2,
        previewUrl: fitPulse2,
        tag: "Séance en direct",
        isPreset: true,
      },
    ],
  },
  {
    id: "novapay",
    name: "NovaPay",
    category: "Fintech, Néobanque & Épargne Intelligente",
    description: "Application bancaire mobile nouvelle version avec carte virtuelle, arrondis à l'euro supérieur et coffres d'épargne automatiques.",
    audience: "Millennials et freelances voulant maîtriser leur budget et épargner sans y penser avec une interface épurée.",
    images: [
      {
        id: "novapay-1",
        name: "novapay_carte_et_coffres.png",
        dataUrl: novaPay1,
        previewUrl: novaPay1,
        tag: "Cartes & Coffres",
        isPreset: true,
      },
    ],
  },
];
