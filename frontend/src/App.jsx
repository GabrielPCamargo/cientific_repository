import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { CssBaseline, useMediaQuery } from "@mui/material";
import Layout from "./components/Layout.jsx";
import Home from "./pages/Home.jsx";
import MyPublications from "./pages/MyPublications.jsx";
import DocumentDetail from "./pages/DocumentDetail.jsx";
import Favorites from "./pages/Favorites.jsx";
import SobreORCU from "./pages/SobreORCU.jsx";
import Upload from "./pages/Upload.jsx"; // moved into pages/
import { FavoritesProvider } from "./contexts/FavoritesContext.jsx";
import Settings from "./pages/Settings.jsx";

// Crie um componente dummy para testar a navegação
const Dashboard = () => <h1>Bem-vindo ao Dashboard (Em construção)</h1>;
const NotFound = () => <h1>Página não encontrada</h1>;

function App() {
  const LS_KEY = "rcu_preferences";
  const [themeChoice, setThemeChoice] = useState(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (!raw) return "system";
      const parsed = JSON.parse(raw);
      return parsed.theme || "system";
    } catch (e) {
      return "system";
    }
  });

  // detecta preferência do sistema
  const prefersDark = useMediaQuery("(prefers-color-scheme: dark)");

  // recalcula palette mode com base na escolha
  const paletteMode = themeChoice === "system" ? (prefersDark ? "dark" : "light") : themeChoice;

  const theme = useMemo(() => createTheme({
    palette: {
      mode: paletteMode,
      background: paletteMode === 'dark'
          ? { default: '#121212', paper: '#1e1e1e' }
          : { default: '#f5f5f5', paper: '#ffffff' },
      primary: {
        main: '#2e7d32'
      },
    },
    components: {
      MuiPaper: {
        styleOverrides: {
          root: {
            padding: 8
          }
        }
      },
      MuiTableCell: {
        styleOverrides: {
          head: {
            backgroundColor: paletteMode === 'dark' ? '#1f1f1f' : '#e0e0e0'
          }
        }
      },
      MuiChip: {
        styleOverrides: {
          root: {
            marginRight: 8
          }
        }
      }
    }
  }), [paletteMode]);

  // atualiza quando outra aba/gravação mudar localStorage
  useEffect(() => {
    const handler = (e) => {
      if (e.key === LS_KEY) {
        try {
          const parsed = JSON.parse(e.newValue || "{}");
          setThemeChoice(parsed.theme || "system");
        } catch (err) {
          // ignore
        }
      }
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  // observa mudanças locais (Settings grava direto no localStorage). Recarrega preferência periodicamente.
  useEffect(() => {
    const id = setInterval(() => {
      try {
        const raw = localStorage.getItem(LS_KEY);
        const parsed = raw ? JSON.parse(raw) : {};
        if ((parsed.theme || "system") !== themeChoice) {
          setThemeChoice(parsed.theme || "system");
        }
      } catch (e) {
        // ignore
      }
    }, 1000);
    return () => clearInterval(id);
  }, [themeChoice]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <FavoritesProvider>
      <BrowserRouter>
      <Routes>
        {/* A rota pai é o Layout. 
           Todas as rotas "filhas" serão renderizadas dentro do <Outlet /> do Layout 
        */}
        <Route path="/" element={<Layout />}>
          
          {/* index significa: quando a rota for exatamente "/" */}
          <Route index element={<Home />} />
          
          <Route path="dashboard" element={<Dashboard />} />
          
          <Route path="minhas-publicacoes" element={<MyPublications />} />
          
          <Route path="documento/:id" element={<DocumentDetail />} />
          
          <Route path="favoritos" element={<Favorites />} />
          <Route path="sobre-o-rcu" element={<SobreORCU />} />
          <Route path="configuracoes" element={<Settings />} />
          
          {/* Exemplo de como reutilizar seu componente antigo */}
          <Route path="upload" element={<Upload />} />
          
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
    </FavoritesProvider>
    </ThemeProvider>
  );
}

export default App;