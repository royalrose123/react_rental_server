const { findIndex } = require('lodash')
const { getFirebaseData, setFirebaseData, uploadFile, createUserAccount, login, logout } = require('./utils/firebaseMethods')
const { GraphQLScalarType, Kind } = require('graphql')

const { PubSub } = require('apollo-server')
let pubsub = new PubSub()

const dateScalar = new GraphQLScalarType({
  name: 'Date',
  description: 'Date custom scalar type',
  serialize(value) {
    return new Date(value).getTime() // Convert outgoing Date to integer for JSON
  },
  parseValue(value) {
    return new Date(value) // Convert incoming integer to Date
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.INT) {
      return new Date(parseInt(ast.value, 10)) // Convert hard-coded AST string to integer and then to Date
    }
    return null // Invalid hard-coded value (not an integer)
  },
})

const resolvers = {
  Subscription: {
    houseSocket: {
      subscribe: () => pubsub.asyncIterator('QUESTION_UPDATE'),
    },
  },
  Date: dateScalar,
  Query: {
    hello: () => 'world',
    houses: (root, args, context) => {
      return getFirebaseData({ ref: 'house', searchForm: { ...args } })
    },
    house: (root, args, context) => getFirebaseData({ ref: 'house', orderBy: 'postId', value: args.postId }),
    user: async (root, args, context) => {
      const { userId } = context

      return getFirebaseData({ ref: 'user', orderBy: 'userId', value: userId })
    },
  },

  User: {
    userPost: async (parent, args, context) => {
      const { userId } = parent
      const houses = await getFirebaseData({ ref: 'house' })

      return houses.filter((house) => house.postUser.userId === userId)
    },
    userLikeHouse: async (parent, args, context) => {
      const { userId } = parent

      const currentUser = await getFirebaseData({ ref: 'user', orderBy: 'userId', value: userId })
      const houses = await getFirebaseData({ ref: 'house' })

      return houses.filter((house) => findIndex(currentUser.userLikeHouse, { postId: house.postId }) !== -1)
    },
  },
  House: {
    postUser: async (parent, args, context) => {
      const { postUser } = parent
      const { userId } = postUser

      const newPostUser = await getFirebaseData({ ref: 'user', orderBy: 'userId', value: userId })

      return { ...newPostUser }
    },
  },

  Mutation: {
    login: async (root, args, context) => {
      const data = { ...args }
      const result = await login(data)

      return { ...result }
    },
    logout: async (root, args, context) => {
      const data = { ...args }
      const result = await logout(data)

      return result
    },

    editUser: async (root, args, context) => {
      const { userId } = context
      const data = { ...args }
      const result = await setFirebaseData('user', userId, {
        ...data,
      })

      return result
    },
    createUser: async (root, args, context) => {
      const data = { ...args }
      const result = await createUserAccount(data)

      return result
    },

    addHouse: async (root, args, context) => {
      await getFirebaseData({ ref: 'house' })
        .then(async (result) => {
          const resultLength = result.length
          const postId = resultLength === 0 ? 0 : result[resultLength - 1].postId + 1

          const { fileList, ...restArgs } = args

          const fileListPromise = await fileList.map((file) => {
            return uploadFile(file.file, postId)
          })

          const newFileList = await Promise.all(fileListPromise)

          setFirebaseData('house', postId, {
            ...restArgs,
            postId,
            houseImg: newFileList,
          })
        })
        .catch((error) => {
          console.log('error 44444', error)
        })
    },

    editHouse: async (root, args, context) => {
      const { postId } = args
      await getFirebaseData({ ref: 'house' })
        .then(async (result) => {
          const { fileList, ...restArgs } = args

          const fileListPromise = await fileList.map((file) => {
            if (file.isExisted) {
              return file
            } else {
              return uploadFile(file.file, postId)
            }
          })

          const newFileList = await Promise.all(fileListPromise)

          setFirebaseData('house', postId, {
            ...restArgs,
            postId,
            houseImg: newFileList,
          })
        })
        .catch((error) => {
          console.log('error 44444', error)
        })
    },

    likeHouse: async (root, args, context) => {
      const { postId, userId } = { ...args }

      const currentUser = await getFirebaseData({ ref: 'user', orderBy: 'userId', value: userId })

      if (!currentUser.userLikeHouse) currentUser.userLikeHouse = []

      const newLikeHouse = {
        postId,
      }

      const postIndex = findIndex(currentUser.userLikeHouse, { postId })

      if (postIndex !== -1) {
        currentUser.userLikeHouse = currentUser.userLikeHouse
          .slice(0, postIndex)
          .concat(currentUser.userLikeHouse.slice(postIndex + 1, currentUser.userLikeHouse.length))
      } else {
        currentUser.userLikeHouse.push(newLikeHouse)
      }

      const result = await setFirebaseData('user', userId, {
        ...currentUser,
      })

      return { ...result, postId }
    },

    updateQuestion: async (root, args, context) => {
      const { postId, isQuestion, questionId } = args

      const currentHouse = await getFirebaseData({ ref: 'house', orderBy: 'postId', value: postId })

      if (!currentHouse.questionList) currentHouse.questionList = []

      const questionListLength = currentHouse.questionList.length
      const newQuestionId = questionListLength === 0 ? 0 : currentHouse.questionList[questionListLength - 1].questionId + 1

      if (isQuestion) {
        const newQuestionItem = {
          ...args,
          questionId: newQuestionId,
        }

        currentHouse.questionList.push(newQuestionItem)
      } else {
        const replyIndex = findIndex(currentHouse.questionList, { questionId })

        if (!currentHouse.questionList[replyIndex].replyList) currentHouse.questionList[replyIndex].replyList = []

        const newReplyItem = {
          ...args,
          questionId,
        }

        currentHouse.questionList[replyIndex].replyList.push(newReplyItem)
      }

      pubsub.publish('QUESTION_UPDATE', { houseSocket: currentHouse })

      const result = await setFirebaseData('house', postId, {
        ...currentHouse,
      })

      return result
    },
  },
}

module.exports = { resolvers }
