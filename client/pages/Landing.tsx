
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Bot, Zap, MessageSquare, Users, BarChart } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const LandingPage = () => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 text-gray-800">
      <header className="px-4 lg:px-6 h-16 flex items-center shadow-sm bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <Link to="/" className="flex items-center justify-center">
          <Bot className="h-7 w-7 text-blue-600" />
          <span className="ml-3 font-bold text-xl text-gray-900">{t('aiReferralAssistant')}</span>
        </Link>
        <nav className="ml-auto flex gap-2 sm:gap-4 items-center">
          <Link to="/login">
            <Button className="bg-blue-600 hover:bg-blue-700">{t('getStarted')}</Button>
          </Link>
        </nav>
      </header>

      <main className="flex-1">
        <section className="w-full pt-20 md:pt-32 lg:pt-40 pb-12 md:pb-24 lg:pb-32">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_450px] lg:gap-12 xl:grid-cols-[1fr_550px]">
              <div className="flex flex-col justify-center space-y-6">
                <div className="space-y-4">
                  <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl xl:text-6xl/none bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    {t('heroTitle')}
                  </h1>
                  <p className="max-w-[600px] text-gray-600 md:text-xl">
                    {t('heroSubtitle')}
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Link to="/login">
                    <Button size="lg" className="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/20">
                      {t('tryForFree')}
                      <Zap className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                </div>
              </div>
              <img
                src="https://images.pexels.com/photos/12355752/pexels-photo-12355752.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
                alt={t('heroImageAlt')}
                className="mx-auto aspect-[4/3] overflow-hidden rounded-xl object-cover sm:w-full lg:order-last shadow-2xl"
              />
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32 bg-white">
            <div className="container px-4 md:px-6">
                <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
                    <div className="inline-block rounded-lg bg-indigo-100 px-3 py-1 text-sm font-semibold text-indigo-700">{t('keyFeatures')}</div>
                    <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">{t('howItWorks')}</h2>
                    <p className="max-w-[900px] text-gray-600 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                        {t('howItWorksSubtitle')}
                    </p>
                </div>
                <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-2 md:gap-12 lg:grid-cols-3">
                    <div className="grid gap-1 text-center">
                        <div className="bg-blue-100 p-4 rounded-full w-fit mx-auto mb-4"><Users className="h-8 w-8 text-blue-600" /></div>
                        <h3 className="text-lg font-bold">{t('smartMatching')}</h3>
                        <p className="text-sm text-gray-600">{t('smartMatchingDesc')}</p>
                    </div>
                     <div className="grid gap-1 text-center">
                        <div className="bg-purple-100 p-4 rounded-full w-fit mx-auto mb-4"><MessageSquare className="h-8 w-8 text-purple-600" /></div>
                        <h3 className="text-lg font-bold">{t('automatedOutreach')}</h3>
                        <p className="text-sm text-gray-600">{t('automatedOutreachDesc')}</p>
                    </div>
                     <div className="grid gap-1 text-center">
                        <div className="bg-green-100 p-4 rounded-full w-fit mx-auto mb-4"><BarChart className="h-8 w-8 text-green-600" /></div>
                        <h3 className="text-lg font-bold">{t('trackProgress')}</h3>
                        <p className="text-sm text-gray-600">{t('trackProgressDesc')}</p>
                    </div>
                </div>
            </div>
        </section>
      </main>
      
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t bg-white">
        <p className="text-xs text-gray-500">{t('copyright')}</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link to="#" className="text-xs hover:underline underline-offset-4">
            {t('termsOfService')}
          </Link>
          <Link to="#" className="text-xs hover:underline underline-offset-4">
            {t('privacy')}
          </Link>
        </nav>
      </footer>
    </div>
  );
};

export default LandingPage;
