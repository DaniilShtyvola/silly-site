import React from "react";
import { CatMinimizedResponse } from "../../models/Cat";

interface CatCardProps {
  cat: CatMinimizedResponse;
}

const CatCard: React.FC<CatCardProps> = ({ cat }) => {
  return (
    <div>
      {cat.firstImageBase64 && (
        <img
          src={`${cat.firstImageBase64}`}
          alt={cat.name}
          style={{ maxWidth: "100%", borderRadius: "8px" }}
        />
      )}
    </div>
  );
};

export default CatCard;
