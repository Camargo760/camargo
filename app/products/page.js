'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Header from '../../components/Header'

// Helper function to truncate text
const truncateText = (text, maxLength) => {
  if (typeof text !== 'string') {
    return '';
  }
  if (text.length > maxLength) {
    return text.substring(0, maxLength) + '...';
  }
  return text;
};

export default function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, sortOrder]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      let url = '/api/products?published=true';
      if (selectedCategory) {
        url += `&category=${selectedCategory}`;
      }
      url += `&sort=${sortOrder}`;
      const response = await fetch(url);
      const data = await response.json();
      setProducts(data);

      const uniqueCategories = [...new Set(data.map(product => product.category))];
      setCategories(uniqueCategories);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
  };

  const toggleSortOrder = () => {
    setSortOrder(prevOrder => (prevOrder === 'asc' ? 'desc' : 'asc'));
  };

  return (
    <div>
      {loading && (
        <div className="fixed inset-0 bg-black flex justify-center items-center z-50">
          <div className="text-white text-2xl font-bold">Loading...</div>
        </div>
      )}
      <Header />
      <main className="bg-black text-white container mx-auto py-16 px-5">
        <h1 className="text-4xl font-bold mb-8 text-center">Our Products</h1>
        <div className="flex justify-between mb-4">
          <select
            value={selectedCategory}
            onChange={handleCategoryChange}
            className="bg-gray-800 text-white p-2 rounded"
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
          <button
            onClick={toggleSortOrder}
            className="bg-gray-800 text-white p-2 rounded"
          >
            Sort by Time: {sortOrder === 'asc' ? 'Oldest First' : 'Newest First'}
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 py-5 gap-8 product-cards">
          {products.map((product) => (
            <Link
              href={`/product/${product._id}`}
              key={product._id}
              className="product-card"
            >
              <div>
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="product-image"
                />
              </div>
              <div className="product-info">
                <p className="product-name">{truncateText(product.name, 14)}</p>
                <p className="product-price">${product.price}</p>
                <p className="product-category">{product.category}</p>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
