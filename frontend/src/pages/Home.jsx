import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    Box,
    Container,
    Typography,
    TextField,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    Button,
    CircularProgress,
    Alert,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    OutlinedInput,
    Checkbox,
    ListItemText,
    IconButton,
    Tooltip
} from "@mui/material";
import StarIcon from "@mui/icons-material/esm/Star.js";
import StarBorderIcon from "@mui/icons-material/esm/StarBorder.js";
import { useFavorites } from "../contexts/FavoritesContext";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
const LS_KEY = "rcu_preferences";

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
    PaperProps: {
        style: {
            maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
            width: 250,
        },
    },
};

export default function Home() {
    // --- 1. ESTADOS ---
    const navigate = useNavigate();
    const { isFavorite, toggleFavorite } = useFavorites();
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");

    // filtro avançado
    const [typeOptions, setTypeOptions] = useState([]);
    const [yearOptions, setYearOptions] = useState([]);
    const [fieldOptions, setFieldOptions] = useState([]);
    const [eventOptions, setEventOptions] = useState([]);
    const [keywordOptions, setKeywordOptions] = useState([]);

    const [selectedTypes, setSelectedTypes] = useState([]);
    const [selectedYears, setSelectedYears] = useState([]);
    const [selectedFields, setSelectedFields] = useState([]);
    const [selectedEvents, setSelectedEvents] = useState([]);
    const [selectedKeywords, setSelectedKeywords] = useState([]);

    // --- 2. BUSCAR DOCUMENTOS DO BACKEND (com filtros) ---
    const fetchDocuments = async (opts = {}) => {
        try {
            setLoading(true);
            setError(null);

            const qs = new URLSearchParams();
            if (opts.q) qs.append("q", opts.q);
            // Múltiplos valores: adiciona cada um separadamente
            if (opts.types?.length) opts.types.forEach(t => qs.append("type", t));
            if (opts.years?.length) opts.years.forEach(y => qs.append("publish_year", y));
            if (opts.fields?.length) opts.fields.forEach(f => qs.append("field", f));
            if (opts.keywords?.length) opts.keywords.forEach(k => qs.append("keyword", k));
            if (opts.events?.length) opts.events.forEach(e => qs.append("event_id", e));

            const url = `${API_URL}/documents${qs.toString() ? `?${qs.toString()}` : ""}`;
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`Erro ao buscar documentos: ${response.status}`);
            }

            const data = await response.json();
            console.log("Documentos carregados:", data);
            setDocuments(data);
            // extrai opções (tipos, anos, áreas) a partir dos documentos (somente na primeira carga)
            setTypeOptions((prev) => {
                if (prev.length) return prev;
                const types = Array.from(new Set(data.map(d => d.type).filter(Boolean)));
                return types;
            });
            setYearOptions((prev) => {
                if (prev.length) return prev;
                const years = Array.from(new Set(data.map(d => d.publish_year).filter(Boolean))).sort((a,b)=>b-a);
                return years;
            });
            setFieldOptions((prev) => {
                if (prev.length) return prev;
                const fields = Array.from(new Set(data.map(d => d.field).filter(Boolean)));
                return fields;
            });
        } catch (err) {
            console.error("Erro ao buscar documentos:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // busca inicial sem filtros e também popula options
        // tenta carregar filtros padrão das configurações
        try {
            const raw = localStorage.getItem(LS_KEY);
            if (raw) {
                const parsed = JSON.parse(raw);
                const df = parsed.defaultFilters || {};
                if (df.types && df.types.length) setSelectedTypes(df.types);
                if (df.years && df.years.length) setSelectedYears(df.years.map(y => Number(y)));
                if (df.fields && df.fields.length) setSelectedFields(df.fields);
                if (df.events && df.events.length) setSelectedEvents(df.events.map(e => Number(e)));
                if (df.keywords && df.keywords.length) setSelectedKeywords(df.keywords);
                // usa os filtros carregados para a busca inicial
                fetchDocuments({
                    q: undefined,
                    types: df.types?.length ? df.types : undefined,
                    years: df.years?.length ? df.years : undefined,
                    fields: df.fields?.length ? df.fields : undefined,
                    keywords: df.keywords?.length ? df.keywords : undefined,
                    events: df.events?.length ? df.events : undefined,
                });
            } else {
                fetchDocuments({});
            }
        } catch (err) {
            console.error('Erro ao carregar preferências locais', err);
            fetchDocuments({});
        }

        // busca eventos para popular select de eventos
        const fetchEvents = async () => {
            try {
                const res = await fetch(`${API_URL}/event`);
                if (!res.ok) return;
                const ev = await res.json();
                setEventOptions(ev);
            } catch (err) {
                console.error('Erro ao carregar eventos', err);
            }
        };
        fetchEvents();

        // busca keywords para popular select de palavras-chave
        const fetchKeywords = async () => {
            try {
                const res = await fetch(`${API_URL}/keywords`);
                if (!res.ok) return;
                const kw = await res.json();
                setKeywordOptions(kw);
            } catch (err) {
                console.error('Erro ao carregar palavras-chave', err);
            }
        };
        fetchKeywords();
    }, []);

    // refaz a busca quando filtros mudam
    useEffect(() => {
        fetchDocuments({
            q: searchTerm || undefined,
            types: selectedTypes.length ? selectedTypes : undefined,
            years: selectedYears.length ? selectedYears : undefined,
            fields: selectedFields.length ? selectedFields : undefined,
            keywords: selectedKeywords.length ? selectedKeywords : undefined,
            events: selectedEvents.length ? selectedEvents : undefined
        });
    }, [selectedTypes, selectedYears, selectedFields, selectedEvents, searchTerm, selectedKeywords]);

    // Função auxiliar para extrair primeira autora
    const getFirstAuthor = (doc) => {
        if (doc.authors && doc.authors.length > 0) {
            return doc.authors[0].name;
        }
        return "Desconhecido";
    };

    return (
        <Box sx={{ display: 'flex' }}>

            {/* ÁREA CENTRAL (TABELA) */}
            <Container maxWidth="xl" sx={{ flexGrow: 1 }}>
                <Box sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h4" component="h1" color="text.primary">
                            Explorar Artigos
                        </Typography>
                        <TextField
                            variant="outlined"
                            size="small"
                            placeholder="Buscar por título ou autor..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            sx={{ 
                                minWidth: 300,
                                bgcolor: (theme) => theme.palette.mode === 'dark' ? 'grey.800' : 'white',
                                '& .MuiOutlinedInput-root': {
                                    '& input': {
                                        color: (theme) => theme.palette.text.primary,
                                    },
                                    '& input::placeholder': {
                                        color: (theme) => theme.palette.text.secondary,
                                        opacity: 1,
                                    },
                                },
                            }}
                        />
                    </Box>

                    {/* Barra de Filtros */}
                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2, alignItems: 'center' }}>
                        <FormControl size="small" sx={{ minWidth: 150 }}>
                            <InputLabel>Tipo</InputLabel>
                            <Select
                                multiple
                                value={selectedTypes}
                                onChange={(e) => setSelectedTypes(e.target.value)}
                                input={<OutlinedInput label="Tipo" />}
                                renderValue={(selected) => selected.join(', ')}
                                MenuProps={MenuProps}
                            >
                                {typeOptions.map((t, idx) => (
                                    <MenuItem key={idx} value={t}>
                                        <Checkbox checked={selectedTypes.indexOf(t) > -1} />
                                        <ListItemText primary={t} />
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <FormControl size="small" sx={{ minWidth: 140 }}>
                            <InputLabel>Ano</InputLabel>
                            <Select
                                multiple
                                value={selectedYears}
                                onChange={(e) => setSelectedYears(e.target.value)}
                                input={<OutlinedInput label="Ano" />}
                                renderValue={(selected) => selected.join(', ')}
                                MenuProps={MenuProps}
                            >
                                {yearOptions.map((y, idx) => (
                                    <MenuItem key={idx} value={y}>
                                        <Checkbox checked={selectedYears.indexOf(y) > -1} />
                                        <ListItemText primary={y} />
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <FormControl size="small" sx={{ minWidth: 150 }}>
                            <InputLabel>Área</InputLabel>
                            <Select
                                multiple
                                value={selectedFields}
                                onChange={(e) => setSelectedFields(e.target.value)}
                                input={<OutlinedInput label="Área" />}
                                renderValue={(selected) => selected.join(', ')}
                                MenuProps={MenuProps}
                            >
                                {fieldOptions.map((f, idx) => (
                                    <MenuItem key={idx} value={f}>
                                        <Checkbox checked={selectedFields.indexOf(f) > -1} />
                                        <ListItemText primary={f} />
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <FormControl size="small" sx={{ minWidth: 180 }}>
                            <InputLabel>Evento</InputLabel>
                            <Select
                                multiple
                                value={selectedEvents}
                                onChange={(e) => setSelectedEvents(e.target.value)}
                                input={<OutlinedInput label="Evento" />}
                                renderValue={(selected) => {
                                    return selected.map(id => {
                                        const ev = eventOptions.find(e => e.id === id);
                                        return ev ? ev.name : id;
                                    }).join(', ');
                                }}
                                MenuProps={MenuProps}
                            >
                                {eventOptions.map((ev) => (
                                    <MenuItem key={ev.id} value={ev.id}>
                                        <Checkbox checked={selectedEvents.indexOf(ev.id) > -1} />
                                        <ListItemText primary={ev.name} />
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <FormControl size="small" sx={{ minWidth: 200 }}>
                            <InputLabel>Palavra-chave</InputLabel>
                            <Select
                                multiple
                                value={selectedKeywords}
                                onChange={(e) => setSelectedKeywords(e.target.value)}
                                input={<OutlinedInput label="Palavra-chave" />}
                                renderValue={(selected) => selected.join(', ')}
                                MenuProps={MenuProps}
                            >
                                {keywordOptions.map((kw) => (
                                    <MenuItem key={kw.id} value={kw.keyword}>
                                        <Checkbox checked={selectedKeywords.indexOf(kw.keyword) > -1} />
                                        <ListItemText primary={kw.keyword} />
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <Button variant="outlined" color="error" onClick={() => {
                            setSelectedTypes([]);
                            setSelectedYears([]);
                            setSelectedFields([]);
                            setSelectedEvents([]);
                            setSelectedKeywords([]);
                            setSearchTerm("");
                        }}>
                            Limpar filtros
                        </Button>
                    </Box>
                </Box>

                {error && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                        {error}
                    </Alert>
                )}

                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <TableContainer component={Paper} elevation={2}>
                        <Table sx={{ minWidth: 650 }}>
                            <TableHead sx={{ bgcolor: (theme) => theme.palette.background.paper }}>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Título</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Autor</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Área</TableCell>
                                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>Tipo</TableCell>
                                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>Ano</TableCell>
                                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>Ações</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {documents.map((doc) => (
                                    <TableRow key={doc.id} sx={{ '&:hover': { bgcolor: (theme) => theme.palette.action.hover } }}>
                                        <TableCell>{doc.title || "Sem título"}</TableCell>
                                        <TableCell>{getFirstAuthor(doc)}</TableCell>
                                        <TableCell>{doc.field || "-"}</TableCell>
                                        <TableCell align="center">
                                            <Chip
                                                label={doc.type || "Outro"}
                                                size="small"
                                                color={doc.type === 'Artigo' ? 'primary' : doc.type === 'TCC' ? 'warning' : 'default'}
                                                variant="outlined"
                                            />
                                        </TableCell>
                                        <TableCell align="center">{doc.publish_year || "-"}</TableCell>
                                        <TableCell align="center">
                                            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                                                <Tooltip title={isFavorite(doc.id) ? "Remover dos favoritos" : "Adicionar aos favoritos"}>
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => toggleFavorite(doc)}
                                                        sx={{ color: isFavorite(doc.id) ? (theme) => theme.palette.warning.main : 'grey.400' }}
                                                    >
                                                        {isFavorite(doc.id) ? <StarIcon /> : <StarBorderIcon />}
                                                    </IconButton>
                                                </Tooltip>
                                                <Button 
                                                    size="small" 
                                                    variant="contained"
                                                    onClick={() => navigate(`/documento/${doc.id}`)}
                                                >
                                                    Abrir
                                                </Button>
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {documents.length === 0 && !loading && (
                                    <TableRow>
                                        <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                                            Nenhum resultado encontrado.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </Container>
        </Box>
    );
}