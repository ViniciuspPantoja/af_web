## 📋 ORDEM DE APRESENTAÇÃO DOS ARQUIVOS

---

### 1️⃣ **Transacao.js** (backend/models/Transacao.js)

**O QUE É:**
Esse arquivo define o MODELO DE DADOS das transações usando Mongoose. É tipo um "contrato" que diz pro MongoDB: "toda transação que você salvar tem que ter esses campos, com esses tipos e essas regras".

**COMO FUNCIONA:**
1. Importa o Mongoose (biblioteca que conecta Node.js com MongoDB)
2. Cria um Schema (molde) chamado `transacaoSchema`
3. Define cada campo com suas regras
4. Exporta o modelo pronto pra usar nas rotas

**DETALHAMENTO DE CADA CAMPO:**

**tipo:**
• Type: String
• Required: true (obrigatório)
• Enum: ['receita', 'despesa'] (só aceita esses dois valores)
• Por quê? Garante que não vai salvar tipo inválido tipo "entrada" ou "saída"

**categoria:**
• Type: String
• Required: true (obrigatório)
• Trim: true (remove espaços no começo e fim automaticamente)
• Exemplo: "Alimentação", "Transporte", "Salário"
• Por quê trim? Se o usuário digitar " Alimentação " com espaços, salva como "Alimentação"

**descricao:**
• Type: String
• Required: true (obrigatório)
• Trim: true (remove espaços)
• Exemplo: "Compra no supermercado", "Salário mensal"
• É o texto que explica o que é a transação

**valor:**
• Type: Number
• Required: true (obrigatório)
• Min: 0 (não aceita valores negativos)
• Exemplo: 150.50, 2000, 35.99
• Por quê min 0? Não faz sentido ter transação com valor negativo (o tipo já define se é receita ou despesa)

**data:**
• Type: Date
• Required: true (obrigatório)
• Default: Date.now (se não enviar, usa a data/hora atual)
• Exemplo: new Date("2024-01-15")

**TIMESTAMPS:**
• timestamps: true (opção do Mongoose)
• Adiciona automaticamente:
  - createdAt: data/hora quando foi criado
  - updatedAt: data/hora da última atualização
• Você não precisa fazer nada, o Mongoose cuida disso!

**EXPORTAÇÃO:**
• module.exports = mongoose.model('Transacao', transacaoSchema)
• Cria o modelo "Transacao" que você usa nas rotas
• Quando você faz Transacao.find(), ele busca nessa "tabela" do MongoDB

**EXEMPLO DE USO:**
```javascript
const transacao = new Transacao({
  tipo: 'receita',
  categoria: 'Salário',
  descricao: 'Salário mensal',
  valor: 5000,
  data: new Date('2024-01-15')
});
// createdAt e updatedAt são adicionados automaticamente!
```

---

### 2️⃣ **transacoes.js** (backend/routes/transacoes.js) ⭐ ATIVO

**O QUE É:**
Esse é o CORAÇÃO da API! Aqui tem TODAS as rotas REST que o frontend vai chamar. É um arquivo de rotas do Express que define o que acontece quando alguém faz uma requisição HTTP.

**ESTRUTURA:**
1. Importa Express Router e o modelo Transacao
2. Cria um router do Express
3. Define 6 rotas diferentes (GET, POST, PUT, DELETE)
4. Exporta o router pra usar no server.js

**ROTA 1: GET /api/transacoes (Listar todas)**

**O que faz:**
Busca todas as transações no banco, com filtros opcionais.

**Como funciona:**
```javascript
router.get('/', async (req, res) => {
  // req.query pega os parâmetros da URL
  // Exemplo: /api/transacoes?categoria=Alimentação&tipo=despesa
  const { categoria, tipo } = req.query;
  
  // Cria um filtro vazio
  const filter = {};
  
  // Se veio categoria na URL, adiciona no filtro
  if (categoria) {
    filter.categoria = categoria;
  }
  
  // Se veio tipo na URL, adiciona no filtro
  if (tipo) {
    filter.tipo = tipo;
  }
  
  // Busca no MongoDB com o filtro
  // .sort({ data: -1 }) = ordena por data, mais recente primeiro
  const transacoes = await Transacao.find(filter).sort({ data: -1 });
  
  // Retorna em JSON
  res.json(transacoes);
});
```

**Exemplos de uso:**
• GET /api/transacoes → retorna todas
• GET /api/transacoes?categoria=Alimentação → só alimentação
• GET /api/transacoes?tipo=receita → só receitas
• GET /api/transacoes?categoria=Transporte&tipo=despesa → transporte e despesa

**ROTA 2: GET /api/transacoes/:id (Buscar uma específica)**

**O que faz:**
Busca uma transação pelo ID (aquele _id que o MongoDB cria).

**Como funciona:**
```javascript
router.get('/:id', async (req, res) => {
  // req.params.id pega o ID da URL
  // Exemplo: /api/transacoes/507f1f77bcf86cd799439011
  const transacao = await Transacao.findById(req.params.id);
  
  // Se não encontrou, retorna 404
  if (!transacao) {
    return res.status(404).json({ message: 'Transação não encontrada' });
  }
  
  // Retorna a transação
  res.json(transacao);
});
```

**Tratamento de erro:**
Se o ID for inválido ou não existir, retorna status 404 (não encontrado).

**ROTA 3: POST /api/transacoes (Criar nova)**

**O que faz:**
Cria uma nova transação no banco.

**Como funciona:**
```javascript
router.post('/', async (req, res) => {
  // req.body tem os dados enviados no corpo da requisição
  const { tipo, categoria, descricao, valor, data } = req.body;
  
  // VALIDAÇÃO: verifica se campos obrigatórios foram enviados
  if (!tipo || !categoria || !descricao || valor === undefined) {
    return res.status(400).json({ 
      message: 'Campos obrigatórios: tipo, categoria, descricao, valor' 
    });
  }
  
  // Cria nova transação usando o modelo
  const transacao = new Transacao({
    tipo,
    categoria,
    descricao,
    valor,
    data: parseDate(data) // converte a data
  });
  
  // Salva no banco (async/await)
  const savedTransacao = await transacao.save();
  
  // Retorna status 201 (criado) com a transação salva
  res.status(201).json(savedTransacao);
});
```

**Status HTTP:**
• 201 = Criado com sucesso
• 400 = Bad Request (dados inválidos)

**ROTA 4: PUT /api/transacoes/:id (Atualizar)**

**O que faz:**
Atualiza uma transação existente. Permite atualização parcial (só os campos que você enviar).

**Como funciona:**
```javascript
router.put('/:id', async (req, res) => {
  // Busca a transação pelo ID
  const transacao = await Transacao.findById(req.params.id);
  
  // Se não encontrou, retorna 404
  if (!transacao) {
    return res.status(404).json({ message: 'Transação não encontrada' });
  }
  
  // ATUALIZAÇÃO PARCIAL: só atualiza se o campo foi enviado
  if (tipo) transacao.tipo = tipo;
  if (categoria) transacao.categoria = categoria;
  if (descricao) transacao.descricao = descricao;
  if (valor !== undefined) transacao.valor = valor; // undefined é diferente de 0!
  if (data) transacao.data = parseDate(data);
  
  // Salva as alterações
  const updatedTransacao = await transacao.save();
  
  // Retorna a transação atualizada
  res.json(updatedTransacao);
});
```

**Por quê atualização parcial?**
Se você só quer mudar o valor, não precisa enviar todos os campos de novo. Só envia o valor!

**ROTA 5: DELETE /api/transacoes/:id (Deletar)**

**O que faz:**
Remove uma transação do banco.

**Como funciona:**
```javascript
router.delete('/:id', async (req, res) => {
  // Verifica se existe antes de deletar
  const transacao = await Transacao.findById(req.params.id);
  if (!transacao) {
    return res.status(404).json({ message: 'Transação não encontrada' });
  }
  
  // Deleta do banco
  await Transacao.findByIdAndDelete(req.params.id);
  
  // Retorna mensagem de sucesso
  res.json({ message: 'Transação deletada com sucesso' });
});
```

**ROTA 6: GET /api/transacoes/saldo/total (Calcular saldo)**

**O que faz:**
Calcula o saldo total usando agregação do MongoDB (soma todas as receitas e subtrai todas as despesas).

**Como funciona (AGREGAÇÃO MONGODB):**
```javascript
router.get('/saldo/total', async (req, res) => {
  const result = await Transacao.aggregate([
    // ETAPA 1: Agrupa todas as transações
    {
      $group: {
        _id: null, // agrupa tudo junto (sem separar)
        receitas: {
          // Soma os valores onde tipo = 'receita'
          $sum: {
            $cond: [
              { $eq: ['$tipo', 'receita'] }, // se tipo for receita
              '$valor', // soma o valor
              0 // senão, soma 0
            ]
          }
        },
        despesas: {
          // Soma os valores onde tipo = 'despesa'
          $sum: {
            $cond: [
              { $eq: ['$tipo', 'despesa'] }, // se tipo for despesa
              '$valor', // soma o valor
              0 // senão, soma 0
            ]
          }
        }
      }
    },
    // ETAPA 2: Calcula o saldo (receitas - despesas)
    {
      $project: {
        _id: 0, // remove o _id do resultado
        saldo: { $subtract: ['$receitas', '$despesas'] }
      }
    }
  ]);
  
  // Se não tem transações, retorna saldo 0
  const saldo = result.length > 0 ? result[0].saldo : 0;
  res.json({ saldo });
});
```

**Exemplo de resultado:**
Se você tem:
• Receitas: R$ 5000
• Despesas: R$ 3000
• Retorna: { saldo: 2000 }

**FUNÇÃO AUXILIAR: parseDate()**

**O que faz:**
Converte strings de data em vários formatos para objeto Date do JavaScript.

**Formatos aceitos:**
1. DD/MM/YYYY → "15/01/2024"
2. YYYY-MM-DD → "2024-01-15"
3. ISO → "2024-01-15T10:30:00.000Z"
4. Qualquer formato que o Date() aceite

**Como funciona:**
```javascript
const parseDate = (dateString) => {
  // Se não veio data, usa data atual
  if (!dateString) return new Date();
  
  // Tenta DD/MM/YYYY
  const ddmmyyyy = dateString.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (ddmmyyyy) {
    // Converte "15/01/2024" para "2024-01-15"
    return new Date(`${ddmmyyyy[3]}-${ddmmyyyy[2]}-${ddmmyyyy[1]}`);
  }
  
  // Tenta YYYY-MM-DD
  const yyyymmdd = dateString.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (yyyymmdd) {
    return new Date(dateString); // já está no formato certo
  }
  
  // Tenta qualquer outro formato que Date() aceite
  const parsed = new Date(dateString);
  if (!isNaN(parsed.getTime())) {
    return parsed;
  }
  
  // Se nada funcionou, retorna data atual
  return new Date();
};
```

**Por quê essa função?**
O frontend pode enviar data em formato brasileiro (DD/MM/YYYY), mas o MongoDB precisa de Date object. Essa função aceita qualquer formato e converte!

**TRATAMENTO DE ERROS:**
Todas as rotas usam try/catch:
• try: tenta executar
• catch: se der erro, retorna status 500 (erro do servidor) ou 400 (dados inválidos)

---

### 3️⃣ **main.ts** (frontend/src/main.ts)

**O QUE É:**
O PONTO DE ENTRADA da aplicação Angular. É o primeiro arquivo TypeScript que executa quando você abre a aplicação no navegador.

**COMO FUNCIONA:**
```typescript
// 1. Importa a função que inicia a aplicação
import { bootstrapApplication } from '@angular/platform-browser';

// 2. Importa a configuração global
import { appConfig } from './app/app.config';

// 3. Importa o componente raiz (App)
import { App } from './app/app';

// 4. INICIALIZA a aplicação
bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err)); // se der erro, mostra no console
```

**O QUE ACONTECE QUANDO EXECUTA:**
1. Angular lê o main.ts
2. Chama bootstrapApplication()
3. Passa o componente App (raiz) e a configuração
4. Angular monta o componente App na tag <app-root> do index.html
5. A aplicação começa a funcionar!

**POR QUÊ É IMPORTANTE:**
Sem esse arquivo, o Angular não sabe por onde começar. É tipo a "porta de entrada" da aplicação.

**TRATAMENTO DE ERROS:**
Se der algum erro no bootstrap (ex: componente não encontrado), o .catch() captura e mostra no console do navegador.

---

### 4️⃣ **app.config.ts** (frontend/src/app/app.config.ts)

**O QUE É:**
Configuração GLOBAL da aplicação Angular. Aqui você diz pro Angular: "preciso desses serviços e funcionalidades disponíveis em TODA a aplicação".

**COMO FUNCIONA:**
```typescript
// 1. Importa os tipos e funções necessárias
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { routes } from './app.routes';

// 2. Cria a configuração
export const appConfig: ApplicationConfig = {
  providers: [
    // PROVIDER 1: Tratamento de erros global
    provideBrowserGlobalErrorListeners(),
    
    // PROVIDER 2: Sistema de rotas
    provideRouter(routes),
    
    // PROVIDER 3: Cliente HTTP (pra fazer requisições)
    provideHttpClient()
  ]
};
```

**O QUE É UM PROVIDER?**
É um serviço/funcionalidade que fica disponível pra TODOS os componentes da aplicação. Você configura uma vez aqui e usa em qualquer lugar.

**PROVIDER 1: provideBrowserGlobalErrorListeners()**
• O que faz: Captura erros que acontecem na aplicação
• Quando usar: Se algum componente der erro, esse provider captura e você pode tratar
• Exemplo: Se uma requisição HTTP falhar, esse listener pode mostrar uma mensagem pro usuário

**PROVIDER 2: provideRouter(routes)**
• O que faz: Habilita o sistema de rotas do Angular
• routes: vem do app.routes.ts (por enquanto vazio, mas preparado pro futuro)
• Quando usar: Quando você quiser ter páginas diferentes (ex: /home, /sobre)
• Por enquanto: A aplicação é single-page, mas já está preparada pra rotas

**PROVIDER 3: provideHttpClient()**
• O que faz: Habilita o HttpClient do Angular
• Quando usar: Pra fazer requisições HTTP pro backend (GET, POST, PUT, DELETE)
• Exemplo: O TransacaoService usa esse HttpClient pra chamar a API
• Sem isso: Você não conseguiria fazer requisições HTTP!

**POR QUÊ É IMPORTANTE:**
Sem esses providers, os componentes não conseguiriam:
• Fazer requisições HTTP (sem HttpClient)
• Navegar entre páginas (sem Router)
• Tratar erros globalmente (sem ErrorListeners)

**EXPORTAÇÃO:**
O appConfig é exportado e importado no main.ts pra ser usado no bootstrap.

---

### 5️⃣ **app.html** (frontend/src/app/app.html)

**O QUE É:**
O TEMPLATE HTML do componente principal (App). É o que aparece na tela quando a aplicação carrega.

**COMO FUNCIONA:**
```html
<!-- Container principal -->
<div class="app-container">
  <!-- Título da página -->
  <h1>Transações Financeiras</h1>

  <!-- COMPONENTE 1: Dashboard (mostra o saldo) -->
  <app-dashboard></app-dashboard>

  <!-- Seção do formulário -->
  <div class="section">
    <!-- Título dinâmico: muda se está editando ou criando -->
    <h2>{{ editingTransacao ? 'Editar transação' : 'Nova transação' }}</h2>
    
    <!-- COMPONENTE 2: Formulário -->
    <app-transacao-form
      [transacao]="editingTransacao"  <!-- Passa a transação sendo editada -->
      (saved)="onFormSaved()"         <!-- Evento quando salva -->
      (cancelled)="onFormCancelled()" <!-- Evento quando cancela -->
    ></app-transacao-form>
  </div>

  <!-- Linha separadora -->
  <hr />

  <!-- Seção da lista -->
  <div class="section">
    <h2>Lista</h2>
    
    <!-- COMPONENTE 3: Lista de transações -->
    <app-transacao-list></app-transacao-list>
  </div>
</div>

<!-- Saída de rotas (pra quando tiver rotas no futuro) -->
<router-outlet />
```

**DETALHAMENTO:**

**{{ editingTransacao ? 'Editar transação' : 'Nova transação' }}**
• É uma INTERPOLAÇÃO do Angular
• Se editingTransacao tiver valor → mostra "Editar transação"
• Se editingTransacao for null → mostra "Nova transação"
• É dinâmico: muda automaticamente quando editingTransacao muda

**[transacao]="editingTransacao"**
• É PROPERTY BINDING (one-way, pai → filho)
• Passa o valor de editingTransacao (do app.ts) pro componente transacao-form
• O [ ] significa: "pegue o valor dessa propriedade e passe pro componente filho"
• Se editingTransacao for null → formulário vazio (modo criação)
• Se editingTransacao tiver valor → formulário preenchido (modo edição)

**(saved)="onFormSaved()"**
• É EVENT BINDING (filho → pai)
• Quando o componente transacao-form emite o evento "saved", chama onFormSaved()
• O ( ) significa: "escute esse evento do componente filho"
• Quando você salva uma transação, o formulário emite "saved" e o app.ts trata

**(cancelled)="onFormCancelled()"**
• Mesma coisa do saved, mas pro cancelamento
• Quando você cancela a edição, chama onFormCancelled()

**<app-dashboard></app-dashboard>**
• Renderiza o componente Dashboard
• Não precisa passar nada, ele busca o saldo sozinho

**<app-transacao-list></app-transacao-list>**
• Renderiza o componente TransacaoList
• Também funciona sozinho, busca as transações automaticamente

**<router-outlet />**
• É onde o Angular Router renderiza componentes de rotas
• Por enquanto não faz nada (não tem rotas)
• Mas quando você criar rotas, os componentes aparecem aqui

**ESTRUTURA VISUAL:**
```
┌─────────────────────────────────┐
│ Transações Financeiras          │
├─────────────────────────────────┤
│ [Dashboard - Saldo]             │
├─────────────────────────────────┤
│ Editar transação / Nova transação│
│ [Formulário]                    │
├─────────────────────────────────┤
│ Lista                           │
│ [Lista de transações]           │
└─────────────────────────────────┘
```

---

### 6️⃣ **app.ts** (frontend/src/app/app.ts) ✏️ MODIFICADO

**O QUE É:**
O COMPONENTE PRINCIPAL da aplicação Angular. É o "chefe" que coordena tudo e gerencia o estado global da aplicação.

**ESTRUTURA DO CÓDIGO:**
```typescript
// 1. IMPORTS
import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Dashboard } from './components/dashboard/dashboard';
import { TransacaoForm } from './components/transacao-form/transacao-form';
import { TransacaoList } from './components/transacao-list/transacao-list';
import { TransacaoService } from './services/transacao.service';
import { Transacao } from './models/transacao.model';

// 2. DECORATOR @Component (configuração do componente)
@Component({
  selector: 'app-root',           // Tag HTML: <app-root>
  imports: [                      // Componentes que esse componente usa
    RouterOutlet, 
    CommonModule, 
    Dashboard, 
    TransacaoForm, 
    TransacaoList
  ],
  templateUrl: './app.html',      // Template HTML
  styleUrl: './app.css'           // Estilos CSS
})

// 3. CLASSE DO COMPONENTE
export class App implements OnInit {
  title = 'Gestor Financeiro Pessoal';
  editingTransacao: Transacao | null = null; // Estado: qual transação está sendo editada

  // 4. CONSTRUTOR (injeção de dependências)
  constructor(private transacaoService: TransacaoService) {}

  // 5. LIFECYCLE HOOK: ngOnInit (executa quando componente é criado)
  ngOnInit(): void {
    // Escuta evento customizado do browser
    window.addEventListener('editTransacao', (event: any) => {
      this.editingTransacao = event.detail; // Atualiza o estado
    });
  }

  // 6. MÉTODO: quando formulário salva
  onFormSaved(): void {
    this.editingTransacao = null; // Limpa o estado de edição
    window.location.reload();     // Recarrega a página
  }

  // 7. MÉTODO: quando formulário cancela
  onFormCancelled(): void {
    this.editingTransacao = null; // Limpa o estado de edição
  }
}
```

**DETALHAMENTO:**

**DECORATOR @Component:**
É uma função especial do Angular que "decora" a classe e diz: "essa classe é um componente".

**selector: 'app-root'**
• Define a tag HTML que vai renderizar esse componente
• No index.html tem <app-root></app-root>
• Quando o Angular encontra essa tag, renderiza esse componente aqui

**imports: [RouterOutlet, CommonModule, Dashboard, ...]**
• Lista os componentes/diretivas que esse componente usa
• RouterOutlet: pra rotas (mesmo sem usar ainda)
• CommonModule: diretivas básicas do Angular (*ngIf, *ngFor, etc)
• Dashboard, TransacaoForm, TransacaoList: componentes filhos

**templateUrl e styleUrl:**
• Diz onde estão o HTML e CSS desse componente
• Angular busca esses arquivos e usa

**PROPRIEDADES DA CLASSE:**

**title:**
• Propriedade simples (não usada no template, mas poderia ser)
• Exemplo de dado que o componente guarda

**editingTransacao: Transacao | null**
• Estado importante: guarda qual transação está sendo editada
• null = nenhuma transação sendo editada (modo criação)
• Transacao = transação sendo editada (modo edição)
• O tipo "Transacao | null" significa: pode ser Transacao OU null

**CONSTRUTOR:**
```typescript
constructor(private transacaoService: TransacaoService) {}
```
• Injeção de dependências do Angular
• private = cria propriedade automaticamente
• Angular cria uma instância do TransacaoService e injeta aqui
• Por quê? Pra você poder usar this.transacaoService nos métodos

**ngOnInit():**
Lifecycle hook que executa DEPOIS que o componente é criado.

```typescript
ngOnInit(): void {
  window.addEventListener('editTransacao', (event: any) => {
    this.editingTransacao = event.detail;
  });
}
```

**O que faz:**
• Escuta um evento customizado do browser chamado 'editTransacao'
• Quando alguém dispara esse evento (ex: transacao-list quando clica em editar)
• Atualiza editingTransacao com os dados da transação (event.detail)

**Por quê evento customizado?**
É uma forma de comunicação entre componentes que não são pai/filho direto. O transacao-list dispara o evento, e o app.ts escuta e atualiza o estado.

**onFormSaved():**
```typescript
onFormSaved(): void {
  this.editingTransacao = null; // Limpa o estado
  window.location.reload();     // Recarrega página
}
```

**O que faz:**
• Quando o formulário salva com sucesso, esse método é chamado
• Limpa editingTransacao (volta pro modo criação)
• Recarrega a página inteira pra atualizar todos os dados

**Por quê reload?**
Garante que dashboard, lista e tudo mais atualiza com os dados novos do backend.

**onFormCancelled():**
```typescript
onFormCancelled(): void {
  this.editingTransacao = null; // Limpa o estado
}
```

**O que faz:**
• Quando você cancela a edição, limpa o estado
• Não recarrega a página (só limpa o formulário)

**FLUXO DE EDIÇÃO:**
1. Usuário clica em "Editar" na lista
2. transacao-list dispara evento 'editTransacao' com os dados
3. app.ts escuta e atualiza editingTransacao
4. app.html passa editingTransacao pro formulário via [transacao]
5. transacao-form recebe e preenche os campos
6. Usuário edita e salva
7. transacao-form emite evento 'saved'
8. app.ts chama onFormSaved()
9. Estado limpo e página recarregada

---

### 7️⃣ **app.spec.ts** (frontend/src/app/app.spec.ts)

**O QUE É:**
Arquivo de TESTES UNITÁRIOS do componente App. Usa o framework de testes do Angular (geralmente Jasmine ou Jest).

**ESTRUTURA ATUAL:**
```typescript
import { TestBed } from '@angular/core/testing';
import { App } from './app';

describe('App', () => {
  // Aqui viriam os testes
});
```

**O QUE É UM TESTE UNITÁRIO:**
É um código que testa se uma parte específica da aplicação funciona corretamente, sem precisar abrir o navegador.

**ESTRUTURA DE UM TESTE:**
```typescript
describe('App', () => {
  // beforeEach: executa antes de cada teste
  beforeEach(() => {
    TestBed.configureTestingModule({
      // Configura o ambiente de teste
    });
  });

  // it: define um teste específico
  it('deve criar o componente', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy(); // Verifica se foi criado
  });

  it('deve ter editingTransacao como null inicialmente', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app.editingTransacao).toBeNull(); // Verifica se é null
  });

  it('deve atualizar editingTransacao quando recebe evento editTransacao', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    
    // Simula o evento
    const evento = new CustomEvent('editTransacao', {
      detail: { _id: '123', tipo: 'receita' }
    });
    window.dispatchEvent(evento);
    
    // Verifica se atualizou
    expect(app.editingTransacao).not.toBeNull();
  });
});
```

**POR QUÊ TESTAR:**
• Garante que o código funciona
• Se você mudar algo, os testes avisam se quebrou
• Documenta como o componente deve funcionar
• Facilita refatoração (mudar código sem medo)

**POR QUÊ ESTÁ VAZIO:**
Por enquanto só tem a estrutura. Os testes ainda não foram escritos, mas o arquivo está pronto pra quando você quiser adicionar.

**COMO EXECUTAR TESTES:**
```bash
npm test
```
O Angular abre o navegador e mostra os resultados dos testes.

---

### 8️⃣ **index.html** (frontend/src/index.html)

**O QUE É:**
O arquivo HTML BASE da aplicação. É o primeiro arquivo que o navegador carrega quando você acessa a aplicação.

**ESTRUTURA:**
```html
<!doctype html>
<html lang="en">
<head>
  <!-- Meta tags -->
  <meta charset="utf-8">
  <title>Frontend</title>
  <base href="/">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="icon" type="image/x-icon" href="favicon.ico">
</head>
<body>
  <!-- Onde o Angular renderiza tudo -->
  <app-root></app-root>
</body>
</html>
```

**DETALHAMENTO:**

**<!doctype html>**
• Declara que é HTML5
• Obrigatório em todo HTML

**<html lang="en">**
• Tag raiz do HTML
• lang="en" = idioma inglês (poderia ser "pt-BR")

**<head>**
• Contém metadados (não aparece na tela)

**<meta charset="utf-8">**
• Define a codificação de caracteres
• utf-8 = suporta acentos, emojis, etc
• Sem isso, caracteres especiais aparecem errado

**<title>Frontend</title>**
• Título que aparece na aba do navegador
• Você pode mudar pra "Gestor Financeiro"

**<base href="/">**
• Define a URL base pra todos os links relativos
• Importante pro Angular Router funcionar

**<meta name="viewport" content="width=device-width, initial-scale=1">**
• Configuração pra dispositivos móveis
• width=device-width = usa largura da tela
• initial-scale=1 = zoom inicial 100%
• Sem isso, sites ficam pequenos no celular

**<link rel="icon" type="image/x-icon" href="favicon.ico">**
• Define o favicon (ícone da aba)
• favicon.ico fica na pasta public/

**<body>**
• Corpo do HTML (o que aparece na tela)

**<app-root></app-root>**
• É AQUI que o Angular renderiza tudo!
• Quando o Angular carrega, ele:
  1. Lê o main.ts
  2. Inicializa a aplicação
  3. Procura a tag <app-root>
  4. Renderiza o componente App dentro dela
  5. O App renderiza os outros componentes (dashboard, form, list)

**FLUXO COMPLETO:**
```
1. Navegador carrega index.html
2. Encontra <app-root>
3. Angular lê main.ts
4. main.ts chama bootstrapApplication(App)
5. Angular renderiza App dentro de <app-root>
6. App renderiza seus componentes filhos
7. Aplicação funcionando!
```

**POR QUÊ É IMPORTANTE:**
Sem esse arquivo, o navegador não sabe onde renderizar a aplicação Angular. É a "base" de tudo!

---

## 📚 OUTROS ARQUIVOS IMPORTANTES (Referência Rápida)

### Backend

**config/database.js** - Conecta com MongoDB real (produção)
**config/database-memory.js** - MongoDB fake em memória (desenvolvimento)
**server.js** - Servidor principal pra produção
**server-memory.js** - Servidor pra desenvolvimento (MongoDB em memória)

### Frontend

**app.routes.ts** - Definição de rotas (por enquanto vazio, single-page)
**models/transacao.model.ts** - Interfaces TypeScript (Transacao e Saldo)
**services/transacao.service.ts** - Serviço que conversa com a API do backend
**components/dashboard/** - Componente que mostra o saldo
**components/transacao-form/** - Formulário de criação/edição
**components/transacao-list/** - Lista de transações com filtros

---