import { useState } from "react";

export default function Upload() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const upload = async () => {
    if (!file) return alert("Selecione um arquivo!");

    setUploading(true);

    const form = new FormData();
    form.append("file", file);

    const res = await fetch(`${import.meta.env.VITE_API_URL}/upload`, {
      method: "POST",
      body: form,
    });

    const json = await res.json();
    setUploading(false);

    console.log(json);

    alert("Uploaded!\nURL:\n" + json.url);
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Upload para MinIO</h1>

      <input
        type="file"
        onChange={e => setFile(e.target.files?.[0] ?? null)}
      />

      <br />

      <button onClick={upload} disabled={uploading}>
        {uploading ? "Enviando..." : "Enviar"}
      </button>

      {file && <p>Arquivo: {file.name}</p>}
    </div>
  );
}
