
import { PrimeReactProvider} from 'primereact/api';
import Table from "./Table";
        

const App = () => {

  return (
    <PrimeReactProvider>
      <Table/>
    </PrimeReactProvider>
  )
}

export default App