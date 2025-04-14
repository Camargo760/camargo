const uri = 'mongodb://localhost:27017/ecommerce';
// const uri = 'mongodb+srv://ecommerce:ecommerce@camargo.fu1m0.mongodb.net/ecommerce?retryWrites=true&w=majority&appName=camargo'
// const uri = 'mongodb+srv://camargo:camargo@camargo.fzgutlv.mongodb.net/ecommerce?retryWrites=true&w=majority';

import { MongoClient } from 'mongodb'

// const uri = 'mongodb+srv://camargo2:camargo2@camargo.fzgutlv.mongodb.net/ecommerce'

// const uri = process.env.MONGODB_URI;
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
