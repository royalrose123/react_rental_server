const { ApolloServer, gql } = require("apollo-server");

const {
  getFirebaseData,
  setFirebaseData,
  uploadFile,
} = require("./utils/firebaseMethods");

const typeDefs = gql`
  type Users {
    name: String
    age: Int
  }

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
  }

  type File {
    file: Upload
    fileUrl: String
    filename: String
  }

  type Image {
    filename: String
    url: String
  }

  type House {
    id: Int!
    postId: Int!
    city: String
    device: Device
    distict: String
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

  type Query {
    hello: String
    users: [Users]
    house: [House]
  }

  type Mutation {
    addHouse(
      city: String
      device: DeviceInput
      distict: String
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

    addUser(name: String, age: Int): Users
  }
`;

const resolvers = {
  Query: {
    // 需注意名稱一定要對到 Schema 中 field 的名稱
    hello: () => "world",
    users: () => getFirebaseData("users"),
    house: (root, args, context) => getFirebaseData("house"),
  },

  Mutation: {
    addHouse: async (root, args, context) => {
      console.log("addHouse args", args);

      const { fileList } = await args;

      await getFirebaseData("house")
        .then(async (result) => {
          const resultLength = result.length;
          const id = resultLength === 0 ? 0 : result[resultLength - 1].postId;
          const postId = id === 0 ? 1 : id + 1;

          const { fileList, ...restArgs } = args;

          const fileListPromise = await fileList.map((file) => {
            return uploadFile(file.file, postId);
          });

          const newFileList = await Promise.all(fileListPromise);

          setFirebaseData("house", id, {
            ...restArgs,
            postId,
            houseImg: newFileList,
          });
        })
        .catch((error) => {
          console.log("error 44444", error);
        });
    },

    addUser: (root, args, context) => {
      const { name, age } = args;

      getFirebaseData("users")
        .then((result) => {
          const resultLength = result.length;
          const id = resultLength === 0 ? 0 : result[resultLength - 1].userId;
          const userId = id === 0 ? 1 : id + 1;

          setFirebaseData("users", id, { name, age, userId });
        })
        .catch((error) => {
          console.log("error", error);
        });
    },
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

server.listen().then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});
