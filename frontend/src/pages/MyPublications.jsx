import { useState, useEffect, useRef } from "react";
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
  IconButton,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/esm/Close.js";
import DeleteIcon from "@mui/icons-material/esm/Delete.js";
import EditIcon from "@mui/icons-material/esm/Edit.js";

export default function MyPublications() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showViewer, setShowViewer] = useState(false);
  const [viewingDocument, setViewingDocument] = useState(null);

  // Edit Modal State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingDocument, setEditingDocument] = useState(null);
  const [editForm, setEditForm] = useState({
    title: "",
    abstract: "",
    type: "",
    field: "",
    publish_year: new Date().getFullYear(),
    authors: [],
    keywords: [],
    file_url: "",
    event_id: null,
    course_id: null,
  });
  const [newKeyword, setNewKeyword] = useState("");
  const [editFile, setEditFile] = useState(null);
  const [uploadingFile, setUploadingFile] = useState(false);
  const fileInputRef = useRef(null);

  // Delete Modal State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingDocument, setDeletingDocument] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Events and Courses for editing
  const [events, setEvents] = useState([]);
  const [courses, setCourses] = useState([]);

  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    if (savedToken) {
      setToken(savedToken);
      fetchDocuments();
      fetchEvents();
      fetchCourses();
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

  const fetchEvents = async () => {
    try {
      const res = await fetch(`${apiUrl}/event`);
      if (res.ok) {
        const data = await res.json();
        setEvents(data);
      }
    } catch (err) {
      console.error("Erro ao carregar eventos:", err);
    }
  };

  const fetchCourses = async () => {
    try {
      const res = await fetch(`${apiUrl}/course`);
      if (res.ok) {
        const data = await res.json();
        setCourses(data);
      }
    } catch (err) {
      console.error("Erro ao carregar cursos:", err);
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

  // ============ EDIT FUNCTIONS ============
  const handleOpenEdit = (doc) => {
    setEditingDocument(doc);
    setEditForm({
      title: doc.title || "",
      abstract: doc.abstract || "",
      type: doc.type || "",
      field: doc.field || "",
      publish_year: doc.publish_year || new Date().getFullYear(),
      authors: doc.authors?.map(a => ({ name: a.name, email: a.email || "" })) || [],
      keywords: doc.keywords?.map(k => k.keyword) || [],
      file_url: doc.file_url || "",
      event_id: doc.event_id || null,
      course_id: doc.course_id || null,
    });
    setEditFile(null);
    setShowEditModal(true);
  };

  const handleCloseEdit = () => {
    setShowEditModal(false);
    setEditingDocument(null);
    setEditForm({
      title: "",
      abstract: "",
      type: "",
      field: "",
      publish_year: new Date().getFullYear(),
      authors: [],
      keywords: [],
      file_url: "",
      event_id: null,
      course_id: null,
    });
    setEditFile(null);
    setNewKeyword("");
  };

  const handleEditFormChange = (field, value) => {
    setEditForm(prev => ({ ...prev, [field]: value }));
  };

  const handleAddAuthor = () => {
    setEditForm(prev => ({
      ...prev,
      authors: [...prev.authors, { name: "", email: "" }]
    }));
  };

  const handleRemoveAuthor = (index) => {
    setEditForm(prev => ({
      ...prev,
      authors: prev.authors.filter((_, i) => i !== index)
    }));
  };

  const handleAuthorChange = (index, field, value) => {
    setEditForm(prev => ({
      ...prev,
      authors: prev.authors.map((author, i) => 
        i === index ? { ...author, [field]: value } : author
      )
    }));
  };

  const handleAddKeyword = () => {
    if (newKeyword.trim() && !editForm.keywords.includes(newKeyword.trim())) {
      setEditForm(prev => ({
        ...prev,
        keywords: [...prev.keywords, newKeyword.trim()]
      }));
      setNewKeyword("");
    }
  };

  const handleRemoveKeyword = (keyword) => {
    setEditForm(prev => ({
      ...prev,
      keywords: prev.keywords.filter(k => k !== keyword)
    }));
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setEditFile(e.target.files[0]);
    }
  };

  const uploadNewFile = async () => {
    if (!editFile) return editForm.file_url;

    setUploadingFile(true);
    const formData = new FormData();
    formData.append("file", editFile);

    try {
      const res = await fetch(`${apiUrl}/upload`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Erro ao fazer upload do arquivo");
      }

      const data = await res.json();
      return data.url;
    } catch (err) {
      throw err;
    } finally {
      setUploadingFile(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!editingDocument) return;

    setError("");
    setSuccess("");

    try {
      // Upload new file if selected
      let fileUrl = editForm.file_url;
      if (editFile) {
        fileUrl = await uploadNewFile();
      }

      const payload = {
        title: editForm.title,
        abstract: editForm.abstract,
        type: editForm.type,
        field: editForm.field,
        publish_year: editForm.publish_year,
        authors: editForm.authors.filter(a => a.name.trim() !== ""),
        keywords: editForm.keywords,
        file_url: fileUrl,
        event_id: editForm.event_id || null,
        course_id: editForm.course_id || null,
      };

      const res = await fetch(`${apiUrl}/documents/${editingDocument.id}`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || "Erro ao atualizar documento");
      }

      setSuccess("Documento atualizado com sucesso!");
      handleCloseEdit();
      fetchDocuments();
    } catch (err) {
      setError(err.message || "Erro ao atualizar documento");
    }
  };

  // ============ DELETE FUNCTIONS ============
  const handleOpenDelete = (doc) => {
    setDeletingDocument(doc);
    setShowDeleteModal(true);
  };

  const handleCloseDelete = () => {
    setShowDeleteModal(false);
    setDeletingDocument(null);
  };

  const handleConfirmDelete = async () => {
    if (!deletingDocument) return;

    setDeleting(true);
    setError("");

    try {
      const res = await fetch(`${apiUrl}/documents/${deletingDocument.id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || "Erro ao excluir documento");
      }

      setSuccess("Documento excluído com sucesso!");
      handleCloseDelete();
      fetchDocuments();
    } catch (err) {
      setError(err.message || "Erro ao excluir documento");
    } finally {
      setDeleting(false);
    }
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
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess("")}>
          {success}
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
                        color="info"
                        onClick={() => handleOpenEdit(doc)}
                        startIcon={<EditIcon />}
                      >
                        Editar
                      </Button>
                      <Button
                        size="small"
                        variant="contained"
                        color="error"
                        onClick={() => handleOpenDelete(doc)}
                        startIcon={<DeleteIcon />}
                      >
                        Excluir
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

      {/* MODAL: Visualizador de PDF */}
      <Dialog
        open={showViewer}
        onClose={handleCloseViewer}
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
            📖 {viewingDocument?.title}
          </Typography>
          <IconButton
            aria-label="fechar"
            onClick={handleCloseViewer}
            sx={{ color: 'grey.500' }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 0, display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ flexGrow: 1, width: '100%', height: '100%', minHeight: 0 }}>
            {viewingDocument?.url && (
              <iframe
                src={`${apiUrl}/files/${viewingDocument.url.split('/').slice(-1)[0]}#toolbar=1&navpanes=1&scrollbar=1`}
                title={viewingDocument?.title}
                style={{
                  width: '100%',
                  height: '100%',
                  border: 'none',
                  minHeight: 'calc(95vh - 80px)'
                }}
              />
            )}
          </Box>
        </DialogContent>
      </Dialog>

      {/* MODAL: Editar Documento */}
      <Dialog
        open={showEditModal}
        onClose={handleCloseEdit}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { maxHeight: '90vh' } }}
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          borderBottom: 1,
          borderColor: 'divider',
        }}>
          <Typography variant="h6">✏️ Editar Documento</Typography>
          <IconButton onClick={handleCloseEdit} sx={{ color: 'grey.500' }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 1 }}>
            {/* Título */}
            <TextField
              label="Título"
              fullWidth
              required
              value={editForm.title}
              onChange={(e) => handleEditFormChange('title', e.target.value)}
            />

            {/* Resumo */}
            <TextField
              label="Resumo"
              fullWidth
              multiline
              rows={4}
              value={editForm.abstract}
              onChange={(e) => handleEditFormChange('abstract', e.target.value)}
            />

            {/* Tipo e Ano */}
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <InputLabel>Tipo</InputLabel>
                  <Select
                    value={editForm.type}
                    label="Tipo"
                    onChange={(e) => handleEditFormChange('type', e.target.value)}
                  >
                    <MenuItem value="event">Evento</MenuItem>
                    <MenuItem value="symposium">Simpósio</MenuItem>
                    <MenuItem value="tcc">TCC</MenuItem>
                    <MenuItem value="article">Artigo</MenuItem>
                    <MenuItem value="thesis">Dissertação</MenuItem>
                    <MenuItem value="other">Outro</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Ano de Publicação"
                  type="number"
                  fullWidth
                  value={editForm.publish_year}
                  onChange={(e) => handleEditFormChange('publish_year', parseInt(e.target.value))}
                />
              </Grid>
            </Grid>

            {/* Campo/Área */}
            <TextField
              label="Área/Campo"
              fullWidth
              value={editForm.field}
              onChange={(e) => handleEditFormChange('field', e.target.value)}
            />

            {/* Evento */}
            <FormControl fullWidth>
              <InputLabel>Evento</InputLabel>
              <Select
                value={editForm.event_id || ""}
                label="Evento"
                onChange={(e) => handleEditFormChange('event_id', e.target.value || null)}
              >
                <MenuItem value="">Nenhum</MenuItem>
                {events.map((event) => (
                  <MenuItem key={event.id} value={event.id}>
                    {event.name} ({event.code})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Curso */}
            <FormControl fullWidth>
              <InputLabel>Curso</InputLabel>
              <Select
                value={editForm.course_id || ""}
                label="Curso"
                onChange={(e) => handleEditFormChange('course_id', e.target.value || null)}
              >
                <MenuItem value="">Nenhum</MenuItem>
                {courses.map((course) => (
                  <MenuItem key={course.id} value={course.id}>
                    {course.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Autores */}
            <Box>
              <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'bold' }}>
                Autores
              </Typography>
              {editForm.authors.map((author, index) => (
                <Box key={index} sx={{ display: 'flex', gap: 1, mb: 1 }}>
                  <TextField
                    label="Nome"
                    size="small"
                    value={author.name}
                    onChange={(e) => handleAuthorChange(index, 'name', e.target.value)}
                    sx={{ flex: 1 }}
                  />
                  <TextField
                    label="Email"
                    size="small"
                    value={author.email}
                    onChange={(e) => handleAuthorChange(index, 'email', e.target.value)}
                    sx={{ flex: 1 }}
                  />
                  <Button
                    size="small"
                    color="error"
                    onClick={() => handleRemoveAuthor(index)}
                    disabled={editForm.authors.length === 1}
                  >
                    ✕
                  </Button>
                </Box>
              ))}
              <Button size="small" onClick={handleAddAuthor}>
                + Adicionar Autor
              </Button>
            </Box>

            {/* Palavras-chave */}
            <Box>
              <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'bold' }}>
                Palavras-chave
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mb: 1, flexWrap: 'wrap' }}>
                {editForm.keywords.map((kw, index) => (
                  <Chip
                    key={index}
                    label={kw}
                    onDelete={() => handleRemoveKeyword(kw)}
                    size="small"
                  />
                ))}
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  label="Nova palavra-chave"
                  size="small"
                  value={newKeyword}
                  onChange={(e) => setNewKeyword(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddKeyword())}
                  sx={{ flex: 1 }}
                />
                <Button variant="outlined" size="small" onClick={handleAddKeyword}>
                  Adicionar
                </Button>
              </Box>
            </Box>

            {/* Arquivo */}
            <Box>
              <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'bold' }}>
                Arquivo PDF
              </Typography>
              <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mb: 1 }}>
                Arquivo atual: {editForm.file_url?.split('/').pop() || 'Nenhum'}
              </Typography>
              <input
                type="file"
                accept=".pdf"
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <Button
                  variant="outlined"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {editFile ? 'Trocar arquivo' : 'Substituir arquivo'}
                </Button>
                {editFile && (
                  <Typography variant="body2" color="success.main">
                    ✓ {editFile.name}
                  </Typography>
                )}
              </Box>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1, borderTop: 1, borderColor: 'divider' }}>
          <Button variant="outlined" onClick={handleCloseEdit}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSaveEdit}
            disabled={uploadingFile || !editForm.title}
          >
            {uploadingFile ? <CircularProgress size={20} /> : 'Salvar Alterações'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* MODAL: Confirmar Exclusão */}
      <Dialog open={showDeleteModal} onClose={handleCloseDelete} maxWidth="sm">
        <DialogTitle sx={{ color: 'error.main', fontWeight: 'bold' }}>
          🗑️ Confirmar Exclusão
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Tem certeza que deseja excluir o documento:
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
            "{deletingDocument?.title}"
          </Typography>
          <Alert severity="warning" sx={{ mt: 2 }}>
            Esta ação não pode ser desfeita. O arquivo também será removido do servidor.
          </Alert>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button variant="outlined" onClick={handleCloseDelete} disabled={deleting}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleConfirmDelete}
            disabled={deleting}
            startIcon={deleting ? <CircularProgress size={16} color="inherit" /> : <DeleteIcon />}
          >
            {deleting ? 'Excluindo...' : 'Excluir'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
