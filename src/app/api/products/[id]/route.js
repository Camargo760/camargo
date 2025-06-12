import { NextResponse } from 'next/server';
import clientPromise from '../../../../lib/mongodb';
import { ObjectId } from 'mongodb';

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const client = await clientPromise;
    const db = client.db("ecommerce");
    const product = await request.json();
    const result = await db.collection("products").updateOne(
      { _id: new ObjectId(id) },
      { $set: { ...product, uploadTime: new Date() } }
    );
    if (result.modifiedCount === 0) {
      return NextResponse.json({ error: 'Product not found or not modified' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Product updated successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    const client = await clientPromise;
    const db = client.db("ecommerce");
    const update = await request.json();
    const result = await db.collection("products").updateOne(
      { _id: new ObjectId(id) },
      { $set: { ...update, uploadTime: new Date() } }
    );
    if (result.modifiedCount === 0) {
      return NextResponse.json({ error: 'Product not found or not modified' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Product updated successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    
    if (!id) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid product ID' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("ecommerce");
    const product = await db.collection("products").findOne({ _id: new ObjectId(id) });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const client = await clientPromise;
    const db = client.db("ecommerce");
    const result = await db.collection("products").deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Product deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}
