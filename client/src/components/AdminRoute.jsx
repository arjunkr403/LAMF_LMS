import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const AdminRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <div>Loading...</div>;

  if (user && user.role === 'ADMIN') {
    return children;
  } else {
    return <Navigate to="/dashboard" />;
  }
};

export default AdminRoute;
