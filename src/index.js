const { ApolloServer } = require('apollo-server')
const { typeDefs } = require('./typeDefs')
const { resolvers } = require('./resolver')

const { verifyToken } = require('./utils/firebaseMethods')

const server = new ApolloServer({
  typeDefs,
  resolvers,
  introspection: true,
  playground: true,
  context: async ({ req, connection }) => {
    if (connection) {
      const token = connection.context.authorization

      if (!token) return

      const userId = await verifyToken(token)

      return { userId }
    }

    const token = req.headers.authorization || ''

    if (!token) return

    const userId = await verifyToken(token)

    return { userId }
  },
  subscriptions: {
    path: '/subscriptions',
  },
})

server.listen({ port: process.env.PORT || 4000 }).then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`)
})
