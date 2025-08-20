import React, { useEffect, useState } from 'react'
import { CartItem } from './CartItem'
import { Button, Chip, Paper, Stack, Typography, useMediaQuery, useTheme } from '@mui/material'
import { resetCartItemRemoveStatus, selectCartItemRemoveStatus, selectAllCartItems, selectIsGuestMode, selectLocalCartItems, setGuestMode, loadLocalCart } from '../CartSlice'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import { SHIPPING, TAXES } from '../../../constants'
import { toast } from 'react-toastify'
import {motion} from 'framer-motion'
import { selectLoggedInUser } from '../../auth/AuthSlice'
import { enrichGuestCartItems } from '../../../utils/guestCartUtils'

export const Cart = ({checkout}) => {
    const rawItems=useSelector(selectAllCartItems) // Get items based on guest/authenticated mode
    const localCartItems=useSelector(selectLocalCartItems)
    const isGuestMode=useSelector(selectIsGuestMode)
    const loggedInUser=useSelector(selectLoggedInUser)
    const [enrichedGuestItems, setEnrichedGuestItems] = useState([])
    
    const dispatch=useDispatch()
    
    // Initialize guest mode if user is not logged in
    useEffect(() => {
        if (!loggedInUser) {
            console.log('👤 No logged in user, setting guest mode')
            dispatch(setGuestMode(true))
            dispatch(loadLocalCart())
        } else {
            console.log('✅ User is logged in, setting authenticated mode')
            dispatch(setGuestMode(false))
        }
    }, [loggedInUser, dispatch])
    
    // Use enriched items for guest mode, raw items for authenticated mode
    const items = isGuestMode ? enrichedGuestItems : rawItems
    
    // Calculate subtotal differently for guest vs authenticated users
    const subtotal = isGuestMode 
        ? items.reduce((acc,item)=>item.price*item.quantity+acc,0)
        : items.reduce((acc,item)=>item.product.price*item.quantity+acc,0)
    
    const totalItems=items.reduce((acc,item)=>acc+item.quantity,0)
    const navigate=useNavigate()
    const theme=useTheme()
    const is900=useMediaQuery(theme.breakpoints.down(900))

    const cartItemRemoveStatus=useSelector(selectCartItemRemoveStatus)

    // Enrich guest cart items with product data
    useEffect(() => {
        if (isGuestMode && localCartItems.length > 0) {
            enrichGuestCartItems(localCartItems, dispatch).then(enrichedItems => {
                setEnrichedGuestItems(enrichedItems)
            })
        } else if (!isGuestMode) {
            setEnrichedGuestItems([])
        }
    }, [isGuestMode, localCartItems, dispatch])

    const handleCheckout = () => {
        if (isGuestMode || !loggedInUser) {
            // Store current path to redirect back after login
            localStorage.setItem('redirectAfterLogin', '/checkout')
            navigate('/login')
        } else {
            navigate('/checkout')
        }
    }

    useEffect(()=>{
        window.scrollTo({
            top:0,
            behavior:"instant"
        })
    },[])

    // Only redirect if cart is truly empty (not loading) and not in checkout mode
    useEffect(()=>{
        // Don't redirect automatically - let users see empty cart message
        // Users can navigate back manually using the "Continue Shopping" button
        console.log('� Cart state:', {
            isGuestMode,
            localCartItemsLength: localCartItems.length,
            itemsLength: items.length,
            checkout
        })
    },[items, isGuestMode, localCartItems, checkout])

    useEffect(()=>{
        if(cartItemRemoveStatus==='fulfilled'){
            toast.success("Product removed from cart")
        }
        else if(cartItemRemoveStatus==='rejected'){
            toast.error("Error removing product from cart, please try again later")
        }
    },[cartItemRemoveStatus])

    useEffect(()=>{
        return ()=>{
            dispatch(resetCartItemRemoveStatus())
        }
    },[])

  return (
    <Stack justifyContent={'flex-start'} alignItems={'center'} mb={'5rem'} >

        <Stack width={is900?'auto':'50rem'} mt={'3rem'} paddingLeft={checkout?0:2} paddingRight={checkout?0:2} rowGap={4} >

            {/* cart items */}
            <Stack rowGap={2}>
            {
                items && items.length > 0 ? items.map((item)=>(
                    <CartItem 
                        key={item._id} 
                        id={item._id} 
                        title={isGuestMode ? item.title : item.product.title} 
                        brand={isGuestMode ? item.brand : item.product.brand.name} 
                        category={isGuestMode ? item.category : item.product.category.name} 
                        price={isGuestMode ? item.price : item.product.price} 
                        quantity={item.quantity} 
                        thumbnail={isGuestMode ? item.thumbnail : item.product.thumbnail} 
                        stockQuantity={isGuestMode ? item.stockQuantity : item.product.stockQuantity} 
                        productId={isGuestMode ? item.productId : item.product._id}
                        isGuestMode={isGuestMode}
                    />
                )) : (
                    <Stack alignItems={'center'} spacing={2} py={4}>
                        <Typography variant="h6" color="text.secondary">
                            Your cart is empty
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {isGuestMode ? 'Add some products to get started!' : 'Add some products to your cart!'}
                        </Typography>
                        <Button variant="contained" component={Link} to="/">
                            Continue Shopping
                        </Button>
                    </Stack>
                )
            }
            </Stack>
            
            {/* Only show subtotal and checkout when there are items */}
            {items && items.length > 0 && (
            <>
            {/* subtotal */}
            <Stack flexDirection={'row'} justifyContent={'space-between'} alignItems={'center'}>

                {
                    checkout?(
                        <Stack rowGap={2} width={'100%'}>

                            <Stack flexDirection={'row'} justifyContent={'space-between'}>
                                <Typography>Subtotal</Typography>
                                <Typography>${subtotal}</Typography>
                            </Stack>

                            <Stack flexDirection={'row'} justifyContent={'space-between'}>
                                <Typography>Shipping</Typography>
                                <Typography>${SHIPPING}</Typography>
                            </Stack>

                            <Stack flexDirection={'row'} justifyContent={'space-between'}>
                                <Typography>Taxes</Typography>
                                <Typography>${TAXES}</Typography> 
                            </Stack>

                            <hr/>

                            <Stack flexDirection={'row'} justifyContent={'space-between'}>
                                <Typography>Total</Typography>
                                <Typography>${subtotal+SHIPPING+TAXES}</Typography>
                            </Stack>
                            

                        </Stack>
                    ):(
                        <>
                            <Stack>
                                <Typography variant='h6' fontWeight={500}>Subtotal</Typography>
                                <Typography>Total items in cart {totalItems}</Typography>
                                <Typography variant='body1' color={'text.secondary'}>Shipping and taxes will be calculated at checkout.</Typography>
                            </Stack>

                            <Stack>
                                <Typography variant='h6' fontWeight={500}>${subtotal}</Typography>
                            </Stack>
                        </>
                    )
                }

            </Stack>
            
            {/* checkout or continue shopping */}
            {
            !checkout && 
            <Stack rowGap={'1rem'}>
                <Button variant='contained' onClick={handleCheckout}>
                    {isGuestMode ? 'Login to Checkout' : 'Checkout'}
                </Button>
                <motion.div style={{alignSelf:'center'}} whileHover={{y:2}}><Chip sx={{cursor:"pointer",borderRadius:"8px"}} component={Link} to={'/'} label="or continue shopping" variant='outlined'/></motion.div>
            </Stack>
            }
            </>
            )}
    
        </Stack>


    </Stack>
  )
}
