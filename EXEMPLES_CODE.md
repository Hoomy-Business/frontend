# Exemples de Code Modernisé

## 1. Navigation Sans Emojis

### ❌ Avant (avec emojis)
```html
<nav class="nav-menu">
    <a class="nav-link" onclick="showPage('home')">
        <span>🏠</span> Accueil
    </a>
    <a class="nav-link" onclick="showPage('search')">
        <span>🔍</span> Rechercher
    </a>
    <a class="nav-link" onclick="showPage('about')">
        <span>ℹ️</span> À propos
    </a>
</nav>
```

### ✅ Après (sans emojis, moderne)
```html
<nav class="nav-menu">
    <a class="nav-link" onclick="showPage('home')">Accueil</a>
    <a class="nav-link" onclick="showPage('search')">Rechercher</a>
    <a class="nav-link" onclick="showPage('messages')">Messages</a>
    <a class="nav-link" onclick="showPage('about')">À propos</a>
</nav>
```

## 2. Cards Modernisées

### ❌ Avant (style IA avec ombres lourdes)
```css
.property-card {
    background: white;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    transition: all 0.3s;
}

.property-card:hover {
    transform: translateY(-8px);
    box-shadow: 0 12px 28px rgba(0,0,0,0.18);
}

.property-status {
    position: absolute;
    top: 1rem;
    right: 1rem;
    background: var(--success-color);
    color: white;
    padding: 0.4rem 1rem;
    border-radius: 20px;
    font-size: 0.85rem;
    font-weight: 600;
    box-shadow: 0 2px 8px rgba(0,0,0,0.2);
}
```

### ✅ Après (style professionnel épuré)
```css
.property-card {
    background: var(--white);
    border-radius: var(--radius-md);
    overflow: hidden;
    border: 1px solid var(--border);
    transition: all 0.2s;
}

.property-card:hover {
    box-shadow: var(--shadow-sm);
    transform: translateY(-2px);
}

.property-status {
    position: absolute;
    top: 0.75rem;
    right: 0.75rem;
    background: var(--secondary);
    color: white;
    padding: 0.375rem 0.75rem;
    border-radius: var(--radius-sm);
    font-size: 0.75rem;
    font-weight: 600;
}
```

## 3. Dropdown pour Villes Suisses

### HTML
```html
<div class="form-group">
    <label>Canton</label>
    <select id="canton-select" onchange="loadCitiesByCanon()">
        <option value="">Sélectionnez un canton</option>
        <!-- Rempli dynamiquement par JavaScript -->
    </select>
</div>

<div class="form-group">
    <label>Ville</label>
    <select id="city-select">
        <option value="">Sélectionnez d'abord un canton</option>
        <!-- Rempli dynamiquement par JavaScript -->
    </select>
</div>
```

### JavaScript
```javascript
let cantons = [];
let cities = [];

// Charger les cantons au démarrage
async function loadCantons() {
    try {
        const response = await fetch(`${API_URL}/locations/cantons`);
        cantons = await response.json();
        
        const select = document.getElementById('canton-select');
        cantons.forEach(canton => {
            const option = document.createElement('option');
            option.value = canton.code;
            option.textContent = canton.name_fr;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Erreur chargement cantons:', error);
    }
}

// Charger les villes d'un canton
async function loadCitiesByCanon() {
    const cantonCode = document.getElementById('canton-select').value;
    const citySelect = document.getElementById('city-select');
    
    // Réinitialiser le select
    citySelect.innerHTML = '<option value="">Chargement...</option>';
    
    if (!cantonCode) {
        citySelect.innerHTML = '<option value="">Sélectionnez d'abord un canton</option>';
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/locations/cities?canton=${cantonCode}`);
        cities = await response.json();
        
        citySelect.innerHTML = '<option value="">Sélectionnez une ville</option>';
        cities.forEach(city => {
            const option = document.createElement('option');
            option.value = city.id;
            option.textContent = `${city.name} (${city.postal_code})`;
            option.dataset.postalCode = city.postal_code;
            citySelect.appendChild(option);
        });
    } catch (error) {
        console.error('Erreur chargement villes:', error);
        citySelect.innerHTML = '<option value="">Erreur de chargement</option>';
    }
}

// Appeler au chargement de la page
document.addEventListener('DOMContentLoaded', () => {
    loadCantons();
});
```

## 4. Vérification Email/Téléphone

### HTML (Modal de Vérification)
```html
<div id="verification-modal" class="modal">
    <div class="modal-content">
        <div class="modal-header">
            <h3 class="modal-title">Vérification</h3>
            <button class="close-btn" onclick="closeVerificationModal()">×</button>
        </div>
        <div class="modal-body">
            <div id="verification-alert"></div>
            
            <p>Un code à 6 chiffres a été envoyé à <strong id="verification-destination"></strong></p>
            
            <div class="form-group">
                <label>Code de vérification</label>
                <input type="text" id="verification-code" maxlength="6" placeholder="123456" 
                       style="text-align: center; font-size: 1.5rem; letter-spacing: 0.5rem;">
            </div>
            
            <button class="btn btn-primary" onclick="submitVerificationCode()" style="width: 100%;">
                Vérifier
            </button>
            
            <p style="text-align: center; margin-top: 1rem; font-size: 0.875rem; color: var(--text-light);">
                Vous n'avez pas reçu le code ? 
                <a href="#" onclick="resendVerificationCode(); return false;" style="color: var(--primary);">
                    Renvoyer
                </a>
            </p>
        </div>
    </div>
</div>
```

### JavaScript
```javascript
let currentVerificationType = null;

// Demander la vérification
async function requestVerification(type) {
    currentVerificationType = type;
    
    try {
        const response = await fetch(`${API_URL}/verification/send`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${currentToken}`
            },
            body: JSON.stringify({ type })
        });
        
        if (response.ok) {
            const destination = type === 'email' ? currentUser.email : currentUser.phone;
            document.getElementById('verification-destination').textContent = destination;
            document.getElementById('verification-modal').classList.add('active');
            showToast('Code envoyé', `Code envoyé à votre ${type}`, 'success');
        } else {
            const data = await response.json();
            showToast('Erreur', data.error || 'Erreur lors de l\'envoi du code', 'error');
        }
    } catch (error) {
        console.error('Erreur:', error);
        showToast('Erreur', 'Erreur de connexion au serveur', 'error');
    }
}

// Soumettre le code de vérification
async function submitVerificationCode() {
    const code = document.getElementById('verification-code').value;
    
    if (code.length !== 6) {
        showAlert('verification-alert', 'Le code doit contenir 6 chiffres', 'error');
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/verification/verify`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${currentToken}`
            },
            body: JSON.stringify({
                type: currentVerificationType,
                code: code
            })
        });
        
        if (response.ok) {
            showToast('Vérifié', `${currentVerificationType === 'email' ? 'Email' : 'Téléphone'} vérifié avec succès`, 'success');
            
            // Mettre à jour le statut de l'utilisateur
            if (currentVerificationType === 'email') {
                currentUser.email_verified = true;
            } else {
                currentUser.phone_verified = true;
            }
            localStorage.setItem('user', JSON.stringify(currentUser));
            
            closeVerificationModal();
            updateVerificationBadges();
        } else {
            const data = await response.json();
            showAlert('verification-alert', data.error || 'Code invalide ou expiré', 'error');
        }
    } catch (error) {
        console.error('Erreur:', error);
        showAlert('verification-alert', 'Erreur de connexion au serveur', 'error');
    }
}

// Fermer le modal
function closeVerificationModal() {
    document.getElementById('verification-modal').classList.remove('active');
    document.getElementById('verification-code').value = '';
    currentVerificationType = null;
}

// Renvoyer le code
async function resendVerificationCode() {
    if (currentVerificationType) {
        await requestVerification(currentVerificationType);
    }
}

// Mettre à jour les badges de vérification dans l'interface
function updateVerificationBadges() {
    // Email badge
    const emailBadge = document.getElementById('email-verification-badge');
    if (emailBadge) {
        if (currentUser.email_verified) {
            emailBadge.className = 'verified-badge';
            emailBadge.innerHTML = '✓ Email vérifié';
        } else {
            emailBadge.className = 'unverified-badge';
            emailBadge.innerHTML = '⚠ Email non vérifié';
        }
    }
    
    // Phone badge
    const phoneBadge = document.getElementById('phone-verification-badge');
    if (phoneBadge) {
        if (currentUser.phone_verified) {
            phoneBadge.className = 'verified-badge';
            phoneBadge.innerHTML = '✓ Téléphone vérifié';
        } else {
            phoneBadge.className = 'unverified-badge';
            phoneBadge.innerHTML = '⚠ Téléphone non vérifié';
        }
    }
}
```

## 5. Bloquer l'Accès aux Annonces Sans Connexion

### JavaScript
```javascript
// Modifier la fonction openPropertyModal
async function openPropertyModal(propertyId) {
    // Vérifier si l'utilisateur est connecté
    if (!currentUser) {
        showToast(
            'Connexion requise', 
            'Vous devez être connecté pour voir les détails des annonces',
            'warning'
        );
        
        // Sauvegarder l'ID de la propriété pour y retourner après connexion
        localStorage.setItem('pendingPropertyView', propertyId);
        
        // Rediriger vers la page de connexion
        showPage('login');
        return;
    }
    
    // Si connecté, continuer normalement
    selectedPropertyId = propertyId;
    
    try {
        const response = await fetch(`${API_URL}/properties/${propertyId}`);
        const property = await response.json();

        if (response.ok) {
            document.getElementById('modal-property-title').textContent = property.title;
            
            // Afficher les infos de contact seulement si vérifié
            const contactInfo = currentUser.email_verified ? 
                `<p><strong>Email:</strong> ${property.email}</p>` : 
                `<p><strong>Email:</strong> <span class="unverified-badge">Vérifiez votre email pour voir</span></p>`;
            
            const content = `
                <div style="margin-bottom: 2rem;">
                    <!-- Contenu de la modal -->
                    <h3>${property.price} CHF <span style="font-size: 1rem; color: var(--text-light);">/mois</span></h3>
                    <p><strong>Localisation:</strong> ${property.address}, ${property.city_name} ${property.postal_code} (${property.canton_name})</p>
                    
                    <div style="display: flex; gap: 1.5rem; margin: 1rem 0; padding: 1rem 0; border-top: 1px solid var(--border); border-bottom: 1px solid var(--border);">
                        ${property.rooms ? `<span><strong>Pièces:</strong> ${property.rooms}</span>` : ''}
                        ${property.bathrooms ? `<span><strong>SDB:</strong> ${property.bathrooms}</span>` : ''}
                        ${property.surface_area ? `<span><strong>Surface:</strong> ${property.surface_area}m²</span>` : ''}
                    </div>
                    
                    <h4 style="margin: 1.5rem 0 0.5rem 0;">Description</h4>
                    <p style="line-height: 1.8; color: var(--text-light);">${property.description || 'Pas de description disponible'}</p>
                    
                    <div style="margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px solid var(--border);">
                        <h4 style="margin-bottom: 0.5rem;">Propriétaire</h4>
                        <p><strong>Nom:</strong> ${property.first_name} ${property.last_name}</p>
                        ${contactInfo}
                        ${property.phone && currentUser.phone_verified ? `<p><strong>Téléphone:</strong> ${property.phone}</p>` : ''}
                    </div>
                </div>
            `;
            
            document.getElementById('modal-property-content').innerHTML = content;
            document.getElementById('property-modal').classList.add('active');
        }
    } catch (error) {
        console.error('Erreur:', error);
        showToast('Erreur', 'Impossible de charger les détails de l\'annonce', 'error');
    }
}

// Après connexion réussie, vérifier si une propriété était en attente
async function checkPendingPropertyView() {
    const pendingPropertyId = localStorage.getItem('pendingPropertyView');
    if (pendingPropertyId) {
        localStorage.removeItem('pendingPropertyView');
        await openPropertyModal(parseInt(pendingPropertyId));
    }
}

// Appeler après login réussi
async function login() {
    // ... code de connexion existant ...
    
    if (response.ok) {
        currentUser = data.user;
        currentToken = data.token;
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        updateAuthUI();
        showAlert('login-alert', 'Connexion réussie !', 'success');
        
        // Vérifier si une propriété était en attente de visualisation
        await checkPendingPropertyView();
        
        setTimeout(() => showPage('dashboard'), 1500);
    }
}
```

## 6. Page de Messagerie

### HTML
```html
<div id="messages-page" class="page hidden">
    <div class="container">
        <h1 style="margin-bottom: 2rem;">Messages</h1>
        
        <div style="display: grid; grid-template-columns: 1fr 2fr; gap: 2rem;">
            <!-- Liste des conversations -->
            <div>
                <div id="conversations-list"></div>
            </div>
            
            <!-- Conversation active -->
            <div id="active-conversation" class="hidden">
                <div style="background: white; border-radius: var(--radius-md); border: 1px solid var(--border); padding: 1.5rem;">
                    <h3 id="conversation-title" style="margin-bottom: 1rem;"></h3>
                    
                    <div id="messages-container" class="messages-container"></div>
                    
                    <div class="message-form">
                        <input type="text" id="message-input" class="message-input" placeholder="Écrivez votre message...">
                        <button class="btn btn-primary" onclick="sendMessage()">Envoyer</button>
                    </div>
                </div>
            </div>
            
            <!-- État vide -->
            <div id="no-conversation" class="empty-state">
                <p>Sélectionnez une conversation pour commencer à discuter</p>
            </div>
        </div>
    </div>
</div>
```

### JavaScript
```javascript
let conversations = [];
let activeConversationId = null;
let messages = [];

// Charger les conversations
async function loadConversations() {
    try {
        const response = await fetch(`${API_URL}/conversations`, {
            headers: { 'Authorization': `Bearer ${currentToken}` }
        });
        conversations = await response.json();
        
        displayConversations();
    } catch (error) {
        console.error('Erreur chargement conversations:', error);
    }
}

// Afficher les conversations
function displayConversations() {
    const container = document.getElementById('conversations-list');
    
    if (conversations.length === 0) {
        container.innerHTML = '<div class="empty-state"><p>Aucune conversation</p></div>';
        return;
    }
    
    container.innerHTML = conversations.map(conv => `
        <div class="conversation-item" onclick="openConversation(${conv.id})">
            <div class="conversation-header">
                <h4>${conv.property_title}</h4>
                ${conv.unread_count > 0 ? `<span class="unread-badge">${conv.unread_count}</span>` : ''}
            </div>
            <p style="color: var(--text-light); font-size: 0.875rem;">${conv.other_user_name}</p>
            <p style="color: var(--text-light); font-size: 0.8125rem; margin-top: 0.25rem;">${conv.last_message || 'Aucun message'}</p>
        </div>
    `).join('');
}

// Ouvrir une conversation
async function openConversation(conversationId) {
    activeConversationId = conversationId;
    
    try {
        const response = await fetch(`${API_URL}/messages/${conversationId}`, {
            headers: { 'Authorization': `Bearer ${currentToken}` }
        });
        messages = await response.json();
        
        const conv = conversations.find(c => c.id === conversationId);
        document.getElementById('conversation-title').textContent = conv.property_title;
        
        displayMessages();
        
        document.getElementById('active-conversation').classList.remove('hidden');
        document.getElementById('no-conversation').classList.add('hidden');
    } catch (error) {
        console.error('Erreur chargement messages:', error);
    }
}

// Afficher les messages
function displayMessages() {
    const container = document.getElementById('messages-container');
    
    container.innerHTML = messages.map(msg => `
        <div class="message ${msg.sender_id === currentUser.id ? 'own' : ''}">
            <div class="message-avatar">${msg.first_name[0]}${msg.last_name[0]}</div>
            <div class="message-content">
                <div class="message-bubble">${msg.content}</div>
                <div class="message-meta">${new Date(msg.created_at).toLocaleString('fr-CH')}</div>
            </div>
        </div>
    `).join('');
    
    // Scroll vers le bas
    container.scrollTop = container.scrollHeight;
}

// Envoyer un message
async function sendMessage() {
    const input = document.getElementById('message-input');
    const content = input.value.trim();
    
    if (!content || !activeConversationId) return;
    
    try {
        const response = await fetch(`${API_URL}/messages`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${currentToken}`
            },
            body: JSON.stringify({
                conversation_id: activeConversationId,
                content: content
            })
        });
        
        if (response.ok) {
            input.value = '';
            await openConversation(activeConversationId);
        }
    } catch (error) {
        console.error('Erreur envoi message:', error);
        showToast('Erreur', 'Impossible d\'envoyer le message', 'error');
    }
}

// Permettre d'envoyer avec Enter
document.getElementById('message-input')?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessage();
    }
});
```

## 7. Prix en CHF

### Partout où il y a des prix
```html
<!-- ❌ Avant -->
<span>650€/mois</span>

<!-- ✅ Après -->
<span>950 CHF/mois</span>
```

### Dans le JavaScript
```javascript
// Formater les prix
function formatPrice(price) {
    return new Intl.NumberFormat('fr-CH', {
        style: 'currency',
        currency: 'CHF'
    }).format(price);
}

// Utilisation
property.price_formatted = formatPrice(property.price); // "950.00 CHF"
```

## 8. Téléphones Suisses

### Format
```javascript
// Validation téléphone suisse
function validateSwissPhone(phone) {
    // Format acceptés: +41 76 123 45 67, +41761234567, 0761234567
    const regex = /^(\+41|0)[1-9]\d{8}$/;
    return regex.test(phone.replace(/\s/g, ''));
}

// Formatage
function formatSwissPhone(phone) {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.startsWith('41')) {
        return '+41 ' + cleaned.slice(2, 4) + ' ' + cleaned.slice(4, 7) + ' ' + 
               cleaned.slice(7, 9) + ' ' + cleaned.slice(9);
    }
    return phone;
}
```

---

Ces exemples montrent concrètement comment moderniser le frontend pour respecter toutes les exigences demandées.
