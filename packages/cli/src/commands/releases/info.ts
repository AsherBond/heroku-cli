import color from '@heroku-cli/color'
import {Command, flags} from '@heroku-cli/command'
import {Args, ux} from '@oclif/core'
import {hux} from '@heroku/heroku-cli-util'
import * as Heroku from '@heroku-cli/schema'
import * as shellescape from 'shell-escape'
const {forEach} = require('lodash')

import {findByLatestOrId} from '../../lib/releases/releases'
import {description, color as getStatusColor} from '../../lib/releases/status_helper'

export default class Info extends Command {
    static topic = 'releases';
    static description = 'view detailed information for a release';
    static flags = {
      json: flags.boolean({description: 'output in json format'}),
      shell: flags.boolean({char: 's', description: 'output in shell format'}),
      remote: flags.remote(),
      app: flags.app({required: true}),
    };

    static args = {
      release: Args.string({description: 'ID of the release. If omitted, we use the last release ID.'}),
    };

    public async run(): Promise<void> {
      const {flags, args} = await this.parse(Info)
      const {json, shell, app} = flags
      const release = await findByLatestOrId(this.heroku, app, args.release)

      if (json) {
        hux.styledJSON(release)
      } else {
        let releaseChange = release.description
        const status = description(release)
        const statusColor = getStatusColor(release.status)
        const userEmail = release?.user?.email ?? ''
        const {body: config} = await this.heroku.get<Heroku.ConfigVars>(`/apps/${app}/releases/${release.version}/config-vars`)

        if (status) {
          releaseChange += ' (' + color[statusColor](status) + ')'
        }

        hux.styledHeader(`Release ${color.cyan('v' + release.version)}`)
        hux.styledObject({
          'Add-ons': release.addon_plan_names,
          Change: releaseChange,
          By: userEmail,
          'Eligible for Rollback?': release.eligible_for_rollback ? 'Yes' : 'No',
          When: release.created_at,
        })
        ux.log()
        hux.styledHeader(`${color.cyan('v' + release.version)} Config vars`)
        if (shell) {
          forEach(config, (v: string, k: string) => {
            ux.log(`${k}=${shellescape([v])}`)
          })
        } else {
          hux.styledObject(config)
        }
      }
    }
}
