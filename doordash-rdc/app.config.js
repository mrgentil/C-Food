// Merges app.json and allows EAS / CLI to override APP_VARIANT (e.g. eas build --profile driver).
const appJson = require('./app.json');

module.exports = () => ({
  expo: {
    ...appJson.expo,
    extra: {
      ...appJson.expo.extra,
      APP_VARIANT: process.env.APP_VARIANT || appJson.expo.extra?.APP_VARIANT || 'customer',
    },
  },
});
