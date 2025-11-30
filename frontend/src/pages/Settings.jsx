import { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Box,
  Paper,
  FormControlLabel,
  Switch,
  Select,
  MenuItem,
  Button,
  TextField,
  Divider,
} from "@mui/material";

// chave usada no localStorage
const LS_KEY = "rcu_preferences";

export default function Settings() {
  const [theme, setTheme] = useState(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (!raw) return "system";
      const parsed = JSON.parse(raw);
      return parsed.theme || "system";
    } catch (e) {
      return "system";
    }
  });

  const [defaultFilters, setDefaultFilters] = useState(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (!raw) return { types: [], years: [], fields: [], events: [], keywords: [] };
      const parsed = JSON.parse(raw);
      return parsed.defaultFilters || { types: [], years: [], fields: [], events: [], keywords: [] };
    } catch (e) {
      return { types: [], years: [], fields: [], events: [], keywords: [] };
    }
  });

  const [notificationsEnabled, setNotificationsEnabled] = useState(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (!raw) return true;
      const parsed = JSON.parse(raw);
      return parsed.notificationsEnabled ?? true;
    } catch (e) {
      return true;
    }
  });

  // campos temporários para edição rápida (simples string CSV)
  const [filtersCsv, setFiltersCsv] = useState(() => {
    return {
      types: (defaultFilters.types || []).join(", "),
      years: (defaultFilters.years || []).join(", "),
      fields: (defaultFilters.fields || []).join(", "),
      events: (defaultFilters.events || []).join(", "),
      keywords: (defaultFilters.keywords || []).join(", "),
    };
  });

  useEffect(() => {
    // atualiza csv quando defaultFilters muda
    setFiltersCsv({
      types: (defaultFilters.types || []).join(", "),
      years: (defaultFilters.years || []).join(", "),
      fields: (defaultFilters.fields || []).join(", "),
      events: (defaultFilters.events || []).join(", "),
      keywords: (defaultFilters.keywords || []).join(", "),
    });
  }, [defaultFilters]);

  const persist = (overrides = {}) => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      const base = raw ? JSON.parse(raw) : {};
      const merged = { ...base, ...overrides };
      localStorage.setItem(LS_KEY, JSON.stringify(merged));
    } catch (e) {
      console.error("Falha ao persistir preferências:", e);
    }
  };

  const handleSaveAll = () => {
    persist({ theme, defaultFilters, notificationsEnabled });
  };

  const handleApplyCsv = () => {
    // converte os CSV fields para arrays (trim + filtra vazios)
    const toArray = (s) => s.split(",").map(x => x.trim()).filter(Boolean);
    const parsed = {
      types: toArray(filtersCsv.types),
      years: toArray(filtersCsv.years).map(y => Number(y)).filter(Boolean),
      fields: toArray(filtersCsv.fields),
      events: toArray(filtersCsv.events),
      keywords: toArray(filtersCsv.keywords),
    };
    setDefaultFilters(parsed);
    persist({ defaultFilters: parsed });
  };

  const handleResetDefaults = () => {
    const cleared = { types: [], years: [], fields: [], events: [], keywords: [] };
    setDefaultFilters(cleared);
    setFiltersCsv({ types: "", years: "", fields: "", events: "", keywords: "" });
    persist({ defaultFilters: cleared });
  };

  // STUBs para integrar com backend depois
  const savePreferencesToServer = async (prefs) => {
    // se quiser sincronizar com backend, implementar aqui
    // ex: await fetch(`${API_URL}/me/preferences`, { method: 'PUT', body: JSON.stringify(prefs) })
    return true;
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ mb: 1 }}>Configurações</Typography>
        <Typography variant="body2" color="text.secondary">Ajuste suas preferências de exibição e pesquisa.</Typography>
      </Box>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6">Tema</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Escolha o tema da interface.</Typography>

        <Select value={theme} onChange={(e) => { setTheme(e.target.value); persist({ theme: e.target.value }); }} sx={{ minWidth: 200 }}>
          <MenuItem value="system">Seguir o sistema</MenuItem>
          <MenuItem value="light">Claro</MenuItem>
          <MenuItem value="dark">Escuro</MenuItem>
        </Select>

        <Box sx={{ mt: 2 }}>
          <Button variant="contained" onClick={() => { savePreferencesToServer({ theme }); }}>Salvar tema no servidor (opcional)</Button>
        </Box>
      </Paper>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6">Filtros Padrão</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Defina filtros que serão aplicados automaticamente ao visitar a página de exploração.</Typography>

        <Typography variant="subtitle2" sx={{ mt: 1 }}>Tipos (coma-separado)</Typography>
        <TextField fullWidth size="small" value={filtersCsv.types} onChange={(e) => setFiltersCsv(s => ({ ...s, types: e.target.value }))} sx={{ mb: 1 }} />

        <Typography variant="subtitle2">Anos (coma-separado)</Typography>
        <TextField fullWidth size="small" value={filtersCsv.years} onChange={(e) => setFiltersCsv(s => ({ ...s, years: e.target.value }))} sx={{ mb: 1 }} />

        <Typography variant="subtitle2">Áreas (coma-separado)</Typography>
        <TextField fullWidth size="small" value={filtersCsv.fields} onChange={(e) => setFiltersCsv(s => ({ ...s, fields: e.target.value }))} sx={{ mb: 1 }} />

        <Typography variant="subtitle2">Eventos (coma-separado)</Typography>
        <TextField fullWidth size="small" value={filtersCsv.events} onChange={(e) => setFiltersCsv(s => ({ ...s, events: e.target.value }))} sx={{ mb: 1 }} />

        <Typography variant="subtitle2">Palavras-chave (coma-separado)</Typography>
        <TextField fullWidth size="small" value={filtersCsv.keywords} onChange={(e) => setFiltersCsv(s => ({ ...s, keywords: e.target.value }))} sx={{ mb: 2 }} />

        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button variant="contained" onClick={handleApplyCsv}>Aplicar</Button>
          <Button variant="outlined" color="error" onClick={handleResetDefaults}>Limpar</Button>
        </Box>
      </Paper>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6">Notificações (in‑app)</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Ative ou desative notificações dentro do aplicativo.</Typography>

        <FormControlLabel
          control={<Switch checked={notificationsEnabled} onChange={(e) => { setNotificationsEnabled(e.target.checked); persist({ notificationsEnabled: e.target.checked }); }} />}
          label="Notificações in‑app ativadas"
        />

        <Divider sx={{ my: 2 }} />

        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button variant="contained" onClick={handleSaveAll}>Salvar tudo</Button>
        </Box>
      </Paper>

      <Typography variant="caption" color="text.secondary">As preferências de exibição e filtros padrão são salvas localmente. Para sincronizar entre dispositivos, conectar a uma conta e habilitar sincronização no servidor.</Typography>
    </Container>
  );
}
