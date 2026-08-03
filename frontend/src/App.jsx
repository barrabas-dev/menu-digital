import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [mensaje, setMensaje] = useState('Cargando...')
  const [error, setError] = useState(null)

  useEffect(() => {
    // Usamos la variable de entorno definida en .env
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'
    
    fetch(`${apiUrl}/test/`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Error en la red al intentar conectar con Django')
        }
        return response.json()
      })
      .then(data => setMensaje(data.message))
      .catch(error => {
        console.error("Hubo un problema con la petición Fetch:", error)
        setError(error.message)
      })
  }, [])

  return (
    <div style={{ textAlign: 'center', padding: '50px' }}>
      <h1>Módulo de Pruebas 🎉</h1>
      <h2>Conexión React + Django</h2>
      
      <div style={{
        marginTop: '20px', 
        padding: '20px', 
        backgroundColor: '#242424', 
        borderRadius: '8px',
        color: '#fff',
        display: 'inline-block'
      }}>
        {error ? (
          <p style={{ color: '#ff6b6b' }}>Error: {error}</p>
        ) : (
          <p style={{ color: '#4dabf7', fontSize: '1.2rem' }}>{mensaje}</p>
        )}
      </div>
    </div>
  )
}

export default App
