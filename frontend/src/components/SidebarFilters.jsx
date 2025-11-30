import {
  Drawer,
  Box,
  Typography,
  Divider,
  FormControl,
  FormLabel,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Button
} from "@mui/material";

export function SidebarFilters({ width, filters, onFilterChange, onReset }) {
  return (
    <Drawer
      variant="permanent"
      anchor="right"
      sx={{
        width: width,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: { width: width, boxSizing: 'border-box', mt: 8 },
      }}
    >
      <Box sx={{ overflow: 'auto', p: 2 }}>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          🔍 Filtros
        </Typography>
        <Divider sx={{ mb: 2 }} />

        <FormControl component="fieldset" variant="standard">
          <FormLabel component="legend">Tipo de Documento</FormLabel>
          <FormGroup>
            <FormControlLabel
              control={<Checkbox checked={filters.artigo} onChange={onFilterChange} name="artigo" />}
              label="Artigos"
            />
            <FormControlLabel
              control={<Checkbox checked={filters.tcc} onChange={onFilterChange} name="tcc" />}
              label="TCCs"
            />
            <FormControlLabel
              control={<Checkbox checked={filters.tese} onChange={onFilterChange} name="tese" />}
              label="Teses"
            />
            <FormControlLabel
              control={<Checkbox checked={filters.dissertacao} onChange={onFilterChange} name="dissertacao" />}
              label="Dissertações"
            />
            <FormControlLabel
              control={<Checkbox checked={filters.outros} onChange={onFilterChange} name="outros" />}
              label="Outros"
            />
          </FormGroup>
        </FormControl>

        <Divider sx={{ my: 2 }} />
        
        <Button 
          variant="outlined" 
          fullWidth 
          color="error"
          onClick={onReset}
        >
          Limpar Filtros
        </Button>
      </Box>
    </Drawer>
  );
}