const express = require('express')
const cors = require('cors')
const { ApolloServer } = require('apollo-server-express')
const { typeDefs } = require('./typeDefs')
const { resolvers } = require('./resolver')

const { verifyToken } = require('./utils/firebaseMethods')

const server = new ApolloServer({
  typeDefs,
  resolvers,
  introspection: true,
  playground: true,
  // cors: {
  //   origin: ['https://live-life-rental.herokuapp.com', 'http://localhost:3001'],
  //   credentials: true,
  // },
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

const app = express()

const corsOptions = {
  origin: true,
  credentials: true,
}

app.use(cors(corsOptions))

// server.applyMiddleware({ app, cors: { origin: ['https://live-life-rental.herokuapp.com', 'http://localhost:3001'], credentials: true } })
server.applyMiddleware({
  app,
  path: '/',
  cors: false,
})
app.listen({ port: process.env.PORT || 4000 }, () => console.log(`Server is running on the port 4000`))
// server.listen({ port: process.env.PORT || 4000 }).then(({ url }) => {
//   console.log(`🚀 Server ready at ${url}`)
// })
