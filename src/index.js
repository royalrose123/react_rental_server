const { ApolloServer } = require('apollo-server')
const { typeDefs } = require('./typeDefs')
const { resolvers } = require('./resolver')

const { verifyToken } = require('./utils/firebaseMethods')

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: async ({ req, connection }) => {
    if (connection) {
      const userId = await verifyToken(connection.context.authorization)

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
