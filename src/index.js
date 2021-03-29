const { ApolloServer } = require('apollo-server')
const { typeDefs } = require('./typeDefs')
const { resolvers } = require('./resolver')

const { verifyToken } = require('./utils/firebaseMethods')

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: async ({ req }) => {
    const token = req.headers.authorization || ''

    if (!token) return

    const userId = await verifyToken(token)

    return { userId }
  },
})

server.listen().then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`)
})
