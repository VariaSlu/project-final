import { Link, useLocation } from "react-router-dom";

const Nav = () => {
  const { pathname } = useLocation();
  const A = ({ to, children }) => (
    <Link
      to={to}
      style={{
        padding: "8px 12px",
        borderRadius: 8,
        textDecoration: "none",
        background: pathname === to ? "#eee" : "transparent"
      }
      }
    >
      {children}
    </Link>
  );

  return (
    <nav style={{
      position: "sticky", top: 0, background: "white",
      display: "flex", gap: 8, padding: 8, borderBottom: "1px solid #eee"
    }}>
      <A to="/" > Dashboard </A>
      < A to="/kids" > Kids </A>
      < A to="/items" > Items </A>
    </nav>
  );
};

export default Nav;
