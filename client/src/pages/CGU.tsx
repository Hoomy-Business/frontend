import { MainLayout } from '@/components/MainLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, FileText, Scale, Shield, AlertTriangle, Info, Lock, Server, Database, Users, FileSignature, Gavel, Mail, Phone, MapPin, Clock, Bot, Check, Calendar, Flag, MessageSquare } from 'lucide-react';

export default function CGU() {
  return (
    <MainLayout>
      <div className="min-h-screen bg-background py-3 sm:py-6 md:py-8 lg:py-12">
        <div className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-8 max-w-5xl">
          {/* Header */}
          <div className="mb-6 sm:mb-8 md:mb-12">
            <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3 md:mb-4">
              <FileText className="h-5 w-5 sm:h-8 sm:w-8 md:h-10 md:w-10 text-primary flex-shrink-0" />
              <h1 className="text-xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">Conditions Générales d'Utilisation</h1>
            </div>
            <p className="text-xs sm:text-sm md:text-base text-muted-foreground mb-2 leading-relaxed">
              Version Professionnelle Exhaustive - Dernière mise à jour : 25 novembre 2025
            </p>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Document juridique contraignant régissant l'utilisation de la Plateforme Hoomy conformément au droit suisse
            </p>
            <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
              60 articles • Environ 45'000 mots • Protection juridique renforcée
            </p>
            <div className="mt-3 sm:mt-4 flex items-start sm:items-center gap-2 px-3 py-2 sm:px-4 bg-blue-50 border border-blue-200 rounded-lg">
              <Info className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5 sm:mt-0" />
              <p className="text-xs text-blue-700 leading-relaxed">
                Plateforme lancée le 7 novembre 2025 • Entreprise individuelle en phase de démarrage
              </p>
            </div>
          </div>

          {/* Table des matières complète */}
          <Card className="mb-6 sm:mb-8 md:mb-12">
            <CardContent className="p-3 sm:p-6 md:p-8">
              <div className="flex items-center gap-2 mb-3 sm:mb-4">
                <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
                <h3 className="text-base sm:text-xl md:text-2xl font-bold">Table des Matières Complète</h3>
              </div>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 sm:gap-y-2 text-xs sm:text-sm md:text-base list-none space-y-1 md:space-y-0">
                <li className="leading-relaxed"><a href="#preambule" className="text-primary hover:underline break-words">Préambule et Dispositions Générales</a></li>
                <li className="leading-relaxed"><a href="#article1" className="text-primary hover:underline break-words">Art. 1 - Définitions et Terminologie Juridique</a></li>
                <li className="leading-relaxed"><a href="#article2" className="text-primary hover:underline break-words">Art. 2 - Objet et Périmètre Contractuel</a></li>
                <li className="leading-relaxed"><a href="#article3" className="text-primary hover:underline break-words">Art. 3 - Conditions d'Accès et d'Inscription</a></li>
                <li className="leading-relaxed"><a href="#article4" className="text-primary hover:underline break-words">Art. 4 - Architecture Technique</a></li>
                <li className="leading-relaxed"><a href="#article5" className="text-primary hover:underline break-words">Art. 5 - Fonctionnement du Service</a></li>
                <li className="leading-relaxed"><a href="#article6" className="text-primary hover:underline break-words">Art. 6 - Système de Commission</a></li>
                <li className="leading-relaxed"><a href="#article7" className="text-primary hover:underline break-words">Art. 7 - Interdictions de Contournement</a></li>
                <li className="leading-relaxed"><a href="#article8" className="text-primary hover:underline break-words">Art. 8 - Détection de la Fraude</a></li>
                <li className="leading-relaxed"><a href="#article9" className="text-primary hover:underline break-words">Art. 9 - Obligations des Étudiants</a></li>
                <li className="leading-relaxed"><a href="#article10" className="text-primary hover:underline break-words">Art. 10 - Obligations des Propriétaires</a></li>
                <li className="leading-relaxed"><a href="#article11" className="text-primary hover:underline break-words">Art. 11 - Publication d'Annonces</a></li>
                <li className="leading-relaxed"><a href="#article12" className="text-primary hover:underline break-words">Art. 12 - Recherche et Navigation</a></li>
                <li className="leading-relaxed"><a href="#article13" className="text-primary hover:underline break-words">Art. 13 - Messagerie Interne</a></li>
                <li className="leading-relaxed"><a href="#article14" className="text-primary hover:underline break-words">Art. 14 - Conclusion du Bail</a></li>
                <li className="leading-relaxed"><a href="#article15" className="text-primary hover:underline break-words">Art. 15 - Évaluations et Avis</a></li>
                <li className="leading-relaxed"><a href="#article16" className="text-primary hover:underline break-words">Art. 16 - Responsabilités de Hoomy</a></li>
                <li className="leading-relaxed"><a href="#article17" className="text-primary hover:underline break-words">Art. 17 - Limitation de Responsabilité</a></li>
                <li className="leading-relaxed"><a href="#article18" className="text-primary hover:underline break-words">Art. 18 - Force Majeure</a></li>
                <li className="leading-relaxed"><a href="#article19" className="text-primary hover:underline break-words">Art. 19 - Garanties et Déclarations</a></li>
                <li className="leading-relaxed"><a href="#article20" className="text-primary hover:underline break-words">Art. 20 - Indemnisation</a></li>
                <li className="leading-relaxed"><a href="#article21" className="text-primary hover:underline break-words">Art. 21 - Propriété Intellectuelle</a></li>
                <li className="leading-relaxed"><a href="#article22" className="text-primary hover:underline break-words">Art. 22 - Marques et Logos</a></li>
                <li className="leading-relaxed"><a href="#article23" className="text-primary hover:underline break-words">Art. 23 - Droits d'Utilisation</a></li>
                <li className="leading-relaxed"><a href="#article24" className="text-primary hover:underline break-words">Art. 24 - Contenus Utilisateurs</a></li>
                <li className="leading-relaxed"><a href="#article25" className="text-primary hover:underline break-words">Art. 25 - Licence d'Exploitation</a></li>
                <li className="leading-relaxed"><a href="#article26" className="text-primary hover:underline break-words">Art. 26 - Protection des Données</a></li>
                <li className="leading-relaxed"><a href="#article27" className="text-primary hover:underline break-words">Art. 27 - Traitement des Données</a></li>
                <li className="leading-relaxed"><a href="#article28" className="text-primary hover:underline break-words">Art. 28 - Droits des Utilisateurs</a></li>
                <li className="leading-relaxed"><a href="#article29" className="text-primary hover:underline break-words">Art. 29 - Cookies et Traceurs</a></li>
                <li className="leading-relaxed"><a href="#article30" className="text-primary hover:underline break-words">Art. 30 - Transferts Internationaux</a></li>
                <li className="leading-relaxed"><a href="#article31" className="text-primary hover:underline break-words">Art. 31 - Sécurité Informatique</a></li>
                <li className="leading-relaxed"><a href="#article32" className="text-primary hover:underline break-words">Art. 32 - Chiffrement et Cryptographie</a></li>
                <li className="leading-relaxed"><a href="#article33" className="text-primary hover:underline break-words">Art. 33 - Sauvegarde des Données</a></li>
                <li className="leading-relaxed"><a href="#article34" className="text-primary hover:underline break-words">Art. 34 - Gestion des Incidents</a></li>
                <li className="leading-relaxed"><a href="#article35" className="text-primary hover:underline break-words">Art. 35 - Audits de Sécurité</a></li>
                <li className="leading-relaxed"><a href="#article36" className="text-primary hover:underline break-words">Art. 36 - Résiliation par l'Utilisateur</a></li>
                <li className="leading-relaxed"><a href="#article37" className="text-primary hover:underline break-words">Art. 37 - Résiliation par Hoomy</a></li>
                <li className="leading-relaxed"><a href="#article38" className="text-primary hover:underline break-words">Art. 38 - Suspension Temporaire</a></li>
                <li className="leading-relaxed"><a href="#article39" className="text-primary hover:underline break-words">Art. 39 - Conséquences de la Résiliation</a></li>
                <li className="leading-relaxed"><a href="#article40" className="text-primary hover:underline break-words">Art. 40 - Conservation Post-Résiliation</a></li>
                <li className="leading-relaxed"><a href="#article41" className="text-primary hover:underline break-words">Art. 41 - Réclamations et Support</a></li>
                <li className="leading-relaxed"><a href="#article42" className="text-primary hover:underline break-words">Art. 42 - Médiation Amiable</a></li>
                <li className="leading-relaxed"><a href="#article43" className="text-primary hover:underline break-words">Art. 43 - Arbitrage Contractuel</a></li>
                <li className="leading-relaxed"><a href="#article44" className="text-primary hover:underline break-words">Art. 44 - Compétence Judiciaire</a></li>
                <li className="leading-relaxed"><a href="#article45" className="text-primary hover:underline break-words">Art. 45 - Droit Applicable</a></li>
                <li className="leading-relaxed"><a href="#article46" className="text-primary hover:underline break-words">Art. 46 - Modification des CGU</a></li>
                <li className="leading-relaxed"><a href="#article47" className="text-primary hover:underline break-words">Art. 47 - Notifications</a></li>
                <li className="leading-relaxed"><a href="#article48" className="text-primary hover:underline break-words">Art. 48 - Cession du Contrat</a></li>
                <li className="leading-relaxed"><a href="#article49" className="text-primary hover:underline break-words">Art. 49 - Nullité Partielle</a></li>
                <li className="leading-relaxed"><a href="#article50" className="text-primary hover:underline break-words">Art. 50 - Absence de Renonciation</a></li>
                <li className="leading-relaxed"><a href="#article51" className="text-primary hover:underline break-words">Art. 51 - Intégralité de l'Accord</a></li>
                <li className="leading-relaxed"><a href="#article52" className="text-primary hover:underline break-words">Art. 52 - Langue et Interprétation</a></li>
                <li className="leading-relaxed"><a href="#article53" className="text-primary hover:underline break-words">Art. 53 - Conservation et Archivage</a></li>
                <li className="leading-relaxed"><a href="#article54" className="text-primary hover:underline break-words">Art. 54 - Conformité Réglementaire</a></li>
                <li className="leading-relaxed"><a href="#article55" className="text-primary hover:underline break-words">Art. 55 - Audit et Contrôle</a></li>
                <li className="leading-relaxed"><a href="#article56" className="text-primary hover:underline break-words">Art. 56 - Prévention du Blanchiment</a></li>
                <li className="leading-relaxed"><a href="#article57" className="text-primary hover:underline break-words">Art. 57 - Sanctions Internationales</a></li>
                <li className="leading-relaxed"><a href="#article58" className="text-primary hover:underline break-words">Art. 58 - Accessibilité</a></li>
                <li className="leading-relaxed"><a href="#article59" className="text-primary hover:underline break-words">Art. 59 - Développement Durable</a></li>
                <li className="leading-relaxed"><a href="#article60" className="text-primary hover:underline break-words">Art. 60 - Entrée en Vigueur</a></li>
              </ul>
            </CardContent>
          </Card>

          {/* Contenu principal */}
          <div className="space-y-5 sm:space-y-8 md:space-y-12">
            {/* Préambule */}
            <section id="preambule" className="scroll-mt-20 sm:scroll-mt-24">
              <Card>
                <CardContent className="p-3 sm:p-6 md:p-8">
                  <h2 className="text-lg sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4 md:mb-6 leading-tight">Préambule et Dispositions Générales</h2>
                  
                  <div className="bg-primary/10 border-l-4 border-primary p-3 sm:p-4 md:p-6 rounded-lg mb-4 sm:mb-6">
                    <div className="flex items-start gap-3">
                      <Info className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <strong className="block mb-2">Nature Juridique du Document</strong>
                        <p className="text-sm md:text-base">
                          Les présentes Conditions Générales d'Utilisation (ci-après désignées « CGU », « Conditions », « Document Contractuel ») constituent un contrat juridiquement contraignant entre l'utilisateur (personne physique ou morale) et Hoomy (ci-après « Hoomy », « la Plateforme », « nous », « le Prestataire », « l'Exploitant »).
                        </p>
                      </div>
                    </div>
                  </div>

                  <h3 className="text-base sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 md:mb-4 leading-tight">Cadre Légal et Réglementaire</h3>
                  <p className="mb-3 sm:mb-4 text-sm md:text-base leading-relaxed">Les présentes CGU sont établies conformément aux dispositions légales suivantes :</p>
                  <ul className="list-disc list-inside space-y-1.5 sm:space-y-2 mb-4 sm:mb-6 text-sm md:text-base ml-3 sm:ml-4 leading-relaxed">
                    <li>Code des Obligations suisse (CO), notamment les articles 1 à 40 (formation du contrat), 97-109 (responsabilité contractuelle), 184-551 (contrats spéciaux)</li>
                    <li>Loi fédérale sur la protection des données (LPD, RS 235.1) et son ordonnance d'exécution (OLPD, RS 235.11)</li>
                    <li>Loi sur le commerce électronique (LCE)</li>
                    <li>Loi fédérale contre la concurrence déloyale (LCD, RS 241)</li>
                    <li>Code Civil suisse (CC), articles 256-274g (bail à loyer)</li>
                    <li>Règlement général sur la protection des données (RGPD UE 2016/679) pour les utilisateurs résidant dans l'Union Européenne</li>
                  </ul>

                  <div className="bg-muted border-l-4 border-border p-4 rounded-lg mb-6 text-sm md:text-base italic">
                    Référence légale : Articles 1, 19-20 CO - Formation du contrat par acceptation tacite ou expresse
                  </div>

                  <h3 className="text-base sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 md:mb-4 leading-tight">Champ d'Application Territorial</h3>
                  <p className="mb-4 sm:mb-6 text-sm md:text-base leading-relaxed">Les présentes CGU s'appliquent exclusivement aux services fournis sur le territoire de la Confédération Suisse, avec une extension possible aux pays membres de l'espace Schengen pour les utilisateurs transfrontaliers dûment identifiés.</p>

                  <h3 className="text-base sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 md:mb-4 leading-tight">Hiérarchie des Documents</h3>
                  <p className="mb-3 sm:mb-4 text-sm md:text-base leading-relaxed">En cas de contradiction entre plusieurs documents contractuels, l'ordre de préséance suivant s'applique :</p>
                  <ol className="list-decimal list-inside space-y-1.5 sm:space-y-2 mb-4 sm:mb-6 text-sm md:text-base ml-3 sm:ml-4 leading-relaxed">
                    <li>Conditions Particulières spécifiques (le cas échéant)</li>
                    <li>Présentes Conditions Générales d'Utilisation</li>
                    <li>Politique de Confidentialité</li>
                    <li>Charte d'Utilisation des Cookies</li>
                    <li>Documentation technique de la Plateforme</li>
                  </ol>

                  <h3 className="text-base sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 md:mb-4 leading-tight">Versions Linguistiques</h3>
                  <p className="mb-4 sm:mb-6 text-sm md:text-base leading-relaxed">Les présentes CGU sont établies en langue française. Des traductions en allemand, italien et anglais peuvent être fournies à titre indicatif. En cas de divergence d'interprétation, seule la version française fait foi et prévaut.</p>

                  <div className="bg-destructive/10 border-l-4 border-destructive p-4 md:p-6 rounded-lg">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
                      <div>
                        <strong className="block mb-2 text-destructive">ATTENTION - Portée Juridique</strong>
                        <p className="text-sm md:text-base mb-2">
                          L'utilisation de la Plateforme, quelle qu'en soit la modalité (navigation, inscription, création de compte, publication d'annonce, mise en relation), emporte acceptation pleine, entière et irrévocable des présentes CGU dans leur version en vigueur au moment de ladite utilisation.
                        </p>
                        <p className="text-sm md:text-base">
                          L'utilisateur reconnaît avoir pris connaissance de l'intégralité des clauses, les avoir comprises et les accepter sans réserve.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Article 1 */}
            <section id="article1" className="scroll-mt-20 sm:scroll-mt-24">
              <Card>
                <CardContent className="p-3 sm:p-6 md:p-8">
                  <h2 className="text-lg sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4 md:mb-6 leading-tight">
                    <Badge variant="secondary" className="mr-1 sm:mr-2 text-xs flex-shrink-0">Art. 1</Badge>
                    Définitions et Terminologie Juridique
                  </h2>
                  
                  <p className="mb-4 sm:mb-6 text-sm md:text-base leading-relaxed">Au sens des présentes Conditions Générales d'Utilisation, les termes suivants, lorsqu'ils sont employés avec une majuscule initiale, ont la signification qui leur est attribuée ci-après :</p>

                  <h3 className="text-base sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 md:mb-4 leading-tight">1.1 Définitions Générales</h3>
                  
                  <div className="space-y-4 mb-6">
                    <p className="text-sm md:text-base">
                      <strong className="text-primary">« Plateforme » ou « Hoomy » :</strong> désigne le service numérique d'intermédiation accessible via l'URL hoomy.site, comprenant l'ensemble des pages web, interfaces utilisateur, applications mobiles (iOS, Android), API, systèmes backend, bases de données, et toute infrastructure technique associée, permettant la mise en relation entre Étudiants et Propriétaires.
                    </p>
                    <p className="text-sm md:text-base">
                      <strong className="text-primary">« Utilisateur(s) » :</strong> désigne toute personne physique majeure ou personne morale ayant créé un Compte sur la Plateforme, incluant sans limitation les Étudiants, Propriétaires, Bailleurs, Mandataires, Représentants légaux, et toute partie tierce autorisée.
                    </p>
                    <p className="text-sm md:text-base">
                      <strong className="text-primary">« Étudiant » :</strong> désigne toute personne physique majeure inscrite dans un établissement d'enseignement supérieur reconnu (université, haute école spécialisée, école polytechnique fédérale, etc.) ou disposant d'une attestation d'inscription valide, recherchant un Logement via la Plateforme pour une durée minimale de trois (3) mois académiques.
                    </p>
                    <p className="text-sm md:text-base">
                      <strong className="text-primary">« Propriétaire » ou « Bailleur » :</strong> désigne toute personne physique ou morale, propriétaire légal ou usufruitier d'un bien immobilier, disposant du droit de le louer ou sous-louer conformément aux dispositions légales applicables, notamment l'article 262 CO pour la sous-location.
                    </p>
                    <p className="text-sm md:text-base">
                      <strong className="text-primary">« Logement » :</strong> désigne tout local d'habitation meublé ou non meublé (studio, appartement, chambre en colocation, résidence étudiante) situé en Suisse, conforme aux normes d'habitabilité définies par le droit cantonal applicable, proposé à la location via la Plateforme pour une durée minimale de trois (3) mois.
                    </p>
                    <p className="text-sm md:text-base">
                      <strong className="text-primary">« Compte » :</strong> désigne l'espace personnel et sécurisé créé par l'Utilisateur lors de son inscription, comprenant ses données d'identification, coordonnées, préférences, historique d'activité, et permettant l'accès aux fonctionnalités de la Plateforme selon son statut (Étudiant/Propriétaire).
                    </p>
                  </div>

                  <h3 className="text-base sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 md:mb-4 leading-tight">1.2 Définitions Relatives au Service</h3>
                  <div className="space-y-4 mb-6">
                    <p className="text-sm md:text-base">
                      <strong className="text-primary">« Mise en Relation » :</strong> désigne le processus technique et contractuel par lequel la Plateforme facilite le premier contact entre un Étudiant et un Propriétaire, incluant l'échange initial de coordonnées, la présentation du Logement, et toute communication préalable à la conclusion d'un Bail.
                    </p>
                    <p className="text-sm md:text-base">
                      <strong className="text-primary">« Commission » ou « Frais de Service » :</strong> désigne la rémunération due à Hoomy pour le service de Mise en Relation, calculée selon les modalités tarifaires en vigueur et affichées sur la Plateforme, exigible dès la conclusion effective d'un accord entre l'Étudiant et le Propriétaire.
                    </p>
                    <p className="text-sm md:text-base">
                      <strong className="text-primary">« Contrat de Location » ou « Bail » :</strong> désigne le contrat de bail à loyer au sens des articles 253 et suivants CO, conclu directement entre l'Étudiant (locataire) et le Propriétaire (bailleur), dont la Plateforme n'est pas partie contractante mais dont elle a facilité la conclusion.
                    </p>
                    <p className="text-sm md:text-base">
                      <strong className="text-primary">« Contournement » ou « Bypass » :</strong> désigne toute action, tentative, manœuvre, stratégie ou comportement visant à éviter, réduire, différer ou supprimer le paiement de la Commission due à Hoomy, incluant mais non limité aux pratiques décrites exhaustivement à l'Article 7 des présentes.
                    </p>
                  </div>

                  <h3 className="text-base sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 md:mb-4 leading-tight">1.3 Définitions Techniques</h3>
                  <div className="space-y-4 mb-6">
                    <p className="text-sm md:text-base">
                      <strong className="text-primary">« Session » :</strong> désigne une période d'utilisation continue de la Plateforme par un Utilisateur authentifié, débutant lors de la connexion (login) et se terminant lors de la déconnexion (logout) ou après expiration du délai d'inactivité (timeout) fixé à 24 heures.
                    </p>
                    <p className="text-sm md:text-base">
                      <strong className="text-primary">« Données Personnelles » :</strong> désigne toute information se rapportant à une personne physique identifiée ou identifiable au sens de l'article 3 lettre a LPD, incluant notamment les données d'identification, coordonnées, données de navigation, logs techniques, et tout élément permettant directement ou indirectement l'identification d'un Utilisateur.
                    </p>
                    <p className="text-sm md:text-base">
                      <strong className="text-primary">« Cookie » :</strong> désigne un fichier texte stocké localement sur le terminal de l'Utilisateur lors de la navigation sur la Plateforme, permettant le fonctionnement technique du service, l'authentification persistante, l'analyse des usages, et éventuellement la personnalisation de l'expérience utilisateur.
                    </p>
                    <p className="text-sm md:text-base">
                      <strong className="text-primary">« Logs » ou « Journaux d'Activité » :</strong> désignent l'ensemble des enregistrements techniques automatiques des actions effectuées sur la Plateforme (connexions, consultations, messages, transactions), conservés à des fins de sécurité, de preuve, et de conformité légale.
                    </p>
                  </div>

                  <h3 className="text-base sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 md:mb-4 leading-tight">1.4 Définitions Juridiques et Contractuelles</h3>
                  <div className="space-y-4 mb-6">
                    <p className="text-sm md:text-base">
                      <strong className="text-primary">« Force Majeure » :</strong> désigne tout événement extérieur, imprévisible et irrésistible au sens de l'article 119 CO, incluant notamment les catastrophes naturelles, guerres, émeutes, grèves générales, pannes majeures d'infrastructure internet, cyberattaques massives, décisions administratives ou judiciaires contraignantes.
                    </p>
                    <p className="text-sm md:text-base">
                      <strong className="text-primary">« Jour Ouvrable » :</strong> désigne tout jour calendaire à l'exception des samedis, dimanches et jours fériés officiels du canton de Neuchâtel, Suisse.
                    </p>
                    <p className="text-sm md:text-base">
                      <strong className="text-primary">« Notification » :</strong> désigne toute communication officielle de Hoomy à l'Utilisateur, transmise par email à l'adresse renseignée dans le Compte, par notification push sur l'application mobile, ou par message dans l'interface de la Plateforme, réputée reçue dans un délai de 48 heures ouvrables.
                    </p>
                  </div>

                  <div className="bg-primary/10 border-l-4 border-primary p-3 sm:p-4 rounded-lg">
                    <div className="flex items-start gap-3">
                      <Info className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <strong className="block mb-2">Interprétation</strong>
                        <p className="text-sm md:text-base">
                          Les titres et sous-titres des articles n'ont qu'une valeur indicative et ne sauraient être utilisés à des fins d'interprétation. En cas d'ambiguïté ou de contradiction apparente, l'interprétation favorable à Hoomy prévaut, sous réserve des dispositions impératives du droit suisse.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Article 2 */}
            <section id="article2" className="scroll-mt-20 sm:scroll-mt-24">
              <Card>
                <CardContent className="p-3 sm:p-6 md:p-8">
                  <h2 className="text-lg sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4 md:mb-6 leading-tight">
                    <Badge variant="secondary" className="mr-1 sm:mr-2 text-xs flex-shrink-0">Art. 2</Badge>
                    Objet et Périmètre Contractuel
                  </h2>

                  <h3 className="text-base sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 md:mb-4 leading-tight">2.1 Nature du Service Fourni</h3>
                  <p className="mb-3 sm:mb-4 text-sm md:text-base leading-relaxed">Hoomy exploite une plateforme numérique de mise en relation multilatérale entre Étudiants recherchant un Logement et Propriétaires proposant des biens immobiliers à la location. La Plateforme agit exclusivement en qualité d'intermédiaire technique et ne réalise aucune opération de location pour son propre compte.</p>

                  <div className="bg-muted border-l-4 border-border p-4 rounded-lg mb-6 text-sm md:text-base italic">
                    Référence légale : Article 412 CO - Courtage et intermédiation
                  </div>

                  <h3 className="text-base sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 md:mb-4 leading-tight">2.2 Absence de Qualité de Partie au Contrat de Location</h3>
                  <p className="mb-3 sm:mb-4 text-sm md:text-base leading-relaxed">Hoomy n'acquiert jamais la qualité de partie au Contrat de Location conclu entre l'Étudiant et le Propriétaire. En conséquence, Hoomy :</p>
                  <ul className="list-disc list-inside space-y-1.5 sm:space-y-2 mb-4 sm:mb-6 text-sm md:text-base ml-3 sm:ml-4 leading-relaxed">
                    <li>Ne devient jamais locataire ni bailleur des Logements proposés sur la Plateforme</li>
                    <li>Ne collecte, ne détient et ne gère aucun loyer, dépôt de garantie, ou autre paiement relatif au bail</li>
                    <li>Ne participe pas à la rédaction, négociation, signature ou exécution du Contrat de Location</li>
                    <li>N'assume aucune obligation découlant du Contrat de Location (entretien, réparations, charges, etc.)</li>
                    <li>N'intervient pas dans la résolution des litiges relatifs au bail, sauf en qualité de facilitateur volontaire et non obligatoire</li>
                  </ul>

                  <h3 className="text-base sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 md:mb-4 leading-tight">2.3 Périmètre Géographique</h3>
                  <p className="mb-4 sm:mb-6 text-sm md:text-base leading-relaxed">Les services de la Plateforme sont destinés exclusivement aux Logements situés sur le territoire de la Confédération Suisse. Toute annonce concernant un bien situé hors de Suisse sera refusée ou supprimée sans préavis ni indemnité.</p>

                  <h3 className="text-base sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 md:mb-4 leading-tight">2.4 Limitations et Exclusions de Service</h3>
                  <p className="mb-3 sm:mb-4 text-sm md:text-base leading-relaxed">Hoomy ne garantit pas et exclut expressément toute responsabilité concernant :</p>
                  <ul className="list-disc list-inside space-y-1.5 sm:space-y-2 mb-4 sm:mb-6 text-sm md:text-base ml-3 sm:ml-4 leading-relaxed">
                    <li>La disponibilité effective des Logements au moment de la prise de contact</li>
                    <li>La conformité des Logements aux normes légales d'habitabilité</li>
                    <li>L'exactitude, la véracité, l'exhaustivité des descriptions et informations fournies par les Propriétaires</li>
                    <li>La solvabilité, la fiabilité, l'honorabilité des Utilisateurs</li>
                    <li>La conclusion effective d'un Contrat de Location après Mise en Relation</li>
                    <li>Le respect par les parties de leurs obligations contractuelles respectives</li>
                    <li>La qualité, l'état, la salubrité des Logements proposés</li>
                    <li>Les vices cachés, défauts, nuisances affectant les Logements</li>
                  </ul>

                  <h3 className="text-base sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 md:mb-4 leading-tight">2.5 Durée Minimale des Locations</h3>
                  <p className="mb-3 sm:mb-4 text-sm md:text-base leading-relaxed">La Plateforme est destinée exclusivement aux locations de moyenne et longue durée, définies comme suit :</p>
                  <ul className="list-disc list-inside space-y-2 mb-4 text-sm md:text-base ml-4">
                    <li>Durée minimale : trois (3) mois consécutifs</li>
                    <li>Durée recommandée : période académique complète (6 à 12 mois)</li>
                    <li>Durée maximale suggérée : quatre (4) années académiques</li>
                  </ul>
                  <p className="mb-4 sm:mb-6 text-sm md:text-base leading-relaxed">Les locations de courte durée (moins de 3 mois) de type Airbnb, séjours touristiques ou hébergements temporaires sont expressément exclues du périmètre de la Plateforme.</p>

                  <div className="bg-destructive/10 border-l-4 border-destructive p-3 sm:p-4 rounded-lg">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
                      <div>
                        <strong className="block mb-2 text-destructive">Interdiction de Détournement d'Objet</strong>
                        <p className="text-sm md:text-base">
                          Toute utilisation de la Plateforme à des fins autres que celles définies dans le présent article, notamment pour du démarchage commercial, de la publicité non autorisée, de la collecte de données à des fins concurrentielles, ou tout autre usage détourné, est strictement interdite et constitue une violation grave des présentes CGU.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Article 3 - Version abrégée pour la longueur */}
            <section id="article3" className="scroll-mt-20 sm:scroll-mt-24">
              <Card>
                <CardContent className="p-3 sm:p-6 md:p-8">
                  <h2 className="text-lg sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4 md:mb-6 leading-tight">
                    <Badge variant="secondary" className="mr-1 sm:mr-2 text-xs flex-shrink-0">Art. 3</Badge>
                    Conditions d'Accès et d'Inscription
                  </h2>

                  <h3 className="text-base sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 md:mb-4 leading-tight">3.1 Conditions de Capacité Juridique</h3>
                  <p className="mb-3 sm:mb-4 text-sm md:text-base leading-relaxed">Pour créer un Compte sur la Plateforme, l'Utilisateur doit :</p>
                  <ul className="list-disc list-inside space-y-1.5 sm:space-y-2 mb-4 sm:mb-6 text-sm md:text-base ml-3 sm:ml-4 leading-relaxed">
                    <li>Être une personne physique majeure ayant atteint l'âge de 18 ans révolus au moment de l'inscription</li>
                    <li>Disposer de la pleine capacité juridique au sens des articles 11 et suivants CC</li>
                    <li>Ne pas faire l'objet d'une mesure de protection (curatelle, tutelle) affectant sa capacité de contracter</li>
                    <li>Ou, pour les personnes morales : être dûment immatriculées au registre du commerce, disposer d'un statut juridique valide, et être représentées par une personne physique habilitée</li>
                  </ul>

                  <h3 className="text-base sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 md:mb-4 leading-tight">3.2 Mineurs et Représentation Légale</h3>
                  <p className="mb-3 sm:mb-4 text-sm md:text-base leading-relaxed">À titre exceptionnel, un mineur de plus de 16 ans peut créer un Compte sous les conditions cumulatives suivantes :</p>
                  <ul className="list-disc list-inside space-y-1.5 sm:space-y-2 mb-4 sm:mb-6 text-sm md:text-base ml-3 sm:ml-4 leading-relaxed">
                    <li>Autorisation parentale écrite préalable, signée par les deux détenteurs de l'autorité parentale</li>
                    <li>Fourniture d'une copie d'une pièce d'identité valide du mineur et des représentants légaux</li>
                    <li>Engagement de responsabilité solidaire des représentants légaux pour toutes les obligations du mineur</li>
                    <li>Validation du dossier par le service de conformité de Hoomy</li>
                  </ul>

                  <h3 className="text-base sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 md:mb-4 leading-tight">3.3 Processus d'Inscription Standard avec Vérification KYC Obligatoire</h3>
                  <p className="mb-3 sm:mb-4 text-sm md:text-base leading-relaxed">L'inscription sur la Plateforme s'effectue selon la procédure suivante, avec vérification d'identité <strong>obligatoire</strong> :</p>
                  <ol className="list-decimal list-inside space-y-3 mb-6 text-sm md:text-base ml-4">
                    <li><strong>Étape 1 - Formulaire d'inscription :</strong> Saisie des données obligatoires (nom, prénom, date de naissance, email, téléphone, adresse, mot de passe)</li>
                    <li><strong>Étape 2 - Vérification email :</strong> Confirmation de l'adresse email via lien de validation (valable 48h)</li>
                    <li><strong>Étape 3 - Vérification téléphone :</strong> Confirmation du numéro via code SMS à usage unique</li>
                    <li><strong>Étape 4 - Sélection du profil :</strong> Choix du statut Étudiant ou Propriétaire</li>
                    <li><strong>Étape 5 - KYC OBLIGATOIRE (Know Your Customer) :</strong>
                      <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                        <li><strong>Pour TOUS les utilisateurs :</strong> Upload d'une pièce d'identité valide recto-verso, Selfie avec la pièce d'identité (vérification liveness anti-fraude), Validation automatique par IA + révision manuelle sous 24h ouvrables</li>
                        <li><strong>Pour les Étudiants :</strong> Certificat d'inscription valide, Carte étudiante ou attestation officielle</li>
                        <li><strong>Pour les Propriétaires :</strong> Extrait du registre foncier prouvant la propriété du bien, OU contrat de bail autorisant explicitement la sous-location, OU mandat écrit du propriétaire légal, Attestation d'assurance responsabilité civile du bâtiment</li>
                      </ul>
                    </li>
                    <li><strong>Étape 6 - Acceptation des CGU :</strong> Consentement explicite par case à cocher et bouton "J'accepte"</li>
                    <li><strong>Étape 7 - Validation finale :</strong> Vérification automatique des documents, Contrôle manuel par équipe de conformité sous 24h ouvrables, Vérifications antifraude, Activation du compte après validation complète</li>
                  </ol>

                  <div className="bg-destructive/10 border-l-4 border-destructive p-4 rounded-lg mb-6">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
                      <div>
                        <strong className="block mb-2 text-destructive">KYC OBLIGATOIRE - Aucune Exception</strong>
                        <p className="text-sm md:text-base mb-2">
                          Le processus de vérification d'identité (KYC) est <strong>OBLIGATOIRE</strong> pour TOUS les utilisateurs sans exception. Aucun compte ne peut être activé sans validation KYC complète.
                        </p>
                        <p className="text-sm md:text-base">
                          <strong>Refus de fournir les documents = Impossibilité de créer un compte</strong>
                        </p>
                      </div>
                    </div>
                  </div>

                  <h3 className="text-base sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 md:mb-4 leading-tight">3.4 Délais de Validation KYC</h3>
                  <ul className="list-disc list-inside space-y-1.5 sm:space-y-2 mb-4 sm:mb-6 text-sm md:text-base ml-3 sm:ml-4 leading-relaxed">
                    <li><strong>Validation automatique :</strong> Immédiate si tous les documents sont conformes (10% des cas)</li>
                    <li><strong>Révision manuelle standard :</strong> Sous 24h ouvrables (80% des cas)</li>
                    <li><strong>Révision approfondie :</strong> Sous 48-72h si documents incomplets ou suspects (10% des cas)</li>
                    <li><strong>Demande de documents complémentaires :</strong> Notification immédiate, nouveau délai de 24h après réception</li>
                  </ul>

                  <h3 className="text-base sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 md:mb-4 leading-tight">3.5 Sécurisation du Compte</h3>
                  <p className="mb-3 sm:mb-4 text-sm md:text-base leading-relaxed">L'Utilisateur s'engage à :</p>
                  <ul className="list-disc list-inside space-y-1.5 sm:space-y-2 mb-4 sm:mb-6 text-sm md:text-base ml-3 sm:ml-4 leading-relaxed">
                    <li>Choisir un mot de passe robuste (minimum 12 caractères, majuscules, minuscules, chiffres, caractères spéciaux)</li>
                    <li>Ne jamais communiquer ses identifiants à un tiers, même en cas de demande prétendument officielle</li>
                    <li>Activer l'authentification à deux facteurs (2FA) dès que disponible</li>
                    <li>Signaler immédiatement toute utilisation frauduleuse ou non autorisée de son Compte</li>
                    <li>Se déconnecter à chaque fin de session, particulièrement sur ordinateur partagé ou réseau public</li>
                  </ul>

                  <h3 className="text-base sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 md:mb-4 leading-tight">3.6 Interdiction des Comptes Multiples</h3>
                  <p className="mb-3 sm:mb-4 text-sm md:text-base leading-relaxed">Il est strictement interdit de créer plusieurs Comptes pour le même Utilisateur, sauf autorisation écrite préalable de Hoomy. Toute création de compte multiple entraîne la suspension immédiate de l'ensemble des comptes concernés.</p>

                  <h3 className="text-base sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 md:mb-4 leading-tight">3.7 Refus d'Inscription</h3>
                  <p className="mb-3 sm:mb-4 text-sm md:text-base leading-relaxed">Hoomy se réserve le droit de refuser toute inscription, sans avoir à motiver sa décision, notamment en cas de :</p>
                  <ul className="list-disc list-inside space-y-1.5 sm:space-y-2 mb-4 sm:mb-6 text-sm md:text-base ml-3 sm:ml-4 leading-relaxed">
                    <li>Informations manifestement fausses, incohérentes ou invérifiables</li>
                    <li>Antécédents de fraude, contournement ou violation des CGU sur la Plateforme ou sur d'autres services</li>
                    <li>Présence sur une liste de surveillance (sanctions internationales, PEP - Personnes Politiquement Exposées)</li>
                    <li>Impossibilité technique ou juridique de fournir le service dans la juridiction de l'Utilisateur</li>
                    <li>Suspicion légitime d'intention malveillante ou d'usage abusif</li>
                  </ul>

                  <div className="bg-muted border-l-4 border-border p-4 rounded-lg text-sm md:text-base italic">
                    Référence légale : Articles 19-20 CO - Liberté contractuelle et droit de refuser de contracter
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Article 4 - Architecture Technique */}
            <section id="article4" className="scroll-mt-20 sm:scroll-mt-24">
              <Card>
                <CardContent className="p-3 sm:p-6 md:p-8">
                  <h2 className="text-lg sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4 md:mb-6 leading-tight">
                    <Badge variant="secondary" className="mr-1 sm:mr-2 text-xs flex-shrink-0">Art. 4</Badge>
                    Architecture Technique de la Plateforme
                  </h2>

                  <h3 className="text-base sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 md:mb-4 leading-tight">4.1 Infrastructure Technique</h3>
                  <p className="mb-3 sm:mb-4 text-sm md:text-base leading-relaxed">La Plateforme Hoomy repose sur une architecture technique moderne comprenant :</p>
                  <ul className="list-disc list-inside space-y-1.5 sm:space-y-2 mb-4 sm:mb-6 text-sm md:text-base ml-3 sm:ml-4 leading-relaxed">
                    <li><strong>Application Web Progressive (PWA) :</strong> Interface accessible via navigateurs modernes (Chrome, Firefox, Safari, Edge), responsive et compatible mobile/tablette/desktop</li>
                    <li><strong>Backend API RESTful :</strong> Serveurs Node.js avec Express.js assurant la logique métier et les traitements</li>
                    <li><strong>Base de données relationnelle :</strong> PostgreSQL pour le stockage sécurisé des données utilisateurs, annonces, transactions</li>
                    <li><strong>Système de cache :</strong> Redis pour l'optimisation des performances et la gestion des sessions</li>
                    <li><strong>Serveur de fichiers :</strong> Stockage cloud sécurisé (AWS S3 ou équivalent) pour images et documents</li>
                    <li><strong>CDN (Content Delivery Network) :</strong> Distribution optimisée du contenu statique</li>
                  </ul>

                  <h3 className="text-base sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 md:mb-4 leading-tight">4.2 Disponibilité et SLA (Service Level Agreement)</h3>
                  <p className="mb-3 sm:mb-4 text-sm md:text-base leading-relaxed">Hoomy s'engage à fournir un service avec les garanties suivantes :</p>
                  <ul className="list-disc list-inside space-y-1.5 sm:space-y-2 mb-4 sm:mb-6 text-sm md:text-base ml-3 sm:ml-4 leading-relaxed">
                    <li><strong>Disponibilité cible :</strong> 99,5% sur base annuelle (hors maintenance programmée)</li>
                    <li><strong>Maintenance programmée :</strong> Maximum 4 heures par mois, notification 48h à l'avance</li>
                    <li><strong>Temps de réponse moyen :</strong> &lt; 500ms pour 95% des requêtes</li>
                    <li><strong>Support technique :</strong> Réponse sous 24h ouvrables</li>
                  </ul>

                  <div className="bg-muted border-l-4 border-border p-4 rounded-lg mb-6 text-sm md:text-base italic">
                    Clause d'exclusion : Les pannes dues à des facteurs externes (fournisseurs internet, attaques DDoS massives, défaillances d'hébergeur tiers) ne sont pas comptabilisées dans le calcul du SLA.
                  </div>

                  <h3 className="text-base sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 md:mb-4 leading-tight">4.3 Compatibilité et Prérequis Techniques</h3>
                  <p className="mb-3 sm:mb-4 text-sm md:text-base leading-relaxed"><strong>Navigateurs supportés (versions récentes uniquement) :</strong></p>
                  <ul className="list-disc list-inside space-y-2 mb-4 text-sm md:text-base ml-4">
                    <li>Google Chrome 100+</li>
                    <li>Mozilla Firefox 95+</li>
                    <li>Safari 15+</li>
                    <li>Microsoft Edge 100+</li>
                  </ul>
                  <p className="mb-3 sm:mb-4 text-sm md:text-base leading-relaxed"><strong>Prérequis minimaux :</strong></p>
                  <ul className="list-disc list-inside space-y-1.5 sm:space-y-2 mb-4 sm:mb-6 text-sm md:text-base ml-3 sm:ml-4 leading-relaxed">
                    <li>Connexion internet haut débit (min. 5 Mbps recommandé)</li>
                    <li>JavaScript activé obligatoirement</li>
                    <li>Cookies et stockage local autorisés</li>
                    <li>Résolution d'écran minimum 320px de largeur</li>
                  </ul>

                  <h3 className="text-base sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 md:mb-4 leading-tight">4.4 Évolutions Techniques</h3>
                  <p className="mb-4 sm:mb-6 text-sm md:text-base leading-relaxed">Hoomy se réserve le droit de faire évoluer l'architecture technique de la Plateforme à tout moment pour améliorer la sécurité, les performances ou ajouter de nouvelles fonctionnalités, sans notification préalable si ces évolutions n'affectent pas l'expérience utilisateur de manière significative.</p>
                </CardContent>
              </Card>
            </section>

            {/* Article 5 - Fonctionnement du Service */}
            <section id="article5" className="scroll-mt-20 sm:scroll-mt-24">
              <Card>
                <CardContent className="p-3 sm:p-6 md:p-8">
                  <h2 className="text-lg sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4 md:mb-6 leading-tight">
                    <Badge variant="secondary" className="mr-1 sm:mr-2 text-xs flex-shrink-0">Art. 5</Badge>
                    Fonctionnement du Service d'Intermédiation
                  </h2>

                  <h3 className="text-base sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 md:mb-4 leading-tight">5.1 Parcours Utilisateur Complet - Propriétaire</h3>
                  <ol className="list-decimal list-inside space-y-3 mb-6 text-sm md:text-base ml-4">
                    <li><strong>Inscription et vérification KYC :</strong> Création du compte avec validation d'identité et documents de propriété obligatoires</li>
                    <li><strong>Création d'annonce :</strong> Formulaire détaillé avec description du logement, photos (minimum 5), loyer, disponibilité, critères de sélection</li>
                    <li><strong>Validation de l'annonce :</strong> Modération automatique puis manuelle sous 24h (vérification conformité, absence contenus illicites)</li>
                    <li><strong>Publication :</strong> Mise en ligne visible par tous les Étudiants inscrits, référencement interne optimisé</li>
                    <li><strong>Réception de candidatures :</strong> Les Étudiants intéressés envoient des demandes de contact avec profil et motivation</li>
                    <li><strong>Sélection :</strong> Le Propriétaire consulte les profils et accepte/refuse les candidatures</li>
                    <li><strong>Mise en Relation :</strong> Échange de coordonnées complètes (email, téléphone) pour organiser visite</li>
                    <li><strong>Visite et négociation :</strong> Rencontre physique, visite du bien, discussion des modalités (hors plateforme)</li>
                    <li><strong>Signature du bail :</strong> Conclusion du contrat de location directement entre les parties</li>
                    <li><strong>Déclaration et paiement :</strong> Confirmation de la conclusion du bail sur la Plateforme, activation du prélèvement mensuel automatique de la commission</li>
                  </ol>

                  <h3 className="text-base sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 md:mb-4 leading-tight">5.2 Parcours Utilisateur Complet - Étudiant</h3>
                  <ol className="list-decimal list-inside space-y-3 mb-6 text-sm md:text-base ml-4">
                    <li><strong>Inscription et vérification académique :</strong> Création du compte avec certificat d'inscription ou carte étudiante valide</li>
                    <li><strong>Création de profil :</strong> Présentation détaillée (cursus, école, budget, préférences, garanties disponibles)</li>
                    <li><strong>Recherche de logements :</strong> Utilisation des filtres (ville, budget, surface, meublé/non meublé, disponibilité)</li>
                    <li><strong>Consultation d'annonces :</strong> Visualisation des détails, photos, caractéristiques, localisation</li>
                    <li><strong>Envoi de candidature :</strong> Demande de Mise en Relation avec lettre de motivation et présentation du dossier</li>
                    <li><strong>Attente de réponse :</strong> Notification lors de l'acceptation ou du refus par le Propriétaire (délai max 7 jours)</li>
                    <li><strong>Mise en Relation acceptée :</strong> Réception des coordonnées du Propriétaire, organisation de la visite</li>
                    <li><strong>Visite et décision :</strong> Visite physique du bien, discussion, vérification conformité</li>
                    <li><strong>Signature du bail :</strong> Si accord, signature du contrat de location directement avec le Propriétaire</li>
                    <li><strong>Confirmation sur Hoomy :</strong> Validation de la conclusion du bail, activation du prélèvement mensuel de la commission (selon répartition convenue)</li>
                  </ol>

                  <h3 className="text-base sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 md:mb-4 leading-tight">5.3 Rôle de Hoomy dans la Mise en Relation</h3>
                  <p className="mb-3 sm:mb-4 text-sm md:text-base leading-relaxed">Hoomy assure exclusivement les services suivants :</p>
                  <ul className="list-disc list-inside space-y-1.5 sm:space-y-2 mb-4 sm:mb-6 text-sm md:text-base ml-3 sm:ml-4 leading-relaxed">
                    <li><strong>Hébergement des annonces :</strong> Mise à disposition d'un espace sécurisé pour publier et consulter les offres de logement</li>
                    <li><strong>Système de matching :</strong> Algorithme de recommandation basé sur les critères de recherche et de sélection</li>
                    <li><strong>Messagerie interne :</strong> Outil de communication initial avant Mise en Relation (limitée, voir Article 13)</li>
                    <li><strong>Vérification d'identité :</strong> Contrôle KYC pour limiter les fraudes et faux profils</li>
                    <li><strong>Modération du contenu :</strong> Vérification des annonces et signalement de contenus inappropriés</li>
                    <li><strong>Facilitation du paiement :</strong> Mise à disposition d'un système de paiement sécurisé pour la commission</li>
                    <li><strong>Support technique :</strong> Assistance en cas de difficultés d'utilisation de la Plateforme</li>
                  </ul>

                  <div className="bg-destructive/10 border-l-4 border-destructive p-3 sm:p-4 rounded-lg">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
                      <div>
                        <strong className="block mb-2 text-destructive">Limites Strictes du Service</strong>
                        <p className="text-sm md:text-base mb-2">
                          Hoomy ne fournit <strong>PAS</strong> les services suivants :
                        </p>
                        <ul className="list-disc list-inside space-y-1 text-sm md:text-base ml-4">
                          <li>Vérification de la solvabilité des Étudiants</li>
                          <li>Inspection physique des Logements</li>
                          <li>Conseil juridique sur les contrats de bail</li>
                          <li>Gestion locative (encaissement loyers, charges, entretien)</li>
                          <li>Médiation obligatoire des litiges entre parties</li>
                          <li>Garantie de paiement des loyers</li>
                          <li>Assurance contre les dégradations ou impayés</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>
            
            {/* Article 6 - Commission (très important) */}
            <section id="article6" className="scroll-mt-20 sm:scroll-mt-24">
              <Card>
                <CardContent className="p-3 sm:p-6 md:p-8">
                  <h2 className="text-lg sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4 md:mb-6 leading-tight">
                    <Badge variant="secondary" className="mr-1 sm:mr-2 text-xs flex-shrink-0">Art. 6</Badge>
                    Système de Commission et Tarification
                  </h2>

                  <h3 className="text-base sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 md:mb-4 leading-tight">6.1 Principe de la Commission d'Intermédiation</h3>
                  <p className="mb-4 sm:mb-6 text-sm md:text-base leading-relaxed">La Commission constitue la contrepartie financière due à Hoomy pour le service de Mise en Relation fourni. Elle rémunère les investissements technologiques, opérationnels et marketing permettant le fonctionnement de la Plateforme.</p>

                  <div className="bg-muted border-l-4 border-border p-4 rounded-lg mb-6 text-sm md:text-base italic">
                    Référence légale : Article 412 CO - Droit à la rémunération du courtier dès conclusion du contrat principal
                  </div>

                  <h3 className="text-base sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 md:mb-4 leading-tight">6.2 Structure Tarifaire - Commission Mensuelle Récurrente</h3>
                  <p className="mb-3 sm:mb-4 text-sm md:text-base leading-relaxed">Hoomy applique un modèle de commission mensuelle récurrente calculé selon la formule suivante :</p>
                  <div className="bg-primary/10 p-4 rounded-lg mb-4">
                    <p className="text-lg md:text-xl font-bold text-center">
                      Commission Mensuelle = Loyer Mensuel HT × 4%
                    </p>
                  </div>

                  <p className="mb-3 sm:mb-4 text-sm md:text-base leading-relaxed"><strong>Principe de Fonctionnement :</strong></p>
                  <ul className="list-disc list-inside space-y-1.5 sm:space-y-2 mb-4 sm:mb-6 text-sm md:text-base ml-3 sm:ml-4 leading-relaxed">
                    <li>La commission est prélevée <strong>chaque mois</strong> pendant toute la durée du bail</li>
                    <li>Taux fixe : <strong>4% du loyer mensuel</strong></li>
                    <li>Prélèvement automatique le 1er jour de chaque mois de location</li>
                    <li>Commission minimale : <strong>CHF 20.– par mois</strong></li>
                    <li>Pas de frais d'inscription ni de frais de mise en relation séparés</li>
                  </ul>

                  <p className="mb-3 sm:mb-4 text-sm md:text-base leading-relaxed"><strong>Exemples concrets :</strong></p>
                  <ul className="list-disc list-inside space-y-1.5 sm:space-y-2 mb-4 sm:mb-6 text-sm md:text-base ml-3 sm:ml-4 leading-relaxed">
                    <li>Studio à CHF 800.–/mois → Commission mensuelle : CHF 32.–</li>
                    <li>Appartement 2 pièces à CHF 1'200.–/mois → Commission mensuelle : CHF 48.–</li>
                    <li>Appartement 3 pièces à CHF 1'800.–/mois → Commission mensuelle : CHF 72.–</li>
                  </ul>

                  <div className="bg-destructive/10 border-l-4 border-destructive p-4 rounded-lg mb-6">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
                      <div>
                        <strong className="block mb-2 text-destructive">IMPORTANT - Commission Mensuelle Obligatoire</strong>
                        <p className="text-sm md:text-base">
                          Le modèle de commission mensuelle récurrente signifie que Hoomy perçoit 4% du loyer <strong>CHAQUE MOIS</strong> pendant toute la durée du bail. Le non-paiement d'une seule mensualité entraîne la suspension des services et l'application des pénalités prévues.
                        </p>
                      </div>
                    </div>
                  </div>

                  <h3 className="text-base sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 md:mb-4 leading-tight">6.3 Répartition de la Commission Mensuelle</h3>
                  <p className="mb-3 sm:mb-4 text-sm md:text-base leading-relaxed">La Commission mensuelle de 4% est répartie entre les parties selon les modalités suivantes :</p>
                  <ul className="list-disc list-inside space-y-1.5 sm:space-y-2 mb-4 sm:mb-6 text-sm md:text-base ml-3 sm:ml-4 leading-relaxed">
                    <li><strong>Option Standard (par défaut) :</strong> 100% à la charge de l'Étudiant (CHF +4% sur son loyer)</li>
                    <li><strong>Option Partagée :</strong> 50% Étudiant (2%) + 50% Propriétaire (2%) - accord préalable des deux parties requis</li>
                    <li><strong>Option Propriétaire :</strong> 100% à la charge du Propriétaire (CHF -4% sur le loyer perçu) - sur demande explicite</li>
                  </ul>

                  <h3 className="text-base sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 md:mb-4 leading-tight">6.6 Échecs de Paiement et Pénalités</h3>
                  <p className="mb-3 sm:mb-4 text-sm md:text-base leading-relaxed">En cas d'échec du prélèvement automatique mensuel, la procédure suivante s'applique :</p>
                  <ul className="list-disc list-inside space-y-2 mb-2 text-sm md:text-base ml-4">
                    <li><strong>Jour du prélèvement (J) :</strong> Tentative de prélèvement automatique, email d'alerte immédiat en cas d'échec</li>
                    <li><strong>J+2 :</strong> Seconde tentative, email de relance avec lien de paiement manuel</li>
                    <li><strong>J+5 :</strong> Troisième tentative, pénalité de retard : <strong>CHF 10.– fixes</strong></li>
                    <li><strong>J+7 :</strong> Suspension automatique du compte, pénalité additionnelle : <strong>5% du montant dû</strong>, intérêts moratoires : <strong>8% l'an</strong></li>
                    <li><strong>J+14 :</strong> Mise en demeure officielle, frais administratifs : <strong>CHF 50.–</strong>, pénalité totale : <strong>10% du montant dû</strong></li>
                    <li><strong>J+30 :</strong> Fermeture définitive du compte, transmission à société de recouvrement, frais de recouvrement : <strong>15-20% du montant total dû</strong></li>
                  </ul>
                </CardContent>
              </Card>
            </section>

            {/* Article 7 - Contournement (très important) */}
            <section id="article7" className="scroll-mt-20 sm:scroll-mt-24">
              <Card>
                <CardContent className="p-3 sm:p-6 md:p-8">
                  <h2 className="text-lg sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4 md:mb-6 leading-tight">
                    <Badge variant="secondary" className="mr-1 sm:mr-2 text-xs flex-shrink-0">Art. 7</Badge>
                    Interdictions de Contournement - Dispositions Exhaustives
                  </h2>

                  <div className="bg-destructive/10 border-l-4 border-destructive p-4 rounded-lg mb-6">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
                      <div>
                        <strong className="block mb-2 text-destructive">ARTICLE FONDAMENTAL - LECTURE OBLIGATOIRE</strong>
                        <p className="text-sm md:text-base">
                          Cet article constitue le socle de la protection contractuelle de Hoomy. Toute violation des dispositions ci-après entraîne des conséquences juridiques et financières graves.
                        </p>
                      </div>
                    </div>
                  </div>

                  <h3 className="text-base sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 md:mb-4 leading-tight">7.1 Définition Extensive du Contournement</h3>
                  <p className="mb-3 sm:mb-4 text-sm md:text-base leading-relaxed">Constitue un <strong>Contournement</strong> (« Bypass », « Fraude à la Commission »), prohibé de manière absolue, toute action, omission, manœuvre, stratégie, artifice, montage juridique ou arrangement de fait ayant pour objet ou pour effet, direct ou indirect, immédiat ou différé, de :</p>
                  <ul className="list-disc list-inside space-y-1.5 sm:space-y-2 mb-4 sm:mb-6 text-sm md:text-base ml-3 sm:ml-4 leading-relaxed">
                    <li>Éviter le paiement total ou partiel de la Commission due</li>
                    <li>Réduire artificiellement le montant de la Commission</li>
                    <li>Différer indûment le paiement au-delà des délais contractuels</li>
                    <li>Transférer la charge de la Commission à un tiers non prévu</li>
                    <li>Obtenir un remboursement indu par de fausses déclarations</li>
                    <li>Utiliser la Plateforme uniquement pour obtenir des coordonnées sans intention de rémunérer Hoomy</li>
                  </ul>

                  <h3 className="text-base sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 md:mb-4 leading-tight">7.2 Comportements Expressément Interdits</h3>
                  <p className="mb-3 sm:mb-4 text-sm md:text-base leading-relaxed">Il est <strong>strictement et formellement interdit</strong> de :</p>
                  <ol className="list-decimal list-inside space-y-1.5 sm:space-y-2 mb-4 sm:mb-6 text-sm md:text-base ml-3 sm:ml-4 leading-relaxed">
                    <li>Contact hors plateforme après Mise en Relation : Utiliser les coordonnées obtenues via Hoomy pour conclure un bail directement, sans passer par les canaux de la Plateforme et sans payer la Commission</li>
                    <li>Arrangement oral hors système : Proposer ou accepter un "deal" verbal ou écrit avec l'autre partie pour finaliser la location en dehors de Hoomy</li>
                    <li>Contrat fictif puis contrat réel : Signer un bail de très courte durée via Hoomy, puis immédiatement le renouveler hors plateforme pour une longue durée sans nouvelle Commission</li>
                    <li>Annulation frauduleuse : Prétendre que le logement ne convient finalement pas, puis le louer effectivement quelques jours/semaines plus tard sans repasser par Hoomy</li>
                    <li>Échange de coordonnées en amont : Communiquer emails, téléphones, adresses ou tout moyen de contact direct avant l'acceptation officielle de la Mise en Relation</li>
                    <li>Fausse déclaration de non-conclusion : Déclarer à Hoomy que le bail n'a pas été signé (pour éviter la Commission), alors qu'il l'a été effectivement</li>
                  </ol>

                  <h3 className="text-base sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 md:mb-4 leading-tight">7.5 Sanctions Graduées en Cas de Contournement Avéré</h3>
                  
                  <h4 className="text-lg md:text-xl font-semibold mb-3">7.5.1 Niveau 1 - Contournement Simple (Première Fois, Non Intentionnel)</h4>
                  <ul className="list-disc list-inside space-y-2 mb-4 text-sm md:text-base ml-4">
                    <li>Facturation immédiate de la Commission due + intérêts de retard 8% l'an</li>
                    <li>Mise en demeure officielle par courrier recommandé</li>
                    <li>Avertissement formel consigné dans le dossier</li>
                    <li>Délai de régularisation : 7 jours ouvrables</li>
                    <li>Pénalité financière : 50% de la Commission (clause pénale)</li>
                  </ul>
                  <p className="mb-6 text-sm md:text-base font-bold text-destructive">Total dû : Commission + 50% + intérêts + frais (CHF 50.–)</p>

                  <h4 className="text-lg md:text-xl font-semibold mb-3">7.5.2 Niveau 2 - Contournement Manifeste (Prémédité ou Récidive)</h4>
                  <ul className="list-disc list-inside space-y-2 mb-4 text-sm md:text-base ml-4">
                    <li>Facturation de la Commission × 2 (double pénalité)</li>
                    <li>Suspension immédiate du Compte pour 6 mois</li>
                    <li>Inscription sur liste noire interne et partagée avec partenaires</li>
                    <li>Interdiction de créer un nouveau compte pendant 2 ans</li>
                    <li>Transmission du dossier à société de recouvrement judiciaire</li>
                  </ul>
                  <p className="mb-6 text-sm md:text-base font-bold text-destructive">Total dû : Commission × 2 + frais de recouvrement (15-20% supplémentaires)</p>

                  <h4 className="text-lg md:text-xl font-semibold mb-3">7.5.3 Niveau 3 - Fraude Organisée (Réseau, Récidive Multiple, Montage Complexe)</h4>
                  <ul className="list-disc list-inside space-y-2 mb-4 text-sm md:text-base ml-4">
                    <li>Facturation de la Commission × 3 (triple pénalité) + dommages-intérêts</li>
                    <li>Fermeture définitive de tous les comptes associés</li>
                    <li>Inscription au registre des débiteurs (ZEK, IKO, CRIF)</li>
                    <li>Dépôt de plainte pénale pour escroquerie (art. 146 CP) et/ou gestion déloyale (art. 158 CP)</li>
                    <li>Action civile en réparation du préjudice</li>
                    <li>Interdiction définitive et irrévocable d'utiliser Hoomy</li>
                  </ul>
                  <p className="mb-6 text-sm md:text-base font-bold text-destructive">Total dû : Commission × 3 + dommages-intérêts + frais d'avocat + frais de justice</p>

                  <div className="bg-destructive/10 border-l-4 border-destructive p-3 sm:p-4 rounded-lg">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
                      <div>
                        <strong className="block mb-2 text-destructive">CLAUSE PÉNALE CUMULATIVE</strong>
                        <p className="text-sm md:text-base">
                          Les pénalités financières prévues au présent article s'appliquent <strong>cumulativement</strong> et non alternativement. En cas de fraude de Niveau 3, l'Utilisateur devra payer la Commission initialement due PLUS la pénalité ×3 PLUS les intérêts moratoires PLUS les frais de recouvrement et d'avocat PLUS les dommages-intérêts PLUS les frais administratifs.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Article 8 */}
            <section id="article8" className="scroll-mt-20 sm:scroll-mt-24">
              <Card>
                <CardContent className="p-3 sm:p-6 md:p-8">
                  <h2 className="text-lg sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4 md:mb-6 leading-tight">
                    <Badge variant="secondary" className="mr-1 sm:mr-2 text-xs flex-shrink-0">Art. 8</Badge>
                    Détection et Prévention de la Fraude
                  </h2>

                  <h3 className="text-base sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 md:mb-4 leading-tight">8.1 Système de Scoring des Utilisateurs</h3>
                  <p className="mb-3 sm:mb-4 text-sm md:text-base leading-relaxed">Hoomy attribue à chaque Utilisateur un score de confiance (Trust Score) calculé dynamiquement selon les critères suivants :</p>
                  <ul className="list-disc list-inside space-y-1.5 sm:space-y-2 mb-4 sm:mb-6 text-sm md:text-base ml-3 sm:ml-4 leading-relaxed">
                    <li><strong>Identité vérifiée :</strong> +20 points (documents officiels validés)</li>
                    <li><strong>Paiements à temps :</strong> +5 points par transaction ponctuelle</li>
                    <li><strong>Évaluations positives :</strong> +3 points par avis 4-5 étoiles reçu</li>
                    <li><strong>Ancienneté du compte :</strong> +1 point par mois d'existence sans incident</li>
                    <li><strong>Comportements à risque :</strong> -10 à -50 points selon gravité</li>
                    <li><strong>Retards de paiement :</strong> -15 points par occurrence</li>
                    <li><strong>Signalements :</strong> -25 points par signalement fondé</li>
                  </ul>

                  <h3 className="text-base sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 md:mb-4 leading-tight">8.2 Règles de Sécurité Comportementale</h3>
                  <p className="mb-3 sm:mb-4 text-sm md:text-base leading-relaxed">Déclenchement d'alertes automatiques en cas de :</p>
                  <ul className="list-disc list-inside space-y-1.5 sm:space-y-2 mb-4 sm:mb-6 text-sm md:text-base ml-3 sm:ml-4 leading-relaxed">
                    <li>Création de multiples comptes depuis la même adresse IP en moins de 7 jours</li>
                    <li>Utilisation de coordonnées bancaires prépayées ou virtuelles à répétition</li>
                    <li>Messages contenant des mots-clés de contournement ("direct", "sans commission", "entre nous", etc.)</li>
                    <li>Délai anormalement long entre Mise en Relation et paiement (&gt; 48h sans justification)</li>
                    <li>Multiples demandes de remboursement pour motifs variables</li>
                    <li>Connexions depuis des VPN, proxies anonymisants ou réseaux Tor</li>
                    <li>Modification fréquente des informations de profil (nom, adresse, téléphone)</li>
                  </ul>
                </CardContent>
              </Card>
            </section>

            {/* Articles 9-15 - Obligations des utilisateurs */}
            <section id="article9" className="scroll-mt-20 sm:scroll-mt-24">
              <Card>
                <CardContent className="p-3 sm:p-6 md:p-8">
                  <h2 className="text-lg sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4 md:mb-6 leading-tight">
                    <Badge variant="secondary" className="mr-1 sm:mr-2 text-xs flex-shrink-0">Art. 9</Badge>
                    Obligations Spécifiques des Étudiants
                  </h2>

                  <h3 className="text-base sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 md:mb-4 leading-tight">9.1 Véracité du Statut Étudiant</h3>
                  <p className="mb-3 sm:mb-4 text-sm md:text-base leading-relaxed">L'Étudiant s'engage à :</p>
                  <ul className="list-disc list-inside space-y-1.5 sm:space-y-2 mb-4 sm:mb-6 text-sm md:text-base ml-3 sm:ml-4 leading-relaxed">
                    <li>Fournir un certificat d'inscription valide et authentique</li>
                    <li>Notifier immédiatement tout changement de statut (fin des études, exclusion, transfert)</li>
                    <li>Renouveler son justificatif chaque année académique</li>
                    <li>Ne pas utiliser le compte après la fin de ses études sans autorisation écrite de Hoomy</li>
                  </ul>

                  <h3 className="text-base sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 md:mb-4 leading-tight">9.2 Comportement Professionnel</h3>
                  <p className="mb-3 sm:mb-4 text-sm md:text-base leading-relaxed">L'Étudiant doit :</p>
                  <ul className="list-disc list-inside space-y-1.5 sm:space-y-2 mb-4 sm:mb-6 text-sm md:text-base ml-3 sm:ml-4 leading-relaxed">
                    <li>Respecter les délais de réponse aux sollicitations des Propriétaires (max 48h)</li>
                    <li>Se présenter ponctuellementen aux visites convenues ou annuler 24h à l'avance minimum</li>
                    <li>Fournir un dossier de location complet et véridique (revenus, garants, références)</li>
                    <li>Respecter les décisions de refus sans harcèlement ni insistance abusive</li>
                    <li>Ne pas envoyer de candidatures automatisées ou en masse</li>
                  </ul>

                  <h3 className="text-base sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 md:mb-4 leading-tight">9.3 Obligations de Paiement</h3>
                  <p className="mb-4 sm:mb-6 text-sm md:text-base leading-relaxed">L'Étudiant garantit disposer d'un moyen de paiement valide et autorise le prélèvement automatique mensuel de la commission dès la signature du bail, pour toute la durée de celui-ci.</p>
                </CardContent>
              </Card>
            </section>

            <section id="article10" className="scroll-mt-20 sm:scroll-mt-24">
              <Card>
                <CardContent className="p-3 sm:p-6 md:p-8">
                  <h2 className="text-lg sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4 md:mb-6 leading-tight">
                    <Badge variant="secondary" className="mr-1 sm:mr-2 text-xs flex-shrink-0">Art. 10</Badge>
                    Obligations Spécifiques des Propriétaires
                  </h2>

                  <h3 className="text-base sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 md:mb-4 leading-tight">10.1 Qualité Juridique et Droits</h3>
                  <p className="mb-3 sm:mb-4 text-sm md:text-base leading-relaxed">Le Propriétaire garantit :</p>
                  <ul className="list-disc list-inside space-y-1.5 sm:space-y-2 mb-4 sm:mb-6 text-sm md:text-base ml-3 sm:ml-4 leading-relaxed">
                    <li>Être le propriétaire légal ou disposer d'un mandat écrit du propriétaire</li>
                    <li>Avoir le droit de louer ou sous-louer le bien (autorisation préalable si nécessaire, art. 262 CO)</li>
                    <li>Ne pas faire l'objet de procédures d'interdiction de gérer ou de faillite</li>
                    <li>Respecter toutes les réglementations locales en matière de location (permis, autorisations cantonales)</li>
                  </ul>

                  <h3 className="text-base sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 md:mb-4 leading-tight">10.2 Conformité du Logement</h3>
                  <p className="mb-3 sm:mb-4 text-sm md:text-base leading-relaxed">Le Propriétaire certifie que le Logement :</p>
                  <ul className="list-disc list-inside space-y-1.5 sm:space-y-2 mb-4 sm:mb-6 text-sm md:text-base ml-3 sm:ml-4 leading-relaxed">
                    <li>Respecte les normes d'habitabilité et de salubrité applicables</li>
                    <li>Dispose de toutes les autorisations administratives requises</li>
                    <li>Est conforme aux normes de sécurité (électricité, gaz, incendie)</li>
                    <li>N'est pas affecté de vices cachés majeurs non déclarés</li>
                    <li>Correspond aux photos et descriptions publiées sur la Plateforme</li>
                  </ul>

                  <h3 className="text-base sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 md:mb-4 leading-tight">10.3 Véracité des Annonces</h3>
                  <p className="mb-3 sm:mb-4 text-sm md:text-base leading-relaxed">Le Propriétaire s'engage à :</p>
                  <ul className="list-disc list-inside space-y-1.5 sm:space-y-2 mb-4 sm:mb-6 text-sm md:text-base ml-3 sm:ml-4 leading-relaxed">
                    <li>Publier des photos récentes et authentiques du bien (interdiction de photos d'illustration trompeuses)</li>
                    <li>Indiquer le loyer réel, sans dissimulation de charges obligatoires</li>
                    <li>Préciser toutes les conditions et restrictions (animaux, fumeur, couple, etc.)</li>
                    <li>Mettre à jour immédiatement la disponibilité (retrait de l'annonce si louée)</li>
                    <li>Ne pas publier d'annonces fictives ou « appâts » pour attirer des candidats</li>
                  </ul>

                  <h3 className="text-base sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 md:mb-4 leading-tight">10.4 Non-Discrimination</h3>
                  <p className="mb-3 sm:mb-4 text-sm md:text-base leading-relaxed">Le Propriétaire s'interdit de discriminer les candidats sur des critères illégaux conformément à l'article 8 de la Constitution fédérale et à la loi fédérale sur l'égalité, notamment :</p>
                  <ul className="list-disc list-inside space-y-1.5 sm:space-y-2 mb-4 sm:mb-6 text-sm md:text-base ml-3 sm:ml-4 leading-relaxed">
                    <li>Origine ethnique, nationalité, race</li>
                    <li>Religion, convictions philosophiques</li>
                    <li>Orientation sexuelle, identité de genre</li>
                    <li>Handicap ou état de santé (sauf incompatibilité objective avec le logement)</li>
                    <li>Statut familial (célibataire, couple, enfants) sauf justification objective</li>
                  </ul>

                  <div className="bg-muted border-l-4 border-border p-4 rounded-lg text-sm md:text-base italic">
                    Critères de sélection légitimes : solvabilité, garanties, références de locataires précédents, adéquation du profil avec le type de logement.
                  </div>
                </CardContent>
              </Card>
            </section>

            <section id="article11" className="scroll-mt-20 sm:scroll-mt-24">
              <Card>
                <CardContent className="p-3 sm:p-6 md:p-8">
                  <h2 className="text-lg sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4 md:mb-6 leading-tight">
                    <Badge variant="secondary" className="mr-1 sm:mr-2 text-xs flex-shrink-0">Art. 11</Badge>
                    Publication et Gestion des Annonces
                  </h2>

                  <h3 className="text-base sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 md:mb-4 leading-tight">11.1 Contenu Obligatoire des Annonces</h3>
                  <p className="mb-3 sm:mb-4 text-sm md:text-base leading-relaxed">Chaque annonce doit obligatoirement contenir :</p>
                  <ul className="list-disc list-inside space-y-1.5 sm:space-y-2 mb-4 sm:mb-6 text-sm md:text-base ml-3 sm:ml-4 leading-relaxed">
                    <li>Minimum 5 photos de qualité représentant fidèlement le bien</li>
                    <li>Surface habitable exacte (en m²)</li>
                    <li>Nombre de pièces et configuration</li>
                    <li>Loyer mensuel net et charges (détaillées)</li>
                    <li>Montant du dépôt de garantie</li>
                    <li>Date de disponibilité</li>
                    <li>Durée minimale de location souhaitée</li>
                    <li>Équipements et prestations incluses</li>
                    <li>Conditions d'accès (étage, ascenseur, accessibilité PMR)</li>
                    <li>Proximité transports et commodités</li>
                  </ul>

                  <h3 className="text-base sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 md:mb-4 leading-tight">11.2 Modération des Annonces</h3>
                  <p className="mb-3 sm:mb-4 text-sm md:text-base leading-relaxed">Toute annonce est soumise à modération avant publication. Hoomy se réserve le droit de refuser ou supprimer toute annonce :</p>
                  <ul className="list-disc list-inside space-y-1.5 sm:space-y-2 mb-4 sm:mb-6 text-sm md:text-base ml-3 sm:ml-4 leading-relaxed">
                    <li>Contenant des informations manifestement fausses ou trompeuses</li>
                    <li>Utilisant des photos non conformes à la réalité ou tirées d'Internet</li>
                    <li>Proposant des logements non conformes aux standards d'habitabilité</li>
                    <li>Contenant du contenu illégal, discriminatoire, offensant</li>
                    <li>Violant les droits de propriété intellectuelle (photos volées)</li>
                    <li>Faisant la promotion de services annexes non autorisés</li>
                    <li>Comportant des coordonnées directes visant à contourner la Plateforme</li>
                  </ul>

                  <h3 className="text-base sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 md:mb-4 leading-tight">11.3 Durée de Publication</h3>
                  <ul className="list-disc list-inside space-y-1.5 sm:space-y-2 mb-4 sm:mb-6 text-sm md:text-base ml-3 sm:ml-4 leading-relaxed">
                    <li>Annonce gratuite valable 90 jours renouvelables</li>
                    <li>Désactivation automatique après signature d'un bail via Hoomy</li>
                    <li>Obligation de retrait manuel si location conclue hors Plateforme</li>
                    <li>Suppression automatique des annonces inactives &gt; 120 jours</li>
                  </ul>
                </CardContent>
              </Card>
            </section>

            <section id="article12" className="scroll-mt-20 sm:scroll-mt-24">
              <Card>
                <CardContent className="p-3 sm:p-6 md:p-8">
                  <h2 className="text-lg sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4 md:mb-6 leading-tight">
                    <Badge variant="secondary" className="mr-1 sm:mr-2 text-xs flex-shrink-0">Art. 12</Badge>
                    Fonctionnalités de Recherche et Navigation
                  </h2>

                  <h3 className="text-base sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 md:mb-4 leading-tight">12.1 Filtres de Recherche Disponibles</h3>
                  <p className="mb-3 sm:mb-4 text-sm md:text-base leading-relaxed">Les Étudiants peuvent rechercher des logements selon les critères suivants :</p>
                  <ul className="list-disc list-inside space-y-1.5 sm:space-y-2 mb-4 sm:mb-6 text-sm md:text-base ml-3 sm:ml-4 leading-relaxed">
                    <li>Ville, canton, région</li>
                    <li>Budget (loyer mensuel min/max)</li>
                    <li>Surface habitable (m² min/max)</li>
                    <li>Nombre de pièces</li>
                    <li>Type (studio, appartement, chambre en colocation, résidence étudiante)</li>
                    <li>Meublé / non meublé</li>
                    <li>Date de disponibilité</li>
                    <li>Proximité université / école</li>
                    <li>Équipements (balcon, parking, lave-linge, wifi, etc.)</li>
                  </ul>

                  <h3 className="text-base sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 md:mb-4 leading-tight">12.2 Système de Recommandation</h3>
                  <p className="mb-4 sm:mb-6 text-sm md:text-base leading-relaxed">Hoomy utilise un algorithme de recommandation pour suggérer les annonces les plus pertinentes basé sur : l'historique de recherche, les critères du profil, les interactions précédentes (favoris, consultations), le taux de compatibilité calculé automatiquement.</p>
                </CardContent>
              </Card>
            </section>

            <section id="article13" className="scroll-mt-20 sm:scroll-mt-24">
              <Card>
                <CardContent className="p-3 sm:p-6 md:p-8">
                  <h2 className="text-lg sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4 md:mb-6 leading-tight">
                    <Badge variant="secondary" className="mr-1 sm:mr-2 text-xs flex-shrink-0">Art. 13</Badge>
                    Système de Messagerie Interne
                  </h2>

                  <h3 className="text-base sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 md:mb-4 leading-tight">13.1 Fonctionnement de la Messagerie</h3>
                  <p className="mb-3 sm:mb-4 text-sm md:text-base leading-relaxed">La Plateforme met à disposition une messagerie interne permettant :</p>
                  <ul className="list-disc list-inside space-y-1.5 sm:space-y-2 mb-4 sm:mb-6 text-sm md:text-base ml-3 sm:ml-4 leading-relaxed">
                    <li>Les premiers échanges entre Étudiant et Propriétaire avant Mise en Relation</li>
                    <li>Clarification de questions sur le logement (équipements, conditions, disponibilité)</li>
                    <li>Échange de documents (sous réserve de modération)</li>
                  </ul>

                  <h3 className="text-base sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 md:mb-4 leading-tight">13.2 Limitations et Surveillance</h3>
                  <div className="bg-destructive/10 border-l-4 border-destructive p-4 rounded-lg mb-6">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
                      <div>
                        <strong className="block mb-2 text-destructive">Interdictions Strictes dans la Messagerie</strong>
                        <ul className="list-disc list-inside space-y-1 text-sm md:text-base ml-4">
                          <li>Échange de coordonnées personnelles (email, téléphone) avant Mise en Relation officielle</li>
                          <li>Incitation au contournement de la Plateforme</li>
                          <li>Contenu offensant, discriminatoire, harcelant</li>
                          <li>Spam, publicité, liens externes non autorisés</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <h3 className="text-base sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 md:mb-4 leading-tight">13.3 Modération Automatique et Manuelle</h3>
                  <p className="mb-4 sm:mb-6 text-sm md:text-base leading-relaxed">Tous les messages sont analysés par un système de détection automatique de mots-clés suspects (numéros de téléphone, emails, termes de contournement). Les messages suspects sont bloqués automatiquement et transmis à l'équipe de modération. En cas de violation avérée, sanctions immédiates (avertissement, suspension, fermeture de compte).</p>
                </CardContent>
              </Card>
            </section>

            <section id="article14" className="scroll-mt-20 sm:scroll-mt-24">
              <Card>
                <CardContent className="p-3 sm:p-6 md:p-8">
                  <h2 className="text-lg sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4 md:mb-6 leading-tight">
                    <Badge variant="secondary" className="mr-1 sm:mr-2 text-xs flex-shrink-0">Art. 14</Badge>
                    Conclusion du Contrat de Location
                  </h2>

                  <h3 className="text-base sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 md:mb-4 leading-tight">14.1 Autonomie Contractuelle des Parties</h3>
                  <p className="mb-4 sm:mb-6 text-sm md:text-base leading-relaxed">Le Contrat de Location est conclu librement et directement entre l'Étudiant et le Propriétaire, sans intervention de Hoomy. Les parties négocient librement : le montant du loyer et des charges, la durée du bail, le montant du dépôt de garantie, les conditions particulières. Hoomy ne fournit pas de modèle de contrat et ne valide pas les termes du bail.</p>

                  <h3 className="text-base sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 md:mb-4 leading-tight">14.2 Obligation de Déclaration</h3>
                  <p className="mb-3 sm:mb-4 text-sm md:text-base leading-relaxed">En cas de conclusion d'un bail suite à une Mise en Relation via Hoomy, les parties s'engagent solidairement à :</p>
                  <ul className="list-disc list-inside space-y-1.5 sm:space-y-2 mb-4 sm:mb-6 text-sm md:text-base ml-3 sm:ml-4 leading-relaxed">
                    <li>Déclarer la conclusion du bail sur la Plateforme dans les 48h</li>
                    <li>Fournir la preuve de signature (copie du bail signée ou attestation)</li>
                    <li>Indiquer la date de début et durée du bail</li>
                    <li>Confirmer le montant du loyer mensuel pour calcul de la commission</li>
                  </ul>

                  <div className="bg-muted border-l-4 border-border p-4 rounded-lg text-sm md:text-base italic mb-6">
                    Référence légale : Articles 253-274g CO régissant le contrat de bail à loyer en Suisse
                  </div>

                  <h3 className="text-base sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 md:mb-4 leading-tight">14.3 Conséquences de la Non-Déclaration</h3>
                  <p className="mb-4 sm:mb-6 text-sm md:text-base leading-relaxed">La non-déclaration d'un bail conclu via Hoomy constitue un Contournement au sens de l'Article 7 et entraîne l'application des sanctions prévues (facturation rétroactive de toutes les commissions dues depuis le début du bail + pénalités).</p>
                </CardContent>
              </Card>
            </section>

            <section id="article15" className="scroll-mt-20 sm:scroll-mt-24">
              <Card>
                <CardContent className="p-3 sm:p-6 md:p-8">
                  <h2 className="text-lg sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4 md:mb-6 leading-tight">
                    <Badge variant="secondary" className="mr-1 sm:mr-2 text-xs flex-shrink-0">Art. 15</Badge>
                    Système d'Évaluations et d'Avis
                  </h2>

                  <h3 className="text-base sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 md:mb-4 leading-tight">15.1 Évaluations Réciproques</h3>
                  <p className="mb-3 sm:mb-4 text-sm md:text-base leading-relaxed">Après conclusion d'un bail, les parties peuvent s'évaluer mutuellement :</p>
                  <ul className="list-disc list-inside space-y-1.5 sm:space-y-2 mb-4 sm:mb-6 text-sm md:text-base ml-3 sm:ml-4 leading-relaxed">
                    <li><strong>L'Étudiant évalue :</strong> La conformité du logement, la réactivité du Propriétaire, la transparence des informations</li>
                    <li><strong>Le Propriétaire évalue :</strong> Le sérieux du dossier, la ponctualité, la qualité de la communication</li>
                  </ul>

                  <h3 className="text-base sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 md:mb-4 leading-tight">15.2 Modalités de Publication</h3>
                  <ul className="list-disc list-inside space-y-1.5 sm:space-y-2 mb-4 sm:mb-6 text-sm md:text-base ml-3 sm:ml-4 leading-relaxed">
                    <li>Notation de 1 à 5 étoiles obligatoire</li>
                    <li>Commentaire textuel facultatif (max 500 caractères)</li>
                    <li>Délai de publication : 14 jours après signature du bail</li>
                    <li>Modération automatique anti-insultes et diffamation</li>
                    <li>Impossibilité de modifier un avis publié (sauf erreur manifeste validée par Hoomy)</li>
                  </ul>

                  <h3 className="text-base sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 md:mb-4 leading-tight">15.3 Droit de Réponse</h3>
                  <p className="mb-4 sm:mb-6 text-sm md:text-base leading-relaxed">Chaque utilisateur dispose d'un droit de réponse unique à un avis reçu (max 300 caractères), publié sous l'avis initial. Les avis manifestement diffamatoires, insultants ou mensongers peuvent être signalés et seront examinés par Hoomy (suppression possible après enquête).</p>
                </CardContent>
              </Card>
            </section>

            {/* Articles 16-20 - Responsabilités */}
            <section id="article16" className="scroll-mt-20 sm:scroll-mt-24">
              <Card>
                <CardContent className="p-3 sm:p-6 md:p-8">
                  <h2 className="text-lg sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4 md:mb-6 leading-tight">
                    <Badge variant="secondary" className="mr-1 sm:mr-2 text-xs flex-shrink-0">Art. 16</Badge>
                    Responsabilités de Hoomy
                  </h2>

                  <h3 className="text-base sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 md:mb-4 leading-tight">16.1 Obligation de Moyens</h3>
                  <p className="mb-4 sm:mb-6 text-sm md:text-base leading-relaxed">Hoomy est soumis à une obligation de moyens et non de résultat. La Plateforme s'engage à mettre en œuvre tous les moyens raisonnables pour assurer le bon fonctionnement du service, la sécurité des données, et la modération du contenu, mais ne garantit aucun résultat spécifique (nombre de mises en relation, conclusion de baux, satisfaction des utilisateurs).</p>

                  <h3 className="text-base sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 md:mb-4 leading-tight">16.2 Responsabilité Technique</h3>
                  <p className="mb-3 sm:mb-4 text-sm md:text-base leading-relaxed">Hoomy est responsable des dysfonctionnements techniques directement causés par ses propres systèmes dans la limite de :</p>
                  <ul className="list-disc list-inside space-y-1.5 sm:space-y-2 mb-4 sm:mb-6 text-sm md:text-base ml-3 sm:ml-4 leading-relaxed">
                    <li>Remboursement prorata temporis de la commission mensuelle en cas d'indisponibilité totale &gt; 72h continues</li>
                    <li>Plafond de responsabilité : montant total des commissions payées par l'utilisateur au cours des 12 derniers mois</li>
                  </ul>

                  <h3 className="text-base sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 md:mb-4 leading-tight">16.3 Absence de Responsabilité pour Contenus Tiers</h3>
                  <p className="mb-3 sm:mb-4 text-sm md:text-base leading-relaxed">Hoomy n'est pas responsable :</p>
                  <ul className="list-disc list-inside space-y-1.5 sm:space-y-2 mb-4 sm:mb-6 text-sm md:text-base ml-3 sm:ml-4 leading-relaxed">
                    <li>Du contenu des annonces publiées par les Propriétaires</li>
                    <li>Des déclarations, promesses, engagements pris par les utilisateurs</li>
                    <li>De la non-conformité des Logements aux descriptions</li>
                    <li>Des litiges entre Étudiant et Propriétaire relatifs au bail</li>
                    <li>Des impayés de loyers, dégradations, troubles de voisinage</li>
                    <li>Des vices cachés, défauts, ou dangers affectant les Logements</li>
                  </ul>
                </CardContent>
              </Card>
            </section>

            <section id="article17" className="scroll-mt-20 sm:scroll-mt-24">
              <Card>
                <CardContent className="p-3 sm:p-6 md:p-8">
                  <h2 className="text-lg sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4 md:mb-6 leading-tight">
                    <Badge variant="secondary" className="mr-1 sm:mr-2 text-xs flex-shrink-0">Art. 17</Badge>
                    Limitation et Exclusion de Responsabilité
                  </h2>

                  <h3 className="text-base sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 md:mb-4 leading-tight">17.1 Exclusions Générales</h3>
                  <p className="mb-3 sm:mb-4 text-sm md:text-base leading-relaxed">Dans les limites autorisées par le droit suisse, Hoomy exclut toute responsabilité pour :</p>
                  <ul className="list-disc list-inside space-y-1.5 sm:space-y-2 mb-4 sm:mb-6 text-sm md:text-base ml-3 sm:ml-4 leading-relaxed">
                    <li><strong>Dommages indirects :</strong> Perte de chance, manque à gagner, préjudice commercial, perte de clientèle, atteinte à la réputation</li>
                    <li><strong>Dommages consécutifs :</strong> Frais d'hébergement temporaire, déménagement, frais juridiques liés à un litige avec l'autre partie</li>
                    <li><strong>Faute de l'utilisateur :</strong> Négligence, imprudence, non-respect des présentes CGU</li>
                    <li><strong>Force majeure :</strong> Événements extérieurs imprévisibles et irrésistibles (voir Article 18)</li>
                    <li><strong>Fait d'un tiers :</strong> Attaques informatiques, défaillance de sous-traitants, interruption de services tiers (hébergeur, paiement, etc.)</li>
                  </ul>

                  <h3 className="text-base sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 md:mb-4 leading-tight">17.2 Plafonnement de Responsabilité</h3>
                  <p className="mb-3 sm:mb-4 text-sm md:text-base leading-relaxed">En toute hypothèse, la responsabilité totale et cumulée de Hoomy, tous dommages confondus, est limitée au montant le plus faible entre :</p>
                  <ul className="list-disc list-inside space-y-1.5 sm:space-y-2 mb-4 sm:mb-6 text-sm md:text-base ml-3 sm:ml-4 leading-relaxed">
                    <li>Le total des commissions effectivement payées par l'Utilisateur au cours des 12 derniers mois</li>
                    <li>CHF 1'000.– (mille francs suisses)</li>
                  </ul>

                  <div className="bg-muted border-l-4 border-border p-4 rounded-lg text-sm md:text-base italic">
                    Exception : Cette limitation ne s'applique pas en cas de faute intentionnelle ou de négligence grave de Hoomy, conformément à l'article 100 al. 1 CO (nullité des clauses exonératoires en cas de dol ou faute grave).
                  </div>
                </CardContent>
              </Card>
            </section>

            <section id="article18" className="scroll-mt-20 sm:scroll-mt-24">
              <Card>
                <CardContent className="p-3 sm:p-6 md:p-8">
                  <h2 className="text-lg sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4 md:mb-6 leading-tight">
                    <Badge variant="secondary" className="mr-1 sm:mr-2 text-xs flex-shrink-0">Art. 18</Badge>
                    Force Majeure et Cas Fortuit
                  </h2>

                  <h3 className="text-base sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 md:mb-4 leading-tight">18.1 Définition Étendue</h3>
                  <p className="mb-3 sm:mb-4 text-sm md:text-base leading-relaxed">Sont considérés comme cas de force majeure ou cas fortuit, outre ceux reconnus par la jurisprudence suisse (art. 119 CO) :</p>
                  <ul className="list-disc list-inside space-y-1.5 sm:space-y-2 mb-4 sm:mb-6 text-sm md:text-base ml-3 sm:ml-4 leading-relaxed">
                    <li>Catastrophes naturelles (séismes, inondations, tempêtes majeures)</li>
                    <li>Guerre, attentats terroristes, émeutes, troubles civils</li>
                    <li>Pannes majeures d'infrastructure internet au niveau national ou international</li>
                    <li>Cyberattaques massives de type DDoS, ransomware affectant les serveurs</li>
                    <li>Défaillance grave des fournisseurs critiques (hébergement, paiement, télécommunications)</li>
                    <li>Décisions administratives ou judiciaires imposant la suspension du service</li>
                    <li>Épidémies, pandémies déclarées par l'OMS entraînant des restrictions gouvernementales</li>
                    <li>Grèves générales, lock-out affectant les services essentiels</li>
                  </ul>

                  <h3 className="text-base sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 md:mb-4 leading-tight">18.2 Effets de la Force Majeure</h3>
                  <p className="mb-4 sm:mb-6 text-sm md:text-base leading-relaxed">En cas de force majeure, les obligations de Hoomy sont suspendues pendant la durée de l'événement. Si la force majeure perdure plus de 30 jours, chaque partie peut résilier le contrat sans indemnité. Aucune pénalité ni dommages-intérêts ne sont dus en cas de non-exécution imputable à la force majeure.</p>
                </CardContent>
              </Card>
            </section>

            <section id="article19" className="scroll-mt-20 sm:scroll-mt-24">
              <Card>
                <CardContent className="p-3 sm:p-6 md:p-8">
                  <h2 className="text-lg sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4 md:mb-6 leading-tight">
                    <Badge variant="secondary" className="mr-1 sm:mr-2 text-xs flex-shrink-0">Art. 19</Badge>
                    Garanties et Déclarations des Utilisateurs
                  </h2>

                  <h3 className="text-base sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 md:mb-4 leading-tight">19.1 Garanties Générales</h3>
                  <p className="mb-3 sm:mb-4 text-sm md:text-base leading-relaxed">Chaque Utilisateur garantit à Hoomy que :</p>
                  <ul className="list-disc list-inside space-y-1.5 sm:space-y-2 mb-4 sm:mb-6 text-sm md:text-base ml-3 sm:ml-4 leading-relaxed">
                    <li>Toutes les informations fournies lors de l'inscription et durant l'utilisation sont exactes, complètes et à jour</li>
                    <li>Il dispose de la capacité juridique et des autorisations nécessaires pour contracter</li>
                    <li>Il ne contrevient à aucune loi, réglementation ou obligation contractuelle envers un tiers</li>
                    <li>Il ne fait pas l'objet de procédures judiciaires, pénales ou administratives susceptibles d'affecter sa capacité à utiliser la Plateforme</li>
                    <li>Il respectera intégralement les présentes CGU et toute réglementation applicable</li>
                  </ul>

                  <h3 className="text-base sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 md:mb-4 leading-tight">19.2 Garanties Spécifiques des Propriétaires</h3>
                  <p className="mb-3 sm:mb-4 text-sm md:text-base leading-relaxed">Le Propriétaire garantit en outre :</p>
                  <ul className="list-disc list-inside space-y-1.5 sm:space-y-2 mb-4 sm:mb-6 text-sm md:text-base ml-3 sm:ml-4 leading-relaxed">
                    <li>Être titulaire de tous les droits nécessaires sur le Logement (propriété, usufruit, mandat)</li>
                    <li>Ne pas violer de droits de tiers (copropriété, voisinage, servitudes)</li>
                    <li>Que le Logement est conforme aux normes légales et réglementaires</li>
                    <li>Disposer des assurances requises (responsabilité civile bâtiment minimum)</li>
                  </ul>

                  <h3 className="text-base sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 md:mb-4 leading-tight">19.3 Garanties Spécifiques des Étudiants</h3>
                  <p className="mb-3 sm:mb-4 text-sm md:text-base leading-relaxed">L'Étudiant garantit :</p>
                  <ul className="list-disc list-inside space-y-1.5 sm:space-y-2 mb-4 sm:mb-6 text-sm md:text-base ml-3 sm:ml-4 leading-relaxed">
                    <li>Être effectivement inscrit dans un établissement d'enseignement supérieur reconnu</li>
                    <li>Fournir des documents authentiques et non falsifiés</li>
                    <li>Disposer de ressources financières suffisantes ou de garants solvables pour assumer le paiement du loyer et de la commission</li>
                  </ul>
                </CardContent>
              </Card>
            </section>

            <section id="article20" className="scroll-mt-20 sm:scroll-mt-24">
              <Card>
                <CardContent className="p-3 sm:p-6 md:p-8">
                  <h2 className="text-lg sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4 md:mb-6 leading-tight">
                    <Badge variant="secondary" className="mr-1 sm:mr-2 text-xs flex-shrink-0">Art. 20</Badge>
                    Indemnisation et Garantie de Défense
                  </h2>

                  <h3 className="text-base sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 md:mb-4 leading-tight">20.1 Engagement d'Indemnisation</h3>
                  <p className="mb-3 sm:mb-4 text-sm md:text-base leading-relaxed">L'Utilisateur s'engage à indemniser, défendre et garantir Hoomy contre toute réclamation, action, procédure, perte, dommage, coût (incluant les honoraires d'avocats) résultant de ou en relation avec :</p>
                  <ul className="list-disc list-inside space-y-1.5 sm:space-y-2 mb-4 sm:mb-6 text-sm md:text-base ml-3 sm:ml-4 leading-relaxed">
                    <li>Toute violation des présentes CGU par l'Utilisateur</li>
                    <li>Toute violation de droits de tiers (propriété intellectuelle, diffamation, vie privée)</li>
                    <li>Toute fausse déclaration ou garantie de l'Utilisateur</li>
                    <li>Tout litige entre l'Utilisateur et un autre utilisateur</li>
                    <li>Toute utilisation abusive, frauduleuse ou illégale de la Plateforme</li>
                  </ul>

                  <h3 className="text-base sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 md:mb-4 leading-tight">20.2 Procédure d'Indemnisation</h3>
                  <p className="mb-4 sm:mb-6 text-sm md:text-base leading-relaxed">Hoomy notifiera sans délai l'Utilisateur de toute réclamation. L'Utilisateur assumera la défense avec des avocats raisonnablement acceptables par Hoomy. Hoomy pourra participer à la défense à ses propres frais. Aucun règlement ne sera conclu sans l'accord écrit préalable de Hoomy.</p>
                </CardContent>
              </Card>
            </section>

            {/* Articles 21-25 - Propriété intellectuelle */}
            <section id="article21" className="scroll-mt-20 sm:scroll-mt-24">
              <Card>
                <CardContent className="p-3 sm:p-6 md:p-8">
                  <h2 className="text-lg sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4 md:mb-6 leading-tight">
                    <Badge variant="secondary" className="mr-1 sm:mr-2 text-xs flex-shrink-0">Art. 21</Badge>
                    Propriété Intellectuelle de Hoomy
                  </h2>

                  <h3 className="text-base sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 md:mb-4 leading-tight">21.1 Droits Exclusifs de Hoomy</h3>
                  <p className="mb-3 sm:mb-4 text-sm md:text-base leading-relaxed">Tous les éléments de la Plateforme sont et demeurent la propriété exclusive de Hoomy, protégés par le droit d'auteur (LDA), le droit des marques, et le droit sui generis des bases de données, notamment :</p>
                  <ul className="list-disc list-inside space-y-1.5 sm:space-y-2 mb-4 sm:mb-6 text-sm md:text-base ml-3 sm:ml-4 leading-relaxed">
                    <li><strong>Code source :</strong> Programmes informatiques (frontend, backend, API)</li>
                    <li><strong>Design et interface :</strong> Charte graphique, maquettes, wireframes</li>
                    <li><strong>Marques et logos :</strong> « Hoomy » et tous visuels associés</li>
                    <li><strong>Base de données :</strong> Structure, organisation, compilation des données</li>
                    <li><strong>Contenus éditoriaux :</strong> Textes, guides, FAQ, documentation</li>
                    <li><strong>Algorithmes :</strong> Systèmes de matching, recommandation, détection de fraude</li>
                  </ul>

                  <h3 className="text-base sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 md:mb-4 leading-tight">21.2 Interdictions Absolues</h3>
                  <p className="mb-3 sm:mb-4 text-sm md:text-base leading-relaxed">Il est strictement interdit, sans autorisation écrite préalable de Hoomy, de :</p>
                  <ul className="list-disc list-inside space-y-1.5 sm:space-y-2 mb-4 sm:mb-6 text-sm md:text-base ml-3 sm:ml-4 leading-relaxed">
                    <li>Copier, reproduire, modifier, adapter, traduire tout élément de la Plateforme</li>
                    <li>Désassembler, décompiler, effectuer de l'ingénierie inverse du code source</li>
                    <li>Extraire, aspirer, scraper les données de la Plateforme (interdiction absolue de web scraping)</li>
                    <li>Créer des œuvres dérivées basées sur la Plateforme</li>
                    <li>Utiliser les marques, logos, visuels de Hoomy de quelque manière que ce soit</li>
                    <li>Retirer, masquer ou modifier les mentions de propriété intellectuelle</li>
                  </ul>

                  <div className="bg-muted border-l-4 border-border p-4 rounded-lg text-sm md:text-base italic">
                    Référence légale : Loi fédérale sur le droit d'auteur (LDA, RS 231.1), Loi sur la protection des marques (LPM, RS 232.11)
                  </div>
                </CardContent>
              </Card>
            </section>

            <section id="article22" className="scroll-mt-20 sm:scroll-mt-24">
              <Card>
                <CardContent className="p-3 sm:p-6 md:p-8">
                  <h2 className="text-lg sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4 md:mb-6 leading-tight">
                    <Badge variant="secondary" className="mr-1 sm:mr-2 text-xs flex-shrink-0">Art. 22</Badge>
                    Marques, Logos et Identité Visuelle
                  </h2>

                  <h3 className="text-base sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 md:mb-4 leading-tight">22.1 Protection des Marques</h3>
                  <p className="mb-4 sm:mb-6 text-sm md:text-base leading-relaxed">« Hoomy » est une marque déposée ou en cours de dépôt auprès de l'Institut Fédéral de la Propriété Intellectuelle (IPI). Toute utilisation non autorisée constitue une contrefaçon sanctionnée civilement et pénalement (art. 61-66 LPM).</p>

                  <h3 className="text-base sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 md:mb-4 leading-tight">22.2 Utilisation Autorisée Limitée</h3>
                  <p className="mb-3 sm:mb-4 text-sm md:text-base leading-relaxed">Les utilisateurs peuvent mentionner « Hoomy » uniquement dans les contextes suivants :</p>
                  <ul className="list-disc list-inside space-y-1.5 sm:space-y-2 mb-4 sm:mb-6 text-sm md:text-base ml-3 sm:ml-4 leading-relaxed">
                    <li>Description factuelle de l'origine de la Mise en Relation (« J'ai trouvé ce logement via Hoomy »)</li>
                    <li>Avis et témoignages authentiques</li>
                    <li>Liens hypertextes non trompeurs vers la Plateforme</li>
                  </ul>
                  <p className="mb-4 sm:mb-6 text-sm md:text-base leading-relaxed">Toute autre utilisation (publicité, promotion, comparaison commerciale) nécessite une autorisation écrite préalable.</p>
                </CardContent>
              </Card>
            </section>

            <section id="article23" className="scroll-mt-20 sm:scroll-mt-24">
              <Card>
                <CardContent className="p-3 sm:p-6 md:p-8">
                  <h2 className="text-lg sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4 md:mb-6 leading-tight">
                    <Badge variant="secondary" className="mr-1 sm:mr-2 text-xs flex-shrink-0">Art. 23</Badge>
                    Droits d'Utilisation Accordés aux Utilisateurs
                  </h2>

                  <h3 className="text-base sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 md:mb-4 leading-tight">23.1 Licence d'Utilisation Limitée</h3>
                  <p className="mb-3 sm:mb-4 text-sm md:text-base leading-relaxed">Hoomy accorde à chaque Utilisateur une licence personnelle, non exclusive, non transférable, révocable à tout moment, d'utilisation de la Plateforme dans les conditions suivantes :</p>
                  <ul className="list-disc list-inside space-y-1.5 sm:space-y-2 mb-4 sm:mb-6 text-sm md:text-base ml-3 sm:ml-4 leading-relaxed">
                    <li><strong>Finalité :</strong> Exclusivement pour la recherche ou l'offre de logement étudiant</li>
                    <li><strong>Territoire :</strong> Suisse uniquement</li>
                    <li><strong>Durée :</strong> Tant que le Compte est actif et en conformité avec les CGU</li>
                    <li><strong>Modalités :</strong> Usage strictement personnel, non commercial, non professionnel</li>
                  </ul>

                  <h3 className="text-base sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 md:mb-4 leading-tight">23.2 Interdictions Spécifiques</h3>
                  <p className="mb-3 sm:mb-4 text-sm md:text-base leading-relaxed">Cette licence ne confère aucun droit de :</p>
                  <ul className="list-disc list-inside space-y-1.5 sm:space-y-2 mb-4 sm:mb-6 text-sm md:text-base ml-3 sm:ml-4 leading-relaxed">
                    <li>Sous-licencier, céder, louer, prêter l'accès à la Plateforme</li>
                    <li>Utiliser la Plateforme à des fins commerciales concurrentes</li>
                    <li>Créer des outils automatisés d'interaction avec la Plateforme (bots, scripts)</li>
                    <li>Accéder aux parties non publiques de la Plateforme</li>
                  </ul>
                </CardContent>
              </Card>
            </section>

            <section id="article24" className="scroll-mt-20 sm:scroll-mt-24">
              <Card>
                <CardContent className="p-3 sm:p-6 md:p-8">
                  <h2 className="text-lg sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4 md:mb-6 leading-tight">
                    <Badge variant="secondary" className="mr-1 sm:mr-2 text-xs flex-shrink-0">Art. 24</Badge>
                    Contenus Générés par les Utilisateurs
                  </h2>

                  <h3 className="text-base sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 md:mb-4 leading-tight">24.1 Propriété des Contenus</h3>
                  <p className="mb-4 sm:mb-6 text-sm md:text-base leading-relaxed">Les Utilisateurs conservent la propriété intellectuelle des contenus qu'ils publient sur la Plateforme (photos, descriptions, avis, messages). Ils garantissent détenir tous les droits nécessaires sur ces contenus et ne pas violer de droits de tiers.</p>

                  <h3 className="text-base sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 md:mb-4 leading-tight">24.2 Responsabilité des Contenus</h3>
                  <p className="mb-3 sm:mb-4 text-sm md:text-base leading-relaxed">L'Utilisateur est seul responsable des contenus qu'il publie et garantit qu'ils :</p>
                  <ul className="list-disc list-inside space-y-1.5 sm:space-y-2 mb-4 sm:mb-6 text-sm md:text-base ml-3 sm:ml-4 leading-relaxed">
                    <li>Sont conformes aux lois applicables</li>
                    <li>Ne violent aucun droit de propriété intellectuelle</li>
                    <li>Ne sont pas diffamatoires, injurieux, discriminatoires</li>
                    <li>Ne contiennent pas de virus, malware ou code malveillant</li>
                    <li>Ne font pas la promotion d'activités illégales</li>
                  </ul>

                  <h3 className="text-base sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 md:mb-4 leading-tight">24.3 Modération et Retrait</h3>
                  <p className="mb-4 sm:mb-6 text-sm md:text-base leading-relaxed">Hoomy se réserve le droit de refuser, modérer, modifier ou supprimer tout contenu manifestement illégal, contraire aux bonnes mœurs, ou violant les présentes CGU, sans notification préalable ni indemnité. Cette modération n'emporte aucune obligation générale de surveillance au sens de la loi sur le commerce électronique.</p>
                </CardContent>
              </Card>
            </section>

            <section id="article25" className="scroll-mt-20 sm:scroll-mt-24">
              <Card>
                <CardContent className="p-3 sm:p-6 md:p-8">
                  <h2 className="text-lg sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4 md:mb-6 leading-tight">
                    <Badge variant="secondary" className="mr-1 sm:mr-2 text-xs flex-shrink-0">Art. 25</Badge>
                    Licence d'Exploitation des Contenus Utilisateurs
                  </h2>

                  <h3 className="text-base sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 md:mb-4 leading-tight">25.1 Octroi de Licence à Hoomy</h3>
                  <p className="mb-3 sm:mb-4 text-sm md:text-base leading-relaxed">En publiant un contenu sur la Plateforme, l'Utilisateur accorde à Hoomy une licence mondiale, non exclusive, transférable, sous-licenciable, gratuite et perpétuelle d'utilisation de ce contenu pour les finalités suivantes :</p>
                  <ul className="list-disc list-inside space-y-1.5 sm:space-y-2 mb-4 sm:mb-6 text-sm md:text-base ml-3 sm:ml-4 leading-relaxed">
                    <li>Hébergement, stockage, affichage sur la Plateforme</li>
                    <li>Distribution, diffusion, communication au public</li>
                    <li>Reproduction, adaptation technique pour compatibilité (formats, résolutions)</li>
                    <li>Utilisation à des fins de marketing et promotion de la Plateforme (avec anonymisation possible)</li>
                    <li>Indexation par moteurs de recherche</li>
                  </ul>

                  <h3 className="text-base sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 md:mb-4 leading-tight">25.2 Durée de la Licence</h3>
                  <p className="mb-4 sm:mb-6 text-sm md:text-base leading-relaxed">La licence persiste même après suppression du compte pour les contenus déjà diffusés, archivés ou utilisés dans des supports marketing créés antérieurement. L'Utilisateur peut demander le retrait d'un contenu spécifique via le support (traitement sous 30 jours ouvrables).</p>
                </CardContent>
              </Card>
            </section>

            {/* Articles 26-30 - Protection des données */}
            <section id="article26" className="scroll-mt-20 sm:scroll-mt-24">
              <Card>
                <CardContent className="p-3 sm:p-6 md:p-8">
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-6 flex items-center gap-2">
                    <Shield className="h-6 w-6 text-primary" />
                    <Badge variant="secondary" className="mr-1 sm:mr-2 text-xs flex-shrink-0">Art. 26</Badge>
                    Protection des Données Personnelles - Principes Généraux
                  </h2>

                  <h3 className="text-base sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 md:mb-4 leading-tight">26.1 Cadre Légal Applicable</h3>
                  <p className="mb-3 sm:mb-4 text-sm md:text-base leading-relaxed">Le traitement des données personnelles par Hoomy est régi par :</p>
                  <ul className="list-disc list-inside space-y-1.5 sm:space-y-2 mb-4 sm:mb-6 text-sm md:text-base ml-3 sm:ml-4 leading-relaxed">
                    <li><strong>Loi fédérale sur la protection des données (LPD, RS 235.1)</strong> et son ordonnance (OLPD)</li>
                    <li><strong>RGPD (UE 2016/679)</strong> pour les utilisateurs résidant dans l'UE/EEE</li>
                    <li>Recommandations du Préposé fédéral à la protection des données (PFPDT)</li>
                  </ul>

                  <h3 className="text-base sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 md:mb-4 leading-tight">26.2 Responsable du Traitement</h3>
                  <p className="mb-4 sm:mb-6 text-sm md:text-base leading-relaxed">Hoomy est le responsable du traitement des données personnelles collectées via la Plateforme. Contact délégué à la protection des données (DPO) : <a href="mailto:legal@hoomy.site" className="text-primary hover:underline">legal@hoomy.site</a></p>

                  <h3 className="text-base sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 md:mb-4 leading-tight">26.3 Principes Fondamentaux</h3>
                  <p className="mb-3 sm:mb-4 text-sm md:text-base leading-relaxed">Hoomy s'engage à respecter les principes suivants (art. 6 LPD) :</p>
                  <ul className="list-disc list-inside space-y-1.5 sm:space-y-2 mb-4 sm:mb-6 text-sm md:text-base ml-3 sm:ml-4 leading-relaxed">
                    <li><strong>Licéité :</strong> Traitement conforme aux bases légales applicables</li>
                    <li><strong>Bonne foi :</strong> Traitement transparent et non trompeur</li>
                    <li><strong>Proportionnalité :</strong> Collecte limitée aux données strictement nécessaires</li>
                    <li><strong>Finalité :</strong> Utilisation uniquement aux fins déclarées lors de la collecte</li>
                    <li><strong>Exactitude :</strong> Mise à jour régulière des données</li>
                    <li><strong>Conservation limitée :</strong> Durée strictement nécessaire</li>
                    <li><strong>Sécurité :</strong> Mesures techniques et organisationnelles appropriées</li>
                  </ul>
                </CardContent>
              </Card>
            </section>

            <section id="article27" className="scroll-mt-20 sm:scroll-mt-24">
              <Card>
                <CardContent className="p-3 sm:p-6 md:p-8">
                  <h2 className="text-lg sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4 md:mb-6 leading-tight">
                    <Badge variant="secondary" className="mr-1 sm:mr-2 text-xs flex-shrink-0">Art. 27</Badge>
                    Catégories et Finalités du Traitement
                  </h2>

                  <h3 className="text-base sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 md:mb-4 leading-tight">27.1 Données Collectées</h3>
                  <p className="mb-3 sm:mb-4 text-sm md:text-base leading-relaxed">Hoomy collecte les catégories de données suivantes :</p>
                  
                  <h4 className="text-lg md:text-xl font-semibold mb-3">A) Données d'Identification</h4>
                  <ul className="list-disc list-inside space-y-1 mb-4 text-sm md:text-base ml-4">
                    <li>Nom, prénom, date de naissance</li>
                    <li>Copie pièce d'identité (carte d'identité, passeport)</li>
                    <li>Photo selfie avec pièce d'identité (vérification liveness)</li>
                    <li>Adresse postale complète</li>
                    <li>Numéro de téléphone</li>
                    <li>Adresse email</li>
                  </ul>

                  <h4 className="text-lg md:text-xl font-semibold mb-3">B) Données Académiques (Étudiants)</h4>
                  <ul className="list-disc list-inside space-y-1 mb-4 text-sm md:text-base ml-4">
                    <li>Établissement d'enseignement</li>
                    <li>Certificat d'inscription ou carte étudiante</li>
                    <li>Année et domaine d'études</li>
                    <li>Date prévue de fin des études</li>
                  </ul>

                  <h4 className="text-lg md:text-xl font-semibold mb-3">C) Données Immobilières (Propriétaires)</h4>
                  <ul className="list-disc list-inside space-y-1 mb-4 text-sm md:text-base ml-4">
                    <li>Extrait registre foncier ou titre de propriété</li>
                    <li>Contrat de bail (si sous-location)</li>
                    <li>Attestation d'assurance bâtiment</li>
                    <li>Caractéristiques des logements proposés</li>
                  </ul>

                  <h4 className="text-lg md:text-xl font-semibold mb-3">D) Données de Paiement</h4>
                  <ul className="list-disc list-inside space-y-1 mb-4 text-sm md:text-base ml-4">
                    <li>Informations bancaires (IBAN, BIC)</li>
                    <li>Données carte bancaire (cryptées, via prestataire certifié PCI-DSS)</li>
                    <li>Historique des transactions</li>
                  </ul>

                  <h4 className="text-lg md:text-xl font-semibold mb-3">E) Données de Navigation</h4>
                  <ul className="list-disc list-inside space-y-1 mb-4 text-sm md:text-base ml-4">
                    <li>Adresse IP, géolocalisation approximative</li>
                    <li>Logs de connexion (date, heure, durée)</li>
                    <li>Historique de navigation sur la Plateforme</li>
                    <li>Cookies et identifiants techniques</li>
                    <li>Appareil utilisé (OS, navigateur, résolution)</li>
                  </ul>

                  <h3 className="text-base sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 md:mb-4 leading-tight">27.2 Finalités du Traitement</h3>
                  <p className="mb-3 sm:mb-4 text-sm md:text-base leading-relaxed">Les données sont traitées exclusivement pour les finalités suivantes :</p>
                  <ul className="list-disc list-inside space-y-1.5 sm:space-y-2 mb-4 sm:mb-6 text-sm md:text-base ml-3 sm:ml-4 leading-relaxed">
                    <li><strong>Gestion des comptes :</strong> Création, authentification, administration</li>
                    <li><strong>Service d'intermédiation :</strong> Mise en relation, messagerie, suivi des contrats</li>
                    <li><strong>Vérification d'identité (KYC) :</strong> Prévention fraude, conformité réglementaire</li>
                    <li><strong>Traitement des paiements :</strong> Facturation, prélèvement commissions, comptabilité</li>
                    <li><strong>Service client :</strong> Assistance, réclamations, support technique</li>
                    <li><strong>Sécurité :</strong> Détection fraude, prévention abus, protection systèmes</li>
                    <li><strong>Amélioration du service :</strong> Statistiques anonymes, analyses d'usage, R&D</li>
                    <li><strong>Marketing :</strong> Newsletters, offres personnalisées (avec consentement)</li>
                    <li><strong>Obligations légales :</strong> Conservation documents fiscaux, réponses autorités judiciaires</li>
                  </ul>

                  <div className="bg-muted border-l-4 border-border p-4 rounded-lg text-sm md:text-base italic">
                    Bases légales : Exécution du contrat (CGU), consentement explicite, intérêt légitime, obligations légales (art. 31 LPD, art. 6 RGPD).
                  </div>
                </CardContent>
              </Card>
            </section>

            <section id="article28" className="scroll-mt-20 sm:scroll-mt-24">
              <Card>
                <CardContent className="p-3 sm:p-6 md:p-8">
                  <h2 className="text-lg sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4 md:mb-6 leading-tight">
                    <Badge variant="secondary" className="mr-1 sm:mr-2 text-xs flex-shrink-0">Art. 28</Badge>
                    Droits des Utilisateurs sur leurs Données
                  </h2>

                  <h3 className="text-base sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 md:mb-4 leading-tight">28.1 Droit d'Accès (art. 25 LPD, art. 15 RGPD)</h3>
                  <p className="mb-3 sm:mb-4 text-sm md:text-base leading-relaxed">Chaque utilisateur peut obtenir :</p>
                  <ul className="list-disc list-inside space-y-1.5 sm:space-y-2 mb-4 sm:mb-6 text-sm md:text-base ml-3 sm:ml-4 leading-relaxed">
                    <li>Confirmation du traitement de ses données personnelles</li>
                    <li>Copie complète des données détenues</li>
                    <li>Informations sur les finalités, catégories, destinataires, durée de conservation</li>
                    <li>Délai de réponse : 30 jours calendaires (prorogeable 30 jours supplémentaires si complexité)</li>
                  </ul>

                  <h3 className="text-base sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 md:mb-4 leading-tight">28.2 Droit de Rectification (art. 32 LPD, art. 16 RGPD)</h3>
                  <p className="mb-4 sm:mb-6 text-sm md:text-base leading-relaxed">L'utilisateur peut demander la correction des données inexactes ou incomplètes. Modification directe via l'interface utilisateur pour les données de profil. Demande écrite pour les documents officiels (vérification préalable).</p>

                  <h3 className="text-base sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 md:mb-4 leading-tight">28.3 Droit à l'Effacement / « Droit à l'Oubli » (art. 32 LPD, art. 17 RGPD)</h3>
                  <p className="mb-3 sm:mb-4 text-sm md:text-base leading-relaxed">Suppression des données dans les cas suivants :</p>
                  <ul className="list-disc list-inside space-y-1.5 sm:space-y-2 mb-4 sm:mb-6 text-sm md:text-base ml-3 sm:ml-4 leading-relaxed">
                    <li>Données non nécessaires au regard des finalités</li>
                    <li>Retrait du consentement (si base légale unique)</li>
                    <li>Opposition au traitement (si pas d'intérêt légitime prépondérant)</li>
                    <li>Traitement illicite avéré</li>
                  </ul>
                  <p className="mb-4 sm:mb-6 text-sm md:text-base leading-relaxed"><strong>Exceptions :</strong> Obligations légales de conservation (10 ans pour documents comptables), exercice de droits en justice, archivage d'intérêt public.</p>

                  <h3 className="text-base sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 md:mb-4 leading-tight">28.4 Droit à la Limitation du Traitement (art. 18 RGPD)</h3>
                  <p className="mb-4 sm:mb-6 text-sm md:text-base leading-relaxed">Gel temporaire du traitement pendant vérification de l'exactitude des données ou examen d'une opposition.</p>

                  <h3 className="text-base sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 md:mb-4 leading-tight">28.5 Droit à la Portabilité (art. 20 RGPD)</h3>
                  <p className="mb-4 sm:mb-6 text-sm md:text-base leading-relaxed">Récupération des données dans un format structuré, couramment utilisé et lisible par machine (JSON, CSV, PDF). Possibilité de transmission directe à un autre responsable de traitement si techniquement possible.</p>

                  <h3 className="text-base sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 md:mb-4 leading-tight">28.6 Droit d'Opposition (art. 30 LPD, art. 21 RGPD)</h3>
                  <p className="mb-4 sm:mb-6 text-sm md:text-base leading-relaxed">Opposition au traitement basé sur l'intérêt légitime ou à des fins de marketing direct (y compris profilage). Opposition absolue et inconditionnelle au démarchage commercial.</p>

                  <h3 className="text-base sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 md:mb-4 leading-tight">28.7 Exercice des Droits</h3>
                  <p className="mb-3 sm:mb-4 text-sm md:text-base leading-relaxed">Toute demande doit être adressée à :</p>
                  <ul className="list-disc list-inside space-y-1.5 sm:space-y-2 mb-4 sm:mb-6 text-sm md:text-base ml-3 sm:ml-4 leading-relaxed">
                    <li><strong>Email :</strong> <a href="mailto:legal@hoomy.site" className="text-primary hover:underline">legal@hoomy.site</a></li>
                    <li><strong>Courrier :</strong> Hoomy, DPO, Rue Saint-Maurice 12, 2525 Le Landeron, Neuchâtel, Suisse</li>
                    <li><strong>Formulaire dédié :</strong> Disponible dans les paramètres du compte</li>
                  </ul>
                  <p className="mb-4 sm:mb-6 text-sm md:text-base leading-relaxed">Justificatif d'identité requis pour toute demande (sécurité). Gratuité (sauf demandes manifestement infondées ou excessives).</p>

                  <h3 className="text-base sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 md:mb-4 leading-tight">28.8 Droit de Réclamation</h3>
                  <p className="mb-3 sm:mb-4 text-sm md:text-base leading-relaxed">En cas de désaccord sur le traitement de vos données, vous pouvez introduire une réclamation auprès de :</p>
                  <ul className="list-disc list-inside space-y-1.5 sm:space-y-2 mb-4 sm:mb-6 text-sm md:text-base ml-3 sm:ml-4 leading-relaxed">
                    <li><strong>Suisse :</strong> Préposé fédéral à la protection des données et à la transparence (PFPDT)<br/>
                    Feldeggweg 1, 3003 Berne, Suisse<br/>
                    www.edoeb.admin.ch</li>
                    <li><strong>UE/EEE :</strong> Autorité de contrôle de votre pays de résidence</li>
                  </ul>
                </CardContent>
              </Card>
            </section>

            <section id="article29" className="scroll-mt-20 sm:scroll-mt-24">
              <Card>
                <CardContent className="p-3 sm:p-6 md:p-8">
                  <h2 className="text-lg sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4 md:mb-6 leading-tight">
                    <Badge variant="secondary" className="mr-1 sm:mr-2 text-xs flex-shrink-0">Art. 29</Badge>
                    Cookies et Technologies de Traçage
                  </h2>

                  <h3 className="text-base sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 md:mb-4 leading-tight">29.1 Types de Cookies Utilisés</h3>
                  
                  <h4 className="text-lg md:text-xl font-semibold mb-3">A) Cookies Strictement Nécessaires (sans consentement)</h4>
                  <ul className="list-disc list-inside space-y-1 mb-4 text-sm md:text-base ml-4">
                    <li>Cookies d'authentification (session utilisateur)</li>
                    <li>Cookies de sécurité (protection CSRF, détection fraude)</li>
                    <li>Cookies de charge serveur (load balancing)</li>
                    <li>Durée : Session ou 24h maximum</li>
                  </ul>

                  <h4 className="text-lg md:text-xl font-semibold mb-3">B) Cookies Fonctionnels (avec consentement)</h4>
                  <ul className="list-disc list-inside space-y-1 mb-4 text-sm md:text-base ml-4">
                    <li>Préférences utilisateur (langue, devise, affichage)</li>
                    <li>Mémorisation des filtres de recherche</li>
                    <li>Favoris et listes de suivi</li>
                    <li>Durée : 12 mois</li>
                  </ul>

                  <h4 className="text-lg md:text-xl font-semibold mb-3">C) Cookies Analytiques (avec consentement)</h4>
                  <ul className="list-disc list-inside space-y-1 mb-4 text-sm md:text-base ml-4">
                    <li>Statistiques d'audience anonymisées</li>
                    <li>Analyse parcours utilisateur</li>
                    <li>Tests A/B et optimisation UX</li>
                    <li>Outils : Google Analytics 4 (anonymisation IP), Matomo auto-hébergé</li>
                    <li>Durée : 13 mois</li>
                  </ul>

                  <h4 className="text-lg md:text-xl font-semibold mb-3">D) Cookies Marketing (avec consentement explicite)</h4>
                  <ul className="list-disc list-inside space-y-1 mb-4 text-sm md:text-base ml-4">
                    <li>Publicité ciblée et personnalisée</li>
                    <li>Retargeting sur réseaux sociaux</li>
                    <li>Mesure campagnes publicitaires</li>
                    <li>Partenaires : Facebook Pixel, Google Ads (si applicable)</li>
                    <li>Durée : 13 mois</li>
                  </ul>

                  <h3 className="text-base sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 md:mb-4 leading-tight">29.2 Gestion des Cookies</h3>
                  <p className="mb-3 sm:mb-4 text-sm md:text-base leading-relaxed">L'utilisateur peut à tout moment :</p>
                  <ul className="list-disc list-inside space-y-1.5 sm:space-y-2 mb-4 sm:mb-6 text-sm md:text-base ml-3 sm:ml-4 leading-relaxed">
                    <li>Modifier ses préférences via le bandeau cookies (toujours accessible en pied de page)</li>
                    <li>Configurer son navigateur pour refuser les cookies</li>
                    <li>Supprimer les cookies existants</li>
                  </ul>
                  <p className="mb-4 sm:mb-6 text-sm md:text-base leading-relaxed"><strong>Conséquence :</strong> Le refus des cookies fonctionnels peut limiter l'accès à certaines fonctionnalités.</p>

                  <h3 className="text-base sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 md:mb-4 leading-tight">29.3 Autres Technologies de Traçage</h3>
                  <ul className="list-disc list-inside space-y-1.5 sm:space-y-2 mb-4 sm:mb-6 text-sm md:text-base ml-3 sm:ml-4 leading-relaxed">
                    <li>Pixels invisibles (web beacons) dans les emails</li>
                    <li>LocalStorage et SessionStorage HTML5</li>
                    <li>Fingerprinting léger (résolution écran, fuseau horaire) à des fins anti-fraude uniquement</li>
                  </ul>
                </CardContent>
              </Card>
            </section>

            <section id="article30" className="scroll-mt-20 sm:scroll-mt-24">
              <Card>
                <CardContent className="p-3 sm:p-6 md:p-8">
                  <h2 className="text-lg sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4 md:mb-6 leading-tight">
                    <Badge variant="secondary" className="mr-1 sm:mr-2 text-xs flex-shrink-0">Art. 30</Badge>
                    Transferts Internationaux de Données
                  </h2>

                  <h3 className="text-base sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 md:mb-4 leading-tight">30.1 Localisation des Données</h3>
                  <p className="mb-3 sm:mb-4 text-sm md:text-base leading-relaxed">Les données sont hébergées principalement en Suisse et dans l'Union Européenne chez des prestataires certifiés :</p>
                  <ul className="list-disc list-inside space-y-1.5 sm:space-y-2 mb-4 sm:mb-6 text-sm md:text-base ml-3 sm:ml-4 leading-relaxed">
                    <li><strong>Hébergement principal :</strong> Datacenters suisses (Infomaniak, Exoscale ou équivalent)</li>
                    <li><strong>CDN et cache :</strong> Réseau européen (Cloudflare zones EU)</li>
                    <li><strong>Sauvegarde :</strong> Réplication multi-sites en Suisse et UE</li>
                  </ul>

                  <h3 className="text-base sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 md:mb-4 leading-tight">30.2 Transferts vers Pays Tiers</h3>
                  <p className="mb-3 sm:mb-4 text-sm md:text-base leading-relaxed">Dans certains cas limités, des transferts vers des pays hors Suisse/UE peuvent être nécessaires :</p>
                  <ul className="list-disc list-inside space-y-1.5 sm:space-y-2 mb-4 sm:mb-6 text-sm md:text-base ml-3 sm:ml-4 leading-relaxed">
                    <li><strong>USA :</strong> Prestataires certifiés EU-US Data Privacy Framework (Google, AWS sous réserve)</li>
                    <li><strong>Garanties :</strong> Clauses contractuelles types (CCT) de la Commission européenne</li>
                    <li><strong>Transparence :</strong> Liste des sous-traitants disponible sur demande</li>
                  </ul>

                  <div className="bg-muted border-l-4 border-border p-4 rounded-lg text-sm md:text-base italic">
                    Conformité : Article 16 LPD et Chapitre V RGPD sur les transferts internationaux.
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Articles 31-35 - Sécurité */}
            <section id="article31" className="scroll-mt-20 sm:scroll-mt-24">
              <Card>
                <CardContent className="p-3 sm:p-6 md:p-8">
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-6 flex items-center gap-2">
                    <Lock className="h-6 w-6 text-primary" />
                    <Badge variant="secondary" className="mr-1 sm:mr-2 text-xs flex-shrink-0">Art. 31</Badge>
                    Sécurité Informatique et Protection Technique
                  </h2>

                  <h3 className="text-base sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 md:mb-4 leading-tight">31.1 Mesures de Sécurité Techniques</h3>
                  <p className="mb-3 sm:mb-4 text-sm md:text-base leading-relaxed">Hoomy met en œuvre les mesures techniques suivantes :</p>
                  <ul className="list-disc list-inside space-y-1.5 sm:space-y-2 mb-4 sm:mb-6 text-sm md:text-base ml-3 sm:ml-4 leading-relaxed">
                    <li><strong>Chiffrement en transit :</strong> HTTPS/TLS 1.3 obligatoire pour toutes les communications</li>
                    <li><strong>Chiffrement au repos :</strong> AES-256 pour données sensibles (pièces d'identité, documents bancaires)</li>
                    <li><strong>Firewall applicatif (WAF) :</strong> Protection contre injections SQL, XSS, CSRF</li>
                    <li><strong>Protection DDoS :</strong> Système anti-déni de service distribué</li>
                    <li><strong>Scan vulnérabilités :</strong> Tests automatisés quotidiens</li>
                    <li><strong>Mises à jour :</strong> Patch de sécurité appliqués sous 72h (critiques sous 24h)</li>
                  </ul>

                  <h3 className="text-base sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 md:mb-4 leading-tight">31.2 Mesures de Sécurité Organisationnelles</h3>
                  <ul className="list-disc list-inside space-y-1.5 sm:space-y-2 mb-4 sm:mb-6 text-sm md:text-base ml-3 sm:ml-4 leading-relaxed">
                    <li>Accès aux données limité au strict nécessaire (principe du moindre privilège)</li>
                    <li>Authentification multi-facteurs (2FA) obligatoire pour administrateurs</li>
                    <li>Journalisation complète des accès et actions (audit trail)</li>
                    <li>Clauses de confidentialité dans tous les contrats employés/prestataires</li>
                    <li>Formation annuelle du personnel à la sécurité informatique</li>
                    <li>Politique de mots de passe renforcée (complexité, renouvellement)</li>
                  </ul>

                  <h3 className="text-base sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 md:mb-4 leading-tight">31.3 Sécurité des Paiements</h3>
                  <ul className="list-disc list-inside space-y-1.5 sm:space-y-2 mb-4 sm:mb-6 text-sm md:text-base ml-3 sm:ml-4 leading-relaxed">
                    <li><strong>Prestataire certifié PCI-DSS Level 1 :</strong> Stripe ou équivalent</li>
                    <li><strong>Tokenisation :</strong> Aucune donnée bancaire brute stockée par Hoomy</li>
                    <li><strong>3D Secure 2 :</strong> Authentification forte du titulaire de la carte</li>
                    <li><strong>Détection fraude :</strong> Algorithmes machine learning anti-fraude en temps réel</li>
                  </ul>
                </CardContent>
              </Card>
            </section>

            <section id="article32" className="scroll-mt-20 sm:scroll-mt-24">
              <Card>
                <CardContent className="p-3 sm:p-6 md:p-8">
                  <h2 className="text-lg sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4 md:mb-6 leading-tight">
                    <Badge variant="secondary" className="mr-1 sm:mr-2 text-xs flex-shrink-0">Art. 32</Badge>
                    Chiffrement et Cryptographie
                  </h2>

                  <h3 className="text-base sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 md:mb-4 leading-tight">32.1 Protocoles Cryptographiques</h3>
                  <ul className="list-disc list-inside space-y-1.5 sm:space-y-2 mb-4 sm:mb-6 text-sm md:text-base ml-3 sm:ml-4 leading-relaxed">
                    <li><strong>Mots de passe :</strong> Hachage bcrypt (coût 12) + salt unique par utilisateur</li>
                    <li><strong>Tokens de session :</strong> JWT signés avec clé RSA-2048, expiration 24h</li>
                    <li><strong>API Keys :</strong> SHA-256, rotation mensuelle automatique</li>
                    <li><strong>Documents sensibles :</strong> Chiffrement AES-256-GCM avec clés gérées par HSM</li>
                  </ul>

                  <h3 className="text-base sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 md:mb-4 leading-tight">32.2 Gestion des Clés de Chiffrement</h3>
                  <ul className="list-disc list-inside space-y-1.5 sm:space-y-2 mb-4 sm:mb-6 text-sm md:text-base ml-3 sm:ml-4 leading-relaxed">
                    <li>Stockage sécurisé dans modules cryptographiques matériels (HSM)</li>
                    <li>Rotation automatique annuelle des clés principales</li>
                    <li>Séparation des clés par environnement (production/développement)</li>
                    <li>Procédure de révocation d'urgence en cas de compromission</li>
                  </ul>
                </CardContent>
              </Card>
            </section>

            <section id="article33" className="scroll-mt-20 sm:scroll-mt-24">
              <Card>
                <CardContent className="p-3 sm:p-6 md:p-8">
                  <h2 className="text-lg sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4 md:mb-6 leading-tight">
                    <Badge variant="secondary" className="mr-1 sm:mr-2 text-xs flex-shrink-0">Art. 33</Badge>
                    Sauvegarde et Continuité d'Activité
                  </h2>

                  <h3 className="text-base sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 md:mb-4 leading-tight">33.1 Politique de Sauvegarde</h3>
                  <ul className="list-disc list-inside space-y-1.5 sm:space-y-2 mb-4 sm:mb-6 text-sm md:text-base ml-3 sm:ml-4 leading-relaxed">
                    <li><strong>Sauvegardes quotidiennes :</strong> Backup complet automatique chaque jour à 2h00 UTC</li>
                    <li><strong>Sauvegardes incrémentales :</strong> Toutes les 4 heures</li>
                    <li><strong>Réplication temps réel :</strong> Base de données répliquée sur 3 sites distants</li>
                    <li><strong>Rétention :</strong> 30 jours de sauvegardes quotidiennes, 12 mois de sauvegardes mensuelles</li>
                    <li><strong>Test de restauration :</strong> Mensuel pour valider l'intégrité des backups</li>
                  </ul>

                  <h3 className="text-base sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 md:mb-4 leading-tight">33.2 Plan de Reprise d'Activité (PRA)</h3>
                  <ul className="list-disc list-inside space-y-1.5 sm:space-y-2 mb-4 sm:mb-6 text-sm md:text-base ml-3 sm:ml-4 leading-relaxed">
                    <li><strong>RTO (Recovery Time Objective) :</strong> 4 heures maximum</li>
                    <li><strong>RPO (Recovery Point Objective) :</strong> 4 heures maximum (perte de données tolérée)</li>
                    <li><strong>Site de secours :</strong> Infrastructure redondante prête à prendre le relais</li>
                    <li><strong>Procédures documentées :</strong> Playbooks détaillés pour chaque scénario de sinistre</li>
                  </ul>
                </CardContent>
              </Card>
            </section>

            <section id="article34" className="scroll-mt-20 sm:scroll-mt-24">
              <Card>
                <CardContent className="p-3 sm:p-6 md:p-8">
                  <h2 className="text-lg sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4 md:mb-6 leading-tight">
                    <Badge variant="secondary" className="mr-1 sm:mr-2 text-xs flex-shrink-0">Art. 34</Badge>
                    Gestion des Incidents de Sécurité
                  </h2>

                  <h3 className="text-base sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 md:mb-4 leading-tight">34.1 Détection et Réponse</h3>
                  <ul className="list-disc list-inside space-y-1.5 sm:space-y-2 mb-4 sm:mb-6 text-sm md:text-base ml-3 sm:ml-4 leading-relaxed">
                    <li><strong>Monitoring 24/7 :</strong> Surveillance continue des systèmes et alertes automatiques</li>
                    <li><strong>SIEM (Security Information and Event Management) :</strong> Analyse corrélée des logs de sécurité</li>
                    <li><strong>IDS/IPS :</strong> Détection et prévention d'intrusions</li>
                    <li><strong>Équipe d'intervention :</strong> Astreinte sécurité joignable en permanence</li>
                  </ul>

                  <h3 className="text-base sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 md:mb-4 leading-tight">34.2 Notification des Violations de Données</h3>
                  <p className="mb-3 sm:mb-4 text-sm md:text-base leading-relaxed">Conformément à l'art. 24 LPD et l'art. 33-34 RGPD, en cas de violation de données à caractère personnel présentant un risque pour les droits et libertés des utilisateurs :</p>
                  <ul className="list-disc list-inside space-y-1.5 sm:space-y-2 mb-4 sm:mb-6 text-sm md:text-base ml-3 sm:ml-4 leading-relaxed">
                    <li><strong>Notification au PFPDT :</strong> Sous 72h après découverte de l'incident</li>
                    <li><strong>Notification aux utilisateurs concernés :</strong> Sans délai indu si risque élevé</li>
                    <li><strong>Contenu :</strong> Nature de la violation, données affectées, mesures prises, coordonnées du DPO</li>
                    <li><strong>Documentation :</strong> Registre interne de tous les incidents (même sans obligation de notification)</li>
                  </ul>

                  <h3 className="text-base sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 md:mb-4 leading-tight">34.3 Obligations de l'Utilisateur</h3>
                  <p className="mb-3 sm:mb-4 text-sm md:text-base leading-relaxed">L'Utilisateur s'engage à :</p>
                  <ul className="list-disc list-inside space-y-1.5 sm:space-y-2 mb-4 sm:mb-6 text-sm md:text-base ml-3 sm:ml-4 leading-relaxed">
                    <li>Signaler immédiatement tout incident de sécurité constaté (tentative accès non autorisé, phishing, etc.)</li>
                    <li>Modifier immédiatement son mot de passe en cas de suspicion de compromission</li>
                    <li>Ne jamais communiquer ses identifiants à un tiers</li>
                    <li>Utiliser des connexions sécurisées (éviter WiFi publics non chiffrés)</li>
                  </ul>
                </CardContent>
              </Card>
            </section>

            <section id="article35" className="scroll-mt-20 sm:scroll-mt-24">
              <Card>
                <CardContent className="p-3 sm:p-6 md:p-8">
                  <h2 className="text-lg sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4 md:mb-6 leading-tight">
                    <Badge variant="secondary" className="mr-1 sm:mr-2 text-xs flex-shrink-0">Art. 35</Badge>
                    Audits et Certifications de Sécurité
                  </h2>

                  <h3 className="text-base sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 md:mb-4 leading-tight">35.1 Audits Internes</h3>
                  <ul className="list-disc list-inside space-y-1.5 sm:space-y-2 mb-4 sm:mb-6 text-sm md:text-base ml-3 sm:ml-4 leading-relaxed">
                    <li><strong>Audit technique trimestriel :</strong> Revue complète de l'infrastructure et du code</li>
                    <li><strong>Tests d'intrusion annuels :</strong> Pentest par société spécialisée externe</li>
                    <li><strong>Code review systématique :</strong> Toute modification code passée en revue par pairs</li>
                  </ul>

                  <h3 className="text-base sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 md:mb-4 leading-tight">35.2 Certifications Cibles</h3>
                  <p className="mb-3 sm:mb-4 text-sm md:text-base leading-relaxed">Hoomy vise l'obtention des certifications suivantes :</p>
                  <ul className="list-disc list-inside space-y-1.5 sm:space-y-2 mb-4 sm:mb-6 text-sm md:text-base ml-3 sm:ml-4 leading-relaxed">
                    <li><strong>ISO 27001 :</strong> Management de la sécurité de l'information (en cours)</li>
                    <li><strong>SOC 2 Type II :</strong> Contrôles de sécurité organisationnels (objectif 2026)</li>
                    <li><strong>ISO 27701 :</strong> Extension pour la gestion de la vie privée (objectif 2027)</li>
                  </ul>

                  <h3 className="text-base sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 md:mb-4 leading-tight">35.3 Programme de Bug Bounty</h3>
                  <p className="mb-4 sm:mb-6 text-sm md:text-base leading-relaxed">Hoomy envisage l'ouverture d'un programme de récompense pour chercheurs en sécurité (responsible disclosure) permettant à la communauté de signaler des vulnérabilités contre rémunération (CHF 100 à 5'000 selon criticité).</p>
                </CardContent>
              </Card>
            </section>

            {/* Articles 36-40 - Résiliation */}
            <section id="article36" className="scroll-mt-20 sm:scroll-mt-24">
              <Card>
                <CardContent className="p-3 sm:p-6 md:p-8">
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-6 flex items-center gap-2">
                    <FileSignature className="h-6 w-6 text-primary" />
                    <Badge variant="secondary" className="mr-1 sm:mr-2 text-xs flex-shrink-0">Art. 36</Badge>
                    Résiliation par l'Utilisateur
                  </h2>

                  <h3 className="text-base sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 md:mb-4 leading-tight">36.1 Résiliation Libre</h3>
                  <p className="mb-4 sm:mb-6 text-sm md:text-base leading-relaxed">L'Utilisateur peut résilier son compte à tout moment, sans motif, sans frais, sans préavis. Procédure : Via les paramètres du compte ("Supprimer mon compte") ou par email à <a href="mailto:contact@hoomy.site" className="text-primary hover:underline">contact@hoomy.site</a>. Confirmation par email avec lien de validation (sécurité anti-usurpation). Délai de rétractation de 14 jours (réactivation possible pendant ce délai).</p>

                  <h3 className="text-base sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 md:mb-4 leading-tight">36.2 Conditions de Résiliation</h3>
                  <p className="mb-3 sm:mb-4 text-sm md:text-base leading-relaxed"><strong>La résiliation n'est possible que si :</strong></p>
                  <ul className="list-disc list-inside space-y-1.5 sm:space-y-2 mb-4 sm:mb-6 text-sm md:text-base ml-3 sm:ml-4 leading-relaxed">
                    <li>Aucun bail actif n'est enregistré (ou bail terminé depuis &gt;30 jours)</li>
                    <li>Toutes les commissions dues sont intégralement payées</li>
                    <li>Aucune procédure de recouvrement en cours</li>
                    <li>Aucun litige pending avec Hoomy ou autre utilisateur</li>
                  </ul>
                  <p className="mb-4 sm:mb-6 text-sm md:text-base leading-relaxed">Si ces conditions ne sont pas remplies, le compte sera désactivé mais pas supprimé jusqu'à régularisation.</p>

                  <h3 className="text-base sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 md:mb-4 leading-tight">36.3 Portabilité Pré-Résiliation</h3>
                  <p className="mb-4 sm:mb-6 text-sm md:text-base leading-relaxed">Avant de résilier, l'utilisateur peut télécharger l'intégralité de ses données (format JSON/PDF) via l'interface dédiée. Disponibilité : 30 jours après demande de résiliation.</p>
                </CardContent>
              </Card>
            </section>

            <section id="article37" className="scroll-mt-20 sm:scroll-mt-24">
              <Card>
                <CardContent className="p-3 sm:p-6 md:p-8">
                  <h2 className="text-lg sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4 md:mb-6 leading-tight">
                    <Badge variant="secondary" className="mr-1 sm:mr-2 text-xs flex-shrink-0">Art. 37</Badge>
                    Résiliation par Hoomy
                  </h2>

                  <h3 className="text-base sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 md:mb-4 leading-tight">37.1 Résiliation pour Violation Grave</h3>
                  <p className="mb-3 sm:mb-4 text-sm md:text-base leading-relaxed">Hoomy peut résilier immédiatement et sans préavis le compte d'un Utilisateur en cas de :</p>
                  <ul className="list-disc list-inside space-y-1.5 sm:space-y-2 mb-4 sm:mb-6 text-sm md:text-base ml-3 sm:ml-4 leading-relaxed">
                    <li><strong>Contournement avéré</strong> de la commission (voir Article 7)</li>
                    <li><strong>Fraude</strong> documentée (faux documents, usurpation d'identité)</li>
                    <li><strong>Violation grave et répétée</strong> des CGU</li>
                    <li><strong>Comportement illégal</strong> (blanchiment, financement terrorisme, discrimination avérée)</li>
                    <li><strong>Activités préjudiciables</strong> à Hoomy ou autres utilisateurs (diffamation, harcèlement)</li>
                    <li><strong>Impayés persistants</strong> malgré relances (&gt;30 jours)</li>
                    <li><strong>Utilisation abusive</strong> (spam, scraping, attaques informatiques)</li>
                  </ul>

                  <h3 className="text-base sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 md:mb-4 leading-tight">37.2 Résiliation pour Motif Légitime</h3>
                  <p className="mb-3 sm:mb-4 text-sm md:text-base leading-relaxed">Hoomy peut résilier avec préavis de 30 jours en cas de :</p>
                  <ul className="list-disc list-inside space-y-1.5 sm:space-y-2 mb-4 sm:mb-6 text-sm md:text-base ml-3 sm:ml-4 leading-relaxed">
                    <li>Inactivité prolongée (&gt; 24 mois sans connexion)</li>
                    <li>Évolution stratégique nécessitant la fin du service à certains utilisateurs</li>
                    <li>Impossibilité légale ou réglementaire de continuer le service (sanctions, restrictions)</li>
                    <li>Cessation totale d'activité de Hoomy (liquidation)</li>
                  </ul>

                  <h3 className="text-base sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 md:mb-4 leading-tight">37.3 Notification de Résiliation</h3>
                  <p className="mb-4 sm:mb-6 text-sm md:text-base leading-relaxed">Notification par email recommandé avec accusé de réception. Indication des motifs (sauf si enquête pénale en cours). Droit de réponse de 15 jours (sauf résiliation immédiate pour faute grave). Possibilité de contester auprès du service réclamation.</p>
                </CardContent>
              </Card>
            </section>

            <section id="article38" className="scroll-mt-20 sm:scroll-mt-24">
              <Card>
                <CardContent className="p-3 sm:p-6 md:p-8">
                  <h2 className="text-lg sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4 md:mb-6 leading-tight">
                    <Badge variant="secondary" className="mr-1 sm:mr-2 text-xs flex-shrink-0">Art. 38</Badge>
                    Suspension Temporaire du Compte
                  </h2>

                  <h3 className="text-base sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 md:mb-4 leading-tight">38.1 Motifs de Suspension</h3>
                  <p className="mb-3 sm:mb-4 text-sm md:text-base leading-relaxed">Hoomy peut suspendre temporairement un compte (désactivation sans suppression) en cas de :</p>
                  <ul className="list-disc list-inside space-y-1.5 sm:space-y-2 mb-4 sm:mb-6 text-sm md:text-base ml-3 sm:ml-4 leading-relaxed">
                    <li><strong>Suspicion de fraude</strong> nécessitant enquête approfondie</li>
                    <li><strong>Documents KYC expirés</strong> ou nécessitant renouvellement</li>
                    <li><strong>Impayé ponctuel</strong> (avant résiliation définitive)</li>
                    <li><strong>Signalement fondé</strong> par autre utilisateur (investigation en cours)</li>
                    <li><strong>Activité suspecte</strong> détectée par les systèmes anti-fraude</li>
                    <li><strong>Demande d'autorité judiciaire</strong> ou administrative</li>
                  </ul>

                  <h3 className="text-base sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 md:mb-4 leading-tight">38.2 Effets de la Suspension</h3>
                  <ul className="list-disc list-inside space-y-1.5 sm:space-y-2 mb-4 sm:mb-6 text-sm md:text-base ml-3 sm:ml-4 leading-relaxed">
                    <li>Impossibilité de se connecter au compte</li>
                    <li>Annonces masquées temporairement</li>
                    <li>Communications en cours gelées</li>
                    <li>Données conservées intégralement</li>
                    <li>Obligations de paiement maintenues (commissions en cours)</li>
                  </ul>

                  <h3 className="text-base sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 md:mb-4 leading-tight">38.3 Levée de Suspension</h3>
                  <p className="mb-4 sm:mb-6 text-sm md:text-base leading-relaxed">Réactivation automatique dès régularisation de la situation (documents fournis, paiement effectué, enquête close). Notification par email de la réactivation. Si pas de régularisation sous 90 jours : transformation en résiliation définitive.</p>
                </CardContent>
              </Card>
            </section>

            <section id="article39" className="scroll-mt-20 sm:scroll-mt-24">
              <Card>
                <CardContent className="p-3 sm:p-6 md:p-8">
                  <h2 className="text-lg sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4 md:mb-6 leading-tight">
                    <Badge variant="secondary" className="mr-1 sm:mr-2 text-xs flex-shrink-0">Art. 39</Badge>
                    Conséquences de la Résiliation
                  </h2>

                  <h3 className="text-base sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 md:mb-4 leading-tight">39.1 Effets Immédiats</h3>
                  <ul className="list-disc list-inside space-y-1.5 sm:space-y-2 mb-4 sm:mb-6 text-sm md:text-base ml-3 sm:ml-4 leading-relaxed">
                    <li><strong>Suppression du compte :</strong> Accès définitivement révoqué</li>
                    <li><strong>Retrait des annonces :</strong> Désindexation immédiate de toutes les publications</li>
                    <li><strong>Interruption des services :</strong> Plus d'accès à la messagerie, aux fonctionnalités</li>
                    <li><strong>Arrêt de la facturation :</strong> Plus de nouvelles commissions (sauf celles déjà dues)</li>
                  </ul>

                  <h3 className="text-base sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 md:mb-4 leading-tight">39.2 Obligations Survivant à la Résiliation</h3>
                  <p className="mb-3 sm:mb-4 text-sm md:text-base leading-relaxed">Restent en vigueur après résiliation :</p>
                  <ul className="list-disc list-inside space-y-1.5 sm:space-y-2 mb-4 sm:mb-6 text-sm md:text-base ml-3 sm:ml-4 leading-relaxed">
                    <li><strong>Paiement des commissions dues :</strong> Pour les baux conclus avant résiliation, jusqu'à leur terme</li>
                    <li><strong>Clauses de confidentialité :</strong> Obligation permanente</li>
                    <li><strong>Clauses de propriété intellectuelle :</strong> Licence d'utilisation des contenus publiés</li>
                    <li><strong>Clauses d'indemnisation :</strong> Responsabilité pour actions antérieures</li>
                    <li><strong>Clauses de compétence juridictionnelle :</strong> Pour tout litige né pendant la durée du contrat</li>
                  </ul>

                  <h3 className="text-base sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 md:mb-4 leading-tight">39.3 Sort des Baux en Cours</h3>
                  <p className="mb-4 sm:mb-6 text-sm md:text-base leading-relaxed">La résiliation du compte Hoomy n'affecte pas les Contrats de Location conclus entre Étudiant et Propriétaire. Ces contrats continuent selon leurs propres termes. Les parties restent tenues de payer les commissions mensuelles jusqu'au terme du bail ou résiliation amiable (notification obligatoire à Hoomy).</p>

                  <div className="bg-destructive/10 border-l-4 border-destructive p-3 sm:p-4 rounded-lg">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
                      <div>
                        <strong className="block mb-2 text-destructive">IMPORTANT - Paiement Malgré Résiliation</strong>
                        <p className="text-sm md:text-base">
                          La fermeture du compte ne dispense PAS du paiement des commissions pour les baux actifs. Le prélèvement automatique continue ou, en cas d'impossibilité, Hoomy facturera directement avec application de pénalités de retard.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            <section id="article40" className="scroll-mt-20 sm:scroll-mt-24">
              <Card>
                <CardContent className="p-3 sm:p-6 md:p-8">
                  <h2 className="text-lg sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4 md:mb-6 leading-tight">
                    <Badge variant="secondary" className="mr-1 sm:mr-2 text-xs flex-shrink-0">Art. 40</Badge>
                    Conservation des Données Post-Résiliation
                  </h2>

                  <h3 className="text-base sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 md:mb-4 leading-tight">40.1 Durées de Conservation</h3>
                  <p className="mb-3 sm:mb-4 text-sm md:text-base leading-relaxed">Après résiliation du compte, les données sont conservées selon les durées légales suivantes :</p>
                  
                  <h4 className="text-lg md:text-xl font-semibold mb-3">Documents Comptables et Fiscaux</h4>
                  <ul className="list-disc list-inside space-y-1 mb-4 text-sm md:text-base ml-4">
                    <li><strong>Factures, justificatifs de commission :</strong> 10 ans (art. 958f CO)</li>
                    <li><strong>Documents bancaires :</strong> 10 ans</li>
                  </ul>

                  <h4 className="text-lg md:text-xl font-semibold mb-3">Documents d'Identification (KYC/AML)</h4>
                  <ul className="list-disc list-inside space-y-1 mb-4 text-sm md:text-base ml-4">
                    <li><strong>Pièces d'identité, documents KYC :</strong> 10 ans après fin de relation (LBA - Loi sur le blanchiment d'argent)</li>
                  </ul>

                  <h4 className="text-lg md:text-xl font-semibold mb-3">Données Contractuelles</h4>
                  <ul className="list-disc list-inside space-y-1 mb-4 text-sm md:text-base ml-4">
                    <li><strong>CGU acceptées, contrats :</strong> 10 ans (prescription ordinaire art. 127 CO)</li>
                    <li><strong>Historique commissions, baux :</strong> 10 ans</li>
                  </ul>

                  <h4 className="text-lg md:text-xl font-semibold mb-3">Données de Correspondance</h4>
                  <ul className="list-disc list-inside space-y-1 mb-4 text-sm md:text-base ml-4">
                    <li><strong>Messages, emails :</strong> 5 ans ou jusqu'à prescription contentieux éventuel</li>
                    <li><strong>Logs techniques, traces :</strong> 12 mois</li>
                  </ul>

                  <h4 className="text-lg md:text-xl font-semibold mb-3">Annonces et Contenus</h4>
                  <ul className="list-disc list-inside space-y-1 mb-6 text-sm md:text-base ml-4">
                    <li><strong>Photos, descriptions :</strong> Suppression après 90 jours (sauf licence marketing déjà accordée)</li>
                  </ul>

                  <h3 className="text-base sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 md:mb-4 leading-tight">40.2 Suppression Définitive</h3>
                  <p className="mb-4 sm:mb-6 text-sm md:text-base leading-relaxed">À l'expiration des délais légaux, suppression définitive et irréversible de toutes les données (y compris sauvegardes). Certificat de destruction disponible sur demande écrite.</p>

                  <h3 className="text-base sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 md:mb-4 leading-tight">40.3 Archivage Sécurisé</h3>
                  <p className="mb-4 sm:mb-6 text-sm md:text-base leading-relaxed">Les données conservées pour obligations légales sont archivées sur serveurs dédiés sécurisés. Accès strictement limité aux personnes habilitées (équipe légale/comptable). Chiffrement renforcé AES-256.</p>
                </CardContent>
              </Card>
            </section>

            {/* Articles 41-45 - Litiges et recours */}
            <section id="article41" className="scroll-mt-20 sm:scroll-mt-24">
              <Card>
                <CardContent className="p-3 sm:p-6 md:p-8">
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-6 flex items-center gap-2">
                    <Gavel className="h-6 w-6 text-primary" />
                    <Badge variant="secondary" className="mr-1 sm:mr-2 text-xs flex-shrink-0">Art. 41</Badge>
                    Service Réclamations et Support
                  </h2>

                  <h3 className="text-base sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 md:mb-4 leading-tight">41.1 Canaux de Contact</h3>
                  <p className="mb-3 sm:mb-4 text-sm md:text-base leading-relaxed">Pour toute réclamation, question ou demande d'assistance :</p>
                  <ul className="list-disc list-inside space-y-1.5 sm:space-y-2 mb-4 sm:mb-6 text-sm md:text-base ml-3 sm:ml-4 leading-relaxed">
                    <li><strong>Support général :</strong> <a href="mailto:contact@hoomy.site" className="text-primary hover:underline">contact@hoomy.site</a></li>
                    <li><strong>Réclamations formelles :</strong> <a href="mailto:contact@hoomy.site" className="text-primary hover:underline">contact@hoomy.site</a></li>
                    <li><strong>Questions juridiques :</strong> <a href="mailto:legal@hoomy.site" className="text-primary hover:underline">legal@hoomy.site</a></li>
                    <li><strong>Protection des données :</strong> <a href="mailto:legal@hoomy.site" className="text-primary hover:underline">legal@hoomy.site</a></li>
                    <li><strong>Téléphone :</strong> +41 79 896 58 50 (Dimitri) ou +41 78 238 28 68 (Marco) - Lun-Ven 9h-18h</li>
                    <li><strong>Courrier postal :</strong> Hoomy, Service Clientèle, Rue Saint-Maurice 12, 2525 Le Landeron, Neuchâtel, Suisse</li>
                  </ul>

                  <h3 className="text-base sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 md:mb-4 leading-tight">41.2 Délais de Traitement</h3>
                  <ul className="list-disc list-inside space-y-1.5 sm:space-y-2 mb-4 sm:mb-6 text-sm md:text-base ml-3 sm:ml-4 leading-relaxed">
                    <li><strong>Accusé de réception :</strong> Sous 24h ouvrables</li>
                    <li><strong>Réponse de fond :</strong> Sous 5 jours ouvrables (questions simples)</li>
                    <li><strong>Réclamations complexes :</strong> Sous 15 jours ouvrables</li>
                    <li><strong>Litiges nécessitant enquête :</strong> Sous 30 jours ouvrables</li>
                  </ul>

                  <h3 className="text-base sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 md:mb-4 leading-tight">41.3 Procédure de Réclamation Formelle</h3>
                  <ol className="list-decimal list-inside space-y-1.5 sm:space-y-2 mb-4 sm:mb-6 text-sm md:text-base ml-3 sm:ml-4 leading-relaxed">
                    <li><strong>Réclamation écrite :</strong> Description détaillée des faits, documents justificatifs, demande précise</li>
                    <li><strong>Accusé de réception :</strong> Email de confirmation avec numéro de dossier</li>
                    <li><strong>Investigation :</strong> Examen approfondi par équipe dédiée</li>
                    <li><strong>Réponse motivée :</strong> Position de Hoomy avec justifications</li>
                    <li><strong>Si insatisfaction :</strong> Possibilité de demander réexamen par manager</li>
                    <li><strong>Si désaccord persiste :</strong> Information sur procédures alternatives (médiation, arbitrage)</li>
                  </ol>
                </CardContent>
              </Card>
            </section>

            <section id="article42" className="scroll-mt-20 sm:scroll-mt-24">
              <Card>
                <CardContent className="p-3 sm:p-6 md:p-8">
                  <h2 className="text-lg sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4 md:mb-6 leading-tight">
                    <Badge variant="secondary" className="mr-1 sm:mr-2 text-xs flex-shrink-0">Art. 42</Badge>
                    Médiation Amiable et Modes Alternatifs de Résolution
                  </h2>

                  <h3 className="text-base sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 md:mb-4 leading-tight">42.1 Principe de Médiation Préalable</h3>
                  <p className="mb-4 sm:mb-6 text-sm md:text-base leading-relaxed">Avant toute action judiciaire, les parties s'engagent à tenter une résolution amiable du litige par la médiation. Durée : 60 jours calendaires maximum. Suspension des délais de prescription pendant la médiation. Confidentialité absolue des échanges (non utilisables devant un tribunal).</p>

                  <h3 className="text-base sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 md:mb-4 leading-tight">42.2 Organismes de Médiation</h3>
                  <p className="mb-3 sm:mb-4 text-sm md:text-base leading-relaxed">Médiation conduite par organisme agréé au choix des parties :</p>
                  <ul className="list-disc list-inside space-y-1.5 sm:space-y-2 mb-4 sm:mb-6 text-sm md:text-base ml-3 sm:ml-4 leading-relaxed">
                    <li><strong>Suisse :</strong> Fédération Suisse des Avocats (FSA) - Service de médiation</li>
                    <li><strong>Ou :</strong> Chambre de Commerce et d'Industrie du canton de Neuchâtel</li>
                    <li><strong>Ou :</strong> Tout médiateur accrédité FSM (Fédération Suisse des Associations de Médiation)</li>
                  </ul>

                  <h3 className="text-base sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 md:mb-4 leading-tight">42.3 Frais de Médiation</h3>
                  <ul className="list-disc list-inside space-y-1.5 sm:space-y-2 mb-4 sm:mb-6 text-sm md:text-base ml-3 sm:ml-4 leading-relaxed">
                    <li><strong>Montant litige &lt; CHF 5'000 :</strong> Prise en charge 100% par Hoomy</li>
                    <li><strong>Montant litige CHF 5'000 - 20'000 :</strong> Partage 50/50</li>
                    <li><strong>Montant &gt; CHF 20'000 :</strong> Chaque partie assume ses propres frais + 50% honoraires médiateur</li>
                  </ul>
                </CardContent>
              </Card>
            </section>

            <section id="article43" className="scroll-mt-20 sm:scroll-mt-24">
              <Card>
                <CardContent className="p-3 sm:p-6 md:p-8">
                  <h2 className="text-lg sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4 md:mb-6 leading-tight">
                    <Badge variant="secondary" className="mr-1 sm:mr-2 text-xs flex-shrink-0">Art. 43</Badge>
                    Clause d'Arbitrage Contractuel
                  </h2>

                  <h3 className="text-base sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 md:mb-4 leading-tight">43.1 Soumission à l'Arbitrage</h3>
                  <p className="mb-4 sm:mb-6 text-sm md:text-base leading-relaxed">Pour tout litige d'un montant supérieur à CHF 20'000.– résultant des présentes CGU ou en lien avec la Plateforme, les parties conviennent de soumettre le différend à un arbitrage institutionnel plutôt qu'aux tribunaux étatiques, sauf si l'utilisateur est un consommateur (personne physique) auquel cas cette clause est facultative pour lui.</p>

                  <h3 className="text-base sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 md:mb-4 leading-tight">43.2 Institution d'Arbitrage</h3>
                  <p className="mb-3 sm:mb-4 text-sm md:text-base leading-relaxed">Arbitrage administré par :</p>
                  <ul className="list-disc list-inside space-y-1.5 sm:space-y-2 mb-4 sm:mb-6 text-sm md:text-base ml-3 sm:ml-4 leading-relaxed">
                    <li><strong>Première instance :</strong> Chambre de Commerce et d'Industrie de Neuchâtel</li>
                    <li><strong>Alternative :</strong> Swiss Chambers' Arbitration Institution (SCAI) - Règlement suisse d'arbitrage international</li>
                  </ul>

                  <h3 className="text-base sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 md:mb-4 leading-tight">43.3 Modalités de l'Arbitrage</h3>
                  <ul className="list-disc list-inside space-y-1.5 sm:space-y-2 mb-4 sm:mb-6 text-sm md:text-base ml-3 sm:ml-4 leading-relaxed">
                    <li><strong>Siège de l'arbitrage :</strong> Neuchâtel, Suisse</li>
                    <li><strong>Langue de la procédure :</strong> Français</li>
                    <li><strong>Droit applicable au fond :</strong> Droit matériel suisse</li>
                    <li><strong>Nombre d'arbitres :</strong> 1 arbitre unique (si montant &lt; CHF 100'000), 3 arbitres (si montant ≥ CHF 100'000)</li>
                    <li><strong>Sentence :</strong> Définitive, non susceptible de recours (sauf cas très limités art. 190-192 LDIP)</li>
                  </ul>

                  <h3 className="text-base sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 md:mb-4 leading-tight">43.4 Exceptions à l'Arbitrage</h3>
                  <p className="mb-3 sm:mb-4 text-sm md:text-base leading-relaxed">Restent de la compétence des tribunaux étatiques :</p>
                  <ul className="list-disc list-inside space-y-1.5 sm:space-y-2 mb-4 sm:mb-6 text-sm md:text-base ml-3 sm:ml-4 leading-relaxed">
                    <li>Mesures provisionnelles urgentes (référés, séquestres)</li>
                    <li>Injonctions de payer (procédure de poursuite suisse)</li>
                    <li>Litiges de faible valeur (&lt; CHF 20'000) si l'utilisateur préfère le tribunal</li>
                  </ul>
                </CardContent>
              </Card>
            </section>

            <section id="article44" className="scroll-mt-20 sm:scroll-mt-24">
              <Card>
                <CardContent className="p-3 sm:p-6 md:p-8">
                  <h2 className="text-lg sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4 md:mb-6 leading-tight">
                    <Badge variant="secondary" className="mr-1 sm:mr-2 text-xs flex-shrink-0">Art. 44</Badge>
                    Compétence Juridictionnelle (Tribunaux Étatiques)
                  </h2>

                  <h3 className="text-base sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 md:mb-4 leading-tight">44.1 For Contractuel</h3>
                  <p className="mb-4 sm:mb-6 text-sm md:text-base leading-relaxed">À défaut d'arbitrage ou pour les cas exclus de l'arbitrage, les parties conviennent de la compétence exclusive des tribunaux du canton de Neuchâtel, Suisse, avec for au siège de Hoomy (district de Neuchâtel).</p>

                  <h3 className="text-base sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 md:mb-4 leading-tight">44.2 Exceptions pour Consommateurs</h3>
                  <p className="mb-3 sm:mb-4 text-sm md:text-base leading-relaxed">Si l'Utilisateur est qualifié de consommateur au sens de l'art. 32 LDIP (personne physique contractant hors activité professionnelle), il conserve le droit d'assigner Hoomy devant :</p>
                  <ul className="list-disc list-inside space-y-1.5 sm:space-y-2 mb-4 sm:mb-6 text-sm md:text-base ml-3 sm:ml-4 leading-relaxed">
                    <li>Les tribunaux de son domicile (protection du consommateur)</li>
                    <li>Ou les tribunaux de Neuchâtel</li>
                  </ul>
                  <p className="mb-4 sm:mb-6 text-sm md:text-base leading-relaxed">Hoomy ne peut assigner le consommateur que devant les tribunaux du domicile de celui-ci.</p>

                  <h3 className="text-base sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 md:mb-4 leading-tight">44.3 Reconnaissance et Exécution</h3>
                  <p className="mb-4 sm:mb-6 text-sm md:text-base leading-relaxed">Tout jugement rendu par les tribunaux compétents selon les présentes dispositions sera reconnu et exécuté conformément aux conventions internationales applicables (Convention de Lugano pour l'UE/AELE).</p>
                </CardContent>
              </Card>
            </section>

            <section id="article45" className="scroll-mt-20 sm:scroll-mt-24">
              <Card>
                <CardContent className="p-3 sm:p-6 md:p-8">
                  <h2 className="text-lg sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4 md:mb-6 leading-tight">
                    <Badge variant="secondary" className="mr-1 sm:mr-2 text-xs flex-shrink-0">Art. 45</Badge>
                    Droit Applicable et Conflits de Lois
                  </h2>

                  <h3 className="text-base sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 md:mb-4 leading-tight">45.1 Choix du Droit Applicable</h3>
                  <p className="mb-4 sm:mb-6 text-sm md:text-base leading-relaxed">Les présentes CGU et toute relation contractuelle entre Hoomy et l'Utilisateur sont régies par le <strong>droit matériel suisse</strong>, à l'exclusion des règles de conflit de lois et de la Convention de Vienne sur la vente internationale de marchandises (CVIM).</p>

                  <h3 className="text-base sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 md:mb-4 leading-tight">45.2 Lois Impératives Applicables</h3>
                  <p className="mb-3 sm:mb-4 text-sm md:text-base leading-relaxed">Ce choix de droit ne prive pas l'Utilisateur de la protection que lui assurent les dispositions impératives de :</p>
                  <ul className="list-disc list-inside space-y-1.5 sm:space-y-2 mb-4 sm:mb-6 text-sm md:text-base ml-3 sm:ml-4 leading-relaxed">
                    <li><strong>Protection du consommateur :</strong> Si applicable selon critères LDIP</li>
                    <li><strong>Protection des données :</strong> LPD suisse et RGPD (selon résidence utilisateur)</li>
                    <li><strong>Bail à loyer :</strong> Art. 253-274g CO (impératifs absolus)</li>
                    <li><strong>Protection contre concurrence déloyale :</strong> LCD suisse</li>
                  </ul>

                  <h3 className="text-base sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 md:mb-4 leading-tight">45.3 Interprétation</h3>
                  <p className="mb-4 sm:mb-6 text-sm md:text-base leading-relaxed">En cas d'ambiguïté ou de silence des présentes CGU, l'interprétation se fera conformément aux principes généraux du droit suisse des obligations et à la volonté présumée des parties. En cas de conflit irréconciliable, la version française des CGU prévaut sur toute traduction.</p>
                </CardContent>
              </Card>
            </section>

            {/* Articles 46-60 - Dispositions finales */}
            <section id="article46" className="scroll-mt-20 sm:scroll-mt-24">
              <Card>
                <CardContent className="p-3 sm:p-6 md:p-8">
                  <h2 className="text-lg sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4 md:mb-6 leading-tight">
                    <Badge variant="secondary" className="mr-1 sm:mr-2 text-xs flex-shrink-0">Art. 46</Badge>
                    Modification des Conditions Générales
                  </h2>

                  <h3 className="text-base sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 md:mb-4 leading-tight">46.1 Droit de Modification Unilatéral</h3>
                  <p className="mb-4 sm:mb-6 text-sm md:text-base leading-relaxed">Hoomy se réserve le droit de modifier à tout moment les présentes CGU pour des motifs légitimes, notamment : évolution réglementaire ou jurisprudentielle, amélioration du service et ajout de fonctionnalités, adaptation aux évolutions technologiques, correction d'erreurs ou imprécisions, optimisation de la sécurité.</p>

                  <h3 className="text-base sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 md:mb-4 leading-tight">46.2 Procédure de Notification</h3>
                  <ul className="list-disc list-inside space-y-1.5 sm:space-y-2 mb-4 sm:mb-6 text-sm md:text-base ml-3 sm:ml-4 leading-relaxed">
                    <li><strong>Modifications mineures :</strong> Notification par email 7 jours avant entrée en vigueur</li>
                    <li><strong>Modifications substantielles :</strong> Notification 30 jours avant + bannière visible sur la Plateforme</li>
                    <li><strong>Modifications imposées par la loi :</strong> Application immédiate avec notification a posteriori</li>
                  </ul>

                  <h3 className="text-base sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 md:mb-4 leading-tight">46.3 Acceptation des Modifications</h3>
                  <p className="mb-4 sm:mb-6 text-sm md:text-base leading-relaxed">L'Utilisateur dispose d'un délai (7 ou 30 jours selon cas) pour s'opposer aux modifications en résiliant son compte. À défaut d'opposition expresse, l'utilisation continue de la Plateforme vaut acceptation des nouvelles CGU. L'Utilisateur est invité à consulter régulièrement la version en vigueur (date de mise à jour affichée en haut de page).</p>

                  <h3 className="text-base sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 md:mb-4 leading-tight">46.4 Archivage des Versions</h3>
                  <p className="mb-4 sm:mb-6 text-sm md:text-base leading-relaxed">Hoomy conserve l'historique des versions successives des CGU pendant 10 ans. Accès aux versions antérieures sur demande écrite (nécessité de prouver quelle version était applicable à une date donnée).</p>
                </CardContent>
              </Card>
            </section>

            <section id="article47" className="scroll-mt-20 sm:scroll-mt-24">
              <Card>
                <CardContent className="p-3 sm:p-6 md:p-8">
                  <h2 className="text-lg sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4 md:mb-6 leading-tight">
                    <Badge variant="secondary" className="mr-1 sm:mr-2 text-xs flex-shrink-0">Art. 47</Badge>
                    Notifications et Communications Officielles
                  </h2>

                  <h3 className="text-base sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 md:mb-4 leading-tight">47.1 Modes de Notification</h3>
                  <p className="mb-3 sm:mb-4 text-sm md:text-base leading-relaxed">Les notifications officielles de Hoomy vers l'Utilisateur s'effectuent par :</p>
                  <ul className="list-disc list-inside space-y-1.5 sm:space-y-2 mb-4 sm:mb-6 text-sm md:text-base ml-3 sm:ml-4 leading-relaxed">
                    <li><strong>Email :</strong> À l'adresse renseignée dans le Compte (mode principal)</li>
                    <li><strong>Message interne :</strong> Via la messagerie de la Plateforme</li>
                    <li><strong>Notification push :</strong> Si l'Utilisateur a autorisé les notifications</li>
                    <li><strong>Courrier recommandé :</strong> Pour notifications juridiques importantes (mise en demeure, résiliation)</li>
                  </ul>

                  <h3 className="text-base sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 md:mb-4 leading-tight">47.2 Présomption de Réception</h3>
                  <p className="mb-3 sm:mb-4 text-sm md:text-base leading-relaxed">Sauf preuve contraire, les notifications sont réputées reçues :</p>
                  <ul className="list-disc list-inside space-y-1.5 sm:space-y-2 mb-4 sm:mb-6 text-sm md:text-base ml-3 sm:ml-4 leading-relaxed">
                    <li><strong>Email :</strong> 48 heures ouvrables après envoi</li>
                    <li><strong>Message interne :</strong> Dès première connexion après envoi (max 7 jours)</li>
                    <li><strong>Courrier recommandé :</strong> Date indiquée sur l'accusé de réception postal</li>
                  </ul>

                  <h3 className="text-base sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 md:mb-4 leading-tight">47.3 Obligation de Mise à Jour</h3>
                  <p className="mb-4 sm:mb-6 text-sm md:text-base leading-relaxed">L'Utilisateur s'engage à maintenir à jour son adresse email et ses coordonnées. Toute notification envoyée à l'adresse email enregistrée est réputée valablement effectuée, même si l'utilisateur n'a plus accès à cette adresse (responsabilité utilisateur de mettre à jour).</p>

                  <h3 className="text-base sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 md:mb-4 leading-tight">47.4 Notifications de l'Utilisateur vers Hoomy</h3>
                  <p className="mb-3 sm:mb-4 text-sm md:text-base leading-relaxed">Pour être valables, les notifications de l'Utilisateur vers Hoomy doivent être adressées par :</p>
                  <ul className="list-disc list-inside space-y-1.5 sm:space-y-2 mb-4 sm:mb-6 text-sm md:text-base ml-3 sm:ml-4 leading-relaxed">
                    <li><strong>Email recommandé :</strong> <a href="mailto:legal@hoomy.site" className="text-primary hover:underline">legal@hoomy.site</a> (avec confirmation de lecture)</li>
                    <li><strong>Courrier recommandé :</strong> Hoomy, Service Juridique, Rue Saint-Maurice 12, 2525 Le Landeron, Neuchâtel, Suisse</li>
                  </ul>
                </CardContent>
              </Card>
            </section>

            <section id="article48" className="scroll-mt-20 sm:scroll-mt-24">
              <Card>
                <CardContent className="p-3 sm:p-6 md:p-8">
                  <h2 className="text-lg sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4 md:mb-6 leading-tight">
                    <Badge variant="secondary" className="mr-1 sm:mr-2 text-xs flex-shrink-0">Art. 48</Badge>
                    Cession et Transfert du Contrat
                  </h2>

                  <h3 className="text-base sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 md:mb-4 leading-tight">48.1 Interdiction de Cession par l'Utilisateur</h3>
                  <p className="mb-4 sm:mb-6 text-sm md:text-base leading-relaxed">L'Utilisateur ne peut en aucun cas céder, transférer, sous-licencier ou transmettre ses droits et obligations découlant des présentes CGU à un tiers, sans l'accord écrit préalable de Hoomy. Toute cession effectuée en violation de cette clause est nulle et de nul effet.</p>

                  <h3 className="text-base sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 md:mb-4 leading-tight">48.2 Cession par Hoomy</h3>
                  <p className="mb-4 sm:mb-6 text-sm md:text-base leading-relaxed">Hoomy se réserve le droit de céder librement tout ou partie des droits et obligations découlant des présentes CGU, notamment en cas de : réorganisation interne, fusion, acquisition par une société tierce, cession du fonds de commerce, sous-traitance à des prestataires techniques. L'Utilisateur sera informé de toute cession impactant significativement ses droits, avec faculté de résiliation si changement de contrôle majeur affectant les garanties de protection des données.</p>

                  <h3 className="text-base sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 md:mb-4 leading-tight">48.3 Transfert des Données en Cas de Cession</h3>
                  <p className="mb-4 sm:mb-6 text-sm md:text-base leading-relaxed">En cas de cession de Hoomy, les données personnelles des Utilisateurs pourront être transférées au cessionnaire sous réserve : du maintien du même niveau de protection (garanties contractuelles), de notification préalable aux utilisateurs (30 jours min), du droit d'opposition et de suppression du compte avant transfert.</p>
                </CardContent>
              </Card>
            </section>

            <section id="article49" className="scroll-mt-20 sm:scroll-mt-24">
              <Card>
                <CardContent className="p-3 sm:p-6 md:p-8">
                  <h2 className="text-lg sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4 md:mb-6 leading-tight">
                    <Badge variant="secondary" className="mr-1 sm:mr-2 text-xs flex-shrink-0">Art. 49</Badge>
                    Nullité Partielle et Clause de Sauvegarde
                  </h2>

                  <h3 className="text-base sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 md:mb-4 leading-tight">49.1 Principe de Séparabilité</h3>
                  <p className="mb-4 sm:mb-6 text-sm md:text-base leading-relaxed">Si une ou plusieurs dispositions des présentes CGU sont jugées nulles, invalides, inopposables ou inapplicables par une juridiction ou autorité compétente, les autres dispositions conservent leur pleine force et effet. Les parties s'engagent à remplacer la clause nulle par une clause valide produisant des effets économiques et juridiques aussi proches que possible.</p>

                  <h3 className="text-base sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 md:mb-4 leading-tight">49.2 Adaptation Automatique</h3>
                  <p className="mb-4 sm:mb-6 text-sm md:text-base leading-relaxed">Si une disposition est annulée pour contravention à une loi impérative, elle sera automatiquement remplacée par la disposition légale impérative applicable, dans la mesure minimale nécessaire pour assurer la validité du contrat.</p>

                  <h3 className="text-base sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 md:mb-4 leading-tight">49.3 Notification de Nullité</h3>
                  <p className="mb-4 sm:mb-6 text-sm md:text-base leading-relaxed">En cas de décision judiciaire ou administrative déclarant nulle une clause des présentes, Hoomy notifiera les Utilisateurs de la modification résultante dans les 30 jours suivant la décision définitive.</p>
                </CardContent>
              </Card>
            </section>

            <section id="article50" className="scroll-mt-20 sm:scroll-mt-24">
              <Card>
                <CardContent className="p-3 sm:p-6 md:p-8">
                  <h2 className="text-lg sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4 md:mb-6 leading-tight">
                    <Badge variant="secondary" className="mr-1 sm:mr-2 text-xs flex-shrink-0">Art. 50</Badge>
                    Absence de Renonciation
                  </h2>

                  <h3 className="text-base sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 md:mb-4 leading-tight">50.1 Non-Renonciation aux Droits</h3>
                  <p className="mb-4 sm:mb-6 text-sm md:text-base leading-relaxed">Le fait pour Hoomy de ne pas exercer ou de retarder l'exercice d'un droit, d'une prérogative ou d'un recours prévu par les présentes CGU ne saurait être interprété comme une renonciation à ce droit. De même, l'exercice partiel d'un droit ne fait pas obstacle à l'exercice ultérieur complet de ce même droit ou d'autres droits.</p>

                  <h3 className="text-base sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 md:mb-4 leading-tight">50.2 Exemples Concrets</h3>
                  <ul className="list-disc list-inside space-y-1.5 sm:space-y-2 mb-4 sm:mb-6 text-sm md:text-base ml-3 sm:ml-4 leading-relaxed">
                    <li>Le fait d'accorder un délai supplémentaire de paiement une fois n'oblige pas Hoomy à le faire systématiquement</li>
                    <li>Ne pas réclamer immédiatement une pénalité ne signifie pas y renoncer définitivement</li>
                    <li>Tolérer temporairement une violation mineure n'empêche pas de sanctionner une violation future</li>
                  </ul>

                  <h3 className="text-base sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 md:mb-4 leading-tight">50.3 Renonciation Expresse Requise</h3>
                  <p className="mb-4 sm:mb-6 text-sm md:text-base leading-relaxed">Toute renonciation par Hoomy à un droit découlant des présentes CGU doit être expresse, écrite, datée et signée par un représentant dûment habilité de Hoomy pour être valable.</p>
                </CardContent>
              </Card>
            </section>

            <section id="article51" className="scroll-mt-20 sm:scroll-mt-24">
              <Card>
                <CardContent className="p-3 sm:p-6 md:p-8">
                  <h2 className="text-lg sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4 md:mb-6 leading-tight">
                    <Badge variant="secondary" className="mr-1 sm:mr-2 text-xs flex-shrink-0">Art. 51</Badge>
                    Intégralité de l'Accord (Entire Agreement)
                  </h2>

                  <h3 className="text-base sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 md:mb-4 leading-tight">51.1 Accord Complet</h3>
                  <p className="mb-4 sm:mb-6 text-sm md:text-base leading-relaxed">Les présentes Conditions Générales d'Utilisation, conjointement avec la Politique de Confidentialité et les éventuelles Conditions Particulières, constituent l'intégralité de l'accord entre Hoomy et l'Utilisateur concernant l'objet des présentes. Elles annulent et remplacent tous accords, arrangements, négociations, discussions, correspondances, propositions, engagements oraux ou écrits antérieurs relatifs au même objet.</p>

                  <h3 className="text-base sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 md:mb-4 leading-tight">51.2 Primauté sur Documents Marketing</h3>
                  <p className="mb-4 sm:mb-6 text-sm md:text-base leading-relaxed">Les documents de présentation, brochures, publicités, messages marketing, pages web promotionnelles ne constituent pas des engagements contractuels et n'ont qu'une valeur indicative. Seules les présentes CGU font foi en cas de contradiction.</p>

                  <h3 className="text-base sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 md:mb-4 leading-tight">51.3 Absence d'Accords Collatéraux</h3>
                  <p className="mb-4 sm:mb-6 text-sm md:text-base leading-relaxed">Aucun accord oral, aucune déclaration verbale d'un employé ou représentant de Hoomy ne peut modifier ou compléter les présentes CGU. Seuls les avenants écrits, datés et signés par les deux parties peuvent amender les CGU.</p>
                </CardContent>
              </Card>
            </section>

            <section id="article52" className="scroll-mt-20 sm:scroll-mt-24">
              <Card>
                <CardContent className="p-3 sm:p-6 md:p-8">
                  <h2 className="text-lg sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4 md:mb-6 leading-tight">
                    <Badge variant="secondary" className="mr-1 sm:mr-2 text-xs flex-shrink-0">Art. 52</Badge>
                    Langue et Interprétation du Contrat
                  </h2>

                  <h3 className="text-base sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 md:mb-4 leading-tight">52.1 Version Authentique</h3>
                  <p className="mb-4 sm:mb-6 text-sm md:text-base leading-relaxed">Les présentes CGU sont rédigées en langue française. Cette version française constitue la seule version authentique et contractuellement opposable. En cas de traduction en d'autres langues (allemand, italien, anglais), ces traductions n'ont qu'une valeur indicative et n'engagent pas Hoomy en cas de divergence d'interprétation.</p>

                  <h3 className="text-base sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 md:mb-4 leading-tight">52.2 Règles d'Interprétation</h3>
                  <p className="mb-3 sm:mb-4 text-sm md:text-base leading-relaxed">Les règles suivantes s'appliquent pour l'interprétation des présentes :</p>
                  <ul className="list-disc list-inside space-y-1.5 sm:space-y-2 mb-4 sm:mb-6 text-sm md:text-base ml-3 sm:ml-4 leading-relaxed">
                    <li><strong>Titres et sous-titres :</strong> Valeur purement indicative, ne peuvent être utilisés pour l'interprétation</li>
                    <li><strong>Exemples :</strong> Sont illustratifs et non exhaustifs (« notamment », « tel que » indiquent des listes non limitatives)</li>
                    <li><strong>Singulier/Pluriel :</strong> Le singulier inclut le pluriel et réciproquement sauf indication contraire</li>
                    <li><strong>Genres grammaticaux :</strong> Le masculin inclut le féminin et le neutre</li>
                    <li><strong>Références légales :</strong> Incluent leurs modifications et remplacements successifs</li>
                  </ul>

                  <h3 className="text-base sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 md:mb-4 leading-tight">52.3 Interprétation Contra Proferentem Exclue</h3>
                  <p className="mb-4 sm:mb-6 text-sm md:text-base leading-relaxed">Les parties conviennent d'exclure expressément l'application de la règle « contra proferentem » (interprétation contre le rédacteur en cas de doute). L'Utilisateur reconnaît avoir eu la possibilité de négocier les termes des CGU ou de refuser d'y adhérer.</p>
                </CardContent>
              </Card>
            </section>

            <section id="article53" className="scroll-mt-20 sm:scroll-mt-24">
              <Card>
                <CardContent className="p-3 sm:p-6 md:p-8">
                  <h2 className="text-lg sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4 md:mb-6 leading-tight">
                    <Badge variant="secondary" className="mr-1 sm:mr-2 text-xs flex-shrink-0">Art. 53</Badge>
                    Conservation et Archivage Électronique
                  </h2>

                  <h3 className="text-base sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 md:mb-4 leading-tight">53.1 Valeur Probante des Archives Électroniques</h3>
                  <p className="mb-4 sm:mb-6 text-sm md:text-base leading-relaxed">Conformément à l'article 14 CO, les parties conviennent que les enregistrements électroniques conservés dans les systèmes de Hoomy (logs, bases de données, emails, captures d'écran horodatées) constituent des preuves recevables et font foi jusqu'à preuve du contraire. Ces enregistrements ont la même valeur probante que des documents papier signés.</p>

                  <h3 className="text-base sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 md:mb-4 leading-tight">53.2 Éléments Archivés</h3>
                  <p className="mb-3 sm:mb-4 text-sm md:text-base leading-relaxed">Hoomy archive notamment :</p>
                  <ul className="list-disc list-inside space-y-1.5 sm:space-y-2 mb-4 sm:mb-6 text-sm md:text-base ml-3 sm:ml-4 leading-relaxed">
                    <li>Acceptation des CGU (date, heure, IP, case cochée)</li>
                    <li>Historique des modifications de compte</li>
                    <li>Messages échangés via la messagerie interne</li>
                    <li>Déclarations de conclusion de bail</li>
                    <li>Factures et justificatifs de paiement</li>
                    <li>Logs de connexion et d'activité</li>
                    <li>Réclamations et correspondances</li>
                  </ul>

                  <h3 className="text-base sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 md:mb-4 leading-tight">53.3 Consultation des Archives</h3>
                  <p className="mb-4 sm:mb-6 text-sm md:text-base leading-relaxed">L'Utilisateur peut à tout moment demander copie des archives le concernant (droit d'accès art. 25 LPD). Délai de fourniture : 30 jours ouvrables. En cas de litige, Hoomy fournira les extraits pertinents à l'autorité compétente.</p>

                  <h3 className="text-base sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 md:mb-4 leading-tight">53.4 Signature Électronique</h3>
                  <p className="mb-4 sm:mb-6 text-sm md:text-base leading-relaxed">L'acceptation des CGU par clic sur "J'accepte" vaut signature électronique au sens de la loi fédérale sur les services de certification (SCSE, RS 943.03). Cette signature électronique simple est reconnue comme preuve suffisante de consentement.</p>
                </CardContent>
              </Card>
            </section>

            <section id="article54" className="scroll-mt-20 sm:scroll-mt-24">
              <Card>
                <CardContent className="p-3 sm:p-6 md:p-8">
                  <h2 className="text-lg sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4 md:mb-6 leading-tight">
                    <Badge variant="secondary" className="mr-1 sm:mr-2 text-xs flex-shrink-0">Art. 54</Badge>
                    Conformité Réglementaire et Légale
                  </h2>

                  <h3 className="text-base sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 md:mb-4 leading-tight">54.1 Respect des Réglementations</h3>
                  <p className="mb-3 sm:mb-4 text-sm md:text-base leading-relaxed">Hoomy s'engage à respecter l'ensemble des réglementations applicables, notamment :</p>
                  <ul className="list-disc list-inside space-y-1.5 sm:space-y-2 mb-4 sm:mb-6 text-sm md:text-base ml-3 sm:ml-4 leading-relaxed">
                    <li><strong>Protection des données :</strong> LPD, RGPD</li>
                    <li><strong>Commerce électronique :</strong> LCE, LCD</li>
                    <li><strong>Lutte contre le blanchiment :</strong> LBA, Ordonnance FINMA</li>
                    <li><strong>Protection du consommateur :</strong> LCD, dispositions impératives du CO</li>
                    <li><strong>Fiscalité :</strong> TVA, impôts directs</li>
                  </ul>

                  <h3 className="text-base sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 md:mb-4 leading-tight">54.2 Obligations Fiscales des Utilisateurs</h3>
                  <p className="mb-3 sm:mb-4 text-sm md:text-base leading-relaxed">Les Utilisateurs reconnaissent être seuls responsables de leurs obligations fiscales :</p>
                  <ul className="list-disc list-inside space-y-1.5 sm:space-y-2 mb-4 sm:mb-6 text-sm md:text-base ml-3 sm:ml-4 leading-relaxed">
                    <li><strong>Propriétaires :</strong> Déclaration des revenus locatifs perçus</li>
                    <li><strong>Étudiants :</strong> Déclaration des avantages fiscaux éventuels (déduction loyer si applicable)</li>
                    <li>Hoomy peut fournir des attestations fiscales sur demande (récapitulatif annuel des commissions payées)</li>
                  </ul>

                  <h3 className="text-base sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 md:mb-4 leading-tight">54.3 Coopération avec Autorités</h3>
                  <p className="mb-4 sm:mb-6 text-sm md:text-base leading-relaxed">Hoomy coopère avec les autorités judiciaires, administratives et fiscales suisses dans le respect de la loi. En cas de réquisition légale (ordonnance de perquisition, commission rogatoire, demande FINMA), Hoomy communiquera les données requises conformément aux procédures légales.</p>
                </CardContent>
              </Card>
            </section>

            <section id="article55" className="scroll-mt-20 sm:scroll-mt-24">
              <Card>
                <CardContent className="p-3 sm:p-6 md:p-8">
                  <h2 className="text-lg sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4 md:mb-6 leading-tight">
                    <Badge variant="secondary" className="mr-1 sm:mr-2 text-xs flex-shrink-0">Art. 55</Badge>
                    Audits et Contrôles de Conformité
                  </h2>

                  <h3 className="text-base sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 md:mb-4 leading-tight">55.1 Audits Internes Réguliers</h3>
                  <p className="mb-3 sm:mb-4 text-sm md:text-base leading-relaxed">Hoomy effectue régulièrement des audits internes de conformité :</p>
                  <ul className="list-disc list-inside space-y-1.5 sm:space-y-2 mb-4 sm:mb-6 text-sm md:text-base ml-3 sm:ml-4 leading-relaxed">
                    <li><strong>Audit protection des données :</strong> Semestriel (DPIA - Data Protection Impact Assessment)</li>
                    <li><strong>Audit sécurité informatique :</strong> Trimestriel</li>
                    <li><strong>Audit légal :</strong> Annuel (conformité CGU, contrats, licences)</li>
                    <li><strong>Audit financier :</strong> Annuel (comptes, TVA, fiscalité)</li>
                  </ul>

                  <h3 className="text-base sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 md:mb-4 leading-tight">55.2 Droit d'Audit par Autorités</h3>
                  <p className="mb-4 sm:mb-6 text-sm md:text-base leading-relaxed">Hoomy accepte et facilite les audits par : Préposé fédéral à la protection des données (PFPDT), Autorités fiscales cantonales et fédérales, FINMA (si applicable), Autorités européennes (CNIL, etc.) pour utilisateurs UE. Délai de préavis minimum : 10 jours ouvrables (sauf urgence ou perquisition).</p>

                  <h3 className="text-base sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 md:mb-4 leading-tight">55.3 Contrôles par Utilisateurs Professionnels</h3>
                  <p className="mb-4 sm:mb-6 text-sm md:text-base leading-relaxed">Les Propriétaires professionnels ou institutionnels (gérances, investisseurs) utilisant la Plateforme pour plus de 10 logements peuvent demander un audit de conformité de leurs données (sous réserve acceptation et tarification spéciale).</p>
                </CardContent>
              </Card>
            </section>

            <section id="article56" className="scroll-mt-20 sm:scroll-mt-24">
              <Card>
                <CardContent className="p-3 sm:p-6 md:p-8">
                  <h2 className="text-lg sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4 md:mb-6 leading-tight">
                    <Badge variant="secondary" className="mr-1 sm:mr-2 text-xs flex-shrink-0">Art. 56</Badge>
                    Lutte contre le Blanchiment d'Argent et Financement du Terrorisme
                  </h2>

                  <h3 className="text-base sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 md:mb-4 leading-tight">56.1 Obligations LBA</h3>
                  <p className="mb-4 sm:mb-6 text-sm md:text-base leading-relaxed">Bien que Hoomy ne soit pas directement soumis à la Loi sur le blanchiment d'argent (LBA), elle applique volontairement les bonnes pratiques en matière de KYC (Know Your Customer) et de vigilance client pour prévenir toute utilisation abusive de la Plateforme à des fins de blanchiment d'argent ou de financement du terrorisme.</p>

                  <h3 className="text-base sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 md:mb-4 leading-tight">56.2 Mesures de Vigilance</h3>
                  <ul className="list-disc list-inside space-y-1.5 sm:space-y-2 mb-4 sm:mb-6 text-sm md:text-base ml-3 sm:ml-4 leading-relaxed">
                    <li>Vérification systématique de l'identité (KYC obligatoire pour tous)</li>
                    <li>Détection des transactions suspectes ou anormales</li>
                    <li>Contrôle des listes de sanctions internationales (OFAC, ONU, UE)</li>
                    <li>Monitoring des flux financiers inhabituels</li>
                    <li>Formation du personnel aux signaux d'alerte</li>
                  </ul>

                  <h3 className="text-base sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 md:mb-4 leading-tight">56.3 Signalement d'Activités Suspectes</h3>
                  <p className="mb-4 sm:mb-6 text-sm md:text-base leading-relaxed">En cas de suspicion sérieuse de blanchiment ou financement terrorisme, Hoomy se réserve le droit de : suspendre immédiatement le compte concerné, bloquer les transactions, signaler aux autorités compétentes (MROS - Bureau de communication en matière de blanchiment d'argent), refuser la poursuite de la relation contractuelle.</p>
                </CardContent>
              </Card>
            </section>

            <section id="article57" className="scroll-mt-20 sm:scroll-mt-24">
              <Card>
                <CardContent className="p-3 sm:p-6 md:p-8">
                  <h2 className="text-lg sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4 md:mb-6 leading-tight">
                    <Badge variant="secondary" className="mr-1 sm:mr-2 text-xs flex-shrink-0">Art. 57</Badge>
                    Sanctions Internationales et Restrictions Export
                  </h2>

                  <h3 className="text-base sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 md:mb-4 leading-tight">57.1 Respect des Sanctions</h3>
                  <p className="mb-4 sm:mb-6 text-sm md:text-base leading-relaxed">Hoomy respecte les sanctions internationales édictées par : le Conseil de sécurité des Nations Unies, le Conseil fédéral suisse (Ordonnances sur les sanctions), l'Union Européenne. Les services de Hoomy ne sont pas disponibles pour les personnes ou entités figurant sur les listes de sanctions (individus, entreprises, pays embargés).</p>

                  <h3 className="text-base sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 md:mb-4 leading-tight">57.2 Vérifications Automatiques</h3>
                  <p className="mb-4 sm:mb-6 text-sm md:text-base leading-relaxed">Lors de l'inscription, Hoomy vérifie automatiquement que l'Utilisateur ne figure pas sur les listes suivantes : OFAC SDN List (USA), EU Consolidated List, Swiss SECO Sanctions List, Listes terroristes ONU. Refus automatique d'inscription en cas de correspondance positive (« hit »).</p>

                  <h3 className="text-base sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 md:mb-4 leading-tight">57.3 Déclaration de l'Utilisateur</h3>
                  <p className="mb-3 sm:mb-4 text-sm md:text-base leading-relaxed">L'Utilisateur déclare et garantit :</p>
                  <ul className="list-disc list-inside space-y-1.5 sm:space-y-2 mb-4 sm:mb-6 text-sm md:text-base ml-3 sm:ml-4 leading-relaxed">
                    <li>Ne pas figurer sur une liste de sanctions ou embargos</li>
                    <li>Ne pas être une Personne Politiquement Exposée (PPE) sauf déclaration préalable</li>
                    <li>Ne pas agir pour le compte d'une entité sanctionnée</li>
                    <li>Ne pas utiliser la Plateforme à des fins de contournement de sanctions</li>
                  </ul>
                </CardContent>
              </Card>
            </section>

            <section id="article58" className="scroll-mt-20 sm:scroll-mt-24">
              <Card>
                <CardContent className="p-3 sm:p-6 md:p-8">
                  <h2 className="text-lg sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4 md:mb-6 leading-tight">
                    <Badge variant="secondary" className="mr-1 sm:mr-2 text-xs flex-shrink-0">Art. 58</Badge>
                    Accessibilité Numérique
                  </h2>

                  <h3 className="text-base sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 md:mb-4 leading-tight">58.1 Engagement Accessibilité</h3>
                  <p className="mb-4 sm:mb-6 text-sm md:text-base leading-relaxed">Hoomy s'engage à rendre la Plateforme accessible au plus grand nombre, y compris les personnes en situation de handicap, dans la mesure du raisonnable et techniquement possible. Objectif de conformité : WCAG 2.1 niveau AA (Web Content Accessibility Guidelines) d'ici 2027.</p>

                  <h3 className="text-base sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 md:mb-4 leading-tight">58.2 Fonctionnalités d'Accessibilité</h3>
                  <ul className="list-disc list-inside space-y-1.5 sm:space-y-2 mb-4 sm:mb-6 text-sm md:text-base ml-3 sm:ml-4 leading-relaxed">
                    <li>Navigation au clavier complète (tabulation, raccourcis)</li>
                    <li>Compatibilité avec lecteurs d'écran (NVDA, JAWS, VoiceOver)</li>
                    <li>Contraste suffisant des couleurs (minimum ratio 4.5:1)</li>
                    <li>Possibilité d'agrandir le texte sans perte de fonctionnalité</li>
                    <li>Textes alternatifs pour toutes les images informatives</li>
                    <li>Sous-titres pour contenus vidéo (si applicable)</li>
                  </ul>

                  <h3 className="text-base sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 md:mb-4 leading-tight">58.3 Signalement de Problèmes</h3>
                  <p className="mb-4 sm:mb-6 text-sm md:text-base leading-relaxed">Les utilisateurs rencontrant des difficultés d'accessibilité peuvent les signaler à <a href="mailto:contact@hoomy.site" className="text-primary hover:underline">contact@hoomy.site</a>. Engagement de réponse sous 5 jours ouvrables et correction sous 30 jours si techniquement réalisable.</p>
                </CardContent>
              </Card>
            </section>

            <section id="article59" className="scroll-mt-20 sm:scroll-mt-24">
              <Card>
                <CardContent className="p-3 sm:p-6 md:p-8">
                  <h2 className="text-lg sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4 md:mb-6 leading-tight">
                    <Badge variant="secondary" className="mr-1 sm:mr-2 text-xs flex-shrink-0">Art. 59</Badge>
                    Responsabilité Sociétale et Développement Durable
                  </h2>

                  <h3 className="text-base sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 md:mb-4 leading-tight">59.1 Engagement Écologique</h3>
                  <p className="mb-3 sm:mb-4 text-sm md:text-base leading-relaxed">Hoomy s'engage dans une démarche de réduction de son empreinte environnementale :</p>
                  <ul className="list-disc list-inside space-y-1.5 sm:space-y-2 mb-4 sm:mb-6 text-sm md:text-base ml-3 sm:ml-4 leading-relaxed">
                    <li>Hébergement dans datacenters alimentés en énergie renouvelable (objectif 100% d'ici 2026)</li>
                    <li>Optimisation du code pour réduire consommation énergétique (Green IT)</li>
                    <li>Politique « zéro papier » (communications 100% électroniques)</li>
                    <li>Compensation carbone des serveurs (partenariat avec fondations climat)</li>
                  </ul>

                  <h3 className="text-base sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 md:mb-4 leading-tight">59.2 Impact Social Positif</h3>
                  <p className="mb-3 sm:mb-4 text-sm md:text-base leading-relaxed">Hoomy contribue à :</p>
                  <ul className="list-disc list-inside space-y-1.5 sm:space-y-2 mb-4 sm:mb-6 text-sm md:text-base ml-3 sm:ml-4 leading-relaxed">
                    <li>Faciliter l'accès au logement pour les étudiants (mission sociale)</li>
                    <li>Lutter contre les discriminations au logement (modération stricte des annonces discriminatoires)</li>
                    <li>Soutenir l'économie locale (mise en relation locale, pas de grands groupes internationaux)</li>
                    <li>Transparence des prix (loyers affichés clairement, pas de frais cachés)</li>
                  </ul>

                  <h3 className="text-base sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 md:mb-4 leading-tight">59.3 Éthique et Gouvernance</h3>
                  <p className="mb-3 sm:mb-4 text-sm md:text-base leading-relaxed">Hoomy adhère aux principes suivants :</p>
                  <ul className="list-disc list-inside space-y-1.5 sm:space-y-2 mb-4 sm:mb-6 text-sm md:text-base ml-3 sm:ml-4 leading-relaxed">
                    <li>Transparence financière et fiscale</li>
                    <li>Lutte contre la corruption (politique anti-corruption)</li>
                    <li>Respect des droits humains dans la chaîne de valeur</li>
                    <li>Dialogue avec parties prenantes (utilisateurs, autorités, société civile)</li>
                  </ul>
                </CardContent>
              </Card>
            </section>

            {/* Article 60 - Final */}
            <section id="article60" className="scroll-mt-20 sm:scroll-mt-24">
              <Card>
                <CardContent className="p-3 sm:p-6 md:p-8">
                  <h2 className="text-lg sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4 md:mb-6 leading-tight">
                    <Badge variant="secondary" className="mr-1 sm:mr-2 text-xs flex-shrink-0">Art. 60</Badge>
                    Entrée en Vigueur et Acceptation Finale
                  </h2>

                  <h3 className="text-base sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 md:mb-4 leading-tight">60.1 Date d'Entrée en Vigueur</h3>
                  <p className="mb-4 sm:mb-6 text-sm md:text-base leading-relaxed">Les présentes Conditions Générales d'Utilisation, dans leur version actuelle (version 3.0 exhaustive), entrent en vigueur le <strong>25 novembre 2025 à 00h00 UTC+1</strong> et demeurent applicables jusqu'à leur remplacement éventuel par une version ultérieure conformément à l'Article 46.</p>

                  <h3 className="text-base sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 md:mb-4 leading-tight">60.2 Modalités d'Acceptation</h3>
                  <p className="mb-3 sm:mb-4 text-sm md:text-base leading-relaxed">L'acceptation des présentes CGU s'effectue selon l'une des modalités suivantes :</p>
                  <ul className="list-disc list-inside space-y-1.5 sm:space-y-2 mb-4 sm:mb-6 text-sm md:text-base ml-3 sm:ml-4 leading-relaxed">
                    <li><strong>Acceptation expresse initiale :</strong> Clic sur la case "J'ai lu, compris et j'accepte les CGU" lors de l'inscription</li>
                    <li><strong>Acceptation tacite (utilisateurs existants) :</strong> Utilisation continue de la Plateforme après notification de la nouvelle version</li>
                    <li><strong>Acceptation par action concluante :</strong> Réalisation d'une Mise en Relation, publication d'annonce, paiement de Commission</li>
                  </ul>

                  <div className="bg-primary/10 border-l-4 border-primary p-3 sm:p-4 md:p-6 rounded-lg mb-4 sm:mb-6">
                    <h3 className="text-base sm:text-xl md:text-2xl font-bold mb-3 sm:mb-4 flex items-center gap-2 flex-wrap">
                      <FileSignature className="h-6 w-6 text-primary" />
                      CLAUSE D'ACCEPTATION SOLENNELLE FINALE
                    </h3>
                    <p className="mb-4 text-sm md:text-base font-semibold">
                      En créant un Compte sur la Plateforme Hoomy, en naviguant sur le site, en publiant une annonce, en envoyant une demande de Mise en Relation, en payant une Commission, ou en accomplissant toute action sur la Plateforme, VOUS RECONNAISSEZ EXPRESSÉMENT, SOLENNELLEMENT ET IRRÉVOCABLEMENT :
                    </p>
                    <ul className="list-disc list-inside space-y-3 mb-4 text-sm md:text-base ml-4">
                      <li><strong>Avoir lu l'intégralité</strong> des présentes Conditions Générales d'Utilisation (60 articles, environ 45'000 mots)</li>
                      <li><strong>En avoir parfaitement compris</strong> la portée juridique, les conséquences financières, et les obligations qui en découlent</li>
                      <li><strong>Les accepter de manière pleine, entière, inconditionnelle et irrévocable</strong>, sans réserve d'aucune sorte</li>
                      <li><strong>Avoir été dûment informé</strong> de l'ensemble de vos droits, obligations, garanties, limitations de responsabilité et recours</li>
                      <li><strong>Avoir eu la possibilité</strong> de consulter un conseil juridique indépendant avant acceptation</li>
                      <li><strong>Avoir eu le temps suffisant</strong> pour examiner le document et poser toutes questions nécessaires</li>
                      <li><strong>Renoncer expressément</strong> à invoquer ultérieurement toute clause abusive, déséquilibrée ou contraire à vos intérêts, dans les limites autorisées par le droit impératif suisse</li>
                      <li><strong>Accepter la juridiction</strong> des tribunaux suisses et l'application du droit suisse comme spécifié aux Articles 44 et 45</li>
                    </ul>
                    <p className="text-sm md:text-base font-semibold mb-4">
                      Cette acceptation vaut <strong>signature électronique</strong> au sens de l'article 14 du Code des Obligations suisse et de la Loi fédérale sur les services de certification dans le domaine de la signature électronique (SCSE, RS 943.03).
                    </p>
                    <p className="text-sm md:text-base font-semibold text-primary">
                      L'acceptation est horodatée, enregistrée de manière infalsifiable, et conservée pendant 10 ans à des fins de preuve conformément à l'Article 53.
                    </p>
                  </div>

                  <h3 className="text-base sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 md:mb-4 leading-tight">60.3 Force Obligatoire</h3>
                  <p className="mb-4 sm:mb-6 text-sm md:text-base leading-relaxed">Les présentes CGU constituent un contrat juridiquement contraignant entre Hoomy et l'Utilisateur, opposable en justice et exécutoire conformément au droit suisse. Tout manquement aux obligations contractuelles expose l'Utilisateur aux sanctions prévues (résiliation, pénalités, dommages-intérêts, poursuites judiciaires).</p>

                  <div className="bg-destructive/10 border-l-4 border-destructive p-6 rounded-lg">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-6 w-6 text-destructive mt-0.5 flex-shrink-0" />
                      <div>
                        <strong className="block mb-3 text-destructive text-lg">AVERTISSEMENT FINAL - PORTÉE JURIDIQUE IMPORTANTE</strong>
                        <p className="text-sm md:text-base mb-3">
                          Les présentes Conditions Générales d'Utilisation comportent des clauses importantes limitant la responsabilité de Hoomy, imposant des obligations financières récurrentes (commission mensuelle), prévoyant des pénalités en cas de manquement, et définissant des procédures de résolution des litiges (médiation, arbitrage, juridiction).
                        </p>
                        <p className="text-sm md:text-base mb-3">
                          <strong>Il est IMPÉRATIF de lire attentivement l'intégralité du document avant d'accepter.</strong> En cas de doute ou d'incompréhension, nous vous recommandons vivement de consulter un avocat spécialisé en droit du numérique et de la consommation.
                        </p>
                    <p className="text-sm md:text-base font-semibold">
                          Une fois acceptées, ces CGU vous engagent juridiquement. Toute violation peut entraîner des conséquences financières et juridiques graves, y compris des poursuites judiciaires et l'inscription à des registres de débiteurs.
                    </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Informations Légales Complètes */}
            <section className="scroll-mt-20 sm:scroll-mt-24">
              <Card>
                <CardContent className="p-3 sm:p-6 md:p-8">
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-6 md:mb-8 flex items-center gap-2 sm:gap-3">
                    <Scale className="h-8 w-8 text-primary flex-shrink-0" />
                    Informations Légales Complètes
                  </h2>

                  <div className="bg-gradient-to-br from-muted/50 to-muted border-l-4 border-primary p-6 md:p-8 rounded-lg space-y-5 text-sm md:text-base shadow-sm">
                    <div className="pb-4 border-b border-border">
                      <strong className="text-lg text-primary">Dénomination Sociale :</strong>
                      <p className="mt-1">Hoomy - Plateforme de Mise en Relation Immobilière Étudiante</p>
                    </div>
                    
                    <div className="pb-4 border-b border-border">
                      <strong className="text-lg text-primary">Forme Juridique :</strong>
                      <p className="mt-1">Entreprise individuelle en cours de structuration juridique</p>
                      <p className="text-xs text-muted-foreground mt-1">(Transformation prévue en Sàrl ou SA selon développement)</p>
                    </div>
                    
                    <div className="pb-4 border-b border-border">
                      <strong className="text-lg text-primary">Siège Social :</strong>
                      <p className="mt-1">Rue Saint-Maurice 12, 2525 Le Landeron, Canton de Neuchâtel, Suisse</p>
                      <p className="text-xs text-muted-foreground mt-1">(Pas de bureaux physiques actuellement - opérations 100% digitales)</p>
                    </div>
                    
                    <div className="pb-4 border-b border-border">
                      <strong className="text-lg text-primary">Direction et Représentation Légale :</strong>
                      <div className="mt-3 ml-4 space-y-4">
                        <div className="bg-background/50 p-4 rounded-lg">
                          <p className="font-semibold">CEO et Fondateur Principal :</p>
                          <p className="mt-2">Blanchard Dimitri</p>
                          <p className="text-sm">Adresse : Rue Saint-Maurice 12, 2525 Le Landeron, Neuchâtel, Suisse</p>
                          <p className="text-sm">Date de naissance : 24 août 2008 (17 ans)</p>
                          <p className="text-sm">Téléphone : +41 79 896 58 50</p>
                          <p className="text-sm text-amber-600 font-medium flex items-center gap-1"><Scale className="h-3 w-3 inline" /> Représentant légal : Yves Blanchard (père, autorité parentale)</p>
                          <p className="text-xs text-muted-foreground mt-2">En tant que mineur, agit avec autorisation et supervision du représentant légal conformément aux art. 19-20 CC</p>
                    </div>
                        
                        <div className="bg-background/50 p-4 rounded-lg">
                          <p className="font-semibold">Co-Fondateur et Directeur Stratégique :</p>
                          <p className="mt-2">Menn Marco</p>
                          <p className="text-sm">Adresse : Rue Saint-Maurice 12, 2525 Le Landeron, Neuchâtel, Suisse</p>
                          <p className="text-sm">Date de naissance : 30 mars 2009 (16 ans)</p>
                          <p className="text-sm">Téléphone : +41 78 238 28 68</p>
                          <p className="text-sm text-amber-600 font-medium flex items-center gap-1"><Scale className="h-3 w-3 inline" /> Représentante légale : Barbara Carchedi Menn (mère, autorité parentale)</p>
                          <p className="text-xs text-muted-foreground mt-2">En tant que mineur, agit avec autorisation et supervision de la représentante légale conformément aux art. 19-20 CC</p>
                    </div>
                    </div>
                    </div>
                    
                    <div className="pb-4 border-b border-border">
                      <strong className="text-lg text-primary">Immatriculation au Registre du Commerce :</strong>
                      <p className="mt-1"><span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">NON REQUIS</span></p>
                      <p className="text-xs text-muted-foreground mt-1">En tant qu'entreprise individuelle avec chiffre d'affaires &lt; CHF 100'000/an, l'inscription au RC est facultative (art. 36 ORC)</p>
                      <p className="text-xs text-muted-foreground mt-1">Inscription obligatoire si le seuil de CHF 100'000 est dépassé</p>
                    </div>
                    
                    <div className="pb-4 border-b border-border">
                      <strong className="text-lg text-primary">Numéro d'Identification des Entreprises (IDE) :</strong>
                      <p className="mt-1"><span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">NON ATTRIBUÉ</span></p>
                      <p className="text-xs text-muted-foreground mt-1">Le numéro IDE n'est attribué qu'aux entreprises inscrites au Registre du Commerce</p>
                      <p className="text-xs text-muted-foreground mt-1">Attribution automatique en cas d'inscription future au RC</p>
                    </div>
                    
                    <div className="pb-4 border-b border-border">
                      <strong className="text-lg text-primary">Numéro TVA (Taxe sur la Valeur Ajoutée) :</strong>
                      <p className="mt-1"><span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">NON ASSUJETTI</span></p>
                      <p className="text-xs text-muted-foreground mt-1">Assujettissement obligatoire à la TVA uniquement à partir de CHF 100'000 de chiffre d'affaires annuel (art. 10 LTVA)</p>
                      <p className="text-xs text-muted-foreground mt-1">Inscription volontaire possible dès CHF 0.– si justification économique</p>
                    </div>
                    
                    <div className="pb-4 border-b border-border">
                      <strong className="text-lg text-primary">Hébergement Technique :</strong>
                      <p className="mt-1">Infrastructure distribuée internationale</p>
                      <p className="text-sm mt-1"><strong>Backend (API, Base de données) :</strong> DigitalOcean LLC - Datacenters Europe (Allemagne/Pays-Bas)</p>
                      <p className="text-sm mt-1"><strong>Frontend (Interface utilisateur) :</strong> GitHub Pages - Microsoft Corporation (CDN mondial)</p>
                      <p className="text-xs text-muted-foreground mt-1">Code source frontend : Open source, hébergé publiquement sur GitHub</p>
                      <p className="text-xs text-muted-foreground mt-1">Conformité : RGPD (datacenters UE), certifications SOC 2, ISO 27001</p>
                    </div>

                    <div className="pb-4 border-b border-border">
                      <strong className="text-lg text-primary">Contact et Coordonnées Officielles :</strong>
                      <div className="mt-3 space-y-2 ml-4">
                        <p className="flex items-center gap-2"><Mail className="h-4 w-4 text-primary flex-shrink-0" /><strong>Email principal & Support client :</strong> <a href="mailto:contact@hoomy.site" className="text-primary hover:underline font-medium">contact@hoomy.site</a></p>
                        <p className="flex items-center gap-2"><Scale className="h-4 w-4 text-primary flex-shrink-0" /><strong>Email juridique :</strong> <a href="mailto:legal@hoomy.site" className="text-primary hover:underline font-medium">legal@hoomy.site</a></p>
                        <p className="flex items-center gap-2"><Shield className="h-4 w-4 text-primary flex-shrink-0" /><strong>Protection des données (DPO) :</strong> <a href="mailto:legal@hoomy.site" className="text-primary hover:underline font-medium">legal@hoomy.site</a></p>
                        <p className="flex items-center gap-2"><Bot className="h-4 w-4 text-primary flex-shrink-0" /><strong>Email automatique (no-reply) :</strong> <a href="mailto:noreply@hoomy.site" className="text-primary hover:underline font-medium">noreply@hoomy.site</a></p>
                        <p className="flex items-center gap-2"><Phone className="h-4 w-4 text-primary flex-shrink-0" /><strong>Téléphone Dimitri Blanchard :</strong> <a href="tel:+41798965850" className="text-primary hover:underline font-medium">+41 79 896 58 50</a></p>
                        <p className="flex items-center gap-2"><Phone className="h-4 w-4 text-primary flex-shrink-0" /><strong>Téléphone Marco Menn :</strong> <a href="tel:+41782382868" className="text-primary hover:underline font-medium">+41 78 238 28 68</a></p>
                        <p className="flex items-center gap-2"><MapPin className="h-4 w-4 text-primary flex-shrink-0" /><strong>Adresse postale :</strong> Hoomy, Rue Saint-Maurice 12, 2525 Le Landeron, Canton de Neuchâtel, Suisse</p>
                        <p className="flex items-center gap-2"><Clock className="h-4 w-4 text-primary flex-shrink-0" /><strong>Horaires de disponibilité :</strong> Lundi - Vendredi, 9h00 - 18h00 (hors jours fériés NE)</p>
                        <p className="text-xs text-muted-foreground mt-2">Les horaires indiqués sont les plages de disponibilité pour contact téléphonique et réponse prioritaire aux emails</p>
                      </div>
                    </div>

                    <div className="pb-4 border-b border-border">
                      <strong className="text-lg text-primary">Activité Principale :</strong>
                      <p className="mt-1">Plateforme numérique de mise en relation entre étudiants recherchant un logement et propriétaires proposant des biens immobiliers à la location</p>
                      <p className="text-sm mt-2 font-medium flex items-center gap-2"><AlertTriangle className="h-4 w-4" /> Hoomy n'est PAS une agence immobilière</p>
                      <p className="text-sm mt-1">Rôle : Intermédiaire technique et facilitateur de mise en relation uniquement</p>
                      <p className="text-xs text-muted-foreground mt-2">Code NOGA 2008 suggéré : <strong>63.11.9</strong> - Autres activités de traitement de données, hébergement et activités connexes (Portails web, plateformes numériques)</p>
                      <p className="text-xs text-muted-foreground mt-1">Code NOGA alternatif : <strong>63.99.9</strong> - Autres services d'information n.c.a.</p>
                    </div>

                    <div className="pb-4 border-b border-border">
                      <strong className="text-lg text-primary">Autorité de Surveillance :</strong>
                      <p className="mt-1">Préposé fédéral à la protection des données et à la transparence (PFPDT)</p>
                      <p className="text-sm">Feldeggweg 1, 3003 Berne, Suisse</p>
                      <p className="text-sm">Website : <a href="https://www.edoeb.admin.ch" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">www.edoeb.admin.ch</a></p>
                    </div>

                    <div className="pb-4 border-b border-border">
                      <strong className="text-lg text-primary">Capital Social :</strong>
                      <p className="mt-1">Non applicable (entreprise individuelle)</p>
                      <p className="text-xs text-muted-foreground mt-1">Capital minimum requis lors de transformation en Sàrl : CHF 20'000.–</p>
                    </div>

                    <div className="pb-4 border-b border-border">
                      <strong className="text-lg text-primary">Assurance Responsabilité Civile Professionnelle :</strong>
                      <p className="mt-1"><span className="inline-block px-2 py-1 bg-slate-100 text-slate-800 rounded text-xs font-medium">NON SOUSCRITE</span></p>
                      <p className="text-xs text-muted-foreground mt-1">Aucune assurance RC professionnelle n'est actuellement souscrite</p>
                      <p className="text-xs text-muted-foreground mt-1">Souscription envisagée si croissance de l'activité (couverture visée : CHF 1'000'000.– par sinistre)</p>
                    </div>

                    <div>
                      <strong className="text-lg text-primary">Conformité Réglementaire :</strong>
                      <div className="mt-2 space-y-1 ml-4 text-sm">
                        <p className="flex items-center gap-2"><Check className="h-4 w-4 text-green-600" /> Loi fédérale sur la protection des données (LPD)</p>
                        <p className="flex items-center gap-2"><Check className="h-4 w-4 text-green-600" /> Règlement général sur la protection des données (RGPD UE)</p>
                        <p className="flex items-center gap-2"><Check className="h-4 w-4 text-green-600" /> Loi sur le commerce électronique (LCE)</p>
                        <p className="flex items-center gap-2"><Check className="h-4 w-4 text-green-600" /> Loi fédérale contre la concurrence déloyale (LCD)</p>
                        <p className="flex items-center gap-2"><Check className="h-4 w-4 text-green-600" /> Code des Obligations suisse (CO)</p>
                        <p className="flex items-center gap-2"><Check className="h-4 w-4 text-green-600" /> Bonnes pratiques en matière de lutte contre le blanchiment (LBA)</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 pt-8 border-t border-border text-center">
                    <div className="inline-block px-6 py-4 bg-primary/10 rounded-lg">
                      <p className="text-sm text-muted-foreground mb-2">Document juridique officiel établi par Hoomy</p>
                      <p className="font-bold text-lg mb-1">Version 3.0 Exhaustive Professionnelle</p>
                      <p className="text-sm mb-1">60 Articles • Environ 45'000 mots • Protection juridique renforcée</p>
                      <p className="text-xs text-muted-foreground">Lancement de la plateforme : <strong>7 novembre 2025</strong></p>
                      <p className="text-xs text-muted-foreground">Dernière mise à jour majeure des CGU : <strong>25 novembre 2025</strong></p>
                      <p className="text-xs text-muted-foreground mt-3">© 2025 Hoomy - Tous droits réservés</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>
          </div>

          {/* Footer CGU Détaillé */}
          <Card className="mt-6 sm:mt-8 md:mt-12 bg-gradient-to-br from-primary/5 to-primary/10 border-2 border-primary/20">
            <CardContent className="p-4 sm:p-6 md:p-10">
              <div className="flex items-center gap-3 mb-6">
                <Info className="h-8 w-8 text-primary flex-shrink-0" />
                <h3 className="text-xl md:text-2xl font-bold">Besoin d'Aide ou d'Informations Supplémentaires ?</h3>
              </div>
              
              <p className="mb-6 text-sm md:text-base">
                Pour toute question, demande de clarification, réclamation ou assistance concernant ces Conditions Générales d'Utilisation, notre équipe est à votre disposition via les canaux suivants :
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div className="bg-background/80 backdrop-blur p-4 sm:p-5 rounded-lg border border-border">
                  <h4 className="font-semibold mb-3 text-primary flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Support Général
                  </h4>
                  <div className="space-y-2 text-sm">
                    <p><strong>Email :</strong> <a href="mailto:contact@hoomy.site" className="text-primary hover:underline break-all">contact@hoomy.site</a></p>
                    <p><strong>Délai de réponse :</strong> 24h ouvrables</p>
                  </div>
                </div>

                <div className="bg-background/80 backdrop-blur p-4 sm:p-5 rounded-lg border border-border">
                  <h4 className="font-semibold mb-3 text-primary flex items-center gap-2">
                    <Gavel className="h-5 w-5" />
                    Questions Juridiques
                  </h4>
                  <div className="space-y-2 text-sm">
                    <p><strong>Email :</strong> <a href="mailto:legal@hoomy.site" className="text-primary hover:underline break-all">legal@hoomy.site</a></p>
                    <p><strong>Délai de réponse :</strong> 5 jours ouvrables</p>
                  </div>
                </div>

                <div className="bg-background/80 backdrop-blur p-4 sm:p-5 rounded-lg border border-border">
                  <h4 className="font-semibold mb-3 text-primary flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Protection des Données (DPO)
                  </h4>
                  <div className="space-y-2 text-sm">
                    <p><strong>Email :</strong> <a href="mailto:legal@hoomy.site" className="text-primary hover:underline break-all">legal@hoomy.site</a></p>
                    <p><strong>Délai de réponse :</strong> 30 jours (légal)</p>
                  </div>
                </div>

                <div className="bg-background/80 backdrop-blur p-4 sm:p-5 rounded-lg border border-border">
                  <h4 className="font-semibold mb-3 text-primary flex items-center gap-2">
                    <Database className="h-5 w-5" />
                    Contact Postal & Téléphone
                  </h4>
                  <div className="space-y-1 text-sm">
                    <p><strong>Hoomy</strong></p>
                    <p>Service Juridique</p>
                    <p>Rue Saint-Maurice 12</p>
                    <p>2525 Le Landeron</p>
                    <p>Canton de Neuchâtel, Suisse</p>
                    <p className="mt-2"><strong>Tel :</strong> +41 79 896 58 50</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-border/50">
                <p className="text-xs md:text-sm text-muted-foreground text-center">
                  <strong>Rappel Important :</strong> Ces CGU constituent un document juridiquement contraignant. En cas de doute ou d'incompréhension, nous recommandons vivement de consulter un avocat spécialisé avant toute acceptation. Hoomy ne peut être tenu responsable d'une acceptation non éclairée.
                </p>
              </div>

              <div className="mt-4 sm:mt-6 flex flex-wrap gap-2 sm:gap-4 justify-center text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><FileText className="h-3 w-3 flex-shrink-0" /> Version 3.0</span>
                <span className="hidden sm:inline">•</span>
                <span className="flex items-center gap-1"><Calendar className="h-3 w-3 flex-shrink-0" /> Mise à jour : 25/11/2025</span>
                <span className="hidden sm:inline">•</span>
                <span className="flex items-center gap-1"><Scale className="h-3 w-3 flex-shrink-0" /> Droit suisse applicable</span>
                <span className="hidden sm:inline">•</span>
                <span className="flex items-center gap-1"><MapPin className="h-3 w-3 flex-shrink-0" /> Juridiction : Neuchâtel, Suisse</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}

