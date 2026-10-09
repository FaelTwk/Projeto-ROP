# Militar-Police
🚔 SRO - Sistema de Registro de Ocorrências (MVP)
O SRO (Sistema de Registro de Ocorrências) é um MVP desenvolvido para a Polícia Militar, construído com base em React Native, visando a integração com um ecossistema Node.js e MySQL.

O projeto visa digitalizar e agilizar o registro de incidentes, substituindo métodos manuais por uma plataforma responsiva e intuitiva. O sistema oferece funcionalidades completas de CRUD (Criação, Leitura, Atualização e Exclusão) e validação de dados em tempo real para garantir precisão e eficiência operacional dos agentes em campo.

⚠️ Nota Importante sobre os Dados 
    Para fins de demonstração e funcionamento deste MVP, todos os dados (cadastro de usuários, login, senhas, registros de ROP, etc.) estão sendo salvos e gerenciados de forma mockada (simulada) localmente.

    Como o acesso à API real de produção é restrito, toda a persistência foi simulada para demonstrar o fluxo real de funcionamento, a lógica de negócio e o objetivo final da solução.

🛠️ Ferramentas de Desenvolvimento: Expo Go
Para o desenvolvimento e teste ágil deste aplicativo, utilizamos o Expo Go. O Expo Go é um aplicativo gratuito (Android/iOS) que funciona como um "visualizador" de projetos React Native, eliminando a necessidade de compilações nativas demoradas durante a fase de codificação.

Por que o Expo Go foi essencial?:

    1. Desenvolvimento Rápido: Permitiu ver as alterações do código em tempo real no celular (Fast Refresh).

    2. Testes em Dispositivos Reais: Possibilitou testar a usabilidade diretamente em celulares físicos, bastando escanear um QR Code.

    3. Foco no Frontend: Permitiu focar 100% na lógica JavaScript/React e na experiência do usuário, abstraindo a complexidade de configurar ambientes nativos como Android Studio ou Xcode.

📋 Pré-requisitos
Para executar este projeto localmente, você precisará ter instalado:
1. Node.js (Versão LTS - v20):
    - ⚠️ Atenção: Não utilize a versão v22 ou superior, pois ela possui incompatibilidade com o Expo SDK atual.
    - Recomendado: v20.18.0.
    - Download: nodejs.org
2. Git: Para clonar o repositório.
3. App Expo Go: Instalado no seu celular para testar o aplicativo.

🚀 Passo a Passo para Execução
Siga os passos abaixo na ordem exata para configurar o ambiente do zero.

1. Clonar o Repositório
Abra o terminal e rode:
    git clone <https://github.com/danylomelo2014/Militar-Police.git>
    cd Militar-Police

2. Instalar as Dependências
Instale as bibliotecas necessárias:
    npm install

3. Configurar a Chave da API (Segurança)
O projeto utiliza Inteligência Artificial para auxiliar no preenchimento de relatórios. Por segurança, a chave da API não é enviada para o GitHub.
    1. Na raiz do projeto (mesma pasta do package.json), crie um novo arquivo chamado: resumoIA.js
    2. Abra este arquivo e cole o seguinte código:
        // resumoIA.js
        export const API_RESUMO_KEY = "CHAVE_TOKEN";

    Nota: Substitua "CHAVE_TOKEN" pela chave real da OpenAI fornecida pelo mentor do projeto.

▶️ Rodando o Projeto
1. No terminal, dentro da pasta do projeto, inicie o servidor:
    npx expo start --tunnel -c 
(--tunnel é pra evitar quaisquer erros na hora de rodar o projeto)
(A flag -c limpa o cache para garantir que as configurações recentes sejam carregadas).

2. Um QR Code aparecerá no terminal.

Testando no Celular (Físico)
    1. Certifique-se de que seu celular e seu computador estão na mesma rede Wi-Fi.
    2. Abra o app Expo Go no seu celular.
    3. Toque em "Scan QR Code" e aponte para a tela do computador.

📱 Funcionalidades do App
O fluxo do aplicativo segue 3 etapas principais:

    1. Tela 1 (Dados do Fato):
        - Registro de hora, local (com lista de bairros dinâmica para Aracaju) e classificação da ocorrência.
        - Validação de data (impede datas futuras).

    2. Tela 2 (Detalhamento):
        - Inserção de envolvidos, policiais, armas, veículos e outros itens via Modais.
        - Validação de campos obrigatórios para evitar registros em branco.
        - Lista visual dos itens adicionados com opção de exclusão.

    3. Tela 3 (Revisão e Finalização):
        - Resumo completo de todos os dados inseridos.
        - Integração com IA: Botão para gerar um relato formal e impessoal baseado nos dados estruturados.
        - Campo de histórico editável para ajustes finais.
        - Envio final do ROP.

🛠️ Solução de Problemas
1. Erro ReferenceError: Property 'ReadableStream' doesn't exist:
    - Você está usando Node.js v22+. Desinstale e instale o Node v20 LTS.

2. App fecha sozinho (Crash) ao abrir:
    - Certifique-se de que rodou npm install após baixar o projeto para garantir que bibliotecas nativas (safe-area-context) estejam instaladas corretamente.