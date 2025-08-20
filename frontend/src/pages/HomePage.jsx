import React, { useEffect } from 'react'
import { Navbar } from '../features/navigation/components/Navbar'
import { ProductList } from '../features/products/components/ProductList'
import { resetAddressStatus, selectAddressStatus } from '../features/address/AddressSlice'
import { useDispatch, useSelector } from 'react-redux'
import {Footer} from '../features/footer/Footer'
import { selectLoggedInUser } from '../features/auth/AuthSlice'
import { setGuestMode, loadLocalCart, syncLocalCartAsync } from '../features/cart/CartSlice'

export const HomePage = () => {

  const dispatch=useDispatch()
  const addressStatus=useSelector(selectAddressStatus)
  const loggedInUser = useSelector(selectLoggedInUser)

  useEffect(()=>{
    if(addressStatus==='fulfilled'){
      dispatch(resetAddressStatus())
    }
  },[addressStatus])

  useEffect(() => {
    // Set cart mode based on authentication status
    if (loggedInUser) {
      // User is logged in, sync local cart if any
      dispatch(setGuestMode(false))
      const localCart = localStorage.getItem('guest_cart')
      if (localCart && JSON.parse(localCart).length > 0) {
        dispatch(syncLocalCartAsync(loggedInUser._id))
      }
    } else {
      // User is not logged in, set guest mode and load local cart
      dispatch(setGuestMode(true))
      dispatch(loadLocalCart())
    }
  }, [loggedInUser, dispatch])

  return (
    <>
    <Navbar isProductList={true}/>
    <ProductList/>
    <Footer/>
    </>
  )
}
