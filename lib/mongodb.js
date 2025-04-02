import { MongoClient } from 'mongodb'

const uri = 'mongodb+srv://camargo@admin:camargo@camargo.fu1m0.mongodb.net/?retryWrites=true&w=majority&appName=camargo';
const options = {}

let client
let clientPromise

if (!uri) {
  throw new Error('Please add your Mongo URI to .env.local')
}

if (process.env.NODE_ENV === 'development') {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options)
    global._mongoClientPromise = client.connect()
  }
  clientPromise = global._mongoClientPromise
} else {
  client = new MongoClient(uri, options)
  clientPromise = client.connect()
}

export default clientPromise


// const uri = process.env.MONGODB_URI
