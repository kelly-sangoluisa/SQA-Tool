#!/bin/bash

# Archivo de salida
OUTPUT="proyecto_contexto_src.txt"

# Limpiar archivo si ya existe
echo "Generando contexto de la carpeta SRC..." > "$OUTPUT"

# Verificar si la carpeta src existe
if [ ! -d "src" ]; then
    echo "❌ Error: No se encontró la carpeta 'src' en este directorio."
    exit 1
fi

# 1. Estructura de la carpeta src
echo -e "\n==========================" >> "$OUTPUT"
echo "📁 ESTRUCTURA DE SRC" >> "$OUTPUT"
echo "==========================\n" >> "$OUTPUT"

# Intenta usar tree apuntando a src, si no, usa find apuntando a src
tree src -a -I 'node_modules|.git' >> "$OUTPUT" 2>/dev/null || find src -not -path "*/node_modules/*" >> "$OUTPUT"

# 2. Código fuente (Solo dentro de src)
echo -e "\n======================" >> "$OUTPUT"
echo "🧠 CÓDIGO FUENTE (SRC)" >> "$OUTPUT"
echo "======================\n" >> "$OUTPUT"

# Buscamos solo dentro de la ruta "./src"
find src -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" -o -name "*.css" -o -name "*.scss" -o -name "*.md" \) \
  -not -path "*/node_modules/*" \
  | while read file; do
    echo -e "\n--- $file ---\n" >> "$OUTPUT"
    cat "$file" >> "$OUTPUT"
done

echo -e "\n✅ Contexto de 'src' guardado en: $OUTPUT"