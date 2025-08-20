import { BaseController } from './BaseController'
import { Blog } from './interface'

class BlogController extends BaseController {
  async getAllBlogs() {
    try {
      const body = await fetch('https://newsapi.org/v2/top-headlines?apiKey=2df4b98ceb974570aa50312929f1ecf2&country=us&category=sports', {
        method: 'GET',
      })
      const response: Record<string, any> = (await body.json()) as Record<string, any>
      return response.articles as Blog[]
    } catch (error) {
      this.app.Sentry.captureException(error)
      this.res.status(500).send([])
    }
  }
}

export default BlogController
