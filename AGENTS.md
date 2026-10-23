# AGENTS.md: instruções para IAs de código (zum-commerce)

Front da plataforma **Zum Commerce**: SaaS multi-loja de e-commerce sobre Shopify, da Zum Web Studio. Inclui o **painel** (`/admin`) e a **vitrine padrão** (`/`).
Antes de qualquer tarefa grande, leia **`ESCOPO_DO_PROJETO.md`** (produto, dinâmicas de compra, pendências por prioridade). A arquitetura está em **`ARCHITECTURE.md`**.

## Repositórios

| Repositório | Conteúdo |
|---|---|
| `github.com/luizsalves/zum-commerce` (este) | Front (React), regras do Firebase, `firebase.json`, **escopo oficial** |
| `github.com/luizsalves/zum-commerce-api` | API em C# (.NET 10) |

Não faça `push`, não crie branches remotas e não abra pull requests sem pedido explícito do usuário.

Localmente, os dois ficam lado a lado (`C:\Projetos\Zum\zum-commerce` e `C:\Projetos\Zum\zum-commerce-api`). Este `ESCOPO_DO_PROJETO.md` é a fonte oficial; existe uma cópia em `zum-commerce-api/docs/`. Ao alterar um, atualize o outro.

## Comandos (rodar em `frontend/`)

```bash
npm install
npm run dev          # http://localhost:5173 (vitrine) e /admin (painel); /api → http://localhost:8080
npm run build        # checagem de tipos + build
npm run typecheck
npm run lint
npm test             # Vitest
```

Na raiz: `iniciar-frontend.bat` e `iniciar-backend.bat` (Windows). Configuração local em `frontend/.env.local`, criado a partir do `.env.example` e **nunca commitado**.

## Estrutura (`frontend/src`)

```
routes/        AppRoutes, StoreRoutes, AdminRoutes, paths.ts (todos os caminhos de tela)
contexts/      TenantContext (loja), AuthContext (login/cadastro), CartContext (carrinho), AdminContext (loja do painel)
components/
  atoms/       sem regra de negócio: Alert, Field, Spinner, StatusBadge, WhatsAppButton
  molecules/   ProductCard, QuantityStepper, SearchBar, RequireTenant, CenterMessage
  organisms/   StoreHeader, StoreFooter, CartDrawer, LoginPanel, AdminHeader, FeeSimulator
  templates/   StoreLayout, AdminLayout
  pages/       store/ e admin/ (telas ligadas a rotas)
data/          listas e rótulos fixos
lib/           api.ts (API C#), storefront.ts (Shopify), firebase, tenant, fees, variants, richText, format, safeStorage
types/         tipos compartilhados (espelham os contratos da API)
```

## Regras obrigatórias

1. **Segredos:** nada secreto no front. Só o token **Storefront** (público) é usado no navegador. Client Secret e token Admin ficam na API.
2. **Quem fala com quem:**
   - Produtos, coleções e carrinho vão **direto para a Shopify** (`lib/storefront.ts`).
   - Identidade do cliente (`/api/store/...`) e tudo do painel (`/api/admin/...`, `/api/platform/...`) passam pela **API** via `lib/api.ts`, que envia o token do Firebase e o `X-Tenant-Id`.
3. **Compra só com cadastro:** finalizar compra exige login + cadastro na loja, depois `cartBuyerIdentityUpdate` e redirecionamento para o `checkoutUrl`. Não crie checkout próprio.
4. **Atomic Design:** coloque cada componente no nível certo. Nada de pastas vazias ou "reservadas".
5. **Caminhos de tela** só por `routes/paths.ts`. Redirecionamento pós-login só para caminhos internos (`safeNext`).
6. **Lógica pura** (cálculos, conversões, grade de variações) em `lib/`, com teste `*.test.ts` ao lado.
7. **`localStorage`** sempre via `safeStorage` (pode falhar em aba anônima).
8. **Textos** para o usuário em português, claros para lojista e cliente final.
9. **Regras do Firebase** (`firestore.rules`, `storage.rules`): qualquer coleção nova precisa de regra. `tenantSecrets` continua bloqueado para o front.
10. **Shopify:** confira na documentação da Storefront API (versão `2026-10`) antes de usar um campo ou mutation novos.

## Como trabalhar

- Antes de dizer que terminou: `npm run build` e `npm test` sem erros. Se não conseguir rodar, diga isso claramente.
- Mudanças grandes: apresente o plano (arquivos novos e alterados) antes de executar.
- Não apague nem renomeie arquivos sem necessidade explícita.
- Não adicione bibliotecas novas sem pedir.
- Ao terminar uma pendência do escopo, atualize a seção "Status" do `ESCOPO_DO_PROJETO.md` (e a cópia na API).

## Sites sob medida (fora deste repositório)

Cada cliente com site exclusivo tem repositório próprio (ex.: `elika-tiaras`). Esses sites usam a mesma Storefront API e as rotas `/api/store/...` com o ID fixo da loja. O lojista administra tudo pelo painel deste repositório; o site do cliente **não** tem área administrativa.

## Git

- Branch principal: `main`. Trabalho em branches `feature/<assunto>` ou `fix/<assunto>`.
- Mensagens de commit em português, no imperativo e curtas.
- Commit e push só quando o usuário pedir.
