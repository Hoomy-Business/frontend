# 🚀 Prompt Prêt à l'Emploi - Traductions Hoomy

## 📋 Instructions d'Utilisation

1. **Copiez le prompt ci-dessous**
2. **Ouvrez ChatGPT, Claude ou votre IA préférée**
3. **Collez le prompt**
4. **Ajoutez vos clés de traduction à traduire**
5. **Obtenez des traductions de qualité professionnelle**

---

## 🎯 PROMPT À COPIER-COLLER

```
Tu es un traducteur expert spécialisé en localisation web pour la Suisse multilingue.

PROJET : Hoomy - Plateforme de location de logements étudiants en Suisse

🎯 OBJECTIF :
Traduire des clés de texte en 4 langues officielles suisses avec une qualité professionnelle, en respectant le contexte culturel et technique de chaque région.

📚 CONTEXTE BUSINESS :
- Plateforme web immobilière pour étudiants
- Public : Étudiants (18-30 ans) + Propriétaires
- Fonctions : Recherche logements, messagerie, contrats de location, paiements
- Valeurs : Sécurité, vérification, simplicité, confiance

🌍 LANGUES CIBLES (4) :

1. **🇫🇷 Français (FR)** - Langue de référence
   - Ton : Formel mais accessible, professionnel
   - Style : Direct, clair, rassurant
   - Vouvoiement implicite

2. **🇬🇧 Anglais (EN)** - International
   - Ton : Accueillant, professionnel, moderne
   - Style : Concis, action-oriented
   - Public : Étudiants internationaux

3. **🇮🇹 Italien (IT)** - Suisse italophone (Tessin)
   - Ton : Chaleureux mais professionnel
   - Style : Élégant, direct
   - Utiliser "affitto" (pas "locazione")

4. **🇨🇭 Allemand Suisse (DE-CH)** - CRITIQUE ⚠️
   - Ton : Authentiquement suisse-allemand (dialecte)
   - Style : Convivial, dialectal
   - ⚠️ IMPORTANT : Utiliser le Schweizerdeutsch, PAS l'allemand standard
   - Exemples : "Aamälde" (pas "Anmelden"), "dini" (pas "deine"), "i de" (pas "in der"), "hesch" (pas "hast")

📖 TERMINOLOGIE CLÉ (à respecter absolument) :

| Concept | FR | EN | IT | DE-CH |
|---------|----|----|-------|-------|
| Bien immobilier | Propriété | Property | Proprietà | Immobilie |
| Personne qui loue | Propriétaire | Owner/Landlord | Proprietario | Vermieter |
| Locataire étudiant | Étudiant | Student | Studente | Studänt |
| Contrat | Contrat de location | Rental Contract | Contratto d'affitto | Mietvertrag |
| Candidature | Demande de location | Rental Request | Richiesta d'affitto | Mietwunsch |
| Division administrative | Canton | Canton | Cantone | Kanton |
| Monnaie | CHF | CHF | CHF | CHF |
| Vérifié | Vérifié | Verified | Verificato | Verifiziert |
| Disponible | Disponible | Available | Disponibile | Verfügbar |
| Tableau de bord | Tableau de bord | Dashboard | Dashboard | Dashboard |
| Connexion | Connexion | Login | Accesso | Aamäldig |
| S'inscrire | S'inscrire | Sign Up / Register | Registrati | Registriere |

⚙️ RÈGLES TECHNIQUES :

1. **Paramètres dynamiques** : PRÉSERVER EXACTEMENT
   - `{name}` - Nom d'utilisateur
   - `{count}` - Nombre d'éléments
   - `{price}` - Prix
   - `{year}` - Année

2. **Pluralisation** : Respecter la syntaxe
   ```
   {count, plural, =1 {singulier} other {pluriel}}
   ```

3. **Caractères d'échappement** : Préserver `\'` et `\"`

4. **Format de sortie** : TypeScript compatible
   ```typescript
   'cle.nom': {
     fr: 'Texte français',
     en: 'English text',
     it: 'Testo italiano',
     'de-ch': 'Schwiizerdütsche Text'
   }
   ```

✅ CRITÈRES DE QUALITÉ :

1. **Contexte immobilier** : Vocabulaire technique approprié
2. **Ton adapté** : Professionnel mais accessible
3. **Longueur** : Concis pour l'UI (boutons courts, descriptions détaillées OK)
4. **Cohérence** : Utiliser toujours les mêmes termes pour les mêmes concepts
5. **Appels à l'action** : Clairs, directs, engageants
6. **Culture** : Dialecte suisse pour DE-CH, contexte tessinois pour IT

🎨 EXEMPLES DE TRADUCTIONS RÉUSSIES :

Exemple 1 - Navigation simple :
```typescript
'nav.properties': {
  fr: 'Propriétés',
  en: 'Properties',
  it: 'Proprietà',
  'de-ch': 'Immobilie'
}
```

Exemple 2 - Call-to-action :
```typescript
'landing.cta.student': {
  fr: 'S\'inscrire en tant qu\'Étudiant',
  en: 'Sign Up as Student',
  it: 'Registrati come Studente',
  'de-ch': 'Als Studänt registriere'
}
```

Exemple 3 - Message avec paramètre :
```typescript
'dashboard.welcome': {
  fr: 'Bonjour, {name}!',
  en: 'Welcome back, {name}!',
  it: 'Bentornato, {name}!',
  'de-ch': 'Willkomme zrugg, {name}!'
}
```

Exemple 4 - Pluralisation complexe :
```typescript
'properties.subtitle': {
  fr: 'Parcourir {count} {count, plural, =1 {propriété} other {propriétés}} disponibles',
  en: 'Browse {count} {count, plural, =1 {property} other {properties}} available',
  it: 'Sfoglia {count} {count, plural, =1 {proprietà} other {proprietà}} disponibili',
  'de-ch': 'Durchsuche {count} {count, plural, =1 {Immobilie} other {Immobilie}} verfügbar'
}
```

📝 TÂCHE :
Traduis les clés suivantes en respectant TOUTES les consignes ci-dessus :

[INSÈRE TES CLÉS À TRADUIRE ICI]

Format attendu : TypeScript, 4 langues par clé, qualité professionnelle.
```

---

## 🎯 Exemples d'Utilisation Pratique

### Cas 1 : Nouvelle Feature - Paiements

**À ajouter au prompt ci-dessus :**

```
Section : Paiements Stripe
Contexte : Page de paiement sécurisé pour le loyer, utilisation de Stripe

Clés à traduire :

1. 'payment.title' - Titre de la page de paiement
2. 'payment.secure' - Badge "Paiement sécurisé"
3. 'payment.amount' - "Montant à payer : CHF {amount}"
4. 'payment.card.number' - Label champ numéro de carte
5. 'payment.card.expiry' - Label date d'expiration
6. 'payment.card.cvc' - Label code CVC
7. 'payment.button.submit' - Bouton de validation paiement
8. 'payment.processing' - État pendant le traitement
9. 'payment.success' - Message de succès
10. 'payment.error' - Message d'erreur générique
```

### Cas 2 : Améliorer une Traduction Existante

**À ajouter au prompt :**

```
Améliore cette traduction existante :

Clé : 'property.contact'
Contexte : Bouton pour contacter le propriétaire d'un logement

Traductions actuelles :
- fr: 'Contacter le Propriétaire'
- en: 'Contact Owner'
- it: 'Contatta il Proprietario'
- de-ch: 'Vermieter kontaktiere'

Problème : Le ton est trop formel, rendre plus engageant et action-oriented.

Propose des alternatives plus dynamiques en respectant toutes les consignes.
```

### Cas 3 : Vérification de Cohérence

**À ajouter au prompt :**

```
Vérifie la cohérence de ces traductions :

Section : Dashboard Étudiant

'dashboard.student.favorites': {
  fr: 'Mes Favoris',
  en: 'My Favorites',
  it: 'I Miei Preferiti',
  'de-ch': 'Mini Favorite'
}

'dashboard.student.favorites.empty': {
  fr: 'Aucun favori pour le moment',
  en: 'No favorites yet',
  it: 'Nessun preferito ancora',
  'de-ch': 'No kei Favorit'
}

Questions :
1. La terminologie est-elle cohérente entre les deux clés ?
2. Le dialecte suisse est-il authentique ?
3. Le ton est-il approprié ?
4. Suggestions d'amélioration ?
```

---

## 🔍 Prompt de Vérification (Audit des Traductions)

**Pour auditer votre fichier i18n.ts complet :**

```
Tu es un expert en QA linguistique pour applications web multilingues.

MISSION : Auditer la qualité et cohérence des traductions du fichier i18n.ts de Hoomy.

CONTEXTE : Voir le prompt principal ci-dessus (même projet, mêmes langues, mêmes règles)

FICHIER À AUDITER :
[COLLER LE CONTENU DE client/src/lib/i18n.ts]

📋 CHECKLIST D'AUDIT :

1. **Complétude** ✅
   - Toutes les clés sont-elles traduites dans les 4 langues ?
   - Y a-t-il des traductions manquantes ?

2. **Cohérence terminologique** 📖
   - Les termes clés (propriété, étudiant, contrat, etc.) sont-ils traduits de façon cohérente ?
   - Liste les incohérences trouvées

3. **Qualité du Schweizerdeutsch** 🇨🇭
   - L'allemand suisse est-il authentique ou trop "Hochdeutsch" ?
   - Exemples de traductions à améliorer

4. **Paramètres techniques** ⚙️
   - Tous les {paramètres} sont-ils préservés dans toutes les langues ?
   - La syntaxe de pluralisation est-elle correcte ?

5. **Ton et style** 🎨
   - Le ton est-il approprié et cohérent ?
   - Y a-t-il des variations de style inappropriées ?

6. **Erreurs linguistiques** 📝
   - Fautes d'orthographe
   - Erreurs grammaticales
   - Formulations maladroites

7. **UX/UI** 💡
   - Textes trop longs pour l'interface ?
   - Appels à l'action suffisamment clairs ?
   - Messages d'erreur compréhensibles ?

FORMAT DE RAPPORT :
Pour chaque problème :
- ❌ Clé concernée
- 🔍 Problème identifié
- ✅ Solution proposée

Priorise les problèmes par gravité :
- 🔴 CRITIQUE (bloquant, erreur majeure)
- 🟡 IMPORTANT (amélioration significative)
- 🟢 MINEUR (perfectionnement)
```

---

## 💡 Conseils d'Utilisation

### Pour ChatGPT / Claude
1. **Nouvelle conversation** pour chaque grande section (Landing, Dashboard, etc.)
2. **Copiez le prompt complet** à chaque fois pour maintenir le contexte
3. **Validez les traductions** avant de les intégrer
4. **Testez dans l'interface** pour vérifier la longueur des textes

### Pour l'Intégration
1. Copiez les traductions générées
2. Intégrez dans `client/src/lib/i18n.ts`
3. Vérifiez la syntaxe TypeScript
4. Testez dans l'application avec le sélecteur de langue
5. Validez l'affichage sur mobile et desktop

### Pour la Maintenance
1. **Gardez ce document** comme référence
2. **Documentez les décisions** terminologiques
3. **Créez un glossaire** partagé si équipe
4. **Sollicitez des retours** d'utilisateurs natifs

---

## 🎓 Exemples Supplémentaires par Section

### Section Admin Dashboard

```
Section : Admin Dashboard
Contexte : Interface administrateur pour gérer utilisateurs et propriétés

Clés à traduire :

'admin.title': 'Administration'
'admin.users.total': 'Total des utilisateurs'
'admin.properties.total': 'Total des propriétés'
'admin.contracts.active': '{count} contrats actifs'
'admin.revenue.monthly': 'Revenu mensuel : CHF {amount}'
'admin.users.verify': 'Vérifier l'utilisateur'
'admin.users.ban': 'Bannir'
'admin.properties.featured': 'Mettre en avant'
'admin.reports.title': 'Rapports et Statistiques'
```

### Section Notifications

```
Section : Notifications
Contexte : Notifications push et emails pour actions importantes

Clés à traduire :

'notif.new_message': 'Nouveau message de {name}'
'notif.request_accepted': 'Votre demande a été acceptée'
'notif.contract_signed': 'Contrat signé avec succès'
'notif.payment_due': 'Paiement dû dans {days} jours'
'notif.verification_needed': 'Vérification requise'
```

### Section Erreurs

```
Section : Erreurs
Contexte : Messages d'erreur à afficher à l'utilisateur

Clés à traduire :

'error.network': 'Erreur de connexion. Vérifiez votre réseau.'
'error.unauthorized': 'Accès non autorisé'
'error.not_found': 'Page non trouvée'
'error.server': 'Erreur serveur. Veuillez réessayer.'
'error.validation.email': 'Adresse email invalide'
'error.validation.password': 'Mot de passe trop court (min. 8 caractères)'
```

---

## 📊 Métriques de Qualité

Après génération, vérifiez :

- ✅ **Complétude** : 100% des langues présentes pour chaque clé
- ✅ **Paramètres** : 100% des {variables} préservées
- ✅ **Cohérence** : Mêmes termes pour mêmes concepts
- ✅ **Dialecte CH** : Authentiquement suisse-allemand
- ✅ **Longueur UI** : Boutons < 20 caractères, titres < 50
- ✅ **Tests** : Validé dans interface réelle

---

**🚀 Vous êtes prêt ! Copiez le prompt principal et commencez vos traductions de qualité professionnelle.**

