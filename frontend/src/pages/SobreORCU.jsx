import React from 'react';
import { Box, Paper, Typography, Divider, Link, List, ListItem, ListItemText } from '@mui/material';

export default function SobreORCU() {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>Sobre o RCU</Typography>

      <Paper sx={{ p: 3, mb: 2 }}>
        <Typography variant="h6">O que é o RCU?</Typography>
        <Typography sx={{ mt: 1 }}>
          O RCU (Repositório Científico da UERGS) é um portal leve para publicação,
          descoberta e gestão de produções acadêmicas no âmbito da UERGS. O objetivo é facilitar o depósito e a divulgação
          para a comunidade, de documentos científicos, como artigos, teses, trabalhos de conclusão de curso, trabalhos de eventos,
          entre outros produzidos pelos professores e alunos. Assim promovendo e incentivando a produção científica na universidade.
      
        </Typography>
      </Paper>

      <Paper sx={{ p: 3, mb: 2 }}>
        <Typography variant="h6">Funcionalidades principais</Typography>
        <List>
          <ListItem>
            <ListItemText primary="Upload e armazenamento de documentos (MinIO/S3)." />
          </ListItem>
          <ListItem>
            <ListItemText primary="Busca avançada com filtros por ano, área, evento e palavras-chave." />
          </ListItem>
          <ListItem>
            <ListItemText primary="Marcação de favoritos e páginas pessoais para gerenciamento." />
          </ListItem>
          <ListItem>
            <ListItemText primary="Configurações de tema e preferências locais armazenadas no navegador." />
          </ListItem>
        </List>
      </Paper>

      <Paper sx={{ p: 3, mb: 2 }}>
        <Typography variant="h6">Contato e contribuições</Typography>
        <Typography sx={{ mt: 1 }}>
          Este projeto foi desenvolvido como um repositório universitário simples. Para
          feedback, problemas ou contribuições, abra uma issue no repositório ou envie um
          e-mail para a equipe responsável em <strong>joao-costa01@uergs.edu.br</strong> e <strong>gabriel-camargo01@uergs.edu.br</strong>
        </Typography>

        <Divider sx={{ my: 2 }} />

        <Typography variant="body2">Links úteis:</Typography>
        <List>
          <ListItem>
            <Link href="https://github.com/GabrielPCamargo/cientific_repository" underline="hover" target="_blank" 
  rel="noopener noreferrer">Repositório do projeto (local)</Link>
          </ListItem>
        </List>
      </Paper>

      <Typography variant="caption" color="text.secondary">
        Versão demo — dados de exemplo e funcionalidades básicas. Não é um sistema de produção.
      </Typography>
    </Box>
  );
}
