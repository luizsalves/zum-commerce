# Zum Commerce: front-end

Vitrine e painel da plataforma SaaS da Zum Web Studio para lojas Shopify. A API em C# fica no repositório separado **`zum-commerce-api`**.

| Aplicação | Caminho | Stack |
|---|---|---|
| Front-end (este repositório) | `zum-commerce/frontend` | React 19, TypeScript, Vite, Tailwind 4, Firebase (Auth, Firestore, Storage), Shopify Storefront API |
| Back-end | `zum-commerce-api/backend` | ASP.NET Core (.NET 10), Firestore, Shopify Admin API |

## Rodar local

Os dois repositórios ficam lado a lado:

```
C:\Projetos\Zum\
 ├─ zum-commerce\        ← este repositório (front)
 └─ zum-commerce-api\    ← API em C#
```

1. Configure o front: copie `frontend/.env.example` para `frontend/.env.local` e preencha com os dados do app Web do Firebase.
2. Configure a API conforme o README do `zum-commerce-api`.
3. Dê dois cliques em **`iniciar-backend.bat`** (API em http://localhost:8080) e em **`iniciar-frontend.bat`** (site em http://localhost:5173).

| Endereço | O quê |
|---|---|
| http://localhost:5173 | Vitrine da loja definida em `VITE_DEFAULT_TENANT` (ou `?loja=id`) |
| http://localhost:5173/admin | Painel (produtos, clientes, taxas, plataforma) |

Em desenvolvimento, o Vite redireciona `/api` para a API local, então não é preciso configurar CORS.

## Scripts (`frontend/`)

| Comando | O quê |
|---|---|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Checagem de tipos + build de produção em `frontend/dist` |
| `npm run typecheck` | Só a checagem de tipos |
| `npm run lint` | ESLint |
| `npm run format` | Prettier |
| `npm test` | Testes (Vitest) |

## Deploy

```bash
cd frontend && npm run build && cd ..
firebase deploy --only hosting,firestore:rules,storage
```

O `firebase.json` redireciona `/api/**` para o serviço `zum-commerce-api` no Cloud Run (`southamerica-east1`). Assim, front e API ficam no mesmo domínio.

As regras de segurança (`firestore.rules`, `storage.rules`) ficam neste repositório porque são publicadas junto com o site.

Mais detalhes: [ARCHITECTURE.md](ARCHITECTURE.md) e [ESCOPO_DO_PROJETO.md](ESCOPO_DO_PROJETO.md). Instruções para IAs de código: [AGENTS.md](AGENTS.md).

Repositórios: [luizsalves/zum-commerce](https://github.com/luizsalves/zum-commerce) (este) e [luizsalves/zum-commerce-api](https://github.com/luizsalves/zum-commerce-api).
