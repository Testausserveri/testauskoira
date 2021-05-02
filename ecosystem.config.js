module.exports = {
    apps : [{
      name: 'testauskoira',
      script: 'src/index.js',
      env: {
        "NODE_ENV": "PRODUCTION",
      },
      env_hook: {
        command: 'pm2 pull testauskoira'
      }
    }]
  };