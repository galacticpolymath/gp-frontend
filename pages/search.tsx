import HomePage, { getStaticProps } from "./index";

export { getStaticProps };

export default function SearchPage(props: React.ComponentProps<typeof HomePage>) {
  return <HomePage {...props} initialTab="All" />;
}
