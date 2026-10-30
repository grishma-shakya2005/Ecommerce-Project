const measurementId = import.meta.env.VITE_GA_ID as string | undefined;

type Gtag = (...args: unknown[]) => void;

declare global {
  interface Window {
    dataLayer: IArguments[];
    gtag?: Gtag;
  }
}

export const initGoogleAnalytics = () => {
  if (typeof window === 'undefined' || !measurementId || window.gtag) return;

  window.dataLayer = window.dataLayer || [];
  function gtag(..._args: unknown[]) {
    window.dataLayer.push(arguments);
  }

  window.gtag = gtag;
  gtag('js', new Date());
  gtag('config', measurementId, { send_page_view: false });

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
  document.head.appendChild(script);
};

export const trackGoogleAnalyticsPageView = (path: string) => {
  if (typeof window !== 'undefined' && window.gtag && measurementId) {
    window.gtag('event', 'page_view', {
      page_path: path,
      page_location: window.location.href,
    });
  }
};
