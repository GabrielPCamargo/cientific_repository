import { useEffect, useState } from "react";
import axios from "axios";
import { Container, Typography, Card, CardContent } from "@mui/material";
import Upload from "./Upload.jsx";

function App() {
  const [msg, setMsg] = useState("");

  useEffect(() => {
    axios.get("http://localhost:8000/")
      .then(res => {
        setMsg(res.data.message);
        console.log(import.meta.env.VITE_API_URL);
        console.log(res);
      })
      .catch(() => setMsg("Erro ao conectar com o backend."));
  }, []);

  return (
    <Container sx={{ mt: 5 }}>
      <p>
        Meu tes
      </p>
      <Card>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Portal de Produção Científica
          </Typography>
          <Typography>{msg}</Typography>
          <Upload />
        </CardContent>
      </Card>
    </Container>
  );
}

export default App;
