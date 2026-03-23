import Layout from '../components/layout/Layout'
import { useAuth } from '../context/AuthContext'

function DashboardHome() {
  const { user } = useAuth() // Para saber quién entró

  return (
    <Layout tituloNavbar="Dashboard Principal">
      <div className="bg-white p-8 rounded-xl border border-gray-100 shadow-sm">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          ¡Bienvenido, {user?.nombre || 'Usuario'}!
        </h2>
        <p className="text-gray-500 mb-6">
          Has iniciado sesión con el rol de <strong>{user?.rol || 'No definido'}</strong>.
        </p>

        {/* Aquí a futuro puedes poner gráficos, tarjetas de resumen, etc. */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
            <h3 className="text-blue-700 font-medium">Alertas del sistema</h3>
            <p className="text-2xl font-bold text-blue-900 mt-2">0</p>
          </div>
          {/* Más tarjetas de resumen... */}
        </div>
      </div>
    </Layout>
  )
}

export default DashboardHome