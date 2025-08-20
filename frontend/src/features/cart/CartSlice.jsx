import {createAsyncThunk, createSlice} from '@reduxjs/toolkit'
import {addToCart,fetchCartByUserId,updateCartItemById,deleteCartItemById, resetCartByUserId} from './CartApi'

const CART_STORAGE_KEY = 'guest_cart'

// Debug helper function - accessible from browser console
window.debugCart = () => {
    const cart = localStorage.getItem(CART_STORAGE_KEY)
    console.log('🔍 Debug Cart Info:')
    console.log('📦 Raw localStorage value:', cart)
    console.log('📊 Parsed cart items:', cart ? JSON.parse(cart) : 'No items')
    console.log('📈 Total items:', cart ? JSON.parse(cart).length : 0)
    console.log('💾 All localStorage keys:', Object.keys(localStorage))
    return cart ? JSON.parse(cart) : []
}

// Helper functions for local storage
const getLocalCart = () => {
    try {
        const cart = localStorage.getItem(CART_STORAGE_KEY)
        const parsedCart = cart ? JSON.parse(cart) : []
        console.log('📦 Getting local cart from localStorage:', parsedCart)
        return parsedCart
    } catch (error) {
        console.error('Error reading from localStorage:', error)
        return []
    }
}

const setLocalCart = (items) => {
    try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items))
        console.log('💾 Saving local cart to localStorage:', items)
        console.log('📊 Current localStorage state:', {
            guest_cart: localStorage.getItem(CART_STORAGE_KEY),
            total_items: items.length
        })
    } catch (error) {
        console.error('Error writing to localStorage:', error)
    }
}

const clearLocalCart = () => {
    try {
        console.log('🗑️ Clearing local cart from localStorage')
        localStorage.removeItem(CART_STORAGE_KEY)
        console.log('📊 localStorage after clear:', localStorage.getItem(CART_STORAGE_KEY))
    } catch (error) {
        console.error('Error clearing localStorage:', error)
    }
}

const initialState={
    status:"idle",
    items:[],
    localItems: getLocalCart(), // Store local cart items for guest users
    cartItemAddStatus:"idle",
    cartItemRemoveStatus:"idle",
    errors:null,
    successMessage:null,
    isGuestMode: false // Track if user is in guest mode
}

export const addToCartAsync=createAsyncThunk('cart/addToCartAsync',async(item)=>{
    const addedItem=await addToCart(item)
    return addedItem
})
export const fetchCartByUserIdAsync=createAsyncThunk('cart/fetchCartByUserIdAsync',async(id)=>{
    const items=await fetchCartByUserId(id)
    return items
})
export const updateCartItemByIdAsync=createAsyncThunk('cart/updateCartItemByIdAsync',async(update)=>{
    const updatedItem=await updateCartItemById(update)
    return updatedItem
})
export const deleteCartItemByIdAsync=createAsyncThunk('cart/deleteCartItemByIdAsync',async(id)=>{
    const deletedItem=await deleteCartItemById(id)
    return deletedItem
})
export const resetCartByUserIdAsync=createAsyncThunk('cart/resetCartByUserIdAsync',async(userId)=>{
    const updatedCart=await resetCartByUserId(userId)
    return updatedCart
})

// New async thunk to sync local cart to database after login
export const syncLocalCartAsync = createAsyncThunk('cart/syncLocalCartAsync', async(userId) => {
    const localItems = getLocalCart()
    console.log('🔄 Starting cart sync for user:', userId)
    console.log('📦 Local cart items to sync:', localItems)
    
    const syncedItems = []
    
    for (const item of localItems) {
        try {
            console.log('⬆️ Syncing item:', item)
            const addedItem = await addToCart({
                userId,
                productId: item.productId,
                quantity: item.quantity,
                size: item.size,
                color: item.color
            })
            syncedItems.push(addedItem)
            console.log('✅ Successfully synced item:', addedItem)
        } catch (error) {
            console.error('❌ Error syncing cart item:', error, item)
        }
    }
    
    console.log('🎉 Cart sync completed. Synced items:', syncedItems)
    console.log('🗑️ Clearing local storage after successful sync')
    // Clear local storage after sync
    clearLocalCart()
    return syncedItems
})

const cartSlice=createSlice({
    name:"cartSlice",
    initialState:initialState,
    reducers:{
        resetCartItemAddStatus:(state)=>{
            state.cartItemAddStatus='idle'
        },
        resetCartItemRemoveStatus:(state)=>{
            state.cartItemRemoveStatus='idle'
        },
        setGuestMode:(state, action)=>{
            state.isGuestMode = action.payload
        },
        addToLocalCart:(state, action)=>{
            console.log('🛒 Adding item to local cart:', action.payload)
            const existingItemIndex = state.localItems.findIndex(
                item => item.productId === action.payload.productId && 
                       item.size === action.payload.size && 
                       item.color === action.payload.color
            )
            
            if (existingItemIndex >= 0) {
                state.localItems[existingItemIndex].quantity += action.payload.quantity
                console.log('📈 Updated existing item quantity:', state.localItems[existingItemIndex])
            } else {
                const newItem = {
                    ...action.payload,
                    _id: Date.now().toString() // Temporary ID for local items
                }
                state.localItems.push(newItem)
                console.log('➕ Added new item to cart:', newItem)
            }
            setLocalCart(state.localItems)
            console.log('🛍️ Total items in local cart:', state.localItems.length)
        },
        updateLocalCartItem:(state, action)=>{
            console.log('🔄 Updating local cart item:', action.payload)
            const { id, quantity } = action.payload
            const itemIndex = state.localItems.findIndex(item => item._id === id)
            
            if (itemIndex >= 0) {
                if (quantity <= 0) {
                    console.log('🗑️ Removing item due to zero quantity:', state.localItems[itemIndex])
                    state.localItems.splice(itemIndex, 1)
                } else {
                    console.log('📊 Updating quantity from', state.localItems[itemIndex].quantity, 'to', quantity)
                    state.localItems[itemIndex].quantity = quantity
                }
                setLocalCart(state.localItems)
            }
        },
        removeFromLocalCart:(state, action)=>{
            console.log('❌ Removing item from local cart with ID:', action.payload)
            const beforeLength = state.localItems.length
            state.localItems = state.localItems.filter(item => item._id !== action.payload)
            console.log('📉 Items removed:', beforeLength - state.localItems.length)
            setLocalCart(state.localItems)
        },
        clearLocalCartStorage:(state)=>{
            console.log('🧹 Clearing entire local cart storage')
            state.localItems = []
            clearLocalCart()
        },
        loadLocalCart:(state)=>{
            console.log('📥 Loading cart from localStorage')
            state.localItems = getLocalCart()
            console.log('✅ Loaded items:', state.localItems)
        }
    },
    extraReducers:(builder)=>{
        builder
            .addCase(addToCartAsync.pending,(state)=>{
                state.cartItemAddStatus='pending'
            })
            .addCase(addToCartAsync.fulfilled,(state,action)=>{
                state.cartItemAddStatus='fulfilled'
                state.items.push(action.payload)
            })
            .addCase(addToCartAsync.rejected,(state,action)=>{
                state.cartItemAddStatus='rejected'
                state.errors=action.error
            })

            .addCase(fetchCartByUserIdAsync.pending,(state)=>{
                state.status='pending'
            })
            .addCase(fetchCartByUserIdAsync.fulfilled,(state,action)=>{
                state.status='fulfilled'
                state.items=action.payload
            })
            .addCase(fetchCartByUserIdAsync.rejected,(state,action)=>{
                state.status='rejected'
                state.errors=action.error
            })

            .addCase(updateCartItemByIdAsync.pending,(state)=>{
                state.status='pending'
            })
            .addCase(updateCartItemByIdAsync.fulfilled,(state,action)=>{
                state.status='fulfilled'
                const index=state.items.findIndex((item)=>item._id===action.payload._id)
                state.items[index]=action.payload
            })
            .addCase(updateCartItemByIdAsync.rejected,(state,action)=>{
                state.status='rejected'
                state.errors=action.error
            })

            .addCase(deleteCartItemByIdAsync.pending,(state)=>{
                state.cartItemRemoveStatus='pending'
            })
            .addCase(deleteCartItemByIdAsync.fulfilled,(state,action)=>{
                state.cartItemRemoveStatus='fulfilled'
                state.items=state.items.filter((item)=>item._id!==action.payload._id)
            })
            .addCase(deleteCartItemByIdAsync.rejected,(state,action)=>{
                state.cartItemRemoveStatus='rejected'
                state.errors=action.error
            })

            .addCase(resetCartByUserIdAsync.pending,(state)=>{
                state.status='pending'
            })
            .addCase(resetCartByUserIdAsync.fulfilled,(state)=>{
                state.status='fulfilled'
                state.items=[]
            })
            .addCase(resetCartByUserIdAsync.rejected,(state,action)=>{
                state.status='rejected'
                state.errors=action.error
            })

            .addCase(syncLocalCartAsync.pending,(state)=>{
                state.status='pending'
            })
            .addCase(syncLocalCartAsync.fulfilled,(state,action)=>{
                state.status='fulfilled'
                state.items = [...state.items, ...action.payload]
                state.localItems = []
                state.isGuestMode = false
            })
            .addCase(syncLocalCartAsync.rejected,(state,action)=>{
                state.status='rejected'
                state.errors=action.error
            })
    }
})

// exporting selectors
export const selectCartStatus=(state)=>state.CartSlice.status
export const selectCartItems=(state)=>state.CartSlice.items
export const selectLocalCartItems=(state)=>state.CartSlice.localItems
export const selectAllCartItems=(state)=>state.CartSlice.isGuestMode ? state.CartSlice.localItems : state.CartSlice.items
export const selectCartErrors=(state)=>state.CartSlice.errors
export const selectCartSuccessMessage=(state)=>state.CartSlice.successMessage
export const selectCartItemAddStatus=(state)=>state.CartSlice.cartItemAddStatus
export const selectCartItemRemoveStatus=(state)=>state.CartSlice.cartItemRemoveStatus
export const selectIsGuestMode=(state)=>state.CartSlice.isGuestMode

// exporting reducers
export const {
    resetCartItemAddStatus,
    resetCartItemRemoveStatus,
    setGuestMode,
    addToLocalCart,
    updateLocalCartItem,
    removeFromLocalCart,
    clearLocalCartStorage,
    loadLocalCart
}=cartSlice.actions

export default cartSlice.reducer