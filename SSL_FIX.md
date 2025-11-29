# 🔐 Fix: PR_CONNECT_RESET_ERROR - Configuration SSL/TLS

## 🔍 Problème identifié

Vous rencontrez l'erreur `PR_CONNECT_RESET_ERROR` dans le navigateur car :

1. **Le navigateur essaie HTTPS par défaut** : Les navigateurs modernes tentent automatiquement HTTPS pour les domaines
2. **Le serveur n'accepte que HTTP** : Votre configuration Nginx écoute uniquement sur le port 80 (HTTP)
3. **Échec de la poignée de main SSL** : Le navigateur ne peut pas établir une connexion SSL/TLS sécurisée

## ✅ Solution

Configurer SSL/TLS avec Let's Encrypt pour permettre les connexions HTTPS.

## 🚀 Installation rapide (recommandé)

### Sur le serveur Ubuntu, exécutez :

```bash
# 1. Télécharger le script (depuis votre machine locale)
# Ou copier le contenu de setup-ssl.sh sur le serveur

# 2. Rendre le script exécutable
chmod +x setup-ssl.sh

# 3. Exécuter le script
sudo ./setup-ssl.sh
```

Le script va automatiquement :
- ✅ Vérifier les prérequis
- ✅ Configurer Nginx pour HTTP
- ✅ Installer Certbot
- ✅ Obtenir le certificat SSL
- ✅ Configurer HTTPS avec redirection HTTP→HTTPS
- ✅ Configurer le renouvellement automatique

## 📝 Installation manuelle

Si vous préférez faire l'installation manuellement, suivez les étapes dans `SETUP_SSL.md`.

### Étapes rapides :

```bash
# 1. Installer Certbot
sudo apt update
sudo apt install certbot python3-certbot-nginx -y

# 2. Vérifier que le port 80 et 443 sont ouverts
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# 3. Obtenir le certificat SSL
sudo certbot --nginx -d backend.hoomy.site

# Suivre les instructions :
# - Email: votre email
# - Accepter les termes: A
# - Redirection HTTP→HTTPS: 2 (recommandé)
```

## 🧪 Vérification

Après l'installation, testez :

```bash
# Depuis le serveur
curl https://backend.hoomy.site/api/properties

# Depuis votre machine locale
curl https://backend.hoomy.site/api/properties
```

Dans le navigateur :
- Ouvrir `https://backend.hoomy.site/api/properties`
- Vérifier que le cadenas SSL est vert
- Vérifier qu'il n'y a plus d'erreur

## 🔧 Dépannage

### Le certificat n'est pas obtenu

**Vérifier le DNS :**
```bash
nslookup backend.hoomy.site
# Doit pointer vers 164.92.237.171
```

**Vérifier que le port 80 est accessible :**
```bash
# Depuis l'extérieur
curl -I http://backend.hoomy.site
```

**Vérifier les logs :**
```bash
sudo tail -f /var/log/letsencrypt/letsencrypt.log
```

### Nginx ne démarre pas après configuration SSL

```bash
# Tester la configuration
sudo nginx -t

# Voir les erreurs
sudo journalctl -u nginx -n 50
```

### Le port 443 n'est pas accessible

```bash
# Vérifier le firewall
sudo ufw status

# Ouvrir le port 443
sudo ufw allow 443/tcp
sudo ufw reload

# Vérifier que Nginx écoute sur 443
sudo netstat -tlnp | grep 443
```

## 📋 Configuration finale

Après l'installation, votre configuration Nginx devrait inclure :

1. **Redirection HTTP → HTTPS** (port 80)
2. **Configuration HTTPS** (port 443) avec :
   - Certificats SSL valides
   - Headers de sécurité
   - Proxy vers Node.js sur le port 3000

## 🔄 Renouvellement automatique

Let's Encrypt renouvelle automatiquement les certificats (valides 90 jours). Vérifier :

```bash
# Tester le renouvellement
sudo certbot renew --dry-run

# Voir les certificats
sudo certbot certificates
```

## 📚 Fichiers créés

- `nginx-backend-ssl.conf` : Configuration Nginx complète avec SSL
- `SETUP_SSL.md` : Guide détaillé d'installation
- `setup-ssl.sh` : Script d'installation automatique
- `SSL_FIX.md` : Ce fichier (résumé du problème et solution)

## ⚠️ Important

- Ne supprimez jamais les fichiers dans `/etc/letsencrypt/`
- Le renouvellement automatique est configuré par défaut
- Les certificats sont valides pendant 90 jours
- Si vous changez de serveur, vous devrez reconfigurer le certificat

## ✅ Checklist

- [ ] Certbot installé
- [ ] Ports 80 et 443 ouverts dans le firewall
- [ ] DNS configuré correctement
- [ ] Certificat SSL obtenu
- [ ] Nginx configuré avec SSL
- [ ] Redirection HTTP→HTTPS active
- [ ] Test HTTPS réussi depuis le navigateur
- [ ] Renouvellement automatique testé


