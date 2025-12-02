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
    CardContent,
    Dialog,
    DialogTitle,
    DialogContent,
    IconButton
} from "@mui/material";
import CloseIcon from "@mui/icons-material/esm/Close.js";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export default function DocumentDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [document, setDocument] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [pdfViewerOpen, setPdfViewerOpen] = useState(false);

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
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    {document.file_url && (
                        <Button
                            variant="contained"
                            color="primary"
                            size="large"
                            onClick={() => setPdfViewerOpen(true)}
                            startIcon={<span>📖</span>}
                        >
                            Ler
                        </Button>
                    )}
                    {document.file_url && (
                        <Button
                            variant="contained"
                            color="success"
                            size="large"
                            component="a"
                            href={document.file_url}
                            download
                            startIcon={<span>📥</span>}
                        >
                            Download
                        </Button>
                    )}
                </Box>
            </Paper>

            {/* Modal do Visualizador de PDF */}
            <Dialog
                open={pdfViewerOpen}
                onClose={() => setPdfViewerOpen(false)}
                maxWidth={false}
                fullWidth
                PaperProps={{
                    sx: {
                        width: '95vw',
                        height: '95vh',
                        maxWidth: '95vw',
                        maxHeight: '95vh',
                        m: 1
                    }
                }}
            >
                <DialogTitle sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    borderBottom: 1,
                    borderColor: 'divider',
                    py: 1.5
                }}>
                    <Typography variant="h6" component="span" sx={{ 
                        overflow: 'hidden', 
                        textOverflow: 'ellipsis', 
                        whiteSpace: 'nowrap',
                        maxWidth: 'calc(100% - 50px)'
                    }}>
                        📖 {document.title}
                    </Typography>
                    <IconButton
                        aria-label="fechar"
                        onClick={() => setPdfViewerOpen(false)}
                        sx={{ color: 'grey.500' }}
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent sx={{ p: 0, display: 'flex', flexDirection: 'column' }}>
                    <Box sx={{ flexGrow: 1, width: '100%', height: '100%', minHeight: 0 }}>
                        <iframe
                            src={`${API_URL}/files/${document.file_url.split('/').slice(-1)[0]}#toolbar=1&navpanes=1&scrollbar=1`}
                            title={document.title}
                            style={{
                                width: '100%',
                                height: '100%',
                                border: 'none',
                                minHeight: 'calc(95vh - 80px)'
                            }}
                        />
                    </Box>
                </DialogContent>
            </Dialog>

            {/* Informações Estruturadas */}
            <Grid container spacing={3} id="document-details">
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

                            <Box sx={{ mb: 2 }}>
                                <Typography variant="subtitle2" color="text.secondary">
                                    Ano de Publicação
                                </Typography>
                                <Typography variant="body1">
                                    {document.publish_year || "-"}
                                </Typography>
                            </Box>

                            <Box>
                                <Typography variant="subtitle2" color="text.secondary">
                                    Orientador
                                </Typography>
                                <Typography variant="body1">
                                    {document.advisor 
                                        ? document.advisor.name 
                                        : document.advisor_name || "-"}
                                </Typography>
                                {(document.advisor?.email || document.advisor_email) && (
                                    <Typography variant="caption" color="text.secondary">
                                        {document.advisor?.email || document.advisor_email}
                                    </Typography>
                                )}
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
