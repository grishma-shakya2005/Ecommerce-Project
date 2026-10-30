import { Helmet } from 'react-helmet-async';

const keywords = 'textile, Dhaka topi, Dhaka fabric bags, scarves, Nepali handicrafts, Nepali clothing';

interface SeoProps {
  title: string;
  description: string;
  image?: string;
  type?: 'website' | 'product';
}

export default function Seo({ title, description, image = '/images/dhaka-hero.jpg', type = 'website' }: SeoProps) {
  const url = `https://example.com${window.location.pathname}`;

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={`https://example.com${image}`} />
    </Helmet>
  );
}
