import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  addToCart,
  fetchCartByUserId,
  updateCartItemById,
  deleteCartItemById,
  resetCartByUserId,
} from "./CartApi";

const LOCAL_CART_KEY = "guest_cart";

const getLocalCart = () => {
  const cart = localStorage.getItem(LOCAL_CART_KEY);
  console.log("Local cart: ", cart);
  return cart ? JSON.parse(cart) : [];
};

const saveLocalCart = (items) => {
  localStorage.setItem(LOCAL_CART_KEY, JSON.stringify(items));
};

// ================== Initial State ==================
const initialState = {
  status: "idle",
  items: [],
  cartItemAddStatus: "idle",
  cartItemRemoveStatus: "idle",
  errors: null,
  successMessage: null,
};

// ================== Thunks ==================
export const addToCartAsync = createAsyncThunk(
  "cart/addToCartAsync",
  async (item, { getState }) => {
    const state = getState();
    const userId = state.auth?.user?._id; // adjust auth slice if needed

    if (userId) {
      // logged in → use backend API
      const addedItem = await addToCart(item.product.id);
      return addedItem;
    } else {
      // guest → localStorage
      const cart = getLocalCart();
      const exists = cart.find((c) => c.product._id === item.product._id);

      let updatedCart;
      if (exists) {
        updatedCart = cart.map((c) =>
          c.product._id === item.product._id
            ? { ...c, quantity: c.quantity + item.quantity }
            : c
        );
      } else {
        updatedCart = [...cart, item]; // full product object stored here
      }

      saveLocalCart(updatedCart);
      return updatedCart;
    }
  }
);

export const fetchCartByUserIdAsync = createAsyncThunk(
  "cart/fetchCartByUserIdAsync",
  async (id, { getState }) => {
    const state = getState();
    const userId = state.auth?.user?._id;

    if (userId) {
      return await fetchCartByUserId(id);
    } else {
      return getLocalCart(); // guest cart
    }
  }
);

export const updateCartItemByIdAsync = createAsyncThunk(
  "cart/updateCartItemByIdAsync",
  async (update, { getState }) => {
    const state = getState();
    const userId = state.auth?.user?._id;

    if (userId) {
      return await updateCartItemById(update);
    } else {
      let cart = getLocalCart();
      cart = cart.map((c) =>
        c.product._id === update._id ? { ...c, quantity: update.quantity } : c
      );
      saveLocalCart(cart);
      return cart;
    }
  }
);

export const deleteCartItemByIdAsync = createAsyncThunk(
  "cart/deleteCartItemByIdAsync",
  async (id, { getState }) => {
    const state = getState();
    const userId = state.auth?.user?._id;

    if (userId) {
      return await deleteCartItemById(id);
    } else {
      let cart = getLocalCart();
      cart = cart.filter((item) => item.product._id !== id);
      saveLocalCart(cart);
      return cart;
    }
  }
);

export const resetCartByUserIdAsync = createAsyncThunk(
  "cart/resetCartByUserIdAsync",
  async (userId, { getState }) => {
    const state = getState();
    const loggedIn = state.auth?.user?._id;

    if (loggedIn) {
      return await resetCartByUserId(userId);
    } else {
      saveLocalCart([]); // clear guest cart
      return [];
    }
  }
);

// ================== Slice ==================
const cartSlice = createSlice({
  name: "cartSlice",
  initialState: initialState,
  reducers: {
    resetCartItemAddStatus: (state) => {
      state.cartItemAddStatus = "idle";
    },
    resetCartItemRemoveStatus: (state) => {
      state.cartItemRemoveStatus = "idle";
    },
  },
  extraReducers: (builder) => {
    builder
      // Add
      .addCase(addToCartAsync.pending, (state) => {
        state.cartItemAddStatus = "pending";
      })
      .addCase(addToCartAsync.fulfilled, (state, action) => {
        state.cartItemAddStatus = "fulfilled";
        // For guest users, action.payload is the full cart array
        if (Array.isArray(action.payload)) {
          state.items = action.payload;
        } else {
          state.items.push(action.payload);
        }
      })
      .addCase(addToCartAsync.rejected, (state, action) => {
        state.cartItemAddStatus = "rejected";
        state.errors = action.error;
      })

      // Fetch
      .addCase(fetchCartByUserIdAsync.pending, (state) => {
        state.status = "pending";
      })
      .addCase(fetchCartByUserIdAsync.fulfilled, (state, action) => {
        state.status = "fulfilled";
        state.items = action.payload;
      })
      .addCase(fetchCartByUserIdAsync.rejected, (state, action) => {
        state.status = "rejected";
        state.errors = action.error;
      })

      // Update
      .addCase(updateCartItemByIdAsync.pending, (state) => {
        state.status = "pending";
      })
      .addCase(updateCartItemByIdAsync.fulfilled, (state, action) => {
        state.status = "fulfilled";
        // For guest users, action.payload is the full cart array
        if (Array.isArray(action.payload)) {
          state.items = action.payload;
        } else {
          const index = state.items.findIndex(
            (item) => item._id === action.payload._id
          );
          if (index >= 0) {
            state.items[index] = action.payload;
          }
        }
      })
      .addCase(updateCartItemByIdAsync.rejected, (state, action) => {
        state.status = "rejected";
        state.errors = action.error;
      })

      // Delete
      .addCase(deleteCartItemByIdAsync.pending, (state) => {
        state.cartItemRemoveStatus = "pending";
      })
      .addCase(deleteCartItemByIdAsync.fulfilled, (state, action) => {
        state.cartItemRemoveStatus = "fulfilled";
        // For guest users, action.payload is the full cart array
        if (Array.isArray(action.payload)) {
          state.items = action.payload;
        } else {
          state.items = state.items.filter(
            (item) => item._id !== action.payload._id
          );
        }
      })
      .addCase(deleteCartItemByIdAsync.rejected, (state, action) => {
        state.cartItemRemoveStatus = "rejected";
        state.errors = action.error;
      })

      // Reset
      .addCase(resetCartByUserIdAsync.pending, (state) => {
        state.status = "pending";
      })
      .addCase(resetCartByUserIdAsync.fulfilled, (state, action) => {
        state.status = "fulfilled";
        state.items = [];
      })
      .addCase(resetCartByUserIdAsync.rejected, (state, action) => {
        state.status = "rejected";
        state.errors = action.error;
      });
  },
});

export const selectCartStatus = (state) => state.CartSlice.status;
export const selectCartItems = (state) => state.CartSlice.items;
export const selectCartErrors = (state) => state.CartSlice.errors;
export const selectCartSuccessMessage = (state) =>
  state.CartSlice.successMessage;
export const selectCartItemAddStatus = (state) =>
  state.CartSlice.cartItemAddStatus;
export const selectCartItemRemoveStatus = (state) =>
  state.CartSlice.cartItemRemoveStatus;

export const { resetCartItemAddStatus, resetCartItemRemoveStatus } =
  cartSlice.actions;

export default cartSlice.reducer;
