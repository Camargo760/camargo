import { NextResponse } from 'next/server';
import clientPromise from '../../../lib/mongodb';

// GET handler to retrieve all messages
export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db('ecommerce');
    const messagesCollection = db.collection('messages');
    
    // Get all messages, sorted by newest first
    const messages = await messagesCollection
      .find({})
      .sort({ createdAt: -1 })
      .toArray();
    
    return NextResponse.json({ messages }, { status: 200 });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }
}

// POST handler to create a new message
export async function POST(request) {
  try {
    const body = await request.json();
    
    // Validate the request body
    if (!body.message || typeof body.message !== 'string') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }
    
    const client = await clientPromise;
    const db = client.db('ecommerce');
    const messagesCollection = db.collection('messages');
    
    // Insert the new message
    const result = await messagesCollection.insertOne({
      message: body.message,
      createdAt: new Date()
    });
    
    return NextResponse.json({ 
      message: 'Message saved successfully', 
      messageId: result.insertedId.toString() 
    }, { status: 201 });
  } catch (error) {
    console.error('Error saving message:', error);
    return NextResponse.json({ error: 'Failed to save message' }, { status: 500 });
  }
}