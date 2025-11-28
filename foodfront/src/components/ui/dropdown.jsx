'use client';
import * as React from 'react';

export default function SimpleTwoLineDropdown() {
  const [open, setOpen] = React.useState(false);

  const orders = [
    {
      id: 1,
      foods: ['🍔 Burger', 'buuz', 'buuz', 'buuz'],
    },
 
  ];

  // Жишээгээр эхний захиалгыг л харуулъя:
  const foods = orders[0].foods; // <-- энд map биш, шууд orders[0].foods авахад болно

  return (
    <div className="relative inline-block">
      {/* товч */}
      <button
        onClick={() => setOpen(!open)}
        className="cursor-pointer border w-24 px-2 py-1 bg-white rounded hover:bg-gray-100"
      >
        {foods.length} foods
      </button>

      {/* жагсаалт */}
      {open && (
        <div className="absolute left-0 mt-1 w-32 bg-white border rounded shadow-md z-10">
          {foods.map((food, index) => (
            <p
              key={index}
              className="px-3 py-1 hover:bg-gray-100 cursor-pointer"
            >
              {food}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
