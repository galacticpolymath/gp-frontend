import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  const env = process.env.NEXT_PUBLIC_VERCEL_ENV;
  const outsetaDomain =
    process.env.NEXT_PUBLIC_OUTSETA_DOMAIN ||
    (env === "production" ? "galactic-polymath.outseta.com" : null);
  return (
    <Html lang="en">
      <Head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans:wght@300;400;500;600;700&family=Noto+Sans+Mono:wght@300;400;500&display=swap"
          rel="stylesheet"
        />
        {outsetaDomain && (
          <>
            <script
              type="text/javascript"
              dangerouslySetInnerHTML={{
                __html: `
                  var o_options = {
                    domain: '${outsetaDomain}',
                    load: 'auth,customForm,emailList,leadCapture,nocode,profile,support',
                    monitorDom: true,
                  };
                `,
              }}
            />
            <script
              src="https://cdn.outseta.com/outseta.min.js"
              data-options="o_options"
              async
            />
          </>
        )}
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
