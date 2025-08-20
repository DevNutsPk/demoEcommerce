import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { logoutAsync, selectLoggedInUser } from '../AuthSlice'
import { useNavigate } from 'react-router-dom'
import { setGuestMode, clearLocalCartStorage } from '../../cart/CartSlice'

export const Logout = () => {
    const dispatch=useDispatch()
    const loggedInUser=useSelector(selectLoggedInUser)
    const navigate=useNavigate()

    useEffect(()=>{
        dispatch(logoutAsync())
        // Clear any guest cart data and set to guest mode
        dispatch(clearLocalCartStorage())
        dispatch(setGuestMode(true))
        console.log('👋 User logged out, clearing cart and setting guest mode')
    },[])

    useEffect(()=>{
        if(!loggedInUser){
            console.log('✅ Logout successful, redirecting to home page')
            navigate("/")
        }
    },[loggedInUser])

  return (
    <></>
  )
}
