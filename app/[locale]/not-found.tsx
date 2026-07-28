import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';

export default function NotFound() {
  const t = useTranslations('notFound');

  return (
    <main className="container-page flex min-h-[60vh] flex-col items-center justify-center py-16 text-center">
      <h1 className="text-3xl font-extrabold text-primary-900 dark:text-primary-300">
        {t('title')}
      </h1>
      <p className="mt-3 text-muted-foreground">{t('description')}</p>
      <Link
        href="/"
        className="mt-8 inline-flex h-11 items-center rounded-full bg-primary-700 px-6 font-semibold text-white transition hover:bg-primary-800"
      >
        {t('backHome')}
      </Link>
    </main>
  );
}
