const { ApolloServer, gql } = require("apollo-server");
const path = require("path");
const fs = require("fs");

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
  }

  type Query {
    "A simple type for getting started!"
    hello: String
    users: [Users]
    house: [House]
  }

  type Mutation {
    uploadFile(file: Upload!): Upload

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
    uploadFile: async (root, args, context) => {
      const { file } = args;

      uploadFile(file, 1).then(result => console.log('result 99999', result))

    },

    addHouse: (root, args, context) => {
      console.log("root", root);
      console.log("args", args);
      console.log("context", context);

      getFirebaseData("house")
        .then((result) => {
          console.log("result", result);
          const resultLength = result.length;
          const id = resultLength === 0 ? 0 : result[resultLength - 1].postId;
          const postId = id === 0 ? 1 : id + 1;

          setFirebaseData("house", id, { ...args, postId });
        })
        .catch((error) => {
          console.log("error", error);
        });
    },

    addUser: (root, args, context) => {
      const { name, age } = args;

      getFirebaseData("users")
        .then((result) => {
          console.log("result", result);
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
