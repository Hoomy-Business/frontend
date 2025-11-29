# Déploiement sur GitHub Pages

Ce projet est configuré pour être déployé automatiquement sur GitHub Pages.

## Configuration

Le projet est configuré avec :
- **Base path** : `/` (racine du domaine)
- **Workflow GitHub Actions** : Déploiement automatique à chaque push sur `main`
- **Build output** : Dossier `dist/`

## Déploiement automatique

Le déploiement se fait automatiquement via GitHub Actions lorsque vous poussez sur la branche `main`.

### Étapes pour pousser votre code :

1. **Vérifier que le remote GitHub est configuré** :
   ```bash
   git remote -v
   ```
   Vous devriez voir `origin` pointant vers `https://github.com/Hoomy-Business/frontend.git`

2. **Ajouter tous les fichiers** :
   ```bash
   git add .
   ```

3. **Créer un commit** :
   ```bash
   git commit -m "Configure GitHub Pages deployment"
   ```

4. **Pousser sur GitHub** :
   ```bash
   git push origin main
   ```

5. **Activer GitHub Pages** :
   - Allez sur https://github.com/Hoomy-Business/frontend/settings/pages
   - Sous "Source", sélectionnez "GitHub Actions"
   - Le workflow se déclenchera automatiquement

## Déploiement manuel (optionnel)

Si vous préférez déployer manuellement :

```bash
npm run build
npm run deploy
```

## URL du site

Une fois déployé, votre site sera accessible à :
**https://hoomy.site/**

## Notes importantes

- Le base path est `/` (racine du domaine)
- Les assets (images, CSS, JS) sont automatiquement préfixés avec le base path
- Le workflow GitHub Actions build et déploie automatiquement à chaque push sur `main`

## Dépannage

Si le site ne se charge pas correctement :
1. Vérifiez que GitHub Pages est activé dans les paramètres du repository
2. Vérifiez que le workflow GitHub Actions s'est exécuté avec succès
3. Vérifiez que le base path dans `vite.config.ts` est configuré sur `/`

