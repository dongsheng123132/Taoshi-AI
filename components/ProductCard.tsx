import React from 'react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onThreeDViewClick: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onThreeDViewClick }) => {
  const googleSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(product.name)}`;

  return (
    <div className="bg-gray-700/50 p-4 rounded-lg shadow-md transition-all duration-300 hover:bg-gray-700 hover:shadow-cyan-500/10 hover:shadow-lg hover:ring-2 hover:ring-cyan-500/50">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex-grow">
          <h3 className="text-lg font-bold text-cyan-400">{product.name}</h3>
          <p className="text-gray-300 text-sm mt-1">{product.description}</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <button
            onClick={() => onThreeDViewClick(product)}
            className="flex-shrink-0 bg-purple-500 hover:bg-purple-600 text-white font-semibold py-2 px-4 rounded-md transition-colors text-sm flex items-center gap-2 w-full sm:w-auto justify-center"
            aria-label={`Generate a 3D view of ${product.name}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.27 6.96L12 12.01l8.73-5.05M12 22.08V12" />
            </svg>
            3D View
          </button>
          <a
            href={googleSearchUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-shrink-0 bg-teal-500 hover:bg-teal-600 text-white font-semibold py-2 px-4 rounded-md transition-colors text-sm flex items-center gap-2 w-full sm:w-auto justify-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Search
          </a>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;