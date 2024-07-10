// import legacy from '@vitejs/plugin-legacy'
// import image from '@rollup/plugin-image'
// import typescript2 from 'rollup-plugin-typescript2'
import react from '@vitejs/plugin-react'

export default [
  /**
   * Provide support for legacy browsers the official
   * dependency is @vitejs/plugin-legacy
   */
  // legacy({
  //   targets: ['defaults', 'not IE 11']
  // }),

  /**
   * For compatibility with some Rollup plugins, it may be needed
   * to enforce the order of the plugin or only apply at build time.
   * This should be an implementation detail for Vite plugins.
   * You can enforce the position of a plugin with the enforce modifier:
   *
   * pre: invoke plugin before Vite core plugins
   * default: invoke plugin after Vite core plugins
   * post: invoke plugin after Vite build plugins
   */
  // {
  //   ...image(),
  //   enforce: 'pre'
  // },

  /**
   * In cases where a plugin needs to be conditionally applied
   * only during serve or build, use the apply property to only
   * invoke them during 'build' or 'serve'
   */
  // {
  //   ...typescript2(),
  //   apply: 'build'
  // },

  /**
   * React rendering plugin
   */
  react()
]