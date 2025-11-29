#!/usr/bin/env node

/**
 * Script de vérification des traductions Hoomy
 * 
 * Vérifie :
 * - Complétude : toutes les clés traduites dans toutes les langues
 * - Paramètres : cohérence des {variables}
 * - Pluralisation : syntaxe correcte
 * 
 * Usage : node check-translations.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const LANGUAGES = ['fr', 'en', 'it', 'de-ch'];
const I18N_FILE = path.join(__dirname, 'client', 'src', 'lib', 'i18n.ts');

console.log('🔍 Vérification des traductions Hoomy...\n');

// Couleurs pour le terminal
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Lire le fichier i18n.ts
let content;
try {
  content = fs.readFileSync(I18N_FILE, 'utf-8');
  log('✅ Fichier i18n.ts chargé avec succès', 'green');
} catch (error) {
  log(`❌ Erreur lors de la lecture du fichier : ${error.message}`, 'red');
  process.exit(1);
}

// Extraire les traductions (regex simple pour cet exemple)
function extractTranslations(content, lang) {
  const regex = new RegExp(`${lang}:\\s*{([^}]+(?:{[^}]+}[^}]+)*)}`, 's');
  const match = content.match(regex);
  if (!match) return {};
  
  const translations = {};
  const keyValueRegex = /'([^']+)':\s*'([^']*(?:\\'[^']*)*)'/g;
  let keyMatch;
  
  while ((keyMatch = keyValueRegex.exec(match[1])) !== null) {
    translations[keyMatch[1]] = keyMatch[2];
  }
  
  return translations;
}

// Extraire toutes les clés possibles
function getAllKeys(content) {
  const keys = new Set();
  const keyRegex = /'([a-z0-9._]+)':\s*(?:'[^']*'|{)/gi;
  let match;
  
  while ((match = keyRegex.exec(content)) !== null) {
    const key = match[1];
    // Filtrer les clés de langue (fr, en, it, de-ch)
    if (!LANGUAGES.includes(key)) {
      keys.add(key);
    }
  }
  
  return Array.from(keys).sort();
}

// Extraire les paramètres d'une traduction
function extractParameters(text) {
  const params = new Set();
  const paramRegex = /{(\w+)(?:,\s*plural[^}]*)?}/g;
  let match;
  
  while ((match = paramRegex.exec(text)) !== null) {
    params.add(match[1]);
  }
  
  return Array.from(params);
}

// Vérifier la syntaxe de pluralisation
function checkPluralization(text) {
  const pluralRegex = /{(\w+),\s*plural,\s*=1\s*{([^}]+)}\s*other\s*{([^}]+)}}/g;
  return pluralRegex.test(text);
}

// Analyse principale
const allKeys = getAllKeys(content);
log(`\n📊 Statistiques générales :`, 'cyan');
log(`   - Total de clés détectées : ${allKeys.length}`);
log(`   - Langues configurées : ${LANGUAGES.join(', ')}\n`);

const translations = {};
LANGUAGES.forEach(lang => {
  translations[lang] = extractTranslations(content, lang);
});

// 1. Vérification de complétude
log('1️⃣  Vérification de complétude', 'blue');
log('─'.repeat(50));

const missingKeys = {};
let totalMissing = 0;

LANGUAGES.forEach(lang => {
  const missing = allKeys.filter(key => !translations[lang][key]);
  if (missing.length > 0) {
    missingKeys[lang] = missing;
    totalMissing += missing.length;
  }
});

if (totalMissing === 0) {
  log('✅ Toutes les clés sont traduites dans toutes les langues', 'green');
} else {
  log(`❌ ${totalMissing} traductions manquantes détectées`, 'red');
  Object.entries(missingKeys).forEach(([lang, keys]) => {
    log(`\n   ${lang.toUpperCase()} (${keys.length} manquantes) :`, 'yellow');
    keys.slice(0, 10).forEach(key => {
      log(`      - ${key}`, 'yellow');
    });
    if (keys.length > 10) {
      log(`      ... et ${keys.length - 10} autres`, 'yellow');
    }
  });
}

// 2. Vérification de cohérence des paramètres
log('\n2️⃣  Vérification de cohérence des paramètres', 'blue');
log('─'.repeat(50));

const parameterIssues = [];

allKeys.forEach(key => {
  const paramsByLang = {};
  LANGUAGES.forEach(lang => {
    if (translations[lang][key]) {
      paramsByLang[lang] = extractParameters(translations[lang][key]);
    }
  });
  
  // Comparer les paramètres entre langues
  const languages = Object.keys(paramsByLang);
  if (languages.length > 1) {
    const firstParams = paramsByLang[languages[0]].sort().join(',');
    for (let i = 1; i < languages.length; i++) {
      const currentParams = paramsByLang[languages[i]].sort().join(',');
      if (firstParams !== currentParams) {
        parameterIssues.push({
          key,
          lang1: languages[0],
          params1: paramsByLang[languages[0]],
          lang2: languages[i],
          params2: paramsByLang[languages[i]],
        });
      }
    }
  }
});

if (parameterIssues.length === 0) {
  log('✅ Tous les paramètres sont cohérents entre les langues', 'green');
} else {
  log(`⚠️  ${parameterIssues.length} incohérences de paramètres détectées`, 'yellow');
  parameterIssues.slice(0, 5).forEach(issue => {
    log(`\n   Clé : ${issue.key}`, 'yellow');
    log(`      ${issue.lang1}: {${issue.params1.join(', ')}}`, 'yellow');
    log(`      ${issue.lang2}: {${issue.params2.join(', ')}}`, 'yellow');
  });
  if (parameterIssues.length > 5) {
    log(`\n   ... et ${parameterIssues.length - 5} autres incohérences`, 'yellow');
  }
}

// 3. Vérification des traductions vides
log('\n3️⃣  Vérification des traductions vides', 'blue');
log('─'.repeat(50));

const emptyTranslations = [];

LANGUAGES.forEach(lang => {
  Object.entries(translations[lang]).forEach(([key, value]) => {
    if (value.trim() === '') {
      emptyTranslations.push({ lang, key });
    }
  });
});

if (emptyTranslations.length === 0) {
  log('✅ Aucune traduction vide détectée', 'green');
} else {
  log(`⚠️  ${emptyTranslations.length} traductions vides détectées`, 'yellow');
  emptyTranslations.slice(0, 10).forEach(({ lang, key }) => {
    log(`   - ${lang}: ${key}`, 'yellow');
  });
  if (emptyTranslations.length > 10) {
    log(`   ... et ${emptyTranslations.length - 10} autres`, 'yellow');
  }
}

// 4. Vérification de la pluralisation
log('\n4️⃣  Détection des clés avec pluralisation', 'blue');
log('─'.repeat(50));

const pluralKeys = [];

allKeys.forEach(key => {
  LANGUAGES.forEach(lang => {
    if (translations[lang][key] && translations[lang][key].includes('plural')) {
      if (!pluralKeys.find(p => p.key === key)) {
        const hasCorrectSyntax = {};
        LANGUAGES.forEach(l => {
          if (translations[l][key]) {
            hasCorrectSyntax[l] = checkPluralization(translations[l][key]);
          }
        });
        pluralKeys.push({ key, hasCorrectSyntax });
      }
    }
  });
});

if (pluralKeys.length === 0) {
  log('ℹ️  Aucune clé avec pluralisation détectée', 'cyan');
} else {
  log(`✅ ${pluralKeys.length} clés avec pluralisation détectées`, 'green');
  pluralKeys.forEach(({ key, hasCorrectSyntax }) => {
    const allCorrect = Object.values(hasCorrectSyntax).every(v => v);
    const icon = allCorrect ? '✅' : '⚠️';
    log(`   ${icon} ${key}`, allCorrect ? 'green' : 'yellow');
  });
}

// 5. Statistiques par langue
log('\n5️⃣  Statistiques par langue', 'blue');
log('─'.repeat(50));

LANGUAGES.forEach(lang => {
  const total = allKeys.length;
  const translated = Object.keys(translations[lang]).length;
  const percentage = ((translated / total) * 100).toFixed(1);
  const missing = total - translated;
  
  const color = percentage >= 100 ? 'green' : percentage >= 90 ? 'yellow' : 'red';
  log(`   ${lang.padEnd(6)} : ${translated}/${total} (${percentage}%) - ${missing} manquantes`, color);
});

// 6. Détection de clés suspectes (potentiellement non traduites)
log('\n6️⃣  Détection de clés suspectes', 'blue');
log('─'.repeat(50));

const suspiciousKeys = [];

allKeys.forEach(key => {
  // Vérifier si toutes les traductions sont identiques (suspect)
  const values = LANGUAGES.map(lang => translations[lang][key]).filter(Boolean);
  if (values.length >= 3) {
    const uniqueValues = new Set(values);
    if (uniqueValues.size === 1) {
      suspiciousKeys.push({ key, value: values[0] });
    }
  }
});

if (suspiciousKeys.length === 0) {
  log('✅ Aucune clé suspecte détectée', 'green');
} else {
  log(`⚠️  ${suspiciousKeys.length} clés suspectes (traductions identiques) détectées`, 'yellow');
  suspiciousKeys.slice(0, 5).forEach(({ key, value }) => {
    log(`   - ${key}: "${value}"`, 'yellow');
  });
  if (suspiciousKeys.length > 5) {
    log(`   ... et ${suspiciousKeys.length - 5} autres`, 'yellow');
  }
}

// Résumé final
log('\n' + '═'.repeat(50), 'cyan');
log('📋 RÉSUMÉ', 'cyan');
log('═'.repeat(50), 'cyan');

const issues = [];
if (totalMissing > 0) issues.push(`${totalMissing} traductions manquantes`);
if (parameterIssues.length > 0) issues.push(`${parameterIssues.length} incohérences de paramètres`);
if (emptyTranslations.length > 0) issues.push(`${emptyTranslations.length} traductions vides`);
if (suspiciousKeys.length > 0) issues.push(`${suspiciousKeys.length} clés suspectes`);

if (issues.length === 0) {
  log('\n🎉 Félicitations ! Aucun problème détecté.', 'green');
  log('   Vos traductions sont complètes et cohérentes.\n', 'green');
} else {
  log('\n⚠️  Problèmes détectés :', 'yellow');
  issues.forEach(issue => {
    log(`   - ${issue}`, 'yellow');
  });
  log('\nConsultez TRANSLATION_PROMPT.md pour des guides de traduction.', 'cyan');
  log('Utilisez PROMPT_READY_TO_USE.md pour générer les traductions manquantes.\n', 'cyan');
}

log('─'.repeat(50));
log('Analyse terminée ✨\n', 'cyan');

