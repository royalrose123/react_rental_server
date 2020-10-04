const { ApolloServer, gql } = require("apollo-server");

const {
  getFirebaseData,
  setFirebaseData,
  uploadFile,
  createUserAccount,
  login,
  logout,
  verifyToken,
} = require("./utils/firebaseMethods");

const typeDefs = gql`
  # House schema
  input DeviceInput {
    airConditioner: Boolean
    table: Boolean
    chair: Boolean
    wardrobe: Boolean
    bed: Boolean
    sofa: Boolean
    heater: Boolean
    television: Boolean
    refrigerator: Boolean
    laundryMachine: Boolean
    network: Boolean
    cable: Boolean
  }

  type Device {
    airConditioner: Boolean
    table: Boolean
    chair: Boolean
    wardrobe: Boolean
    bed: Boolean
    sofa: Boolean
    heater: Boolean
    television: Boolean
    refrigerator: Boolean
    laundryMachine: Boolean
    network: Boolean
    cable: Boolean
  }

  input RequireInput {
    cook: String
    deposit: String
    gender: String
    identify: String
    leastPeriod: String
    pet: String
  }

  type Require {
    cook: String
    deposit: String
    gender: String
    identify: String
    leastPeriod: String
    pet: String
  }

  input OthersInput {
    kitchen: Boolean
    elevator: Boolean
  }

  type Others {
    kitchen: Boolean
    elevator: Boolean
  }

  input PriceIncludeInput {
    associationFee: Boolean
    cleaningFee: Boolean
    networkBill: Boolean
    waterBill: Boolean
  }

  type PriceInclude {
    associationFee: Boolean
    cleaningFee: Boolean
    networkBill: Boolean
    waterBill: Boolean
  }

  input LatLngInput {
    lat: Float
    lng: Float
  }

  type LatLng {
    lat: Float
    lng: Float
  }

  input FileInput {
    file: Upload
    fileUrl: String
    filename: String
    isExisted: Boolean
  }

  type File {
    file: Upload
    fileUrl: String
    filename: String
    isExisted: Boolean
  }

  input ImageInput {
    filename: String
    fileUrl: String
  }

  type Image {
    filename: String
    fileUrl: String
  }

  input HouseInput {
    postUser: UserInput
    id: Int!
    postId: Int
    city: String
    device: DeviceInput
    distinct: String
    floor: Int
    houseDetail: String
    livingroomAmount: Int
    others: OthersInput
    price: Int
    priceInclude: PriceIncludeInput
    require: RequireInput
    restroomAmount: Int
    roomAmount: Int
    roomType: String
    size: Int
    street: String
    surrounding: String
    title: String
    totalFloor: Int
    address: String
    latLng: LatLngInput
    fileList: [FileInput]
    houseImg: [ImageInput]
  }

  type House {
    postUser: User
    id: Int!
    postId: Int
    city: String
    device: Device
    distinct: String
    floor: Int
    houseDetail: String
    livingroomAmount: Int
    others: Others
    price: Int
    priceInclude: PriceInclude
    require: Require
    restroomAmount: Int
    roomAmount: Int
    roomType: String
    size: Int
    street: String
    surrounding: String
    title: String
    totalFloor: Int
    address: String
    latLng: LatLng
    fileList: [File]
    houseImg: [Image]
  }

  input TokenInput {
    token: String
  }

  type Account {
    email: String
    password: String
  }

  type User {
    token: String
    gender: String
    userId: String
    displayName: String
    phoneNumber: String
    email: String
    photoURL: String
    emailVerified: Boolean
    userPost: [House]
  }

  input UserInput {
    token: String
    gender: String
    userId: String
    displayName: String
    phoneNumber: String
    email: String
    photoURL: String
    emailVerified: Boolean
    userPost: [HouseInput]
  }

  type ReturnMessage {
    returnCode: String
    message: String
  }

  type Query {
    hello: String
    houses: [House]
    house(postId: Int): House
    user: User
  }

  type Mutation {
    login(email: String, password: String): User
    logout: ReturnMessage

    createUser(email: String, password: String): Account
    editUser(
      gender: String
      displayName: String
      phoneNumber: String
      email: String
    ): User

    addHouse(
      postUser: UserInput
      city: String
      device: DeviceInput
      distinct: String
      floor: Int
      houseDetail: String
      livingroomAmount: Int
      others: OthersInput
      price: Int
      priceInclude: PriceIncludeInput
      require: RequireInput
      restroomAmount: Int
      roomAmount: Int
      roomType: String
      size: Int
      street: String
      surrounding: String
      title: String
      totalFloor: Int
      address: String
      latLng: LatLngInput
      fileList: [FileInput]
    ): House

    editHouse(
      postId: Int
      postUser: UserInput
      city: String
      device: DeviceInput
      distinct: String
      floor: Int
      houseDetail: String
      livingroomAmount: Int
      others: OthersInput
      price: Int
      priceInclude: PriceIncludeInput
      require: RequireInput
      restroomAmount: Int
      roomAmount: Int
      roomType: String
      size: Int
      street: String
      surrounding: String
      title: String
      totalFloor: Int
      address: String
      latLng: LatLngInput
      fileList: [FileInput]
    ): House
  }
`;

const resolvers = {
  Query: {
    hello: () => "world",
    houses: (root, args, context) => getFirebaseData("house"),
    house: (root, args, context) =>
      getFirebaseData("house", "postId", args.postId),
    user: async (root, args, context) => {
      const { userId } = context;

      return getFirebaseData("user", "userId", userId);
    },
  },

  User: {
    userPost: async (parent, args, context) => {
      const { userId } = parent;
      const houses = await getFirebaseData("house");


      return houses.filter((house) => house.postUser.userId === userId);
    },
  },

  Mutation: {
    login: async (root, args, context) => {
      const data = { ...args };
      const result = await login(data);

      return result;
    },
    logout: async (root, args, context) => {
      const data = { ...args };
      const result = await logout(data);

      return result;
    },

    editUser: async (root, args, context) => {
      const { userId } = context;
      const data = { ...args };
      const result = await setFirebaseData("user", userId, {
        ...data,
      });

      return result;
    },
    createUser: async (root, args, context) => {
      const data = { ...args };
      const result = await createUserAccount(data);

      return result;
    },

    addHouse: async (root, args, context) => {
      await getFirebaseData("house")
        .then(async (result) => {
          const resultLength = result.length;
          const postId =
            resultLength === 0 ? 0 : result[resultLength - 1].postId + 1;

          const { fileList, ...restArgs } = args;

          const fileListPromise = await fileList.map((file) => {
            return uploadFile(file.file, postId);
          });

          const newFileList = await Promise.all(fileListPromise);

          setFirebaseData("house", postId, {
            ...restArgs,
            postId,
            houseImg: newFileList,
          });
        })
        .catch((error) => {
          console.log("error 44444", error);
        });
    },

    editHouse: async (root, args, context) => {
      const { postId } = args;
      await getFirebaseData("house")
        .then(async (result) => {
          const { fileList, ...restArgs } = args;

          const fileListPromise = await fileList.map((file) => {
            if (file.isExisted) {
              return file;
            } else {
              return uploadFile(file.file, postId);
            }
          });

          const newFileList = await Promise.all(fileListPromise);

          setFirebaseData("house", postId, {
            ...restArgs,
            postId,
            houseImg: newFileList,
          });
        })
        .catch((error) => {
          console.log("error 44444", error);
        });
    },
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: async ({ req }) => {
    const token = req.headers.authorization || "";

    if (!token) return;

    const userId = await verifyToken(token);

    return { userId };
  },
});

server.listen().then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});
