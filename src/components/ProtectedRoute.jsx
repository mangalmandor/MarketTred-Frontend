import { useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles }) => {
    const { user } = useSelector((state) => state.auth);

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        // Danger: Agar user pehle se isi dashboard par hai toh loop ban jayega
        // Isliye tabhi redirect karein jab dashboard mismatch ho
        return <Navigate to={`/dashboard/${user.role}`} replace />;
    }

    // AGAR Wrapper ki tarah use ho raha hai (element={<ProtectedRoute />}) toh Outlet return karein
    // AGAR Component wrap ho raha hai (<PR><Comp /></PR>) toh children return karein
    return children ? children : <Outlet />;
};

export default ProtectedRoute;