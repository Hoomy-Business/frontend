# Prompt de Traduction Profonde pour Hoomy Platform

## Contexte du Projet

**Hoomy** est une plateforme suisse de location de logements étudiants qui connecte propriétaires et étudiants dans toute la Suisse. La plateforme doit être accessible en **4 langues officielles suisses** :

- 🇫🇷 **Français (FR)** - Langue de référence
- 🇬🇧 **Anglais (EN)** - Pour les étudiants internationaux
- 🇮🇹 **Italien (IT)** - Pour la Suisse italophone (Tessin)
- 🇨🇭 **Allemand Suisse (DE-CH)** - Schweizerdeutsch/Suisse alémanique

---

## Objectifs de Traduction

### 1. **Exactitude Contextuelle**
- Adapter les traductions au contexte immobilier et étudiant
- Respecter la terminologie légale suisse pour les contrats de location
- Utiliser le vocabulaire approprié pour chaque région linguistique

### 2. **Cohérence Culturelle**
- **Allemand Suisse (DE-CH)** : Utiliser le dialecte/expressions suisses allemandes authentiques (ex: "Aamälde" au lieu de "Anmelden", "Willkomme zrugg" au lieu de "Willkommen zurück")
- **Italien** : Adapter au contexte du Tessin
- **Français** : Ton formel mais accessible
- **Anglais** : Ton international et accueillant

### 3. **Ton et Style**
- **Professionnel mais accessible** : Le site s'adresse à des étudiants
- **Rassurant et sécurisé** : Mettre en avant la vérification et la sécurité
- **Action-oriented** : Encourager les interactions (recherche, inscription, contact)
- **Empathique** : Comprendre les défis de la recherche de logement étudiant

---

## Structure des Traductions

Le fichier `client/src/lib/i18n.ts` contient toutes les traductions organisées par sections :

### Sections Principales
1. **Navigation** (`nav.*`) - Menu et navigation du site
2. **Landing Page** (`landing.*`) - Page d'accueil et présentation
3. **Properties** (`properties.*`) - Liste et recherche de propriétés
4. **Property Detail** (`property.*`) - Page de détail d'une propriété
5. **Dashboard** (`dashboard.*`) - Tableaux de bord (étudiant/propriétaire)
6. **Login & Register** (`login.*`, `register.*`) - Authentification
7. **Messages** (`messages.*`) - Système de messagerie
8. **Property Forms** (`property.form.*`) - Création/édition de propriétés
9. **Common** (`common.*`) - Éléments communs
10. **Footer** (`footer.*`) - Pied de page

### Données Géographiques
- **Cantons** - Les 26 cantons suisses (avec traductions spécifiques)
- **Villes** - Principales villes universitaires suisses

---

## Règles de Traduction Spécifiques

### Format et Syntaxe
```typescript
'key.name': 'Traduction avec {paramètre} et {count, plural, =1 {singulier} other {pluriel}}'
```

#### Paramètres Dynamiques
- `{name}` - Nom d'utilisateur
- `{count}` - Nombre d'éléments
- `{price}` - Prix en CHF
- `{year}` - Année (copyright)

#### Pluralisation
```typescript
'properties.subtitle': 'Browse {count} {count, plural, =1 {property} other {properties}}'
```

### Terminologie Clé à Respecter

| Français | English | Italiano | Deutsch (CH) | Notes |
|----------|---------|----------|--------------|-------|
| Propriété | Property | Proprietà | Immobilie | Bien immobilier |
| Propriétaire | Owner/Landlord | Proprietario | Vermieter | Personne qui loue |
| Étudiant | Student | Studente | Studänt | Locataire potentiel |
| Contrat de location | Rental Contract | Contratto d'affitto | Mietvertrag | Document légal |
| Demande de location | Rental Request | Richiesta d'affitto | Mietwunsch | Candidature |
| Canton | Canton | Cantone | Kanton | Division administrative |
| CHF | CHF | CHF | CHF | Franc suisse (invariable) |
| Vérifié | Verified | Verificato | Verifiziert | Statut de sécurité |
| Disponible | Available | Disponibile | Verfügbar | Statut de propriété |

---

## Spécificités par Langue

### 🇫🇷 Français (FR)
- **Ton** : Formel avec vouvoiement implicite dans les instructions
- **Style** : Clair, direct, professionnel
- **Exemples** :
  - "Trouvez Votre Logement Étudiant Parfait en Suisse"
  - "Parcourez des propriétés vérifiées"
  - "Contactez directement les propriétaires"

### 🇬🇧 Anglais (EN)
- **Ton** : International, accueillant, professionnel
- **Style** : Action-oriented, concis
- **Particularités** :
  - Utiliser "landlord" ou "owner" selon le contexte
  - "Rental contract" (américain) plutôt que "tenancy agreement" (britannique)
  - "Sign up" plutôt que "Register"
- **Exemples** :
  - "Find Your Perfect Student Home in Switzerland"
  - "Browse verified properties"
  - "Message verified landlords directly"

### 🇮🇹 Italien (IT)
- **Ton** : Chaleureux mais professionnel
- **Style** : Élégant, direct
- **Particularités** :
  - Adapter au contexte tessinois quand pertinent
  - Utiliser "affitto" pour location, pas "locazione"
  - "Studente" (singulier) / "Studenti" (pluriel)
- **Exemples** :
  - "Trova la Tua Casa Studentesca Perfetta in Svizzera"
  - "Sfoglia proprietà verificate"
  - "Messaggia direttamente con i proprietari"

### 🇨🇭 Allemand Suisse (DE-CH)
- **Ton** : Authentiquement suisse-allemand, convivial
- **Style** : Utiliser le dialecte et expressions typiques
- **Particularités IMPORTANTES** :
  - **Utiliser le dialecte suisse**, pas l'allemand standard
  - "Aamälde" au lieu de "Anmelden"
  - "Immobilie" au lieu de "Eigenschaft"
  - "Willkomme zrugg" au lieu de "Willkommen zurück"
  - "Zürich" pas "Zurich"
  - "hesch" au lieu de "hast"
  - "dini" au lieu de "deine"
  - "i de" au lieu de "in der"
- **Exemples** :
  - "Find Dini Perfekti Studäntewohnig i de Schwiiz"
  - "Durchsuche verifizierti Immobilie"
  - "Nachrichte direkt a verifizierti Vermieter"

---

## Prompt de Traduction à Utiliser avec une IA

### Prompt Principal

```
Tu es un traducteur professionnel spécialisé dans la localisation de plateformes web pour la Suisse multilingue. 
Tu travailles sur **Hoomy**, une plateforme de location de logements étudiants en Suisse.

CONTEXTE :
- Public cible : Étudiants (18-30 ans) et propriétaires en Suisse
- Domaine : Immobilier, location, contrats de location étudiante
- Ton : Professionnel, rassurant, accessible, action-oriented
- Enjeux : Sécurité, vérification, confiance, simplicité

LANGUES CIBLES :
1. Français (FR) - Langue de référence, ton formel mais accessible
2. Anglais (EN) - International, pour étudiants étrangers
3. Italien (IT) - Pour la Suisse italophone (Tessin)
4. Allemand Suisse (DE-CH) - IMPORTANT : Utiliser le dialecte suisse-allemand authentique, pas l'allemand standard

CONSIGNES SPÉCIFIQUES :

1. **Cohérence terminologique** :
   - Utiliser toujours les mêmes termes pour les concepts clés (voir tableau de terminologie)
   - Maintenir la cohérence entre toutes les sections du site

2. **Adaptation culturelle** :
   - DE-CH : Dialecte suisse-allemand authentique (Aamälde, Immobilie, dini, hesch, i de)
   - IT : Contexte tessinois, utiliser "affitto" pas "locazione"
   - EN : Ton international accueillant
   - FR : Formel mais accessible

3. **Paramètres dynamiques** :
   - Préserver EXACTEMENT : {name}, {count}, {price}, {year}, etc.
   - Respecter la syntaxe de pluralisation : {count, plural, =1 {singulier} other {pluriel}}

4. **Contexte immobilier** :
   - Utiliser le vocabulaire technique approprié pour les contrats
   - Respecter les termes légaux suisses

5. **Appels à l'action** :
   - Clairs, directs, encourageants
   - Adapter au ton de chaque langue

6. **Longueur des traductions** :
   - Garder des traductions concises pour l'interface
   - Les titres doivent rester courts et impactants
   - Les descriptions peuvent être plus détaillées

TÂCHE :
Pour chaque clé de traduction fournie, génère des traductions de haute qualité dans les 4 langues en respectant :
- Le contexte d'usage
- Le ton et style définis
- Les spécificités culturelles
- La cohérence terminologique
- La syntaxe avec paramètres

FORMAT DE SORTIE :
Fournis les traductions au format TypeScript compatible avec notre fichier i18n.ts :

```typescript
'key.name': {
  fr: 'Traduction française',
  en: 'English translation',
  it: 'Traduzione italiana',
  'de-ch': 'Schwiizerdütschi Übersetzung'
}
```
```

### Prompt pour Vérification de Cohérence

```
Vérifie la cohérence et la qualité des traductions existantes dans le fichier i18n.ts :

1. **Complétude** : Toutes les clés sont-elles traduites dans les 4 langues ?
2. **Cohérence terminologique** : Les termes clés sont-ils traduits de manière cohérente ?
3. **Qualité du Schweizerdeutsch** : L'allemand suisse est-il authentique ou trop "standard" ?
4. **Paramètres** : Tous les {paramètres} sont-ils correctement préservés ?
5. **Pluralisation** : La syntaxe de pluralisation est-elle correcte dans toutes les langues ?
6. **Ton et style** : Le ton est-il approprié et cohérent dans chaque langue ?
7. **Erreurs de frappe** : Y a-t-il des fautes d'orthographe ou de grammaire ?

Pour chaque problème détecté, fournis :
- La clé concernée
- Le problème identifié
- Une suggestion de correction
```

### Prompt pour Nouvelles Traductions

```
Crée des traductions complètes (FR, EN, IT, DE-CH) pour les nouvelles clés suivantes :

[INSÉRER LES NOUVELLES CLÉS ICI]

SECTIONS CONCERNÉES :
[ex: Dashboard Admin, Paiements Stripe, Notifications, etc.]

CONTEXTE SPÉCIFIQUE :
[Décrire le contexte d'utilisation, le type d'utilisateur concerné, l'action attendue]

Respecte toutes les consignes de traduction, la terminologie établie et le ton de chaque langue.
```

---

## Checklist de Qualité

Avant de valider une traduction, vérifie :

### ✅ Technique
- [ ] Tous les paramètres `{variable}` sont préservés
- [ ] La syntaxe de pluralisation est correcte
- [ ] Pas de caractères d'échappement cassés (`\'`, `\"`)
- [ ] Format TypeScript valide

### ✅ Linguistique
- [ ] Orthographe correcte dans chaque langue
- [ ] Grammaire correcte
- [ ] Ton approprié au contexte
- [ ] Longueur adaptée à l'interface (pas trop long pour les boutons)

### ✅ Culturel
- [ ] DE-CH utilise le dialecte suisse, pas l'allemand standard
- [ ] Terminologie adaptée au contexte suisse
- [ ] Références culturelles appropriées
- [ ] Monnaie CHF correctement utilisée

### ✅ Cohérence
- [ ] Termes clés traduits de manière identique partout
- [ ] Ton cohérent dans toute la section
- [ ] Style cohérent avec les traductions existantes

### ✅ UX/UI
- [ ] Appels à l'action clairs et engageants
- [ ] Messages d'erreur compréhensibles
- [ ] Confirmations rassurantes
- [ ] Navigation intuitive

---

## Exemples de Traductions Réussies

### Navigation
```typescript
'nav.properties': {
  fr: 'Propriétés',
  en: 'Properties',
  it: 'Proprietà',
  'de-ch': 'Immobilie'
}
```

### Call to Action
```typescript
'landing.cta.student': {
  fr: 'S\'inscrire en tant qu\'Étudiant',
  en: 'Sign Up as Student',
  it: 'Registrati come Studente',
  'de-ch': 'Als Studänt registriere'
}
```

### Message avec Paramètre
```typescript
'dashboard.welcome': {
  fr: 'Bonjour, {name}!',
  en: 'Welcome back, {name}!',
  it: 'Bentornato, {name}!',
  'de-ch': 'Willkomme zrugg, {name}!'
}
```

### Pluralisation
```typescript
'properties.subtitle': {
  fr: 'Parcourir {count} {count, plural, =1 {propriété} other {propriétés}} disponibles en Suisse',
  en: 'Browse {count} {count, plural, =1 {property} other {properties}} available across Switzerland',
  it: 'Sfoglia {count} {count, plural, =1 {proprietà} other {proprietà}} disponibili in tutta la Svizzera',
  'de-ch': 'Durchsuche {count} {count, plural, =1 {Immobilie} other {Immobilie}} verfügbar i de ganze Schwiiz'
}
```

---

## Ressources et Références

### Dictionnaires Spécialisés
- **Immobilier Suisse** : [www.hev-schweiz.ch](https://www.hev-schweiz.ch) (terminologie immobilière)
- **Schweizerdeutsch** : [www.idiotikon.ch](https://www.idiotikon.ch) (dialecte suisse-allemand)
- **Légal Suisse** : [www.admin.ch](https://www.admin.ch) (termes légaux officiels)

### Guides de Style
- Ton étudiant : accessible, moderne, rassurant
- Ton propriétaire : professionnel, efficace, sécurisant
- Ton administratif : formel, précis, légal

### Cantons et Villes
Traductions spécifiques pour les 26 cantons et principales villes universitaires déjà implémentées dans `i18n.ts` (lignes 1033-1123).

---

## Utilisation de ce Prompt

### Étape 1 : Audit des Traductions Existantes
Utilise le **Prompt de Vérification de Cohérence** avec le fichier `client/src/lib/i18n.ts` actuel.

### Étape 2 : Corrections et Améliorations
Pour chaque problème identifié, utilise le **Prompt Principal** pour générer des traductions améliorées.

### Étape 3 : Nouvelles Fonctionnalités
Lors de l'ajout de nouvelles features, utilise le **Prompt pour Nouvelles Traductions**.

### Étape 4 : Validation
Vérifie chaque traduction avec la **Checklist de Qualité**.

### Étape 5 : Test Utilisateur
Si possible, faire valider les traductions par des locuteurs natifs de chaque région linguistique.

---

## Maintenance Continue

### Suivi des Traductions
- Créer un fichier de suivi des clés manquantes
- Documenter les décisions terminologiques
- Maintenir un glossaire partagé

### Mises à Jour
- Vérifier la cohérence après chaque ajout
- Synchroniser les 4 langues simultanément
- Tester l'affichage dans l'interface

### Feedback Utilisateurs
- Recueillir les retours des utilisateurs sur la clarté
- Ajuster les traductions selon les usages réels
- Améliorer continuellement la qualité

---

## Contact et Support

Pour toute question sur les traductions :
1. Consulter ce document en premier
2. Vérifier la cohérence avec les traductions existantes
3. Utiliser les prompts fournis pour générer des propositions
4. Valider avec la checklist de qualité

**Bonne traduction ! 🌍**

