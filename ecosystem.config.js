module.exports = {
    apps : [{
      name: 'testaustonttu',
      script: 'main.js',
      env: {
        "NODE_ENV": "PRODUCTION",
      },
      env_hook: {
        command: 'pm2 pull testaustonttu'
      }
    }]
  };