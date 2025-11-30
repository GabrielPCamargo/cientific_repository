import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    Box,
    Container,
    Typography,
    Paper,
    CircularProgress,
    Alert,
    Button,
    Chip,
    Divider,
    Grid,
    Card,
    CardContent
} from "@mui/material";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export default function DocumentDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [document, setDocument] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Buscar detalhes do documento
    useEffect(() => {
        const fetchDocument = async () => {
            try {
                setLoading(true);
                setError(null);

                const response = await fetch(`${API_URL}/documents/${id}`);

                if (!response.ok) {
                    throw new Error(`Documento não encontrado: ${response.status}`);
                }

                const data = await response.json();
                console.log("Documento carregado:", data);
                setDocument(data);
            } catch (err) {
                console.error("Erro ao buscar documento:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchDocument();
    }, [id]);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Container maxWidth="lg" sx={{ py: 5 }}>
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
                <Button variant="contained" onClick={() => navigate(-1)}>
                    ← Voltar
                </Button>
            </Container>
        );
    }

    if (!document) {
        return (
            <Container maxWidth="lg" sx={{ py: 5 }}>
                <Alert severity="warning" sx={{ mb: 3 }}>
                    Documento não encontrado.
                </Alert>
                <Button variant="contained" onClick={() => navigate(-1)}>
                    ← Voltar
                </Button>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ py: 5 }}>
            {/* Botão Voltar */}
            <Button 
                variant="outlined" 
                onClick={() => navigate(-1)}
                sx={{ mb: 3 }}
            >
                ← Voltar
            </Button>

            {/* Cabeçalho Principal */}
            <Paper elevation={3} sx={{ p: 4, mb: 3 }}>
                <Typography variant="h3" component="h1" sx={{ mb: 2, fontWeight: 'bold' }}>
                    {document.title || "Sem título"}
                </Typography>

                <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap', alignItems: 'center' }}>
                    <Chip
                        label={document.type || "Outro"}
                        color={document.type === 'Artigo' ? 'primary' : document.type === 'TCC' ? 'warning' : 'default'}
                        size="medium"
                    />
                    <Chip
                        label={`${document.publish_year || "Ano desconhecido"}`}
                        variant="outlined"
                        size="medium"
                    />
                </Box>

                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                    <strong>Resumo:</strong> {document.abstract || "Sem resumo disponível."}
                </Typography>

                <Divider sx={{ my: 3 }} />

                {/* Botões de Ação */}
                <Box sx={{ display: 'flex', gap: 2 }}>
                    {document.url && (
                        <Button
                            variant="contained"
                            color="primary"
                            size="large"
                            onClick={() => window.open(document.url, "_blank")}
                        >
                            📥 Baixar Arquivo
                        </Button>
                    )}
                    {document.url && (
                        <Button
                            variant="contained"
                            color="secondary"
                            size="large"
                            onClick={() => window.open(document.url, "_blank")}
                        >
                            👁️ Visualizar
                        </Button>
                    )}
                </Box>
            </Paper>

            {/* Informações Estruturadas */}
            <Grid container spacing={3}>
                {/* Coluna 1: Informações Gerais */}
                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                                Informações Gerais
                            </Typography>

                            <Box sx={{ mb: 2 }}>
                                <Typography variant="subtitle2" color="text.secondary">
                                    Área de Pesquisa
                                </Typography>
                                <Typography variant="body1">
                                    {document.field || "-"}
                                </Typography>
                            </Box>

                            <Box sx={{ mb: 2 }}>
                                <Typography variant="subtitle2" color="text.secondary">
                                    Tipo de Trabalho
                                </Typography>
                                <Typography variant="body1">
                                    {document.type || "-"}
                                </Typography>
                            </Box>

                            <Box>
                                <Typography variant="subtitle2" color="text.secondary">
                                    Ano de Publicação
                                </Typography>
                                <Typography variant="body1">
                                    {document.publish_year || "-"}
                                </Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Coluna 2: Autores e Palavras-chave */}
                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                                Autores
                            </Typography>

                            {document.authors && document.authors.length > 0 ? (
                                <Box sx={{ mb: 3 }}>
                                    {document.authors.map((author, idx) => (
                                        <Box key={idx} sx={{ mb: 1 }}>
                                            <Typography variant="body1">
                                                {author.name}
                                            </Typography>
                                            {author.email && (
                                                <Typography variant="caption" color="text.secondary">
                                                    {author.email}
                                                </Typography>
                                            )}
                                        </Box>
                                    ))}
                                </Box>
                            ) : (
                                <Typography variant="body2" color="text.secondary">
                                    Nenhum autor listado
                                </Typography>
                            )}

                            <Divider sx={{ my: 2 }} />

                            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                                Palavras-chave
                            </Typography>

                            {document.keywords && document.keywords.length > 0 ? (
                                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                    {document.keywords.map((keyword, idx) => (
                                        <Chip
                                            key={idx}
                                            label={keyword.keyword}
                                            variant="outlined"
                                            size="small"
                                        />
                                    ))}
                                </Box>
                            ) : (
                                <Typography variant="body2" color="text.secondary">
                                    Nenhuma palavra-chave
                                </Typography>
                            )}
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Informações Adicionais */}
            {(document.course || document.event) && (
                <Grid container spacing={3} sx={{ mt: 1 }}>
                    {document.course && (
                        <Grid item xs={12} md={6}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                                        Curso
                                    </Typography>
                                    <Typography variant="body1">
                                        {document.course.name || "Sem nome"}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    )}

                    {document.event && (
                        <Grid item xs={12} md={6}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                                        Evento
                                    </Typography>
                                    <Typography variant="body1">
                                        {document.event.name || "Sem nome"}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    )}
                </Grid>
            )}
        </Container>
    );
}
