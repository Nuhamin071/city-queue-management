module.exports = {
    extends: [
      "react-app",
      "react-app/jest",
    ],
    env: {
      browser: true,
      serviceworker: true, // Add serviceworker environment
      es6: true,
    },
    globals: {
        firebase: 'readonly',
    },
    overrides: [
      {
        files: ["firebase-messaging-sw.js"], // Specify the service worker file
        rules: {
          "no-restricted-globals": ["error", "event", "XMLHttpRequest"], // Allow self usage by excluding 'self'
        },
      },
    ],
  };
  