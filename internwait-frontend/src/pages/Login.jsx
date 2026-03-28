import { useState } from "react";
import { useNavigate } from "react-router-dom";

function CompanyLogin(){

  const [email,setEmail] = useState("");
  const [password,setPassword] = useState("");

  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();

    console.log("Company login:",email,password);

    navigate("/dashboard");
  };

  return (

    <div className="auth-container">

      <div className="auth-box">

        <h2>Company Login</h2>

        <form onSubmit={handleLogin}>

          <input
            type="email"
            placeholder="Company Email"
            value={email}
            onChange={(e)=>setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e)=>setPassword(e.target.value)}
            required
          />

          <button type="submit">
            Login
          </button>

        </form>

      </div>

    </div>

  );
}

export default CompanyLogin;