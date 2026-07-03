import { LoadoutOptimizer } from "./features/loadout";
import { ThemeProvider } from "./components/theme-provider";
import "./index.css";

export function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="mh-wilds-theme">
      <LoadoutOptimizer />
    </ThemeProvider>
  );
}

export default App;
