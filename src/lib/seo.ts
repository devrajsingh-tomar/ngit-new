import type { Metadata } from "next";

export const SITE_CONFIG = {
  name: "NGIT",
  fullName: "National Genius Institute of Technology",
  domain: "https://ngitedu.com",
  url: "https://ngitedu.com",
  ogImage: "https://ngitedu.com/logo.png",
  phone: "+91 80049 58441",
  email: "info@ngitedu.com",
  address: {
    streetAddress: "Prayagraj",
    addressLocality: "Prayagraj",
    addressRegion: "Uttar Pradesh",
    postalCode: "211001",
    addressCountry: "IN",
  },
  geo: {
    latitude: "25.4358",
    longitude: "81.8463",
  },
};

interface SeoOptions {
  title: string;
  description: string;
  path: string;
  ogType?: "website" | "article";
  ogImage?: string;
  noindex?: boolean;
  publishedTime?: string;
  modifiedTime?: string;
  authors?: string[];
  tags?: string[];
}

export function constructMetadata({
  title,
  description,
  path,
  ogType = "website",
  ogImage = SITE_CONFIG.ogImage,
  noindex = false,
  publishedTime,
  modifiedTime,
  authors,
  tags,
}: SeoOptions): Metadata {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  const canonicalUrl = `${SITE_CONFIG.domain}${cleanPath === "/" ? "" : cleanPath}`;

  const fullTitle = title.includes("NGIT") ? title : `${title} | NGIT`;

  return {
    title: fullTitle,
    description,
    metadataBase: new URL(SITE_CONFIG.domain),
    alternates: {
      canonical: canonicalUrl,
    },
    robots: noindex
      ? { index: false, follow: false }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-video-preview": -1,
            "max-image-preview": "large",
            "max-snippet": -1,
          },
        },
    openGraph: {
      title: fullTitle,
      description,
      url: canonicalUrl,
      siteName: SITE_CONFIG.fullName,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: fullTitle,
        },
      ],
      type: ogType,
      locale: "en_IN",
      ...(publishedTime && { publishedTime }),
      ...(modifiedTime && { modifiedTime }),
      ...(authors && { authors }),
      ...(tags && { tags }),
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [ogImage],
    },
  };
}

export function getOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    name: SITE_CONFIG.fullName,
    alternateName: "NGIT",
    url: SITE_CONFIG.domain,
    logo: SITE_CONFIG.ogImage,
    telephone: SITE_CONFIG.phone,
    email: SITE_CONFIG.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: SITE_CONFIG.address.streetAddress,
      addressLocality: SITE_CONFIG.address.addressLocality,
      addressRegion: SITE_CONFIG.address.addressRegion,
      postalCode: SITE_CONFIG.address.postalCode,
      addressCountry: SITE_CONFIG.address.addressCountry,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: SITE_CONFIG.geo.latitude,
      longitude: SITE_CONFIG.geo.longitude,
    },
    sameAs: [
      "https://facebook.com",
      "https://youtube.com",
    ],
  };
}

export function getWebSiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_CONFIG.fullName,
    alternateName: "NGIT",
    url: SITE_CONFIG.domain,
  };
}

export function getBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url.startsWith("http") ? item.url : `${SITE_CONFIG.domain}${item.url}`,
    })),
  };
}

export function getCourseSchema(course: {
  name: string;
  description: string;
  provider?: string;
  url: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Course",
    name: course.name,
    description: course.description,
    provider: {
      "@type": "Organization",
      name: course.provider || SITE_CONFIG.fullName,
      sameAs: SITE_CONFIG.domain,
    },
  };
}

export function getArticleSchema(article: {
  title: string;
  description: string;
  url: string;
  image?: string;
  publishedAt?: string;
  updatedAt?: string;
  authorName?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: article.title,
    description: article.description,
    url: article.url.startsWith("http") ? article.url : `${SITE_CONFIG.domain}${article.url}`,
    image: article.image || SITE_CONFIG.ogImage,
    datePublished: article.publishedAt,
    dateModified: article.updatedAt || article.publishedAt,
    author: {
      "@type": "Organization",
      name: article.authorName || SITE_CONFIG.fullName,
    },
    publisher: {
      "@type": "Organization",
      name: SITE_CONFIG.fullName,
      logo: {
        "@type": "ImageObject",
        url: SITE_CONFIG.ogImage,
      },
    },
  };
}
