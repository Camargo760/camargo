// api/customProducts/[id]/route.js

import { NextResponse } from "next/server";
import clientPromise from "../../../../lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET(request, { params }) {
    try {
        if (!params || !params.id) {
            return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
        }

        const id = params.id;

        if (!ObjectId.isValid(id)) {
            return NextResponse.json({ error: 'Invalid product ID' }, { status: 400 });
        }

        const client = await clientPromise;
        const db = client.db("ecommerce");
        const product = await db.collection("customProducts").findOne({ _id: new ObjectId(id) });

        if (!product) {
            return NextResponse.json({ error: 'Custom product not found' }, { status: 404 });
        }

        return NextResponse.json(product);
    } catch (error) {
        console.error('Error fetching custom product:', error);
        return NextResponse.json({ error: 'Failed to fetch custom product' }, { status: 500 });
    }
}