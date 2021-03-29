
  const { gql } = require("apollo-server");

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

  input RoomAmountInput {
    name: Int
    isActive: Boolean
    value: Int
  }

  input RoomTypeInput {
    name: String
    isActive: Boolean
    value: String
  }

  input PriceInput {
    min: Int
    max: Int
  }

  input MapBoundsInput {
    NELat: Float
    NELng: Float
    SWLat: Float
    SWLng: Float
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
    houses(
      price: PriceInput
      roomAmount: [RoomAmountInput]
      roomType: [RoomTypeInput]
      mapBounds: MapBoundsInput
    ): [House]
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

module.exports = { typeDefs };