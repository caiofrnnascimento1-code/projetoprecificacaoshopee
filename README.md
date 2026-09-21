# 🛒 Precificador Shopee

Ferramenta de precificação para vendedores da Shopee, baseada na planilha "Precificação Março/26".

**Acesse a versão online:** _(URL gerada após o deploy na Vercel)_

## Funcionalidades

- 📋 **Precificação** com 4 cenários: Preço de Venda, Promoções, Ofertas de Banner e Ofertas Relâmpago
- 💰 Cálculo de Taxa Shopee (por faixa de preço), Imposto, NF de Entrada, Taxa de Antecipação
- 📈 Lucro em R$ e %, ROAS Mínimo e Teto de Investimento em ADS (% do lucro ou R$ fixo por venda)
- ☁️ **Sincronização entre aparelhos**: crie uma chave de acesso e seus dados ficam salvos na nuvem (Upstash Redis via Vercel)
- 🎯 **Calculadora de Preço Ideal**: informe custos e lucro desejado, e descubra o preço mínimo de venda
- ⚙️ Configurações: modalidade CPF/CNPJ, campanha, tabela de taxas editável
- 💾 Salvamento automático no navegador (localStorage) e exportação CSV

## Como usar

Basta abrir a URL publicada — tudo roda no navegador, sem instalar nada.

## Tecnologias

HTML + CSS + JavaScript puro (arquivo único, sem dependências).
