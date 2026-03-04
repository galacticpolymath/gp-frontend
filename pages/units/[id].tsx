import type { GetServerSideProps } from 'next';
import { DEFAULT_LOCALE } from '../../shared/seo';

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const id = params?.id;

  if (typeof id !== 'string' || !id.trim()) {
    return { notFound: true };
  }

  return {
    redirect: {
      destination: `/units/${DEFAULT_LOCALE}/${encodeURIComponent(id)}`,
      permanent: false,
    },
  };
};

const UnitLocaleRedirectPage = () => null;

export default UnitLocaleRedirectPage;
