// Importação do Supabase via CDN (garanta que o script esteja no HTML ou carregado)
const SUPABASE_URL = 'https://dlcvrnnffozyqzerjzch.supabase.co'; // Copiado da aba General do seu projeto
const SUPABASE_ANON_KEY = 'sb_publishable_6kEqckpfyMBEMX2cXejWtA_sxfVCeD_'; // Copie o valor da chave "default" em Publishable key na imagem

// Inicializa o cliente do Supabase
const supabaseClient = window.supabase.createClient('https://dlcvrnnffozyqzerjzch.supabase.co', sb_publishable_6kEqckpfyMBEMX2cXejWtA_sxfVCeD_);