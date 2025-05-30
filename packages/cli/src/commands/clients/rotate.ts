import color from '@heroku-cli/color'
import {Command, flags} from '@heroku-cli/command'
import * as Heroku from '@heroku-cli/schema'
import {Args, ux} from '@oclif/core'
import {hux} from '@heroku/heroku-cli-util'

export default class ClientsRotate extends Command {
  static description = 'rotate OAuth client secret'

  static flags = {
    json: flags.boolean({char: 'j', description: 'output in json format'}),
    shell: flags.boolean({char: 's', description: 'output in shell format'}),
  }

  static args = {
    id: Args.string({required: true, description: 'ID of the OAuth client'}),
  }

  async run() {
    const {args, flags} = await this.parse(ClientsRotate)

    ux.action.start(`Updating ${color.cyan(args.id)}`)

    const {body: client} = await this.heroku.post<Heroku.OAuthClient>(
      `/oauth/clients/${encodeURIComponent(args.id)}/actions/rotate-credentials`,
    )

    ux.action.stop()

    if (flags.json) {
      hux.styledJSON(client)
    } else if (flags.shell) {
      ux.log(`HEROKU_OAUTH_ID=${client.id}`)
      ux.log(`HEROKU_OAUTH_SECRET=${client.secret}`)
    } else {
      hux.styledHeader(`${client.name}`)
      hux.styledObject(client)
    }
  }
}
