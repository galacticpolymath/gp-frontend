import type { GetServerSideProps } from 'next';

export const getServerSideProps: GetServerSideProps = async () => ({
  redirect: {
    destination: '/search?typeFilter=Unit',
    permanent: false,
  },
});

const UnitsRedirectPage = () => null;

export default UnitsRedirectPage;
