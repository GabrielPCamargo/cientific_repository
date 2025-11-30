import { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Grid,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";

export default function MyPublications() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showViewer, setShowViewer] = useState(false);
  const [viewingDocument, setViewingDocument] = useState(null);

  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    if (savedToken) {
      setToken(savedToken);
      fetchDocuments();
    } else {
      setError("Você precisa estar autenticado. Faça login primeiro.");
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (token) {
      fetchDocuments();
    }
  }, [token]);

  const fetchDocuments = async () => {
    setLoading(true);
    setError("");
    
    const savedToken = localStorage.getItem("token");
    console.log("Token encontrado:", savedToken ? "Sim" : "Não");
    
    if (!savedToken) {
      setError("Token não encontrado. Faça login novamente.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${apiUrl}/documents/my-publications`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${savedToken}`,
          "Content-Type": "application/json",
        },
      });

      console.log("Status da resposta:", res.status);

      if (!res.ok) {
        if (res.status === 401) {
          setError("Sessão expirada. Faça login novamente.");
          localStorage.removeItem("token");
          localStorage.removeItem("email");
        } else {
          setError(`Erro ao carregar publicações (${res.status})`);
        }
        setLoading(false);
        return;
      }

      const data = await res.json();
      setDocuments(data);
    } catch (err) {
      setError("Erro ao conectar com o servidor");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (doc) => {
    setSelectedDocument(doc);
    setShowDetails(true);
  };

  const handleDownload = (fileUrl) => {
    if (fileUrl) {
      window.open(fileUrl, "_blank");
    }
  };

  const handleCloseDetails = () => {
    setShowDetails(false);
    setSelectedDocument(null);
  };

  const handleViewFile = (fileUrl, docTitle) => {
    setViewingDocument({ url: fileUrl, title: docTitle });
    setShowViewer(true);
  };

  const handleCloseViewer = () => {
    setShowViewer(false);
    setViewingDocument(null);
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px" }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto", mt: 3, p: 2 }}>
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
            <Typography variant="h4" sx={{ fontWeight: "bold" }}>
              📚 Minhas Publicações
            </Typography>
            <Button variant="contained" color="primary" onClick={fetchDocuments}>
              Atualizar
            </Button>
          </Box>
          <Typography variant="body1" color="textSecondary">
            Total de documentos: <strong>{documents.length}</strong>
          </Typography>
        </CardContent>
      </Card>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {documents.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: "center", py: 5 }}>
            <Typography variant="h6" color="textSecondary">
              Você ainda não publicou nenhum documento.
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
              Clique em "Publicar Documento" para enviar seu primeiro trabalho.
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead sx={{ bgcolor: (theme) => theme.palette.background.paper }}>
              <TableRow>
                <TableCell sx={{ fontWeight: "bold" }}>Título</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Autores</TableCell>
                <TableCell sx={{ fontWeight: "bold" }} align="center">
                  Ano
                </TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Tipo</TableCell>
                <TableCell sx={{ fontWeight: "bold" }} align="center">
                  Ações
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {documents.map((doc, index) => (
                <TableRow key={index} sx={{ "&:hover": { bgcolor: (theme) => theme.palette.action.hover } }}>
                  <TableCell sx={{ fontWeight: "500", maxWidth: "300px" }}>
                    <Typography variant="body2" sx={{ fontWeight: "500", mb: 0.5 }}>
                      {doc.title}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {doc.abstract?.substring(0, 50)}
                      {doc.abstract?.length > 50 ? "..." : ""}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {doc.authors.length > 0 ? (
                      <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                        {doc.authors.slice(0, 2).map((author, i) => (
                          <Typography key={i} variant="caption">
                            {author.name}
                          </Typography>
                        ))}
                        {doc.authors.length > 2 && (
                          <Typography variant="caption" sx={{ fontStyle: "italic", color: "gray" }}>
                            +{doc.authors.length - 2} mais
                          </Typography>
                        )}
                      </Box>
                    ) : (
                      <Typography variant="caption" color="textSecondary">
                        -
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell align="center">
                    <Chip label={doc.publish_year} size="small" variant="outlined" />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={doc.type}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: "flex", gap: 1, justifyContent: "center", flexWrap: "wrap" }}>
                      <Button
                        size="small"
                        variant="contained"
                        color="success"
                        onClick={() => handleViewFile(doc.file_url, doc.title)}
                      >
                        📖 Ler
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => handleViewDetails(doc)}
                      >
                        👁️ Detalhes
                      </Button>
                      <Button
                        size="small"
                        variant="contained"
                        onClick={() => handleDownload(doc.file_url)}
                      >
                        ⬇️ Download
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* MODAL: Detalhes do Documento */}
      <Dialog open={showDetails} onClose={handleCloseDetails} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: "bold", fontSize: "1.2rem" }}>
          📄 Detalhes do Documento
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          {selectedDocument && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Box>
                <Typography variant="body2" sx={{ fontWeight: "bold", color: "gray" }}>
                  Título
                </Typography>
                <Typography variant="body1">{selectedDocument.title}</Typography>
              </Box>

              <Box>
                <Typography variant="body2" sx={{ fontWeight: "bold", color: "gray" }}>
                  Resumo
                </Typography>
                <Typography variant="body2">{selectedDocument.abstract || "Não fornecido"}</Typography>
              </Box>

              <Box>
                <Typography variant="body2" sx={{ fontWeight: "bold", color: "gray" }}>
                  Autores
                </Typography>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                  {selectedDocument.authors.length > 0 ? (
                    selectedDocument.authors.map((author, i) => (
                      <Typography key={i} variant="body2">
                        • {author.name}
                        {author.email && ` (${author.email})`}
                      </Typography>
                    ))
                  ) : (
                    <Typography variant="body2" color="textSecondary">
                      -
                    </Typography>
                  )}
                </Box>
              </Box>

              <Box>
                <Typography variant="body2" sx={{ fontWeight: "bold", color: "gray" }}>
                  Palavras-Chave
                </Typography>
                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                  {selectedDocument.keywords.length > 0 ? (
                    selectedDocument.keywords.map((kw, i) => (
                      <Chip key={i} label={kw.keyword} size="small" />
                    ))
                  ) : (
                    <Typography variant="body2" color="textSecondary">
                      -
                    </Typography>
                  )}
                </Box>
              </Box>

              <Box>
                <Typography variant="body2" sx={{ fontWeight: "bold", color: "gray" }}>
                  Informações
                </Typography>
                <Grid container spacing={1}>
                  <Grid item xs={6}>
                    <Typography variant="caption" sx={{ fontWeight: "bold" }}>
                      Tipo:
                    </Typography>
                    <Typography variant="caption">
                      {selectedDocument.type}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" sx={{ fontWeight: "bold" }}>
                      Ano:
                    </Typography>
                    <Typography variant="caption">
                      {selectedDocument.publish_year}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" sx={{ fontWeight: "bold" }}>
                      Campo:
                    </Typography>
                    <Typography variant="caption">
                      {selectedDocument.field || "-"}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" sx={{ fontWeight: "bold" }}>
                      Curso:
                    </Typography>
                    <Typography variant="caption">
                      {selectedDocument.course?.name || "-"}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>

              <Box>
                <Typography variant="body2" sx={{ fontWeight: "bold", color: "gray" }}>
                  Evento
                </Typography>
                <Typography variant="body2">
                  {selectedDocument.event
                    ? `${selectedDocument.event.name} (${selectedDocument.event.code})`
                    : "Não associado"}
                </Typography>
              </Box>

              <Box sx={{ p: 2, bgcolor: (theme) => theme.palette.background.paper, borderRadius: 1 }}>
                <Typography variant="caption" sx={{ fontWeight: "bold", color: "gray" }}>
                  URL do Arquivo:
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ wordBreak: "break-all", display: "block", mt: 0.5 }}
                >
                  {selectedDocument.file_url}
                </Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => handleDownload(selectedDocument?.file_url)}
          >
            ⬇️ Download
          </Button>
          <Button variant="outlined" onClick={handleCloseDetails}>
            Fechar
          </Button>
        </DialogActions>
      </Dialog>

      {/* MODAL: Visualizar Arquivo */}
      <Dialog open={showViewer} onClose={handleCloseViewer} maxWidth="lg" fullWidth sx={{ "& .MuiDialog-paper": { height: "90vh" } }}>
        <DialogTitle sx={{ fontWeight: "bold", fontSize: "1.2rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span>📖 {viewingDocument?.title}</span>
        </DialogTitle>
        <DialogContent sx={{ p: 2, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <Box sx={{ flex: 1, overflow: "auto", bgcolor: (theme) => theme.palette.background.paper, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", gap: 2 }}>
            <Typography variant="body1" sx={{ textAlign: "center" }}>
              Abra o arquivo em uma nova aba para visualização completa:
            </Typography>
            <Button
              variant="contained"
              color="primary"
              size="large"
              onClick={() => {
                window.open(viewingDocument?.url, "_blank");
              }}
            >
              🔗 Abrir em Nova Aba
            </Button>
            <Typography variant="caption" color="textSecondary" sx={{ textAlign: "center", mt: 2 }}>
              O arquivo será aberto diretamente do servidor MinIO
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button
            variant="contained"
            onClick={() => handleDownload(viewingDocument?.url)}
          >
            ⬇️ Download
          </Button>
          <Button variant="outlined" onClick={handleCloseViewer}>
            Fechar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
