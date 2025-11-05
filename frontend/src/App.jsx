import { useEffect, useState } from "react";
import axios from "axios";
import { Container, Typography, Card, CardContent } from "@mui/material";

function App() {
  const [msg, setMsg] = useState("");

  useEffect(() => {
    axios.get("http://localhost:8000/")
      .then(res => {
        setMsg(res.data.message)
        console.log(res);
      })
      .catch(() => setMsg("Erro ao conectar com o backend."));
  }, []);

  return (
    <Container sx={{ mt: 5 }}>
      <p>
        Meu teste de aplicação fullstack com React, Material-UI, FastAPI e PostgreSQL.
      </p>
      <Card>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Portal de Produção Científica
          </Typography>
          <Typography>{msg}</Typography>
        </CardContent>
      </Card>
    </Container>
  );
}

export default App;
