import { AppProviders } from "./app/providers/AppProviders";
import { AppRoutes } from "./app/router/AppRoutes";
import "./App.css";

function App() {
  return (
    <AppProviders>
      <AppRoutes />
    </AppProviders>
  );
}

export default App;
