import { MarketingSession, MultiMarketPlan, LocalizedMarketData } from "../types";

export function generateDefaultMultiMarketPlan(session: Partial<MarketingSession>): MultiMarketPlan {
  const appName = session.appOverview?.detectedName || "Notre App";
  const rawTitle = session.appStoreOptimization?.storeTitle || `${appName} - Votre compagnon quotidien`;
  const rawSubtitle = session.appStoreOptimization?.subtitle || "Gagnez du temps et optimisez votre vie";
  const rawKeywords = session.appStoreOptimization?.keywords || ["productivite", "organisation", "application", "focus", "temps"];

  const markets: Record<string, LocalizedMarketData> = {
    US: {
      marketCode: "US",
      marketName: "États-Unis & Marché Anglophone Global",
      flag: "🇺🇸",
      languageName: "English (US)",
      currencySymbol: "$",
      priceFormatted: "$39.99/year ($4.99/mo)",
      storeTitle: `${appName}: Habit & Daily Focus`,
      subtitle: "Simplify routine, achieve more",
      shortDescription: "The all-in-one daily companion designed to help you stay focused, beat distractions, and hit your personal goals.",
      keywords: ["habits", "daily focus", "planner", "routine tracker", "productivity app", "goals", "to do list", "workflow"],
      localizedUsp: "Eliminate friction and automate your daily success in 60 seconds a day.",
      culturalNuances: "Les utilisateurs US attendent des bénéfices immédiats (instant gratification), une intégration poussée aux widgets iOS et une communication sans détour. Les preuves sociales (avis, étoiles) sont primordiales.",
      poachingAngleLocal: "Positionnez l'app face aux géants surchargés de fonctionnalités inutiles en promettant 'Zero clutter, 100% execution'.",
    },
    DE: {
      marketCode: "DE",
      marketName: "Allemagne, Autriche & Suisse (DACH)",
      flag: "🇩🇪",
      languageName: "Deutsch",
      currencySymbol: "€",
      priceFormatted: "39,99 €/Jahr (4,99 €/Monat)",
      storeTitle: `${appName}: Fokus & Organisation`,
      subtitle: "Effizienz steigern, Ziele erreichen",
      shortDescription: "Ihr verlässlicher täglicher Assistent für strukturierte Tagesabläufe, nachhaltige Routinen und messbaren Erfolg.",
      keywords: ["produktivitat", "gewohnheiten", "tagesplaner", "selbstmanagement", "routine", "ziele", "zeitmanagement"],
      localizedUsp: "Strukturierte Effizienz und höchste Datensicherheit für Ihren anspruchsvollen Alltag.",
      culturalNuances: "Le marché allemand est particulièrement sensible à la confidentialité des données (RGPD / Datenschutz), à la clarté contractuelle et à l'absence de promesses exagérées. Mettez en avant la fiabilité et la précision technique.",
      poachingAngleLocal: "Soulignez l'absence de revente de données personnelles et la rigueur de l'architecture logicielle.",
    },
    JP: {
      marketCode: "JP",
      marketName: "Japon (Marché Mobile Premium)",
      flag: "🇯🇵",
      languageName: "日本語 (Japanese)",
      currencySymbol: "¥",
      priceFormatted: "¥4,800/年 (¥580/月)",
      storeTitle: `${appName}：毎日の習慣と集中力`,
      subtitle: "日々の目標をシンプルに継続",
      shortDescription: "無理なく続けられる毎日のスマートアシスタント。日々の習慣化と生産性向上を心地よくサポートします。",
      keywords: ["習慣化", "目標達成", "タスク管理", "集中力", "ルーティン", "生産性", "タイマー", "スケジュール"],
      localizedUsp: "心地よいデザインと丁寧なサポートで、無理のない継続と自己実現を応援します。",
      culturalNuances: "Au Japon, la politesse (Keigo), la confiance et l'harmonie visuelle sont fondamentales. Les paywalls agressifs sont mal perçus. Privilégiez des guides d'utilisation détaillés, des mascottes ou illustrations soignées et un support réactif.",
      poachingAngleLocal: "Mettez en avant le calme mental (mindfulness) et la sensation d'accomplissement sans stress ni pression.",
    },
    ES: {
      marketCode: "ES",
      marketName: "Espagne & Amérique Latine (Hispano)",
      flag: "🇪🇸",
      languageName: "Español",
      currencySymbol: "€ / $",
      priceFormatted: "29,99 €/año (o $29.99 USD/año)",
      storeTitle: `${appName}: Hábitos y Rutina Diaria`,
      subtitle: "Organiza tu día y supera tus metas",
      shortDescription: "La herramienta definitiva para crear hábitos duraderos, mejorar tu rendimiento y alcanzar tus objetivos sin complicaciones.",
      keywords: ["productividad", "habitos", "rutina diaria", "organizador", "metas", "enfoque", "tareas", "recordatorios"],
      localizedUsp: "Tu compañero de confianza para transformar tu rutina y disfrutar de cada logro diario.",
      culturalNuances: "Le public hispanophone réagit très positivement à un ton chaleureux, communautaire et enthousiaste. Les vidéos UGC avec des créateurs expressifs et les témoignages avant/après fonctionnent remarquablement.",
      poachingAngleLocal: "Mettez l'accent sur la simplicité d'accès, la générosité de la version gratuite et l'énergie positive dégagée.",
    },
    FR: {
      marketCode: "FR",
      marketName: "France & Francophonie",
      flag: "🇫🇷",
      languageName: "Français",
      currencySymbol: "€",
      priceFormatted: "39,99 €/an (soit 3,33 €/mois)",
      storeTitle: rawTitle.slice(0, 30),
      subtitle: rawSubtitle.slice(0, 30),
      shortDescription: session.appStoreOptimization?.shortDescription || "L'application conçue pour booster votre productivité quotidienne sans effort.",
      keywords: rawKeywords.slice(0, 8),
      localizedUsp: session.appOverview?.uniqueValueProposition || "La solution mobile élégante qui simplifie votre vie.",
      culturalNuances: "Les utilisateurs français apprécient l'élégance typographique, un français irréprochable sans anglicismes excessifs et une transparence totale sur les conditions d'abonnement.",
      poachingAngleLocal: "Proposez une alternative moderne, soignée et sans friction face aux logiciels d'entreprise austères.",
    },
  };

  return {
    markets,
    globalStrategyAdvice: `Pour réussir un déploiement international, commencez par le marché US pour valider le CAC et le CVR, puis déployez en priorité sur le marché DACH (très forte valeur par utilisateur) et le marché Japonais (extrême fidélité et rétention à long terme).`,
  };
}
