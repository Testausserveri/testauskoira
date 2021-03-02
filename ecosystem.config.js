module.exports = {
    apps : [{
      name: 'testauskoira',
      script: 'main.js',
      env: {
        "NODE_ENV": "PRODUCTION",
      },
      env_hook: {
        command: 'pm2 pull testauskoira'
      }
    }]
  };