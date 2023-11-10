import type { Kenx } from '#types/service'
import type { FastifyInstance } from 'fastify'

export default class FastifyAPICompliancePlugin {
  
  private addProfile( core: FastifyInstance, config: any ){
    const { appname, version, status, documentation } = config.profile

    core
    // .get('/home', async ( req, rep ) => {
    //   const name = appname || process.env.APPNAME
    //   return `Welcome ${name ? `to ${name}` : ''}. ${documentation ? `Check the documentation at ${documentation}` : ''}`
    // })
    // Version
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

  constructor( Setup: Kenx.SetupManager, app: Kenx.ApplicationPlugin<FastifyInstance>, config: any ){
    /**
     * Publish public API profile endpoints
     */
    config.profile && this.addProfile( app.core, config )

    /**
     * Setup API rate-limit manager
     */
    config.ratelimit && this.addRateLimit( app.core, config )
  }
}