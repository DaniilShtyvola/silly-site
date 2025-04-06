import { PageWrapper, PageContainer } from '../Page.styled.ts';

import Loading from '../../components/Loading/Loading.tsx'

const Home = () => {
   
   return (
      <PageWrapper>
         <PageContainer>
            <Loading/>
         </PageContainer>
      </PageWrapper>
   );
};

export default Home;