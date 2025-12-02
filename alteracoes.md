[Commit: PDF visualizer of the browser, migration of advisor info]
Resumo das alterações

1. Corrigido erro de importação circular (ImportError)
Criei /backend/app/utils.py com as funções get_public_url e slugify_filename
Atualizei main.py para importar de utils.py
Removi import desnecessário de document.py
2. Aplicada migration pendente do banco
Executei alembic upgrade head para criar as colunas advisor_name e advisor_email na tabela documents
3. Configurado MinIO para acesso público
Habilitei download público no bucket: mc anonymous set download
Configurei CORS no MinIO
4. Corrigido Content-Type no upload de arquivos
Adicionei content_type=content_type no put_object para que PDFs sejam salvos com o tipo correto
5. Criado endpoint para servir PDFs (/files/{file_id})
Novo endpoint em main.py que serve arquivos do MinIO com headers corretos:
Content-Type: application/pdf
Content-Disposition: inline (exibe ao invés de baixar)
6. Atualizado visualizador de PDF no frontend
DocumentDetail.jsx: trocou Google Docs Viewer pelo endpoint /files/
MyPublications.jsx: mesma correção
Antes: PDFs não abriam (usava Google Docs Viewer que não acessa localhost)

Depois: PDFs abrem diretamente no navegador usando o visualizador nativo


[Commit: Frontend of delete and edit in My Publications]
The implementation is complete. Here's a summary of what was added:

Summary
New Features in MyPublications.jsx:
1. Edit Document Modal (✏️ Editar)

Full form to edit all document fields:
Title, Abstract, Type, Field, Year
Event and Course selection (fetches from API)
Authors (add/remove)
Keywords (add/remove with chips)
File replacement (optional - upload new PDF)
Calls PUT /documents/{id} on the backend
2. Delete Document Modal (🗑️ Excluir)

Confirmation dialog with warning
Shows document title
Calls DELETE /documents/{id} on the backend
Also deletes the file from MinIO
3. UI Improvements

Success messages (green alerts)
Error messages are now dismissible
Loading states during operations
Edit and Delete buttons in the actions column
The frontend now integrates with the existing backend endpoints for editing and deleting documents. Refresh the page and you'll see the new Editar and Excluir buttons in the actions column of each document.