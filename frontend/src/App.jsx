// ============================================================
// IMPORTS - Bibliotecas externas
// ============================================================
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { CssBaseline, useMediaQuery } from "@mui/material";

// ============================================================
// IMPORTS - Componentes internos
// ============================================================
import Layout from "./components/Layout.jsx";

// ============================================================
// IMPORTS - Páginas
// ============================================================
import Home from "./pages/Home.jsx";
import MyPublications from "./pages/MyPublications.jsx";
import DocumentDetail from "./pages/DocumentDetail.jsx";
import Favorites from "./pages/Favorites.jsx";
import SobreORCU from "./pages/SobreORCU.jsx";
import Upload from "./pages/Upload.jsx";
import Settings from "./pages/Settings.jsx";

// ============================================================
// IMPORTS - Contextos
// ============================================================
import { FavoritesProvider } from "./contexts/FavoritesContext.jsx";

// ============================================================
// CONSTANTES
// ============================================================
const LS_KEY = "rcu_preferences";

// ============================================================
// COMPONENTES AUXILIARES (Placeholders)
// ============================================================
const Dashboard = () => <h1>Bem-vindo ao Dashboard (Em construção)</h1>;
const NotFound = () => <h1>Página não encontrada</h1>;

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================
function App() {
  // ----------------------------------------------------------
  // ESTADO: Preferência de tema (dark/light/system)
  // ----------------------------------------------------------
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

  // ----------------------------------------------------------
  // VALORES DERIVADOS: Detecção de tema e modo de paleta
  // ----------------------------------------------------------
  // Detecta preferência do sistema operacional
  const prefersDark = useMediaQuery("(prefers-color-scheme: dark)");

  // Calcula o modo da paleta com base na escolha do usuário
  const paletteMode = themeChoice === "system" ? (prefersDark ? "dark" : "light") : themeChoice;

  // ----------------------------------------------------------
  // MEMO: Configuração do tema MUI
  // ----------------------------------------------------------
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

  // ----------------------------------------------------------
  // EFEITO: Sincroniza tema entre abas (storage event)
  // ----------------------------------------------------------
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

  // ----------------------------------------------------------
  // EFEITO: Polling para mudanças locais (mesma aba)
  // Necessário pois Settings grava direto no localStorage
  // ----------------------------------------------------------
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

  // ----------------------------------------------------------
  // RENDER: Estrutura da aplicação
  // ----------------------------------------------------------
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <FavoritesProvider>
      <BrowserRouter>
      <Routes>
        {/* Rota pai: Layout com sidebar e header */}
        <Route path="/" element={<Layout />}>
          
          {/* Página inicial (lista de artigos) */}
          <Route index element={<Home />} />
          
          {/* Páginas de conteúdo */}
          <Route path="sobre-o-rcu" element={<SobreORCU />} />
          <Route path="documento/:id" element={<DocumentDetail />} />
          
          {/* Páginas do usuário */}
          <Route path="minhas-publicacoes" element={<MyPublications />} />
          <Route path="favoritos" element={<Favorites />} />
          <Route path="upload" element={<Upload />} />
          
          {/* Configurações */}
          <Route path="configuracoes" element={<Settings />} />
          
          {/* Placeholder - em construção */}
          <Route path="dashboard" element={<Dashboard />} />
          
          {/* Fallback 404 */}
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
    </FavoritesProvider>
    </ThemeProvider>
  );
}

export default App;