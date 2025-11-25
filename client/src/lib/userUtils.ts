/**
 * Utilitaires pour gérer les utilisateurs supprimés
 */

export interface User {
  id?: number;
  first_name?: string;
  last_name?: string;
  email?: string;
  profile_picture?: string | null;
  deleted_at?: string | null;
}

/**
 * Vérifie si un utilisateur est supprimé
 */
export function isUserDeleted(user: User | null | undefined): boolean {
  if (!user) return false;
  return !!user.deleted_at;
}

/**
 * Formate le nom d'un utilisateur (gère les utilisateurs supprimés)
 */
export function formatUserName(user: User | null | undefined): string {
  if (!user) return 'Utilisateur inconnu';
  
  if (isUserDeleted(user)) {
    return `deleted_user_${user.id || ''}`;
  }
  
  const firstName = user.first_name || '';
  const lastName = user.last_name || '';
  return `${firstName} ${lastName}`.trim() || 'Utilisateur';
}

/**
 * Formate le nom complet d'un utilisateur pour l'affichage
 */
export function formatUserDisplayName(user: User | null | undefined): string {
  if (!user) return 'Utilisateur inconnu';
  
  if (isUserDeleted(user)) {
    return `deleted_user_${user.id || ''}`;
  }
  
  const firstName = user.first_name || '';
  const lastName = user.last_name || '';
  return `${firstName} ${lastName}`.trim() || 'Utilisateur';
}

/**
 * Retourne l'URL de la photo de profil ou null si l'utilisateur est supprimé
 */
export function getUserProfilePicture(user: User | null | undefined): string | null | undefined {
  if (!user || isUserDeleted(user)) {
    return null;
  }
  return user.profile_picture;
}

/**
 * Retourne les initiales d'un utilisateur (ou "DU" pour deleted user)
 */
export function getUserInitials(user: User | null | undefined): string {
  if (!user) return 'U';
  
  if (isUserDeleted(user)) {
    return 'DU';
  }
  
  const firstName = user.first_name || '';
  const lastName = user.last_name || '';
  
  if (firstName && lastName) {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  }
  
  if (firstName) {
    return firstName[0].toUpperCase();
  }
  
  if (lastName) {
    return lastName[0].toUpperCase();
  }
  
  return 'U';
}

