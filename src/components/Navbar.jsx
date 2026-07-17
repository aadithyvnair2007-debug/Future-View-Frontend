import React from 'react'

const Navbar = () => {
  return (
      <nav className="w-full bg-blue-500 text-black py-4 px-8 flex justify-between items-center shadow-md">
       <div className="flex items-center gap-3">
        <img 
          src="Future-View.png" // Replace this path with your actual logo file (e.g., logo.png)
          alt="FV" 
          className="w-8 h-8 object-contain" // Controls width and height cleanly
        />
       <h1 className='text-2xl font-bold'>Future View</h1>
       <div className=' flex gap-10'>
        <br />

       </div>
       </div>
      </nav>
  )
}

export default Navbar
