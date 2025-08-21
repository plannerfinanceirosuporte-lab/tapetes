/*
  # Adicionar campo para banner acima do header

  1. Nova Coluna
    - `header_banner_url` - URL do banner que aparece acima do header

  2. Configuração
    - Campo opcional com valor padrão vazio
    - Permite personalização do banner superior
*/

-- Adicionar coluna para banner acima do header
ALTER TABLE store_settings ADD COLUMN IF NOT EXISTS header_banner_url text DEFAULT '';

-- Atualizar timestamp
UPDATE store_settings SET updated_at = now() WHERE id = (SELECT id FROM store_settings LIMIT 1);