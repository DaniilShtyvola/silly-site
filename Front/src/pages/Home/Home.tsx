import { useState } from "react";

import Masonry from 'react-masonry-css';

import CatCard from "../../components/CatCard/CatCard";
import { CatMinimizedResponse } from '../../models/Cat';
import "./Home.css";

import tempCatsData from './cats.json'

const Home = () => {
   const [cats, setCats] = useState<CatMinimizedResponse[]>(tempCatsData);

   return (
      <>
         <Masonry
            breakpointCols={{ default: 5, 1100: 3, 700: 2, 500: 1 }}
            className="my-masonry-grid"
            columnClassName="my-masonry-grid_column"
            style={{
               width: "100%"
            }}
         >
            {cats.map(cat => (
               <CatCard cat={cat}/>
            ))}
         </Masonry>
      </>
   );
};

export default Home;
