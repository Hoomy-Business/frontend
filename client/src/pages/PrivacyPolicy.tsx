import { MainLayout } from '@/components/MainLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, Lock, Database, Eye, UserCheck, FileText, Mail, Calendar, Info } from 'lucide-react';

export default function PrivacyPolicy() {
  return (
    <MainLayout>
      <div className="min-h-screen bg-background py-3 sm:py-6 md:py-8 lg:py-12">
        <div className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-8 max-w-5xl">
          {/* Header */}
          <div className="mb-6 sm:mb-8 md:mb-12">
            <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3 md:mb-4">
              <Shield className="h-5 w-5 sm:h-8 sm:w-8 md:h-10 md:w-10 text-primary flex-shrink-0" />
              <h1 className="text-xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">Privacy Policy</h1>
            </div>
            <p className="text-xs sm:text-sm md:text-base text-muted-foreground mb-2 leading-relaxed">
              Politique de Confidentialité - Dernière mise à jour : {new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Protection de vos données personnelles conformément au RGPD et à la LPD suisse
            </p>
            <div className="mt-3 sm:mt-4 flex items-start sm:items-center gap-2 px-3 py-2 sm:px-4 bg-blue-50 border border-blue-200 rounded-lg">
              <Info className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5 sm:mt-0" />
              <p className="text-xs text-blue-700 leading-relaxed">
                Hoomy s'engage à protéger votre vie privée et vos données personnelles
              </p>
            </div>
          </div>

          {/* Introduction */}
          <Card className="mb-6 sm:mb-8">
            <CardContent className="p-4 sm:p-6 md:p-8">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-bold">1. Introduction</h2>
              </div>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-4">
                Hoomy ("nous", "notre", "nos") respecte votre vie privée et s'engage à protéger vos données personnelles. 
                Cette politique de confidentialité explique comment nous collectons, utilisons, stockons et protégeons vos informations 
                lorsque vous utilisez notre plateforme de location de logements étudiants.
              </p>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                En utilisant Hoomy, vous acceptez les pratiques décrites dans cette politique. Si vous n'acceptez pas cette politique, 
                veuillez ne pas utiliser notre service.
              </p>
            </CardContent>
          </Card>

          {/* Data Collection */}
          <Card className="mb-6 sm:mb-8">
            <CardContent className="p-4 sm:p-6 md:p-8">
              <div className="flex items-center gap-2 mb-4">
                <Database className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-bold">2. Données Collectées</h2>
              </div>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">2.1 Données d'identification</h3>
                  <ul className="list-disc list-inside text-sm sm:text-base text-muted-foreground space-y-1">
                    <li>Nom et prénom</li>
                    <li>Adresse e-mail</li>
                    <li>Numéro de téléphone (optionnel)</li>
                    <li>Date de naissance</li>
                    <li>Photo de profil (optionnelle)</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">2.2 Données de connexion</h3>
                  <ul className="list-disc list-inside text-sm sm:text-base text-muted-foreground space-y-1">
                    <li>Adresse IP</li>
                    <li>Type de navigateur et système d'exploitation</li>
                    <li>Données de navigation et préférences</li>
                    <li>Cookies et technologies similaires</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">2.3 Données de transaction</h3>
                  <ul className="list-disc list-inside text-sm sm:text-base text-muted-foreground space-y-1">
                    <li>Historique des paiements</li>
                    <li>Informations de facturation</li>
                    <li>Détails des contrats de location</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Data Usage */}
          <Card className="mb-6 sm:mb-8">
            <CardContent className="p-4 sm:p-6 md:p-8">
              <div className="flex items-center gap-2 mb-4">
                <Eye className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-bold">3. Utilisation des Données</h2>
              </div>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-4">
                Nous utilisons vos données personnelles pour :
              </p>
              <ul className="list-disc list-inside text-sm sm:text-base text-muted-foreground space-y-2">
                <li>Fournir et améliorer nos services de location</li>
                <li>Faciliter la communication entre étudiants et propriétaires</li>
                <li>Traiter les paiements et gérer les contrats</li>
                <li>Vérifier l'identité des utilisateurs (KYC)</li>
                <li>Envoyer des notifications importantes</li>
                <li>Assurer la sécurité de la plateforme</li>
                <li>Respecter nos obligations légales</li>
                <li>Analyser l'utilisation de la plateforme pour améliorer l'expérience utilisateur</li>
              </ul>
            </CardContent>
          </Card>

          {/* Data Protection */}
          <Card className="mb-6 sm:mb-8">
            <CardContent className="p-4 sm:p-6 md:p-8">
              <div className="flex items-center gap-2 mb-4">
                <Lock className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-bold">4. Protection des Données</h2>
              </div>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-4">
                Nous mettons en œuvre des mesures de sécurité techniques et organisationnelles appropriées pour protéger vos données :
              </p>
              <ul className="list-disc list-inside text-sm sm:text-base text-muted-foreground space-y-2">
                <li>Chiffrement SSL/TLS pour toutes les transmissions</li>
                <li>Stockage sécurisé des données avec accès restreint</li>
                <li>Authentification à deux facteurs disponible</li>
                <li>Surveillance continue des systèmes</li>
                <li>Sauvegardes régulières et sécurisées</li>
                <li>Formation du personnel sur la protection des données</li>
              </ul>
            </CardContent>
          </Card>

          {/* User Rights */}
          <Card className="mb-6 sm:mb-8">
            <CardContent className="p-4 sm:p-6 md:p-8">
              <div className="flex items-center gap-2 mb-4">
                <UserCheck className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-bold">5. Vos Droits</h2>
              </div>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-4">
                Conformément au RGPD et à la LPD suisse, vous disposez des droits suivants :
              </p>
              <ul className="list-disc list-inside text-sm sm:text-base text-muted-foreground space-y-2">
                <li><strong>Droit d'accès :</strong> Vous pouvez demander une copie de vos données personnelles</li>
                <li><strong>Droit de rectification :</strong> Vous pouvez corriger vos données inexactes</li>
                <li><strong>Droit à l'effacement :</strong> Vous pouvez demander la suppression de vos données</li>
                <li><strong>Droit à la portabilité :</strong> Vous pouvez récupérer vos données dans un format structuré</li>
                <li><strong>Droit d'opposition :</strong> Vous pouvez vous opposer au traitement de vos données</li>
                <li><strong>Droit à la limitation :</strong> Vous pouvez demander la limitation du traitement</li>
              </ul>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mt-4">
                Pour exercer ces droits, contactez-nous à : <a href="mailto:privacy@hoomy.site" className="text-primary hover:underline">privacy@hoomy.site</a>
              </p>
            </CardContent>
          </Card>

          {/* Cookies */}
          <Card className="mb-6 sm:mb-8">
            <CardContent className="p-4 sm:p-6 md:p-8">
              <div className="flex items-center gap-2 mb-4">
                <Database className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-bold">6. Cookies et Technologies Similaires</h2>
              </div>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-4">
                Nous utilisons des cookies et technologies similaires pour :
              </p>
              <ul className="list-disc list-inside text-sm sm:text-base text-muted-foreground space-y-2">
                <li>Mémoriser vos préférences de langue</li>
                <li>Maintenir votre session de connexion</li>
                <li>Analyser l'utilisation de la plateforme</li>
                <li>Améliorer la performance du site</li>
              </ul>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mt-4">
                Vous pouvez gérer vos préférences de cookies dans les paramètres de votre navigateur.
              </p>
            </CardContent>
          </Card>

          {/* Data Sharing */}
          <Card className="mb-6 sm:mb-8">
            <CardContent className="p-4 sm:p-6 md:p-8">
              <div className="flex items-center gap-2 mb-4">
                <UserCheck className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-bold">7. Partage des Données</h2>
              </div>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-4">
                Nous ne vendons jamais vos données personnelles. Nous pouvons partager vos données uniquement avec :
              </p>
              <ul className="list-disc list-inside text-sm sm:text-base text-muted-foreground space-y-2">
                <li><strong>Prestataires de services :</strong> Stripe (paiements), services d'hébergement</li>
                <li><strong>Autorités légales :</strong> Si requis par la loi suisse</li>
                <li><strong>Autres utilisateurs :</strong> Informations de profil nécessaires pour les transactions</li>
              </ul>
            </CardContent>
          </Card>

          {/* Contact */}
          <Card className="mb-6 sm:mb-8">
            <CardContent className="p-4 sm:p-6 md:p-8">
              <div className="flex items-center gap-2 mb-4">
                <Mail className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-bold">8. Contact</h2>
              </div>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-4">
                Pour toute question concernant cette politique de confidentialité ou vos données personnelles, contactez-nous :
              </p>
              <div className="space-y-2 text-sm sm:text-base text-muted-foreground">
                <p><strong>Email :</strong> <a href="mailto:privacy@hoomy.site" className="text-primary hover:underline">privacy@hoomy.site</a></p>
                <p><strong>Site web :</strong> <a href="https://hoomy.site" className="text-primary hover:underline">hoomy.site</a></p>
              </div>
            </CardContent>
          </Card>

          {/* Updates */}
          <Card>
            <CardContent className="p-4 sm:p-6 md:p-8">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-bold">9. Modifications</h2>
              </div>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                Nous nous réservons le droit de modifier cette politique de confidentialité à tout moment. 
                Les modifications seront publiées sur cette page avec une date de mise à jour révisée. 
                Nous vous encourageons à consulter régulièrement cette page pour rester informé de nos pratiques.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}

