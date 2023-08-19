import React from 'react'
import PageRoutes from './Routes'
import { Outlet } from 'react-router-dom'


const PageContent = () => {
  return (
    <>
    
      <PageRoutes/>
      <Outlet/>
    </>
  )
}

export default PageContent
