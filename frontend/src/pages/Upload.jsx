import { useState, useEffect, useRef } from "react";
import {
  Box,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Card,
  CardContent,
  Typography,
  Divider,
  Alert,
  CircularProgress,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";

export default function Upload() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [email, setEmail] = useState(localStorage.getItem("email") || "");
  const [password, setPassword] = useState("");
  const [loginMode, setLoginMode] = useState(!token);

  // Dados do documento
  const [title, setTitle] = useState("");
  const [abstract, setAbstract] = useState("");
  const [type, setType] = useState("event");
  const [field, setField] = useState("");
  const [publishYear, setPublishYear] = useState(new Date().getFullYear());

  // Cursos
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [newCourseName, setNewCourseName] = useState("");
  const [showNewCourse, setShowNewCourse] = useState(false);
  const [loadingCourses, setLoadingCourses] = useState(false);

  // Eventos
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState("");
  const [newEventName, setNewEventName] = useState("");
  const [newEventCode, setNewEventCode] = useState("");
  const [showNewEvent, setShowNewEvent] = useState(false);
  const [loadingEvents, setLoadingEvents] = useState(false);

  // Autores
  const [authors, setAuthors] = useState([
    { name: "", email: "" }
  ]);

  // Keywords
  const [keywords, setKeywords] = useState([]);
  const [keywordInput, setKeywordInput] = useState("");

  // Estados da UI
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [currentUserId, setCurrentUserId] = useState(null);
  const [showReuseDialog, setShowReuseDialog] = useState(false);

  // Ref para o input de arquivo
  const fileInputRef = useRef(null);

  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const savedEmail = localStorage.getItem("email");
    const savedToken = localStorage.getItem("token");
    if (savedEmail) setEmail(savedEmail);
    if (savedToken) setToken(savedToken);
    if (savedToken) setLoginMode(false);
  }, []);

  useEffect(() => {
    if (token && !loginMode) {
      fetchCourses();
      fetchEvents();
      fetchCurrentUser();
    }
  }, [token, loginMode]);

  const fetchCurrentUser = async () => {
    try {
      const res = await fetch(`${apiUrl}/me`, {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });
      if (res.ok) {
        const user = await res.json();
        setCurrentUserId(user.id);
      }
    } catch (err) {
      console.error("Erro ao buscar usuário atual:", err);
    }
  };

  // ============ LOGIN ============
  const handleLogin = async (e) => {
    e.preventDefault();
    setUploading(true);
    setError("");

    try {
      const res = await fetch(`${apiUrl}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        setError("Email ou senha inválidos");
        setUploading(false);
        return;
      }

      const data = await res.json();
      localStorage.setItem("token", data.access_token);
      localStorage.setItem("email", email);
      setToken(data.access_token);
      setLoginMode(false);
      setPassword("");
      setUploading(false);
    } catch (err) {
      setError("Erro ao conectar com o servidor");
      setUploading(false);
    }
  };

  // ============ CURSOS ============
  const fetchCourses = async () => {
    setLoadingCourses(true);
    try {
      const res = await fetch(`${apiUrl}/course`);
      if (res.ok) {
        const data = await res.json();
        setCourses(data);
      }
    } catch (err) {
      setError("Erro ao carregar cursos");
    } finally {
      setLoadingCourses(false);
    }
  };

  const createCourse = async () => {
    if (!newCourseName.trim()) {
      setError("Digite o nome do curso");
      return;
    }

    try {
      const res = await fetch(`${apiUrl}/course`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newCourseName }),
      });

      if (res.ok) {
        const newCourse = await res.json();
        setCourses([...courses, newCourse]);
        setSelectedCourse(newCourse.id);
        setNewCourseName("");
        setShowNewCourse(false);
        setSuccess("Curso criado com sucesso!");
      } else {
        setError("Erro ao criar curso");
      }
    } catch (err) {
      setError("Erro ao criar curso");
    }
  };

  // ============ EVENTOS ============
  const fetchEvents = async () => {
    setLoadingEvents(true);
    try {
      const res = await fetch(`${apiUrl}/event`);
      if (res.ok) {
        const data = await res.json();
        setEvents(data);
      }
    } catch (err) {
      setError("Erro ao carregar eventos");
    } finally {
      setLoadingEvents(false);
    }
  };

  const createEvent = async () => {
    if (!newEventName.trim() || !newEventCode.trim()) {
      setError("Digite o nome e código do evento");
      return;
    }

    try {
      const res = await fetch(`${apiUrl}/event`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newEventName, code: newEventCode }),
      });

      if (res.ok) {
        const newEvent = await res.json();
        setEvents([...events, newEvent]);
        setSelectedEvent(newEvent.id);
        setNewEventName("");
        setNewEventCode("");
        setShowNewEvent(false);
        setSuccess("Evento criado com sucesso!");
      } else {
        setError("Erro ao criar evento");
      }
    } catch (err) {
      setError("Erro ao criar evento");
    }
  };

  // ============ AUTORES ============
  const addAuthor = () => {
    setAuthors([...authors, { name: "", email: "" }]);
  };

  const removeAuthor = (index) => {
    setAuthors(authors.filter((_, i) => i !== index));
  };

  const updateAuthor = (index, field, value) => {
    const newAuthors = [...authors];
    newAuthors[index][field] = value;
    setAuthors(newAuthors);
  };

  // ============ KEYWORDS ============
  const addKeyword = () => {
    if (keywordInput.trim()) {
      setKeywords([...keywords, keywordInput.trim()]);
      setKeywordInput("");
    }
  };

  const removeKeyword = (index) => {
    setKeywords(keywords.filter((_, i) => i !== index));
  };

  // ============ UPLOAD DE ARQUIVO ============
  const uploadFile = async () => {
    if (!file) {
      setError("Selecione um arquivo");
      return;
    }

    setUploading(true);
    setError("");

    try {
      const form = new FormData();
      form.append("file", file);

      const res = await fetch(`${apiUrl}/upload`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
        body: form,
      });

      if (!res.ok) {
        setError("Erro ao fazer upload do arquivo");
        setUploading(false);
        return;
      }

      const json = await res.json();
      return json.url;
    } catch (err) {
      setError("Erro ao fazer upload do arquivo");
      setUploading(false);
      return null;
    }
  };

  // ============ ENVIAR DOCUMENTO ============
  const handlePublish = async () => {
    setError("");
    setSuccess("");

    // Validações
    if (!title.trim()) {
      setError("Digite o título do documento");
      return;
    }
    if (!file) {
      setError("Selecione um arquivo");
      return;
    }
    if (authors.some(a => !a.name.trim())) {
      setError("Preencha o nome de todos os autores");
      return;
    }
    if (keywords.length === 0) {
      setError("Adicione pelo menos uma palavra-chave");
      return;
    }
    if (!selectedCourse) {
      setError("Selecione ou crie um curso");
      return;
    }

    setUploading(true);

    try {
      // 1. Upload do arquivo
      const fileUrl = await uploadFile();
      if (!fileUrl) {
        setUploading(false);
        return;
      }

      // 2. Preparar dados do documento
      const documentData = {
        title,
        abstract,
        type,
        field,
        publish_year: publishYear,
        file_url: fileUrl,
        course_id: selectedCourse ? parseInt(selectedCourse) : null,
        event_id: selectedEvent ? parseInt(selectedEvent) : null,
        advisor_id: currentUserId || 1, // Usar ID do usuário logado
        authors: authors
          .filter(a => a.name.trim())
          .map(a => ({
            name: a.name,
            email: a.email || null,
          })),
        keywords: keywords,
      };
      
      console.log("Enviando documento:", documentData);

      // 3. Enviar documento para o backend
      const res = await fetch(`${apiUrl}/documents`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(documentData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.error("Erro ao publicar:", errorData);
        setError(`Erro ao publicar: ${errorData.detail || JSON.stringify(errorData)}`);
        setUploading(false);
        return;
      }

      // 4. Sucesso!
      setSuccess("Documento publicado com sucesso!");
      setShowReuseDialog(true); // Mostra modal de pergunta
      setUploading(false);
    } catch (err) {
      setError("Erro ao publicar documento");
      setUploading(false);
    }
  };

  const resetForm = (keepBaseInfo = false) => {
    // Sempre reseta esses campos
    setFile(null);
    // Limpa o input de arquivo também
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setTitle("");
    setAbstract("");
    setAuthors([{ name: "", email: "" }]);
    setKeywords([]);
    setKeywordInput("");

    if (keepBaseInfo) {
      // Mantém: area/campo, evento, ano, curso
      // field, selectedEvent, publishYear, selectedCourse já estão mantidos
      console.log("Formulário resetado mantendo:", {
        field,
        selectedEvent,
        publishYear,
        selectedCourse,
      });
    } else {
      // Reseta completamente
      setType("event");
      setField("");
      setPublishYear(new Date().getFullYear());
      setSelectedEvent("");
      setSelectedCourse("");
    }
  };

  const handleReuseInfo = () => {
    setShowReuseDialog(false);
    setSuccess("");
    resetForm(true); // Mantém informações base
  };

  const handleNewDocument = () => {
    setShowReuseDialog(false);
    setSuccess("");
    resetForm(false); // Reseta tudo
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("email");
    setToken("");
    setEmail("");
    setLoginMode(true);
  };

  // ============ LOGIN PAGE ============
  if (loginMode) {
    return (
      <Box sx={{ maxWidth: 400, mx: "auto", mt: 5, p: 2 }}>
        <Card>
          <CardContent>
            <Typography variant="h5" gutterBottom>
              Login
            </Typography>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            <form onSubmit={handleLogin}>
              <TextField
                fullWidth
                type="email"
                label="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                margin="normal"
              />
              <TextField
                fullWidth
                type="password"
                label="Senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                margin="normal"
              />
              <Button
                fullWidth
                variant="contained"
                type="submit"
                disabled={uploading}
                sx={{ mt: 2 }}
              >
                {uploading ? "Entrando..." : "Entrar"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </Box>
    );
  }

  // ============ UPLOAD PAGE ============
  return (
    <Box sx={{ maxWidth: 900, mx: "auto", mt: 3, p: 2 }}>
      <Card>
        <CardContent>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
            <Typography variant="h5">
              Publicar Documento Científico
            </Typography>
            <Box>
              <Typography variant="body2" sx={{ mb: 1 }}>
                Logado como: <strong>{email}</strong>
              </Typography>
              <Button variant="outlined" size="small" onClick={handleLogout}>
                Logout
              </Button>
            </Box>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

          <Divider sx={{ my: 2 }} />

          {/* ARQUIVO */}
          <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
            1. Arquivo
          </Typography>
          <Box sx={{ p: 2, border: (theme) => `2px dashed ${theme.palette.divider}`, borderRadius: 1, mb: 2 }}>
            <input
              ref={fileInputRef}
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              style={{ width: "100%" }}
            />
            {file && (
              <Typography variant="body2" sx={{ mt: 1 }}>
                📄 Arquivo: <strong>{file.name}</strong>
              </Typography>
            )}
          </Box>

          {/* TÍTULO E ABSTRACT */}
          <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
            2. Informações Básicas
          </Typography>
          <TextField
            fullWidth
            label="Título"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Resumo (Abstract)"
            value={abstract}
            onChange={(e) => setAbstract(e.target.value)}
            multiline
            rows={4}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Campo/Área"
            value={field}
            onChange={(e) => setField(e.target.value)}
            margin="normal"
          />
          <TextField
            fullWidth
            type="number"
            label="Ano de Publicação"
            value={publishYear}
            onChange={(e) => setPublishYear(parseInt(e.target.value))}
            margin="normal"
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Tipo</InputLabel>
            <Select value={type} onChange={(e) => setType(e.target.value)} label="Tipo">
              <MenuItem value="event">Evento</MenuItem>
              <MenuItem value="symposium">Simpósio</MenuItem>
              <MenuItem value="periodical">Periódico</MenuItem>
              <MenuItem value="workshop">Workshop</MenuItem>
            </Select>
          </FormControl>

          <Divider sx={{ my: 3 }} />

          {/* CURSOS */}
          <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
            3. Curso
          </Typography>
          {loadingCourses ? (
            <CircularProgress size={24} />
          ) : (
            <>
              <FormControl fullWidth margin="normal">
                <InputLabel>Selecione um curso</InputLabel>
                <Select
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                  label="Selecione um curso"
                >
                  <MenuItem value="">-- Nenhum --</MenuItem>
                  {courses.map((course) => (
                    <MenuItem key={course.id} value={course.id}>
                      {course.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {!showNewCourse ? (
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => setShowNewCourse(true)}
                  sx={{ mt: 1 }}
                >
                  + Criar novo curso
                </Button>
              ) : (
                <Box sx={{ mt: 2, p: 2, bgcolor: (theme) => theme.palette.background.paper, borderRadius: 1 }}>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    Novo Curso:
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    label="Nome do curso"
                    value={newCourseName}
                    onChange={(e) => setNewCourseName(e.target.value)}
                    margin="normal"
                  />
                  <Box sx={{ mt: 1 }}>
                    <Button size="small" variant="contained" onClick={createCourse} sx={{ mr: 1 }}>
                      Criar
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => {
                        setShowNewCourse(false);
                        setNewCourseName("");
                      }}
                    >
                      Cancelar
                    </Button>
                  </Box>
                </Box>
              )}
            </>
          )}

          <Divider sx={{ my: 3 }} />

          {/* EVENTOS */}
          <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
            4. Evento (Opcional)
          </Typography>
          {loadingEvents ? (
            <CircularProgress size={24} />
          ) : (
            <>
              <FormControl fullWidth margin="normal">
                <InputLabel>Selecione um evento</InputLabel>
                <Select
                  value={selectedEvent}
                  onChange={(e) => setSelectedEvent(e.target.value)}
                  label="Selecione um evento"
                >
                  <MenuItem value="">-- Nenhum --</MenuItem>
                  {events.map((event) => (
                    <MenuItem key={event.id} value={event.id}>
                      {event.name} ({event.code})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {!showNewEvent ? (
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => setShowNewEvent(true)}
                  sx={{ mt: 1 }}
                >
                  + Criar novo evento
                </Button>
              ) : (
                <Box sx={{ mt: 2, p: 2, bgcolor: (theme) => theme.palette.background.paper, borderRadius: 1 }}>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    Novo Evento:
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    label="Nome do evento"
                    value={newEventName}
                    onChange={(e) => setNewEventName(e.target.value)}
                    margin="normal"
                  />
                  <TextField
                    fullWidth
                    size="small"
                    label="Código do evento (ex: LATS)"
                    value={newEventCode}
                    onChange={(e) => setNewEventCode(e.target.value)}
                    margin="normal"
                  />
                  <Box sx={{ mt: 1 }}>
                    <Button size="small" variant="contained" onClick={createEvent} sx={{ mr: 1 }}>
                      Criar
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => {
                        setShowNewEvent(false);
                        setNewEventName("");
                        setNewEventCode("");
                      }}
                    >
                      Cancelar
                    </Button>
                  </Box>
                </Box>
              )}
            </>
          )}

          <Divider sx={{ my: 3 }} />

          {/* AUTORES */}
          <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
            5. Autores
          </Typography>
          {authors.map((author, index) => (
            <Box key={index} sx={{ p: 2, mb: 2, bgcolor: (theme) => theme.palette.background.paper, borderRadius: 1 }}>
              <Box sx={{ display: "flex", gap: 1, mb: 1 }}>
                <TextField
                  size="small"
                  label="Nome"
                  value={author.name}
                  onChange={(e) => updateAuthor(index, "name", e.target.value)}
                  sx={{ flex: 1 }}
                />
                <TextField
                  size="small"
                  label="Email (opcional)"
                  value={author.email}
                  onChange={(e) => updateAuthor(index, "email", e.target.value)}
                  sx={{ flex: 1 }}
                />
                {authors.length > 1 && (
                  <Button
                    size="small"
                    variant="outlined"
                    color="error"
                    onClick={() => removeAuthor(index)}
                  >
                    Remover
                  </Button>
                )}
              </Box>
            </Box>
          ))}
          <Button variant="outlined" size="small" onClick={addAuthor}>
            + Adicionar Autor
          </Button>

          <Divider sx={{ my: 3 }} />

          {/* KEYWORDS */}
          <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
            6. Palavras-Chave
          </Typography>
          <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
            <TextField
              size="small"
              label="Palavra-chave"
              value={keywordInput}
              onChange={(e) => setKeywordInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  addKeyword();
                  e.preventDefault();
                }
              }}
              sx={{ flex: 1 }}
            />
            <Button variant="contained" size="small" onClick={addKeyword}>
              Adicionar
            </Button>
          </Box>
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            {keywords.map((kw, index) => (
              <Chip
                key={index}
                label={kw}
                onDelete={() => removeKeyword(index)}
                color="primary"
              />
            ))}
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* BOTÃO PUBLICAR */}
          <Button
            fullWidth
            variant="contained"
            size="large"
            onClick={handlePublish}
            disabled={uploading}
            sx={{ py: 1.5 }}
          >
            {uploading ? (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <CircularProgress size={20} color="inherit" />
                Publicando...
              </Box>
            ) : (
              "Publicar Documento"
            )}
          </Button>
        </CardContent>
      </Card>

      {/* MODAL: Reutilizar informações após sucesso */}
      <Dialog open={showReuseDialog} onClose={() => setShowReuseDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: "bold", fontSize: "1.2rem" }}>
          📋 Publicar Mais Trabalhos?
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Deseja publicar mais um trabalho com características parecidas?
          </Typography>
          <Box sx={{ p: 2, bgcolor: (theme) => theme.palette.background.paper, borderRadius: 1, mb: 2 }}>
            <Typography variant="body2" sx={{ fontWeight: "bold", mb: 1 }}>
              Se escolher "Manter Informações", será mantido:
            </Typography>
            <ul style={{ margin: "8px 0", paddingLeft: "20px" }}>
              <li>✅ Campo/Área: <strong>{field || "Não preenchido"}</strong></li>
              <li>✅ Evento: <strong>{events.find(e => e.id == selectedEvent)?.name || "Nenhum"}</strong></li>
              <li>✅ Ano: <strong>{publishYear}</strong></li>
              <li>✅ Curso: <strong>{courses.find(c => c.id == selectedCourse)?.name || "Nenhum"}</strong></li>
            </ul>
            <Typography variant="body2" sx={{ fontWeight: "bold", mt: 2, mb: 1 }}>
              Será zerado:
            </Typography>
            <ul style={{ margin: "8px 0", paddingLeft: "20px" }}>
              <li>❌ Título</li>
              <li>❌ Resumo/Abstract</li>
              <li>❌ Palavras-Chave</li>
              <li>❌ Arquivo</li>
              <li>❌ Autores (retorna a 1 autor vazio)</li>
            </ul>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleReuseInfo}
            sx={{ flex: 1 }}
          >
            Manter Informações
          </Button>
          <Button
            variant="outlined"
            color="primary"
            onClick={handleNewDocument}
            sx={{ flex: 1 }}
          >
            Enviar Novo
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
