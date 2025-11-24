# Configuration LAN pour tester sur téléphone

## Configuration effectuée

1. **Frontend (Vite)** : Configure pour écouter sur `0.0.0.0` (toutes les interfaces réseau)
2. **Backend (Express)** : Configure pour écouter sur `0.0.0.0` et détecter automatiquement l'IP locale
3. **API Base URL** : Détection automatique de l'IP depuis le hostname

## Comment démarrer

### Option 1 : Script automatique (Windows)
```bash
start-lan.bat
```

### Option 2 : Manuel

1. **Démarrer le backend** :
```bash
cd "D:\Users\kor\Desktop\updo\hoomy_backend"
npm start
```
Le backend affichera l'IP locale détectée (ex: `192.168.1.100`)

2. **Démarrer le frontend** :
```bash
cd "D:\Users\kor\Desktop\PerfectFrontend"
npm run dev
```

3. **Noter l'IP locale** affichée dans la console du backend

## Accès depuis le téléphone

1. **Assurez-vous que votre téléphone est sur le même réseau WiFi** que votre ordinateur

2. **Ouvrez le navigateur sur votre téléphone** et allez à :
   ```
   http://[IP_LOCALE]:5000
   ```
   Par exemple : `http://192.168.1.100:5000`

3. **L'API sera automatiquement accessible** via `http://[IP_LOCALE]:3000/api`

## Dépannage

### Le téléphone ne peut pas accéder au site
- Vérifiez que le téléphone est sur le même réseau WiFi
- Vérifiez que le pare-feu Windows autorise les connexions sur les ports 5000 et 3000
- Essayez de désactiver temporairement le pare-feu pour tester

### L'API ne fonctionne pas depuis le téléphone
- Vérifiez que le backend est bien démarré et écoute sur `0.0.0.0`
- Vérifiez que l'IP affichée dans la console correspond bien à votre IP locale
- Vérifiez les erreurs CORS dans la console du navigateur (F12)

### Trouver votre IP locale manuellement
```bash
# Windows
ipconfig

# Cherchez "Adresse IPv4" sous votre carte réseau WiFi
```

## Notes

- L'IP locale peut changer si vous vous reconnectez au WiFi
- Si l'IP change, redémarrez les serveurs pour obtenir la nouvelle IP
- En production, ces configurations ne sont pas nécessaires

