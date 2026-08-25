import { MetadataRoute } from 'next'
import { getPublicCourses } from '@/app/actions/courses'
import { getEvents } from '@/app/actions/events'
import { listBlogPosts } from '@/app/actions/blog'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://ngitedu.com'

  // Public static routes
  const staticPaths = [
    { route: '', priority: 1.0, changeFrequency: 'daily' as const },
    { route: '/about', priority: 0.8, changeFrequency: 'monthly' as const },
    { route: '/contact', priority: 0.8, changeFrequency: 'monthly' as const },
    { route: '/courses', priority: 0.9, changeFrequency: 'weekly' as const },
    { route: '/typing', priority: 0.9, changeFrequency: 'daily' as const },
    { route: '/typing-software', priority: 0.9, changeFrequency: 'weekly' as const },
    { route: '/typing-software-prayagraj', priority: 0.9, changeFrequency: 'weekly' as const },
    { route: '/steno', priority: 0.9, changeFrequency: 'daily' as const },
    { route: '/steno-software', priority: 0.9, changeFrequency: 'weekly' as const },
    { route: '/steno-software-prayagraj', priority: 0.9, changeFrequency: 'weekly' as const },
    { route: '/steno/series', priority: 0.8, changeFrequency: 'weekly' as const },
    { route: '/steno/mock-tests', priority: 0.8, changeFrequency: 'weekly' as const },
    { route: '/shorthand', priority: 0.9, changeFrequency: 'weekly' as const },
    { route: '/university-courses', priority: 0.8, changeFrequency: 'monthly' as const },
    { route: '/blog', priority: 0.8, changeFrequency: 'daily' as const },
    { route: '/events', priority: 0.7, changeFrequency: 'weekly' as const },
    { route: '/exams', priority: 0.7, changeFrequency: 'weekly' as const },
    { route: '/faculty', priority: 0.6, changeFrequency: 'monthly' as const },
    { route: '/gallery', priority: 0.6, changeFrequency: 'monthly' as const },
    { route: '/notices', priority: 0.6, changeFrequency: 'weekly' as const },
    { route: '/privacy-policy', priority: 0.3, changeFrequency: 'yearly' as const },
    { route: '/terms-and-conditions', priority: 0.3, changeFrequency: 'yearly' as const },
    { route: '/refund-policy', priority: 0.3, changeFrequency: 'yearly' as const },
    { route: '/verify', priority: 0.5, changeFrequency: 'monthly' as const },
  ]

  const staticRoutes = staticPaths.map(({ route, priority, changeFrequency }) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency,
    priority,
  }))

  // Dynamic Courses
  let courseRoutes: MetadataRoute.Sitemap = []
  try {
    const courseRes = await getPublicCourses()
    if (courseRes.success && Array.isArray(courseRes.courses)) {
      courseRoutes = courseRes.courses.map((course: any) => ({
        url: `${baseUrl}/courses/${course.slug || course._id}`,
        lastModified: new Date(course.updatedAt || new Date()),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      }))
    }
  } catch (e) {
    console.error('Sitemap course fetch error:', e)
  }

  // Dynamic Events
  let eventRoutes: MetadataRoute.Sitemap = []
  try {
    const eventRes = await getEvents()
    if (eventRes.success && Array.isArray(eventRes.events)) {
      eventRoutes = eventRes.events.map((event: any) => ({
        url: `${baseUrl}/events/${event._id}`,
        lastModified: new Date(event.updatedAt || event.date || new Date()),
        changeFrequency: 'monthly' as const,
        priority: 0.5,
      }))
    }
  } catch (e) {
    console.error('Sitemap event fetch error:', e)
  }

  // Dynamic Blog Posts
  let blogRoutes: MetadataRoute.Sitemap = []
  try {
    const blogRes = await listBlogPosts({ status: 'PUBLISHED', limit: 100, page: 1 })
    if (blogRes.success && blogRes.data && Array.isArray(blogRes.data.posts)) {
      blogRoutes = blogRes.data.posts.map((post: any) => ({
        url: `${baseUrl}/blog/${post.slug}`,
        lastModified: new Date(post.updatedAt || post.publishedAt || new Date()),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      }))
    }
  } catch (e) {
    console.error('Sitemap blog fetch error:', e)
  }

  return [...staticRoutes, ...courseRoutes, ...eventRoutes, ...blogRoutes]
}
