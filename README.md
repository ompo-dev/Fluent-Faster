# FluentFaster ⚡

**FluentFaster** é uma aplicação web progressiva (PWA) moderna e interativa para aprendizado de inglês, focada em melhorar fluência através de práticas de leitura rápida e digitação. Com uma interface elegante e recursos avançados como reconhecimento de voz, o FluentFaster oferece duas experiências de aprendizado únicas.

---

## 🎯 Visão do Produto

### O que é o FluentFaster?

FluentFaster é uma ferramenta educacional que combina tecnologia de ponta com metodologias comprovadas de aprendizado de idiomas. A aplicação oferece dois modos principais de prática:

#### 🎤 **Speak Faster** - Teleprompter Inteligente
Pratique sua fluência oral com um teleprompter interativo que:
- Destaca palavras em tempo real enquanto você lê
- Reconhece sua fala usando Web Speech API
- Fornece feedback visual instantâneo (palavras ficam verdes quando pronunciadas corretamente)
- Ajusta a velocidade de leitura de acordo com sua preferência
- Calcula métricas de precisão e progresso
- Suporta seleção de múltiplos microfones

**Ideal para:** Melhorar pronúncia, velocidade de fala, e confiança ao falar inglês.

#### ⌨️ **Type to Learn** - Prática de Digitação
Aprimore suas habilidades de escrita digitando textos em inglês:
- Feedback visual em tempo real (caracteres corretos em verde, incorretos em vermelho)
- Cálculo de WPM (palavras por minuto)
- Métricas de precisão e erros
- Tela de resultados detalhada ao finalizar
- Interface responsiva e intuitiva

**Ideal para:** Aumentar velocidade de digitação, memorização de vocabulário, e familiaridade com estruturas de frases.

### 🌟 Recursos Principais

- **PWA (Progressive Web App)**: Instale no seu dispositivo e use offline
- **Tema Claro/Escuro**: Alternância suave entre temas com design moderno
- **Múltiplas Fontes de Texto**:
  - Textos aleatórios pré-selecionados
  - Texto personalizado (cole seu próprio conteúdo)
  - Upload de arquivos (.txt, .pdf)
- **Design Responsivo**: Funciona perfeitamente em desktop, tablet e mobile
- **Feedback em Tempo Real**: Visualização instantânea do progresso
- **Estatísticas Detalhadas**: Acompanhe sua evolução com métricas precisas

---

## 🛠️ Documentação Técnica

### Stack Tecnológico

#### **Frontend Framework**
- **Next.js 16.0.10** - Framework React com App Router
- **React 19.2.0** - Biblioteca UI com hooks modernos
- **TypeScript 5** - Tipagem estática para maior segurança

#### **Estilização**
- **Tailwind CSS 4.1.9** - Framework CSS utility-first
- **CSS Variables** - Sistema de design tokens customizado
- **Framer Motion (motion)** - Animações fluidas e micro-interações
- **tw-animate-css** - Animações CSS adicionais

#### **Componentes UI**
- **Radix UI** - Componentes acessíveis e sem estilo (40+ componentes)
- **Lucide React** - Ícones SVG modernos e otimizados
- **shadcn/ui** - Sistema de componentes baseado em Radix UI

#### **Gerenciamento de Estado**
- **React Context API** - Estado global da aplicação
- **React Hooks** - Gerenciamento de estado local e efeitos

#### **APIs do Navegador**
- **Web Speech API** - Reconhecimento de voz em tempo real
- **MediaDevices API** - Seleção e gerenciamento de microfones
- **Service Worker** - Funcionalidades PWA e cache offline

#### **Ferramentas de Desenvolvimento**
- **ESLint** - Linting de código
- **PostCSS** - Processamento de CSS
- **Vercel Analytics** - Análise de uso e performance

### 📁 Arquitetura do Projeto

O projeto segue uma arquitetura **Atomic Design** combinada com **Composition Patterns** para máxima reutilização e manutenibilidade:

```
Englesh-Learning/
├── app/                          # Next.js App Router
│   ├── layout.tsx               # Layout raiz com metadata e providers
│   ├── page.tsx                 # Página principal da aplicação
│   └── globals.css              # Estilos globais e design tokens
│
├── components/
│   ├── atomic/                  # Atomic Design Architecture
│   │   ├── atoms/              # Componentes básicos (7 componentes)
│   │   │   ├── CharacterDisplay.tsx
│   │   │   ├── Heading.tsx
│   │   │   ├── Icon.tsx
│   │   │   ├── ProgressBar.tsx
│   │   │   ├── SpeedButton.tsx
│   │   │   ├── StatValue.tsx
│   │   │   └── Text.tsx
│   │   │
│   │   ├── molecules/          # Combinações de atoms (8 componentes)
│   │   │   ├── ActionButtons.tsx
│   │   │   ├── MicrophoneSelector.tsx
│   │   │   ├── NavItem.tsx
│   │   │   ├── PageHeader.tsx
│   │   │   ├── ProgressIndicator.tsx
│   │   │   ├── SpeedControl.tsx
│   │   │   ├── StatCard.tsx
│   │   │   └── TextSourceCard.tsx
│   │   │
│   │   ├── organisms/          # Componentes complexos (7 componentes)
│   │   │   ├── ControlPanel.tsx
│   │   │   ├── ResultsScreen.tsx
│   │   │   ├── SidebarNav.tsx
│   │   │   ├── StatsFooter.tsx
│   │   │   ├── TeleprompterArea.tsx
│   │   │   ├── TextInputSelector.tsx
│   │   │   └── TypingArea.tsx
│   │   │
│   │   └── templates/          # Layouts de página (2 templates)
│   │       ├── EmptyStateLayout.tsx
│   │       └── PracticeLayout.tsx
│   │
│   ├── organisms/              # Componentes de nível superior
│   │   ├── error-boundary.tsx
│   │   └── pwa/
│   │       └── pwa-update-banner.tsx
│   │
│   ├── ui/                     # Componentes shadcn/ui (57 componentes)
│   ├── app-sidebar.tsx         # Sidebar principal da aplicação
│   ├── speak-faster.tsx        # Componente principal do modo Speak Faster
│   ├── type-to-learn.tsx       # Componente principal do modo Type to Learn
│   ├── text-input.tsx          # Input de texto compartilhado
│   └── theme-provider.tsx      # Provider de tema (next-themes)
│
├── lib/
│   ├── app-context.tsx         # Context API global
│   └── utils.ts                # Funções utilitárias
│
├── hooks/                      # Custom React Hooks
│
├── public/
│   ├── manifest.json           # PWA manifest
│   ├── sw.js                   # Service Worker
│   ├── icon.svg                # Ícone da aplicação
│   ├── icon-192.png            # Ícone PWA 192x192
│   ├── icon-512.png            # Ícone PWA 512x512
│   └── apple-icon.png          # Ícone para iOS
│
├── scripts/
│   └── sync-version.js         # Script de sincronização de versão
│
└── styles/                     # Estilos adicionais
```

### 🧩 Componentes Principais

#### **Speak Faster** (`speak-faster.tsx`)
Componente complexo de 646 linhas que implementa:
- **Speech Recognition**: Reconhecimento de voz contínuo com Web Speech API
- **Teleprompter**: Sistema de destaque de palavras com scroll automático
- **Timing Inteligente**: Cálculo dinâmico de duração baseado em sílabas e complexidade
- **Feedback Visual**: Animações de sucesso quando palavras são reconhecidas
- **Gerenciamento de Dispositivos**: Seleção e troca de microfones em tempo real
- **Estatísticas**: Precisão, palavras corretas, e progresso

**Algoritmos Notáveis:**
- `countSyllables()`: Estima contagem de sílabas para ajustar timing
- `getWordDuration()`: Calcula duração baseada em complexidade fonética
- `checkSpokenWord()`: Matching fuzzy de palavras reconhecidas vs esperadas

#### **Type to Learn** (`type-to-learn.tsx`)
Componente de 250 linhas focado em prática de digitação:
- **Tracking em Tempo Real**: Cada caractere digitado é comparado instantaneamente
- **Cálculo de WPM**: Palavras por minuto baseado em caracteres corretos
- **Métricas de Precisão**: Percentual de acerto, erros, tempo decorrido
- **Tela de Resultados**: Resumo detalhado ao completar o texto
- **Auto-focus**: Gerenciamento inteligente de foco no input

#### **App Context** (`lib/app-context.tsx`)
Gerenciamento de estado global:
- Modo atual (Speak Faster / Type to Learn)
- Fonte de texto (Random / Custom / Upload)
- Texto ativo e customizado
- Estado da sidebar (aberta/fechada)
- Sistema de reset

#### **Atomic Design Components**
- **Atoms**: Componentes puros e reutilizáveis (botões, textos, ícones)
- **Molecules**: Combinações funcionais (cards de estatísticas, controles)
- **Organisms**: Seções completas (painel de controle, área de digitação)
- **Templates**: Layouts de página (estado vazio, prática)

### 🎨 Sistema de Design

#### **Design Tokens** (CSS Variables)
```css
/* Tema Claro */
--background: #FFFFFF
--foreground: #1F1F1F
--accent: #3B82F6 (Azul vibrante)
--success: #2ECC71 (Verde feedback)
--destructive: #E74C3C (Vermelho erros)

/* Tema Escuro */
--background: #191919
--foreground: #EDEDED
--accent: #3B82F6
```

#### **Tipografia**
- **Sans-serif**: Inter (Google Fonts)
- **Monospace**: Geist Mono

#### **Animações**
- Transições suaves (300ms)
- Micro-interações com Framer Motion
- Animação `success-flash` para feedback visual

### 🔧 Funcionalidades Técnicas Avançadas

#### **PWA (Progressive Web App)**
- **Manifest**: Configuração completa para instalação
- **Service Worker**: Cache de assets e funcionamento offline
- **Ícones Adaptativos**: Suporte para múltiplas plataformas
- **Update Banner**: Notificação de novas versões

#### **Speech Recognition**
```typescript
// Configuração do reconhecimento
recognition.continuous = true      // Reconhecimento contínuo
recognition.interimResults = true  // Resultados intermediários
recognition.lang = "en-US"         // Idioma inglês
```

**Desafios Resolvidos:**
- Auto-restart após timeout de silêncio
- Matching fuzzy de palavras (tolerância a variações)
- Sincronização entre reconhecimento e UI
- Gerenciamento de lifecycle (cleanup adequado)

#### **Responsividade**
- **Mobile-first**: Design otimizado para mobile
- **Breakpoints**: Tailwind CSS breakpoints (sm, md, lg, xl)
- **Sidebar Adaptativa**: Overlay em mobile, fixa em desktop
- **Touch-friendly**: Botões e áreas de toque otimizadas

### 📊 Métricas e Analytics

#### **Speak Faster**
- Precisão (% de palavras corretas)
- Palavras corretas vs restantes
- Última palavra reconhecida
- Progresso visual (barra de progresso)

#### **Type to Learn**
- WPM (Words Per Minute)
- Precisão (% de caracteres corretos)
- Total de erros
- Tempo decorrido
- Caracteres corretos vs total

### 🚀 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev          # Inicia servidor de desenvolvimento (localhost:3000)

# Build
npm run build        # Build de produção (executa prebuild + next build)
npm run prebuild     # Sincroniza versão antes do build

# Produção
npm start            # Inicia servidor de produção

# Qualidade de Código
npm run lint         # Executa ESLint

# Utilitários
npm run version:sync # Sincroniza versão manualmente
```

### 🌐 Deployment

O projeto está otimizado para deploy na **Vercel**:
- Build automático via Next.js
- Edge Functions para performance
- Analytics integrado
- PWA totalmente funcional

### 🔐 Permissões Necessárias

- **Microfone**: Para funcionalidade de reconhecimento de voz (Speak Faster)
- **Armazenamento**: Para cache PWA e preferências do usuário

---

## 🎓 Metodologia de Aprendizado

### Por que FluentFaster funciona?

1. **Prática Ativa**: Você não apenas lê ou ouve, você PRATICA ativamente
2. **Feedback Imediato**: Correções em tempo real aceleram o aprendizado
3. **Repetição Espaçada**: Pratique os mesmos textos para fixação
4. **Gamificação**: Métricas e progresso motivam a continuar
5. **Multimodal**: Combina leitura, fala, escuta e escrita

### Dicas de Uso

#### Para Speak Faster:
- Comece com velocidade 1x e aumente gradualmente
- Foque na pronúncia correta antes da velocidade
- Use textos mais curtos no início
- Pratique 10-15 minutos por dia

#### Para Type to Learn:
- Priorize precisão sobre velocidade
- Mantenha postura e posição das mãos corretas
- Não olhe para o teclado
- Pratique textos variados para expandir vocabulário

---

## 🤝 Contribuindo

Este é um projeto educacional em constante evolução. Sugestões e melhorias são bem-vindas!

### Áreas para Contribuição:
- Novos textos de prática
- Melhorias na UI/UX
- Otimizações de performance
- Novos modos de prática
- Suporte a outros idiomas

---

## 📝 Licença

Este projeto é de código aberto e está disponível para fins educacionais.

---

## 🙏 Agradecimentos

Construído com tecnologias modernas e amor pelo aprendizado de idiomas.

**Versão:** 1.0.0  
**Última Atualização:** Fevereiro 2026

---

## 📞 Suporte

Para dúvidas, sugestões ou reportar bugs, abra uma issue no repositório do projeto.

**Aprenda inglês de forma rápida e divertida com FluentFaster! ⚡**