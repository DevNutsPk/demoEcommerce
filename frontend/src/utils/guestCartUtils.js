// Utility functions for guest cart management
import { fetchProductByIdAsync } from '../features/products/ProductSlice'

export const enrichGuestCartItems = async (localCartItems, dispatch) => {
    const enrichedItems = []
    
    for (const item of localCartItems) {
        try {
            // Fetch product data for each cart item
            const productResult = await dispatch(fetchProductByIdAsync(item.productId))
            
            if (productResult.payload) {
                const product = productResult.payload
                enrichedItems.push({
                    ...item,
                    title: product.title,
                    brand: product.brand?.name || 'Unknown Brand',
                    category: product.category?.name || 'Unknown Category',
                    price: product.price,
                    thumbnail: product.thumbnail,
                    stockQuantity: product.stockQuantity
                })
            }
        } catch (error) {
            console.error('Error fetching product data for guest cart item:', error)
            // Add item with minimal data if fetching fails
            enrichedItems.push({
                ...item,
                title: 'Product',
                brand: 'Unknown',
                category: 'Unknown',
                price: 0,
                thumbnail: '',
                stockQuantity: 0
            })
        }
    }
    
    return enrichedItems
}

export const calculateCartTotals = (cartItems, isGuestMode) => {
    if (!cartItems || cartItems.length === 0) {
        return { subtotal: 0, totalItems: 0 }
    }
    
    const subtotal = isGuestMode 
        ? cartItems.reduce((acc, item) => item.price * item.quantity + acc, 0)
        : cartItems.reduce((acc, item) => item.product.price * item.quantity + acc, 0)
    
    const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0)
    
    return { subtotal, totalItems }
}
