# 📝 Template pour Nouvelles Traductions

Ce fichier sert de template pour ajouter de nouvelles sections de traductions à Hoomy.

---

## 🎯 Checklist Avant de Commencer

Avant d'ajouter de nouvelles traductions :

- [ ] J'ai défini clairement la section/feature concernée
- [ ] J'ai listé toutes les clés nécessaires
- [ ] J'ai identifié les paramètres dynamiques (`{name}`, `{count}`, etc.)
- [ ] J'ai identifié les besoins de pluralisation
- [ ] J'ai consulté `TRANSLATION_PROMPT.md` pour la terminologie
- [ ] J'ai préparé le contexte d'utilisation

---

## 📋 Template de Nouvelle Section

```typescript
// ============================================
// SECTION : [NOM DE LA SECTION]
// Contexte : [Description du contexte d'utilisation]
// Date : [Date d'ajout]
// ============================================

// [Sous-section 1]
'section.key1': {
  fr: 'Traduction française',
  en: 'English translation',
  it: 'Traduzione italiana',
  'de-ch': 'Schwiizerdütschi Übersetzig'
},

// [Sous-section 2 - Avec paramètre]
'section.key2': {
  fr: 'Bonjour {name}',
  en: 'Hello {name}',
  it: 'Ciao {name}',
  'de-ch': 'Grüezi {name}'
},

// [Sous-section 3 - Avec pluralisation]
'section.key3': {
  fr: '{count} {count, plural, =1 {élément} other {éléments}}',
  en: '{count} {count, plural, =1 {item} other {items}}',
  it: '{count} {count, plural, =1 {elemento} other {elementi}}',
  'de-ch': '{count} {count, plural, =1 {Element} other {Elemänt}}'
},
```

---

## 🔄 Exemples de Nouvelles Sections Complètes

### Exemple 1 : Section Paiements

```typescript
// ============================================
// SECTION : PAYMENTS (Paiements Stripe)
// Contexte : Page de paiement du loyer, intégration Stripe
// Date : Novembre 2025
// ============================================

// Titres et headers
'payment.title': {
  fr: 'Paiement Sécurisé',
  en: 'Secure Payment',
  it: 'Pagamento Sicuro',
  'de-ch': 'Sichere Zahlig'
},

'payment.subtitle': {
  fr: 'Payez votre loyer en toute sécurité via Stripe',
  en: 'Pay your rent securely through Stripe',
  it: 'Paga il tuo affitto in sicurezza tramite Stripe',
  'de-ch': 'Zahl dini Miete sicher über Stripe'
},

// Montants et détails
'payment.amount': {
  fr: 'Montant à payer : CHF {amount}',
  en: 'Amount to pay: CHF {amount}',
  it: 'Importo da pagare: CHF {amount}',
  'de-ch': 'Betrag zum zahle: CHF {amount}'
},

'payment.due_date': {
  fr: 'Date d\'échéance : {date}',
  en: 'Due date: {date}',
  it: 'Data di scadenza: {date}',
  'de-ch': 'Fälligkeitsdatum: {date}'
},

// Formulaire de carte
'payment.card.number': {
  fr: 'Numéro de carte',
  en: 'Card number',
  it: 'Numero di carta',
  'de-ch': 'Kartenummer'
},

'payment.card.expiry': {
  fr: 'Date d\'expiration',
  en: 'Expiry date',
  it: 'Data di scadenza',
  'de-ch': 'Ablaufdatum'
},

'payment.card.cvc': {
  fr: 'Code CVC',
  en: 'CVC code',
  it: 'Codice CVC',
  'de-ch': 'CVC-Code'
},

// Actions
'payment.button.submit': {
  fr: 'Payer CHF {amount}',
  en: 'Pay CHF {amount}',
  it: 'Paga CHF {amount}',
  'de-ch': 'Zahl CHF {amount}'
},

'payment.button.cancel': {
  fr: 'Annuler',
  en: 'Cancel',
  it: 'Annulla',
  'de-ch': 'Abbreche'
},

// États
'payment.processing': {
  fr: 'Traitement du paiement...',
  en: 'Processing payment...',
  it: 'Elaborazione pagamento...',
  'de-ch': 'Zahlig wird verarbeitet...'
},

'payment.success': {
  fr: 'Paiement effectué avec succès',
  en: 'Payment successful',
  it: 'Pagamento effettuato con successo',
  'de-ch': 'Zahlig erfolgreich'
},

'payment.success.desc': {
  fr: 'Votre paiement de CHF {amount} a été confirmé',
  en: 'Your payment of CHF {amount} has been confirmed',
  it: 'Il tuo pagamento di CHF {amount} è stato confermato',
  'de-ch': 'Dini Zahlig vo CHF {amount} isch bestätigt worde'
},

// Erreurs
'payment.error': {
  fr: 'Erreur de paiement',
  en: 'Payment error',
  it: 'Errore di pagamento',
  'de-ch': 'Zahligsfehler'
},

'payment.error.card_declined': {
  fr: 'Carte refusée. Veuillez vérifier vos informations.',
  en: 'Card declined. Please check your information.',
  it: 'Carta rifiutata. Controlla le tue informazioni.',
  'de-ch': 'Charte abglehnt. Bitte überprüef dini Informatione.'
},

'payment.error.insufficient_funds': {
  fr: 'Fonds insuffisants',
  en: 'Insufficient funds',
  it: 'Fondi insufficienti',
  'de-ch': 'Unzureichendi Mittel'
},

// Historique
'payment.history.title': {
  fr: 'Historique des Paiements',
  en: 'Payment History',
  it: 'Storico Pagamenti',
  'de-ch': 'Zahligshistorie'
},

'payment.history.empty': {
  fr: 'Aucun paiement pour le moment',
  en: 'No payments yet',
  it: 'Nessun pagamento ancora',
  'de-ch': 'No kei Zahlige'
},

'payment.receipt': {
  fr: 'Télécharger le reçu',
  en: 'Download receipt',
  it: 'Scarica ricevuta',
  'de-ch': 'Quittung abelade'
},
```

---

### Exemple 2 : Section Notifications

```typescript
// ============================================
// SECTION : NOTIFICATIONS
// Contexte : Système de notifications push et in-app
// Date : Novembre 2025
// ============================================

// Headers
'notif.title': {
  fr: 'Notifications',
  en: 'Notifications',
  it: 'Notifiche',
  'de-ch': 'Meldige'
},

'notif.subtitle': {
  fr: 'Restez informé des dernières activités',
  en: 'Stay updated with the latest activities',
  it: 'Rimani aggiornato sulle ultime attività',
  'de-ch': 'Bliib über die neuste Aktivitäte informiert'
},

// Types de notifications
'notif.new_message': {
  fr: 'Nouveau message de {name}',
  en: 'New message from {name}',
  it: 'Nuovo messaggio da {name}',
  'de-ch': 'Neui Nachricht vo {name}'
},

'notif.request_received': {
  fr: '{name} a envoyé une demande pour {property}',
  en: '{name} sent a request for {property}',
  it: '{name} ha inviato una richiesta per {property}',
  'de-ch': '{name} het e Aafrag gsendet für {property}'
},

'notif.request_accepted': {
  fr: 'Votre demande pour {property} a été acceptée',
  en: 'Your request for {property} has been accepted',
  it: 'La tua richiesta per {property} è stata accettata',
  'de-ch': 'Dini Aafrag für {property} isch akzeptiert worde'
},

'notif.request_rejected': {
  fr: 'Votre demande pour {property} a été refusée',
  en: 'Your request for {property} has been declined',
  it: 'La tua richiesta per {property} è stata rifiutata',
  'de-ch': 'Dini Aafrag für {property} isch abglehnt worde'
},

'notif.contract_created': {
  fr: 'Un nouveau contrat a été créé pour {property}',
  en: 'A new contract has been created for {property}',
  it: 'Un nuovo contratto è stato creato per {property}',
  'de-ch': 'E neue Vertrag isch erstellt worde für {property}'
},

'notif.payment_due': {
  fr: 'Paiement dû dans {days} jours (CHF {amount})',
  en: 'Payment due in {days} days (CHF {amount})',
  it: 'Pagamento dovuto tra {days} giorni (CHF {amount})',
  'de-ch': 'Zahlig fällig i {days} Täg (CHF {amount})'
},

'notif.payment_received': {
  fr: 'Paiement reçu de {name} (CHF {amount})',
  en: 'Payment received from {name} (CHF {amount})',
  it: 'Pagamento ricevuto da {name} (CHF {amount})',
  'de-ch': 'Zahlig erhalte vo {name} (CHF {amount})'
},

// Actions
'notif.mark_read': {
  fr: 'Marquer comme lu',
  en: 'Mark as read',
  it: 'Segna come letto',
  'de-ch': 'Als gläse markiere'
},

'notif.mark_all_read': {
  fr: 'Tout marquer comme lu',
  en: 'Mark all as read',
  it: 'Segna tutto come letto',
  'de-ch': 'Alles als gläse markiere'
},

'notif.delete': {
  fr: 'Supprimer',
  en: 'Delete',
  it: 'Elimina',
  'de-ch': 'Lösche'
},

'notif.clear_all': {
  fr: 'Tout effacer',
  en: 'Clear all',
  it: 'Cancella tutto',
  'de-ch': 'Alles lösche'
},

// États
'notif.empty': {
  fr: 'Aucune notification',
  en: 'No notifications',
  it: 'Nessuna notifica',
  'de-ch': 'Kei Meldige'
},

'notif.empty.desc': {
  fr: 'Vous êtes à jour !',
  en: 'You\'re all caught up!',
  it: 'Sei aggiornato!',
  'de-ch': 'Du bisch uf em neueste Stand!'
},

'notif.loading': {
  fr: 'Chargement des notifications...',
  en: 'Loading notifications...',
  it: 'Caricamento notifiche...',
  'de-ch': 'Meldige werde glade...'
},

// Paramètres
'notif.settings.title': {
  fr: 'Paramètres de Notifications',
  en: 'Notification Settings',
  it: 'Impostazioni Notifiche',
  'de-ch': 'Meldigs-Iistellige'
},

'notif.settings.email': {
  fr: 'Notifications par email',
  en: 'Email notifications',
  it: 'Notifiche via email',
  'de-ch': 'Email-Meldige'
},

'notif.settings.push': {
  fr: 'Notifications push',
  en: 'Push notifications',
  it: 'Notifiche push',
  'de-ch': 'Push-Meldige'
},

'notif.settings.messages': {
  fr: 'Nouveaux messages',
  en: 'New messages',
  it: 'Nuovi messaggi',
  'de-ch': 'Neui Nachrichtä'
},

'notif.settings.requests': {
  fr: 'Demandes de location',
  en: 'Rental requests',
  it: 'Richieste d\'affitto',
  'de-ch': 'Mietwünsch'
},

'notif.settings.payments': {
  fr: 'Paiements',
  en: 'Payments',
  it: 'Pagamenti',
  'de-ch': 'Zahlige'
},
```

---

### Exemple 3 : Section Admin

```typescript
// ============================================
// SECTION : ADMIN DASHBOARD
// Contexte : Interface d'administration pour gérer la plateforme
// Date : Novembre 2025
// ============================================

// Navigation
'admin.title': {
  fr: 'Administration',
  en: 'Administration',
  it: 'Amministrazione',
  'de-ch': 'Verwaltung'
},

'admin.overview': {
  fr: 'Vue d\'ensemble',
  en: 'Overview',
  it: 'Panoramica',
  'de-ch': 'Übersicht'
},

// Statistiques
'admin.stats.users': {
  fr: 'Utilisateurs',
  en: 'Users',
  it: 'Utenti',
  'de-ch': 'Benutzer'
},

'admin.stats.users.total': {
  fr: '{count} {count, plural, =1 {utilisateur} other {utilisateurs}} au total',
  en: '{count} {count, plural, =1 {user} other {users}} total',
  it: '{count} {count, plural, =1 {utente} other {utenti}} in totale',
  'de-ch': '{count} {count, plural, =1 {Benutzer} other {Benutzer}} insgesamt'
},

'admin.stats.users.students': {
  fr: '{count} étudiants',
  en: '{count} students',
  it: '{count} studenti',
  'de-ch': '{count} Studäntä'
},

'admin.stats.users.owners': {
  fr: '{count} propriétaires',
  en: '{count} owners',
  it: '{count} proprietari',
  'de-ch': '{count} Vermieter'
},

'admin.stats.properties': {
  fr: '{count} {count, plural, =1 {propriété} other {propriétés}}',
  en: '{count} {count, plural, =1 {property} other {properties}}',
  it: '{count} {count, plural, =1 {proprietà} other {proprietà}}',
  'de-ch': '{count} {count, plural, =1 {Immobilie} other {Immobilie}}'
},

'admin.stats.contracts.active': {
  fr: '{count} contrats actifs',
  en: '{count} active contracts',
  it: '{count} contratti attivi',
  'de-ch': '{count} aktivi Verträg'
},

'admin.stats.revenue.month': {
  fr: 'Revenu mensuel : CHF {amount}',
  en: 'Monthly revenue: CHF {amount}',
  it: 'Ricavo mensile: CHF {amount}',
  'de-ch': 'Monatliche Iinnahme: CHF {amount}'
},

// Gestion utilisateurs
'admin.users.manage': {
  fr: 'Gérer les Utilisateurs',
  en: 'Manage Users',
  it: 'Gestisci Utenti',
  'de-ch': 'Benutzer verwalte'
},

'admin.users.verify': {
  fr: 'Vérifier',
  en: 'Verify',
  it: 'Verifica',
  'de-ch': 'Verifiziere'
},

'admin.users.suspend': {
  fr: 'Suspendre',
  en: 'Suspend',
  it: 'Sospendi',
  'de-ch': 'Suspendiere'
},

'admin.users.ban': {
  fr: 'Bannir',
  en: 'Ban',
  it: 'Blocca',
  'de-ch': 'Sperre'
},

// Gestion propriétés
'admin.properties.manage': {
  fr: 'Gérer les Propriétés',
  en: 'Manage Properties',
  it: 'Gestisci Proprietà',
  'de-ch': 'Immobilie verwalte'
},

'admin.properties.featured': {
  fr: 'Mettre en avant',
  en: 'Feature',
  it: 'In evidenza',
  'de-ch': 'Hervorhebe'
},

'admin.properties.remove_featured': {
  fr: 'Retirer de la mise en avant',
  en: 'Remove from featured',
  it: 'Rimuovi da in evidenza',
  'de-ch': 'Vo Hervorhebig entferne'
},

'admin.properties.approve': {
  fr: 'Approuver',
  en: 'Approve',
  it: 'Approva',
  'de-ch': 'Genehmige'
},

'admin.properties.reject': {
  fr: 'Rejeter',
  en: 'Reject',
  it: 'Rifiuta',
  'de-ch': 'Ablehne'
},

// Rapports
'admin.reports.title': {
  fr: 'Rapports et Statistiques',
  en: 'Reports and Statistics',
  it: 'Rapporti e Statistiche',
  'de-ch': 'Bericht und Statistike'
},

'admin.reports.export': {
  fr: 'Exporter',
  en: 'Export',
  it: 'Esporta',
  'de-ch': 'Exportiere'
},

'admin.reports.period': {
  fr: 'Période',
  en: 'Period',
  it: 'Periodo',
  'de-ch': 'Periode'
},
```

---

## 🎨 Conventions de Nommage

### Structure des Clés

```
section.subsection.action
section.subsection.state
section.subsection.type.value
```

### Exemples :

- ✅ `payment.card.number` (section.subsection.element)
- ✅ `notif.mark_read` (section.action)
- ✅ `admin.stats.users.total` (section.subsection.element.detail)

### À Éviter :

- ❌ Clés trop courtes : `pay`, `not`, `usr`
- ❌ Clés trop longues : `payment_for_the_rental_contract_amount`
- ❌ Incohérence : `payment.cardNumber` vs `payment.card_expiry`

---

## 📝 Process d'Ajout de Nouvelles Traductions

### 1. Planification

```markdown
Section : [Nom]
Contexte : [Description]
Clés nécessaires : [Liste]
Paramètres dynamiques : [Variables]
Pluralisation : [Oui/Non]
```

### 2. Génération avec IA

Utiliser `PROMPT_READY_TO_USE.md` :
- Copier le prompt principal
- Ajouter votre contexte
- Générer les traductions

### 3. Validation

- [ ] Syntaxe TypeScript correcte
- [ ] Tous les paramètres préservés
- [ ] Dialecte suisse authentique (DE-CH)
- [ ] Longueur adaptée à l'UI
- [ ] Cohérence terminologique

### 4. Intégration

```typescript
// Dans client/src/lib/i18n.ts

// Ajouter dans chaque objet de langue (fr, en, it, de-ch)
export const translations: Record<Language, Record<string, string>> = {
  fr: {
    // ... traductions existantes ...
    
    // NOUVELLE SECTION
    'section.key1': 'Traduction',
    'section.key2': 'Traduction avec {param}',
    // ...
  },
  en: {
    // ... idem pour chaque langue ...
  },
  // ...
};
```

### 5. Test

```bash
# Vérifier
node check-translations.js

# Tester dans l'app
npm run dev
```

---

## 🔍 Checklist Finale

Avant de considérer la traduction terminée :

### Technique
- [ ] Code TypeScript compile sans erreur
- [ ] Script `check-translations.js` passe sans erreur
- [ ] Tous les paramètres sont cohérents entre langues
- [ ] Pluralisation correctement implémentée

### Contenu
- [ ] Toutes les 4 langues présentes pour chaque clé
- [ ] Terminologie cohérente avec le reste du site
- [ ] Ton approprié à chaque langue
- [ ] Allemand suisse authentiquement dialectal

### UX/UI
- [ ] Textes testés dans l'interface réelle
- [ ] Longueur adaptée (boutons, titres, etc.)
- [ ] Responsive testé (mobile + desktop)
- [ ] Accessibilité vérifiée

### Validation
- [ ] Revue par un locuteur natif (si possible)
- [ ] Retours utilisateurs collectés
- [ ] Documentation mise à jour

---

## 💡 Conseils Pro

### Pour l'Allemand Suisse (DE-CH)

**Toujours utiliser :**
- "Aamälde" (pas "Anmelden")
- "dini" (pas "deine")
- "i de" (pas "in der")
- "hesch" (pas "hast")
- "Immobilie" (pas "Eigenschaft")
- Terminaisons en -e, -i pour les verbes

**Ressources :**
- [idiotikon.ch](https://www.idiotikon.ch) - Dictionnaire du dialecte suisse

### Pour l'Italien (IT)

**Préférer :**
- "affitto" (location) pas "locazione"
- "studente" (étudiant)
- Ton chaleureux mais professionnel
- Contexte tessinois

### Pour l'Anglais (EN)

**Style :**
- Concis et action-oriented
- "Sign up" plutôt que "Register"
- "Landlord" ou "Owner" selon contexte
- Ton international et accueillant

---

**Utilisez ce template pour maintenir la cohérence et la qualité de vos traductions ! 🌟**

