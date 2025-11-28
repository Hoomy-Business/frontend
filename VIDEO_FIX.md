# Fix pour la vidéo de background

## Problème
L'erreur "Cannot parse metadata" indique que les métadonnées MP4 sont à la fin du fichier au lieu du début. Les navigateurs modernes ont besoin que les métadonnées (moov atom) soient au début pour pouvoir décoder la vidéo.

## Solution : Réencoder la vidéo avec faststart

Utilisez FFmpeg pour réencoder la vidéo avec les métadonnées au début :

```bash
ffmpeg -i client/public/video/background.mp4 -c:v libx264 -preset medium -crf 23 -c:a aac -b:a 128k -movflags +faststart client/public/video/background_fixed.mp4
```

Ou si vous voulez juste déplacer les métadonnées sans réencoder :

```bash
ffmpeg -i client/public/video/background.mp4 -c copy -movflags +faststart client/public/video/background_fixed.mp4
```

La deuxième commande est plus rapide car elle ne réencode pas la vidéo, elle déplace juste les métadonnées.

## Alternative : Utiliser un format WebM

WebM est généralement mieux supporté et plus léger :

```bash
ffmpeg -i client/public/video/background.mp4 -c:v libvpx-vp9 -b:v 2M -c:a libopus client/public/video/background.webm
```

Puis ajouter dans le code :
```tsx
<video>
  <source src="/video/background.webm" type="video/webm" />
  <source src="/video/background.mp4" type="video/mp4" />
</video>
```


