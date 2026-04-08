import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { searchProducts, clearSearch, fetchProducts, resetSearchResults } from '../features/products/productSlice';

const ProductSearch = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const dispatch = useDispatch();

    useEffect(() => {
        const controller = new AbortController();
        const signal = controller.signal;

        const debounceTimer = setTimeout(() => {
            if (searchTerm.trim() === "") {
                dispatch(resetSearchResults());
                return;
            }
            dispatch(searchProducts({ searchTerm, signal }));
        }, 500);

        return () => {
            clearTimeout(debounceTimer);
            controller.abort();
        };
    }, [searchTerm, dispatch]);

    return (
        <div className="relative w-full max-w-lg mx-auto mb-0">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
            </div>
            <input
                type="text"
                className="block w-full p-4 pl-10 text-sm text-gray-900 border border-gray-300 rounded-xl bg-white focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                placeholder="Search for books, categories, or authors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>
    );
};

export default ProductSearch;