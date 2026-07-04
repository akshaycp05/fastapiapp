import { useState } from "react";

function Counter() {
  const [count, setCount] = useState(0);

  const increment = () => {
    setCount(count + 1);
  };

  return (
    // Reusing your stat-card wrapper style for consistency
    <div className="stat-card" style={{ textAlign: "center", maxWidth: "200px", margin: "10px auto" }}>
      <h3>Live Counter</h3>
      <h2 className="counter" style={{ fontSize: "2.5rem", margin: "10px 0" }}>
        {count}
      </h2>
      <button className="add-btn" onClick={increment} style={{ width: "100%" }}>
        Increment
      </button>
    </div>
  );
}

export default Counter;