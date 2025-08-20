import {createAsyncThunk, createSlice} from '@reduxjs/toolkit'
import { createOrder, getAllOrders, getOrderByUserId, updateOrderById, getOrderById, updateOrderStatus } from './OrderApi'


const initialState={
    status:"idle",
    orderUpdateStatus:"idle",
    orderFetchStatus:"idle",
    orders:[],
    currentOrder:null,
    errors:null,
    successMessage:null
}

export const createOrderAsync=createAsyncThunk("orders/createOrderAsync",async(order)=>{
    const createdOrder=await createOrder(order)
    return createdOrder
})

export const getAllOrdersAsync=createAsyncThunk("orders/getAllOrdersAsync",async()=>{
    const orders=await getAllOrders()
    return orders
})

export const getOrderByUserIdAsync=createAsyncThunk("orders/getOrderByUserIdAsync",async(id)=>{
    const orders=await getOrderByUserId(id)
    return orders
})

export const updateOrderByIdAsync=createAsyncThunk("orders/updateOrderByIdAsync",async(update)=>{
    const updatedOrder=await updateOrderById(update)
    return updatedOrder
})

export const getOrderByIdAsync=createAsyncThunk("orders/getOrderByIdAsync",async(orderId)=>{
    const order=await getOrderById(orderId)
    return order
})

export const updateOrderStatusAsync=createAsyncThunk("orders/updateOrderStatusAsync",async({orderId, status})=>{
    const result=await updateOrderStatus(orderId, status)
    return {orderId, ...result}
})

const orderSlice=createSlice({
    name:'orderSlice',
    initialState:initialState,
    reducers:{
        resetCurrentOrder:(state)=>{
            state.currentOrder=null
        },
        resetOrderUpdateStatus:(state)=>{
            state.orderUpdateStatus='idle'
        },
        resetOrderFetchStatus:(state)=>{
            state.orderFetchStatus='idle'
        }
    },
    extraReducers:(builder)=>{
        builder
            .addCase(createOrderAsync.pending,(state)=>{
                state.status='pending'
            })
            .addCase(createOrderAsync.fulfilled,(state,action)=>{
                state.status='fulfilled'
                state.orders.push(action.payload)
                state.currentOrder=action.payload
            })
            .addCase(createOrderAsync.rejected,(state,action)=>{
                state.status='rejected'
                state.errors=action.error
            })

            .addCase(getAllOrdersAsync.pending,(state)=>{
                state.orderFetchStatus='pending'
            })
            .addCase(getAllOrdersAsync.fulfilled,(state,action)=>{
                state.orderFetchStatus='fulfilled'
                state.orders=action.payload
            })
            .addCase(getAllOrdersAsync.rejected,(state,action)=>{
                state.orderFetchStatus='rejected'
                state.errors=action.error
            })

            .addCase(getOrderByUserIdAsync.pending,(state)=>{
                state.orderFetchStatus='pending'
            })
            .addCase(getOrderByUserIdAsync.fulfilled,(state,action)=>{
                state.orderFetchStatus='fulfilled'
                state.orders=action.payload
            })
            .addCase(getOrderByUserIdAsync.rejected,(state,action)=>{
                state.orderFetchStatus='rejected'
                state.errors=action.error
            })

            .addCase(updateOrderByIdAsync.pending,(state)=>{
                state.orderUpdateStatus='pending'
            })
            .addCase(updateOrderByIdAsync.fulfilled,(state,action)=>{
                state.orderUpdateStatus='fulfilled'
                const index=state.orders.findIndex((order)=>order._id===action.payload._id)
                state.orders[index]=action.payload
            })
            .addCase(updateOrderByIdAsync.rejected,(state,action)=>{
                state.orderUpdateStatus='rejected'
                state.errors=action.error
            })

            .addCase(getOrderByIdAsync.pending,(state)=>{
                state.status='pending'
            })
            .addCase(getOrderByIdAsync.fulfilled,(state,action)=>{
                state.status='fulfilled'
                state.currentOrder=action.payload
            })
            .addCase(getOrderByIdAsync.rejected,(state,action)=>{
                state.status='rejected'
                state.errors=action.error
            })

            .addCase(updateOrderStatusAsync.pending,(state)=>{
                state.orderUpdateStatus='pending'
            })
            .addCase(updateOrderStatusAsync.fulfilled,(state,action)=>{
                state.orderUpdateStatus='fulfilled'
                // Update the order in the orders array if it exists
                const index=state.orders.findIndex((order)=>order._id===action.payload.orderId)
                if(index !== -1) {
                    state.orders[index].status = action.payload.newStatus
                    state.orders[index].statusHistory = action.payload.statusHistory
                }
                // Update current order if it matches
                if(state.currentOrder && state.currentOrder._id === action.payload.orderId) {
                    state.currentOrder.status = action.payload.newStatus
                    state.currentOrder.statusHistory = action.payload.statusHistory
                }
            })
            .addCase(updateOrderStatusAsync.rejected,(state,action)=>{
                state.orderUpdateStatus='rejected'
                state.errors=action.error
            })
    }
})

// exporting reducers
export const {resetCurrentOrder,resetOrderUpdateStatus,resetOrderFetchStatus}=orderSlice.actions

// exporting selectors
export const selectOrderStatus=(state)=>state.OrderSlice.status
export const selectOrders=(state)=>state.OrderSlice.orders
export const selectOrdersErrors=(state)=>state.OrderSlice.errors
export const selectOrdersSuccessMessage=(state)=>state.OrderSlice.successMessage
export const selectCurrentOrder=(state)=>state.OrderSlice.currentOrder
export const selectOrderUpdateStatus=(state)=>state.OrderSlice.orderUpdateStatus
export const selectOrderFetchStatus=(state)=>state.OrderSlice.orderFetchStatus

export default orderSlice.reducer