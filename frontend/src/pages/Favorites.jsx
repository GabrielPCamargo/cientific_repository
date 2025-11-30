import { useNavigate } from "react-router-dom";
import { useFavorites } from "../contexts/FavoritesContext";
import {
    Box,
    Container,
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    Button,
    IconButton,
    Tooltip,
} from "@mui/material";
import StarIcon from "@mui/icons-material/esm/Star.js";

export default function Favorites() {
    const navigate = useNavigate();
    const { favorites, removeFavorite } = useFavorites();

    // Função auxiliar para extrair primeiro autor
    const getFirstAuthor = (doc) => {
        if (doc.authors && doc.authors.length > 0) {
            return doc.authors[0].name;
        }
        return "Desconhecido";
    };

    return (
        <Container maxWidth="xl">
            <Box sx={{ mb: 3 }}>
                <Typography variant="h4" component="h1" color="text.primary" sx={{ mb: 2 }}>
                    <StarIcon sx={{ mr: 1, verticalAlign: 'middle', color: (theme) => theme.palette.warning.main }} />
                    Meus Favoritos
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    {favorites.length === 0
                        ? "Você ainda não marcou nenhum trabalho como favorito."
                        : `Você tem ${favorites.length} trabalho(s) marcado(s) como favorito.`}
                </Typography>
            </Box>

            {favorites.length > 0 && (
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
                            {favorites.map((doc) => (
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
                                            <Tooltip title="Remover dos favoritos">
                                                <IconButton
                                                    size="small"
                                                    onClick={() => removeFavorite(doc.id)}
                                                    sx={{ color: (theme) => theme.palette.warning.main }}
                                                >
                                                    <StarIcon />
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
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            {favorites.length === 0 && (
                <Paper sx={{ p: 4, textAlign: 'center', mt: 3 }}>
                    <StarIcon sx={{ fontSize: 60, color: (theme) => theme.palette.text.secondary, mb: 2 }} />
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                        Nenhum favorito ainda
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        Explore os artigos e clique na estrela para adicionar aos favoritos.
                    </Typography>
                    <Button variant="contained" onClick={() => navigate("/")}>
                        Explorar Artigos
                    </Button>
                </Paper>
            )}
        </Container>
    );
}
