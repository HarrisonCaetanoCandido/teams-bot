import { BotFrameworkAdapter } from 'botbuilder';

export const adapter = new BotFrameworkAdapter({
    appId: process.env.MicrosoftAppId,
    appPassword: process.env.MicrosoftAppPassword // O Client Secret do Azure
});

// CONFIG DE TRATAMENTO DE ERROS GLOBAIS
adapter.onTurnError = async (context, error) => {

    console.error(`\n [onTurnError] Erro não tratado: ${error}`);
    console.error(error); // Stack trace completa

    await context.sendActivity('Ocorreu um erro inesperado. Já fui notificado! Tente novamente mais tarde.');
};