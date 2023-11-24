import type { Kenx } from '@ckenx/node'
import type { FastifyInstance } from 'fastify'

export default class FastifyAPICompliancePlugin {

  private addProfile( core: FastifyInstance, config: any ){
    const { appname, version, status, documentation } = config.profile

    core
    /*
     * .get('/home', async ( req, rep ) => {
     *   const name = appname || process.env.APPNAME
     *   return `Welcome ${name ? `to ${name}` : ''}. ${documentation ? `Check the documentation at ${documentation}` : ''}`
     * })
     * Version
     */
    .get('/version', async () => { return version } )
    // Health
    .get('/health', async ( req, rep ) => rep.status(200).send('') )
    // Status
    .get('/status', async () => { return status || 'Unknown' } )
    // Metrics by User-Agent
    .get('/metrics', async () => {
      const { maxRPS } = config.ratelimit

      return {
        latency: [
          { version, time: 0 }
        ],
        limit_per_agent: `${maxRPS || 'Unlimited'} (R/s)`
      }
    } )
    // Debug
    .get('/debug', async () => {
      return 'Debug Information'
    } )
  }
  private addRateLimit( core: FastifyInstance, config: any ){

  }

  private addWarner( core: FastifyInstance, config: any ){
    const warning = require('process-warning')()

    warning.create('FastifyDeprecation', 'FST_ERROR_CODE', 'message')
    warning.emit('FST_ERROR_CODE')
  }

  constructor( Setup: Kenx.SetupManager, app: Kenx.ApplicationPlugin<FastifyInstance>, config: any ){
    /**
     * Publish public API profile endpoints
     */
    config.profile && this.addProfile( app.core, config )

    /**
     * Setup API rate-limit manager
     */
    config.ratelimit && this.addRateLimit( app.core, config )

    /**
     * Warn the user about a deprecated API or a specific use case
     * using process-warning module.
     */
    config.warning && this.addWarner( app.core, config )

    /**
     * TODO: Setup maintenance stage handler
     *
     * When maintenance mode is enabled in production,
     * `MAINTAINER MODE MIDDLEWARE` get mounted at the
     * root of the application/server:
     *
     * - Keeps the site active
     * - Redirect users to `ONGOING MAINTENANCE PAGE`
     * - Activate development kits is available in the production code
     * - Maintainer go to `/maintenance` page where an iframe version
     *   of the site is mounted, allowing them to operate with the site
     *   like in production mode but with development tools.
     */
  }
}