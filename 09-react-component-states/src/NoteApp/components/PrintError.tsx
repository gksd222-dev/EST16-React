import './PrintError.css'

function PrintError({children}:{children:string}) {
  return (
    <p role="alert" className='PrintError'> 
      {children} 
    </p>
  )
}
export default PrintError