module.exports = {
    configureWebpack: {
    // We provide the app's title in Webpack's name field, so that
    // it can be accessed in index.html to inject the correct title.
    // name: appConfig.title,
    // Set up all the aliases we use in our app.
    resolve: {
      alias: require('./aliases.config').webpack,
    },
    performance: {
      // Only enable performance hints for production builds,
      // outside of tests.
      hints:
        process.env.NODE_ENV === 'production' &&
        !process.env.VUE_APP_TEST &&
        'warning',
    },
  },
  transpileDependencies: ["@vueform"],
  devServer: {
    port: 4000,
    host: '0.0.0.0'
  }
}