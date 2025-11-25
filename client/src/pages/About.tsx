import { MainLayout } from '@/components/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/lib/useLanguage';
import { Building2, Users, Shield, Heart, Target, Award } from 'lucide-react';

export default function About() {
  const { t } = useLanguage();

  return (
    <MainLayout>
      <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-8 sm:py-12 md:py-16">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-8 sm:mb-12 md:mb-16">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6">
              {t('about.title') || 'À Propos de Hoomy'}
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              {t('about.subtitle') || 'Votre partenaire de confiance pour trouver le logement étudiant parfait en Suisse'}
            </p>
          </div>

          {/* Mission Section */}
          <Card className="mb-6 sm:mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl sm:text-2xl md:text-3xl break-words">
                <Target className="h-5 w-5 sm:h-6 sm:w-6 text-primary flex-shrink-0" />
                <span className="break-words">{t('about.mission.title') || 'Notre Mission'}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm sm:text-base md:text-lg leading-relaxed break-words">
              <p className="break-words">
                {t('about.mission.content') || 'Hoomy révolutionne la recherche de logement étudiant en Suisse en offrant une plateforme sécurisée, transparente et efficace qui connecte les étudiants avec des propriétaires vérifiés.'}
              </p>
              <p className="break-words">
                {t('about.mission.content2') || 'Notre objectif est de simplifier le processus de location tout en garantissant la sécurité et la confiance pour toutes les parties impliquées.'}
              </p>
            </CardContent>
          </Card>

          {/* Values Section */}
          <Card className="mb-6 sm:mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl sm:text-2xl md:text-3xl break-words">
                <Heart className="h-5 w-5 sm:h-6 sm:w-6 text-primary flex-shrink-0" />
                <span className="break-words">{t('about.values.title') || 'Nos Valeurs'}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-2">
                  <h3 className="font-semibold text-base sm:text-lg flex items-center gap-2 break-words min-w-0">
                    <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
                    <span className="break-words">{t('about.values.security') || 'Sécurité'}</span>
                  </h3>
                  <p className="text-sm sm:text-base text-muted-foreground break-words">
                    {t('about.values.security.desc') || 'Tous nos propriétaires sont vérifiés pour garantir votre tranquillité d\'esprit.'}
                  </p>
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold text-base sm:text-lg flex items-center gap-2 break-words min-w-0">
                    <Users className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
                    <span className="break-words">{t('about.values.transparency') || 'Transparence'}</span>
                  </h3>
                  <p className="text-sm sm:text-base text-muted-foreground break-words">
                    {t('about.values.transparency.desc') || 'Des informations claires et complètes sur chaque logement et propriétaire.'}
                  </p>
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold text-base sm:text-lg flex items-center gap-2 break-words min-w-0">
                    <Award className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
                    <span className="break-words">{t('about.values.excellence') || 'Excellence'}</span>
                  </h3>
                  <p className="text-sm sm:text-base text-muted-foreground break-words">
                    {t('about.values.excellence.desc') || 'Un service client de qualité disponible pour vous accompagner à chaque étape.'}
                  </p>
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold text-base sm:text-lg flex items-center gap-2 break-words min-w-0">
                    <Building2 className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
                    <span className="break-words">{t('about.values.community') || 'Communauté'}</span>
                  </h3>
                  <p className="text-sm sm:text-base text-muted-foreground break-words">
                    {t('about.values.community.desc') || 'Une plateforme qui rassemble étudiants et propriétaires dans un environnement de confiance.'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* How It Works Section */}
          <Card className="mb-6 sm:mb-8">
            <CardHeader>
              <CardTitle className="text-xl sm:text-2xl md:text-3xl break-words">
                {t('about.how.title') || 'Comment Ça Marche'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 sm:space-y-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm sm:text-base">
                    1
                  </div>
                  <div>
                    <h3 className="font-semibold text-base sm:text-lg mb-1 sm:mb-2 break-words">
                      {t('about.how.step1.title') || 'Inscription Simple'}
                    </h3>
                    <p className="text-sm sm:text-base text-muted-foreground break-words">
                      {t('about.how.step1.desc') || 'Créez votre compte en quelques minutes, que vous soyez étudiant ou propriétaire.'}
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm sm:text-base">
                    2
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-base sm:text-lg mb-1 sm:mb-2 break-words">
                      {t('about.how.step2.title') || 'Recherche et Sélection'}
                    </h3>
                    <p className="text-sm sm:text-base text-muted-foreground break-words">
                      {t('about.how.step2.desc') || 'Parcourez notre catalogue de logements vérifiés dans toute la Suisse et trouvez celui qui correspond à vos besoins.'}
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm sm:text-base">
                    3
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-base sm:text-lg mb-1 sm:mb-2 break-words">
                      {t('about.how.step3.title') || 'Mise en Relation Sécurisée'}
                    </h3>
                    <p className="text-sm sm:text-base text-muted-foreground break-words">
                      {t('about.how.step3.desc') || 'Contactez directement les propriétaires via notre plateforme sécurisée et finalisez votre location en toute confiance.'}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Why Choose Us Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl sm:text-2xl md:text-3xl break-words">
                {t('about.why.title') || 'Pourquoi Choisir Hoomy ?'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 sm:space-y-4 text-sm sm:text-base leading-relaxed">
                <li className="flex items-start gap-3 min-w-0">
                  <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-primary flex-shrink-0 mt-0.5" />
                  <span className="break-words min-w-0">
                    <strong>{t('about.why.verified') || 'Propriétaires vérifiés :'}</strong> {t('about.why.verified.desc') || 'Tous les propriétaires passent par un processus de vérification rigoureux.'}
                  </span>
                </li>
                <li className="flex items-start gap-3 min-w-0">
                  <Award className="h-5 w-5 sm:h-6 sm:w-6 text-primary flex-shrink-0 mt-0.5" />
                  <span className="break-words min-w-0">
                    <strong>{t('about.why.quality') || 'Logements de qualité :'}</strong> {t('about.why.quality.desc') || 'Chaque propriété est vérifiée pour garantir des standards élevés.'}
                  </span>
                </li>
                <li className="flex items-start gap-3 min-w-0">
                  <Users className="h-5 w-5 sm:h-6 sm:w-6 text-primary flex-shrink-0 mt-0.5" />
                  <span className="break-words min-w-0">
                    <strong>{t('about.why.support') || 'Support dédié :'}</strong> {t('about.why.support.desc') || 'Notre équipe est là pour vous aider à chaque étape de votre recherche.'}
                  </span>
                </li>
                <li className="flex items-start gap-3 min-w-0">
                  <Heart className="h-5 w-5 sm:h-6 sm:w-6 text-primary flex-shrink-0 mt-0.5" />
                  <span className="break-words min-w-0">
                    <strong>{t('about.why.trust') || 'Plateforme de confiance :'}</strong> {t('about.why.trust.desc') || 'Des milliers d\'étudiants nous font confiance pour trouver leur logement idéal.'}
                  </span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}

