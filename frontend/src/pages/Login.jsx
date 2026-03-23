// src/pages/Login.jsx (Actualizado)
import { useState } from 'react' // Importar useState
import logo from '../assets/logo_taller.png'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext' // Importar el hook de autenticación
import { usuariosMock } from '../services/mockData'

function Login() {
    const navigate = useNavigate()
    const { loginMock } = useAuth() // Obtener la función de login simulado

    // Estados para capturar los inputs
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')

    const handleSubmit = (e) => {
        e.preventDefault(); // Prevenir que la página se recargue
        setError('');

        if (!email || !password) {
            setError('Por favor, completa todos los campos.');
            return;
        }

        // Llamar a la validación mock
        const result = loginMock(email, password);

        if (result.success) {
            navigate('/dashboard'); 

        } else {
            setError(result.message); // Mostrar error de credenciales
        }
    }

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
        <div className="w-full max-w-sm">

            <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200 px-8 py-10" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>

            {/* Header */}
            <div className="flex flex-col items-center mb-8">
                {/* Logo container (sin cambios) */}
                <div className="w-50 h-40 bg-black rounded-2xl flex items-center justify-center mb-5 relative overflow-hidden">
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-red-600"></div>
                    <img src={logo} alt="Logo Taller" className="w-50 h-40 object-contain" />
                </div>

                {/* Título (sin cambios) */}
                <div className="flex items-center gap-2 mb-1">
                    <div className="w-5 h-0.5 bg-red-600 rounded"></div>
                    <h1 className="text-lg font-medium text-gray-900 tracking-wide">Sistema de gestión</h1>
                    <div className="w-5 h-0.5 bg-red-600 rounded"></div>
                </div>
            </div>

            <hr className="border-gray-100 mb-7" />

            {/* Mostrar Error si existe */}
            {error && (
                <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-600 font-medium">
                    {error}
                </div>
            )}

            {/* Usuario (Email) */}
            <div className="mb-5">
                <label className="block text-xs font-medium text-gray-900 uppercase tracking-wider mb-1.5">
                Email
                </label>
                <input
                type="email" // Cambiado a email
                value={email} // Conectar estado
                onChange={e => setEmail(e.target.value)} // Capturar cambio
                placeholder="juan@taller.com"
                className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-900 focus:outline-none focus:border-gray-400"
                required
                />
            </div>

            {/* Contraseña */}
            <div className="mb-7">
                <label className="block text-xs font-medium text-gray-900 uppercase tracking-wider mb-1.5">
                Contraseña
                </label>
                <input
                type="password"
                value={password} // Conectar estado
                onChange={e => setPassword(e.target.value)} // Capturar cambio
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-900 focus:outline-none focus:border-gray-400"
                required
                />
            </div>

            {/* Botón (Cambiado a type="submit") */}
            <button
                type="submit"
                className="w-full py-3 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
                Ingresar
            </button>

            </form>

            <p className="text-center text-xs text-gray-300 mt-4">
            © 2026 IpsoftPeru · Todos los derechos reservados
            </p>

        </div>
        </div>
    )
}

export default Login