# Sítio Iluminado

Site do Sítio Iluminado (Biritiba Mirim / Mogi das Cruzes - SP), em React + Vite, com animações em GSAP.

## Rodando

```bash
npm install
npm run dev      # servidor local em http://localhost:5173
npm run build    # gera a versão de produção em dist/
npm run lint
```

## Estrutura

| Caminho | O que é |
| --- | --- |
| `src/pages/Home.jsx` | Página pública: hero animado, estrutura, destaques, orçamento e contato |
| `src/components/Calculadora.jsx` | Simulador de orçamento que monta a mensagem do WhatsApp |
| `src/data/site.js` | **Contatos, tabela de preços e taxas**: atualize valores aqui |
| `src/admin/` | Painel administrativo em `/admin` (ver abaixo) |
| `public/img/` | Fotos otimizadas em WebP (500px e 1000px) |
| `public/og-image.jpg` | Imagem de compartilhamento (WhatsApp, redes sociais) |
| `referencias/` | Fotos originais e materiais de divulgação (não vão para o site) |

## Adicionando fotos

As fotos do site ficam em `public/img/<nome>-500.webp` e `public/img/<nome>-1000.webp`.
Para gerar a partir de uma foto original (requer Python com Pillow):

```bash
python -c "from PIL import Image, ImageOps; import sys; n=sys.argv[2]; im=ImageOps.exif_transpose(Image.open(sys.argv[1])).convert('RGB'); [ (lambda c: (c.thumbnail((w, w*2)), c.save(f'public/img/{n}-{w}.webp', quality=66, method=6)))(im.copy()) for w in (1000, 500) ]" "foto-original.jpeg" nome-da-foto
```

## Publicação

O site usa rotas no navegador (`/admin`). Na hospedagem, configure para que qualquer caminho
desconhecido sirva o `index.html` (ex.: Netlify `_redirects`, Vercel `rewrites`).

## Painel administrativo (`/admin`)

Gestão dos imóveis da Hospeda Temporada: painel com indicadores, calendário de disponibilidade,
reservas (pré-reserva → aguardando sinal → confirmada), pagamentos, clientes, financeiro,
repasse a proprietários, contratos, mensagens de WhatsApp com modelos, relatórios e configurações.

| Caminho | O que é |
| --- | --- |
| `src/admin/data/store.js` | **Camada de dados.** Hoje salva no `localStorage`; é o único arquivo a trocar ao ligar um banco |
| `src/admin/data/seed.js` | Imóveis do portfólio, configurações padrão, modelos de mensagem e dados de exemplo |
| `src/admin/data/selectors.js` | Regras de negócio: situação, sinal/saldo, conflitos de datas, comissão, resumos, alertas |
| `src/admin/lib/contrato.js` | Contrato de locação gerado a partir da reserva |
| `src/admin/pages/` | Uma página por item do menu |
| `src/admin/forms/` | Modais de reserva, cliente, imóvel, despesa, bloqueio e disponibilidade |

**Importante enquanto não houver banco de dados:**

- Os dados ficam **só no navegador** em que foram cadastrados. Use *Configurações → Baixar backup*
  com frequência; o mesmo JSON serve para migrar para o banco depois.
- O painel **não tem login**. Qualquer pessoa que souber o endereço `/admin` consegue abri-lo
  (mas só vê os dados do próprio navegador). A autenticação deve vir junto com o banco.
- O painel começa com dados de exemplo; remova em *Configurações → Remover dados de exemplo*.
