import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

const PublicRoute = ({ children }) => {
    const { user, isLoading } = useSelector((state) => state.auth);

    if (isLoading) return null;

    if (user) {
        const role = user.role || 'buyer';
        return <Navigate to={`/dashboard/${role}`} replace />;
    }

    return children;
};

export default PublicRoute;
