import hpp from 'hpp'
import Fastify from 'fastify'
import FormBody from '@fastify/formbody'

export default () => {
  /**
   * Instanciate an Fastify application instance
   */
  const
  config = {
    /**
     * Application settings
     */
    trustProxy: true,
    /**
     * Development logs
     * 
     * TODO:
     *  - Provide to developer to set their favorate customization of logger
     *  - Apply logger customization configurations
     *  - Set default logger and recommandations as well
     * 
     */
    logger: { level: 'trace' },
    caseSensitive: true
  },
  App = Fastify( config )

  // Application/form-multipart content type parser
  // .register( FormMultipart )
  // Register application/x-www-form-urlencoded content type parser
  .register( FormBody )

  return App
}