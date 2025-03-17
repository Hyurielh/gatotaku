import { Helmet } from 'react-helmet-async';

interface OpenGraphProps {
  title: string;
  description: string;
  image: string;
}

interface SEOProps {
  title: string;
  description: string;
  openGraph?: OpenGraphProps;
}

export const SEO: React.FC<SEOProps> = ({ title, description, openGraph }) => {
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="robots" content="index, follow" />
      <link rel="canonical" href={window.location.href} />
      
      {/* OpenGraph tags */}
      {openGraph && (
        <>
          <meta property="og:title" content={openGraph.title} />
          <meta property="og:description" content={openGraph.description} />
          <meta property="og:image" content={openGraph.image} />
          <meta property="og:url" content={window.location.href} />
          <meta property="og:type" content="website" />
        </>
      )}
    </Helmet>
  );
};