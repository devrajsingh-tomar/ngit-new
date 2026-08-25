import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://ngitedu.com'
  
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/manager/',
          '/steno/admin/',
          '/student/',
          '/api/',
          '/_next/',
          '/login',
          '/register',
          '/steno/login',
          '/checkout/',
          '/steno/result/',
          '/steno/transcription/',
          '/typing/results/',
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: [
          '/admin/',
          '/manager/',
          '/steno/admin/',
          '/student/',
          '/api/',
          '/_next/',
          '/login',
          '/register',
          '/steno/login',
          '/checkout/',
          '/steno/result/',
          '/steno/transcription/',
          '/typing/results/',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
