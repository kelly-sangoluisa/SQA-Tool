#!/bin/bash

OUTPUT="src_contexto.txt"
SRC_DIR="src"

echo "Generando contexto de $SRC_DIR..." > "$OUTPUT"

# 1) Estructura de src
echo -e "\n===========================\n📁 ESTRUCTURA: $SRC_DIR\n===========================\n" >> "$OUTPUT"
if command -v tree >/dev/null 2>&1; then
  tree -a "$SRC_DIR" >> "$OUTPUT"
else
  find "$SRC_DIR" -print >> "$OUTPUT"
fi

# 2) Contenido de archivos (solo texto)
echo -e "\n===========================\n🧠 CONTENIDO DE ARCHIVOS (texto)\n===========================\n" >> "$OUTPUT"

find "$SRC_DIR" -type f \
  -not -path "*/node_modules/*" \
  -not -path "*/dist/*" \
  | while IFS= read -r file; do
      mime=$(file -bi "$file" 2>/dev/null)
      if [[ "$mime" == text/* ]] || [[ "$mime" == *json* ]] || [[ "$mime" == *xml* ]] || [[ "$mime" == *javascript* ]] || [[ "$mime" == *x-shellscript* ]] || [[ "$mime" == *x-yaml* ]] || [[ "$mime" == *csv* ]] || [[ "$mime" == *x-empty* ]]; then
        echo -e "\n--- $file ---\n" >> "$OUTPUT"
        cat "$file" >> "$OUTPUT"
      else
        echo -e "\n--- $file --- [omitido: binario ($mime)]\n" >> "$OUTPUT"
      fi
    done

echo -e "\n✅ Contexto de $SRC_DIR guardado en: $OUTPUT"
