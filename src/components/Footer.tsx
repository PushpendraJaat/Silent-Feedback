import React from 'react'

const Footer = () => {
  return (
    <div>
       <footer className='flex items-center justify-center w-full h-24 border-t'>
                <p className='text-center text-sm'>© {new Date().getFullYear()} Secret Message. All rights reserved.</p>
        </footer>
    </div>
  )
}

export default Footer
