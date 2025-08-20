import BlogController from '@controllers/BlogController'
import { FastifyPluginAsync } from 'fastify'

const blogRoutes: FastifyPluginAsync = async (fastity, _opts): Promise<void> => {
  fastity.route({
    method: 'GET',
    url: '/',
    handler: (req, res) => new BlogController(fastity, req, res).getAllBlogs(),
    schema: {
      tags: ['Blog'],
      summary: 'Get all blogs',
      description: 'Get all sports related articles articles',
      consumes: ['application/json'],
      produces: ['application/json'],
      response: {
        200: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              content: {
                type: 'string',
              },
              publishedAt: {
                type: 'string',
              },
              author: {
                type: 'string',
              },
              title: {
                type: 'string',
              },
              description: {
                type: 'string',
              },
              url: {
                type: 'string',
              },
              urlToImage: {
                type: 'string',
              },
              source: {
                type: 'object',
                properties: {
                  name: {
                    type: 'string',
                  },
                },
              },
            },
          },
        },
        default: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              content: {
                type: 'string',
              },
              publishedAt: {
                type: 'string',
              },
            },
          },
        },
      },
    },
  })
}
export default blogRoutes
