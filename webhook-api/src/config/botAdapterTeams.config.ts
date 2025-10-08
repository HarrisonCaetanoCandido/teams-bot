import { BotFrameworkAdapter } from 'botbuilder';

let appId;
let appPassword;
const IS_LOCAL = process.env.IS_LOCAL || '2';
if (IS_LOCAL == '2') {
    console.log("Running in local mode");
    appId = '';
    appPassword = '';
}

if (IS_LOCAL == '1') {
    console.log("Running in homologation mode");
    appId = process.env.MicrosoftAppId;
    appPassword = process.env.MicrosoftAppPassword;
}

if (IS_LOCAL == '0') {
    console.log("Running in production mode");
    appId = process.env.MicrosoftAppIdProd;
    appPassword = process.env.MicrosoftAppPasswordProd;
}

export const adapter = new BotFrameworkAdapter({
    appId: appId,
    appPassword: appPassword
});

adapter.onTurnError = async (context, error) => {

    console.error(`\n [onTurnError] Erro não tratado: ${error}`);
    console.error(error);

    await context.sendActivity(`Ocorreu um erro inesperado. Tente novamente mais tarde.`);
};