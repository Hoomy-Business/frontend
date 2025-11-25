# 🚀 Cheat Sheet - Traductions Hoomy

## ⚡ Commande Principale

```bash
npm run check-translations
```

---

## 📝 Générer des Traductions (2 min)

1. Ouvrir `PROMPT_READY_TO_USE.md`
2. Copier le prompt principal
3. Coller dans ChatGPT/Claude
4. Ajouter vos clés
5. Obtenir les 4 traductions

---

## 🎯 Workflow Rapide

```
Vérifier → Générer → Intégrer → Tester
   ↓          ↓          ↓         ↓
  npm      Prompt     i18n.ts    npm
 check     + IA      (éditer)   dev
```

---

## 📖 Où Trouver Quoi ?

| Besoin | Fichier |
|--------|---------|
| **Démarrer** | START_HERE.md |
| **Générer traductions** | PROMPT_READY_TO_USE.md |
| **Exemples complets** | TEMPLATE_NOUVELLES_TRADUCTIONS.md |
| **Règles détaillées** | TRANSLATION_PROMPT.md |
| **Guide complet** | TRADUCTIONS_README.md |
| **Vérifier** | `npm run check-translations` |

---

## 🌍 Langues

- 🇫🇷 FR (français)
- 🇬🇧 EN (english)
- 🇮🇹 IT (italiano)
- 🇨🇭 DE-CH (schweizerdeutsch)

---

## 💡 Terminologie Clé

| Français | EN | IT | DE-CH |
|----------|----|----|-------|
| Propriété | Property | Proprietà | Immobilie |
| Étudiant | Student | Studente | Studänt |
| Connexion | Login | Accesso | Aamäldig |

---

## ⚠️ Dialecte Suisse (Important !)

| ❌ Standard | ✅ Suisse |
|------------|----------|
| Anmelden | Aamälde |
| deine | dini |
| in der | i de |
| hast | hesch |

**Toujours utiliser le dialecte suisse pour DE-CH !**

---

## 🔧 Format des Traductions

```typescript
// Simple
'key': 'Texte'

// Avec paramètre
'key': 'Hello {name}'

// Avec pluralisation
'key': '{count} {count, plural, =1 {item} other {items}}'
```

---

## ✅ Checklist Rapide

Avant de valider :

- [ ] `npm run check-translations` passe
- [ ] Testé dans l'app (`npm run dev`)
- [ ] DE-CH est dialectal (pas standard)
- [ ] Tous les `{paramètres}` préservés
- [ ] Longueur OK pour l'UI

---

## 🆘 Problème Fréquent

**Traductions manquantes ?**
→ `PROMPT_READY_TO_USE.md` + ChatGPT

**DE-CH pas assez dialectal ?**
→ `TRANSLATION_PROMPT.md` section "Allemand Suisse"

**Paramètres incohérents ?**
→ Le script les détecte automatiquement

---

## 🎯 Temps Estimés

| Tâche | Temps |
|-------|-------|
| Nouvelle section complète | 10-15 min |
| Améliorer une traduction | 5 min |
| Audit complet | 30 min |

---

## 📞 Support Rapide

```
Question générale → START_HERE.md
Besoin de générer → PROMPT_READY_TO_USE.md
Besoin d'exemples → TEMPLATE_NOUVELLES_TRADUCTIONS.md
Règles spécifiques → TRANSLATION_PROMPT.md
```

---

**Gardez cette page sous la main ! 📌**

