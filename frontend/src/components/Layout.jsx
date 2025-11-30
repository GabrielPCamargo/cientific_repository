import { Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  CssBaseline,
  Divider
} from "@mui/material";

// Defina a largura aqui para usar em todo lugar
const DRAWER_WIDTH = 240;

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();

  // Itens do Menu (agora com rotas!)
  const menuItems = [
    { text: 'Sobre o RCU', icon: '🏠', path: '/sobre-o-rcu' },
    { text: 'Todos os Artigos', icon: '📚', path: '/' }, // Home é a lista
    { text: 'Minhas Publicações', icon: '✍️', path: '/minhas-publicacoes' },
    { text: 'Favoritos', icon: '⭐', path: '/favoritos' },
    { text: 'Publicar', icon: '⬆️', path: '/upload' },
  ];

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />

      {/* HEADER FIXO */}
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, bgcolor: (theme) => theme.palette.primary.main }}>
        <Toolbar>
          <Typography variant="h6" noWrap component="div">
             Portal Científico 📊
          </Typography>
        </Toolbar>
      </AppBar>

      {/* SIDEBAR DE NAVEGAÇÃO (ESQUERDA) */}
      <Drawer
        variant="permanent"
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { width: DRAWER_WIDTH, boxSizing: 'border-box' },
        }}
      >
        <Toolbar /> {/* Espaço para não ficar embaixo do Header */}
        <Box sx={{ overflow: 'auto' }}>
          <List>
            {menuItems.map((item) => (
              <ListItem key={item.text} disablePadding>
                <ListItemButton 
                  selected={location.pathname === item.path}
                  onClick={() => navigate(item.path)} // Aqui a mágica do Router acontece
                >
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
          <Divider />
          <List>
            <ListItem disablePadding>
              <ListItemButton onClick={() => navigate('/configuracoes')}>
                <ListItemIcon>⚙️</ListItemIcon>
                <ListItemText primary="Configurações" />
              </ListItemButton>
            </ListItem>
          </List>
        </Box>
      </Drawer>

      {/* ÁREA DE CONTEÚDO DINÂMICO */}
      <Box component="main" sx={{ flexGrow: 1, p: 3, bgcolor: (theme) => theme.palette.background.default, minHeight: '100vh' }}>
        <Toolbar /> {/* Espaçamento necessário para o Header */}
        
        {/* É AQUI QUE AS PÁGINAS VÃO TROCAR */}
        <Outlet /> 
        
      </Box>
    </Box>
  );
}