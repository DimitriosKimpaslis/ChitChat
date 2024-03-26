import { Outlet } from 'react-router-dom'

const Auth = () => {
  return (
      <div className='w-full h-full overflow-hidden'>
          <Outlet />
    </div>
  )
}

export default Auth