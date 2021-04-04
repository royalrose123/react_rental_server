const { findIndex } = require('lodash')
const { getFirebaseData, setFirebaseData, uploadFile, createUserAccount, login, logout } = require('./utils/firebaseMethods')

const resolvers = {
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
  },

  Mutation: {
    login: async (root, args, context) => {
      const data = { ...args }
      const result = await login(data)

      return result
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

    updateQuestion: async (root, args, context) => {
      const { postId, isQuestion } = args

      const currentHouse = await getFirebaseData({ ref: 'house', orderBy: 'postId', value: postId })

      if (!currentHouse.questionList) currentHouse.questionList = []

      const questionListLength = currentHouse.questionList.length
      const newQuestionId = questionListLength === 0 ? 0 : currentHouse.questionList[questionListLength - 1].questionId + 1

      const newQuestionItem = {
        ...args,
        questionId: newQuestionId,
      }

      if (isQuestion) {
        currentHouse.questionList.push(newQuestionItem)
      } else {
      }

      const result = await setFirebaseData('house', postId, {
        ...currentHouse,
      })

      return result
    },
  },
}

module.exports = { resolvers }
